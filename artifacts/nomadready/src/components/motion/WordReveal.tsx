/**
 * WordReveal — word-by-word opacity reveal on scroll.
 * Inspired by magicui.design/docs/components/text-reveal.
 *
 * Each word fades from 0.12 → 1.0 as the container enters the viewport,
 * staggered by `staggerDelay` seconds per word.
 */

import { motion } from "motion/react";

interface Props {
  text: string;
  className?: string;
  wordClassName?: string;
  staggerDelay?: number;
  baseDelay?: number;
}

const VIEWPORT = { once: true as const, margin: "-40px" as const };

export function WordReveal({
  text,
  className,
  wordClassName,
  staggerDelay = 0.038,
  baseDelay = 0,
}: Props) {
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${i}-${word}`}
          aria-hidden
          initial={{ opacity: 0.12 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{
            duration: 0.55,
            delay: baseDelay + i * staggerDelay,
            ease: "easeOut",
          }}
          style={{ display: "inline-block", marginRight: "0.26em" }}
          className={wordClassName}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
