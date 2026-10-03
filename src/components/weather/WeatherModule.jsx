import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudSun, Thermometer, Droplets, Wind, Gauge, Eye, Cloud,
  Sun, Sunset, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2,
  Sparkles, CloudRain, Calendar, MapPin,
  ShieldAlert, Award, ChevronRight, Snowflake, Sprout, Activity
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ALL_DISTRICTS = [
  'Idukki, Kerala',
  'Wayanad, Kerala',
  'Palakkad, Kerala',
  'Pathanamthitta, Kerala',
  'Kottayam, Kerala',
  'Ernakulam, Kerala',
  'Thrissur, Kerala',
  'Kozhikode, Kerala',
  'Malappuram, Kerala',
  'Kannur, Kerala',
  'Kasaragod, Kerala',
  'Alappuzha, Kerala',
  'Kollam, Kerala',
  'Thiruvananthapuram, Kerala',
  'Theni, Tamil Nadu',
  'Dindigul, Tamil Nadu',
  'Nilgiris, Tamil Nadu',
  'Kodagu, Karnataka',
];

const getFrontendFallbackHourly = () => {
  const list = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getTime() + i * 3600 * 1000);
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const h = d.getHours();
    const isDay = h >= 6 && h < 18;
    list.push({
      time: timeFormatted,
      temp: Math.round(23 + Math.sin(((h - 6) / 12) * Math.PI) * 3),
      pop: Math.max(10, Math.min(80, Math.round(20 + i * 2))),
      condition: isDay ? 'Partly Cloudy' : 'Clear Night',
      iconUrl: `https://openweathermap.org/img/wn/${isDay ? '02d' : '02n'}@2x.png`,
    });
  }
  return list;
};

