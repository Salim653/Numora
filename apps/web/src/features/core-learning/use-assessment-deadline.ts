'use client';
import { useEffect, useRef, useState } from 'react';

/** Display and submit request only; the API owns expiry and finalization. */
export function useAssessmentDeadline(
  deadlineAt: string | null | undefined,
  onExpired: () => void,
  serverTime?: string,
) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const callback = useRef(onExpired);
  useEffect(() => {
    callback.current = onExpired;
  }, [onExpired]);
  useEffect(() => {
    const deadline = deadlineAt ? Date.parse(deadlineAt) : NaN;
    const serverAtReceipt = serverTime ? Date.parse(serverTime) : NaN;
    if (!Number.isFinite(deadline) || !Number.isFinite(serverAtReceipt)) {
      setRemaining(null);
      return;
    }
    const received = performance.now();
    let fired = false;
    function tick() {
      const seconds = Math.max(
        0,
        Math.ceil((deadline - serverAtReceipt - (performance.now() - received)) / 1000),
      );
      setRemaining(seconds);
      if (seconds === 0 && !fired) {
        fired = true;
        callback.current();
      }
    }
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [deadlineAt, serverTime]);
  return { remaining, expired: remaining === 0 };
}
