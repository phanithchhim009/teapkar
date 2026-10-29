"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { revealVariants, type RevealVariant } from "./animations/variants";
import { useBloom } from "./BloomContext";

type Props = {
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "section";
  children?: React.ReactNode;
};

/**
 * Animates in when 20% of it enters the inner scroll container. In "replay" mode it animates
 * back out when it leaves and plays again on re-entry; in "once" mode it stays shown.
 */
export function Reveal({ variant = "fadeUp", delay = 0, className, style, as = "div", children }: Props) {
  const { intensity, reduced, revealMode, scrollRef } = useBloom();
  const variants = useMemo(() => revealVariants(variant, intensity, reduced), [variant, intensity, reduced]);
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      style={style}
      variants={variants}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ root: scrollRef, once: revealMode === "once", amount: 0.2 }}
    >
      {children}
    </Comp>
  );
}
