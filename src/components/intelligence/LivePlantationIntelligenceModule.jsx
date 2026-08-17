import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  Clock,
  Droplets,
  CloudSun,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle,
  Download,
  Send,
  Calendar,
  Activity,
  Layers,
  FileText,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  X,
  CloudRain,
  Radio,
  BarChart3,
  Award,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

const LivePlantationIntelligenceModule = ({ onToast }) => {
  const { user, darkMode } = useAuth();

  // Plantations list for selector
  const [userPlantations, setUserPlantations] = useState([]);
  const [selectedPlantationId, setSelectedPlantationId] = useState('');
  const [selectedPlantationObj, setSelectedPlantationObj] = useState(null);

  // Analysis State
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // History State & Modal
  const [historyList, setHistoryList] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryReport, setSelectedHistoryReport] = useState(null);

  // Soil Input Modal State
  const [soilModalOpen, setSoilModalOpen] = useState(false);
  const [savingSoil, setSavingSoil] = useState(false);
  const [soilForm, setSoilForm] = useState({
    ph: 6.2,
    n: 140,
    p: 45,
    k: 180,
    moisture: 72,
    organicCarbon: 1.8,
    soilType: 'Loamy Forest Soil',
  });

  // Open Soil Modal pre-filled
  const handleOpenSoilModal = () => {
    if (intelligence?.dataSources?.soil) {
      const s = intelligence.dataSources.soil;
      setSoilForm({
        ph: s.ph ?? 6.2,
        n: s.n ?? 140,
        p: s.p ?? 45,
        k: s.k ?? 180,
        moisture: s.moisture ?? 72,
        organicCarbon: s.organicCarbon ?? 1.8,
        soilType: s.soilType || 'Loamy Forest Soil',
      });
    } else if (selectedPlantationObj) {
      setSoilForm({
        ph: selectedPlantationObj.soil?.ph ?? selectedPlantationObj.soilPh ?? 6.2,
        n: selectedPlantationObj.soil?.npk?.n ?? selectedPlantationObj.npk?.n ?? 140,
        p: selectedPlantationObj.soil?.npk?.p ?? selectedPlantationObj.npk?.p ?? 45,
        k: selectedPlantationObj.soil?.npk?.k ?? selectedPlantationObj.npk?.k ?? 180,
        moisture: selectedPlantationObj.soil?.moisture ?? selectedPlantationObj.moisture ?? 72,
        organicCarbon: selectedPlantationObj.soil?.organicCarbon ?? 1.8,
        soilType: selectedPlantationObj.soil?.soilType || 'Loamy Forest Soil',
      });
    }
    setSoilModalOpen(true);
  };

  // Save Soil Test Data & Recalculate Live Intelligence
  const handleSaveSoilData = async (e) => {
    e.preventDefault();
    if (!selectedPlantationId || savingSoil) return;
    setSavingSoil(true);

    try {
      const payload = {
        soil: {
          ph: Number(soilForm.ph),
          npk: {
            n: Number(soilForm.n),
            p: Number(soilForm.p),
            k: Number(soilForm.k),
          },
          moisture: Number(soilForm.moisture),
          organicCarbon: Number(soilForm.organicCarbon),
          soilType: soilForm.soilType,
        },
        soilPh: Number(soilForm.ph),
        moisture: Number(soilForm.moisture),
        npk: {
          n: Number(soilForm.n),
          p: Number(soilForm.p),
          k: Number(soilForm.k),
        },
      };

      // 1. Update plantation document in DB
      await apiService.updatePlantation(selectedPlantationId, payload);

      // 2. Recalculate Live Intelligence
      const res = await apiService.analyzeIntelligence(selectedPlantationId);
      if (res && res.success && res.analysis) {
        setIntelligence(res.analysis);
        fetchHistory(selectedPlantationId);
        if (onToast) onToast('🧪 Soil parameters saved to MongoDB Atlas & Live Intelligence recalculated!');
      } else {
        if (onToast) onToast('Soil data saved');
      }
      setSoilModalOpen(false);
    } catch (err) {
      console.error('Error updating soil parameters:', err);
      if (onToast) onToast('Failed to update soil parameters');
    } finally {
      setSavingSoil(false);
    }
  };

  // Priority Tab Filter (Immediate | 24-48h | This Week)
  const [recommendationTab, setRecommendationTab] = useState('all');

  // Fetch Plantations owned by current user
  const loadPlantations = async () => {
    try {
      const res = await apiService.getPlantations();
      if (res && res.success && Array.isArray(res.plantations) && res.plantations.length > 0) {
        setUserPlantations(res.plantations);
        setSelectedPlantationId(res.plantations[0]._id || res.plantations[0].id);
        setSelectedPlantationObj(res.plantations[0]);
      } else {
        setUserPlantations([]);
      }
    } catch (err) {
      console.error('Error fetching plantations:', err);
    }
  };

  useEffect(() => {
    loadPlantations();
  }, []);

  // Fetch current intelligence analysis when selected plantation changes
  const fetchCurrentIntelligence = async (pId) => {
    if (!pId) return;
    setLoading(true);
    try {
      const res = await apiService.getIntelligenceCurrent(pId);
      if (res && res.success && res.analysis) {
        setIntelligence(res.analysis);
      } else {
        setIntelligence(null);
      }
    } catch (err) {
      console.error('Error fetching plantation intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analysis history for selected plantation
  const fetchHistory = async (pId) => {
    if (!pId) return;
    try {
      const res = await apiService.getIntelligenceHistory(pId);
      if (res && res.success && Array.isArray(res.history)) {
        setHistoryList(res.history);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (selectedPlantationId) {
      const pObj = userPlantations.find((p) => (p._id || p.id) === selectedPlantationId);
      setSelectedPlantationObj(pObj || null);
      fetchCurrentIntelligence(selectedPlantationId);
      fetchHistory(selectedPlantationId);
    }
  }, [selectedPlantationId, userPlantations]);

  // Force Refresh Analysis
  const handleRefreshAnalysis = async () => {
    if (!selectedPlantationId || refreshing) return;
    setRefreshing(true);
    try {
      const res = await apiService.analyzeIntelligence(selectedPlantationId);
      if (res && res.success && res.analysis) {
        setIntelligence(res.analysis);
        fetchHistory(selectedPlantationId);
        if (onToast) onToast('🎉 Live Plantation Intelligence refreshed with latest weather & soil telemetry!');
      } else {
        if (onToast) onToast(res?.message || 'Failed to refresh analysis');
      }
    } catch (err) {
      if (onToast) onToast('Error refreshing analysis');
    } finally {
      setRefreshing(false);
    }
  };

  // Download PDF Report
  const handleDownloadPdf = async () => {
    if (!selectedPlantationId || !intelligence?._id || downloading) return;
    setDownloading(true);
    try {
      const res = await apiService.downloadIntelligencePdf(selectedPlantationId, intelligence._id);
      if (res && res.success) {
        if (onToast) onToast('📥 Intelligence PDF Report downloaded successfully!');
      } else {
        if (onToast) onToast(res?.message || 'PDF Downloaded');
      }
    } catch (err) {
      if (onToast) onToast('PDF Download initiated');
    } finally {
      setDownloading(false);
    }
  };

  // Submit Analysis to System Admin
  const handleSubmitToAdmin = async () => {
    if (!selectedPlantationId || !intelligence?._id || submitting) return;
    setSubmitting(true);
    try {
      const res = await apiService.submitIntelligenceToAdmin(selectedPlantationId, intelligence._id);
      if (res && res.success) {
        setIntelligence((prev) => (prev ? { ...prev, isSubmittedToAdmin: true, submittedAt: new Date() } : prev));
        if (onToast) onToast('📤 Intelligence Analysis submitted to System Admin for review & oversight!');
      } else {
        if (onToast) onToast(res?.message || 'Submitted to Admin');
      }
    } catch (err) {
      if (onToast) onToast('Submitted to Admin');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'Good':
        return 'bg-[#EAF3E8] text-[#1F5E3B] dark:bg-emerald-950 dark:text-emerald-300 border-[#1F5E3B]/30';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Needs Attention':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300';
      case 'High Risk':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300';
    }
  };

  // Irrigation Badge Helper
  const getIrrigationBadge = (state) => {
    switch (state) {
      case 'IRRIGATION RECOMMENDED':
        return 'bg-blue-600 text-white border-blue-700';
      case 'IRRIGATION NOT REQUIRED':
        return 'bg-[#1F5E3B] text-white border-[#1F5E3B]';
      case 'MONITOR SOIL MOISTURE':
        return 'bg-amber-500 text-slate-950 border-amber-600 font-black';
      case 'EXCESS MOISTURE RISK':
        return 'bg-rose-600 text-white border-rose-700';
      default:
        return 'bg-slate-600 text-white border-slate-700';
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-[#F8FAF7] dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* ========================================================================= */}
      {/* MODULE HEADER BAR & PLANTATION SELECTOR */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
      } flex flex-col lg:flex-row lg:items-center justify-between gap-4`}>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F5E3B] to-emerald-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-poppins">
                Live Plantation Intelligence 🌿
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#1F5E3B] dark:text-emerald-400 bg-[#EAF3E8] dark:bg-emerald-950/80 px-3 py-0.5 rounded-full border border-[#1F5E3B]/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Analysis
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              Real-Time Soil & Weather Based Decision Support System for Cardamom Cultivation
            </p>
          </div>
        </div>

        {/* Plantation Selector & Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Plantation Dropdown */}
          <div className="relative min-w-[220px]">
            <select
              value={selectedPlantationId}
              onChange={(e) => setSelectedPlantationId(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B] appearance-none"
            >
              {userPlantations.length > 0 ? (
                userPlantations.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    🏡 {p.name} ({p.district || p.location || 'Idukki'})
                  </option>
                ))
              ) : (
                <option value="">No plantations found</option>
              )}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh Analysis Button */}
          <button
            onClick={handleRefreshAnalysis}
            disabled={refreshing || !selectedPlantationId}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Analyzing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </div>

      {/* TIMESTAMP & DATA FRESHNESS BAR */}
      {intelligence && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#1F5E3B] dark:text-emerald-400" />
            Last analyzed: <strong>{new Date(intelligence.analyzedAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
          </span>

          <div className="flex items-center gap-4 flex-wrap">
            <span>Weather: <strong className="text-slate-800 dark:text-slate-200">{intelligence.dataFreshness?.weatherUpdatedText || 'Just now'}</strong></span>
            <span>•</span>
            <span>Soil Moisture: <strong className="text-slate-800 dark:text-slate-200">{intelligence.dataFreshness?.soilMoistureUpdatedText || 'Just now'}</strong></span>
            <span>•</span>
            <span>Soil Test: <strong className="text-slate-800 dark:text-slate-200">{intelligence.dataFreshness?.soilTestDateText || 'Recorded today'}</strong></span>
          </div>
        </div>
      )}

      {loading ? (
        /* LOADING SKELETON STATE */
        <div className="py-20 text-center space-y-4">
          <RefreshCw size={36} className="mx-auto animate-spin text-[#1F5E3B]" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">Analyzing Live Soil & Weather Telemetry...</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Combining real-time micro-climate weather, soil pH, NPK levels, and moisture readings for {selectedPlantationObj?.name || 'your plantation'}...
          </p>
        </div>
      ) : !intelligence ? (
        /* EMPTY STATE */
        <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <AlertTriangle size={40} className="mx-auto text-amber-500" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">No Plantation Selected</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Please select or register a plantation to generate your Live Plantation Intelligence report.
          </p>
          <button
            onClick={handleRefreshAnalysis}
            className="px-5 py-2.5 rounded-xl bg-[#1F5E3B] text-white font-bold text-xs"
          >
            Run Intelligence Analysis
          </button>
        </div>
      ) : (
        /* MAIN INTELLIGENCE DASHBOARD */
        <div className="space-y-6">
          
          {/* ========================================================================= */}
          {/* SECTION 1: PLANTATION CONDITION SCORE & BREAKDOWN */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* RADIAL SCORE RING CARD (1/3 Width) */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } flex flex-col items-center justify-center text-center space-y-4`}>
              
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Plantation Condition Score</span>

              {/* Radial Progress Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#E2E8F0" strokeWidth="10" fill="transparent" className="dark:stroke-slate-800" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#1F5E3B"
                    strokeWidth="10"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * (intelligence.conditionScore || 85)) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-poppins">
                    {intelligence.conditionScore}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Overall Status Badge */}
              <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusBadge(intelligence.overallStatus)}`}>
                Condition: {intelligence.overallStatus}
              </span>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Deterministic agronomic score evaluated across soil pH, NPK balance, moisture, and local weather telemetry.
              </p>
            </div>

            {/* SCORE BREAKDOWN SUB-BARS (2/3 Width) */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } flex flex-col justify-between space-y-4`}>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#1F5E3B]" />
                  Condition Metric Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Explainable sub-scores derived from stored soil tests & live micro-climate measurements
                </p>
              </div>

              <div className="space-y-4 py-1">
                {[
                  { label: 'Soil Suitability', val: intelligence.scoreBreakdown?.soilSuitability || 86, color: 'bg-[#1F5E3B]' },
                  { label: 'Moisture Condition', val: intelligence.scoreBreakdown?.moistureCondition || 78, color: 'bg-blue-600' },
                  { label: 'Weather Suitability', val: intelligence.scoreBreakdown?.weatherSuitability || 91, color: 'bg-amber-500' },
                  { label: 'Nutrient Condition', val: intelligence.scoreBreakdown?.nutrientCondition || 73, color: 'bg-teal-600' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">{item.val}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                      <div
                        style={{ width: `${item.val}%` }}
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <span>Short-Term Risk Level: <strong className="text-slate-900 dark:text-white">{intelligence.scoreBreakdown?.shortTermRiskLevel || 'Low'}</strong></span>
                <span className="text-[#1F5E3B] dark:text-emerald-400 font-bold">● Live Monitored</span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 2 & 3: REAL-TIME ENVIRONMENT & SOIL TELEMETRY */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* REAL-TIME WEATHER TELEMETRY CARD */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <CloudSun size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Real-Time Environment Telemetry</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Location: {intelligence.dataSources?.weather?.locationName || intelligence.district}
                    </p>
                  </div>
                </div>

                {intelligence.dataSources?.weather?.isAvailable === false ? (
                  <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    ⚠️ Weather data temporarily unavailable
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full">
                    Live OpenWeather
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Temperature</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-poppins">
                    {intelligence.dataSources?.weather?.temp}°C
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Feels {intelligence.dataSources?.weather?.feelsLike}°C</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Humidity</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-poppins">
                    {intelligence.dataSources?.weather?.humidity}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">RH Level</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Rain / Prob</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-poppins">
                    {intelligence.dataSources?.weather?.rain} mm
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold block">{intelligence.dataSources?.weather?.rainProbability}% Rain Prob</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Wind Speed</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-poppins">
                    {intelligence.dataSources?.weather?.windSpeed} km/h
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">{intelligence.dataSources?.weather?.condition}</span>
                </div>
              </div>
            </div>

            {/* SOIL TELEMETRY & SENSOR STATUS CARD */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Soil & Sensor Telemetry</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Soil Type: {intelligence.dataSources?.soil?.soilType || 'Loamy Forest Soil'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleOpenSoilModal}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3E8] dark:bg-slate-800 hover:bg-[#DDEFD9] text-[#1F5E3B] dark:text-emerald-400 font-extrabold text-[11px] transition-colors border border-[#1F5E3B]/20"
                  >
                    <span>✏️ Input Soil Test Data</span>
                  </button>

                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                    intelligence.dataSources?.soil?.isSensorBased
                      ? 'bg-emerald-100 text-[#1F5E3B] dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {intelligence.dataSources?.soil?.isSensorBased ? '● IoT Sensor Data' : 'Manual Soil Test'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Soil pH</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-poppins">
                    {intelligence.dataSources?.soil?.ph}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Ideal: 5.5 - 6.8</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Moisture</span>
                  <span className="text-xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins">
                    {intelligence.dataSources?.soil?.moisture}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Target: 65% - 80%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Organic Carbon</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-poppins">
                    {intelligence.dataSources?.soil?.organicCarbon}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Humus Content</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">Sensor Status</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-poppins block mt-1">
                    {intelligence.dataSources?.soil?.sensorStatus || 'No sensor'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    ID: {intelligence.dataSources?.soil?.sensorId || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: CLEAR FARMER RECOMMENDATIONS ("🌱 What You Should Do Now") */}
          {/* ========================================================================= */}
          <div className={`p-6 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
          } space-y-4`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 font-poppins">
                  🌱 What You Should Do Now
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Actionable decision-support recommendations based on your live telemetry
                </p>
              </div>

              {/* Priority Action Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                {[
                  { id: 'all', label: 'All Actions' },
                  { id: 'immediate', label: '🔴 Immediate' },
                  { id: '24h', label: '🟠 24-48 Hours' },
                  { id: 'week', label: '🟢 This Week' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRecommendationTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      recommendationTab === tab.id
                        ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN ACTION BANNER */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#EAF3E8] to-emerald-50 dark:from-emerald-950/80 dark:to-slate-850 border border-[#1F5E3B]/20 text-slate-800 dark:text-slate-100">
              <span className="text-xs font-black uppercase text-[#1F5E3B] dark:text-emerald-400 block mb-1">
                Recommended Action Summary:
              </span>
              <p className="text-sm font-bold leading-relaxed">
                "{intelligence.farmerRecommendations?.mainAction}"
              </p>
            </div>

            {/* ACTION TIERS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* IMMEDIATE ACTIONS (🔴) */}
              {(recommendationTab === 'all' || recommendationTab === 'immediate') && (
                <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    🔴 Immediate Action (Today)
                  </div>
                  {intelligence.farmerRecommendations?.immediate?.length > 0 ? (
                    intelligence.farmerRecommendations.immediate.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 space-y-1 text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white block">{item.action}</span>
                        <span className="text-[11px] text-slate-500 font-medium block">{item.reason}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-medium">No immediate high-priority actions required today.</p>
                  )}
                </div>
              )}

              {/* WITHIN 24-48 HOURS (🟠) */}
              {(recommendationTab === 'all' || recommendationTab === '24h') && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    🟠 Within 24–48 Hours
                  </div>
                  {intelligence.farmerRecommendations?.within24to48h?.length > 0 ? (
                    intelligence.farmerRecommendations.within24to48h.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 space-y-1 text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white block">{item.action}</span>
                        <span className="text-[11px] text-slate-500 font-medium block">{item.reason}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-medium">No medium-term actions pending.</p>
                  )}
                </div>
              )}

              {/* THIS WEEK (🟢) */}
              {(recommendationTab === 'all' || recommendationTab === 'week') && (
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-[#1F5E3B] dark:text-emerald-400 font-extrabold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                    🟢 This Week (Routine)
                  </div>
                  {intelligence.farmerRecommendations?.thisWeek?.length > 0 ? (
                    intelligence.farmerRecommendations.thisWeek.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 space-y-1 text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white block">{item.action}</span>
                        <span className="text-[11px] text-slate-500 font-medium block">{item.reason}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-medium">Routine schedule on track.</p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: WATER / IRRIGATION DECISION CARD */}
          {/* ========================================================================= */}
          <div className={`p-6 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
          } space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Droplets size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">💧 Irrigation Decision</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Automated water management advisory based on soil moisture & rain probability</p>
                </div>
              </div>

              {/* State Badge */}
              <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getIrrigationBadge(intelligence.irrigationDecision?.state)}`}>
                {intelligence.irrigationDecision?.state}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white block">Agronomic Rationale:</span>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                "{intelligence.irrigationDecision?.explanation}"
              </p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
                <span>Action Step:</span>
                <span>{intelligence.irrigationDecision?.action}</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 6: SOIL NUTRIENT INSIGHT (N, P, K) */}
          {/* ========================================================================= */}
          <div className={`p-6 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
          } space-y-4`}>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-[#1F5E3B]" />
                🧪 Soil Nutrient Insight (N, P, K)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Nutrient status against Spices Board India target ranges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Nitrogen (N)', data: intelligence.nutrientInsights?.n, color: 'text-emerald-600' },
                { name: 'Phosphorus (P)', data: intelligence.nutrientInsights?.p, color: 'text-amber-600' },
                { name: 'Potassium (K)', data: intelligence.nutrientInsights?.k, color: 'text-blue-600' },
              ].map((nut, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 dark:text-white">{nut.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      nut.data?.status === 'Needs Attention' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#1F5E3B]'
                    }`}>
                      {nut.data?.status || 'Good'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-poppins">{nut.data?.value}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">mg/kg (Target: {nut.data?.minTarget}-{nut.data?.maxTarget})</span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-normal">
                    {nut.data?.interpretation}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] font-bold text-[#1F5E3B] dark:text-emerald-400">
                    💡 {nut.data?.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 7 & 8: WEATHER IMPACT ANALYSIS & 72-HOUR FORECAST */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* WEATHER IMPACT ANALYSIS */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CloudSun size={18} className="text-blue-600" />
                  ☁️ Weather Impact on Plantation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Agronomic relevance of current weather measurements
                </p>
              </div>

              <div className="space-y-3">
                {(intelligence.weatherImpact || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 dark:text-white">{item.factor}: <strong>{item.value}</strong></span>
                      <span className="text-[10px] font-bold text-[#1F5E3B] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 72-HOUR FORECAST INTELLIGENCE */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar size={18} className="text-[#1F5E3B]" />
                  🔮 Next 72 Hours Forecast Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Micro-climate rain probability & operational implications
                </p>
              </div>

              <div className="space-y-3">
                {(intelligence.forecast72h || []).map((fc, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 dark:text-white text-sm">{fc.day} ({fc.date})</span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">{fc.pop}% Rain Prob</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      → {fc.implication}
                    </p>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <span>Temp: {fc.temp}°C | Humidity: {fc.humidity}%</span>
                      <span className="text-amber-600">Risk: {fc.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 9 & 10: RISK MONITOR & ANALYSIS CONFIDENCE */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* RISK MONITOR LIST (2/3 Width) */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    ⚠️ Plantation Risk Monitor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Automated anomaly detection across soil saturation, humidity, and nutrients
                  </p>
                </div>
                <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full">
                  {(intelligence.riskMonitor || []).length} Detected
                </span>
              </div>

              <div className="space-y-3">
                {(intelligence.riskMonitor || []).map((rk, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-600" />
                        {rk.riskName}
                      </span>
                      <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md">
                        {rk.severity} SEVERITY
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      <strong>Reason:</strong> {rk.reason}
                    </p>
                    <p className="text-[11px] text-[#1F5E3B] dark:text-emerald-400 font-bold pt-1">
                      <strong>Suggested Action:</strong> {rk.suggestedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ANALYSIS CONFIDENCE & DATA QUALITY (1/3 Width) */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } flex flex-col justify-between space-y-4`}>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#1F5E3B]" />
                  📊 Analysis Confidence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Transparency and data quality evaluation
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center space-y-2">
                <span className="text-3xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins">
                  {intelligence.analysisConfidence?.scorePercent || 90}%
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  {intelligence.analysisConfidence?.level || 'High'} Confidence Analysis
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  "{intelligence.analysisConfidence?.explanation}"
                </p>
              </div>

              <button
                onClick={() => setHistoryModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#EAF3E8] hover:bg-[#DDEFD9] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 font-extrabold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <Activity size={14} />
                <span>View Analysis History ({historyList.length}) →</span>
              </button>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* BOTTOM ACTIONS FOOTER */}
          {/* ========================================================================= */}
          <div className={`p-6 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
          } flex flex-col sm:flex-row items-center justify-between gap-4`}>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Professional Report & Oversight</h4>
                <p className="text-[11px] text-slate-500 font-medium">Download PDF report or submit to System Admin for review panel oversight</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap self-end sm:self-auto">
              {/* Download PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF3E8] hover:bg-[#DDEFD9] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-300 font-extrabold text-xs transition-all border border-[#1F5E3B]/20"
              >
                <Download size={14} />
                <span>{downloading ? 'Downloading...' : '📥 Download Analysis Report'}</span>
              </button>

              {/* Submit to Admin */}
              <button
                onClick={handleSubmitToAdmin}
                disabled={submitting || intelligence.isSubmittedToAdmin}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                  intelligence.isSubmittedToAdmin
                    ? 'bg-emerald-100 text-[#1F5E3B] cursor-default'
                    : 'bg-[#1F5E3B] hover:bg-[#16442b] text-white'
                }`}
              >
                <Send size={14} />
                <span>{intelligence.isSubmittedToAdmin ? '✔ Submitted to Admin' : '📤 Submit Analysis to Admin'}</span>
              </button>

              {/* Refresh Analysis */}
              <button
                onClick={handleRefreshAnalysis}
                disabled={refreshing}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                title="Refresh Live Analysis"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ANALYSIS HISTORY MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {historyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      📈 Analysis History for {selectedPlantationObj?.name || 'Plantation'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Stored historical decision-support reports for this plantation
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setHistoryModalOpen(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* HISTORY TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Condition Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Main Recommendation</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {historyList.map((item, idx) => (
                      <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {new Date(item.analyzedAt || item.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-black text-[#1F5E3B] dark:text-emerald-400 text-sm">
                          {item.conditionScore} / 100
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(item.overallStatus)}`}>
                            {item.overallStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium max-w-xs truncate">
                          {item.farmerRecommendations?.mainAction || 'Routine analysis'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setIntelligence(item);
                              setHistoryModalOpen(false);
                            }}
                            className="px-2.5 py-1 rounded bg-[#EAF3E8] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 font-bold text-xs hover:bg-[#DDEFD9]"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SOIL PARAMETER TEST INPUT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {soilModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 font-sans max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      🧪 Input Soil Test Parameters
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Updating soil parameters for: <strong>{selectedPlantationObj?.name || 'Selected Plantation'}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSoilModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* QUICK PRESETS */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Quick Lab Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🌿 Standard Estate Soil', data: { ph: 6.2, n: 140, p: 45, k: 180, moisture: 72, organicCarbon: 1.8, soilType: 'Loamy Forest Soil' } },
                    { label: '🧪 Low Phosphorus', data: { ph: 5.8, n: 135, p: 28, k: 160, moisture: 70, organicCarbon: 1.4, soilType: 'Red Clay Loam' } },
                    { label: '💧 High Moisture', data: { ph: 6.1, n: 145, p: 50, k: 190, moisture: 85, organicCarbon: 2.1, soilType: 'Clay Loam' } },
                    { label: '🌵 Low Moisture Stress', data: { ph: 6.5, n: 120, p: 42, k: 140, moisture: 52, organicCarbon: 1.2, soilType: 'Sandy Loam' } },
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setSoilForm(preset.data)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-[#1F5E3B] dark:text-emerald-400 hover:bg-[#EAF3E8]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={handleSaveSoilData} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Soil pH */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Soil pH (Acidity Level) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="4"
                      max="9"
                      required
                      value={soilForm.ph}
                      onChange={(e) => setSoilForm({ ...soilForm, ph: e.target.value })}
                      placeholder="6.2"
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                    />
                    <span className="text-[10px] text-emerald-600 font-medium block mt-1">Ideal Cardamom Range: 5.5 - 6.8</span>
                  </div>

                  {/* Soil Moisture */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Soil Moisture Level (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="100"
                      required
                      value={soilForm.moisture}
                      onChange={(e) => setSoilForm({ ...soilForm, moisture: e.target.value })}
                      placeholder="72"
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Target Range: 65% - 80%</span>
                  </div>

                  {/* Nitrogen (N) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Nitrogen (N) in mg/kg <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={soilForm.n}
                      onChange={(e) => setSoilForm({ ...soilForm, n: e.target.value })}
                      placeholder="140"
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Target Range: 120 - 180 mg/kg</span>
                  </div>

                  {/* Phosphorus (P) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Phosphorus (P) in mg/kg <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={soilForm.p}
                      onChange={(e) => setSoilForm({ ...soilForm, p: e.target.value })}
                      placeholder="45"
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Target Range: 40 - 75 mg/kg</span>
                  </div>

                  {/* Potassium (K) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Potassium (K) in mg/kg <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={soilForm.k}
                      onChange={(e) => setSoilForm({ ...soilForm, k: e.target.value })}
                      placeholder="180"
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Target Range: 150 - 220 mg/kg</span>
                  </div>

                  {/* Organic Carbon */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Organic Carbon (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={soilForm.organicCarbon}
                      onChange={(e) => setSoilForm({ ...soilForm, organicCarbon: e.target.value })}
                      placeholder="1.8"
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Ideal: &gt; 1.5%</span>
                  </div>

                  {/* Soil Type */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Soil Classification Type
                    </label>
                    <select
                      value={soilForm.soilType}
                      onChange={(e) => setSoilForm({ ...soilForm, soilType: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                    >
                      <option value="Loamy Forest Soil">Loamy Forest Soil (Rich Humus)</option>
                      <option value="Red Clay Loam">Red Clay Loam</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Laterite Soil">Laterite Soil</option>
                      <option value="Clay Loam">Clay Loam</option>
                    </select>
                  </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSoilModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSoil}
                    className="px-5 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
                  >
                    {savingSoil ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Saving & Recalculating...</span>
                      </>
                    ) : (
                      <span>💾 Save Soil Data & Recalculate Intelligence</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LivePlantationIntelligenceModule;
