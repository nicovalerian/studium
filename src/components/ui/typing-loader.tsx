// Adapted from prompt-kit's TypingLoader (https://prompt-kit.com, MIT licence): project tokens,
// shared `typing` keyframes in globals.css, and an optional visible label.
import { cn } from '@/lib/utils';

interface TypingLoaderProps {
  className?: string;
  label?: string;
}

export function TypingLoader({ className, label = 'Loading' }: TypingLoaderProps) {
  return (
    <span className={cn('inline-flex h-5 items-center gap-1', className)} role="status">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-typing rounded-full bg-primary"
          style={{ animationDelay: `${i * 250}ms` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
