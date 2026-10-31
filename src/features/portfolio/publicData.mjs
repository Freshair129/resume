// Presentation configuration only. Biographical facts always come from the API.
export const resumeTracks = [
  { id: 'ai-automation', label: 'AI Automation' },
  { id: 'martech', label: 'MarTech' },
  { id: 'product-operations', label: 'Product / Operations' },
  { id: 'creative', label: 'Creative' },
  { id: 'default', label: 'Original', legacy: true },
  { id: 'content-coordinator', label: 'Content Coordinator', legacy: true },
  { id: 'performance-marketer', label: 'Performance Marketer', legacy: true },
  { id: 'synnex-pm', label: 'Synnex PM', legacy: true },
];

export function resolveTrack(value) {
  return resumeTracks.some(track => track.id === value) ? value : 'ai-automation';
}

export function localized(value, language = 'th') {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return value[language] || value.en || value.th || '';
}

export function resumePdfUrl(track, language) {
  return `/api/resume/${resolveTrack(track)}/${language === 'en' ? 'en' : 'th'}.pdf`;
}

// Never make javascript:, protocol-relative, data:, or arbitrary URI schemes clickable.
export function safePublicUrl(value) {
  if (typeof value !== 'string' || /[\u0000-\u0020\u007f]/.test(value)) return null;
  if (/^\/(?![\/\\])/.test(value) && !value.includes('\\')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function contactLinks(contacts = {}) {
  const email = typeof contacts.email === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contacts.email)
    ? `mailto:${encodeURIComponent(contacts.email).replace('%40', '@')}` : null;
  const line = safePublicUrl(contacts.line);
  return { email, line: line?.startsWith('https://') ? line : null };
}

export function filterProjects(projects, { query = '', category = '', status = '', language = 'th' } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  return projects.filter(project =>
    (!category || project.category === category) &&
    (!status || project.status === status) &&
    (!needle || `${localized(project.title, language)} ${localized(project.summary, language)}`.toLocaleLowerCase().includes(needle))
  );
}

export async function fetchPublicData(path, { signal, fetcher = fetch } = {}) {
  const response = await fetcher(path, { signal, cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const error = new Error(response.status === 404 ? 'not-found' : 'unavailable');
    error.status = response.status;
    throw error;
  }
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('unavailable');
  return response.json();
}
