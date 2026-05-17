'use client';
import { motion, useInView } from 'motion/react';
import type { UseInViewOptions, Variants } from 'motion/react';
import { useRef } from 'react';
import type { ReactNode } from 'react';

export type InViewProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  transition?: object;
  viewOptions?: UseInViewOptions;
};

export function InView({
  children,
  className,
  variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  transition,
  viewOptions,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, viewOptions);

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
