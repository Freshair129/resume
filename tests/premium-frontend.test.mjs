import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Explicitly synthetic data. This fixture is never imported by the production application.
const fixtureProjects = [
  { slug: 'fixture-knowledge', name: 'Knowledge Fixture', repository: 'test/knowledge-fixture', url: 'https://example.com/knowledge', category: 'data', featured: true, language: 'Rust', technologies: ['Rust', 'Graph', 'Vector'], topics: ['knowledge', 'retrieval'], headSha: 'a'.repeat(40), verifiedAt: '2026-10-29', summary: 'Synthetic browser fixture: a graph and vector repository study.', challenge: 'Synthetic challenge for testing the narrative.', approach: 'A synthetic source-based approach.', architecture: 'Synthetic graph and vector component description.', implementation: 'Synthetic implementation scope.', outcome: 'No real project outcome is represented by this test fixture.', lessons: 'Editorial test notes; not personal experience.', role: { status: 'unverified', text: 'Synthetic fixture. Personal contributions are not yet reviewed.' }, verification: { notes: ['Synthetic inspection note.'] }, evidence: [{ label: 'Fixture README', url: 'https://example.com/knowledge/readme', kind: 'readme' }, { label: 'Unsafe fixture link', url: 'javascript:alert(1)', kind: 'invalid' }] },
  { slug: 'fixture-agent', name: 'Agent Fixture', repository: 'test/agent-fixture', url: 'https://example.com/agent', category: 'agents', featured: true, fork: true, language: 'TypeScript', technologies: ['TypeScript', 'React'], summary: 'Synthetic browser fixture for an agent workflow.', headSha: 'b'.repeat(40), role: { status: 'unverified', text: 'Synthetic fixture; upstream ownership is separate from personal contribution.' }, evidence: [] },
  { slug: 'fixture-creative', name: 'Creative Fixture', repository: 'test/creative-fixture', url: 'https://example.com/creative', category: 'creative', archived: true, technologies: ['SVG'], summary: 'Synthetic browser fixture for an archived creative experiment.', headSha: 'c'.repeat(40), evidence: [] },
];

