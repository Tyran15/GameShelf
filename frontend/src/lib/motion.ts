import type { CSSProperties } from "react";

const STAGGER_STEP_MS = 50;
const STAGGER_MAX_STEPS = 12;

/** Atraso (ms) da animação de entrada em cascata; limitado para listas grandes não demorarem. */
export function staggerMs(index: number, offsetMs = 0): number {
  const steps = Math.min(Math.max(index, 0), STAGGER_MAX_STEPS);
  return steps * STAGGER_STEP_MS + offsetMs;
}

export function staggerDelay(index: number, offsetMs = 0): CSSProperties {
  return { animationDelay: `${staggerMs(index, offsetMs)}ms` };
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
