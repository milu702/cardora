import React, { useState } from 'react';
import { 
  MapPin, Navigation, ShieldCheck, Activity, Droplets, 
  Search, ZoomIn, ZoomOut, Compass, User, X
} from 'lucide-react';

const PlantationMap = ({ mapPoints = [], onSelectPlantation }) => {
  const displayPoints = Array.isArray(mapPoints) ? mapPoints : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [mapMode, setMapMode] = useState('topo'); // 'topo' | 'satellite' | 'dark'
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter Points
  const filteredPoints = displayPoints.filter((p) => {
    const nameMatch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.owner || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.district || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const districtMatch = districtFilter === 'ALL' || (p.district || '').toLowerCase().includes(districtFilter.toLowerCase());
    
    const health = p.healthScore || 90;
    const healthMatch = healthFilter === 'ALL' ? true :
                        healthFilter === 'HEALTHY' ? health >= 80 :
                        healthFilter === 'MODERATE' ? (health >= 60 && health < 80) :
                        health < 60;

    return nameMatch && districtMatch && healthMatch;
  });

  const healthyCount = displayPoints.filter((p) => (p.healthScore || 90) >= 80).length;
  const moderateCount = displayPoints.filter((p) => (p.healthScore || 90) >= 60 && (p.healthScore || 90) < 80).length;
  const criticalCount = displayPoints.filter((p) => (p.healthScore || 90) < 60).length;

  // Extract unique districts
  const districtsList = Array.from(new Set(displayPoints.map((p) => p.district).filter(Boolean)));

  return (
    <div className="space-y-4 font-sans">
      
      {/* ===== 1. MAP COMMAND CONTROL HEADER ===== */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold shadow-inner shrink-0">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-black text-base text-[#1F2937] dark:text-white flex items-center gap-2">
              <span>GIS Plantation Command Center</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                ● Live GPS Active ({displayPoints.length})
              </span>
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">
              Geographic Information System tracking real cardamom estates across Western Ghats
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search estate, farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
            />
          </div>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Health</option>
            <option value="HEALTHY">🟢 Healthy (≥80%)</option>
            <option value="MODERATE">🟡 Moderate (60-79%)</option>
            <option value="CRITICAL">🔴 Critical (&lt;60%)</option>
          </select>

          {/* Map Layer Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMapMode('topo')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                mapMode === 'topo' ? 'bg-[#1F5E3B] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Topo
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                mapMode === 'satellite' ? 'bg-[#1F5E3B] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapMode('dark')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                mapMode === 'dark' ? 'bg-[#1F5E3B] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              GIS Matrix
            </button>
          </div>
        </div>

      </div>

      {/* ===== 2. INTERACTIVE GIS CANVAS MAP DISPLAY ===== */}
      <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-800 p-6 flex flex-col justify-between shadow-2xl min-h-[460px] transition-all ${
        mapMode === 'satellite'
          ? 'bg-gradient-to-b from-slate-950 via-emerald-950/80 to-slate-950'
          : mapMode === 'dark'
          ? 'bg-slate-950'
          : 'bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950'
      }`}>

        {/* TOP COMPASS & STATUS OVERLAY BAR */}
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-300 pb-3 border-b border-slate-800/80 z-10">
          <span className="flex items-center gap-2">
            <Navigation size={16} className="text-emerald-400 animate-pulse" />
            <span>Western Ghats Cardamom Belt (Idukki, Wayanad & Kerala Districts)</span>
          </span>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800 text-slate-300">
              <button onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.6))} className="p-1 hover:text-emerald-400">
                <ZoomIn size={14} />
              </button>
              <span className="text-[10px] font-bold px-1">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))} className="p-1 hover:text-emerald-400">
                <ZoomOut size={14} />
              </button>
            </div>

            <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 text-[11px] font-bold">
              <ShieldCheck size={13} /> Live GIS Gateway
            </span>
          </div>
        </div>

        {/* GIS GRID CANVAS WITH MAP PINS */}
        <div className="relative my-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6 min-h-[320px] overflow-hidden flex flex-col justify-between">
          
          {/* Topographic Lines & Coordinate Grid Simulation */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          
          <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-500/60 pointer-events-none">
            LAT: 9.500°N - 10.200°N | LON: 76.800°E - 77.400°E
          </div>
          
          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-emerald-500/60 pointer-events-none">
            ELEVATION: 850m - 1450m MSL
          </div>

          {/* INTERACTIVE MARKERS GRID CONTAINER */}
          <div className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-2 max-h-[340px] overflow-y-auto pr-1">
            {filteredPoints.length === 0 ? (
              <div className="col-span-full text-center py-12 space-y-2">
                <MapPin size={32} className="text-slate-600 mx-auto" />
                <p className="text-xs font-extrabold text-slate-300">No plantations found matching filters</p>
                <p className="text-[11px] text-slate-500">Try adjusting your search query or district selection.</p>
              </div>
            ) : (
              filteredPoints.map((p) => {
                const health = p.healthScore || 92;
                const isSelected = selectedPoint && (selectedPoint.id === p.id || selectedPoint._id === p._id);
                
                const badgeBg =
                  health >= 80
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : health >= 60
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                const dotColor =
                  health >= 80 ? 'bg-emerald-400' : health >= 60 ? 'bg-amber-400' : 'bg-rose-500';

                return (
                  <div
                    key={p.id || p._id}
                    onClick={() => {
                      setSelectedPoint(p);
                      if (onSelectPlantation) onSelectPlantation(p);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/40 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Top Row: Status Pin Dot & Health Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${dotColor}`} />
                        </span>
                        <span className="text-[11px] font-black text-white font-poppins truncate max-w-[140px]">
                          {p.name}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeBg}`}>
                        {health}% Health
                      </span>
                    </div>

                    {/* Middle Info */}
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span>Owner: <strong className="text-white">{p.owner || p.user?.name || 'Farmer'}</strong></span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                        <MapPin size={12} className="text-emerald-400" />
                        <span>{p.district || p.location || 'Idukki'} • {p.area || '5.0 Acres'}</span>
                      </p>
                    </div>

                    {/* Bottom Telemetry Bar */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Droplets size={12} /> Moisture: {p.moisture || 74}%
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        📍 {p.lat ? Number(p.lat).toFixed(3) : '9.850'}°N, {p.lng ? Number(p.lng).toFixed(3) : '77.102'}°E
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SELECTED POINT POPUP MODAL DETAILS */}
        {selectedPoint && (
          <div className="my-2 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600/60 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>{selectedPoint.name}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                    {selectedPoint.healthScore || 90}% Optimal
                  </span>
                </h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  Farmer: <strong className="text-white">{selectedPoint.owner}</strong> • Location: <strong>{selectedPoint.district}</strong> • Area: <strong>{selectedPoint.area}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setSelectedPoint(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* FOOTER SUMMARY & LEGEND */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 gap-2 font-medium">
          <span className="flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" />
            <span>Telemetry Nodes Synced Across Western Ghats Cardamom Belt</span>
          </span>

          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Healthy ({healthyCount})
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Moderate ({moderateCount})
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Critical ({criticalCount})
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PlantationMap;
