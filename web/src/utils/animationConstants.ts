// src/utils/animationConstants.ts

/**
 * Centralized Animation Tokens & Constants for Medical-Grade Visualizations
 * Designed for calm, sophisticated, and precise health-tech UX.
 */

export const ANIMATION_DURATION = {
  INSTANT: 100,
  FAST: 180,
  NORMAL: 320,
  MEDIUM: 480,
  SLOW: 720,
  ENTRANCE: 900,
} as const;

export const EASING = {
  // Smooth deceleration for entrances
  OUT_CUBIC: 'easeOutCubic',
  OUT_EXPO: 'easeOutExpo',
  OUT_QUAD: 'easeOutQuad',
  // Symmetrical transitions for state changes
  IN_OUT_QUAD: 'easeInOutQuad',
  IN_OUT_CUBIC: 'easeInOutCubic',
  // Micro-interaction immediate response
  EASE_OUT: 'easeOutSine',
} as const;

export const STAGGER_DELAY = {
  TIGHT: 40,
  NORMAL: 70,
  RELAXED: 110,
} as const;

export const MOTION_OFFSETS = {
  MICRO_Y: 2,
  SUBTLE_Y: 6,
  NORMAL_Y: 12,
  MODAL_Y: 16,
  PANEL_X: 16,
} as const;

export const MICRO_SCALES = {
  CLICK_DOWN: 0.98,
  HOVER_UP: 1.02,
  ICON_HOVER: 1.04,
  PULSE_SUBTLE: 1.008,
} as const;
