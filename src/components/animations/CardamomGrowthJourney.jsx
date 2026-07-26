import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';

const STAGES = [
  { id: 1, title: 'Seed in Soil', icon: '🟤', desc: 'High-grade cardamom seed nestled in fertile Idukki soil' },
  { id: 2, title: 'Roots Spread', icon: '🌱', desc: 'Nutrient-seeking root structure expanding downwards' },
  { id: 3, title: 'Sprout Appears', icon: '🌿', desc: 'First green shoot breaks through organic soil bed' },
  { id: 4, title: 'Stem Grows', icon: '🪴', desc: 'Sturdy pseudostem climbing towards high-altitude sunlight' },
  { id: 5, title: 'Leaves Unfold', icon: '🍃', desc: 'Vibrant lanceolate leaves expanding to capture canopy light' },
  { id: 6, title: 'Healthy Plant', icon: '🌳', desc: 'Lush cardamom clump reaching full vegetation maturity' },
  { id: 7, title: 'Pods Appear', icon: '🫛', desc: 'Aromatic green capsule pods blooming along basal tillers' },
  { id: 8, title: 'Grass Grows', icon: '🌾', desc: 'Organic ground cover carpet enhancing moisture retention' },
  { id: 9, title: 'Butterflies Fly', icon: '🦋', desc: 'Pollinators visiting the plantation ecosystem' },
  { id: 10, title: 'Leaves Move', icon: '💨', desc: 'Gentle Western Ghats breeze swaying leaves' },
  { id: 11, title: 'Sunlight Passes', icon: '☀️', desc: 'Golden sunlight rays penetrating canopy trees' },
  { id: 12, title: 'Full Plantation', icon: '⛰️', desc: 'Thriving Kerala cardamom plantation ready for selective harvest' },
];

