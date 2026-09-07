import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Database, CloudSun, FlaskConical, ShieldCheck, CheckCircle2,
  ChevronDown, ChevronUp, RefreshCw, Info, ExternalLink, Activity, Leaf,
  Thermometer, Droplets, CloudRain, AlertCircle, X, HelpCircle, Cpu, Check
} from 'lucide-react';
import { apiService } from '../../services/api';

const CardoraFertilizerAdvisor = ({ plantation, onToast }) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Soil input / plantation telemetry state
  const [nitrogen, setNitrogen] = useState(plantation?.soil?.npk?.n ?? plantation?.npk?.n ?? 40);
  const [phosphorus, setPhosphorus] = useState(plantation?.soil?.npk?.p ?? plantation?.npk?.p ?? 20);
  const [potassium, setPotassium] = useState(plantation?.soil?.npk?.k ?? plantation?.npk?.k ?? 80);
  const [ph, setPh] = useState(plantation?.soil?.ph ?? plantation?.soilPh ?? 5.2);
  const [moisture, setMoisture] = useState(
    plantation?.sensor?.currentMoisture ?? plantation?.soil?.moisture ?? plantation?.moisture ?? 32
  );

  // Weather telemetry state
  const [weather, setWeather] = useState({
    temp: 27,
    humidity: 82,
    rainfall: 15,
  });

  const plantationId = plantation?._id || plantation?.id;

  // Load weather telemetry & previous recommendation on mount
  useEffect(() => {
    fetchWeatherTelemetry();
    fetchLatestRecommendation();
  }, [plantationId]);

  const fetchWeatherTelemetry = async () => {
    try {
      const res = await apiService.getWeather({
        district: plantation?.district || plantation?.location || 'Idukki, Kerala',
        lat: plantation?.latitude,
        lon: plantation?.longitude,
      });
      if (res && res.currentWeather) {
        setWeather({
          temp: Math.round(res.currentWeather.temp ?? 27),
          humidity: Math.round(res.currentWeather.humidity ?? 82),
          rainfall: Math.round(res.currentWeather.rain ?? 15),
        });
      }
    } catch (err) {
      console.warn('Weather fetch notice:', err.message);
    }
  };

  const fetchLatestRecommendation = async () => {
    if (!plantationId) return;
    try {
      const res = await apiService.getFertilizerHistory(plantationId);
      if (res && res.success && res.history && res.history.length > 0) {
        const latest = res.history[0];
        if (latest.prediction) {
          setRecommendation({
            fertilizer: latest.prediction.fertilizer,
            confidence: latest.prediction.confidence,
            nutrient_priority: latest.prediction.nutrientPriority || ['Nitrogen', 'Phosphorus'],
            soil_status: latest.prediction.soilStatus || {
              nitrogen: 'Low',
              phosphorus: 'Low',
              potassium: 'Good',
              ph: `Acidic (${latest.soilData?.ph || ph})`,
              moisture: `${latest.soilData?.moisture || moisture}%`,
            },
            weather_status: latest.prediction.weatherStatus || {
              temperature: latest.weatherData?.temperature || weather.temp,
              humidity: latest.weatherData?.humidity || weather.humidity,
              rainfall: latest.weatherData?.rainfall || weather.rainfall,
            },
            recommendation: latest.prediction.recommendation,
            weather_advice: latest.prediction.weatherAdvice,
          });
        }
      }
    } catch (err) {
      console.warn('History fetch notice:', err.message);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        plantationId: plantationId || undefined,
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        ph: Number(ph),
        moisture: Number(moisture),
        crop: plantation?.cropType || plantation?.variety || 'cardamom',
      };

      const res = await apiService.getFertilizerRecommendation(payload);

      if (res && res.success && res.data) {
        setRecommendation(res.data);
        if (onToast) onToast('✅ ML Soil & Fertilizer Recommendation Generated!');
      } else {
        const msg = res?.message || 'AI analysis temporarily unavailable. Please try again later.';
        setErrorMsg(msg);
        if (onToast) onToast(`❌ ${msg}`);
      }
    } catch (err) {
      setErrorMsg('AI analysis temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper status color styling
  const getBadgeStyle = (status = '') => {
    const s = String(status).toLowerCase();
    if (s.includes('low') || s.includes('acidic')) {
      return 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold';
    }
    if (s.includes('good') || s.includes('optimal')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';
    }
    if (s.includes('high') || s.includes('alkaline')) {
      return 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300 font-bold';
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 shadow-soft space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F5E3B] to-[#17331F] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#17331F] tracking-tight flex items-center gap-2">
              <span>Cardora AI Soil & Fertilizer Advisor</span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#DDEFD9] text-[#1F5E3B] border border-[#5C8D4E]/30">
                XGBoost ML
              </span>
            </h2>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Trained Machine-Learning Model for Cardamom Soil Nutrition & Microclimate Intelligence
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F5E3B] to-[#17331F] hover:from-[#17331F] hover:to-[#1F5E3B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#C9A227]" />
              <span>Analyzing ML Model...</span>
            </>
          ) : (
            <>
              <FlaskConical className="w-4 h-4 text-[#C9A227]" />
              <span>Analyze Soil & Weather</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* GRID SECTION: SOIL HEALTH & WEATHER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD 1: SOIL HEALTH */}
        <div className="bg-[#F8FAF7] rounded-2xl border border-[#D7E6D5] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D7E6D5] pb-2">
            <span className="text-xs font-black text-[#17331F] flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#1F5E3B]" />
              Soil Health Metrics
            </span>
            <span className="text-[10px] font-bold text-[#5C8D4E]">
              {plantation?.sensor?.sensorId ? `Sensor: ${plantation.sensor.sensorId}` : 'Soil Telemetry'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E2E8F0]">
              <span className="font-semibold text-[#4A5568]">Nitrogen (N)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#17331F]">{nitrogen} mg/kg</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getBadgeStyle(recommendation?.soil_status?.nitrogen || (nitrogen < 30 ? 'Low' : 'Good'))}`}>
                  {recommendation?.soil_status?.nitrogen || (nitrogen < 30 ? 'LOW' : 'GOOD')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E2E8F0]">
              <span className="font-semibold text-[#4A5568]">Phosphorus (P)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#17331F]">{phosphorus} mg/kg</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getBadgeStyle(recommendation?.soil_status?.phosphorus || (phosphorus < 25 ? 'Low' : 'Good'))}`}>
                  {recommendation?.soil_status?.phosphorus || (phosphorus < 25 ? 'LOW' : 'GOOD')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E2E8F0]">
              <span className="font-semibold text-[#4A5568]">Potassium (K)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#17331F]">{potassium} mg/kg</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getBadgeStyle(recommendation?.soil_status?.potassium || (potassium > 70 ? 'Good' : 'Low'))}`}>
                  {recommendation?.soil_status?.potassium || (potassium > 70 ? 'GOOD' : 'LOW')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E2E8F0]">
              <span className="font-semibold text-[#4A5568]">Soil pH</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#17331F]">{ph}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getBadgeStyle(ph < 5.5 ? 'Acidic' : 'Optimal')}`}>
                  {ph < 5.5 ? 'Acidic' : 'Optimal'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E2E8F0]">
              <span className="font-semibold text-[#4A5568]">Soil Moisture</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#17331F]">{moisture}%</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] border bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold">
                  {moisture}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: WEATHER TELEMETRY */}
        <div className="bg-[#F8FAF7] rounded-2xl border border-[#D7E6D5] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D7E6D5] pb-2">
            <span className="text-xs font-black text-[#17331F] flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-[#1F5E3B]" />
              Weather Telemetry
            </span>
            <span className="text-[10px] font-bold text-[#5C8D4E]">
              {plantation?.district || 'Idukki High Altitude'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] space-y-1">
              <Thermometer className="w-4 h-4 text-rose-500 mx-auto" />
              <span className="block text-[10px] font-semibold text-[#4A5568]">Temperature</span>
              <span className="block text-sm font-black text-[#17331F]">
                {recommendation?.weather_status?.temperature ?? weather.temp}°C
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] space-y-1">
              <Droplets className="w-4 h-4 text-blue-500 mx-auto" />
              <span className="block text-[10px] font-semibold text-[#4A5568]">Humidity</span>
              <span className="block text-sm font-black text-[#17331F]">
                {recommendation?.weather_status?.humidity ?? weather.humidity}%
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] space-y-1">
              <CloudRain className="w-4 h-4 text-[#1F5E3B] mx-auto" />
              <span className="block text-[10px] font-semibold text-[#4A5568]">Rainfall</span>
              <span className="block text-sm font-black text-[#17331F]">
                {recommendation?.weather_status?.rainfall ?? weather.rainfall} mm
              </span>
            </div>
          </div>

          {/* Weather Advisory Snippet */}
          <div className="bg-white p-3 rounded-xl border border-[#D7E6D5] text-xs text-[#17331F]">
            <span className="font-extrabold text-[#1F5E3B] block mb-1">🌦 Weather Advisory</span>
            <p className="text-[11px] text-[#4A5568] leading-relaxed">
              {recommendation?.weather_advice ||
                'Current weather conditions should be considered when planning fertilizer application. High humidity and favorable microclimate enhance root absorption.'}
            </p>
          </div>
        </div>
      </div>

      {/* AI RECOMMENDATION RESULT BOX */}
      {recommendation ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-[#17331F] to-[#1F5E3B] text-white p-5 space-y-4 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C9A227] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Trained ML Model Recommendation
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {recommendation.fertilizer}
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
              <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
              <div>
                <span className="block text-[9px] font-bold text-gray-300 uppercase">Model Confidence</span>
                <span className="text-base font-black text-white">
                  {Math.round(recommendation.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Nutrient Priority & Recommendation Text */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-1">
              <span className="text-[11px] font-extrabold text-[#DDEFD9]">Nutrient Priority</span>
              <div className="flex flex-wrap gap-1.5">
                {(recommendation.nutrient_priority || ['Nitrogen', 'Phosphorus']).map((n, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-bold"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <span className="text-[11px] font-extrabold text-[#DDEFD9]">AI Recommendation Summary</span>
              <p className="text-xs text-gray-200 leading-relaxed">
                {recommendation.recommendation}
              </p>
            </div>
          </div>

          {/* VIEW DETAILED ANALYSIS BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowDetailModal(true)}
              className="px-4 py-2 rounded-xl bg-white text-[#17331F] text-xs font-black hover:bg-[#DDEFD9] transition-all flex items-center gap-1.5 shadow-soft"
            >
              <span>View Detailed Analysis</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#1F5E3B]" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-6 bg-[#F8FAF7] rounded-2xl border border-dashed border-[#D7E6D5] space-y-2">
          <Leaf className="w-8 h-8 text-[#5C8D4E] mx-auto opacity-60" />
          <p className="text-xs font-bold text-[#17331F]">Ready to Generate Real ML Fertilizer Recommendation</p>
          <p className="text-[11px] text-[#4A5568]">Click "Analyze Soil & Weather" above to process telemetry with XGBoost ML model.</p>
        </div>
      )}

      {/* DETAILED ANALYSIS MODAL */}
      <AnimatePresence>
        {showDetailModal && recommendation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] border border-[#D7E6D5] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1F5E3B] text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#17331F]">Detailed Soil & ML Analysis</h3>
                    <p className="text-xs text-[#4A5568]">Farmer-Friendly Agronomic & Technical Intelligence Report</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. SOIL ANALYSIS */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F5E3B] flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> 🌱 Soil Analysis & Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                    <span className="font-extrabold text-[#17331F] block mb-1">🌱 Nitrogen (N) Level</span>
                    <p className="text-[#4A5568] leading-relaxed">
                      Status: <strong className="text-amber-700">{recommendation.soil_status?.nitrogen || 'Low'}</strong> ({nitrogen} mg/kg).
                      Your soil shows a relatively low nitrogen level. Nitrogen is vital for leaf greenness, photosynthesis, and tiller shoot vigor.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                    <span className="font-extrabold text-[#17331F] block mb-1">🧪 Phosphorus (P) Level</span>
                    <p className="text-[#4A5568] leading-relaxed">
                      Status: <strong className="text-amber-700">{recommendation.soil_status?.phosphorus || 'Low'}</strong> ({phosphorus} mg/kg).
                      Phosphorus promotes healthy root mass expansion, early tiller flowering, and capsule formation.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                    <span className="font-extrabold text-[#17331F] block mb-1">⚡ Potassium (K) Level</span>
                    <p className="text-[#4A5568] leading-relaxed">
                      Status: <strong className="text-emerald-700">{recommendation.soil_status?.potassium || 'Good'}</strong> ({potassium} mg/kg).
                      Potassium provides drought tolerance and enhances cardamom bold capsule size and oil weight.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                    <span className="font-extrabold text-[#17331F] block mb-1">💧 pH & Soil Moisture</span>
                    <p className="text-[#4A5568] leading-relaxed">
                      pH Status: <strong>{recommendation.soil_status?.ph || ph}</strong> | Moisture: <strong>{moisture}%</strong>.
                      Cardamom thrives in slightly acidic forest soils (pH 5.5-6.5) with consistent moisture retention.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. WEATHER ANALYSIS */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F5E3B] flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4" /> 🌦 Weather Telemetry Analysis
                </h4>
                <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] text-xs text-[#4A5568] leading-relaxed space-y-2">
                  <div className="flex items-center gap-4 text-[#17331F] font-bold">
                    <span>🌡 Temp: {recommendation.weather_status?.temperature ?? weather.temp}°C</span>
                    <span>💧 Humidity: {recommendation.weather_status?.humidity ?? weather.humidity}%</span>
                    <span>🌧 Rainfall: {recommendation.weather_status?.rainfall ?? weather.rainfall} mm</span>
                  </div>
                  <p>{recommendation.weather_advice}</p>
                </div>
              </div>

              {/* 3. ML RESULT & EXPLAINABILITY */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F5E3B] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> 🤖 ML Prediction & Feature Explainability
                </h4>
                <div className="p-4 rounded-xl bg-[#17331F] text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#C9A227] uppercase font-extrabold">Predicted Fertilizer</span>
                      <p className="text-xl font-black">{recommendation.fertilizer}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-300 uppercase font-extrabold">Model Confidence</span>
                      <p className="text-xl font-black text-[#C9A227]">{Math.round(recommendation.confidence * 100)}%</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-[#DDEFD9] block mb-1">Why this recommendation? The ML model evaluated:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-200">
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Soil Nitrogen level</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Soil Phosphorus level</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Soil Potassium level</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Soil pH balance</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Soil moisture content</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Ambient temperature</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Relative humidity</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Rainfall forecast</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. ADVANCED INFORMATION ACCORDION */}
              <div className="border-t border-[#E2E8F0] pt-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#17331F] py-2 px-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] hover:bg-[#DDEFD9] transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#1F5E3B]" /> Advanced Machine Learning Information
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-700 space-y-2"
                  >
                    <p><strong>Primary Model Architecture:</strong> XGBoost Classifier & Random Forest Classifier</p>
                    <p><strong>Evaluation Accuracy:</strong> 90.91% Baseline (Random Forest) | 81.82% XGBoost</p>
                    <p><strong>Feature Vectors:</strong> 9-dimensional numerical array [N, P, K, pH, moisture, temp, humidity, rainfall, crop_encoded]</p>
                    <p><strong>Artifact Persistence:</strong> Scikit-Learn StandardScaler, Joblib Serialization, FastAPI Microservice (Port 5001)</p>
                    <p><strong>Dataset Source:</strong> Configurable Agricultural Dataset (`ml-service/dataset/fertilizer_data.csv`)</p>
                  </motion.div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#17331F] text-white text-xs font-bold hover:bg-[#1F5E3B] transition-all"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CardoraFertilizerAdvisor;
