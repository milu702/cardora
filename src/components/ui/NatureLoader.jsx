import React from 'react';
import { motion } from 'framer-motion';

const NatureLoader = ({ text = "Loading Cardora Ecosystem..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAF7] text-[#17331F]">
      <div className="relative w-24 h-24 flex items-center justify-center">
        
        {/* Outer Rotating Sage Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-t-[#1F5E3B] border-r-[#5C8D4E] border-b-[#DDEFD9] border-l-transparent"
        />

        {/* Inner Growing Leaf Icon */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl text-[#1F5E3B]"
        >
          🌿
        </motion.div>
      </div>

      <p className="mt-6 text-sm font-extrabold tracking-wide text-[#17331F] font-poppins">
        {text}
      </p>
      <p className="mt-1 text-xs text-[#5C8D4E] font-medium">
        Kerala Smart Agricultural Platform
      </p>
    </div>
  );
};

export default NatureLoader;
