"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * BeamsBackground — rising light-beam canvas used as a background layer.
 *
 * Performance rewrite of the original beams demo:
 * - No per-frame `ctx.filter = "blur(...)"` and no CSS `filter: blur()` on the
 *   canvas (both forced a full-canvas gaussian blur re-raster every frame —
 *   the single biggest cost of the original). Beam softness is instead *baked
 *   once* into small per-hue sprites; each frame only does clearRect + N×
 *   drawImage, which the compositor handles cheaply.
 * - devicePixelRatio is capped at 1.5 and the canvas is given a total pixel
 *   budget, so retina/4K displays do not render a giant canvas.
 * - The loop is capped at ~40fps with time-based movement (dt), so 120Hz
 *   displays do not double the work and beam speed stays frame-independent.
 * - Rendering pauses when the canvas scrolls out of view (IntersectionObserver)
 *   or the tab is hidden (visibilitychange), and never starts under
 *   prefers-reduced-motion (a single static frame is drawn instead).
 * - Debounced resize; all coordinates are CSS pixels (the original mixed
 *   device pixels with a dpr-scaled context, placing beams off-position).
 * - No `motion` dependency: its only uses were a full-hero backdrop-filter
 *   pulse (very expensive) and demo copy, both dropped for background use.
 */

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

/** Cyan → violet beam palette, matching the site's cyan/violet accents. */
const HUES = [190, 204, 218, 232, 246, 260];
const SPRITE_W = 96;
const SPRITE_H = 256;
const BEAM_COUNT = 18;
const BEAM_COUNT_MOBILE = 12;
const MAX_CANVAS_PIXELS = 3_500_000;
const FRAME_MS = 1000 / 40; // ~40fps cap; movement is dt-scaled so speed is unaffected
const FRAME_STEP = 16.667; // ms per "reference 60fps frame"
const INTENSITY_OPACITY: Record<"subtle" | "medium" | "strong", number> = {
  subtle: 0.7,
  medium: 0.95,
  strong: 1.2,
};

/**
 * Bakes one soft-edged beam: vertical alpha ramp (same stop shape as the
 * original gradient) multiplied by a horizontal edge falloff via
 * destination-in — i.e. the blur look with zero per-frame filter cost.
 */
function createBeamSprite(hue: number): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = SPRITE_W;
  sprite.height = SPRITE_H;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;

  const vertical = ctx.createLinearGradient(0, 0, 0, SPRITE_H);
  vertical.addColorStop(0, `hsla(${hue}, 90%, 72%, 0)`);
  vertical.addColorStop(0.1, `hsla(${hue}, 90%, 72%, 0.6)`);
  vertical.addColorStop(0.4, `hsla(${hue}, 90%, 72%, 1)`);
  vertical.addColorStop(0.6, `hsla(${hue}, 90%, 72%, 1)`);
  vertical.addColorStop(0.9, `hsla(${hue}, 90%, 72%, 0.6)`);
  vertical.addColorStop(1, `hsla(${hue}, 90%, 72%, 0)`);
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, SPRITE_W, SPRITE_H);

  const horizontal = ctx.createLinearGradient(0, 0, SPRITE_W, 0);
  horizontal.addColorStop(0, "rgba(255,255,255,0)");
  horizontal.addColorStop(0.2, "rgba(255,255,255,0.5)");
  horizontal.addColorStop(0.5, "rgba(255,255,255,1)");
  horizontal.addColorStop(0.8, "rgba(255,255,255,0.5)");
  horizontal.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, 0, SPRITE_W, SPRITE_H);

  return sprite;
}

function createBeam(width: number, height: number): Beam {
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 40 + Math.random() * 70,
    length: height * 2.5,
    angle: -35 + Math.random() * 10,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.25 + Math.random() * 0.25,
    hue: Math.floor(Math.random() * HUES.length),
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export function BeamsBackground({
  className,
  children,
  intensity = "strong",
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const sprites = HUES.map(createBeamSprite);
    const opacityScale = INTENSITY_OPACITY[intensity];

    let beams: Beam[] = [];
    let width = 0;
    let height = 0;
    let rafId = 0;
    let lastFrame = 0;
    let running = false;
    let inView = true;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const render = (steps: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = canvas.width / width;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < beams.length; i++) {
        const beam = beams[i];
        if (steps > 0) {
          beam.y -= beam.speed * steps;
          beam.pulse += beam.pulseSpeed * steps;
          if (beam.y + beam.length < -120) resetBeam(beam, i, beams.length);
        }
        const alpha = Math.min(
          1,
          beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityScale
        );
        ctx.save();
        ctx.translate(beam.x, beam.y);
        ctx.rotate((beam.angle * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprites[beam.hue],
          -beam.width / 2,
          0,
          beam.width,
          beam.length
        );
        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      const column = index % 3;
      const spacing = width / 3;
      beam.y = height + 120;
      beam.x =
        column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 90 + Math.random() * 90;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = Math.min(
        HUES.length - 1,
        Math.round((index / Math.max(totalBeams - 1, 1)) * (HUES.length - 1))
      );
      beam.opacity = 0.42 + Math.random() * 0.15;
    }

    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const rawDpr = window.devicePixelRatio || 1;
      const budgetDpr = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
      const dpr = Math.max(0.75, Math.min(rawDpr, 1.5, budgetDpr));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const count = width < 768 ? BEAM_COUNT_MOBILE : BEAM_COUNT;
      beams = Array.from({ length: count }, () => createBeam(width, height));
      if (reducedMotion) render(0);
      else if (running) render(0); // repaint at the new size; loop keeps going
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      const elapsed = now - lastFrame;
      if (elapsed < FRAME_MS) return;
      lastFrame = now - (elapsed % FRAME_MS);
      render(Math.min(elapsed, 64) / FRAME_STEP);
    };

    const start = () => {
      if (running || reducedMotion || !inView || document.hidden) return;
      running = true;
      lastFrame = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    const handleVisibility = () => (document.hidden ? stop() : start());
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setSize, 150);
    };
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) start();
            else stop();
          })
        : null;

    setSize();
    start();
    observer?.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
    };
  }, [intensity]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none relative overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />
      {children ? (
        <div className="pointer-events-auto relative z-10 flex h-full w-full items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
