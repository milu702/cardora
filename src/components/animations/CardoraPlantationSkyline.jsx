import React from 'react';

const CardoraPlantationSkyline = () => {
  return (
    <div className="relative w-full overflow-hidden pointer-events-none select-none py-4">

      {/* FLYING BIRDS FLOCK ANIMATION */}
      <div className="absolute top-2 left-0 right-0 h-24 z-10 overflow-hidden">
        {/* Bird 1 */}
        <div className="absolute top-3 left-0 animate-fly-bird" style={{ animationDelay: '0s', animationDuration: '24s' }}>
          <svg className="w-8 h-5 text-emerald-800/60 dark:text-emerald-400/50 animate-wing-flap" viewBox="0 0 24 16" fill="currentColor">
            <path d="M 0 12 C 6 4, 10 2, 12 8 C 14 2, 18 4, 24 12 C 18 10, 14 12, 12 16 C 10 12, 6 10, 0 12 Z" />
          </svg>
        </div>

        {/* Bird 2 */}
        <div className="absolute top-8 left-0 animate-fly-bird" style={{ animationDelay: '4s', animationDuration: '28s' }}>
          <svg className="w-6 h-4 text-emerald-900/50 dark:text-emerald-300/40 animate-wing-flap" viewBox="0 0 24 16" fill="currentColor" style={{ animationDelay: '0.4s' }}>
            <path d="M 0 12 C 6 4, 10 2, 12 8 C 14 2, 18 4, 24 12 C 18 10, 14 12, 12 16 C 10 12, 6 10, 0 12 Z" />
          </svg>
        </div>

        {/* Bird 3 (Flock Leader) */}
        <div className="absolute top-5 left-0 animate-fly-bird" style={{ animationDelay: '10s', animationDuration: '22s' }}>
          <svg className="w-9 h-6 text-amber-600/50 dark:text-amber-300/40 animate-wing-flap" viewBox="0 0 24 16" fill="currentColor" style={{ animationDelay: '0.2s' }}>
            <path d="M 0 12 C 6 4, 10 2, 12 8 C 14 2, 18 4, 24 12 C 18 10, 14 12, 12 16 C 10 12, 6 10, 0 12 Z" />
          </svg>
        </div>

        {/* Bird 4 */}
        <div className="absolute top-12 left-0 animate-fly-bird" style={{ animationDelay: '16s', animationDuration: '30s' }}>
          <svg className="w-5 h-3 text-emerald-700/40 dark:text-emerald-400/30 animate-wing-flap" viewBox="0 0 24 16" fill="currentColor" style={{ animationDelay: '0.6s' }}>
            <path d="M 0 12 C 6 4, 10 2, 12 8 C 14 2, 18 4, 24 12 C 18 10, 14 12, 12 16 C 10 12, 6 10, 0 12 Z" />
          </svg>
        </div>
      </div>

      {/* FLOATING CARDAMOM CAPSULES & LEAF PARTICLES */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute bottom-10 left-[15%] text-lg animate-float-cardamom" style={{ animationDelay: '0s' }}>
          🟢
        </div>
        <div className="absolute bottom-8 left-[45%] text-xl animate-float-cardamom" style={{ animationDelay: '2.5s' }}>
          🌿
        </div>
        <div className="absolute bottom-12 left-[75%] text-lg animate-float-cardamom" style={{ animationDelay: '4.8s' }}>
          🍃
        </div>
        <div className="absolute bottom-6 left-[85%] text-base animate-float-cardamom" style={{ animationDelay: '1.2s' }}>
          🟢
        </div>
      </div>

      {/* HIGH-RANGE WESTERN GHATS LANDSCAPE SILHOUETTE WITH ESTATE BUILDINGS & TREES */}
      <div className="w-full h-36 relative flex items-end justify-between border-b border-[#D7E6D5]/40 dark:border-[#1A402D]/40">
        
        {/* Background Misty Hills Layer */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-28 text-[#DDEFD9]/40 dark:text-[#0D261B]/40" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
          <path d="M 0 120 L 0 60 Q 150 10 350 45 T 750 30 T 1200 50 L 1200 120 Z" />
        </svg>

        {/* Foreground Plantation Layer */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-20 text-[#5C8D4E]/20 dark:text-[#1F5E3B]/30" viewBox="0 0 1200 80" preserveAspectRatio="none" fill="currentColor">
          <path d="M 0 80 L 0 35 Q 200 15 450 40 T 900 20 T 1200 30 L 1200 80 Z" />
        </svg>

        {/* LEFT ESTATE BUILDINGS & CURING BARN WITH SMOKE */}
        <div className="relative z-30 ml-6 sm:ml-12 flex items-end gap-2">
          {/* Curing House Building */}
          <div className="relative">
            {/* Rising Smoke Particles from Chimney */}
            <div className="absolute -top-6 left-3 space-y-1">
              <div className="w-2 h-2 rounded-full bg-slate-400/40 animate-rise-smoke" style={{ animationDelay: '0s' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300/30 animate-rise-smoke" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Curing Barn Silhouette SVG */}
            <svg className="w-24 h-16 text-[#17331F]/40 dark:text-emerald-900/40" viewBox="0 0 80 50" fill="currentColor">
              {/* Roof */}
              <polygon points="10,25 40,5 70,25" fill="#1F5E3B" />
              {/* Main Structure */}
              <rect x="15" y="25" width="50" height="25" rx="2" />
              {/* Door */}
              <rect x="33" y="33" width="14" height="17" fill="#C9A227" rx="1" />
              {/* Chimney */}
              <rect x="20" y="8" width="6" height="12" fill="#06150D" />
            </svg>
          </div>

          {/* Swaying Shade Trees (Silver Oak / Cedar) */}
          <div className="animate-sway-tree" style={{ animationDelay: '0s' }}>
            <svg className="w-14 h-24 text-[#1F5E3B]/50 dark:text-emerald-500/40" viewBox="0 0 40 80" fill="currentColor">
              {/* Trunk */}
              <rect x="18" y="45" width="4" height="35" fill="#3E2723" />
              {/* Foliage Canopy */}
              <circle cx="20" cy="25" r="18" fill="#1F5E3B" />
              <circle cx="12" cy="35" r="14" fill="#5C8D4E" />
              <circle cx="28" cy="35" r="14" fill="#2E7D4E" />
            </svg>
          </div>
        </div>

        {/* CENTER HIGH-ALTITUDE SPICE CANOPY & CARDAMOM BUSHES */}
        <div className="relative z-30 flex items-end gap-3 px-4">
          <div className="animate-sway-tree" style={{ animationDelay: '1.5s' }}>
            <svg className="w-16 h-28 text-[#5C8D4E]/40 dark:text-emerald-400/40" viewBox="0 0 50 90" fill="currentColor">
              <rect x="23" y="50" width="4" height="40" fill="#3E2723" />
              <polygon points="25,5 5,40 45,40" fill="#1F5E3B" />
              <polygon points="25,20 10,55 40,55" fill="#5C8D4E" />
            </svg>
          </div>

          {/* Cardamom Tiller Bush Silhouette */}
          <div className="animate-sway-tree" style={{ animationDelay: '3s' }}>
            <svg className="w-16 h-14 text-emerald-700/40 dark:text-emerald-300/40" viewBox="0 0 60 50" fill="currentColor">
              <path d="M 30 50 Q 10 30 5 10 Q 25 20 30 50 Z" />
              <path d="M 30 50 Q 20 20 30 0 Q 40 20 30 50 Z" />
              <path d="M 30 50 Q 50 30 55 10 Q 35 20 30 50 Z" />
            </svg>
          </div>
        </div>

        {/* RIGHT ESTATE PROCESSING CENTER & TALL PALMS */}
        <div className="relative z-30 mr-6 sm:mr-12 flex items-end gap-2">
          <div className="animate-sway-tree" style={{ animationDelay: '2.2s' }}>
            <svg className="w-12 h-24 text-emerald-800/40 dark:text-emerald-400/40" viewBox="0 0 40 80" fill="currentColor">
              <rect x="18" y="35" width="4" height="45" fill="#3E2723" />
              <circle cx="20" cy="20" r="16" fill="#1F5E3B" />
            </svg>
          </div>

          {/* Processing Shed Building */}
          <div>
            <svg className="w-20 h-14 text-[#17331F]/40 dark:text-emerald-950/40" viewBox="0 0 70 45" fill="currentColor">
              <polygon points="5,20 35,5 65,20" fill="#2E7D4E" />
              <rect x="10" y="20" width="50" height="25" rx="2" fill="#0D261B" />
              <rect x="25" y="27" width="20" height="18" fill="#D4AF37" rx="1" />
            </svg>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CardoraPlantationSkyline;