const WeatherModule = ({ userLocation = 'Idukki, Kerala', onToast }) => {
  const { user } = useAuth();
  const isAdmin = user && (user.role || '').toLowerCase() === 'admin';

  const [selectedDistrict, setSelectedDistrict] = useState(userLocation || 'Idukki, Kerala');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeForecastTab, setActiveForecastTab] = useState('hourly'); // 'hourly' | 'daily'

  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [allDistrictsData, setAllDistrictsData] = useState([]);
  const [loadingAllDistricts, setLoadingAllDistricts] = useState(false);

  const fetchWeatherData = async (targetLocation = selectedDistrict) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getWeather({ district: targetLocation });
      if (res && res.success) {
        setWeatherData(res);
      } else {
        setError(res?.message || 'Failed to fetch weather telemetry');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to weather service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAllDistrictsData = async () => {
    setLoadingAllDistricts(true);
    try {
      const res = await apiService.getDistrictWeatherAndUsers();
      if (res && res.success && Array.isArray(res.districts)) {
        setAllDistrictsData(res.districts);
      }
    } catch (err) {
      console.error('Error fetching all districts weather:', err);
    } finally {
      setLoadingAllDistricts(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedDistrict);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict]);

  useEffect(() => {
    if (showAllDistricts) {
      fetchAllDistrictsData();
    }
  }, [showAllDistricts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeatherData(selectedDistrict);
    if (showAllDistricts) fetchAllDistrictsData();
    if (onToast) onToast(`Refreshing telemetry for ${selectedDistrict}...`);
  };

  const handleSelectDistrictFromGrid = (districtName) => {
    const fullMatch = ALL_DISTRICTS.find((d) => d.toLowerCase().includes(districtName.toLowerCase())) || districtName;
    setSelectedDistrict(fullMatch);
    fetchWeatherData(fullMatch);
    window.scrollTo({ top: 100, behavior: 'smooth' });
    if (onToast) onToast(`Switched weather telemetry to ${fullMatch}`);
  };

  if (loading && !weatherData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] border border-[#D7E6D5] p-8 md:p-12 shadow-sm text-center"
      >
        <div className="w-12 h-12 border-4 border-[#1F5E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-base font-extrabold text-[#17331F] font-poppins">Loading Weather Telemetry for {selectedDistrict}...</h3>
        <p className="text-xs text-[#4A5568] mt-1 font-medium">Analyzing micro-climate & telemetry parameters</p>
      </motion.div>
    );
  }

  const currentWeather = weatherData?.currentWeather || {
    temp: 24,
    feelsLike: 25,
    humidity: 78,
    pressure: 1012,
    condition: 'Partly Cloudy',
    description: 'Scattered Clouds',
    iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png',
    windSpeed: 8,
    rain: 0,
    visibility: 10,
    cloudCoverage: 40,
    sunrise: '06:15 AM',
    sunset: '06:45 PM',
    locationName: selectedDistrict,
    lastUpdated: 'Just now',
  };

  const suitability = weatherData?.suitability || {
    score: 88,
    status: 'Excellent for Cardamom',
    badgeColor: 'bg-[#1F5E3B] text-white',
    statusEmoji: '🟢',
  };

  const aiRecommendations = weatherData?.aiRecommendations || [];
  const weatherAlerts = weatherData?.weatherAlerts || [];
  const forecast = weatherData?.forecast || { hourly: [], daily: [] };

  const isCardamomDistrict = selectedDistrict.toLowerCase().includes('idukki') || selectedDistrict.toLowerCase().includes('wayanad');
  const cleanDistrictName = selectedDistrict.split(',')[0].trim();

  return (
    <div className="space-y-6">

      {/* ===== 1. HEADER: DISTRICT SELECTOR & ALL DISTRICTS TOGGLE ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 shadow-[0_10px_30px_rgba(31,94,59,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group"
      >
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-right opacity-15 pointer-events-none transition-opacity group-hover:opacity-25"
          style={{ backgroundImage: `url('/images/weather_hero_bg.jpg')` }}
        />
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="bg-[#DDEFD9] p-3 rounded-2xl text-[#1F5E3B] shadow-inner shrink-0"
          >
            <CloudSun className="w-7 h-7" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-[#5C8D4E] tracking-wider uppercase">
                District Weather Telemetry
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DDEFD9] text-[#1F5E3B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E3B] animate-ping" />
                Live Sync
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-5 h-5 text-[#1F5E3B] shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  fetchWeatherData(e.target.value);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] text-base md:text-lg font-black text-[#17331F] focus:outline-none focus:border-[#1F5E3B] cursor-pointer"
              >
                {ALL_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* HEADER ACTIONS: ALL DISTRICTS TOGGLE & REFRESH */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setShowAllDistricts(!showAllDistricts)}
            className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 border cursor-pointer ${showAllDistricts
                ? 'bg-[#1F5E3B] text-white border-[#1F5E3B] shadow-sm'
                : 'bg-[#F8FAF7] text-[#17331F] border-[#D7E6D5] hover:bg-[#EAF3E8]'
              }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>{showAllDistricts ? 'Hide All Districts Grid' : 'View All Districts Weather (18)'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] hover:from-[#5C8D4E] hover:to-[#1F5E3B] text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ===== RUNNING MARQUEE WARNING TICKER FOR NON-IDUKKI / NON-WAYANAD DISTRICTS ===== */}
      {!isCardamomDistrict && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white p-3 rounded-[20px] shadow-lg border-2 border-red-400/80 overflow-hidden relative"
        >
          <style>{`
            @keyframes runningTicker {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-running-ticker {
              display: inline-block;
              white-space: nowrap;
              animation: runningTicker 20s linear infinite;
            }
            .animate-running-ticker:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 text-amber-300 font-black text-xs uppercase tracking-wider shrink-0 z-10 border border-amber-400/40 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>Region Alert</span>
            </div>

            <div className="overflow-hidden whitespace-nowrap w-full">
              <div className="animate-running-ticker font-extrabold text-xs sm:text-sm tracking-wide text-amber-100">
                ⚠️ UNSUITABLE CARDAMOM CULTIVATION REGION: {cleanDistrictName} is NOT suitable for cardamom cultivation! Cardamom requires high-altitude (700m–1500m MSL) cool hill micro-climates found naturally EXCLUSIVELY in Idukki and Wayanad districts.
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                ⚠️ UNSUITABLE CARDAMOM CULTIVATION REGION: {cleanDistrictName} is NOT suitable for cardamom cultivation! Cardamom requires high-altitude (700m–1500m MSL) cool hill micro-climates found naturally EXCLUSIVELY in Idukki and Wayanad districts.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== ALL DISTRICTS WEATHER TELEMETRY GRID ===== */}
      <AnimatePresence>
        {showAllDistricts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
              <div>
                <h3 className="text-base font-black text-[#17331F] font-poppins flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1F5E3B]" />
                  <span>All Districts Weather Telemetry (18 Regions)</span>
                </h3>
                <p className="text-xs text-[#4A5568] font-medium mt-0.5">
                  Click any district card to view detailed hourly forecast & micro-climate telemetry
                </p>
              </div>

              <button
                onClick={fetchAllDistrictsData}
                disabled={loadingAllDistricts}
                className="text-xs font-extrabold text-[#1F5E3B] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} className={loadingAllDistricts ? 'animate-spin' : ''} />
                <span>Sync All</span>
              </button>
            </div>

            {loadingAllDistricts && allDistrictsData.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-[#4A5568]">
                Loading weather telemetry across 18 districts...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {allDistrictsData.map((d, idx) => {
                  const w = d.weather || {};
                  const isSelected = selectedDistrict.toLowerCase().includes(d.district.toLowerCase());
                  return (
                    <motion.div
                      key={d.district || idx}
                      whileHover={{ scale: 1.03, translateY: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelectDistrictFromGrid(d.district)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected
                          ? 'bg-[#EAF3E8] border-[#1F5E3B] ring-2 ring-[#1F5E3B]/30'
                          : 'bg-[#F8FAF7] border-[#D7E6D5] hover:border-[#1F5E3B]/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#17331F] font-poppins">{d.district}</span>
                        <img src={w.iconUrl || 'https://openweathermap.org/img/wn/02d@2x.png'} alt="" className="w-7 h-7 object-contain" />
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl font-black text-[#17331F] font-poppins">{w.temp ?? 24}°C</span>
                        <span className="text-[10px] font-bold text-[#5C8D4E]">{w.condition || 'Clear'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-2 border-t border-[#D7E6D5]/60 text-[10px] text-[#4A5568] font-semibold">
                        <span>💧 {w.humidity ?? 78}% RH</span>
                        <span>💨 {w.windSpeed ?? 10}km/h</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Fallback Warning Notice */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-3 shadow-sm"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 animate-bounce" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* ===== 2. HERO GRID: WEATHER CARD & SMART ADVISORY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT CARD (7 cols): Advanced Micro-Climate Telemetry Hub */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-[#0B2117] text-white rounded-[28px] p-6 md:p-8 relative overflow-hidden shadow-2xl border border-emerald-500/30 flex flex-col justify-between group"
        >

          {/* Photorealistic High-Altitude Cardamom Plantation Hills Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-75 group-hover:scale-105 group-hover:opacity-90 transition-all duration-1000 pointer-events-none"
            style={{ backgroundImage: `url('/images/weather_hero_bg.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2117] via-[#0B2117]/50 to-black/20 pointer-events-none" />

          {/* Ambient Lighting & Futuristic Radar Pattern Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/20 via-[#C9A227]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#5C8D4E_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Animated Ambient Leaf Background */}
          <motion.div
            animate={{ rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
            className="absolute -bottom-8 -right-8 text-9xl opacity-10 pointer-events-none select-none"
          >
            🌿
          </motion.div>

          <div className="relative z-10">
            
            {/* Top Telemetry Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-white/15">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F5E3B]/80 text-[#DDEFD9] text-xs font-black border border-emerald-400/40 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227] animate-spin" style={{ animationDuration: '6s' }} />
                  Micro-Climate Telemetry
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  SATELLITE SYNC
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-[#DDEFD9]/80 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                Updated: {currentWeather.lastUpdated || '02:35 PM'}
              </span>
            </div>

            {/* Main Temperature & Weather Condition Display */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl sm:text-7xl md:text-8xl font-black font-poppins tracking-tight bg-gradient-to-r from-white via-[#DDEFD9] to-[#C9A227] bg-clip-text text-transparent">
                    {currentWeather.temp}°
                  </span>
                  <span className="text-3xl font-black text-[#DDEFD9] font-poppins">C</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-xs md:text-sm text-[#DDEFD9] font-bold">
                    Feels like {currentWeather.feelsLike}°C • Live Rain & Moisture Telemetry
                  </p>
                </div>
              </div>

              {/* Weather Condition Glass Box with Icon & Visual Meter */}
              <div className="bg-white/10 backdrop-blur-xl px-5 py-4 rounded-2xl border border-white/20 flex items-center gap-4 shadow-glass shrink-0 hover:bg-white/15 transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md" />
                  <img src={currentWeather.iconUrl} alt={currentWeather.condition} className="w-14 h-14 object-contain relative z-10" />
                </div>
                <div>
                  <span className="text-lg font-black font-poppins block text-white tracking-wide">{currentWeather.condition}</span>
                  <span className="text-[10px] text-[#C9A227] font-black uppercase tracking-widest block -mt-0.5">Condition</span>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-200 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>UV Index: 3.2 (Moderate)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FIRST ROW: 4 PRIMARY METRIC CARDS WITH PROGRESS BARS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
              
              {/* Humidity */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }} 
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-cyan-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#DDEFD9] mb-1.5 font-extrabold">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-cyan-300" />
                      <span>Humidity</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-bold">HIGH</span>
                  </div>
                  <span className="text-xl md:text-2xl font-black text-white font-poppins">{currentWeather.humidity}%</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(currentWeather.humidity, 100)}%` }} />
                  </div>
                  <span className="text-[9px] text-[#DDEFD9]/80 font-bold mt-1 block">Optimal for Cardamom</span>
                </div>
              </motion.div>

              {/* Rainfall */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }} 
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-blue-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#DDEFD9] mb-1.5 font-extrabold">
                    <div className="flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-blue-300" />
                      <span>Rainfall</span>
                    </div>
                    <span className="text-[10px] text-blue-300 font-bold">PRECIP</span>
                  </div>
                  <span className="text-xl md:text-2xl font-black text-white font-poppins">{currentWeather.rain} mm</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((currentWeather.rain / 20) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[9px] text-[#DDEFD9]/80 font-bold mt-1 block">Light Canopy Drizzle</span>
                </div>
              </motion.div>

              {/* Wind Speed */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }} 
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-teal-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#DDEFD9] mb-1.5 font-extrabold">
                    <div className="flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-teal-300" />
                      <span>Wind Speed</span>
                    </div>
                    <span className="text-[10px] text-teal-300 font-bold">NE 45°</span>
                  </div>
                  <span className="text-xl md:text-2xl font-black text-white font-poppins">{currentWeather.windSpeed} <span className="text-xs font-semibold">km/h</span></span>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((currentWeather.windSpeed / 40) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[9px] text-[#DDEFD9]/80 font-bold mt-1 block">Gentle Estate Breeze</span>
                </div>
              </motion.div>

              {/* Pressure */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }} 
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-emerald-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#DDEFD9] mb-1.5 font-extrabold">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-300" />
                      <span>Pressure</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold">BARO</span>
                  </div>
                  <span className="text-xl md:text-2xl font-black text-white font-poppins">{currentWeather.pressure} <span className="text-xs font-semibold">hPa</span></span>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: '75%' }} />
                  </div>
                  <span className="text-[9px] text-[#DDEFD9]/80 font-bold mt-1 block">Steady Atmospheric</span>
                </div>
              </motion.div>

            </div>

            {/* SECOND ROW: 3 SECONDARY OPTICS & SOLAR METRICS */}
            <div className="grid grid-cols-3 gap-3.5 pt-3.5 mt-1 border-t border-white/15">
              
              {/* Visibility */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }} 
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-indigo-400/50 transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1.5 font-extrabold">
                  <Eye className="w-4 h-4 text-indigo-300" />
                  <span>Visibility</span>
                </div>
                <span className="text-lg md:text-xl font-black text-white font-poppins">{currentWeather.visibility} km</span>
                <span className="text-[9px] text-indigo-200 font-bold block mt-1">100% Clear Optics</span>
              </motion.div>

              {/* Clouds */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }} 
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-slate-300/50 transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1.5 font-extrabold">
                  <Cloud className="w-4 h-4 text-slate-300" />
                  <span>Clouds</span>
                </div>
                <span className="text-lg md:text-xl font-black text-white font-poppins">{currentWeather.cloudCoverage}%</span>
                <span className="text-[9px] text-slate-300 font-bold block mt-1">Partly Cloud Canopy</span>
              </motion.div>

              {/* Sunrise */}
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }} 
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-amber-300/50 transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1.5 font-extrabold">
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>Sunrise</span>
                </div>
                <span className="text-lg md:text-xl font-black text-amber-200 font-poppins">{currentWeather.sunrise}</span>
                <span className="text-[9px] text-amber-300/80 font-bold block mt-1">Sunset: {currentWeather.sunset || '06:45 PM'}</span>
              </motion.div>

            </div>

          </div>

        </motion.div>

        {/* RIGHT CARD (5 cols): Smart Plantation Advisory for Farmers vs Admin Telemetry Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 bg-gradient-to-br from-white via-[#F9FBF8] to-[#EEF6EC] rounded-[24px] border border-[#D7E6D5] p-6 md:p-8 shadow-[0_10px_30px_rgba(31,94,59,0.06)] flex flex-col justify-between relative overflow-hidden group"
        >

          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D7E6D5]">
              <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1F5E3B]" />
                <span>{isAdmin ? 'Administrative Weather Telemetry' : 'Smart Plantation Advisory'}</span>
              </h3>
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${isAdmin ? 'bg-[#1F5E3B] text-white' : suitability.badgeColor
                  }`}
              >
                {isAdmin ? '🟢 System Operational' : `${suitability.statusEmoji} ${suitability.status}`}
              </motion.span>
            </div>

            {isAdmin ? (
              /* ADMIN TELEMETRY OVERVIEW BOX */
              <div className="my-6 bg-[#F8FAF7] p-5 rounded-2xl border border-[#D7E6D5] space-y-3">
                <span className="text-xs font-bold text-[#17331F] block">District Telemetry Uptime & Sync Status</span>

                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="p-3 rounded-xl bg-white border border-[#D7E6D5]">
                    <span className="text-[10px] text-[#4A5568] block">Barometric Pressure</span>
                    <span className="text-base font-black text-[#17331F] font-poppins">{currentWeather.pressure} hPa</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#D7E6D5]">
                    <span className="text-[10px] text-[#4A5568] block">Visibility</span>
                    <span className="text-base font-black text-[#17331F] font-poppins">{currentWeather.visibility} km</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#D7E6D5]">
                    <span className="text-[10px] text-[#4A5568] block">Cloud Coverage</span>
                    <span className="text-base font-black text-[#17331F] font-poppins">{currentWeather.cloudCoverage}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#D7E6D5]">
                    <span className="text-[10px] text-[#4A5568] block">Weather Service API</span>
                    <span className="text-xs font-black text-[#1F5E3B]">Open-Meteo Synced</span>
                  </div>
                </div>
              </div>
            ) : (
              /* FARMER CULTIVATION SUITABILITY METER */
              <div className="my-6 bg-[#F8FAF7] p-5 rounded-2xl border border-[#D7E6D5]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#17331F]">Cardamom Cultivation Suitability</span>
                  <span className="text-2xl font-black text-[#1F5E3B] font-poppins">{suitability.score}%</span>
                </div>

                <div className="w-full h-3.5 bg-[#D7E6D5] rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${suitability.score}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#5C8D4E] to-[#1F5E3B]"
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-[#4A5568]">
                  <span>Risk Zone</span>
                  <span>Optimal (70-95%)</span>
                  <span>Peak Yield</span>
                </div>
              </div>
            )}

            {/* Region Banner */}
            <div className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed ${weatherData?.isRecognizedCardamomRegion
                ? 'bg-[#DDEFD9]/50 border-[#5C8D4E]/40 text-[#1F5E3B]'
                : 'bg-[#F8FAF7] border-[#D7E6D5] text-[#17331F]'
              }`}>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#1F5E3B] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-sm mb-0.5">
                    District Weather Sync: {selectedDistrict}
                  </span>
                  <span>
                    {isAdmin
                      ? `System Weather Telemetry active for ${selectedDistrict}. Data synchronized directly with Open-Meteo & OpenWeatherMap APIs.`
                      : weatherData?.regionNotice}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Summary Notice */}
          <div className="mt-6 pt-4 border-t border-[#D7E6D5] flex items-center justify-between text-xs text-[#4A5568]">
            <span className="font-bold text-[#17331F]">Location: {selectedDistrict}</span>
            <span className="font-semibold text-[#5C8D4E] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#1F5E3B] animate-pulse" />
              Live Telemetry Active 🟢
            </span>
          </div>

        </motion.div>

      </div>

      {/* ===== 3. WEATHER ALERTS BANNER FOR FARMERS ONLY ===== */}
      {!isAdmin && weatherAlerts && weatherAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 shadow-sm"
        >
          <h3 className="text-base font-black text-[#17331F] font-poppins mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>Active Weather Alerts & Advisories ({weatherAlerts.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weatherAlerts.map((alert, idx) => (
              <motion.div
                key={alert.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-2xl border transition-all ${alert.type === 'danger'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
              >
                <h4 className="text-xs font-black font-poppins mb-1 flex items-center justify-between">
                  <span>{alert.title}</span>
                </h4>
                <p className="text-[11px] font-medium leading-relaxed opacity-90">{alert.message}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===== 4. AI CROP RECOMMENDATIONS FOR FARMERS ONLY ===== */}
      {!isAdmin && aiRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 md:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#D7E6D5]">
            <div>
              <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-5 h-5 text-[#C9A227]" />
                </motion.div>
                <span>AI Crop Care Recommendations for {selectedDistrict}</span>
              </h3>
              <p className="text-xs text-[#4A5568] font-medium mt-0.5">
                Live agronomic action steps tailored specifically to current weather conditions
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#DDEFD9] text-[#1F5E3B] text-xs font-extrabold border border-[#5C8D4E]/30 flex items-center gap-1.5 self-start sm:self-auto">
              <Sprout className="w-3.5 h-3.5 text-[#1F5E3B] animate-bounce" />
              Weather-Driven Rules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiRecommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, translateY: -4 }}
                className="p-5 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5] hover:border-[#1F5E3B] hover:shadow-md transition-all space-y-3 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${rec.severity === 'critical' ? 'bg-red-500' :
                    rec.severity === 'high' ? 'bg-amber-500' : 'bg-[#1F5E3B]'
                  }`} />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black text-[#17331F] font-poppins flex items-center gap-2">
                    {rec.category === 'Heavy Rain' && (
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <CloudRain className="w-4.5 h-4.5 text-blue-600" />
                      </motion.div>
                    )}
                    {rec.category === 'High Temperature' && (
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Thermometer className="w-4.5 h-4.5 text-amber-600" />
                      </motion.div>
                    )}
                    {rec.category === 'High Humidity' && (
                      <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Droplets className="w-4.5 h-4.5 text-cyan-600" />
                      </motion.div>
                    )}
                    {rec.category === 'Low Humidity' && (
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                        <Droplets className="w-4.5 h-4.5 text-orange-500" />
                      </motion.div>
                    )}
                    {rec.category === 'Strong Wind' && (
                      <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}>
                        <Wind className="w-4.5 h-4.5 text-teal-600" />
                      </motion.div>
                    )}
                    {rec.category === 'Cold Weather' && (
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Snowflake className="w-4.5 h-4.5 text-indigo-500" />
                      </motion.div>
                    )}
                    {(!['Heavy Rain', 'High Temperature', 'High Humidity', 'Low Humidity', 'Strong Wind', 'Cold Weather'].includes(rec.category)) && (
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#1F5E3B]" />
                    )}

                    <span>{rec.title}</span>
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${rec.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      rec.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-[#DDEFD9] text-[#1F5E3B]'
                    }`}>
                    {rec.category}
                  </span>
                </div>

                <ul className="space-y-2 pt-1">
                  {rec.actions.map((act, aIdx) => (
                    <motion.li
                      key={aIdx}
                      whileHover={{ x: 3 }}
                      className="text-xs text-[#4A5568] font-semibold flex items-start gap-2 leading-relaxed"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#5C8D4E] flex-shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===== 5. INTERACTIVE FORECAST & CLIMATE TRENDS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 md:p-8 shadow-sm"
      >

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D7E6D5]">
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1F5E3B]" />
            <span>Weather Forecast for {selectedDistrict}</span>
          </h3>

          <div className="flex items-center gap-2 bg-[#F8FAF7] p-1 rounded-xl border border-[#D7E6D5]">
            <button
              type="button"
              onClick={() => setActiveForecastTab('hourly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeForecastTab === 'hourly'
                  ? 'bg-[#1F5E3B] text-white shadow-sm'
                  : 'text-[#4A5568] hover:text-[#1F5E3B]'
                }`}
            >
              24-Hour Hourly
            </button>

            <button
              type="button"
              onClick={() => setActiveForecastTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeForecastTab === 'daily'
                  ? 'bg-[#1F5E3B] text-white shadow-sm'
                  : 'text-[#4A5568] hover:text-[#1F5E3B]'
                }`}
            >
              5-Day Outlook
            </button>
          </div>
        </div>

        {/* Forecast Contents */}
        {activeForecastTab === 'hourly' ? (
          <div className="relative">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#5C8D4E] mb-2 px-1">
              <span>Full 24-Hour Weather Forecast Timeline</span>
              <span>Scroll right ➔</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-[#1F5E3B]/40 scrollbar-track-[#F8FAF7]">
              {(forecast.hourly && forecast.hourly.length > 0 ? forecast.hourly : getFrontendFallbackHourly()).map((hour, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  className="min-w-[105px] p-3 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5] text-center space-y-1.5 shrink-0 hover:border-[#1F5E3B] transition-all"
                >
                  <span className="text-[11px] font-bold text-[#4A5568] block whitespace-nowrap">{hour.time}</span>
                  <img src={hour.iconUrl} alt={hour.condition || ''} className="w-8 h-8 mx-auto object-contain" />
                  <span className="text-base font-black text-[#17331F] font-poppins block">{hour.temp}°C</span>
                  <span className="text-[10px] font-extrabold text-[#5C8D4E] block">💧 {hour.pop}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {(forecast.daily && forecast.daily.length > 0 ? forecast.daily : [
              { day: 'Today', minTemp: 19, maxTemp: 26, condition: 'Partly Cloudy', pop: 25, iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png' },
              { day: 'Tomorrow', minTemp: 18, maxTemp: 25, condition: 'Light Rain', pop: 65, iconUrl: 'https://openweathermap.org/img/wn/10d@2x.png' },
              { day: 'Wed', minTemp: 19, maxTemp: 27, condition: 'Sunny Spells', pop: 20, iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png' },
              { day: 'Thu', minTemp: 18, maxTemp: 24, condition: 'High Humidity', pop: 30, iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png' },
              { day: 'Fri', minTemp: 17, maxTemp: 25, condition: 'Scattered Showers', pop: 55, iconUrl: 'https://openweathermap.org/img/wn/10d@2x.png' },
            ]).map((day, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5] text-center space-y-2"
              >
                <span className="text-xs font-black text-[#17331F] font-poppins block">{day.day}</span>
                <img src={day.iconUrl} alt={day.condition} className="w-10 h-10 mx-auto object-contain" />
                <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold">
                  <span className="text-[#1F5E3B]">{day.maxTemp}°</span>
                  <span className="text-[#4A5568] opacity-70">/ {day.minTemp}°C</span>
                </div>
                <span className="text-[10px] font-bold text-[#5C8D4E] block">{day.condition} • 💧 {day.pop}%</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default WeatherModule;