test('quiet portfolio: source-driven archive, reversible scene, motion fallback, keyboard and responsive layout', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 180000 }, async () => {
  const { preview } = await import('vite');
  const { chromium } = await import('playwright');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const server = await preview({ root, preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const output = fileURLToPath(new URL('../docs/evidence/quiet-fixture/', import.meta.url));
  const report = { evidenceKind: 'synthetic-browser-fixture', capturedAt: new Date().toISOString(), checks: [], viewports: [], runtimeErrors: [] };
  let browser;
  try {
    const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
    browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const requestedScripts = [];
    page.on('request', request => { if (request.resourceType() === 'script') requestedScripts.push(request.url()); });
    page.on('pageerror', error => report.runtimeErrors.push(error.message));
    const base = `http://127.0.0.1:${server.httpServer.address().port}`;
    let outage = false;
    let empty = false;
    await page.route('**/api/**', async route => {
      const pathname = new URL(route.request().url()).pathname;
      if (outage) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
      if (pathname === '/api/portfolio') return route.fulfill({ json: { status: 'available', verifiedAt: '2026-10-29', githubUrl: 'https://github.com/example-fixture', coverage: { publicCount: 3, publicAuditedCount: 3, complete: true, publishedCount: empty ? 0 : 3 }, categories: [{ id: 'data', label: 'Data systems' }, { id: 'agents', label: 'Agent systems' }, { id: 'creative', label: 'Creative technology' }], featuredSlugs: empty ? [] : ['fixture-knowledge', 'fixture-agent'], projects: empty ? [] : fixtureProjects } });
      if (pathname === '/api/profile') return route.fulfill({ json: { profile: null, experiences: [], skills: [], projects: [] } });
      if (pathname === '/api/chat') return route.fulfill({ json: { answer: 'Synthetic test response only.', citations: [] } });
      return route.fulfill({ json: [] });
    });
    await page.addInitScript(() => {
      window.__portfolioPerf = { lcp: 0, cls: 0 };
      try { new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__portfolioPerf.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch { /* Optional browser entry. */ }
      try { new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__portfolioPerf.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true }); } catch { /* Optional browser entry. */ }
    });
    await mkdir(output, { recursive: true });
    await page.goto(`${base}/?lang=en`);
    await page.getByRole('heading', { name: 'Knowledge Fixture' }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(requestedScripts.some(url => /\/PortfolioPages-[^/]+\.js/.test(url)), false, 'Canonical non-homepage views stay out of the initial route request.');
    assert.equal(await page.locator('main h1').count(), 1);
    assert.equal(await page.locator('.ql-project').count(), 2);
    assert.equal(await page.locator('a[href="javascript:alert(1)"]').count(), 0);
    assert.equal(await page.locator('.ql-film').getAttribute('data-motion'), 'off');
    assert.equal(await page.locator('.ql-film-sticky').evaluate(element => getComputedStyle(element).position), 'relative');
    assert.equal(await page.locator('.ql-sculpture canvas').count(), 0, 'Reduced motion never initializes WebGL.');
    assert.equal(requestedScripts.some(url => /sculptureScene/.test(url)), false, 'Reduced motion does not download the scene runtime.');
    assert.equal(await page.locator('.ql-film-poster img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.match(await page.locator('.pk-language').getAttribute('aria-label'), /^TH\b/);
    assert.equal(await page.locator('.ql-shot.is-active h1').innerText(), 'Ideas, made tangible.');
    await page.screenshot({ path: `${output}/home-desktop.png` });
    report.viewports.push({ width: 1440, height: 1000, page: '/', overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), lab: await page.evaluate(() => window.__portfolioPerf) });
    report.checks.push('Compact homepage with two approved fixture features', 'Reduced-motion static poster and no WebGL download');

    await page.goto(`${base}/portfolio?lang=en`);
    await page.getByRole('heading', { name: 'Knowledge Fixture', exact: true }).waitFor();
    assert.equal(await page.locator('.im-repo-row').count(), 3);
    await page.getByRole('button', { name: 'Data systems 1', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('.im-repo-row').length === 1);
    assert.equal(await page.locator('.im-repo-row').count(), 1);
    await page.getByRole('button', { name: /Reset filters/ }).click();
    await page.getByRole('searchbox', { name: 'Search repositories' }).fill('TypeScript');
    await page.waitForFunction(() => document.querySelector('.im-repo-main h2')?.textContent === 'Agent Fixture');
    assert.equal(await page.locator('.im-repo-row').count(), 1);
    assert.equal(await page.locator('.im-repo-main h2').innerText(), 'Agent Fixture');
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('archived');
    await page.waitForFunction(() => document.querySelector('.im-repo-main h2')?.textContent === 'Creative Fixture', null, { timeout: 5000 }).catch(async error => {
      const state = await page.evaluate(() => ({ url: location.href, query: document.querySelector('input[type=search]').value, kind: document.querySelector('.im-kind-filter select').value, rows: [...document.querySelectorAll('.im-repo-main h2')].map(element => element.textContent) }));
      throw new Error(`Archive interaction failed: ${JSON.stringify(state)}`, { cause: error });
    });
    assert.equal(await page.locator('.im-repo-row').count(), 1);
    assert.equal(await page.locator('.im-repo-main h2').innerText(), 'Creative Fixture');
    await page.getByRole('button', { name: /Reset filters/ }).click();
    await page.waitForFunction(() => document.querySelectorAll('.im-repo-row').length === 3);
    await page.screenshot({ path: `${output}/archive-desktop.png`, fullPage: true });
    await page.getByRole('link', { name: 'Knowledge Fixture', exact: true }).click();
    await page.getByRole('heading', { name: 'Knowledge Fixture', exact: true, level: 1 }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/work/fixture-knowledge');
    for (const title of ['The challenge', 'Constraints', 'The approach', 'Architecture', 'Implementation', 'The evidence', 'Outcome', 'Lessons & next questions']) assert.equal(await page.getByRole('heading', { name: title, exact: true }).count(), 1);
    await page.getByText('Synthetic fixture. Personal contributions are not yet reviewed.', { exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: /Fixture README/ }).getAttribute('href'), 'https://example.com/knowledge/readme');
    assert.equal(await page.getByRole('link', { name: /Unsafe fixture link/ }).count(), 0);
    await page.screenshot({ path: `${output}/study-desktop.png`, fullPage: true });
    await page.goto(`${base}/work/not-published?lang=en`);
    await page.getByRole('heading', { name: 'This study is not published.', exact: true }).waitFor();
    report.checks.push('Archive category, text and status filters', 'Project route and all eight narrative sections', 'Role boundary and safe evidence links', 'Unpublished deep-link state');

    for (const [width, height, label] of [[768, 1024, 'tablet'], [390, 844, 'mobile'], [320, 740, 'mobile-320']]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${base}/?lang=en`);
      await page.getByRole('heading', { name: 'Knowledge Fixture' }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${label} homepage overflow`);
      await page.screenshot({ path: `${output}/home-${label}.png` });
      const bodySize = await page.locator('.ql-shot.is-active p').evaluate(element => parseFloat(getComputedStyle(element).fontSize));
      assert.ok(bodySize >= 13, `${label} body text should be readable`);
      report.viewports.push({ width, height, page: '/', overflow: false, bodySize, lab: await page.evaluate(() => window.__portfolioPerf) });
      await page.goto(`${base}/portfolio?lang=en`);
      await page.getByRole('heading', { name: 'Knowledge Fixture', exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${label} archive overflow`);
      await page.screenshot({ path: `${output}/archive-${label}.png`, fullPage: true });
      await page.goto(`${base}/work/fixture-knowledge?lang=en`);
      await page.getByRole('heading', { name: 'Knowledge Fixture', exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${label} case-study overflow`);
      if (width === 390) await page.screenshot({ path: `${output}/study-${label}.png`, fullPage: true });
    }
    await page.goto(`${base}/?lang=en`);
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'About', exact: true }).focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false');
    assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), true);
    const lineLink = page.getByRole('link', { name: 'Chat with Zuri on LINE', exact: true });
    await lineLink.waitFor();
    const box = await lineLink.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 320);
    assert.equal(await lineLink.getAttribute('href'), 'https://line.me/R/ti/p/%40949xcfau');
    assert.equal(await page.locator('button.eva-launcher').count(), 0);
    await page.screenshot({ path: `${output}/zuri-line-mobile-320.png` });
    await page.goto(`${base}/?lang=th`);
    await page.getByRole('heading', { name: 'Knowledge Fixture' }).waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'th');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Thai mobile overflow');
    await page.screenshot({ path: `${output}/home-thai-mobile-320.png` });
    report.checks.push('Desktop, tablet, 390px and 320px layouts', 'Mobile menu Escape and focus restoration', '320px Zuri LINE link', 'Thai mobile layout');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`${base}/?lang=en`);
    await page.getByRole('heading', { name: 'Knowledge Fixture' }).waitFor();
    assert.equal(await page.locator('.ql-sculpture canvas').count(), 0, 'Initial composition is a lightweight poster.');
    await page.getByRole('button', { name: '02 — Connection', exact: true }).click();
    await page.waitForFunction(() => ['ready', 'fallback'].includes(document.querySelector('.ql-film-art').dataset.state));
    report.sceneState = await page.locator('.ql-film-art').getAttribute('data-state');
    if (report.sceneState === 'ready') {
      await page.waitForFunction(() => Math.abs(Number(document.querySelector('.ql-sculpture').dataset.progress) - .5) < .002);
      await page.getByRole('button', { name: '03 — Perspective', exact: true }).click();
      await page.waitForFunction(() => Number(document.querySelector('.ql-sculpture').dataset.progress) > .998);
      await page.screenshot({ path: `${output}/scene-end.png` });
      await page.getByRole('button', { name: '01 — Form', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('.ql-sculpture').dataset.progress === '0.0000');
      const before = await page.locator('.ql-sculpture').getAttribute('data-frames');
      await page.waitForTimeout(350);
      assert.equal(await page.locator('.ql-sculpture').getAttribute('data-frames'), before, 'Renderer stops when the scroll settles.');
      report.checks.push('Actual WebGL camera progresses, reverses and stops rendering at idle');
    }
    await page.getByRole('button', { name: 'Disable motion', exact: true }).click();
    assert.equal(await page.locator('.ql-film').getAttribute('data-motion'), 'off');
    assert.equal(await page.locator('.ql-sculpture canvas').count(), 0);
    assert.equal(await page.locator('.ql-film-poster img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    report.checks.push('Explicit motion toggle disposes canvas and preserves the static composition');
    await page.getByRole('button', { name: 'Enable motion', exact: true }).click();
    assert.equal(await page.locator('.ql-film-art').getAttribute('data-state'), 'poster', 'Re-enabling motion shows the poster until the next interaction loads a new renderer.');
    await page.getByRole('button', { name: '02 — Connection', exact: true }).click();
    await page.waitForFunction(() => ['ready', 'fallback'].includes(document.querySelector('.ql-film-art').dataset.state));
    if (report.sceneState === 'ready') assert.equal(await page.locator('.ql-film-art').getAttribute('data-state'), 'ready');
    report.checks.push('Re-enabling motion retains the poster and recreates the renderer on interaction');

    outage = true;
    await page.goto(`${base}/portfolio?lang=en`);
    await page.getByRole('heading', { name: 'The work will be back shortly.', exact: true }).waitFor();
    assert.equal(await page.locator('.im-repo-row').count(), 0);
    outage = false; empty = true;
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await page.getByRole('heading', { name: 'Awaiting approved content', exact: true }).waitFor();
    assert.equal(await page.locator('.im-repo-row').count(), 0);
    report.checks.push('Outage retry and empty catalog without fabricated fallback');
    assert.deepEqual(report.runtimeErrors, []);
    report.pass = true;
    await writeFile(`${output}/browser-evidence.json`, JSON.stringify(report, null, 2));
  } finally {
    await browser?.close();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
});

test('quiet scene: unsupported WebGL retains poster and project navigation', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 60000 }, async () => {
  const { preview } = await import('vite');
  const { chromium } = await import('playwright');
  const server = await preview({ root: fileURLToPath(new URL('../', import.meta.url)), preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /^webgl/.test(type) ? null : getContext.call(this, type, ...args); };
    });
    await page.route('**/api/**', route => route.fulfill({ json: { projects: fixtureProjects, featuredSlugs: ['fixture-knowledge'], categories: [] } }));
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/?lang=en`);
    await page.getByRole('heading', { name: 'Knowledge Fixture', exact: true }).waitFor();
    await page.getByRole('button', { name: '02 — Connection', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.ql-film-art').dataset.state === 'fallback');
    assert.equal(await page.locator('.ql-sculpture canvas').count(), 0);
    assert.equal(await page.locator('.ql-film-poster img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.equal(await page.locator('.ql-project').count(), 1);
    await page.getByRole('link', { name: 'Knowledge Fixture', exact: true }).click();
    await page.getByRole('heading', { name: 'Knowledge Fixture', exact: true, level: 1 }).waitFor();
  } finally { await browser.close(); await new Promise(resolve => server.httpServer.close(resolve)); }
});
