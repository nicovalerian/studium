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
      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        <span>Progress</span>
        <span>
          {current} of {total}
        </span>
      </div>
      <Progress
        value={progress}
        className="h-2 bg-indigo-100 [&>*]:bg-gradient-to-r [&>*]:from-indigo-500 [&>*]:to-purple-500"
      />
    </div>
  );
}
