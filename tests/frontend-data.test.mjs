import test from 'node:test';
import assert from 'node:assert/strict';
import { contactLinks, fetchPublicData, featuredPortfolioProjects, filterPortfolioProjects, filterProjects, localized, portfolioCategories, portfolioProjects, publicEvidence, resolveTrack, resumePdfUrl, resumeTracks, safePublicUrl } from '../src/features/portfolio/publicData.mjs';

test('public links reject executable schemes, credentials and disguised network paths', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', '//evil.example', '/\\evil.example', 'https://user:password@example.com', 'https:\n//example.com', 'http://example.com']) assert.equal(safePublicUrl(value), null, value);
  assert.equal(safePublicUrl('/projects/approved'), '/projects/approved');
  assert.equal(safePublicUrl('https://github.com/owner/repo'), 'https://github.com/owner/repo');
  assert.deepEqual(contactLinks({ email: 'name@example.com', line: 'javascript:alert(1)' }), { email: 'mailto:name@example.com', line: null });
  assert.equal(contactLinks({ email: 'name@example.com\nBcc:other@example.com' }).email, null);
});

test('every retained resume track resolves to the canonical PDF API', () => {
  assert.equal(resolveTrack('../../private'), 'ai-automation');
  for (const { id } of resumeTracks) for (const language of ['th', 'en']) assert.equal(resumePdfUrl(id, language), `/api/resume/${id}/${language}.pdf`);
  assert.equal(resumePdfUrl('unknown', 'unknown'), '/api/resume/ai-automation/th.pdf');
  assert.ok(resumeTracks.find(track => track.id === 'content-coordinator' && track.legacy));
});

test('project filters use localized canonical text and precise status', () => {
  const projects = [
    { title: { en: 'Workflow', th: 'ระบบงาน' }, summary: { en: 'Reviewed automation', th: 'งานอัตโนมัติ' }, category: 'automation', status: 'prototype' },
    { title: { en: 'Data' }, category: 'data', status: 'tested' },
  ];
  assert.deepEqual(filterProjects(projects, { query: 'ระบบ', language: 'th', status: 'prototype' }), [projects[0]]);
  assert.deepEqual(filterProjects(projects, { status: 'deployed' }), []);
  assert.equal(localized(null), '');
  assert.equal(localized({ en: 'Evidence' }, 'th'), 'Evidence');
});

test('failed or HTML-fallback API responses cannot become public content', async () => {
  await assert.rejects(fetchPublicData('/api/projects', { fetcher: async () => new Response('<html>SPA fallback</html>', { headers: { 'content-type': 'text/html' } }) }), /unavailable/);
  await assert.rejects(fetchPublicData('/api/projects/private', { fetcher: async () => new Response('{}', { status: 404 }) }), error => error.status === 404);
  const result = await fetchPublicData('/api/projects', { fetcher: async (path, options) => {
    assert.equal(path, '/api/projects'); assert.equal(options.cache, 'no-store');
    return new Response('[]', { headers: { 'content-type': 'application/json' } });
  } });
  assert.deepEqual(result, []);
});

test('portfolio presentation uses only supplied records and preserves curated ordering', () => {
  const source = { slug: 'source-fixture', name: 'Source fixture', category: 'data', featured: true, technologies: ['Rust'], description: 'Synthetic UI data only' };
  const fork = { slug: 'fork-fixture', name: 'Fork fixture', category: 'agents', fork: true, language: 'TypeScript', summary: 'Synthetic orchestration test' };
  const archived = { slug: 'archive-fixture', name: 'Archive fixture', category: 'data', archived: true };
  const data = { status: 'available', categories: [{ id: 'data', label: 'Data systems' }], projects: [source, fork, archived, { name: 'Invalid', slug: '../not-a-route' }], featuredSlugs: ['fork-fixture', 'source-fixture', 'not-published', 'fork-fixture'] };
  assert.deepEqual(portfolioProjects(null), []);
  assert.deepEqual(portfolioProjects({ projects: 'not an array' }), []);
  assert.deepEqual(portfolioProjects(data), [source, fork, archived]);
  assert.deepEqual(featuredPortfolioProjects(data), [fork, source]);
  assert.deepEqual(filterPortfolioProjects(portfolioProjects(data), { query: 'rust', category: 'data' }), [source]);
  assert.deepEqual(filterPortfolioProjects(portfolioProjects(data), { kind: 'fork' }), [fork]);
  assert.deepEqual(filterPortfolioProjects(portfolioProjects(data), { kind: 'archived' }), [archived]);
  assert.deepEqual(filterPortfolioProjects(portfolioProjects(data), { kind: 'original' }), [source]);
  assert.deepEqual(portfolioCategories(data).map(category => [category.id, category.label, category.count]), [['data', 'Data systems', 2], ['agents', 'agents', 1]]);
  assert.deepEqual(publicEvidence({ evidence: [{ label: 'Unsafe', url: 'javascript:alert(1)' }, { label: 'Source', url: 'https://example.com/source' }] }), [{ label: 'Source', url: 'https://example.com/source' }]);
});
