'use client';

import { useEffect, useRef } from 'react';

type Props = { voiceLevel: { current: number } };

const GRID = 26;

export default function SignalBackdrop({ voiceLevel }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dots = document.createElement('canvas');
    let frame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let level = 0;

    // Dots are static, so they are rendered once per resize and blitted each frame.
    const paintDots = () => {
      dots.width = element.width;
      dots.height = element.height;
      const layer = dots.getContext('2d');
      if (!layer) return;
      layer.setTransform(ratio, 0, 0, ratio, 0, 0);
      const cx = width / 2;
      const reach = Math.hypot(width / 2, height * 0.75);
      for (let y = GRID / 2; y < height; y += GRID) {
        for (let x = GRID / 2; x < width; x += GRID) {
          const fade = 1 - Math.min(1, Math.hypot(x - cx, y) / reach);
          if (fade <= 0.02) continue;
          layer.fillStyle = `rgba(15, 23, 42, ${0.16 * fade * fade})`;
          layer.beginPath();
          layer.arc(x, y, 1, 0, Math.PI * 2);
          layer.fill();
        }
      }
    };

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paintDots();
    };

    const glow = (x: number, y: number, radius: number, rgb: string, alpha: number) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);
      context.fillStyle = gradient;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };

    const draw = (time: number) => {
      level += (voiceLevel.current - level) * 0.12;
      const energy = reducedMotion.matches ? 0 : Math.min(1, level);
      const t = reducedMotion.matches ? 0 : time * 0.00012;
      const size = Math.max(width, height);

      context.clearRect(0, 0, width, height);
      glow(width * (0.78 + Math.sin(t) * 0.04), height * (0.06 + Math.cos(t * 0.8) * 0.04), size * (0.42 + energy * 0.12), '13, 148, 136', 0.13 + energy * 0.14);
      glow(width * (0.12 + Math.cos(t * 0.7) * 0.04), height * (0.28 + Math.sin(t * 0.9) * 0.05), size * 0.36, '79, 70, 229', 0.08 + energy * 0.06);
      context.drawImage(dots, 0, 0, width, height);

      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      resize();
      if (reducedMotion.matches) draw(0);
      else frame = requestAnimationFrame(draw);
    };
    const onResize = () => {
      resize();
      if (reducedMotion.matches) draw(0);
    };

    window.addEventListener('resize', onResize);
    reducedMotion.addEventListener('change', start);
    start();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      reducedMotion.removeEventListener('change', start);
    };
  }, [voiceLevel]);

  return <canvas ref={canvas} className="signal-backdrop" aria-hidden="true" />;
}
