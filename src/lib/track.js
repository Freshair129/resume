import { track } from '@vercel/analytics';
import { isDoNotTrackEnabled } from './visitor';

export function trackEvent(name, props = {}) {
  if (isDoNotTrackEnabled()) return;

  try {
    Promise.resolve(track(name, props)).catch(() => {});
  } catch {
    // Tracking is optional and must never interrupt the visitor flow.
  }
}
