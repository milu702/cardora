import React from 'react';
import CardoraPlantationSkyline from './CardoraPlantationSkyline';

const NatureBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      
      {/* Sun Ray Beams */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#C9A227]/15 via-[#DDEFD9]/20 to-transparent blur-3xl"
      />

      {/* FLYING BIRDS & PLANTATION SKYLINE AT TOP */}
      <div className="absolute top-16 left-0 right-0 opacity-80 pointer-events-none">
        <CardoraPlantationSkyline />
      </div>

      {/* Floating Leaves */}
      <div className="absolute top-1/4 left-5 text-2xl text-[#1F5E3B]/25 animate-float-leaf pointer-events-none">
        🍃
      </div>
      <div className="absolute top-2/3 right-8 text-3xl text-[#5C8D4E]/30 animate-float-leaf pointer-events-none" style={{ animationDelay: '2.5s' }}>
        🌿
      </div>
      <div className="absolute bottom-1/4 left-1/3 text-xl text-[#1F5E3B]/20 animate-float-leaf pointer-events-none" style={{ animationDelay: '4s' }}>
        🍃
      </div>

      {/* Moving Pollen & Cardamom Pod Particles */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-[#C9A227]/40 animate-pollen" />
      <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-[#5C8D4E]/30 animate-pollen" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-[#C9A227]/30 animate-pollen" style={{ animationDelay: '5s' }} />

    </div>
  );
};

export default NatureBackground;
