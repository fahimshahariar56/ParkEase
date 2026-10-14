import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'About ParkEase', to: '/about' },
    ],
  },
  {
    title: 'Parking',
    links: [
      { label: 'Find Parking', to: '/parking' },
      { label: 'Reservations', to: '/reservations' },
      { label: 'Your Profile', to: '/profile' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: '/login' },
      { label: 'Create Account', to: '/register' },
      { label: 'Admin Portal', to: '/admin/login' },
    ],
  },
];

const THEME_PALETTES = {
  dark: { background: '#08090B', ink: '#F5F5F5', warm: '#A1A1AA' },
  light: { background: '#FAFAFA', ink: '#111113', warm: '#62626B' },
};
const FRAME_INTERVAL = 1000 / 30;
const COPYRIGHT_YEAR = new Date().getFullYear();

const hexToRgb = (hex) => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = match[1].length === 3
    ? match[1].split('').map((character) => character + character).join('')
    : match[1];
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
};

const dotRadius = (coverage, gap) => Math.sqrt(Math.min(1, Math.max(0, coverage))) * gap * 0.56;

const HWF_CSS = `
.pkwf-root {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  isolation: isolate;
  background: var(--pkwf-bg);
  color: var(--pkwf-ink);
  -webkit-font-smoothing: antialiased;
}
.pkwf-canvas {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  display: block;
  max-width: none;
  pointer-events: none;
}
.pkwf-top {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) repeat(3, minmax(0, 1fr));
  gap: 24px;
  padding: clamp(26px, 4vw, 48px) clamp(24px, 5vw, 64px) 0;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: .12em;
  text-transform: uppercase;
  line-height: 1.8;
}
.pkwf-brand strong { display: block; font-weight: 600; }
.pkwf-brand span { opacity: .52; }
.pkwf-col h3 { margin: 0; font: inherit; opacity: .52; font-weight: 500; }
.pkwf-col ul { list-style: none; margin: 0; padding: 0; }
.pkwf-col a, .pkwf-up {
  color: inherit;
  text-decoration: none;
  opacity: .78;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  transition: opacity 150ms ease, background-size 200ms ease;
}
.pkwf-col a:hover, .pkwf-up:hover { opacity: 1; background-size: 100% 1px; }
.pkwf-col a:focus-visible, .pkwf-up:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
  opacity: 1;
}
.pkwf-rule {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: clamp(20px, 3vw, 36px) clamp(24px, 5vw, 64px) 0;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--pkwf-ink) 16%, transparent);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.pkwf-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.pkwf-fallback-wordmark { display: none; }
.pkwf-root[data-canvas-fallback='true'] .pkwf-fallback-wordmark {
  position: absolute;
  inset: auto 0 24px;
  display: block;
  overflow: hidden;
  color: var(--pkwf-ink);
  padding: 0 5vw;
  font: 800 clamp(2rem, 12vw, 11rem)/.9 var(--font-sans);
  letter-spacing: -.07em;
  text-align: center;
  white-space: nowrap;
}
@media (max-width: 720px) {
  .pkwf-top { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); row-gap: 18px; }
  .pkwf-brand { grid-column: 1 / -1; }
  .pkwf-rule { align-items: flex-end; font-size: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .pkwf-col a, .pkwf-up { transition: none; }
}
`;

