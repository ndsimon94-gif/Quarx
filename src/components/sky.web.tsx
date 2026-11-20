import { memo, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * The living night sky (web): three layers of twinkling stars with scroll + pointer parallax,
 * slow-drifting nebulae, occasional shooting stars, a faint light that follows the cursor,
 * and the ember glow of the fire on the horizon. Honors prefers-reduced-motion.
 */

type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  warm: boolean;
  layer: number;
};
type Shooter = { x: number; y: number; vx: number; vy: number; life: number; max: number };

const LAYERS = [
  { count: 260, size: [0.25, 0.7], depth: 0.015 },
  { count: 110, size: [0.5, 1.1], depth: 0.04 },
  { count: 28, size: [1.0, 1.9], depth: 0.09 },
];

function rand(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const Sky = memo(function Sky() {
  const ref = useRef<View>(null);

  useEffect(() => {
    const host = ref.current as unknown as HTMLDivElement | null;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const r = rand(1987);
    const stars: Star[] = [];
    LAYERS.forEach((L, layer) => {
      for (let i = 0; i < L.count; i++) {
        stars.push({
          x: r(),
          y: r(),
          r: L.size[0] + r() * (L.size[1] - L.size[0]),
          base: 0.25 + r() * 0.6,
          speed: 0.4 + r() * 1.6,
          phase: r() * Math.PI * 2,
          warm: r() > 0.8,
          layer,
        });
      }
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Pointer + scroll parallax (eased)
    let px = 0.5;
    let py = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let scroll = 0;
    let targetScroll = 0;
    let hasPointer = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      hasPointer = true;
      tx = e.clientX / Math.max(1, w);
      ty = e.clientY / Math.max(1, h);
    };
    const onScroll = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t && typeof t.scrollTop === 'number') targetScroll = t.scrollTop;
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('scroll', onScroll, true);

    const shooters: Shooter[] = [];
    let nextShot = performance.now() + 2500 + Math.random() * 4000;

    let raf = 0;
    const draw = (now: number) => {
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      scroll += (targetScroll - scroll) * 0.08;
      const t = now / 1000;

      // Deep sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#04050c');
      sky.addColorStop(0.55, '#070814');
      sky.addColorStop(1, '#0d0a12');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Drifting nebulae
      const neb = (cx: number, cy: number, rad: number, color: string, a: number) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, color.replace('A', String(a)));
        g.addColorStop(1, color.replace('A', '0'));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      };
      const drift = reduced ? 0 : t;
      neb(
        w * (0.78 + 0.03 * Math.sin(drift / 23)),
        h * (0.12 - scroll * 0.00004),
        Math.max(w, h) * 0.55,
        'rgba(70,60,160,A)',
        0.2,
      );
      neb(
        w * (0.12 + 0.03 * Math.cos(drift / 31)),
        h * 0.42,
        Math.max(w, h) * 0.45,
        'rgba(30,90,120,A)',
        0.1,
      );
      neb(w * 0.55, h * 1.12, Math.max(w, h) * 0.7, 'rgba(217,119,58,A)', 0.2 + 0.03 * Math.sin(drift / 3));

      // Stars
      const ox = (px - 0.5) * w;
      const oy = (py - 0.5) * h;
      for (const s of stars) {
        const depth = LAYERS[s.layer].depth;
        let x = s.x * w - ox * depth;
        let y = s.y * h - oy * depth - scroll * depth * 0.6;
        x = ((x % w) + w) % w;
        y = ((y % h) + h) % h;
        const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(t * s.speed + s.phase);
        const a = s.base * tw;
        ctx.globalAlpha = a;
        ctx.fillStyle = s.warm ? '#ffd9a8' : '#fff6e2';
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.layer === 2) {
          // soft halo + glint for the brightest stars
          ctx.globalAlpha = a * 0.18;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = a * 0.45;
          ctx.fillRect(x - s.r * 5, y - 0.25, s.r * 10, 0.5);
          ctx.fillRect(x - 0.25, y - s.r * 5, 0.5, s.r * 10);
        }
      }
      ctx.globalAlpha = 1;

      // Shooting stars
      if (!reduced && now > nextShot) {
        const fromLeft = Math.random() > 0.5;
        shooters.push({
          x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
          y: Math.random() * h * 0.4,
          vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 5),
          vy: 2.5 + Math.random() * 2,
          life: 0,
          max: 50 + Math.random() * 30,
        });
        nextShot = now + 5000 + Math.random() * 9000;
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        const p = s.life / s.max;
        const alpha = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
        g.addColorStop(0, `rgba(255,244,220,${0.9 * alpha})`);
        g.addColorStop(1, 'rgba(255,244,220,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12);
        ctx.stroke();
        if (s.life >= s.max) shooters.splice(i, 1);
      }

      // A faint lantern that follows the cursor
      if (hasPointer) {
        const lx = px * w;
        const ly = py * h;
        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 360);
        g.addColorStop(0, 'rgba(242,166,90,0.07)');
        g.addColorStop(1, 'rgba(242,166,90,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // Pause when the tab is hidden
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('visibilitychange', onVis);
      canvas.remove();
    };
  }, []);

  return (
    <View
      ref={ref}
      style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: '#04050c' }]}
      pointerEvents="none"
    />
  );
});
