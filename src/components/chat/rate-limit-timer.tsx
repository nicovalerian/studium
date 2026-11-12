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
    <div
      role="status"
      className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
    >
      <div className="flex items-center gap-2 font-semibold">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span>Rate limit reached</span>
      </div>
      <p className="text-sm tabular-nums">
        Please wait {timeLeft} seconds before sending another message.
      </p>
      <Progress
        value={progress}
        aria-label="Time until you can send again"
        className="h-1 bg-amber-200 [&>*]:bg-amber-600"
      />
    </div>
  );
}
