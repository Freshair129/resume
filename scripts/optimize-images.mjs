import { readFile, readdir, rename, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Windows: sharp's file cache keeps handles open, so rename/unlink fail with EBUSY.
// Disable the cache and always hand sharp a Buffer instead of a path.
sharp.cache(false);

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetRoot = path.join(projectRoot, 'src', 'assets');
const marketingRoot = path.join(projectRoot, 'public', 'marketing');
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg']);

async function listImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listImages(fullPath));
    } else if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function isValidWebp(filePath, maxWidth) {
  try {
    const metadata = await sharp(await readFile(filePath)).metadata();
    if (metadata.format !== 'webp' || !Number.isFinite(metadata.width) || metadata.width > maxWidth) return false;
    await sharp(await readFile(filePath), { failOn: 'warning' }).raw().toBuffer();
    return true;
  } catch {
    return false;
  }
}

async function listInterruptedOutputs(outputPath) {
  const directory = path.dirname(outputPath);
  const prefix = `${path.basename(outputPath)}.`;
  const names = await readdir(directory);
  return names
    .filter((name) => name.startsWith(prefix) && name.endsWith('.tmp.webp'))
    .map((name) => path.join(directory, name));
}

async function removeInterruptedOutputs(outputPath) {
  for (const temporaryPath of await listInterruptedOutputs(outputPath)) {
    await unlink(temporaryPath).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

async function convertImage(sourcePath, maxWidth) {
  const outputPath = sourcePath.slice(0, -path.extname(sourcePath).length) + '.webp';

  try {
    await stat(outputPath);
    if (await isValidWebp(outputPath, maxWidth)) {
      await unlink(sourcePath);
      await removeInterruptedOutputs(outputPath);
      console.log(`Already converted: ${path.relative(projectRoot, outputPath)} (removed source)`);
      return;
    }
    throw new Error(`Refusing to overwrite an invalid or oversized output: ${path.relative(projectRoot, outputPath)}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  for (const interruptedPath of await listInterruptedOutputs(outputPath)) {
    if (await isValidWebp(interruptedPath, maxWidth)) {
      await rename(interruptedPath, outputPath);
      await unlink(sourcePath);
      await removeInterruptedOutputs(outputPath);
      console.log(`Recovered: ${path.relative(projectRoot, outputPath)} (removed source)`);
      return;
    }
    await unlink(interruptedPath).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }

  const temporaryPath = `${outputPath}.${process.pid}.tmp.webp`;
  try {
    await sharp(await readFile(sourcePath))
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(temporaryPath);

    if (!(await isValidWebp(temporaryPath, maxWidth))) {
      throw new Error(`WebP validation failed for ${path.relative(projectRoot, temporaryPath)}`);
    }

    await rename(temporaryPath, outputPath);
    await unlink(sourcePath);
    console.log(`Converted: ${path.relative(projectRoot, sourcePath)} -> ${path.relative(projectRoot, outputPath)}`);
  } finally {
    await unlink(temporaryPath).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

const sourceImages = [
  ...await listImages(assetRoot),
  ...(await readdir(marketingRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.png')
    .map((entry) => path.join(marketingRoot, entry.name)),
];

for (const sourcePath of sourceImages) {
  const relativePath = path.relative(assetRoot, sourcePath);
  const maxWidth = relativePath.split(path.sep)[0] === 'gallery' ? 1200 : 1600;
  await convertImage(sourcePath, maxWidth);
}
