import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';
type LogoTheme = 'default' | 'inverse';

interface LogoProps {
  size?: LogoSize;
  theme?: LogoTheme;
  className?: string;
  showTagline?: boolean;
}

const sizeStyles = {
  sm: {
    wrapper: 'gap-2.5',
    mark: 'h-10 w-10 rounded-2xl',
    dot: 'left-2.5 top-2.5 h-1.5 w-1.5',
    lineOne: 'left-2.5 right-2.5 top-[18px] h-1.5',
    lineTwo: 'left-2.5 right-4 top-[24px] h-1.5',
    title: 'text-lg',
    subtitle: 'text-[10px]',
  },
  md: {
    wrapper: 'gap-3',
    mark: 'h-12 w-12 rounded-[1.35rem]',
    dot: 'left-3 top-3 h-2 w-2',
    lineOne: 'left-3 right-3 top-[22px] h-1.5',
    lineTwo: 'left-3 right-5 top-[29px] h-1.5',
    title: 'text-xl',
    subtitle: 'text-[11px]',
  },
  lg: {
    wrapper: 'gap-4',
    mark: 'h-14 w-14 rounded-[1.6rem]',
    dot: 'left-3.5 top-3.5 h-2.5 w-2.5',
    lineOne: 'left-3.5 right-3.5 top-[26px] h-2',
    lineTwo: 'left-3.5 right-6 top-[34px] h-2',
    title: 'text-2xl',
    subtitle: 'text-xs',
  },
} satisfies Record<
  LogoSize,
  {
    wrapper: string;
    mark: string;
    dot: string;
    lineOne: string;
    lineTwo: string;
    title: string;
    subtitle: string;
  }
>;

const themeStyles = {
  default: {
    title: 'text-warm-900',
    subtitle: 'text-warm-500',
    ring: 'ring-warm-900/5',
  },
  inverse: {
    title: 'text-white',
    subtitle: 'text-white/70',
    ring: 'ring-white/10',
  },
} satisfies Record<LogoTheme, { title: string; subtitle: string; ring: string }>;

export function Logo({
  size = 'md',
  theme = 'default',
  className,
  showTagline = false,
}: LogoProps) {
  const sizeStyle = sizeStyles[size];
  const themeStyle = themeStyles[theme];

  return (
    <div className={cn('inline-flex items-center', sizeStyle.wrapper, className)}>
      <span
        className={cn(
          'relative isolate flex shrink-0 overflow-hidden bg-[hsl(var(--warm-900))] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)] ring-1',
          sizeStyle.mark,
          themeStyle.ring
        )}
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_48%),linear-gradient(135deg,hsl(var(--terracotta)),hsl(var(--warm-900))_65%,hsl(var(--sage-dark)))]" />
        <span
          className={cn('absolute rounded-full bg-white/95 shadow-sm', sizeStyle.dot)}
        />
        <span
          className={cn('absolute rounded-full bg-white/90 shadow-sm', sizeStyle.lineOne)}
        />
        <span
          className={cn('absolute rounded-full bg-white/65 shadow-sm', sizeStyle.lineTwo)}
        />
      </span>

      <span className="flex flex-col">
        <span className={cn('font-serif font-semibold leading-none tracking-tight', sizeStyle.title, themeStyle.title)}>
          Studium
        </span>
        {showTagline ? (
          <span
            className={cn(
              'mt-1 font-sans uppercase tracking-[0.26em]',
              sizeStyle.subtitle,
              themeStyle.subtitle
            )}
          >
            Study in flow
          </span>
        ) : null}
      </span>
    </div>
  );
}
