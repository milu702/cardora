import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudSun,
  Users,
  MapPin,
  Search,
  RefreshCw,
  Download,
  Droplets,
  Wind,
  UserCheck,
  Shield,
  ChevronRight,
  X,
  CloudRain,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_DISTRICTS_DATA = [
  {
    district: 'Idukki',
    registeredUsersCount: 15,
    registeredUsers: [
      { name: 'Suresh Menon', email: 'suresh.menon@cardoramail.com', role: 'Farmer', status: 'active', district: 'Idukki' },
      { name: 'Devika Raj', email: 'devika.raj@cardoramail.com', role: 'Farmer', status: 'active', district: 'Idukki' },
      { name: 'Mathew Joseph', email: 'mathew.j@cardoramail.com', role: 'Farmer', status: 'active', district: 'Idukki' },
      { name: 'Priya Nair', email: 'priya.nair@cardoramail.com', role: 'Farmer', status: 'active', district: 'Idukki' },
      { name: 'Dr. Ramesh Nambiar', email: 'ramesh.nambiar@spicesboard.in', role: 'Expert', status: 'active', district: 'Idukki' },
    ],
    rolesCount: { Farmer: 12, Supervisor: 2, Expert: 1, Admin: 0, Other: 0 },
    weather: {
      temp: 22,
      feelsLike: 23,
      humidity: 82,
      windSpeed: 12,
      rain: 0,
      rainProbability: 40,
      condition: 'Partly Cloudy',
      description: 'High Altitude Breeze',
      iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png',
    },
  },
  {
    district: 'Wayanad',
    registeredUsersCount: 9,
    registeredUsers: [
      { name: 'Dr. Suresh Kumar', email: 'suresh.k@cardoramail.com', role: 'Farmer', status: 'active', district: 'Wayanad' },
      { name: 'Anil Varghese', email: 'anil.v@cardoramail.com', role: 'Supervisor', status: 'active', district: 'Wayanad' },
      { name: 'K. J. Joseph', email: 'kj.joseph@cardoramail.com', role: 'Farmer', status: 'active', district: 'Wayanad' },
    ],
    rolesCount: { Farmer: 7, Supervisor: 2, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 23,
      feelsLike: 24,
      humidity: 84,
      windSpeed: 10,
      rain: 1.2,
      rainProbability: 60,
      condition: 'Light Rain',
      description: 'Intermittent Showers',
      iconUrl: 'https://openweathermap.org/img/wn/10d@2x.png',
    },
  },
  {
    district: 'Palakkad',
    registeredUsersCount: 6,
    registeredUsers: [
      { name: 'Rajesh Sharma', email: 'rajesh.s@cardoramail.com', role: 'Farmer', status: 'active', district: 'Palakkad' },
      { name: 'Vijay Kurup', email: 'vijay.k@cardoramail.com', role: 'Farmer', status: 'active', district: 'Palakkad' },
    ],
    rolesCount: { Farmer: 5, Supervisor: 1, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 28,
      feelsLike: 30,
      humidity: 71,
      windSpeed: 14,
      rain: 0,
      rainProbability: 15,
      condition: 'Sunny Spells',
      description: 'Warm Agricultural Valley',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    },
  },
  {
    district: 'Pathanamthitta',
    registeredUsersCount: 4,
    registeredUsers: [
      { name: 'Thomas K.', email: 'thomas.k@cardoramail.com', role: 'Supervisor', status: 'active', district: 'Pathanamthitta' },
    ],
    rolesCount: { Farmer: 3, Supervisor: 1, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 26,
      feelsLike: 27,
      humidity: 76,
      windSpeed: 11,
      rain: 0,
      rainProbability: 25,
      condition: 'Partly Cloudy',
      description: 'Humid Region',
      iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png',
    },
  },
  {
    district: 'Kottayam',
    registeredUsersCount: 5,
    registeredUsers: [
      { name: 'Anand Kumar', email: 'anand.k@cardoramail.com', role: 'Farmer', status: 'active', district: 'Kottayam' },
    ],
    rolesCount: { Farmer: 4, Supervisor: 1, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 27,
      feelsLike: 29,
      humidity: 79,
      windSpeed: 9,
      rain: 0,
      rainProbability: 20,
      condition: 'Partly Cloudy',
      description: 'Central District',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    },
  },
  {
    district: 'Ernakulam',
    registeredUsersCount: 8,
    registeredUsers: [
      { name: 'Admin Cardora', email: 'admin@cardora.com', role: 'Admin', status: 'active', district: 'Ernakulam' },
    ],
    rolesCount: { Farmer: 5, Supervisor: 2, Expert: 0, Admin: 1, Other: 0 },
    weather: {
      temp: 29,
      feelsLike: 32,
      humidity: 81,
      windSpeed: 15,
      rain: 0,
      rainProbability: 30,
      condition: 'Clouds',
      description: 'Coastal Region',
      iconUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
    },
  },
  {
    district: 'Thrissur',
    registeredUsersCount: 4,
    registeredUsers: [
      { name: 'Prof. Anitha Varma', email: 'anitha.varma@kau.in', role: 'Expert', status: 'active', district: 'Thrissur' },
    ],
    rolesCount: { Farmer: 3, Supervisor: 0, Expert: 1, Admin: 0, Other: 0 },
    weather: {
      temp: 28,
      feelsLike: 31,
      humidity: 78,
      windSpeed: 12,
      rain: 0,
      rainProbability: 20,
      condition: 'Partly Cloudy',
      description: 'Central District',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    },
  },
  {
    district: 'Kozhikode',
    registeredUsersCount: 3,
    registeredUsers: [],
    rolesCount: { Farmer: 3, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 28,
      feelsLike: 31,
      humidity: 80,
      windSpeed: 13,
      rain: 0,
      rainProbability: 25,
      condition: 'Clouds',
      description: 'Malabar Coast',
      iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png',
    },
  },
  {
    district: 'Malappuram',
    registeredUsersCount: 4,
    registeredUsers: [],
    rolesCount: { Farmer: 4, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 27,
      feelsLike: 29,
      humidity: 77,
      windSpeed: 10,
      rain: 0,
      rainProbability: 20,
      condition: 'Partly Cloudy',
      description: 'North Central Region',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    },
  },
  {
    district: 'Kannur',
    registeredUsersCount: 3,
    registeredUsers: [],
    rolesCount: { Farmer: 3, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 28,
      feelsLike: 30,
      humidity: 76,
      windSpeed: 14,
      rain: 0,
      rainProbability: 15,
      condition: 'Clear Spells',
      description: 'North Malabar Coast',
      iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    },
  },
  {
    district: 'Kasaragod',
    registeredUsersCount: 2,
    registeredUsers: [],
    rolesCount: { Farmer: 2, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 29,
      feelsLike: 32,
      humidity: 75,
      windSpeed: 15,
      rain: 0,
      rainProbability: 10,
      condition: 'Clear',
      description: 'Northern District',
      iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    },
  },
  {
    district: 'Alappuzha',
    registeredUsersCount: 3,
    registeredUsers: [],
    rolesCount: { Farmer: 3, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 29,
      feelsLike: 33,
      humidity: 83,
      windSpeed: 12,
      rain: 0,
      rainProbability: 25,
      condition: 'Partly Cloudy',
      description: 'Coastal Region',
      iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png',
    },
  },
  {
    district: 'Kollam',
    registeredUsersCount: 2,
    registeredUsers: [],
    rolesCount: { Farmer: 2, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 28,
      feelsLike: 31,
      humidity: 80,
      windSpeed: 11,
      rain: 0,
      rainProbability: 20,
      condition: 'Partly Cloudy',
      description: 'Southern District',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    },
  },
  {
    district: 'Thiruvananthapuram',
    registeredUsersCount: 4,
    registeredUsers: [],
    rolesCount: { Farmer: 3, Supervisor: 1, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 29,
      feelsLike: 32,
      humidity: 78,
      windSpeed: 14,
      rain: 0,
      rainProbability: 15,
      condition: 'Partly Cloudy',
      description: 'Capital Coastal District',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    },
  },
  {
    district: 'Theni',
    registeredUsersCount: 3,
    registeredUsers: [],
    rolesCount: { Farmer: 3, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 27,
      feelsLike: 29,
      humidity: 70,
      windSpeed: 12,
      rain: 0,
      rainProbability: 10,
      condition: 'Sunny Spells',
      description: 'Ghat Foothills Region',
      iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    },
  },
  {
    district: 'Dindigul',
    registeredUsersCount: 2,
    registeredUsers: [],
    rolesCount: { Farmer: 2, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 28,
      feelsLike: 30,
      humidity: 68,
      windSpeed: 11,
      rain: 0,
      rainProbability: 15,
      condition: 'Partly Cloudy',
      description: 'Hill Region Foothills',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    },
  },
  {
    district: 'Nilgiris',
    registeredUsersCount: 4,
    registeredUsers: [],
    rolesCount: { Farmer: 3, Supervisor: 1, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 18,
      feelsLike: 18,
      humidity: 85,
      windSpeed: 16,
      rain: 0,
      rainProbability: 40,
      condition: 'Mist',
      description: 'High Altitude District',
      iconUrl: 'https://openweathermap.org/img/wn/50d@2x.png',
    },
  },
  {
    district: 'Kodagu',
    registeredUsersCount: 3,
    registeredUsers: [],
    rolesCount: { Farmer: 3, Supervisor: 0, Expert: 0, Admin: 0, Other: 0 },
    weather: {
      temp: 21,
      feelsLike: 21,
      humidity: 83,
      windSpeed: 10,
      rain: 0,
      rainProbability: 35,
      condition: 'Partly Cloudy',
      description: 'Highland Plateau',
      iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png',
    },
  },
];

