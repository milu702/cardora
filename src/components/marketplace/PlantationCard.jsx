import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Award, CheckCircle, Video, Eye, Sparkles, MapPin, 
  TrendingUp, Thermometer, Droplets, ArrowUpRight, Download, Heart, Share2, FileText, User, Edit3, Camera
} from 'lucide-react';

const PlantationCard = ({ plot, onOpenDetail, onOpenContact, onEditPlot, onShare, lang }) => {
  const photoCount = plot.images ? plot.images.length : 1;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-[#2E7D32]/30 shadow-xl hover:shadow-2xl hover:border-[#66BB6A] transition-all flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={plot.images && plot.images.length > 0 ? plot.images[0] : plot.image}
          alt={plot.title}
          className="w-full h-full object-cover group-hover:scale-108 transition duration-700 filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Verification Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 z-10">
          <div className="flex flex-wrap gap-1.5">
            <span className="px-3 py-1.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-emerald-300 text-[10px] font-black tracking-wider flex items-center gap-1 border border-emerald-400/60 shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-[#66BB6A]" /> AI VERIFIED
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-lg border border-amber-300">
              <Award className="w-3.5 h-3.5 text-slate-950" /> PATTAYAM
            </span>
            {photoCount > 1 && (
              <span className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-black flex items-center gap-1 border border-emerald-400/40 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-emerald-400" /> {photoCount} Photos
              </span>
            )}
          </div>

          <button
            onClick={() => onShare && onShare(plot)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all"
            title="Share Plantation"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Badges overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-md text-[10px] font-bold flex items-center gap-1 border border-white/20">
              <Eye className="w-3 h-3 text-emerald-300" /> 360° Tour
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-md text-[10px] font-bold flex items-center gap-1 border border-white/20">
              <Video className="w-3 h-3 text-blue-300" /> Drone 4K
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[#66BB6A] text-slate-950 text-[10px] font-black">
            {plot.altitude || '1,100m'} MSL
          </span>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="p-5 space-y-4 flex-1">
        {/* Title & Location */}
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#2E7D32] dark:text-emerald-400 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{plot.location}</span>
          </div>
          <h3 className="text-lg font-black text-[#1B5E20] dark:text-white font-poppins leading-tight group-hover:text-[#2E7D32] transition-colors">
            {plot.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-300 font-medium mt-1 line-clamp-2">
            {plot.description || 'High-yielding cardamom plantation with automated pulse irrigation and shade canopy trees.'}
          </p>
        </div>

        {/* Key Agricultural Metrics */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800/80 border border-[#2E7D32]/20">
          <div>
            <span className="text-[10px] uppercase font-black text-gray-500 dark:text-slate-400 block">Area & Plants</span>
            <span className="text-xs font-black text-[#1B5E20] dark:text-emerald-300">{plot.area} • {plot.plants || '3,200 plants'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-gray-500 dark:text-slate-400 block">Expected Yield</span>
            <span className="text-xs font-black text-[#1B5E20] dark:text-emerald-300">{plot.yield || '450 kg/acre'}</span>
          </div>
        </div>

        {/* AI Health & AI Trust Progress Bar */}
        <div className="space-y-2">
          {/* AI Trust Score */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span className="text-[#1B5E20] dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#66BB6A]" /> AI Trust Engine Score
              </span>
              <span className="text-[#2E7D32] font-black font-poppins">{plot.trustScore || '98.4%'}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#66BB6A]"
                style={{ width: `${parseFloat(plot.trustScore) || 98}%` }}
              />
            </div>
          </div>

          {/* AI Health Score */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 dark:text-slate-300 mb-1">
              <span>Plantation Canopy Health</span>
              <span className="text-[#1B5E20] font-black">{plot.healthScore || '96%'} Healthy</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#66BB6A]"
                style={{ width: `${parseFloat(plot.healthScore) || 96}%` }}
              />
            </div>
          </div>
        </div>

        {/* Owner & Legal Status */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2E7D32]/15">
          <div className="flex items-center gap-2">
            <img
              src={plot.ownerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(plot.owner || 'Owner')}&background=1B5E20&color=ffffff`}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-[#1B5E20]"
            />
            <div>
              <p className="font-bold text-[#1B5E20] dark:text-white leading-none">{plot.owner || 'Verified Planter'}</p>
              <p className="text-[9px] text-gray-500 font-semibold">{plot.ownerRole || 'Pattayam Owner'}</p>
            </div>
          </div>

          <span className="text-xs font-black text-[#2E7D32] dark:text-emerald-300 font-poppins">
            ROI {plot.roi || '22%'}
          </span>
        </div>
      </div>

      {/* Footer Price & Action Bar */}
      <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-[#2E7D32]/10 mt-auto">
        <div>
          <span className="text-[10px] uppercase font-black text-gray-400 block">{lang === 'ml' ? 'ആകെ വില' : 'Valuation Price'}</span>
          <span className="text-base font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">{plot.price}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onEditPlot && (
            <button
              onClick={() => onEditPlot(plot)}
              className="px-3 py-2 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-xs hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-1 border border-amber-500/40"
              title="Edit Plantation Listing"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={() => onOpenDetail(plot)}
            className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1"
          >
            <span>{lang === 'ml' ? 'വിശദാംശങ്ങൾ' : 'Detail'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PlantationCard;
