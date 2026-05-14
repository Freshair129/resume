import { motion } from "motion/react";
import { fadeUp, staggerContainer, staggerItem, revealViewport } from "./motion-variants";

// Scroll-triggered reveal wrapper. Defaults to a fade-up; pass `variants`
// to override. `as` lets you pick the rendered element (defaults to div).
export const Reveal = ({ as = "div", variants = fadeUp, className, children, ...rest }) => {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      variants={variants}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Staggered group: children animate in sequence when the group enters view.
export const RevealGroup = ({ as = "div", className, children, ...rest }) => {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      variants={staggerContainer}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const RevealItem = ({ as = "div", className, children, ...rest }) => {
  const Tag = motion[as] || motion.div;
  return (
    <Tag variants={staggerItem} className={className} {...rest}>
      {children}
    </Tag>
  );
};
