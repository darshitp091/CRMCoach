'use client';

import { motion, HTMLMotionProps, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import {
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  bounceVariants,
  staggerContainer,
  viewportOnce,
  hoverLift,
  hoverScale,
  tapScale,
} from '@/lib/motion-config';

// ============================================================================
// BASIC ANIMATION COMPONENTS
// ============================================================================

interface MotionBoxProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

/**
 * Fade in animation
 */
export function FadeIn({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide up with fade
 */
export function SlideUp({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={slideUpVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide down with fade
 */
export function SlideDown({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={slideDownVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide from left
 */
export function SlideLeft({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={slideLeftVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide from right
 */
export function SlideRight({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={slideRightVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale/zoom in
 */
export function ScaleIn({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={scaleVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Bounce in (playful)
 */
export function BounceIn({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={bounceVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

interface InteractiveBoxProps extends MotionBoxProps {
  hoverEffect?: 'lift' | 'scale' | 'none';
  tapEffect?: boolean;
}

/**
 * Card with hover and tap effects
 */
export function MotionCard({
  children,
  hoverEffect = 'lift',
  tapEffect = true,
  ...props
}: InteractiveBoxProps) {
  const hoverAnimation = hoverEffect === 'lift' ? hoverLift : hoverEffect === 'scale' ? hoverScale : undefined;

  return (
    <motion.div
      whileHover={hoverAnimation}
      whileTap={tapEffect ? tapScale : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Button with motion effects
 */
export function MotionButton({
  children,
  hoverEffect = 'scale',
  tapEffect = true,
  ...props
}: InteractiveBoxProps) {
  return (
    <motion.button
      whileHover={hoverEffect === 'scale' ? hoverScale : hoverLift}
      whileTap={tapEffect ? tapScale : undefined}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

// ============================================================================
// STAGGER CONTAINER
// ============================================================================

/**
 * Container that staggers child animations
 */
export function StaggerContainer({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item for stagger container
 */
export function StaggerItem({ children, ...props }: MotionBoxProps) {
  return (
    <motion.div variants={slideUpVariants} {...props}>
      {children}
    </motion.div>
  );
}

// ============================================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================================

interface ScrollRevealProps extends MotionBoxProps {
  delay?: number;
}

/**
 * Reveals content on scroll with optional delay
 */
export function ScrollReveal({ children, delay = 0, ...props }: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={slideUpVariants}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// PARALLAX EFFECT
// ============================================================================

interface ParallaxProps extends MotionBoxProps {
  speed?: number;
}

/**
 * Simple parallax scroll effect
 */
export function Parallax({ children, speed = 0.5, ...props }: ParallaxProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: speed * 100 }}
      viewport={{ once: false, amount: 0 }}
      transition={{ ease: 'linear', duration: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// NUMBER COUNTER ANIMATION
// ============================================================================

interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

/**
 * Animated number counter
 * Note: Simplified version without animated counting due to type issues
 */
export function AnimatedCounter({ from, to, duration = 2, suffix = '', className }: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewportOnce}
      transition={{ duration }}
    >
      {to.toLocaleString()}{suffix}
    </motion.span>
  );
}
