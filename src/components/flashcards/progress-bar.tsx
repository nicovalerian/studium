'use client';

import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = Math.min(100, (current / total) * 100);

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex justify-between text-sm text-warm-500">
        <span className="font-medium text-warm-700">Progress</span>
        <span className="tabular-nums" aria-live="polite">
          Card {current} of {total}
        </span>
      </div>
      <Progress
        value={progress}
        aria-label={`Card ${current} of ${total}`}
        className="h-1.5 bg-warm-200"
      />
    </div>
  );
}
