"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedNumberSpringOptions = {
  bounce?: number;
  duration?: number;
};

type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: AnimatedNumberSpringOptions;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({
  value,
  className,
  springOptions,
  locale = "en-US",
  formatOptions,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, formatOptions),
    [locale, formatOptions]
  );

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    const duration = springOptions?.duration ?? 900;

    if (duration <= 0 || startValue === endValue) {
      previousValueRef.current = endValue;
      setDisplayValue(endValue);
      return;
    }

    let animationFrame = 0;
    let startTime: number | null = null;

    const tick = (time: number) => {
      if (startTime === null) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);
      const eased = easeOutCubic(progress);
      const nextValue = startValue + (endValue - startValue) * eased;

      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = endValue;
        setDisplayValue(endValue);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, springOptions?.duration]);

  return (
    <span className={className}>
      {formatter.format(Math.round(displayValue))}
    </span>
  );
}
