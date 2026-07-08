import { useEffect, useRef, useState } from 'react';

const SPOTLIGHT_R = 140;

// Cursor-driven canvas-mask reveal: hovering the wrapped area reveals `image`
// underneath the children through a soft circular spotlight that follows the
// (locally-scoped, smoothed) cursor position. Ported from the original
// full-viewport HeroReveal concept, adapted to a bounded frame.
export default function SpotlightReveal({ image, radius = SPOTLIGHT_R, className = '', children }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const revealRef = useRef(null);

  const [active, setActive] = useState(false);
  const pos = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) return; // skip the effect entirely — accessibility
    const wrap = wrapRef.current;
    if (!wrap) return;

    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = wrap.clientWidth;
      c.height = wrap.clientHeight;
    };
    resize();

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      pos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      pos.current = { x: -999, y: -999 };
    };

    const loop = () => {
      smooth.current.x += (pos.current.x - smooth.current.x) * 0.15;
      smooth.current.y += (pos.current.y - smooth.current.y) * 0.15;

      const c = canvasRef.current;
      const reveal = revealRef.current;
      if (c && reveal) {
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        const { x, y } = smooth.current;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.85)');
        g.addColorStop(0.75, 'rgba(255,255,255,0.35)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        const url = c.toDataURL();
        reveal.style.maskImage = `url(${url})`;
        reveal.style.webkitMaskImage = `url(${url})`;
        reveal.style.maskSize = '100% 100%';
        reveal.style.webkitMaskSize = '100% 100%';
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize);
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseenter', () => setActive(true));
    wrap.addEventListener('mouseleave', () => {
      onLeave();
      setActive(false);
    });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      wrap.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [radius]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {children}
      {!prefersReducedMotion.current && (
        <>
          <canvas className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} ref={canvasRef} />
          <div
            ref={revealRef}
            className="absolute inset-0 rounded-[3rem] bg-center bg-cover bg-no-repeat pointer-events-none z-20 transition-opacity duration-300"
            style={{ backgroundImage: `url(${image})`, opacity: active ? 1 : 0 }}
          />
        </>
      )}
    </div>
  );
}
