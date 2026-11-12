import type { Transition } from 'framer-motion';

/**
 * Shared motion vocabulary. CSS transitions use `--ease-out-quint` (Tailwind's default
 * `ease`); framer-motion components use these values so both feel the same.
 */
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

/** Small state changes: messages appearing, list items, tab indicators. */
export const easeOut: Transition = { duration: 0.32, ease: EASE_OUT_QUINT };

/** Physical moves: the flashcard flip and the sliding tab background. */
export const spring: Transition = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 };
