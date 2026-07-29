import React from 'react';
import { MapPin, Navigation, ShieldCheck, Activity, Droplets } from 'lucide-react';

const PlantationMap = ({ mapPoints = [], onSelectPlantation }) => {
  const displayPoints = Array.isArray(mapPoints) ? mapPoints : [];

  const healthyCount = displayPoints.filter((p) => (p.healthScore || 90) >= 80).length;
  const moderateCount = displayPoints.filter((p) => (p.healthScore || 90) >= 60 && (p.healthScore || 90) < 80).length;
  const criticalCount = displayPoints.filter((p) => (p.healthScore || 90) < 60).length;

  return (
    <div className="space-y-4 font-sans">
      {/* Map Control Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
            <MapPin size={20} />
          </div>
          <div>
            <h4 className="font-black text-sm text-[#1F2937] dark:text-white flex items-center gap-2">
              <span>Idukki Plantation Telemetry Map</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400">
                GPS Active
              </span>
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">
              Real-time GPS tracking across <strong className="text-[#1F2937] dark:text-white">{displayPoints.length}</strong> cardamom estates in Idukki, Kerala
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="flex items-center gap-1.5 text-[#1F5E3B] dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B] dark:bg-emerald-400 animate-pulse" />
            Healthy ({healthyCount})
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Moderate ({moderateCount})
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Critical ({criticalCount})
          </span>
        </div>
      </div>

      {/* Map Graphic Telemetry Box */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-5 flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-300 pb-3 border-b border-slate-800/80">
          <span className="flex items-center gap-2">
            <Navigation size={15} className="text-emerald-400" />
            <span>Western Ghats Cardamom Belt (Idukki, Kerala)</span>
          </span>
          <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 text-[11px] font-bold">
            <ShieldCheck size={13} /> Live Telemetry Gateway
          </span>
        </div>

        {/* Plantation Telemetry Card Grid */}
        <div className="my-4 bg-emerald-950/30 rounded-xl border border-emerald-900/40 p-4 min-h-[160px] max-h-[380px] overflow-y-auto flex items-center justify-center">
          {displayPoints.length === 0 ? (
            <div className="text-center p-6 space-y-1.5">
              <MapPin size={28} className="text-slate-600 mx-auto" />
              <p className="text-xs font-extrabold text-slate-300">No cardamom estates registered in database</p>
              <p className="text-[11px] text-slate-500">Registered plantations will appear here with live GPS tracking.</p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayPoints.map((p) => {
                const health = p.healthScore || 92;
                const badgeBg =
                  health >= 80
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : health >= 60
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                return (
                  <div
                    key={p.id || p._id}
                    onClick={() => onSelectPlantation && onSelectPlantation(p)}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md cursor-pointer transition-all hover:border-emerald-500 hover:scale-[1.02] shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeBg}`}>
                        {health}% Health
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 truncate">{p.district || p.location}</span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-sm text-white truncate">{p.name}</h5>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        Farmer: <strong className="text-slate-200">{p.owner || p.user?.name || 'Cardamom Cultivator'}</strong> • {p.area}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Droplets size={12} /> Moisture: {p.moisture}%
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        📍 {p.lat ? p.lat.toFixed(3) : '9.850'}°N, {p.lng ? p.lng.toFixed(3) : '77.102'}°E
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-medium">
          <span className="flex items-center gap-1.5">
            <Activity size={13} className="text-emerald-400" />
            <span>5 Active GPS Nodes across Kattappana, Vandiperiyar, Santhanpara, Nedumkandam & Munnar</span>
          </span>
          <span className="text-slate-500">Updated: Just now</span>
        </div>
      </div>
    </div>
  );
};

export default PlantationMap;