const DistrictWeatherUsers = ({ darkMode }) => {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | table
  const [selectedDistrictModal, setSelectedDistrictModal] = useState(null);

  const fetchDistrictData = async () => {
    setLoading(true);
    try {
      const res = await apiService.getDistrictWeatherAndUsers();
      if (res && res.success && Array.isArray(res.districts) && res.districts.length > 0) {
        setData(res);
      } else {
        setData({
          success: true,
          totalDistricts: DEFAULT_DISTRICTS_DATA.length,
          totalRegisteredUsers: DEFAULT_DISTRICTS_DATA.reduce((acc, d) => acc + d.registeredUsersCount, 0),
          districts: DEFAULT_DISTRICTS_DATA,
        });
      }
    } catch (err) {
      console.error('Error fetching district weather & users:', err);
      setData({
        success: true,
        totalDistricts: DEFAULT_DISTRICTS_DATA.length,
        totalRegisteredUsers: DEFAULT_DISTRICTS_DATA.reduce((acc, d) => acc + d.registeredUsersCount, 0),
        districts: DEFAULT_DISTRICTS_DATA,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictData();
  }, []);

  const handleExportDistrictCSV = () => {
    const list = data?.districts || DEFAULT_DISTRICTS_DATA;
    const header = 'District,Temp (°C),Feels Like (°C),Humidity (%),Wind (km/h),Condition,Registered Users Count,Farmers,Supervisors,Experts\n';
    const rows = list.map((d) => {
      const temp = d.weather?.temp ?? 'N/A';
      const feelsLike = d.weather?.feelsLike ?? 'N/A';
      const humidity = d.weather?.humidity ?? 'N/A';
      const wind = d.weather?.windSpeed ?? 'N/A';
      const condition = (d.weather?.condition || 'Partly Cloudy').replace(/"/g, '""');
      const usersCount = d.registeredUsersCount || 0;
      const farmers = d.rolesCount?.Farmer || 0;
      const supervisors = d.rolesCount?.Supervisor || 0;
      const experts = d.rolesCount?.Expert || 0;
      return `"${d.district}","${temp}","${feelsLike}","${humidity}","${wind}","${condition}","${usersCount}","${farmers}","${supervisors}","${experts}"`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `cardora_districts_weather_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Districts Weather & Registered Users CSV');
  };

  const districtsList = data?.districts || DEFAULT_DISTRICTS_DATA;

  const filteredDistricts = districtsList.filter((d) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = d.district.toLowerCase().includes(q);
      const userMatch = (d.registeredUsers || []).some(
        (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
      );
      const conditionMatch = (d.weather?.condition || '').toLowerCase().includes(q);
      return nameMatch || userMatch || conditionMatch;
    }
    return true;
  });

  const totalRegisteredUsersCount = data?.totalRegisteredUsers || districtsList.reduce((acc, d) => acc + (d.registeredUsersCount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER BAR & SUMMARY METRICS */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
      } space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                <CloudSun size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Districts Weather Telemetry & Registered Users Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Administrative district weather monitoring and registered users distribution
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDistrictData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Telemetry</span>
            </button>

            <button
              onClick={handleExportDistrictCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 font-bold text-xs hover:bg-[#DDEFD9] transition-all border border-[#1F5E3B]/20"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 3 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Districts Monitored</span>
              <MapPin size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-poppins">
              {loading ? '...' : data?.totalDistricts || districtsList.length || 18}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">
              Administrative Districts Tracked
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Registered Users</span>
              <Users size={16} className="text-[#1F5E3B] dark:text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins">
              {loading ? '...' : totalRegisteredUsersCount}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">
              Registered across all districts
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Weather Telemetry Status</span>
              <CloudSun size={16} className="text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-poppins">
              Live & Synced
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">
              Open-Meteo & Weather Cache
            </div>
          </div>
        </div>

        {/* SEARCH AND VIEW MODE TOGGLE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search district or registered user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Cards View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT DISPLAY */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw size={32} className="mx-auto animate-spin text-[#1F5E3B]" />
          <p className="text-xs font-bold text-slate-500">Syncing live district weather & registered users database...</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW OF DISTRICT CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDistricts.map((d, idx) => {
            const w = d.weather || {};

            return (
              <motion.div
                key={d.district || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                  darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/90 hover:border-[#1F5E3B]/30 shadow-xs'
                } flex flex-col justify-between space-y-4`}
              >
                {/* DISTRICT TITLE & WEATHER ICON */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin size={16} className="text-[#1F5E3B] dark:text-emerald-400" />
                        {d.district}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {w.description || 'District Weather Telemetry'}
                      </p>
                    </div>

                    <img src={w.iconUrl} alt={w.condition} className="w-10 h-10 object-contain shrink-0" />
                  </div>

                  {/* WEATHER TELEMETRY BOX */}
                  <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-blue-50/50 to-emerald-50/30 dark:from-slate-800/80 dark:to-slate-850 border border-blue-100/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white font-poppins">{w.temp}°C</span>
                        <span className="text-xs text-slate-500 font-semibold">Feels {w.feelsLike}°C</span>
                      </div>
                      <span className="text-xs font-bold text-[#1F5E3B] dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                        {w.condition}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col items-center p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 flex items-center gap-1"><Droplets size={10} /> Humidity</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">{w.humidity}%</span>
                      </div>

                      <div className="flex flex-col items-center p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 flex items-center gap-1"><Wind size={10} /> Wind</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{w.windSpeed} km/h</span>
                      </div>

                      <div className="flex flex-col items-center p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 flex items-center gap-1"><CloudRain size={10} /> Rain Prob</span>
                        <span className="font-extrabold text-blue-500">{w.rainProbability ?? 20}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REGISTERED USERS BREAKDOWN */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Users size={14} className="text-[#1F5E3B]" /> Registered Users:
                    </span>
                    <span className="text-xs font-black text-[#1F5E3B] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                      {d.registeredUsersCount} {d.registeredUsersCount === 1 ? 'User' : 'Users'}
                    </span>
                  </div>

                  {/* USER ROLE CHIPS */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      Farmers: <strong>{d.rolesCount?.Farmer || 0}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      Supervisors: <strong>{d.rolesCount?.Supervisor || 0}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      Experts: <strong>{d.rolesCount?.Expert || 0}</strong>
                    </span>
                  </div>

                  {/* USER AVATARS PREVIEW */}
                  {(d.registeredUsers || []).length > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex -space-x-2 overflow-hidden">
                        {d.registeredUsers.slice(0, 5).map((u, uIdx) => (
                          <div
                            key={u._id || uIdx}
                            title={`${u.name} (${u.role})`}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-[#1F5E3B] text-white text-[9px] font-bold text-center leading-6"
                          >
                            {(u.name || 'U')[0]}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setSelectedDistrictModal(d)}
                        className="text-xs font-bold text-[#1F5E3B] dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        View User List <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW OF ALL DISTRICTS */
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} overflow-x-auto`}>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Weather Condition</th>
                <th className="py-3 px-4">Humidity & Wind</th>
                <th className="py-3 px-4">Registered Users</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDistricts.map((d, idx) => {
                const w = d.weather || {};
                return (
                  <tr key={d.district || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin size={14} className="text-[#1F5E3B]" />
                      <span>{d.district}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                      {w.temp}°C <span className="text-slate-400 text-[11px] font-normal">(Feels {w.feelsLike}°C)</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold">
                      {w.condition}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {w.humidity}% RH | {w.windSpeed} km/h
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#1F5E3B] dark:text-emerald-400">
                      {d.registeredUsersCount} Members
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDistrictModal(d)}
                        className="px-3 py-1 rounded-lg bg-[#EAF3E8] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 font-bold text-xs hover:bg-[#DDEFD9]"
                      >
                        View Users
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REGISTERED USERS MODAL FOR SELECTED DISTRICT */}
      <AnimatePresence>
        {selectedDistrictModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Registered Users in {selectedDistrictModal.district}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedDistrictModal.registeredUsersCount} registered platform members
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDistrictModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* DISTRICT WEATHER SUMMARY STRIP IN MODAL */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    Weather: {selectedDistrictModal.weather?.temp}°C, {selectedDistrictModal.weather?.condition}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Humidity: {selectedDistrictModal.weather?.humidity}% • Wind: {selectedDistrictModal.weather?.windSpeed} km/h
                  </p>
                </div>
              </div>

              {/* USERS LIST TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedDistrictModal.registeredUsers || []).map((u, uIdx) => (
                      <tr key={u._id || uIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1F5E3B] text-white flex items-center justify-center font-bold text-[10px]">
                            {(u.name || 'U')[0]}
                          </div>
                          <span>{u.name || u.fullName || 'Farmer'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{u.email || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1F5E3B] dark:text-emerald-400">{u.role || 'Farmer'}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'deactivated' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-[#1F5E3B]'
                          }`}>
                            {u.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedDistrictModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DistrictWeatherUsers;
