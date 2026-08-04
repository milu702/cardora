import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudSun, Thermometer, Droplets, Wind, Gauge, Eye, Cloud, 
  Sun, Sunset, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, 
  Sparkles, CloudRain, Calendar, MapPin, 
  ShieldAlert, Award, ChevronRight, Snowflake, Sprout, Activity
} from 'lucide-react';
import { apiService } from '../../services/api';

const WeatherModule = ({ userLocation = 'Idukki, Kerala', onToast }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeForecastTab, setActiveForecastTab] = useState('hourly'); // 'hourly' | 'daily'

  const userDistrict = userLocation || 'Idukki, Kerala';

  const fetchWeatherData = async (targetLocation = userDistrict) => {
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

  useEffect(() => {
    fetchWeatherData(userDistrict);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDistrict]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeatherData(userDistrict);
    if (onToast) onToast('Refreshing real-time OpenWeatherMap telemetry...');
  };

  if (loading && !weatherData) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] border border-[#D7E6D5] p-8 md:p-12 shadow-sm text-center"
      >
        <div className="w-12 h-12 border-4 border-[#1F5E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-base font-extrabold text-[#17331F] font-poppins">Loading Weather Telemetry for {userDistrict}...</h3>
        <p className="text-xs text-[#4A5568] mt-1 font-medium">Analyzing micro-climate & cardamom crop advisory parameters</p>
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
    locationName: userDistrict,
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

  return (
    <div className="space-y-6">
      
      {/* ===== 1. HEADER: LOCKED TO USER'S REGISTERED LOCATION ===== */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 shadow-[0_10px_30px_rgba(31,94,59,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="bg-[#DDEFD9] p-3 rounded-2xl text-[#1F5E3B] shadow-inner"
          >
            <CloudSun className="w-7 h-7" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-[#5C8D4E] tracking-wider uppercase">
                Your Plantation Location Weather
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DDEFD9] text-[#1F5E3B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E3B] animate-ping" />
                Live Sync
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#17331F] font-poppins flex items-center gap-2 mt-0.5">
              <MapPin className="w-5 h-5 text-[#1F5E3B]" />
              <span>{currentWeather.locationName || userDistrict}</span>
            </h2>
          </div>
        </div>

        {/* User Location Locked Badge & Refresh Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] text-xs font-bold text-[#17331F]">
            <ShieldCheck className="w-4 h-4 text-[#1F5E3B]" />
            <span>Profile Location Locked</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] hover:from-[#5C8D4E] hover:to-[#1F5E3B] text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh Telemetry'}</span>
          </motion.button>
        </div>
      </motion.div>

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

      {weatherData?.isFallback && !error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-3 shadow-sm"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 animate-bounce" />
          <span>{weatherData.warningMessage || 'Live weather temporarily unavailable. Displaying cached telemetry.'}</span>
        </motion.div>
      )}

      {/* ===== 2. HERO GRID: WEATHER CARD & SMART ADVISORY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT CARD (7 cols): Plantation Weather Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-gradient-to-br from-[#17331F] via-[#1F5E3B] to-[#2B6E47] text-white rounded-[24px] p-6 md:p-8 relative overflow-hidden shadow-xl flex flex-col justify-between"
        >
          
          {/* Animated Ambient Leaf Background */}
          <motion.div 
            animate={{ rotate: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
            className="absolute -bottom-8 -right-8 text-9xl opacity-10 pointer-events-none select-none"
          >
            🌿
          </motion.div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C8D4E]/30 text-[#DDEFD9] text-xs font-extrabold border border-[#5C8D4E]/40">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                Micro-Climate Telemetry
              </span>
              <span className="text-[11px] font-bold text-[#DDEFD9]/80">
                Updated: {currentWeather.lastUpdated}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-7xl font-black font-poppins tracking-tight">
                    {currentWeather.temp}°
                  </span>
                  <span className="text-xl font-bold text-[#DDEFD9]">C</span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-[#DDEFD9]/90 mt-1">
                  Feels like {currentWeather.feelsLike}°C • {currentWeather.description}
                </p>
              </div>

              {/* Weather Condition Icon with Gentle Floating Animation */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 shadow-lg"
              >
                <img 
                  src={currentWeather.iconUrl} 
                  alt={currentWeather.condition} 
                  className="w-14 h-14 object-contain filter drop-shadow-md" 
                />
                <div>
                  <span className="block text-sm font-extrabold text-white">{currentWeather.condition}</span>
                  <span className="text-[11px] text-[#DDEFD9]">Condition</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* 8 Metric Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/15">
            
            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                <span>Humidity</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.humidity}%</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <CloudRain className="w-3.5 h-3.5 text-blue-300" />
                <span>Rainfall</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.rain} mm</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <Wind className="w-3.5 h-3.5 text-teal-300" />
                <span>Wind Speed</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.windSpeed} km/h</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <Gauge className="w-3.5 h-3.5 text-amber-300" />
                <span>Pressure</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.pressure} hPa</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <Eye className="w-3.5 h-3.5 text-emerald-300" />
                <span>Visibility</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.visibility} km</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <Cloud className="w-3.5 h-3.5 text-indigo-300" />
                <span>Clouds</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.cloudCoverage}%</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <Sun className="w-3.5 h-3.5 text-yellow-300" />
                <span>Sunrise</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.sunrise}</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#DDEFD9] mb-1 font-bold">
                <Sunset className="w-3.5 h-3.5 text-orange-300" />
                <span>Sunset</span>
              </div>
              <span className="text-base font-black text-white">{currentWeather.sunset}</span>
            </motion.div>

          </div>

        </motion.div>

        {/* RIGHT CARD (5 cols): Smart Plantation Advisory & Suitability Score */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 bg-white rounded-[24px] border border-[#D7E6D5] p-6 md:p-8 shadow-sm flex flex-col justify-between"
        >
          
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D7E6D5]">
              <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1F5E3B]" />
                <span>Smart Plantation Advisory</span>
              </h3>
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${suitability.badgeColor}`}
              >
                {suitability.statusEmoji} {suitability.status}
              </motion.span>
            </div>

            {/* Cardamom Cultivation Suitability Score Meter */}
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

            {/* Recognized Cardamom Region Banner */}
            <div className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed ${
              weatherData?.isRecognizedCardamomRegion
                ? 'bg-[#DDEFD9]/50 border-[#5C8D4E]/40 text-[#1F5E3B]'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-start gap-2.5">
                {weatherData?.isRecognizedCardamomRegion ? (
                  <ShieldCheck className="w-5 h-5 text-[#1F5E3B] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-extrabold block text-sm mb-0.5">
                    {weatherData?.isRecognizedCardamomRegion ? 'Suitable Cardamom Region (Idukki & Wayanad)' : '⚠️ Unsuitable Cardamom Zone Advisory'}
                  </span>
                  <span>{weatherData?.regionNotice}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Summary Notice */}
          <div className="mt-6 pt-4 border-t border-[#D7E6D5] flex items-center justify-between text-xs text-[#4A5568]">
            <span className="font-bold text-[#17331F]">Location: {userDistrict}</span>
            <span className="font-semibold text-[#5C8D4E] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#1F5E3B] animate-pulse" />
              Live Advisory Active 🟢
            </span>
          </div>

        </motion.div>

      </div>

      {/* ===== 3. WEATHER ALERTS BANNER WITH SLIDE ANIMATION ===== */}
      {weatherAlerts && weatherAlerts.length > 0 && (
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
                className={`p-4 rounded-2xl border transition-all ${
                  alert.type === 'danger'
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

      {/* ===== 4. ANIMATED AI PLANT RECOMMENDATIONS ACCORDING TO WEATHER ===== */}
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
              <span>AI Crop Care Recommendations for {userDistrict}</span>
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

        {aiRecommendations.length > 0 ? (
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
                {/* Visual Category Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  rec.severity === 'critical' ? 'bg-red-500' :
                  rec.severity === 'high' ? 'bg-amber-500' : 'bg-[#1F5E3B]'
                }`} />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black text-[#17331F] font-poppins flex items-center gap-2">
                    
                    {/* Weather Recommendation Animated Icon */}
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

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    rec.severity === 'critical' ? 'bg-red-100 text-red-700' :
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
        ) : (
          <div className="p-6 text-center bg-[#F8FAF7] rounded-2xl border border-[#D7E6D5] text-xs text-[#4A5568] font-bold">
            🌿 Weather conditions in {userDistrict} are optimal. Maintain standard plantation irrigation and weeding schedule.
          </div>
        )}
      </motion.div>

      {/* ===== 5. INTERACTIVE FORECAST & TRENDS ===== */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 md:p-8 shadow-sm"
      >
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D7E6D5]">
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1F5E3B]" />
            <span>Weather Forecast for {userDistrict}</span>
          </h3>

          <div className="flex items-center gap-2 bg-[#F8FAF7] p-1 rounded-xl border border-[#D7E6D5]">
            <button
              type="button"
              onClick={() => setActiveForecastTab('hourly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeForecastTab === 'hourly'
                  ? 'bg-[#1F5E3B] text-white shadow-sm'
                  : 'text-[#4A5568] hover:text-[#1F5E3B]'
              }`}
            >
              24-Hour Hourly
            </button>
            <button
              type="button"
              onClick={() => setActiveForecastTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeForecastTab === 'daily'
                  ? 'bg-[#1F5E3B] text-white shadow-sm'
                  : 'text-[#4A5568] hover:text-[#1F5E3B]'
              }`}
            >
              5-Day Outlook
            </button>
          </div>
        </div>

        {/* Hourly Forecast Carousel / Grid */}
        {activeForecastTab === 'hourly' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {(forecast.hourly || []).map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, translateY: -3 }}
                className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5] hover:border-[#5C8D4E] text-center transition-all flex flex-col items-center justify-between space-y-1.5 shadow-sm"
              >
                <span className="text-[11px] font-bold text-[#4A5568]">{item.time}</span>
                <img src={item.iconUrl} alt={item.condition} className="w-10 h-10 object-contain my-1 filter drop-shadow-sm" />
                <span className="text-base font-black text-[#17331F] font-poppins">{item.temp}°C</span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                  <Droplets className="w-3 h-3" />
                  <span>{item.pop}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 5-Day Daily Outlook Grid */}
        {activeForecastTab === 'daily' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(forecast.daily || []).map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.03, translateY: -3 }}
                className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#D7E6D5] hover:border-[#1F5E3B] transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#D7E6D5] pb-2">
                  <span className="text-xs font-black text-[#17331F] font-poppins">{item.day}</span>
                  <span className="text-[11px] font-bold text-[#5C8D4E]">{item.date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <img src={item.iconUrl} alt={item.condition} className="w-12 h-12 object-contain filter drop-shadow-sm" />
                  <div className="text-right">
                    <span className="text-base font-black text-[#17331F] block font-poppins">{item.maxTemp}°C</span>
                    <span className="text-xs text-[#4A5568] font-bold">Min: {item.minTemp}°C</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-[#D7E6D5] text-[11px] font-semibold text-[#4A5568]">
                  <div className="flex items-center justify-between">
                    <span>Rain Prob:</span>
                    <span className="font-extrabold text-blue-700">{item.pop}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Humidity:</span>
                    <span className="font-extrabold text-[#17331F]">{item.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wind:</span>
                    <span className="font-extrabold text-[#17331F]">{item.windSpeed} km/h</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>

    </div>
  );
};

export default WeatherModule;
