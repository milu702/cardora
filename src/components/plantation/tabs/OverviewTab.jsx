import React from 'react';
import {
  MapPin, Leaf, Calendar, Droplets, Database, Activity,
  Sparkles, CheckCircle2, ShieldCheck, Mountain, Users, ArrowUpRight
} from 'lucide-react';

const OverviewTab = ({ plantation, onSwitchTab }) => {
  const p = plantation;

  const moisture = p.soil?.moisture ?? p.moisture ?? 72;
  const ph = p.soil?.ph ?? p.soilPh ?? 6.2;
  const area = p.area || 5.0;
  const altitude = p.altitude || 950;
  const variety = p.variety || 'Njallani';
  const plantsCount = p.plantsCount || 1750;
  const plantAge = p.plantAge || '3.5 Years';
  const healthScore = p.healthScore ?? p.health ?? 92;
  const workersPresent = p.workers?.presentToday ?? 8;
  const totalWorkers = p.workers?.totalWorkers ?? 10;
  const district = p.district || p.location || 'Idukki, Kerala';

  // Key Upcoming Dates
  const nextIrrigationDate = 'Today, 04:30 PM (Drip)';
  const nextFertilizerDate = '12 Aug 2026 (Organic NPK)';
  const nextHarvestDate = '15 Sep 2026 (Capsule Harvest)';

  const isIdeal = district.toLowerCase().includes('idukki') || district.toLowerCase().includes('wayanad');

  return (
    <div className="space-y-6">

      {/* 1. OVERVIEW HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4A5568]">Health Index</span>
            <Activity className="w-4 h-4 text-[#1F5E3B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#17331F] font-poppins">{healthScore}%</span>
            <span className="text-xs font-extrabold text-[#5C8D4E]">Excellent</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#1F5E3B] h-full rounded-full" style={{ width: `${healthScore}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4A5568]">Total Crop Yield Area</span>
            <Leaf className="w-4 h-4 text-[#5C8D4E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#17331F] font-poppins">{area} Acres</span>
            <span className="text-xs font-bold text-[#4A5568]">{plantsCount} Plants</span>
          </div>
          <p className="text-[11px] text-[#5C8D4E] font-bold mt-1">{variety} Variety • {plantAge}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4A5568]">Soil Moisture</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1F5E3B] font-poppins">{moisture}%</span>
            <span className="text-xs font-bold text-blue-600">pH {ph}</span>
          </div>
          <p className="text-[11px] text-[#4A5568] font-medium mt-1">IoT Sensor Active (SENSOR-IDK-01)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4A5568]">Active Workforce</span>
            <Users className="w-4 h-4 text-[#1F5E3B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#17331F] font-poppins">{workersPresent}/{totalWorkers}</span>
            <span className="text-xs font-bold text-[#5C8D4E]">Present</span>
          </div>
          <p className="text-[11px] text-[#4A5568] font-medium mt-1">Shift Progress: 80% Completed</p>
        </div>

      </div>

      {/* 2. MAP & KEY SCHEDULES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* MAP & GEOLOCATION PANEL */}
        <div className="lg:col-span-7 bg-white rounded-[20px] border border-[#D7E6D5] p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5C8D4E]" />
              Plantation Topography & Coordinates
            </h4>
            <span className="text-xs font-bold text-[#1F5E3B] bg-[#DDEFD9] px-2.5 py-1 rounded-full">
              GPS Synchronized 📡
            </span>
          </div>

          {/* Interactive Map Visual Mock */}
          <div className="relative h-64 rounded-2xl overflow-hidden border border-[#D7E6D5] bg-[#17331F] flex items-center justify-center text-white">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
              alt="Map Topography"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Map Pin Marker */}
            <div className="absolute flex flex-col items-center">
              <div className="p-2 rounded-full bg-[#1F5E3B] text-white shadow-xl animate-bounce">
                <MapPin className="w-6 h-6 fill-current text-[#C9A227]" />
              </div>
              <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-bold mt-1 shadow-md">
                {p.name} ({area} Acres)
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#DDEFD9] font-medium bg-black/60 backdrop-blur-md p-2.5 rounded-xl">
              <span>Lat: {p.latitude || 9.85}°N, Lon: {p.longitude || 76.97}°E</span>
              <span className="font-bold text-[#C9A227] flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5" />
                {altitude}m Elevation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
              <span className="text-[10px] font-bold text-[#4A5568] block">Taluk & Village</span>
              <span className="font-black text-[#17331F]">{p.village || 'Vandanmedu'}, {p.taluk || 'Udumbanchola'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
              <span className="text-[10px] font-bold text-[#4A5568] block">District & State</span>
              <span className="font-black text-[#17331F]">{district}</span>
            </div>
          </div>
        </div>

        {/* KEY CULTIVATION SCHEDULES */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-[#D7E6D5] p-5 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2 pb-3 border-b border-[#D7E6D5]">
              <Calendar className="w-4 h-4 text-[#5C8D4E]" />
              Upcoming Cultivation Schedule
            </h4>

            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#17331F] block">Next Irrigation Cycle</span>
                    <span className="text-[11px] text-[#4A5568]">{nextIrrigationDate}</span>
                  </div>
                </div>
                <button onClick={() => onSwitchTab('weather')} className="text-xs font-bold text-[#1F5E3B] hover:underline">
                  Weather Sync →
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#17331F] block">Next Fertilizer Schedule</span>
                    <span className="text-[11px] text-[#4A5568]">{nextFertilizerDate}</span>
                  </div>
                </div>
                <button onClick={() => onSwitchTab('soil')} className="text-xs font-bold text-[#1F5E3B] hover:underline">
                  Soil NPK →
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#17331F] block">Estimated Capsule Harvest</span>
                    <span className="text-[11px] text-[#4A5568]">{nextHarvestDate}</span>
                  </div>
                </div>
                <button onClick={() => onSwitchTab('ai')} className="text-xs font-bold text-[#1F5E3B] hover:underline">
                  AI Advice →
                </button>
              </div>
            </div>
          </div>

          {/* Region Advisory Notice Banner */}
          <div className={`p-3.5 rounded-xl border text-xs font-medium ${isIdeal ? 'bg-[#DDEFD9]/60 border-[#5C8D4E]/40 text-[#1F5E3B]' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {isIdeal
                  ? `Located in prime ${district} cardamom cultivation belt. High-altitude shade forest conditions active.`
                  : `⚠️ ${district} is not a primary cardamom zone. Intensive climate control required.`}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. CARDORA WHAT-IF ANALYSIS SIMULATOR */}
      <WhatIfSimulator plantation={plantation} />

    </div>
  );
};

// Interactive What-If Simulation Component
const WhatIfSimulator = ({ plantation }) => {
  const area = plantation?.area || 5.0;
  const baseYield = Math.round(area * 420);
  const baseHealth = plantation?.healthScore ?? plantation?.health ?? 90;

  const [rainChange, setRainChange] = React.useState(0); // % change
  const [tempChange, setTempChange] = React.useState(0); // deg C
  const [fertilizerDosage, setFertilizerDosage] = React.useState(500); // grams per clump
  const [shadePercent, setShadePercent] = React.useState(plantation?.shadePercentage || 55);

  // Dynamic simulation calculations
  const simDiseaseRisk = Math.min(95, Math.max(5, Math.round(20 + rainChange * 0.4 + (tempChange > 2 ? 15 : 0) + (shadePercent < 45 ? 10 : 0))));
  const simYieldDelta = Math.round((fertilizerDosage - 500) * 0.2 - (rainChange > 50 ? 40 : 0) + (tempChange < 0 ? 10 : -15));
  const simYield = Math.max(100, baseYield + simYieldDelta);
  const simHealth = Math.min(100, Math.max(30, Math.round(baseHealth - (simDiseaseRisk > 40 ? 12 : 0) + (fertilizerDosage >= 400 && fertilizerDosage <= 600 ? 5 : -5))));

  return (
    <div className="bg-gradient-to-br from-[#17331F] to-[#1F5E3B] text-white rounded-[24px] p-6 shadow-xl space-y-5 border border-[#5C8D4E]/40">
      <div className="flex items-center justify-between border-b border-white/20 pb-4 flex-wrap gap-2">
        <div>
          <h4 className="text-base font-black font-poppins text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A227]" />
            What-If Agro Simulation Studio
          </h4>
          <p className="text-xs text-[#DDEFD9] font-medium mt-0.5">
            Simulate weather shifts, shade density, & fertilizer inputs to forecast yield & disease vulnerability before taking field action.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227] text-[#C9A227] text-xs font-bold">
          ⚡ Predictive AI Engine
        </span>
      </div>

      {/* Simulator Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
        {/* Rainfall Shift */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
          <div className="flex justify-between font-bold">
            <span>Rainfall Forecast:</span>
            <span className="text-[#C9A227]">{rainChange >= 0 ? `+${rainChange}%` : `${rainChange}%`}</span>
          </div>
          <input 
            type="range" min="-50" max="100" step="5"
            value={rainChange} onChange={(e) => setRainChange(Number(e.target.value))}
            className="w-full accent-[#C9A227] cursor-pointer"
          />
          <span className="text-[10px] text-[#DDEFD9] block">
            {rainChange > 40 ? '⚠️ High rain alert: Capsule rot risk increases' : 'Normal rainfall range'}
          </span>
        </div>

        {/* Temperature Delta */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
          <div className="flex justify-between font-bold">
            <span>Temperature Shift:</span>
            <span className="text-[#C9A227]">{tempChange >= 0 ? `+${tempChange}°C` : `${tempChange}°C`}</span>
          </div>
          <input 
            type="range" min="-5" max="5" step="1"
            value={tempChange} onChange={(e) => setTempChange(Number(e.target.value))}
            className="w-full accent-[#C9A227] cursor-pointer"
          />
          <span className="text-[10px] text-[#DDEFD9] block">
            {tempChange > 2 ? '⚠️ High heat stress on flowering' : 'Optimal thermal zone'}
          </span>
        </div>

        {/* Fertilizer Dosage */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
          <div className="flex justify-between font-bold">
            <span>Neem & NPK Dosage:</span>
            <span className="text-[#C9A227]">{fertilizerDosage}g / clump</span>
          </div>
          <input 
            type="range" min="100" max="1000" step="50"
            value={fertilizerDosage} onChange={(e) => setFertilizerDosage(Number(e.target.value))}
            className="w-full accent-[#C9A227] cursor-pointer"
          />
          <span className="text-[10px] text-[#DDEFD9] block">Recommended: 500g / clump</span>
        </div>

        {/* Canopy Shade */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
          <div className="flex justify-between font-bold">
            <span>Canopy Shade:</span>
            <span className="text-[#C9A227]">{shadePercent}%</span>
          </div>
          <input 
            type="range" min="30" max="80" step="5"
            value={shadePercent} onChange={(e) => setShadePercent(Number(e.target.value))}
            className="w-full accent-[#C9A227] cursor-pointer"
          />
          <span className="text-[10px] text-[#DDEFD9] block">Optimal: 50% - 60% shade</span>
        </div>
      </div>

      {/* Simulation Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#DDEFD9]">Simulated Health Index</span>
          <div className="text-2xl font-black text-emerald-300 font-poppins mt-1">{simHealth} / 100</div>
          <span className="text-[10px] font-bold text-emerald-200">Base: {baseHealth}</span>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#DDEFD9]">Fungal Disease Risk</span>
          <div className={`text-2xl font-black font-poppins mt-1 ${simDiseaseRisk > 40 ? 'text-rose-400' : 'text-emerald-300'}`}>
            {simDiseaseRisk}% Risk
          </div>
          <span className="text-[10px] font-bold text-[#DDEFD9]">
            {simDiseaseRisk > 40 ? 'High vulnerability' : 'Low disease risk'}
          </span>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#DDEFD9]">Forecasted Harvest Yield</span>
          <div className="text-2xl font-black text-[#C9A227] font-poppins mt-1">{simYield} kg</div>
          <span className="text-[10px] font-bold text-amber-200">
            {simYieldDelta >= 0 ? `+${simYieldDelta} kg vs baseline` : `${simYieldDelta} kg vs baseline`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
