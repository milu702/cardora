import React from 'react';
import { motion } from 'framer-motion';

const SectionHeader = ({ badge, title, subtitle, align = 'left', className = '' }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  };

  return (
    <div className={`mb-12 md:mb-16 max-w-3xl ${alignClasses[align]} ${className}`}>
      {badge && (
        <motion.span
          initial={{ scale: 0.9, y: 15 }}
          whileInView={{ scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-3 text-xs md:text-sm font-extrabold text-[#1F5E3B] bg-[#DDEFD9] rounded-full border border-[#5C8D4E]/40 shadow-soft"
        >
          {badge}
        </motion.span>
      )}
      {title && (
        <motion.h2
          initial={{ scale: 0.95, y: 20 }}
          whileInView={{ scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#17331F] font-poppins tracking-tight"
        >
          {title}
        </motion.h2>
      )}
      {subtitle && (
        <motion.p
          initial={{ scale: 0.95, y: 20 }}
          whileInView={{ scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3.5 text-sm md:text-base text-[#4A5568] font-medium leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;