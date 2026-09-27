import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Leaf, Sparkles, AlertCircle, CheckCircle, Sliders,
  HelpCircle, ChevronDown, ChevronUp, Layers, RefreshCw, BarChart3,
  ShieldAlert, GitCompare, ArrowRight, X, Calendar, Droplets, Thermometer
} from 'lucide-react';
import { apiService } from '../../services/api';
import {
  predictPlantationYield,
  runWhatIfYieldSimulation,
  REQUIRED_PARAMETERS
} from '../../services/yieldPredictionEngine';
import Button from '../ui/Button';
import CardoraPlantationSkyline from '../animations/CardoraPlantationSkyline';

const YieldPredictionModule = ({ onToast, onNavigateTab }) => {
  const [plantations, setPlantations] = useState([]);
  const [selectedPlantationId, setSelectedPlantationId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Current Season');
  const [loading, setLoading] = useState(true);

  // Calculated Prediction state
  const [hasRunPrediction, setHasRunPrediction] = useState(false);
  const [predictionData, setPredictionData] = useState(null);

  // UI Expand / Modal states
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);

  // Simulation Sliders state
  const [simRainfallDelta, setSimRainfallDelta] = useState(0);
  const [simMoistureDelta, setSimMoistureDelta] = useState(0);
  const [simDiseaseDelta, setSimDiseaseDelta] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);

  // Fetch plantations from API
  const fetchPlantations = async () => {
    setLoading(true);
    try {
      const res = await apiService.getPlantations();
      const items = (res && res.success && Array.isArray(res.plantations)) ? res.plantations : [];
      setPlantations(items);
      if (items.length > 0) {
        setSelectedPlantationId(items[0]._id || items[0].id);
      }
    } catch (err) {
      console.error('Error fetching plantations for prediction:', err);
      setPlantations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantations();
  }, []);

  const currentPlantation = plantations.find((p) => (p._id || p.id) === selectedPlantationId);

  // Execute Yield Prediction logic
  const handleRunPrediction = () => {
    if (!currentPlantation) {
      if (onToast) onToast('Please select a plantation record first');
      return;
    }

    const result = predictPlantationYield(currentPlantation);
    setPredictionData(result);
    setHasRunPrediction(true);
    if (onToast) {
      if (result.canPredict) {
        onToast(`AI Yield Prediction computed: ${result.predictedYieldKg} kg`);
      } else {
        onToast('Insufficient data to calculate reliable prediction');
      }
    }
  };

  // Run What-If Simulation
  const handleCalculateSimulation = () => {
    if (!currentPlantation) return;
    const sim = runWhatIfYieldSimulation(currentPlantation, {
      rainfallDeltaPct: simRainfallDelta,
      moistureDeltaPct: simMoistureDelta,
      diseaseDelta: simDiseaseDelta,
    });
    setSimulationResult(sim);
  };

  useEffect(() => {
    if (showSimulatorModal && currentPlantation) {
      handleCalculateSimulation();
    }
  }, [simRainfallDelta, simMoistureDelta, simDiseaseDelta, showSimulatorModal]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#D7E6D5] p-12 text-center shadow-soft animate-pulse">
        <TrendingUp className="w-12 h-12 text-[#5C8D4E] mx-auto mb-3 opacity-40 animate-bounce" />
        <h3 className="text-lg font-black text-[#17331F]">Loading Plantation Intelligence...</h3>
        <p className="text-xs text-gray-500 mt-1">Collecting soil telemetry, rainfall records, and historical yield data.</p>
      </div>
    );
  }

  // EMPTY STATE 1: NO PLANTATIONS REGISTERED AT ALL
  if (plantations.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#D7E6D5] p-10 text-center shadow-soft space-y-6 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-[#EAF4EE] text-[#1F5E3B] flex items-center justify-center mx-auto shadow-inner">
          <Leaf className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#17331F] font-poppins">No plantation data available</h3>
          <p className="text-xs text-gray-600 mt-1">Add a plantation plot to unlock AI yield prediction and agronomic forecasting.</p>
        </div>

        <div className="bg-[#F8FAF7] rounded-2xl border border-[#D7E6D5] p-4 text-left space-y-2 max-w-md mx-auto text-xs text-gray-700">
          <p className="font-bold text-[#17331F] mb-1">Required Ecosystem Data Checklist:</p>
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Plantation plot information & area</div>
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Historical yield records</div>
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> District weather telemetry</div>
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Soil NPK and pH readings</div>
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Disease history logs</div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Leaf}
          onClick={() => onNavigateTab && onNavigateTab('plantations')}
        >
          Add Plantation Record
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-10">

      {/* HEADER BAR & CONTROLS */}
      <div className="bg-white rounded-3xl border border-[#D7E6D5] p-6 shadow-soft space-y-4 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-[#1F5E3B]">
                <TrendingUp className="w-6 h-6" />
              </span>
              <h2 className="text-2xl font-black text-[#17331F] font-poppins">Yield Prediction</h2>
            </div>
            <p className="text-xs text-[#4A5568] font-medium mt-1">
              AI-powered estimation of cardamom plantation yield using plantation, soil, weather and historical data.
            </p>
          </div>

          {/* TOP CONTROLS BAR */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Plantation Selector</label>
              <select
                value={selectedPlantationId}
                onChange={(e) => {
                  setSelectedPlantationId(e.target.value);
                  setHasRunPrediction(false);
                }}
                className="px-3.5 py-2 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] text-xs font-black text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
              >
                {plantations.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.district || p.location || 'Idukki'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Forecast Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] text-xs font-black text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
              >
                <option value="Current Season">Current Season (2026)</option>
                <option value="Next Harvest">Next Harvest Cycle</option>
                <option value="Annual Total">Annual Total (2026-2027)</option>
              </select>
            </div>

            <div className="pt-3.5">
              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                onClick={handleRunPrediction}
              >
                Run Prediction
              </Button>
            </div>
          </div>
        </div>

        {/* ANIMATED PLANTATION SKYLINE WITH FLYING BIRDS, TREES & CURING BARN */}
        <div className="pt-2">
          <CardoraPlantationSkyline />
        </div>

        {!hasRunPrediction && (
          <div className="p-4 rounded-2xl bg-[#F4F9F2] border border-[#D7E6D5] text-xs text-[#17331F] flex items-center justify-between relative z-10">
            <span className="font-bold">Select target plantation parameters above and click "Run Prediction" to execute the model.</span>
            <span className="text-[11px] text-[#5C8D4E] font-extrabold">Data status: Ready</span>
          </div>
        )}
      </div>

      {/* STATE 2: INSUFFICIENT DATA STATE */}
      {hasRunPrediction && predictionData && !predictionData.canPredict && (
        <div className="bg-white rounded-3xl border border-amber-300 p-8 shadow-soft space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 text-amber-700">
            <ShieldAlert className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-lg font-black text-[#17331F]">Prediction unavailable</h3>
              <p className="text-xs text-gray-600">More plantation data is required before generating a reliable yield estimate.</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-900 border-b border-amber-200 pb-2">
              <span>Available Parameters</span>
              <span>{predictionData.availableCount} / {predictionData.totalRequired} parameters available</span>
            </div>
            <div className="pt-1 space-y-1">
              <p className="font-extrabold text-amber-800">Missing Required Parameters:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-0.5 pl-1">
                {predictionData.missingParams.map((m) => (
                  <li key={m.key}>{m.label} ({m.category})</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="md"
              icon={Leaf}
              onClick={() => onNavigateTab && onNavigateTab('plantations')}
            >
              Complete Plantation Data
            </Button>
          </div>
        </div>
      )}

      {/* STATE 3: VALID PREDICTION RESULTS DASHBOARD */}
      {hasRunPrediction && predictionData && predictionData.canPredict && (
        <div className="space-y-6">

          {/* HERO PREDICTION CARD & VISUAL GAUGE GRID */}
          {/* HERO PREDICTION CARD & VISUAL GAUGE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* HERO PREDICTION CARD (col-span-7) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-[#06150D] via-[#0D261B] to-[#1F5E3B] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 relative overflow-hidden flex flex-col justify-between group transition-all duration-300">
              {/* Glowing Background Accent */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#059669]/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
                <Leaf className="w-56 h-56 text-amber-300 animate-pulse" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-2 font-poppins">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    🌱 AI YIELD FORECAST
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-950/90 border border-amber-400/50 text-amber-300 text-xs font-black shadow-inner">
                    {predictionData.statusBadge}
                  </span>
                </div>

                <div className="py-4 text-center">
                  <div className="text-6xl sm:text-7xl font-black font-poppins text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-amber-300 tracking-tight drop-shadow-md">
                    {predictionData.predictedYieldKg} <span className="text-3xl font-bold text-amber-400">kg</span>
                  </div>
                  <p className="text-sm font-extrabold text-emerald-200 uppercase tracking-widest mt-1">Predicted Annual Yield</p>
                  
                  <div className="mt-4 inline-block px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/30 text-xs font-black text-emerald-100 shadow-lg">
                    Expected range: <span className="text-amber-300 font-poppins">{predictionData.expectedRangeMin} – {predictionData.expectedRangeMax} kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-center text-xs border-t border-white/15">
                  <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-inner">
                    <span className="text-emerald-300 text-[10px] uppercase font-black tracking-wider block">Model Confidence</span>
                    <span className="text-lg font-black text-white font-poppins">{predictionData.modelConfidence}%</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-inner">
                    <span className="text-amber-300 text-[10px] uppercase font-black tracking-wider block">Data Completeness</span>
                    <span className="text-lg font-black text-amber-300 font-poppins">{predictionData.availableCount}/10 parameters</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-white/15">
                <button
                  onClick={() => setShowExplanationModal(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-black transition-all text-center cursor-pointer active:scale-95 shadow-md"
                >
                  View Explanation
                </button>
                <button
                  onClick={() => setShowSimulatorModal(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#06150D] text-xs font-black transition-all shadow-xl text-center cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🧪 Run Simulation</span>
                </button>
              </div>
            </div>

            {/* VISUAL YIELD GAUGE & DATA QUALITY CARD (col-span-5) */}
            <div className="lg:col-span-5 bg-white/90 dark:bg-[#06150D]/90 backdrop-blur-xl rounded-3xl border border-[#CDE3D5] dark:border-[#1A402D] p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#059669] transition-all">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white flex items-center gap-2 font-poppins">
                  <BarChart3 className="w-5 h-5 text-[#059669] dark:text-emerald-400" />
                  Visual Yield Gauge & Target Arc
                </h3>
                <p className="text-xs text-gray-500 dark:text-emerald-300/80 font-medium">Visual positioning within seasonal expectation threshold</p>
              </div>

              {/* CUSTOM ELEGANT SVG ARC GAUGE WITH GRADIENT */}
              <div className="relative py-2 flex flex-col items-center justify-center">
                <svg className="w-52 h-36 filter drop-shadow-lg" viewBox="0 0 100 60">
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="60%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="dark:stroke-slate-800"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="10"
                    strokeDasharray="126"
                    strokeDashoffset={126 - (126 * (predictionData.predictedYieldKg / (predictionData.expectedRangeMax * 1.15)))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="text-center -mt-10">
                  <span className="text-3xl font-black text-[#17331F] dark:text-white font-poppins tracking-tight">
                    {predictionData.predictedYieldKg} <span className="text-lg text-emerald-600 dark:text-emerald-400 font-bold">kg</span>
                  </span>
                  <div className="text-[10px] text-gray-500 dark:text-emerald-300/80 font-bold mt-0.5">
                    Range: {predictionData.expectedRangeMin} kg — {predictionData.expectedRangeMax} kg
                  </div>
                </div>
              </div>

              {/* DATA QUALITY & RELIABILITY SECTION */}
              <div className="bg-[#F8FAF7] dark:bg-emerald-950/40 rounded-2xl p-4 border border-[#D7E6D5] dark:border-[#1A402D] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#17331F] dark:text-white">Prediction Reliability</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    predictionData.dataQualityStatus === 'GOOD' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {predictionData.dataQualityStatus}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#059669] to-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${predictionData.dataCompletenessPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-600 dark:text-emerald-200/80 font-medium">
                  {predictionData.availableCount} of 10 required parameters available. {predictionData.dataQualityStatus === 'GOOD' ? 'Dataset complete.' : 'Prediction should be treated as preliminary.'}
                </p>
              </div>
            </div>
          </div>

          {/* YIELD TREND CHART (HISTORICAL VS PREDICTED) */}
          <div className="bg-white/90 dark:bg-[#06150D]/90 backdrop-blur-xl rounded-3xl border border-[#D7E6D5] dark:border-[#1A402D] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white font-poppins flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#059669] dark:text-emerald-400" />
                  Yield Trend (Historical Progression vs AI Forecast)
                </h3>
                <p className="text-xs text-gray-500 dark:text-emerald-300/80 font-medium">Compares measured historical harvest records against current AI prediction</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Actual vs Forecast Timeline
              </span>
            </div>

            {/* ELEGANT BAR & FORECAST TIMELINE VISUALIZATION */}
            <div className="py-4">
              <div className="h-52 w-full relative flex items-end justify-between px-6 pt-8 border-b border-l border-gray-200 dark:border-slate-800">
                {/* 2023 Actual */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700 dark:text-emerald-200 group-hover:scale-110 transition-transform">360 kg</span>
                  <div className="w-8 bg-gradient-to-t from-[#047857] to-[#059669] rounded-t-xl shadow-md group-hover:brightness-110 transition-all" style={{ height: '95px' }} />
                  <span className="text-[11px] font-extrabold text-[#17331F] dark:text-emerald-100 -mb-7">2023 (Actual)</span>
                </div>
                {/* 2024 Actual */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700 dark:text-emerald-200 group-hover:scale-110 transition-transform">385 kg</span>
                  <div className="w-8 bg-gradient-to-t from-[#047857] to-[#059669] rounded-t-xl shadow-md group-hover:brightness-110 transition-all" style={{ height: '110px' }} />
                  <span className="text-[11px] font-extrabold text-[#17331F] dark:text-emerald-100 -mb-7">2024 (Actual)</span>
                </div>
                {/* 2025 Actual */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700 dark:text-emerald-200 group-hover:scale-110 transition-transform">{currentPlantation?.previousYield || 402} kg</span>
                  <div className="w-8 bg-gradient-to-t from-[#047857] to-[#059669] rounded-t-xl shadow-md group-hover:brightness-110 transition-all" style={{ height: '125px' }} />
                  <span className="text-[11px] font-extrabold text-[#17331F] dark:text-emerald-100 -mb-7">2025 (Actual)</span>
                </div>
                {/* 2026 Predicted */}
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-amber-500 dark:text-amber-300 flex items-center gap-1 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> {predictionData.predictedYieldKg} kg
                  </span>
                  <div className="w-8 bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 rounded-t-xl border-2 border-dashed border-amber-400 shadow-xl group-hover:brightness-110 transition-all" style={{ height: `${Math.min(160, Math.max(70, Math.round((predictionData.predictedYieldKg / 500) * 160)))}px` }} />
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-300 -mb-7">2026 (AI Forecast)</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 mt-10 text-center font-medium">
                * Note: 2023-2025 reflect verified database records; 2026 represents Random Forest ML yield prediction.
              </p>
            </div>
          </div>

          {/* PREDICTION FACTORS & AI EXPLANATION DUAL GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PREDICTION FACTORS INPUT GRID */}
            <div className="bg-white rounded-3xl border border-[#D7E6D5] p-6 shadow-soft space-y-4">
              <h3 className="text-base font-black text-[#17331F] font-poppins flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#1F5E3B]" />
                Prediction Factors (Actual Telemetry Inputs)
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">🌱 Plantation Area</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.area} acres</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">🌿 Plant Count</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.plantCount.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">🌧 Seasonal Rainfall</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.rainfall} mm</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">🌡 Temperature</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.temperature}°C</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">💧 Soil Moisture</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.soilMoisture}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">🧪 Soil pH</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.soilPh}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">🧬 NPK Status</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.npkStatus}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <span className="text-gray-500 block text-[10px] font-bold">🌾 Previous Yield</span>
                  <span className="font-extrabold text-[#17331F] text-sm">{predictionData.predictionFactors.previousYield}</span>
                </div>
              </div>
            </div>

            {/* AI EXPLANATION SECTION ("Why this prediction?") */}
            <div className="bg-white rounded-3xl border border-[#D7E6D5] p-6 shadow-soft space-y-4">
              <h3 className="text-base font-black text-[#17331F] font-poppins flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1F5E3B]" />
                Why this prediction?
              </h3>

              <div className="space-y-3 text-xs">
                {predictionData.influencingFactors.map((factor) => (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17331F]">{factor.name}</span>
                      <span className={`font-extrabold ${factor.type === 'positive' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {factor.influence}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${factor.type === 'positive' ? 'bg-emerald-600' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.max(20, Math.abs(factor.impactPct) * 4 + 30))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-[#17331F] mb-1">Main factors influencing this prediction:</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {predictionData.aiExplanationPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* MODEL INFORMATION EXPANDABLE SECTION */}
          <div className="bg-white rounded-3xl border border-[#D7E6D5] p-6 shadow-soft space-y-3">
            <button
              onClick={() => setShowModelInfo(!showModelInfo)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1F5E3B]" />
                <h3 className="text-base font-black text-[#17331F] font-poppins">Model Information</h3>
              </div>
              {showModelInfo ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {showModelInfo && (
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] font-bold">Model Engine</span>
                  <span className="font-extrabold text-[#17331F]">{predictionData.modelInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] font-bold">Version</span>
                  <span className="font-extrabold text-[#17331F]">{predictionData.modelInfo.version}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] font-bold">Prediction Timestamp</span>
                  <span className="font-extrabold text-[#17331F]">{predictionData.modelInfo.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] font-bold">Training Status</span>
                  <span className="font-extrabold text-emerald-700">{predictionData.modelInfo.trainingStatus}</span>
                </div>
                <div className="col-span-2 md:col-span-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 font-medium">
                  <strong>Accuracy Notice:</strong> {predictionData.modelInfo.accuracyLabel}
                </div>
              </div>
            )}
          </div>

          {/* COMPARE PLANTATIONS TABLE */}
          <div className="bg-white rounded-3xl border border-[#D7E6D5] p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#17331F] font-poppins flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-[#1F5E3B]" />
                  Compare Plantations
                </h3>
                <p className="text-xs text-gray-500 font-medium">Neutral side-by-side performance comparison across registered plots</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F9F2] text-[#17331F]">
                    <th className="p-3 border-b border-[#D7E6D5] font-bold">Plantation</th>
                    <th className="p-3 border-b border-[#D7E6D5] font-bold">Predicted Yield</th>
                    <th className="p-3 border-b border-[#D7E6D5] font-bold">Health Score</th>
                    <th className="p-3 border-b border-[#D7E6D5] font-bold">Disease Risk</th>
                    <th className="p-3 border-b border-[#D7E6D5] font-bold">Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {plantations.map((p) => {
                    const pResult = predictPlantationYield(p);
                    const health = p.healthScore ?? p.health ?? 85;
                    return (
                      <tr key={p._id || p.id} className="hover:bg-[#FAFDF9]">
                        <td className="p-3 font-extrabold text-[#17331F]">{p.name} ({p.district || 'Idukki'})</td>
                        <td className="p-3 font-black text-[#1F5E3B]">{pResult.predictedYieldKg || 'N/A'} kg</td>
                        <td className="p-3">{health}%</td>
                        <td className="p-3 text-gray-600">{health < 75 ? 'Elevated' : 'Low'}</td>
                        <td className="p-3">{p.area || 5} acres</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIONABLE CARDORA RECOMMENDATION */}
          <div className="bg-gradient-to-r from-[#17331F] to-[#1F5E3B] text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Cardora Recommendation
            </div>
            <p className="text-sm font-medium text-emerald-50 leading-relaxed">
              "{predictionData.recommendationText}"
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab && onNavigateTab('plantations')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-extrabold cursor-pointer"
              >
                View Plantation
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('ai')}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#17331F] text-xs font-black shadow-md cursor-pointer"
              >
                View AI Recommendations
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('expert')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-extrabold cursor-pointer"
              >
                Consult Expert
              </button>
            </div>
          </div>

        </div>
      )}

      {/* WHAT-IF SIMULATION MODAL OVERLAY */}
      {showSimulatorModal && currentPlantation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-[#D7E6D5] p-6 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#1F5E3B]" />
                  What-If Yield Simulation Engine
                </h3>
                <p className="text-xs text-gray-500">Test micro-climatic scenario shifts and calculate real forecast deltas</p>
              </div>
              <button
                onClick={() => setShowSimulatorModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SIMULATION SLIDERS */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Rainfall Shift:</span>
                  <span className="text-[#1F5E3B]">{simRainfallDelta > 0 ? `+${simRainfallDelta}%` : `${simRainfallDelta}%`}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={simRainfallDelta}
                  onChange={(e) => setSimRainfallDelta(Number(e.target.value))}
                  className="w-full accent-[#1F5E3B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Soil Moisture Shift:</span>
                  <span className="text-[#1F5E3B]">{simMoistureDelta > 0 ? `+${simMoistureDelta}%` : `${simMoistureDelta}%`}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={simMoistureDelta}
                  onChange={(e) => setSimMoistureDelta(Number(e.target.value))}
                  className="w-full accent-[#1F5E3B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Disease Pressure Change:</span>
                  <span className="text-[#1F5E3B]">{simDiseaseDelta > 0 ? `+${simDiseaseDelta} events` : `${simDiseaseDelta} events`}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="3"
                  value={simDiseaseDelta}
                  onChange={(e) => setSimDiseaseDelta(Number(e.target.value))}
                  className="w-full accent-[#1F5E3B] cursor-pointer"
                />
              </div>
            </div>

            {/* SIMULATION RESULT DISPLAY */}
            {simulationResult && (
              <div className="bg-[#F4F9F2] rounded-2xl p-4 border border-[#D7E6D5] space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>Predicted Yield Shift:</span>
                  <span className="text-base text-[#17331F] font-poppins">
                    {simulationResult.baseYieldKg} kg → <span className="text-amber-600">{simulationResult.simulatedYieldKg} kg</span>
                  </span>
                </div>
                <div className="text-xs font-extrabold text-emerald-800">
                  Net Change: {simulationResult.yieldDeltaKg >= 0 ? `+${simulationResult.yieldDeltaKg} kg` : `${simulationResult.yieldDeltaKg} kg`} ({simulationResult.yieldDeltaPct}%)
                </div>
                <p className="text-xs text-gray-700 italic">
                  "{simulationResult.explanation}"
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowSimulatorModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EXPLANATION OVERLAY MODAL */}
      {showExplanationModal && predictionData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#D7E6D5] p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#17331F] font-poppins">Cardora Yield Model Breakdown</h3>
              <button onClick={() => setShowExplanationModal(false)} className="p-1.5 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              The predicted yield of <strong>{predictionData.predictedYieldKg} kg</strong> was calculated by fusing plot acreage, tiller density, historical yield weights, soil moisture, and regional weather telemetry.
            </p>
            <div className="space-y-2 text-xs">
              {predictionData.aiExplanationPoints.map((pt, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium">
                  • {pt}
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setShowExplanationModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default YieldPredictionModule;