export const HalftoneWordmarkFooter = ({
  wordmark = 'PARKEASE',
  label = 'ParkEase Smart Parking',
  meta = 'A smarter way to find your space',
  columns = DEFAULT_COLUMNS,
  backToTop = true,
  palette,
  dotGap = 6,
  radius = 80,
  crop = 0.2,
  grain = 0.25,
  interactive = true,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 800,
  height = 'clamp(420px, 50vw, 560px)',
  className = '',
}) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const colors = { ...(THEME_PALETTES[theme] || THEME_PALETTES.dark), ...(palette || {}) };

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!root || !canvas || !context) {
      root?.setAttribute('data-canvas-fallback', 'true');
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const ink = hexToRgb(colors.ink);
    const warm = hexToRgb(colors.warm);
    let width = 0;
    let heightPx = 0;
    let ratio = 1;
    let dots = new Float32Array(0);
    let dotCount = 0;
    let grainPattern = null;
    let animationFrame = 0;
    let lastFrame = 0;
    let visible = true;
    let pointerX = -1e5;
    let pointerY = -1e5;
    let ripple = { x: 0, y: 0, time: -1 };

    const makeGrain = () => {
      const tile = document.createElement('canvas');
      tile.width = 192;
      tile.height = 192;
      const tileContext = tile.getContext('2d');
      if (!tileContext) return null;
      const image = tileContext.createImageData(tile.width, tile.height);
      for (let index = 0; index < image.data.length; index += 4) {
        const value = Math.random() * 255;
        image.data[index] = image.data[index + 1] = image.data[index + 2] = value;
        image.data[index + 3] = Math.random() < 0.5 ? 0 : 255;
      }
      tileContext.putImageData(image, 0, 0);
      return context.createPattern(tile, 'repeat');
    };

    const layout = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      heightPx = Math.max(1, Math.round(bounds.height));
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(heightPx * ratio);

      const mask = document.createElement('canvas');
      mask.width = width;
      mask.height = heightPx;
      const maskContext = mask.getContext('2d', { willReadFrequently: true });
      if (!maskContext) {
        root.setAttribute('data-canvas-fallback', 'true');
        return;
      }

      maskContext.font = `${fontWeight} 100px ${fontFamily}`;
      const text = wordmark || 'PARKEASE';
      const horizontalPadding = Math.min(64, Math.max(16, width * 0.06));
      const maxTextWidth = Math.max(1, width - horizontalPadding * 2);
      const fit = (maxTextWidth / maskContext.measureText(text).width) * 100;
      maskContext.font = `${fontWeight} ${fit}px ${fontFamily}`;
      const metrics = maskContext.measureText(text);
      const capHeight = metrics.actualBoundingBoxAscent || fit * 0.72;
      const bottomPadding = Math.min(36, Math.max(18, heightPx * 0.06));
      maskContext.fillStyle = '#000';
      maskContext.textBaseline = 'alphabetic';
      maskContext.fillText(
        text,
        (width - metrics.width) / 2,
        Math.min(heightPx - bottomPadding, heightPx - bottomPadding - capHeight * Math.min(0.2, Math.max(0, crop))),
      );
      const pixels = maskContext.getImageData(0, 0, width, heightPx).data;
      const gap = Math.max(3, dotGap);
      const output = [];

      for (let y = 0; y < heightPx; y += gap) {
        for (let x = 0; x < width; x += gap) {
          let coverage = 0;
          for (let sampleY = 0; sampleY < 3; sampleY += 1) {
            for (let sampleX = 0; sampleX < 3; sampleX += 1) {
              const sampleXPos = Math.min(width - 1, Math.floor(x + ((sampleX + 0.5) * gap) / 3));
              const sampleYPos = Math.min(heightPx - 1, Math.floor(y + ((sampleY + 0.5) * gap) / 3));
              coverage += pixels[(sampleYPos * width + sampleXPos) * 4 + 3];
            }
          }

          coverage /= 9 * 255;
          if (coverage < 0.06) continue;
          const homeX = x + gap / 2;
          const homeY = y + gap / 2;
          output.push(homeX, homeY, 0, 0, homeX, homeY, dotRadius(coverage, gap));
        }
      }

      dots = new Float32Array(output);
      dotCount = dots.length / 7;
      grainPattern = grain > 0 ? makeGrain() : null;
      root.removeAttribute('data-canvas-fallback');
    };

    const draw = (now) => {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = colors.background;
      context.fillRect(0, 0, width, heightPx);

      const canInteract = interactive && !reducedMotion.matches && !coarsePointer.matches;
      const influenceRadius = canInteract ? Math.max(0, radius) : 0;
      const rippleAge = ripple.time < 0 ? Infinity : now - ripple.time;
      const rippleRadius = rippleAge * 0.9;
      let moving = false;

      for (let index = 0; index < dotCount; index += 1) {
        const offset = index * 7;
        let x = dots[offset];
        let y = dots[offset + 1];
        let velocityX = dots[offset + 2];
        let velocityY = dots[offset + 3];
        const homeX = dots[offset + 4];
        const homeY = dots[offset + 5];

        if (!reducedMotion.matches) {
          if (rippleAge < 900) {
            const dx = homeX - ripple.x;
            const dy = homeY - ripple.y;
            const distance = Math.hypot(dx, dy) + 0.001;
            const band = 1 - Math.min(1, Math.abs(distance - rippleRadius) / 26);
            if (band > 0) {
              const force = band * 3.2 * (1 - rippleAge / 900);
              velocityX += (dx / distance) * force;
              velocityY += (dy / distance) * force;
            }
          }

          const dx = x - pointerX;
          const dy = y - pointerY;
          const distanceSquared = dx * dx + dy * dy;
          if (influenceRadius > 0 && distanceSquared < influenceRadius * influenceRadius) {
            const distance = Math.sqrt(distanceSquared) + 0.001;
            const force = (1 - distance / influenceRadius) * 2.6;
            velocityX += (dx / distance) * force;
            velocityY += (dy / distance) * force;
          }

          velocityX = (velocityX + (homeX - x) * 0.05) * 0.84;
          velocityY = (velocityY + (homeY - y) * 0.05) * 0.84;
          x += velocityX;
          y += velocityY;

          if (Math.abs(velocityX) + Math.abs(velocityY) > 0.02) {
            moving = true;
          } else {
            velocityX = 0;
            velocityY = 0;
          }

          dots[offset] = x;
          dots[offset + 1] = y;
          dots[offset + 2] = velocityX;
          dots[offset + 3] = velocityY;
        }

        const warmth = Math.min(1, Math.hypot(x - homeX, y - homeY) / 28);
        if (warmth > 0.02 && ink && warm) {
          const color = ink.map((value, channel) => Math.round(value + (warm[channel] - value) * warmth));
          context.fillStyle = `rgb(${color.join(',')})`;
        } else {
          context.fillStyle = colors.ink;
        }
        context.beginPath();
        context.arc(x, y, dots[offset + 6], 0, Math.PI * 2);
        context.fill();
      }

      if (grainPattern && grain > 0) {
        context.globalAlpha = Math.min(1, grain) * 0.07;
        context.globalCompositeOperation = 'overlay';
        context.fillStyle = grainPattern;
        context.fillRect(0, 0, width, heightPx);
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
      }

      return moving || rippleAge < 900;
    };

    const animate = (now) => {
      animationFrame = 0;
      if (!visible || document.hidden) return;
      if (now - lastFrame < FRAME_INTERVAL) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }
      lastFrame = now;
      if (draw(now)) animationFrame = window.requestAnimationFrame(animate);
    };

    const wake = () => {
      if (!animationFrame && visible && !document.hidden && !reducedMotion.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const onPointerMove = (event) => {
      if (!interactive || reducedMotion.matches || coarsePointer.matches || event.pointerType !== 'mouse') return;
      pointerX = event.clientX - root.getBoundingClientRect().left;
      pointerY = event.clientY - root.getBoundingClientRect().top;
      wake();
    };

    const onPointerLeave = () => {
      pointerX = -1e5;
      pointerY = -1e5;
      wake();
    };

    const onPointerDown = (event) => {
      if (!interactive || reducedMotion.matches || coarsePointer.matches) return;
      if (event.target.closest('a, button')) return;
      ripple = {
        x: event.clientX - root.getBoundingClientRect().left,
        y: event.clientY - root.getBoundingClientRect().top,
        time: performance.now(),
      };
      wake();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw(performance.now());
        wake();
      }
    };

    const onMotionPreferenceChange = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (!reducedMotion.matches) wake();
      else {
        for (let index = 0; index < dotCount; index += 1) {
          const offset = index * 7;
          dots[offset] = dots[offset + 4];
          dots[offset + 1] = dots[offset + 5];
          dots[offset + 2] = 0;
          dots[offset + 3] = 0;
        }
        draw(performance.now());
      }
    };

    layout();
    draw(performance.now());
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
    root.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', onMotionPreferenceChange);

    const resizeObserver = new ResizeObserver(() => {
      layout();
      draw(performance.now());
    });
    resizeObserver.observe(root);

    let active = true;
    document.fonts?.ready.then(() => {
      if (!active) return;
      layout();
      draw(performance.now());
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
    };
  }, [
    colors.background,
    colors.ink,
    colors.warm,
    crop,
    dotGap,
    fontFamily,
    fontWeight,
    grain,
    interactive,
    radius,
    theme,
    wordmark,
  ]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <footer
      ref={rootRef}
      className={`pkwf-root ${className}`}
      aria-label="ParkEase site footer"
      style={{
        height,
        '--pkwf-bg': colors.background,
        '--pkwf-ink': colors.ink,
      }}
    >
      <style>{HWF_CSS}</style>
      <canvas ref={canvasRef} className="pkwf-canvas" aria-hidden="true" />
      <span className="pkwf-sr">{wordmark}</span>
      <span className="pkwf-fallback-wordmark" aria-hidden="true">{wordmark}</span>
      <div className="pkwf-top">
        <div className="pkwf-brand">
          <strong>{label}</strong>
          <span>{meta}</span>
        </div>
        {columns.map((column) => (
          <nav className="pkwf-col" key={column.title} aria-label={column.title}>
            <h3>{column.title}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="pkwf-rule">
        <span>© {COPYRIGHT_YEAR} ParkEase</span>
        {backToTop && (
          <button type="button" className="pkwf-up" onClick={scrollToTop}>
            Back to top ↑
          </button>
        )}
      </div>
    </footer>
  );
};
