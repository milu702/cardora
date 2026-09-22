import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Leaf, Thermometer, Droplets, Users, 
  Sparkles, CloudSun, Eye, Edit3, Trash2, ShieldCheck
} from 'lucide-react';

const PlantationCard = ({ plantation, onViewDetails, onEdit, onDelete }) => {
  const p = plantation;

  // Extract metrics safely
  const name = p.name || 'Cardamom Plantation';
  const district = p.district || p.location || 'Idukki, Kerala';
  const village = p.village || 'Vandanmedu';
  const variety = p.variety || 'Njallani';
  const area = p.area || 5.0;
  const altitude = p.altitude || 950;
  const moisture = p.soil?.moisture ?? p.moisture ?? 72;
  const ph = p.soil?.ph ?? p.soilPh ?? 6.2;
  const temp = p.weather?.temp || '23°C';
  const humidity = p.weather?.humidity || '78%';
  const healthScore = p.healthScore ?? p.health ?? 92;
  const workersPresent = p.workers?.presentToday ?? 8;
  const totalWorkers = p.workers?.totalWorkers ?? 10;
  const lastUpdated = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today';
  const fallbackImage = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80';
  const rawImage = p.image || (p.images && p.images[0]);
  const image = (rawImage && rawImage.length > 5) ? rawImage : fallbackImage;

  const isIdealRegion = district.toLowerCase().includes('idukki') || district.toLowerCase().includes('wayanad');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: '0 25px 45px rgba(31,94,59,0.16)' }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-2xl transition-all group font-sans"
    >
      {/* CARD IMAGE & HEADER BADGES */}
      <div className="relative h-52 overflow-hidden bg-[#0A2315]">
        <img 
          src={image} 
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Variety & Health Score Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-emerald-400/40 text-emerald-200 text-xs font-black shadow-md">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            {variety} Variety
          </span>
          {isIdealRegion ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1F5E3B]/90 backdrop-blur-md text-white text-[11px] font-black shadow-md border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Prime Region
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-black shadow-md">
              Unsuitable Region
            </span>
          )}
        </div>

        {/* Health Score Circular Badge */}
        <div className="absolute top-3.5 right-3.5 flex items-center justify-center w-12 h-12 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 shadow-xl">
          <div className="text-center">
            <span className="block text-xs font-black text-[#1F5E3B] dark:text-emerald-400 leading-none">{healthScore}%</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Health</span>
          </div>
        </div>

        {/* Plantation Title & Location Overlay */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
          <h3 className="text-xl font-black font-poppins text-white leading-tight drop-shadow-md truncate group-hover:text-emerald-300 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-emerald-200 font-bold flex items-center gap-1 mt-0.5 opacity-90 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{village}, {district}</span>
          </p>
        </div>
      </div>

      {/* CARD BODY - METRICS GRID */}
      <div className="p-4 space-y-4">
        
        {/* Core Quick Metrics */}
        <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] text-center">
          <div>
            <span className="block text-[10px] font-bold text-[#4A5568]">Area</span>
            <span className="text-xs font-black text-[#17331F]">{area} Ac</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-[#4A5568]">Altitude</span>
            <span className="text-xs font-black text-[#17331F]">{altitude}m</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-[#4A5568]">Moisture</span>
            <span className="text-xs font-black text-[#1F5E3B]">{moisture}%</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-[#4A5568]">Soil pH</span>
            <span className="text-xs font-black text-[#17331F]">{ph}</span>
          </div>
        </div>

        {/* Micro-Climate & Telemetry Row */}
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-[#4A5568]">
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-[#D7E6D5]">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-[#17331F]">{temp}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-[#D7E6D5]">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-bold text-[#17331F]">{humidity}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-[#D7E6D5]">
            <Users className="w-3.5 h-3.5 text-[#1F5E3B]" />
            <span className="font-bold text-[#17331F]">{workersPresent}/{totalWorkers}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A5568]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C9A227]" />
              AI Status:
            </span>
            <span className="font-bold text-[#1F5E3B] truncate max-w-[170px]">{p.aiStatus || 'Optimal Drip Irrigation'}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A5568]">
            <span className="flex items-center gap-1">
              <CloudSun className="w-3 h-3 text-[#5C8D4E]" />
              Weather:
            </span>
            <span className="font-bold text-[#17331F] truncate max-w-[170px]">{p.weatherStatus || 'Humid Breeze'}</span>
          </div>
        </div>
      </div>

      {/* CARD FOOTER & ACTION BUTTONS */}
      <div className="px-4 py-3 bg-[#F8FAF7] border-t border-[#D7E6D5] flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#4A5568]">Updated {lastUpdated}</span>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(p)}
              className="p-1.5 text-[#4A5568] hover:text-[#1F5E3B] hover:bg-[#DDEFD9] rounded-lg transition-colors"
              title="Edit Plantation"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(p._id || p.id)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Plantation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onViewDetails(p)}
            className="px-3.5 py-1.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F] transition-all flex items-center gap-1 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PlantationCard;