const CardamomGrowthJourney = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = ((activeStageIndex + 1) / STAGES.length) * 100;
  const currentStage = STAGES[activeStageIndex];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#F8FAF7] via-[#DDEFD9]/40 to-[#F8FAF7] relative overflow-hidden">
      
      {/* Background Decorative Nature Elements (Continuous Motion, No Fade) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sun Ray Sweep */}
        <div 
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#C9A227]/10 via-[#5C8D4E]/10 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        
        {/* Floating Butterflies (Translate/Rotate Motion) */}
        <div className="absolute top-12 left-10 text-2xl animate-butterfly pointer-events-none">
          🦋
        </div>
        <div className="absolute bottom-16 right-12 text-3xl animate-butterfly pointer-events-none" style={{ animationDelay: '4s' }}>
          🦋
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1F5E3B] text-white text-xs font-bold shadow-soft mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            SIGNATURE REALISTIC JOURNEY
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#17331F] font-poppins tracking-tight">
            Cardamom Growth Journey
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#4A5568] font-medium leading-relaxed">
            Experience the complete biological lifecycle of Kerala cardamom from seed to harvest in our continuous digital simulation.
          </p>
        </div>

        {/* Interactive Growth Simulation Box */}
        <div className="max-w-5xl mx-auto bg-white rounded-[20px] border border-[#D7E6D5] shadow-[0_20px_50px_rgba(31,94,59,0.1)] p-6 md:p-10 relative overflow-hidden">
          
          {/* Top Progress Bar & Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-[#D7E6D5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1F5E3B] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                {activeStageIndex + 1}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-[#17331F]">
                  Stage {activeStageIndex + 1}: {currentStage.title}
                </h3>
                <p className="text-xs text-[#4A5568]">{currentStage.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1F5E3B] bg-[#DDEFD9] px-3 py-1 rounded-full">
                {Math.round(progressPercent)}% Lifecycle Complete
              </span>
              <button 
                onClick={() => setActiveStageIndex((prev) => (prev + 1) % STAGES.length)}
                className="p-2 rounded-full bg-[#F8FAF7] hover:bg-[#DDEFD9] text-[#1F5E3B] border border-[#D7E6D5] transition-colors"
                title="Next Stage"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Life Cycle SVG Canvas */}
          <div className="relative w-full h-[320px] md:h-[400px] bg-gradient-to-b from-[#F8FAF7] via-[#DDEFD9]/30 to-[#EFE2D3]/40 rounded-[20px] border border-[#D7E6D5] overflow-hidden flex items-center justify-center">
            
            {/* Sunlight Rays Sweep Layer */}
            {activeStageIndex >= 10 && (
              <motion.div 
                initial={{ x: '-100%', rotate: -25 }}
                animate={{ x: '100%', rotate: -25 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-32 bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent pointer-events-none"
              />
            )}

            {/* SVG Interactive Plant Simulation */}
            <svg className="w-full h-full max-w-lg" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              
              {/* Soil Gradient Base */}
              <path d="M 0,330 Q 250,320 500,330 L 500,400 L 0,400 Z" fill="url(#soilGradient)" />
              <defs>
                <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D4C41" />
                  <stop offset="50%" stopColor="#4E342E" />
                  <stop offset="100%" stopColor="#3E2723" />
                </linearGradient>
                <linearGradient id="stemGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#1F5E3B" />
                  <stop offset="100%" stopColor="#5C8D4E" />
                </linearGradient>
              </defs>

              {/* Stage 1: Seed in Soil */}
              {activeStageIndex >= 0 && (
                <g className="transition-all duration-500">
                  <ellipse cx="250" cy="355" rx="14" ry="10" fill="#3E2723" stroke="#C9A227" strokeWidth="2" />
                  <circle cx="250" cy="355" r="4" fill="#C9A227" />
                </g>
              )}

              {/* Stage 2: Roots Spread */}
              {activeStageIndex >= 1 && (
                <g className="transition-all duration-700">
                  <path d="M 250,360 Q 230,375 210,385" stroke="#D7CCC8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 250,360 Q 270,375 290,388" stroke="#D7CCC8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 250,360 Q 250,380 245,395" stroke="#D7CCC8" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}

              {/* Stage 3: Sprout Appears */}
              {activeStageIndex >= 2 && (
                <path d="M 250,350 Q 250,320 250,300" stroke="url(#stemGrad)" strokeWidth="4" strokeLinecap="round" />
              )}

              {/* Stage 4: Stem Grows */}
              {activeStageIndex >= 3 && (
                <path 
                  d="M 250,350 Q 252,240 250,180" 
                  stroke="url(#stemGrad)" 
                  strokeWidth={activeStageIndex >= 5 ? "8" : "5"} 
                  strokeLinecap="round" 
                />
              )}

              {/* Stage 5 & 6: Leaves Unfold & Healthy Plant */}
              {activeStageIndex >= 4 && (
                <g className="animate-sway-grass">
                  {/* Left Bottom Leaf */}
                  <path d="M 250,260 Q 180,240 140,260 Q 200,285 250,260" fill="#1F5E3B" stroke="#5C8D4E" strokeWidth="2" />
                  {/* Right Bottom Leaf */}
                  <path d="M 250,250 Q 320,230 360,250 Q 300,275 250,250" fill="#5C8D4E" stroke="#1F5E3B" strokeWidth="2" />
                  
                  {activeStageIndex >= 5 && (
                    <>
                      {/* Upper Left Leaf */}
                      <path d="M 250,200 Q 170,170 120,190 Q 190,220 250,200" fill="#5C8D4E" />
                      {/* Upper Right Leaf */}
                      <path d="M 250,190 Q 330,160 380,180 Q 310,210 250,190" fill="#1F5E3B" />
                      {/* Center Top Leaf */}
                      <path d="M 250,180 Q 240,110 250,80 Q 270,120 250,180" fill="#5C8D4E" />
                    </>
                  )}
                </g>
              )}

              {/* Stage 7: Cardamom Pods Appear */}
              {activeStageIndex >= 6 && (
                <g>
                  {/* Pod 1 */}
                  <ellipse cx="220" cy="300" rx="8" ry="14" fill="#5C8D4E" stroke="#1F5E3B" strokeWidth="2" transform="rotate(-30 220 300)" />
                  {/* Pod 2 */}
                  <ellipse cx="280" cy="295" rx="8" ry="14" fill="#1F5E3B" stroke="#C9A227" strokeWidth="2" transform="rotate(25 280 295)" />
                  {/* Pod 3 */}
                  <ellipse cx="240" cy="310" rx="7" ry="12" fill="#5C8D4E" stroke="#1F5E3B" strokeWidth="1.5" transform="rotate(-10 240 310)" />
                </g>
              )}

              {/* Stage 8: Grass Grows */}
              {activeStageIndex >= 7 && (
                <g className="animate-sway-grass">
                  <path d="M 120,330 Q 115,310 110,295" stroke="#5C8D4E" strokeWidth="3" />
                  <path d="M 140,330 Q 145,305 150,290" stroke="#1F5E3B" strokeWidth="3" />
                  <path d="M 350,330 Q 355,305 360,290" stroke="#5C8D4E" strokeWidth="3" />
                  <path d="M 370,330 Q 365,310 360,295" stroke="#1F5E3B" strokeWidth="3" />
                </g>
              )}

              {/* Stage 9: Butterflies */}
              {activeStageIndex >= 8 && (
                <g className="animate-butterfly">
                  <path d="M 180,140 Q 170,125 160,135 Q 170,145 180,140 Z" fill="#C9A227" />
                  <path d="M 180,140 Q 190,125 200,135 Q 190,145 180,140 Z" fill="#C9A227" />
                </g>
              )}

            </svg>

            {/* Floating Info Tag */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#D7E6D5] shadow-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B] animate-ping" />
              <span className="text-xs font-bold text-[#17331F]">{currentStage.title} Mode</span>
            </div>
          </div>

          {/* Stage Progression Timeline Nodes */}
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveStageIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-2.5 ${
                  idx === activeStageIndex
                    ? 'bg-[#1F5E3B] text-white border-[#1F5E3B] shadow-md scale-105'
                    : idx < activeStageIndex
                    ? 'bg-[#DDEFD9] text-[#17331F] border-[#5C8D4E]/40'
                    : 'bg-[#F8FAF7] text-[#4A5568] border-[#D7E6D5] hover:border-[#5C8D4E]'
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-extrabold truncate">{s.title}</p>
                  <p className="text-[9px] opacity-80 truncate">Stage 0{s.id}</p>
                </div>
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default CardamomGrowthJourney;
