'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RateLimitTimerProps {
  retryAfter: number;
  onComplete: () => void;
}

export function RateLimitTimer({ retryAfter, onComplete }: RateLimitTimerProps) {
  const [timeLeft, setTimeLeft] = useState(retryAfter);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = ((retryAfter - timeLeft) / retryAfter) * 100;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      <div className="flex items-center gap-2 font-medium">
        <Clock className="h-4 w-4" />
        <span>Rate limit reached</span>
      </div>
      <p className="text-sm opacity-90">
        Please wait {timeLeft} seconds before sending another message.
      </p>
      <Progress value={progress} className="h-1 bg-amber-200 dark:bg-amber-900" />
    </div>
  );
}
