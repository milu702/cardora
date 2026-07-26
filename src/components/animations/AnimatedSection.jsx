import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedSection = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  // STRICT RULE: No opacity fades. Use Scale, Slide, Rotate, Growing, Expand.
  const animationDirections = {
    up: { y: 50, scale: 0.95, rotate: -1 },
    down: { y: -50, scale: 0.95, rotate: 1 },
    left: { x: 50, scale: 0.95 },
    right: { x: -50, scale: 0.95 },
    scale: { scale: 0.85 },
    grow: { scale: 0.8, y: 30 },
    rotate: { rotate: -6, scale: 0.9 },
    none: { y: 0, scale: 1 },
  };

  const hiddenState = animationDirections[direction] || animationDirections.up;

  const variants = {
    hidden: hiddenState,
    visible: {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;