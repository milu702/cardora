import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mic, Image, MapPin, SlidersHorizontal, Sparkles, X, Check, 
  ChevronDown, DollarSign, Layers, ShieldCheck, Mountain, Droplets, Thermometer, TreePine, Map 
} from 'lucide-react';
import { KERALA_DISTRICTS } from '../../utils/districts';

const SmartSearchAndFilter = ({ 
  lang, 
  searchQuery, 
  setSearchQuery, 
  selectedDistrict, 
  setSelectedDistrict, 
  filters, 
  setFilters,
  onOpenVoiceAi 
}) => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState('text'); // 'text' | 'image' | 'map'

  const searchSuggestions = [
    { label: lang === 'ml' ? '5 ഏക്കർ തോട്ടം' : '5 acre plantation', query: '5 acre' },
    { label: lang === 'ml' ? 'കൂടിയ വിളവ് നല്കുന്നവ' : 'High yield plot', query: 'High yield' },
    { label: lang === 'ml' ? 'ഓർഗാനിക് തോട്ടം' : 'Organic plantation', query: 'Organic' },
    { label: lang === 'ml' ? 'ഇടുക്കി ജില്ല' : 'Idukki District', query: 'Idukki' },
    { label: lang === 'ml' ? 'ബജറ്റ് 40 ലക്ഷം' : 'Budget 40 Lakhs', query: '40 Lakhs' },
    { label: lang === 'ml' ? 'പാട്ടത്തിന് (Lease)' : 'Lease plots', query: 'Lease' },
    { label: lang === 'ml' ? 'വില്പനയ്ക്ക് (Buy)' : 'Buy plots', query: 'Buy' },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      budgetMax: 20000000,
      minArea: 1,
      minAltitude: 800,
      minPh: 5.5,
      maxPh: 7.0,
      organicOnly: false,
      irrigationType: 'all',
      waterSource: 'all',
      diseaseHistory: 'none',
      aiTrustScoreMin: 90,
      verifiedSeller: true,
      roadAccess: true,
      nearbyHospital: false,
      nearbyMarket: false,
      listingType: 'all',
    });
    setSelectedDistrict('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search Container Box */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-[#2E7D32]/30 shadow-xl space-y-4">
        
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#2E7D32]/15">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSearchTab('text')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'text'
                  ? 'bg-[#1B5E20] text-white shadow-md'
                  : 'bg-[#F8FFF8] dark:bg-slate-800 text-[#1B5E20] dark:text-emerald-400 hover:bg-[#66BB6A]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ml' ? 'എഐ സേർച്ച്' : 'AI Smart Search'}</span>
            </button>

            <button
              onClick={() => setActiveSearchTab('image')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'image'
                  ? 'bg-[#1B5E20] text-white shadow-md'
                  : 'bg-[#F8FFF8] dark:bg-slate-800 text-[#1B5E20] dark:text-emerald-400 hover:bg-[#66BB6A]/20'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>{lang === 'ml' ? 'ഇമേജ് സേർച്ച്' : 'Visual Search'}</span>
            </button>

            <button
              onClick={() => setActiveSearchTab('map')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSearchTab === 'map'
                  ? 'bg-[#1B5E20] text-white shadow-md'
                  : 'bg-[#F8FFF8] dark:bg-slate-800 text-[#1B5E20] dark:text-emerald-400 hover:bg-[#66BB6A]/20'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{lang === 'ml' ? 'റേഡിയസ് സേർച്ച്' : 'Map Radius Search'}</span>
            </button>
          </div>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-[#1B5E20] dark:text-emerald-400 font-bold text-xs hover:bg-[#66BB6A]/20 transition-all flex items-center gap-2 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#2E7D32]" />
            <span>{lang === 'ml' ? 'എഐ ഫിൽട്ടറുകൾ' : 'AI Filter Panel'}</span>
            <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white text-[10px] flex items-center justify-center font-bold">
              !
            </span>
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[#2E7D32]">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ml'
                ? "എന്തും തിരയുക... ഉദാ: 'ഇടുക്കിയിലെ 5 ഏക്കർ ഏലത്തോട്ടം 40 ലക്ഷത്തിൽ താഴെ'"
                : "Ask AI Search... e.g. '5 acre organic plantation in Idukki under 40 Lakhs'"
            }
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800/80 border border-[#2E7D32]/30 text-sm font-bold text-[#1B5E20] dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] transition-all shadow-inner"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {/* Voice Input Button */}
            <button
              onClick={onOpenVoiceAi}
              className="p-2 rounded-xl bg-[#1B5E20] text-white hover:bg-[#2E7D32] transition-all shadow-md"
              title="Voice Search"
            >
              <Mic className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        </div>

        {/* AI Quick Suggestions Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-black text-[#1B5E20] dark:text-emerald-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-[#66BB6A]" />
            {lang === 'ml' ? 'നിർദ്ദേശങ്ങൾ:' : 'AI Suggestions:'}
          </span>
          {searchSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(s.query)}
              className="px-3 py-1 rounded-full bg-[#F8FFF8] dark:bg-slate-800 text-[#1B5E20] dark:text-emerald-300 text-xs font-bold hover:bg-[#66BB6A]/30 border border-[#66BB6A]/30 flex-shrink-0 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating AI Filter Drawer Modal */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto p-6 space-y-6 border-l border-[#2E7D32]/30"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2E7D32]/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#1B5E20] text-white">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">
                      {lang === 'ml' ? 'എഐ ഫിൽട്ടർ പാനൽ' : 'AI Intelligence Filter Panel'}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500">
                      {lang === 'ml' ? 'കൃത്യമായ തോട്ടങ്ങൾ മാത്രം കണ്ടെത്തൂ' : 'Refine search parameters with AI trust indicators'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* District & Location */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#1B5E20] dark:text-emerald-400 block">
                  {lang === 'ml' ? 'ജില്ല' : 'District Location'}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-slate-100"
                >
                  <option value="All">{lang === 'ml' ? 'എല്ലാ ജില്ലകളും' : 'All Kerala Districts'}</option>
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Listing Type (Buy / Lease) */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#1B5E20] dark:text-emerald-400 block">
                  {lang === 'ml' ? 'വിഭാഗം' : 'Listing Category'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'sale', 'lease'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('listingType', type)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        filters.listingType === type
                          ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                          : 'bg-[#F8FFF8] dark:bg-slate-800 text-[#1B5E20] dark:text-slate-200 border-[#2E7D32]/20'
                      }`}
                    >
                      {type === 'all' ? (lang === 'ml' ? 'എല്ലാം' : 'All') : type === 'sale' ? (lang === 'ml' ? 'വില്പന' : 'For Sale') : (lang === 'ml' ? 'പാട്ടം' : 'For Lease')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maximum Budget Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="uppercase text-[#1B5E20] dark:text-emerald-400">{lang === 'ml' ? 'പരമാവധി ബജറ്റ്' : 'Max Budget'}</span>
                  <span className="text-[#2E7D32] dark:text-emerald-300 font-poppins">₹{(filters.budgetMax / 100000).toFixed(1)} Lakhs</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="50000000"
                  step="500000"
                  value={filters.budgetMax}
                  onChange={(e) => handleFilterChange('budgetMax', Number(e.target.value))}
                  className="w-full accent-[#1B5E20]"
                />
              </div>

              {/* Minimum Area Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="uppercase text-[#1B5E20] dark:text-emerald-400">{lang === 'ml' ? 'കുറഞ്ഞ ഏരിയ (Acres)' : 'Min Plot Area'}</span>
                  <span className="text-[#2E7D32] dark:text-emerald-300 font-poppins">{filters.minArea} Acres</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange('minArea', Number(e.target.value))}
                  className="w-full accent-[#1B5E20]"
                />
              </div>

              {/* Minimum Altitude (MSL) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="uppercase text-[#1B5E20] dark:text-emerald-400">{lang === 'ml' ? 'ഉയരം (Altitude)' : 'Min Altitude'}</span>
                  <span className="text-[#2E7D32] dark:text-emerald-300 font-poppins">{filters.minAltitude} m MSL</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1800"
                  step="50"
                  value={filters.minAltitude}
                  onChange={(e) => handleFilterChange('minAltitude', Number(e.target.value))}
                  className="w-full accent-[#1B5E20]"
                />
              </div>

              {/* AI Trust Score Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="uppercase text-[#1B5E20] dark:text-emerald-400">{lang === 'ml' ? 'എഐ ട്രസ്റ്റ് സ്കോർ' : 'Min AI Trust Score'}</span>
                  <span className="text-[#66BB6A] font-poppins">{filters.aiTrustScoreMin}% Verified</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="99"
                  step="1"
                  value={filters.aiTrustScoreMin}
                  onChange={(e) => handleFilterChange('aiTrustScoreMin', Number(e.target.value))}
                  className="w-full accent-[#2E7D32]"
                />
              </div>

              {/* Checkbox Features */}
              <div className="space-y-3 pt-3 border-t border-[#2E7D32]/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.organicOnly}
                    onChange={(e) => handleFilterChange('organicOnly', e.target.checked)}
                    className="w-4 h-4 accent-[#1B5E20] rounded"
                  />
                  <span className="text-xs font-bold text-[#1B5E20] dark:text-slate-200">
                    {lang === 'ml' ? 'ഓർഗാനിക് സർട്ടിഫൈഡ് മാത്രം' : 'Organic Certified Only'}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verifiedSeller}
                    onChange={(e) => handleFilterChange('verifiedSeller', e.target.checked)}
                    className="w-4 h-4 accent-[#1B5E20] rounded"
                  />
                  <span className="text-xs font-bold text-[#1B5E20] dark:text-slate-200">
                    {lang === 'ml' ? 'ഗവ. പട്ടയം & എഐ വെരിഫൈഡ് ഉടമകൾ' : 'Govt Pattayam & Verified Owners'}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.roadAccess}
                    onChange={(e) => handleFilterChange('roadAccess', e.target.checked)}
                    className="w-4 h-4 accent-[#1B5E20] rounded"
                  />
                  <span className="text-xs font-bold text-[#1B5E20] dark:text-slate-200">
                    {lang === 'ml' ? 'വാഹന റോഡ് ആക്സസ്സ് ഉള്ളവ' : 'Direct Lorry / Pickup Road Access'}
                  </span>
                </label>
              </div>

              {/* Drawer Footer Buttons */}
              <div className="pt-6 border-t border-[#2E7D32]/20 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-xs text-gray-600 hover:bg-gray-100"
                >
                  {lang === 'ml' ? 'റീസെറ്റ് ചെയ്യുക' : 'Reset All'}
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#1B5E20] text-white font-bold text-xs shadow-md hover:bg-[#2E7D32]"
                >
                  {lang === 'ml' ? 'ഫലങ്ങൾ കാണിക്കുക' : 'Apply Filters'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchAndFilter;
