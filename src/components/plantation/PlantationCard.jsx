import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Leaf, Thermometer, Droplets, Gauge, Users, 
  Sparkles, CloudSun, Eye, Edit3, Trash2, ShieldCheck, Activity, Layers, Mountain
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
  const image = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80';

  const isIdealRegion = district.toLowerCase().includes('idukki') || district.toLowerCase().includes('wayanad');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(31,94,59,0.12)' }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-[20px] border border-[#D7E6D5] overflow-hidden flex flex-col justify-between shadow-soft group"
    >
      {/* CARD IMAGE & HEADER BADGES */}
      <div className="relative h-48 overflow-hidden bg-[#17331F]">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Variety & Health Score Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17331F]/90 backdrop-blur-md border border-[#5C8D4E]/50 text-[#DDEFD9] text-xs font-bold shadow-sm">
            <Leaf className="w-3.5 h-3.5 text-[#5C8D4E]" />
            {variety} Variety
          </span>
          {isIdealRegion ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1F5E3B]/90 backdrop-blur-md text-white text-[11px] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#C9A227]" />
              Prime Region
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-bold">
              Unsuitable Region
            </span>
          )}
        </div>

        {/* Health Score Circular Badge */}
        <div className="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D7E6D5] shadow-md">
          <div className="text-center">
            <span className="block text-xs font-black text-[#1F5E3B] leading-none">{healthScore}%</span>
            <span className="text-[8px] font-extrabold text-[#4A5568] uppercase">Health</span>
          </div>
        </div>

        {/* Plantation Title & Location Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-black font-poppins text-white leading-tight drop-shadow-md truncate">
            {name}
          </h3>
          <p className="text-xs text-[#DDEFD9] font-medium flex items-center gap-1 mt-0.5 opacity-90 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#C9A227] flex-shrink-0" />
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
