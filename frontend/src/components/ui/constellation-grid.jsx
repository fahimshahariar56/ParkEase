import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const FRAME_INTERVAL = 1000 / 30;

export const ConstellationGrid = ({
  className = '',
  density = 0.65,
  interactive = true,
  intensity = 0.55,
}) => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const root = document.documentElement;
    const safeDensity = Number.isFinite(density) ? Math.min(Math.max(density, 0.2), 1.5) : 0.65;
    const safeIntensity = Number.isFinite(intensity) ? Math.min(Math.max(intensity, 0), 1) : 0.55;
    let motionEnabled = !reducedMotion.matches && !coarsePointer.matches;
    let interactionEnabled = interactive && motionEnabled;
    const computedStyle = window.getComputedStyle(root);
    const particleColor = computedStyle.getPropertyValue('--color-text').trim();
    const mutedColor = computedStyle.getPropertyValue('--color-text-muted').trim();
    let spacing = (84 / Math.sqrt(safeDensity)) * (coarsePointer.matches ? 1.4 : 1);
    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      lastMove: 0,
      rippleX: 0,
      rippleY: 0,
      rippleAt: 0,
      rippleStrength: 0,
    };

    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let particles = [];
    let edges = [];
    let animationFrame = 0;
    let lastFrame = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      columns = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
      particles = [];
      edges = [];

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          particles.push({
            x: column * spacing + spacing / 2,
            y: row * spacing + spacing / 2,
            phase: (index * 2.399963) % (Math.PI * 2),
            drawX: 0,
            drawY: 0,
          });

          if (column + 1 < columns) edges.push([index, index + 1]);
          if (row + 1 < rows) {
            edges.push([index, index + columns]);
            if (column + 1 < columns) edges.push([index, index + columns + 1]);
            if (column > 0) edges.push([index, index + columns - 1]);
          }
        }
      }
    };

    const draw = (time) => {
      context.clearRect(0, 0, width, height);
      const seconds = time / 1000;
      const pointerIdle = time - pointer.lastMove;
      const pointerFade = pointer.active
        ? Math.max(0, 1 - Math.max(0, pointerIdle - 100) / 350)
        : 0;
      const pointerVisible = interactionEnabled && pointerFade > 0;
      const rippleAge = time - pointer.rippleAt;
      const rippleVisible = pointerVisible && rippleAge >= 0 && rippleAge < 460;
      const rippleRadius = rippleAge * 0.48;
      const cursorRadius = Math.min(width, height) * 0.18 + 90;

      if (pointerVisible) {
        pointer.x += (pointer.targetX - pointer.x) * 0.24;
        pointer.y += (pointer.targetY - pointer.y) * 0.24;
      }

      particles.forEach((particle) => {
        let x = particle.x;
        let y = particle.y;

        if (motionEnabled) {
          x += Math.sin(seconds * 0.55 + particle.phase) * 1.5;
          y += Math.cos(seconds * 0.43 + particle.phase * 1.3) * 1.5;
        }

        if (pointerVisible) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < cursorRadius && distance > 0) {
            const falloff = (1 - distance / cursorRadius) ** 2;
            const force = falloff * 18 * safeIntensity * pointerFade;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }

        if (rippleVisible) {
          const dx = x - pointer.rippleX;
          const dy = y - pointer.rippleY;
          const distance = Math.hypot(dx, dy);
          const wave = Math.max(0, 1 - Math.abs(distance - rippleRadius) / 34);
          if (wave && distance > 0) {
            const fade = 1 - rippleAge / 460;
            const force = wave * pointer.rippleStrength * fade * 7 * safeIntensity;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }

        particle.drawX = x;
        particle.drawY = y;
      });

      context.beginPath();
      edges.forEach(([from, to]) => {
        const start = particles[from];
        const end = particles[to];
        context.moveTo(start.drawX, start.drawY);
        context.lineTo(end.drawX, end.drawY);
      });
      context.strokeStyle = mutedColor;
      context.globalAlpha = 0.12 * safeIntensity;
      context.lineWidth = 0.65;
      context.stroke();

      if (pointerVisible) {
        context.beginPath();
        edges.forEach(([from, to]) => {
          const start = particles[from];
          const end = particles[to];
          const middleX = (start.drawX + end.drawX) / 2;
          const middleY = (start.drawY + end.drawY) / 2;
          if (Math.hypot(middleX - pointer.x, middleY - pointer.y) < cursorRadius) {
            context.moveTo(start.drawX, start.drawY);
            context.lineTo(end.drawX, end.drawY);
          }
        });
        context.globalAlpha = 0.18 * safeIntensity * pointerFade;
        context.stroke();
      }

      context.beginPath();
      particles.forEach((particle) => {
        const pulse = motionEnabled ? Math.sin(seconds * 0.8 + particle.phase) * 0.12 : 0;
        context.moveTo(particle.drawX + 1.25 + pulse, particle.drawY);
        context.arc(particle.drawX, particle.drawY, 1.25 + pulse, 0, Math.PI * 2);
      });
      context.fillStyle = particleColor;
      context.globalAlpha = 0.24 * safeIntensity;
      context.fill();

      if (pointerVisible) {
        context.beginPath();
        particles.forEach((particle) => {
          if (Math.hypot(particle.drawX - pointer.x, particle.drawY - pointer.y) < cursorRadius) {
            context.moveTo(particle.drawX + 1.6, particle.drawY);
            context.arc(particle.drawX, particle.drawY, 1.6, 0, Math.PI * 2);
          }
        });
        context.globalAlpha = 0.38 * safeIntensity * pointerFade;
        context.fill();
      }

      context.globalAlpha = 1;
    };

    const animate = (time) => {
      animationFrame = 0;
      if (document.hidden) return;
      if (time - lastFrame >= FRAME_INTERVAL) {
        draw(time);
        lastFrame = time;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!document.hidden && motionEnabled && !animationFrame) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (event) => {
      if (event.pointerType !== 'mouse') return;
      const now = performance.now();
      const elapsed = now - pointer.lastMove;
      const distance = Math.hypot(event.clientX - pointer.targetX, event.clientY - pointer.targetY);
      const speed = elapsed > 0 ? distance / elapsed : 0;
      if (!pointer.active) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      }
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.active = true;
      pointer.lastMove = now;

      if (speed > 0.8) {
        pointer.rippleX = pointer.x;
        pointer.rippleY = pointer.y;
        pointer.rippleAt = now;
        pointer.rippleStrength = Math.min(speed / 2.5, 1);
      }
    };

    const handlePointerOut = (event) => {
      if (!event.relatedTarget) pointer.active = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        draw(performance.now());
        startAnimation();
      }
    };

    const handleResize = () => {
      resize();
      draw(performance.now());
    };

    const handleMotionPreferenceChange = () => {
      motionEnabled = !reducedMotion.matches && !coarsePointer.matches;
      interactionEnabled = interactive && motionEnabled;
      spacing = (84 / Math.sqrt(safeDensity)) * (coarsePointer.matches ? 1.4 : 1);
      resize();
      if (interactionEnabled) {
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerout', handlePointerOut, { passive: true });
      } else {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerout', handlePointerOut);
        pointer.active = false;
      }

      if (motionEnabled) {
        startAnimation();
      } else {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      draw(performance.now());
    };

    resize();
    draw(performance.now());
    startAnimation();
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (interactionEnabled) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerout', handlePointerOut, { passive: true });
    }

    reducedMotion.addEventListener('change', handleMotionPreferenceChange);
    coarsePointer.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerout', handlePointerOut);
      reducedMotion.removeEventListener('change', handleMotionPreferenceChange);
      coarsePointer.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, [density, intensity, interactive, theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full ${className}`}
    />
  );
};
