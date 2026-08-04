import React, { useState } from 'react';
import { Database, Edit3 } from 'lucide-react';

const SoilTab = ({ plantation, onUpdateSoil }) => {
  const p = plantation;

  const [isEditing, setIsEditing] = useState(false);
  const [soilForm, setSoilForm] = useState({
    soilType: p.soil?.soilType || 'Loamy Forest Soil',
    ph: p.soil?.ph ?? p.soilPh ?? 6.2,
    nitrogen: p.soil?.npk?.n ?? p.npk?.n ?? 140,
    phosphorus: p.soil?.npk?.p ?? p.npk?.p ?? 45,
    potassium: p.soil?.npk?.k ?? p.npk?.k ?? 180,
    organicCarbon: p.soil?.organicCarbon ?? 1.8,
    moisture: p.soil?.moisture ?? p.moisture ?? 72,
  });

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateSoil({
      soil: {
        soilType: soilForm.soilType,
        ph: Number(soilForm.ph),
        npk: {
          n: Number(soilForm.nitrogen),
          p: Number(soilForm.phosphorus),
          k: Number(soilForm.potassium),
        },
        organicCarbon: Number(soilForm.organicCarbon),
        moisture: Number(soilForm.moisture),
      },
      soilPh: Number(soilForm.ph),
      moisture: Number(soilForm.moisture),
      npk: {
        n: Number(soilForm.nitrogen),
        p: Number(soilForm.phosphorus),
        k: Number(soilForm.potassium),
      }
    });
    setIsEditing(false);
  };

  const moisture = soilForm.moisture;
  const ph = soilForm.ph;
  const n = soilForm.nitrogen;
  const pVal = soilForm.phosphorus;
  const k = soilForm.potassium;
  const oc = soilForm.organicCarbon;


  return (
    <div className="space-y-6">
      
      {/* HEADER & EDIT ACTION */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
        <div>
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <Database className="w-5 h-5 text-[#5C8D4E]" />
            Soil Chemistry & Moisture Analytics
          </h3>
          <p className="text-xs text-[#4A5568] font-medium">
            Real-time NPK nutrients, pH balance, and soil organic carbon telemetry for {p.name}.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Update Soil Readings'}</span>
        </button>
      </div>

      {/* EDIT FORM MODAL INLINE */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-[#DDEFD9]/40 border border-[#5C8D4E]/50 space-y-4">
          <h4 className="text-xs font-extrabold text-[#1F5E3B] uppercase tracking-wider">Update Soil Telemetry Readings</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Moisture (%)</label>
              <input
                type="number"
                value={soilForm.moisture}
                onChange={(e) => setSoilForm({ ...soilForm, moisture: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Soil pH</label>
              <input
                type="number"
                step="0.1"
                value={soilForm.ph}
                onChange={(e) => setSoilForm({ ...soilForm, ph: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Nitrogen (N)</label>
              <input
                type="number"
                value={soilForm.nitrogen}
                onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Phosphorus (P)</label>
              <input
                type="number"
                value={soilForm.phosphorus}
                onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Potassium (K)</label>
              <input
                type="number"
                value={soilForm.potassium}
                onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Organic Carbon (%)</label>
              <input
                type="number"
                step="0.1"
                value={soilForm.organicCarbon}
                onChange={(e) => setSoilForm({ ...soilForm, organicCarbon: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div className="col-span-2 flex items-end justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F]"
              >
                Save New Readings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* CORE SOIL PARAMETERS METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-3.5 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft text-center">
          <span className="text-[10px] font-bold text-[#4A5568] uppercase">Soil Type</span>
          <span className="block text-xs font-black text-[#17331F] mt-1 truncate">{soilForm.soilType}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft text-center">
          <span className="text-[10px] font-bold text-[#4A5568] uppercase">Moisture Level</span>
          <span className="block text-lg font-black text-[#1F5E3B] mt-0.5">{moisture}%</span>
          <span className="text-[9px] font-bold text-[#5C8D4E]">Ideal (65-80%)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft text-center">
          <span className="text-[10px] font-bold text-[#4A5568] uppercase">Soil pH</span>
          <span className="block text-lg font-black text-[#17331F] mt-0.5">{ph}</span>
          <span className="text-[9px] font-bold text-emerald-600">Optimal Range</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft text-center">
          <span className="text-[10px] font-bold text-[#4A5568] uppercase">Nitrogen (N)</span>
          <span className="block text-lg font-black text-[#1F5E3B] mt-0.5">{n} kg/ha</span>
          <span className="text-[9px] font-bold text-gray-500">Target: 140</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft text-center">
          <span className="text-[10px] font-bold text-[#4A5568] uppercase">Phosphorus (P)</span>
          <span className="block text-lg font-black text-[#17331F] mt-0.5">{pVal} kg/ha</span>
          <span className="text-[9px] font-bold text-gray-500">Target: 45</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft text-center">
          <span className="text-[10px] font-bold text-[#4A5568] uppercase">Organic Carbon</span>
          <span className="block text-lg font-black text-[#1F5E3B] mt-0.5">{oc}%</span>
          <span className="text-[9px] font-bold text-[#5C8D4E]">K: {k} kg/ha</span>
        </div>


      </div>

      {/* VISUAL CHARTS & TREND BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* NPK NUTRIENT BREAKDOWN BARS */}
        <div className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft space-y-4">
          <h4 className="text-sm font-extrabold text-[#17331F] flex items-center justify-between">
            <span>NPK Primary Nutrients Balance</span>
            <span className="text-xs font-bold text-[#5C8D4E]">94% Optimal</span>
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#17331F] mb-1">
                <span>Nitrogen (N) - Vegetative Tiller Growth</span>
                <span>{n} / 160 kg/ha</span>
              </div>
              <div className="w-full bg-[#F8FAF7] h-2.5 rounded-full overflow-hidden border border-[#D7E6D5]">
                <div className="bg-[#1F5E3B] h-full rounded-full" style={{ width: `${Math.min(100, (n / 160) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#17331F] mb-1">
                <span>Phosphorus (P) - Root Development</span>
                <span>{pVal} / 50 kg/ha</span>
              </div>
              <div className="w-full bg-[#F8FAF7] h-2.5 rounded-full overflow-hidden border border-[#D7E6D5]">
                <div className="bg-[#5C8D4E] h-full rounded-full" style={{ width: `${Math.min(100, (pVal / 50) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#17331F] mb-1">
                <span>Potassium (K) - Capsule Density & Flavor</span>
                <span>{k} / 200 kg/ha</span>
              </div>
              <div className="w-full bg-[#F8FAF7] h-2.5 rounded-full overflow-hidden border border-[#D7E6D5]">
                <div className="bg-[#C9A227] h-full rounded-full" style={{ width: `${Math.min(100, (k / 200) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* MOISTURE & PH TREND BARS */}
        <div className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft space-y-4">
          <h4 className="text-sm font-extrabold text-[#17331F] flex items-center justify-between">
            <span>7-Day Soil Moisture History (%)</span>
            <span className="text-xs font-bold text-blue-600">IoT Synced</span>
          </h4>

          <div className="h-32 flex items-end justify-between gap-2 pt-4">
            {[
              { day: 'Mon', val: 68 },
              { day: 'Tue', val: 70 },
              { day: 'Wed', val: 74 },
              { day: 'Thu', val: 76 },
              { day: 'Fri', val: 71 },
              { day: 'Sat', val: 69 },
              { day: 'Today', val: moisture },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-extrabold text-[#1F5E3B]">{item.val}%</span>
                <div 
                  className="w-full bg-gradient-to-t from-[#1F5E3B] to-[#5C8D4E] rounded-t-lg transition-all"
                  style={{ height: `${(item.val / 100) * 80}px` }}
                />
                <span className="text-[10px] font-bold text-[#4A5568]">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SoilTab;
