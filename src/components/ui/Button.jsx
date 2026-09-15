import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'right',
  isLoading = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-[#059669] via-[#10B981] to-[#047857] text-white shadow-[0_6px_22px_rgba(5,150,105,0.35)] hover:shadow-[0_10px_30px_rgba(5,150,105,0.5)] border border-emerald-400/30 font-black',
    secondary: 'bg-white dark:bg-[#0D261B] text-[#059669] dark:text-emerald-300 border-2 border-[#059669] dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 shadow-soft font-extrabold',
    outline: 'bg-transparent text-[#059669] dark:text-emerald-300 border-2 border-[#059669] dark:border-emerald-500 hover:bg-[#059669] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white font-bold',
    ghost: 'bg-transparent text-[#059669] dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-bold',
    gold: 'bg-gradient-to-r from-[#F59E0B] via-[#D4AF37] to-[#FBBF24] text-slate-950 shadow-[0_6px_22px_rgba(245,158,11,0.4)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.6)] font-black border border-amber-300/40',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs md:text-sm font-bold min-h-[40px]',
    md: 'px-6 py-3 text-sm md:text-base font-extrabold min-h-[48px]',
    lg: 'px-8 py-4 text-base md:text-lg font-black tracking-wide min-h-[56px]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      disabled={isLoading || props.disabled}
      className={`ripple-button group relative inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
      ) : (
        Icon && iconPosition === 'left' && (
          <Icon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:-translate-x-1" />
        )
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
      )}
    </motion.button>
  );
};

export default Button;