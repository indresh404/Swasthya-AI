// src/hooks/useAnime.ts
import { useEffect, useRef, useCallback } from 'react';
import { animate, stagger, remove, set, type JSAnimation, type TargetsParam } from 'animejs';
import { 
  ANIMATION_DURATION, 
  EASING, 
  STAGGER_DELAY, 
  MOTION_OFFSETS, 
  MICRO_SCALES 
} from '../utils/animationConstants';
import useReducedMotion from './useReducedMotion';

/**
 * Hook providing ergonomic, medical-grade Anime.js animation utilities
 * with automatic cleanup on unmount and reduced-motion compliance.
 */
export function useAnime() {
  const prefersReduced = useReducedMotion();
  const activeAnimationsRef = useRef<JSAnimation[]>([]);

  // Cleanup helper
  const registerAnimation = useCallback((instance: JSAnimation) => {
    activeAnimationsRef.current.push(instance);
    return instance;
  }, []);

  useEffect(() => {
    return () => {
      // Clean up all active anime instances on component unmount
      activeAnimationsRef.current.forEach((anim) => {
        try {
          anim.pause();
          if (anim.targets) {
            remove(anim.targets);
          }
        } catch {
          // Ignore cleanup errors
        }
      });
      activeAnimationsRef.current = [];
    };
  }, []);

  /**
   * Staggered sequence for page/section elements
   */
  const staggerEntrance = useCallback((
    targets: TargetsParam,
    options?: {
      delay?: number;
      duration?: number;
      staggerDelay?: number;
      offsetY?: number;
    }
  ) => {
    if (prefersReduced) {
      return registerAnimation(animate(targets, {
        opacity: [0, 1],
        duration: 200,
        ease: 'linear'
      }));
    }

    const {
      delay = 0,
      duration = ANIMATION_DURATION.MEDIUM,
      staggerDelay = STAGGER_DELAY.NORMAL,
      offsetY = MOTION_OFFSETS.NORMAL_Y
    } = options || {};

    return registerAnimation(animate(targets, {
      opacity: [0, 1],
      translateY: [offsetY, 0],
      delay: stagger(staggerDelay, { start: delay }),
      duration,
      ease: EASING.OUT_CUBIC
    }));
  }, [prefersReduced, registerAnimation]);

  /**
   * Crossfade & slight slide for information panel content updates
   */
  const transitionContent = useCallback((
    target: TargetsParam,
    onComplete?: () => void
  ) => {
    if (prefersReduced) {
      if (onComplete) onComplete();
      return;
    }

    return registerAnimation(animate(target, {
      opacity: [0, 1],
      translateY: [MOTION_OFFSETS.SUBTLE_Y, 0],
      duration: ANIMATION_DURATION.NORMAL,
      ease: EASING.OUT_CUBIC,
      onComplete
    }));
  }, [prefersReduced, registerAnimation]);

  /**
   * Subtle Anatomical Label / Tooltip Appearance
   */
  const animateLabel = useCallback((
    target: TargetsParam,
    visible: boolean
  ) => {
    if (prefersReduced) {
      set(target, { opacity: visible ? 1 : 0 });
      return;
    }

    if (visible) {
      return registerAnimation(animate(target, {
        opacity: [0, 1],
        translateY: [MOTION_OFFSETS.SUBTLE_Y, 0],
        scale: [0.96, 1],
        duration: ANIMATION_DURATION.FAST,
        ease: EASING.OUT_CUBIC
      }));
    } else {
      return registerAnimation(animate(target, {
        opacity: [1, 0],
        translateY: [0, -MOTION_OFFSETS.SUBTLE_Y],
        duration: ANIMATION_DURATION.FAST,
        ease: EASING.OUT_CUBIC
      }));
    }
  }, [prefersReduced, registerAnimation]);

  /**
   * Micro-scale button feedback on click
   */
  const animateClick = useCallback((target: HTMLElement | null) => {
    if (!target || prefersReduced) return;

    return registerAnimation(animate(target, {
      scale: [
        { to: MICRO_SCALES.CLICK_DOWN, duration: 80, ease: EASING.EASE_OUT },
        { to: 1, duration: 120, ease: EASING.OUT_CUBIC }
      ]
    }));
  }, [prefersReduced, registerAnimation]);

  /**
   * Smooth active indicator translation (e.g. for tabs)
   */
  const animateIndicator = useCallback((
    target: TargetsParam,
    translateX: number,
    width: number
  ) => {
    if (prefersReduced) {
      set(target, { translateX, width });
      return;
    }

    return registerAnimation(animate(target, {
      translateX,
      width,
      duration: ANIMATION_DURATION.NORMAL,
      ease: EASING.OUT_CUBIC
    }));
  }, [prefersReduced, registerAnimation]);

  return {
    staggerEntrance,
    transitionContent,
    animateLabel,
    animateClick,
    animateIndicator,
    prefersReduced
  };
}

export default useAnime;
