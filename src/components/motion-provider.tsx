'use client';

import { MotionConfig } from 'framer-motion';

/** framer-motion skips transform animations when the visitor prefers reduced motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
