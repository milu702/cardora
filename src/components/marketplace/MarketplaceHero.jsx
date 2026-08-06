import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, MapPin, Award, Sun, CloudRain, Wind, Layers, ArrowUpRight } from 'lucide-react';

const MarketplaceHero = ({ lang, weatherMode, setWeatherMode, onExploreMap }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#123C15] text-white p-6 sm:p-10 md:p-14 shadow-2xl border border-white/20 mb-8">
      {/* Animated Background Particle Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Cardamom Leaf Ambient Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0.2, rotate: 0 }}
            animate={{ y: [0, 120, 0], opacity: [0.3, 0.7, 0.3], rotate: 360 }}
            transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full bg-[#66BB6A]/20 blur-xl"
            style={{
              top: `${10 + i * 15}%`,
              left: `${15 + i * 14}%`,
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
            }}
          />
        ))}

        {/* Rain Particle Simulation Overlay */}
        {weatherMode === 'rain' && (
          <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px] animate-pulse">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] h-8 bg-blue-200/40 rounded-full animate-bounce"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${0.6 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Sunlight Ray Simulation Overlay */}
        {weatherMode === 'summer' && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        )}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & Taglines */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-xs font-black tracking-widest uppercase text-emerald-200">
            <Sparkles className="w-4 h-4 text-[#66BB6A] animate-spin" />
            <span>CARDORA ECOSYSTEM • AI POWERED</span>
          </div>

          {/* Headlines */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-poppins tracking-tight leading-tight">
              {lang === 'ml'
                ? 'കേരളത്തിലെ ഏറ്റവും വിശ്വസനീയമായ ഏലത്തോട്ട വിപണി'
                : 'The Most Trusted AI Powered Cardamom Marketplace'}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 font-medium max-w-xl leading-relaxed">
              {lang === 'ml'
                ? 'ഇടുക്കിയിലെയും വയനാട്ടിലെയും ഹൈ-യീൽഡ് ഏലത്തോട്ടങ്ങൾ ഡ്രോൺ വിഷ്വലുകൾ, സാറ്റലൈറ്റ് മാപ്പിംഗ്, എഐ ലീഗൽ ഡോക്യുമെന്റ് പരിശോധനയോടെ വാങ്ങാം അല്ലെങ്കിൽ പാട്ടത്തിനെടുക്കാം.'
                : 'Discover, inspect, & acquire verified high-altitude cardamom plantations with 360° drone virtual tours, Satellite Soil Analysis, & 99.4% AI Legal Verification.'}
            </p>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onExploreMap}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#66BB6A] to-emerald-400 text-[#1B5E20] font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>{lang === 'ml' ? 'സാറ്റലൈറ്റ് മാപ്പ് കാണുക' : 'Explore Satellite Map'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {/* Weather Overlay Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20">
              <button
                onClick={() => setWeatherMode('summer')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  weatherMode === 'summer' ? 'bg-amber-400 text-slate-900 shadow-md' : 'text-emerald-100 hover:bg-white/10'
                }`}
                title="Sunlight Summer View"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Summer</span>
              </button>

              <button
                onClick={() => setWeatherMode('rain')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  weatherMode === 'rain' ? 'bg-blue-500 text-white shadow-md' : 'text-emerald-100 hover:bg-white/10'
                }`}
                title="Rain Monsoon View"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Monsoon</span>
              </button>
            </div>
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15">
            <div>
              <p className="text-xl sm:text-2xl font-black text-white font-poppins">120+</p>
              <p className="text-[11px] text-emerald-200 font-bold">{lang === 'ml' ? 'പരിശോധിച്ച തോട്ടങ്ങൾ' : 'Verified Plantations'}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-300 font-poppins">99.4%</p>
              <p className="text-[11px] text-emerald-200 font-bold">{lang === 'ml' ? 'എഐ ലീഗൽ കൃത്യത' : 'AI Legal Trust Score'}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#66BB6A] font-poppins">₹48.5 Cr</p>
              <p className="text-[11px] text-emerald-200 font-bold">{lang === 'ml' ? 'വിൽപ്പന തുക' : 'Trade Ecosystem'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Futuristic Preview Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black/40 backdrop-blur-xl p-4 space-y-3 group hover:border-[#66BB6A] transition duration-500">
            <div className="relative h-56 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800"
                alt="Cardamom Plantation"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#1B5E20]/90 backdrop-blur-md text-[10px] font-black text-white border border-[#66BB6A]/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#66BB6A]" /> AI VERIFIED 98%
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-[10px] font-black text-slate-950 flex items-center gap-1">
                  <Award className="w-3 h-3" /> GOVT PATTAYAM
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs font-bold text-emerald-300">Vandenmedu, Idukki</p>
                  <p className="text-base font-black font-poppins">8.5 Acres High Yield Estate</p>
                </div>
                <span className="text-base font-black text-[#66BB6A] font-poppins">₹1.85 Cr</span>
              </div>
            </div>

            {/* Micro Live Intel Bar */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-[11px] font-bold text-center">
              <div>
                <span className="text-emerald-200 block text-[9px] uppercase">Soil pH</span>
                <span className="text-white">6.2 (Optimal)</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[9px] uppercase">Altitude</span>
                <span className="text-white">1,150m MSL</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[9px] uppercase">Yield/Acre</span>
                <span className="text-emerald-300">420 kg/yr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHero;
