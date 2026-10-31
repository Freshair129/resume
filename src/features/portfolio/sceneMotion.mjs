export const clampProgress = value => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
const smooth = value => { const t = clampProgress(value); return t * t * (3 - 2 * t); };

// A deterministic camera path: the same scroll position always returns the same shot.
export function sculpturePose(value) {
  const p = clampProgress(value);
  const reveal = smooth(p / .58);
  const settle = smooth((p - .58) / .42);
  const angle = .65 + p * Math.PI * .84;
  return {
    x: Math.sin(angle) * (7.8 - settle * .6),
    y: 3.3 + Math.sin(p * Math.PI) * 2.5 - settle * 1.1,
    z: Math.cos(angle) * (7.8 - settle * .6),
    spread: .31 + reveal * .85 - settle * .7,
    rotation: -.24 + p * .58,
    core: .83 + reveal * .17,
  };
}

export function scrollProgress(scrollTop, sectionTop, sectionHeight, viewportHeight, headerHeight = 72) {
  const travel = sectionHeight - viewportHeight + headerHeight;
  return travel > 0 ? clampProgress((scrollTop - sectionTop + headerHeight) / travel) : 0;
}
