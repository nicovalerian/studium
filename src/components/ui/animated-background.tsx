'use client';

// Adapted from Motion Primitives' AnimatedBackground (https://motion-primitives.com, MIT licence).
// Changes: framer-motion import, controlled `value` instead of internal state, tab semantics
// (role="tab", aria-selected, roving arrow-key focus) and the project's spring.

import {
  Children,
  cloneElement,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';

type ItemElement = ReactElement<{
  'data-id': string;
  className?: string;
  children?: ReactNode;
}>;

export interface AnimatedBackgroundProps {
  children: ItemElement | ItemElement[];
  value: string;
  onValueChange: (value: string) => void;
  /** Classes for the sliding background. */
  className?: string;
  transition?: Transition;
}

export function AnimatedBackground({
  children,
  value,
  onValueChange,
  className,
  transition = spring,
}: AnimatedBackgroundProps) {
  const uniqueId = useId();
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const ids = Children.map(children, (child) => child.props['data-id']) ?? [];

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const nextIndex = (index + delta + ids.length) % ids.length;
    onValueChange(ids[nextIndex]);
    itemRefs.current[nextIndex]?.focus();
  };

  return Children.map(children, (child, index) => {
    const id = child.props['data-id'];
    const isActive = value === id;

    return cloneElement(
      child as ReactElement<Record<string, unknown>>,
      {
        key: id,
        ref: (node: HTMLElement | null) => {
          itemRefs.current[index] = node;
        },
        role: 'tab',
        'aria-selected': isActive,
        tabIndex: isActive ? 0 : -1,
        'data-state': isActive ? 'active' : 'inactive',
        className: cn('relative isolate', child.props.className),
        onClick: () => onValueChange(id),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleKeyDown(event, index),
      },
      <>
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0 -z-10', className)}
              transition={transition}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
        {child.props.children}
      </>
    );
  });
}
