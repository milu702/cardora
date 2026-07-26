import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.015, rotateX: 1, rotateY: -1 } : {}}
      transition={{ duration: 0.35, type: 'spring', stiffness: 280, damping: 18 }}
      className={`bg-white rounded-[20px] shadow-[0_10px_30px_-5px_rgba(31,94,59,0.08)] border border-[#D7E6D5] p-6 hover:border-[#1F5E3B]/60 hover:shadow-[0_20px_40px_-10px_rgba(31,94,59,0.16)] transition-colors duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;