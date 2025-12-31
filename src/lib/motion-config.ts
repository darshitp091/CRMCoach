/**
 * Optimized Framer Motion Configuration
 *
 * Why Framer Motion over GSAP:
 * - Built for React (better integration)
 * - Smaller bundle (~30KB vs GSAP's 95KB)
 * - Declarative API (easier to use)
 * - Gesture support built-in
 * - Spring physics (more natural)
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// OPTIMIZED TRANSITIONS
// ============================================================================

/**
 * Spring transition - Natural, physics-based
 * Best for: Scale, position changes
 */
export const spring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  mass: 0.5,
};

/**
 * Fast spring - Quick, snappy
 * Best for: Hover effects, toggles
 */
export const fastSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 0.3,
};

/**
 * Smooth transition - Eased, controlled
 * Best for: Opacity, color changes
 */
export const smooth: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // cubic-bezier
};

/**
 * Slow smooth - Elegant, graceful
 * Best for: Page transitions, modals
 */
export const slowSmooth: Transition = {
  type: 'tween',
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Fade in/out
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smooth },
  exit: { opacity: 0, transition: smooth },
};

/**
 * Slide up with fade
 */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring,
  },
  exit: { opacity: 0, y: -20, transition: smooth },
};

/**
 * Slide down with fade
 */
export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring,
  },
};

/**
 * Slide from left
 */
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: spring,
  },
};

/**
 * Slide from right
 */
export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: spring,
  },
};

/**
 * Scale in (zoom in)
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring,
  },
  exit: { opacity: 0, scale: 0.9, transition: smooth },
};

/**
 * Scale with bounce
 */
export const bounceVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
};

/**
 * Rotate and fade
 */
export const rotateVariants: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: spring,
  },
};

/**
 * Flip effect
 */
export const flipVariants: Variants = {
  hidden: { opacity: 0, rotateX: 90 },
  visible: {
    opacity: 1,
    rotateX: 0,
    transition: spring,
  },
};

// ============================================================================
// STAGGER CONFIGURATIONS
// ============================================================================

/**
 * Stagger children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Fast stagger
 */
export const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

/**
 * Slow stagger (elegant)
 */
export const slowStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// ============================================================================
// HOVER & TAP ANIMATIONS
// ============================================================================

/**
 * Lift on hover
 */
export const hoverLift = {
  scale: 1.05,
  y: -8,
  transition: fastSpring,
};

/**
 * Scale on hover
 */
export const hoverScale = {
  scale: 1.1,
  transition: fastSpring,
};

/**
 * Glow on hover (with shadow)
 */
export const hoverGlow = {
  scale: 1.02,
  boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
  transition: smooth,
};

/**
 * Press/tap feedback
 */
export const tapScale = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

// ============================================================================
// SCROLL ANIMATIONS
// ============================================================================

/**
 * Viewport animation config
 * Triggers when element enters viewport
 */
export const viewportOnce = {
  once: true,
  amount: 0.3, // 30% visible
  margin: '0px 0px -100px 0px',
};

/**
 * Viewport animation (repeats)
 */
export const viewport = {
  once: false,
  amount: 0.3,
  margin: '0px 0px -100px 0px',
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

/**
 * Page enter/exit animations
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: smooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: smooth,
  },
};

/**
 * Modal/Dialog animations
 */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: smooth,
  },
};

/**
 * Backdrop animation
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create custom stagger
 */
export const createStagger = (delay: number = 0.1, delayChildren: number = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
      delayChildren,
    },
  },
});

/**
 * Create custom delay
 */
export const withDelay = (delay: number, transition: Transition = smooth): Transition => ({
  ...transition,
  delay,
});
