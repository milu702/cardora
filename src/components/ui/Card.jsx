import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.015, rotateX: 1, rotateY: -1 } : {}}
      transition={{ duration: 0.35, type: 'spring', stiffness: 280, damping: 18 }}
      className={`bg-white/95 dark:bg-[#072418]/90 text-[#17331F] dark:text-slate-100 rounded-[20px] shadow-[0_10px_30px_-5px_rgba(31,94,59,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-[#CDE3D5] dark:border-emerald-500/25 p-6 hover:border-[#059669]/60 dark:hover:border-emerald-400/50 hover:shadow-[0_20px_40px_-10px_rgba(31,94,59,0.16)] backdrop-blur-md transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;