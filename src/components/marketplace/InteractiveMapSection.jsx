import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Layers, CloudRain, Mountain, Trees, ShieldCheck, Eye, 
  MapPin, X, ArrowUpRight, CheckCircle2, Sparkles, Navigation 
} from 'lucide-react';

const InteractiveMapSection = ({ plots = [], selectedPlot, setSelectedPlot, onOpenDetail, lang }) => {
  const [activeLayer, setActiveLayer] = useState('satellite'); // 'satellite' | 'topographic' | 'rainfall' | 'forest'
  const [showBoundaries, setShowBoundaries] = useState(true);

  return (
    <div className="rounded-3xl overflow-hidden bg-slate-900 border-2 border-[#2E7D32]/40 shadow-2xl relative mb-12">
      {/* Map Control Header Bar */}
      <div className="bg-slate-950/80 backdrop-blur-xl p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 z-20 relative">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#1B5E20] text-white">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-poppins flex items-center gap-2">
              {lang === 'ml' ? 'ഇന്ററാക്ടീവ് ഹൈ-റെസല്യൂഷൻ സാറ്റലൈറ്റ് മാപ്പ്' : 'Google Satellite & Geo-Fenced Layer Map'}
              <span className="px-2 py-0.5 rounded-full bg-[#66BB6A]/20 text-[#66BB6A] text-[10px] font-bold">
                LIVE SATELLITE 4K
              </span>
            </h3>
            <p className="text-[10px] text-emerald-200/80 font-medium">
              {lang === 'ml' ? 'തോട്ടത്തിന്റെ അതിരുകളും സമീപത്തുള്ള റോഡുകളും കാണുക' : 'Interactive plot boundaries, rainfall heatmaps & altitude MSL layers'}
            </p>
          </div>
        </div>

        {/* Layer Switches */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'satellite', label: lang === 'ml' ? 'സാറ്റലൈറ്റ്' : 'Satellite', icon: Map },
            { id: 'topographic', label: lang === 'ml' ? 'ടോപ്പോ' : 'Topo MSL', icon: Mountain },
            { id: 'rainfall', label: lang === 'ml' ? 'മഴ മാപ്പ്' : 'Rainfall', icon: CloudRain },
            { id: 'forest', label: lang === 'ml' ? 'ഫോറസ്റ്റ്' : 'Forest Cover', icon: Trees },
          ].map((layer) => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  activeLayer === layer.id
                    ? 'bg-[#1B5E20] text-white border-[#66BB6A] shadow-md'
                    : 'bg-white/10 text-emerald-100 border-white/10 hover:bg-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showBoundaries
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-white/10 text-gray-400 border-white/10'
            }`}
          >
            {showBoundaries ? 'Polygons On' : 'Polygons Off'}
          </button>
        </div>
      </div>

      {/* Simulated Interactive Canvas */}
      <div className="relative h-[420px] sm:h-[480px] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* Layer Background Simulation */}
        <img
          src={
            activeLayer === 'satellite'
              ? 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1600'
              : activeLayer === 'topographic'
              ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600'
              : activeLayer === 'rainfall'
              ? 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80&w=1600'
              : 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1600'
          }
          alt="Satellite Canvas"
          className="w-full h-full object-cover opacity-80 transition-all duration-700 filter brightness-90"
        />

        {/* Heatmap Gradient Overlay when Rainfall layer active */}
        {activeLayer === 'rainfall' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-indigo-500/20 to-teal-400/30 mix-blend-overlay pointer-events-none" />
        )}

        {/* Map Grid SVG Lines & Boundary Polygons */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {showBoundaries &&
            plots.map((plot, idx) => {
              const coords = [
                { x: 18 + (idx * 22) % 60, y: 25 + (idx * 18) % 50 },
                { x: 28 + (idx * 22) % 60, y: 20 + (idx * 18) % 50 },
                { x: 32 + (idx * 22) % 60, y: 40 + (idx * 18) % 50 },
                { x: 20 + (idx * 22) % 60, y: 42 + (idx * 18) % 50 },
              ];
              const pointsStr = coords.map((c) => `${c.x}%,${c.y}%`).join(' ');
              return (
                <polygon
                  key={plot.id}
                  points={pointsStr}
                  fill="rgba(102, 187, 106, 0.25)"
                  stroke="#66BB6A"
                  strokeWidth="2"
                  strokeDasharray="4"
                  className="animate-pulse"
                />
              );
            })}
        </svg>

        {/* Interactive Plantation Markers / Pins */}
        {plots.map((plot, idx) => {
          const topPos = `${25 + (idx * 16) % 55}%`;
          const leftPos = `${20 + (idx * 22) % 65}%`;
          const isSelected = selectedPlot?.id === plot.id;

          return (
            <motion.button
              key={plot.id}
              onClick={() => setSelectedPlot(plot)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{ top: topPos, left: leftPos }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
            >
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-[#66BB6A] opacity-50 blur-md animate-ping" />
                <div
                  className={`relative p-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border-2 transition-all ${
                    isSelected
                      ? 'bg-[#1B5E20] text-white border-[#66BB6A] scale-110'
                      : 'bg-slate-900/90 text-emerald-300 border-white/40 hover:bg-[#1B5E20]'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-[#66BB6A]" />
                  <span className="text-xs font-black font-poppins pr-1">{plot.title.split(' ')[0]}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#66BB6A] text-slate-950 text-[10px] font-black">
                    {plot.price}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Quick Map Preview Card Overlay */}
        <AnimatePresence>
          {selectedPlot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-30 w-full sm:w-96 p-4 rounded-2xl bg-slate-950/95 border border-[#66BB6A]/40 backdrop-blur-2xl text-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-[#1B5E20] text-[#66BB6A] text-[9px] font-black uppercase tracking-wider border border-[#66BB6A]/30 inline-block mb-1">
                    AI VERIFIED • {selectedPlot.trustScore || '98%'} TRUST
                  </span>
                  <h4 className="text-sm font-black font-poppins text-white">{selectedPlot.title}</h4>
                  <p className="text-[11px] text-emerald-200">{selectedPlot.location} • {selectedPlot.area}</p>
                </div>
                <button
                  onClick={() => setSelectedPlot(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-white/5 text-[10px]">
                <div>
                  <span className="text-gray-400 block">Expected Yield</span>
                  <span className="font-bold text-emerald-300">{selectedPlot.yield || '450 kg/acre'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Expected ROI</span>
                  <span className="font-bold text-amber-300">{selectedPlot.roi || '24% Annual'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-black text-[#66BB6A] font-poppins">{selectedPlot.price}</span>
                <button
                  onClick={() => onOpenDetail(selectedPlot)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] border border-[#66BB6A]/40 text-white font-black text-xs hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <span>{lang === 'ml' ? 'വിശദാംശങ്ങൾ കാണുക' : 'Explore Luxury Detail'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InteractiveMapSection;
