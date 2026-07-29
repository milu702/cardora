import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  iconPosition = 'right',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] text-white shadow-[0_6px_20px_rgba(31,94,59,0.25)] hover:shadow-[0_10px_28px_rgba(31,94,59,0.4)] border border-[#5C8D4E]/30',
    secondary: 'bg-white dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 border-2 border-[#1F5E3B] dark:border-emerald-500 hover:bg-[#DDEFD9] dark:hover:bg-slate-700 shadow-soft',
    outline: 'bg-transparent text-[#1F5E3B] border-2 border-[#5C8D4E] hover:bg-[#1F5E3B] hover:text-white',
    ghost: 'bg-transparent text-[#1F5E3B] hover:bg-[#DDEFD9]/50',
    gold: 'bg-gradient-to-r from-[#C9A227] to-[#D4AF37] text-white shadow-[0_6px_20px_rgba(201,162,39,0.3)] hover:shadow-[0_10px_28px_rgba(201,162,39,0.5)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs md:text-sm font-bold',
    md: 'px-6 py-3 text-sm md:text-base font-bold',
    lg: 'px-8 py-4 text-base md:text-lg font-extrabold tracking-wide',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`ripple-button group relative inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:-translate-x-1" />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
      )}
    </motion.button>
  );
};

export default Button;