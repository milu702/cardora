import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  PieChart,
  Activity,
  Leaf,
  MapPin,
  Sparkles,
  ShoppingBag,
  Download,
  Award,
  Layers,
  ShieldCheck,
} from 'lucide-react';

const AdminAnalyticsCharts = ({ analyticsData, darkMode }) => {
  // Active Bar Chart Tab: 'growth' | 'yield' | 'districts' | 'diseases' | 'marketplace'
  const [activeChartTab, setActiveChartTab] = useState('growth');
  // Timeframe: '6m' | '1y' | 'season'
  const [timeframe, setTimeframe] = useState('1y');
  // Dynamic Hovered Bar Tooltip State
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  // View mode: 'vertical' | 'horizontal'
  const [barStyle, setBarStyle] = useState('vertical');

  // --- DATASETS (From API with rich fallback datasets) ---

  // 1. Platform Growth (Monthly Users & Plantations)
  const growthData = analyticsData?.userGrowthTrend || [
    { month: 'Jan', users: 120, plantations: 45, growth: '+12%' },
    { month: 'Feb', users: 180, plantations: 68, growth: '+15%' },
    { month: 'Mar', users: 260, plantations: 95, growth: '+18%' },
    { month: 'Apr', users: 340, plantations: 130, growth: '+22%' },
    { month: 'May', users: 450, plantations: 175, growth: '+25%' },
    { month: 'Jun', users: 590, plantations: 220, growth: '+28%' },
    { month: 'Jul', users: 740, plantations: 290, growth: '+32%' },
    { month: 'Aug', users: 890, plantations: 350, growth: '+35%' },
    { month: 'Sep', users: 1050, plantations: 420, growth: '+38%' },
    { month: 'Oct', users: 1240, plantations: 510, growth: '+42%' },
    { month: 'Nov', users: 1480, plantations: 610, growth: '+45%' },
    { month: 'Dec', users: 1720, plantations: 720, growth: '+48%' },
  ];

  // 2. Cardamom Harvest Yield (Monthly Tons: Grade 1 vs Grade 2)
  const yieldData = analyticsData?.cardamomYieldTrend || [
    { month: 'Jan', grade1: 65, grade2: 40, total: 105, pricePerKg: '₹2,450' },
    { month: 'Feb', grade1: 45, grade2: 30, total: 75, pricePerKg: '₹2,500' },
    { month: 'Mar', grade1: 30, grade2: 20, total: 50, pricePerKg: '₹2,600' },
    { month: 'Apr', grade1: 25, grade2: 15, total: 40, pricePerKg: '₹2,750' },
    { month: 'May', grade1: 20, grade2: 10, total: 30, pricePerKg: '₹2,800' },
    { month: 'Jun', grade1: 35, grade2: 25, total: 60, pricePerKg: '₹2,650' },
    { month: 'Jul', grade1: 55, grade2: 35, total: 90, pricePerKg: '₹2,550' },
    { month: 'Aug', grade1: 85, grade2: 50, total: 135, pricePerKg: '₹2,400' },
    { month: 'Sep', grade1: 110, grade2: 65, total: 175, pricePerKg: '₹2,350' },
    { month: 'Oct', grade1: 130, grade2: 75, total: 205, pricePerKg: '₹2,300' },
    { month: 'Nov', grade1: 145, grade2: 85, total: 230, pricePerKg: '₹2,250' },
    { month: 'Dec', grade1: 120, grade2: 70, total: 190, pricePerKg: '₹2,380' },
  ];

  // 3. District & Regional Distribution (Idukki Belt)
  const districtData = analyticsData?.districtDistribution || [
    { district: 'Kattappana', count: 35, acreage: 420, farmers: 210, share: 35 },
    { district: 'Vandiperiyar', count: 24, acreage: 310, farmers: 155, share: 24 },
    { district: 'Santhanpara', count: 18, acreage: 250, farmers: 120, share: 18 },
    { district: 'Nedumkandam', count: 14, acreage: 190, farmers: 92, share: 14 },
    { district: 'Munnar', count: 9, acreage: 140, farmers: 65, share: 9 },
    { district: 'Peerumade', count: 6, acreage: 90, farmers: 40, share: 6 },
  ];

  // 4. AI Pest & Disease Detection Frequency
  const diseaseData = analyticsData?.diseaseFrequency || [
    { name: 'Capsule Rot (Azhukal)', cases: 142, severity: 'High', color: 'from-rose-600 to-amber-500' },
    { name: 'Cardamom Thrips', cases: 98, severity: 'Medium', color: 'from-[#1F5E3B] to-emerald-400' },
    { name: 'Stem Borer Pest', cases: 64, severity: 'Medium', color: 'from-amber-500 to-yellow-400' },
    { name: 'Leaf Spot Disease', cases: 42, severity: 'Low', color: 'from-teal-600 to-[#1F5E3B]' },
    { name: 'Root Knot Nematodes', cases: 28, severity: 'High', color: 'from-purple-600 to-indigo-500' },
  ];

  // 5. Marketplace Trade Volume (₹ in Lakhs)
  const marketplaceData = analyticsData?.marketplaceVolume || [
    { month: 'Jan', volume: 18.5, listings: 42 },
    { month: 'Feb', volume: 22.0, listings: 55 },
    { month: 'Mar', volume: 15.2, listings: 38 },
    { month: 'Apr', volume: 12.8, listings: 30 },
    { month: 'May', volume: 10.4, listings: 25 },
    { month: 'Jun', volume: 16.5, listings: 48 },
    { month: 'Jul', volume: 28.4, listings: 72 },
    { month: 'Aug', volume: 42.1, listings: 98 },
    { month: 'Sep', volume: 58.6, listings: 135 },
    { month: 'Oct', volume: 74.2, listings: 160 },
    { month: 'Nov', volume: 88.9, listings: 195 },
    { month: 'Dec', volume: 65.3, listings: 150 },
  ];

  // Filter timeframe (6 months vs 12 months)
  const filterByTimeframe = (dataArr) => {
    if (timeframe === '6m') return dataArr.slice(-6);
    if (timeframe === 'season') return dataArr.slice(7); // Aug - Dec peak season
    return dataArr;
  };

  const filteredGrowth = filterByTimeframe(growthData);
  const filteredYield = filterByTimeframe(yieldData);
  const filteredMarketplace = filterByTimeframe(marketplaceData);

  // Math helper for bar heights
  const getMax = (arr, key) => Math.max(...arr.map((d) => d[key] || 0), 1);

  // CSV Exporter for Active Bar Chart
  const handleExportChartCSV = () => {
    let csvStr = 'data:text/csv;charset=utf-8,';
    if (activeChartTab === 'growth') {
      csvStr += 'Month,Users,Plantations,Growth\n' + filteredGrowth.map((d) => `"${d.month}",${d.users},${d.plantations},"${d.growth}"`).join('\n');
    } else if (activeChartTab === 'yield') {
      csvStr += 'Month,Grade1_Tons,Grade2_Tons,Total_Tons,Avg_Price\n' + filteredYield.map((d) => `"${d.month}",${d.grade1},${d.grade2},${d.total},"${d.pricePerKg}"`).join('\n');
    } else if (activeChartTab === 'districts') {
      csvStr += 'District,Plantations,Acreage,Farmers,SharePercent\n' + districtData.map((d) => `"${d.district}",${d.count},${d.acreage},${d.farmers},${d.share}%`).join('\n');
    } else if (activeChartTab === 'diseases') {
      csvStr += 'Disease_Pest_Name,Cases_Detected,Severity\n' + diseaseData.map((d) => `"${d.name}",${d.cases},"${d.severity}"`).join('\n');
    } else {
      csvStr += 'Month,Trade_Volume_Lakhs,Active_Listings\n' + filteredMarketplace.map((d) => `"${d.month}",${d.volume},${d.listings}`).join('\n');
    }

    const encodedUri = encodeURI(csvStr);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cardora_admin_${activeChartTab}_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP CONTROL & CHART TAB SELECTION HEADER */}
      {/* ========================================================================= */}
      <div className={`p-5 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                <BarChart3 size={18} />
              </span>
              <h3 className="text-base font-black text-[#1F2937] dark:text-white tracking-tight">
                Executive Analytics & Interactive Bar Charts
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 font-medium">
              Real-time platform metrics, harvest yield analytics, district acreage & AI diagnostic frequency
            </p>
          </div>

          {/* Timeframe & Export Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
              {[
                { id: '6m', label: '6 Months' },
                { id: '1y', label: '1 Year' },
                { id: 'season', label: '🌾 Harvest Season' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === tf.id
                      ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs'
                      : 'hover:text-[#1F5E3B]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setBarStyle(barStyle === 'vertical' ? 'horizontal' : 'vertical')}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              title="Toggle Bar Alignment"
            >
              <Layers size={14} />
              <span>{barStyle === 'vertical' ? 'Vertical' : 'Horizontal'}</span>
            </button>

            <button
              onClick={handleExportChartCSV}
              className="px-3.5 py-2 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* CHART CATEGORY NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'growth', label: 'Platform Growth', icon: Users, badge: '+38% MoM' },
            { id: 'yield', label: 'Cardamom Harvest Yield', icon: Leaf, badge: '1,385 Tons Peak' },
            { id: 'districts', label: 'District Acreage', icon: MapPin, badge: '6 Idukki Zones' },
            { id: 'diseases', label: 'AI Disease Scans', icon: Sparkles, badge: '374 Scans' },
            { id: 'marketplace', label: 'Trade Volume (₹)', icon: ShoppingBag, badge: '₹434.5L Total' },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeChartTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#1F5E3B] text-white border-[#1F5E3B] shadow-sm scale-[1.01]'
                    : darkMode
                    ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <TabIcon size={15} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIMARY DYNAMIC INTERACTIVE BAR CHART CANVAS */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        
        {/* --- TAB 1: PLATFORM GROWTH BAR CHART --- */}
        {activeChartTab === 'growth' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-extrabold text-[#1F2937] dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                  Monthly Registered Farmers vs Active Plantation Estates
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 font-medium">
                  Aggregated member growth synced across Idukki Cardamom Belt
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#1F5E3B] dark:text-emerald-400">
                  <span className="w-3 h-3 rounded bg-gradient-to-r from-[#1F5E3B] to-[#4CAF50]" /> Registered Farmers
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-3 h-3 rounded bg-gradient-to-r from-amber-500 to-yellow-400" /> Cardamom Estates
                </span>
              </div>
            </div>

            {/* Vertical Bar Chart Rendering */}
            {barStyle === 'vertical' ? (
              <div className="h-64 flex items-end justify-between gap-2.5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 relative">
                {filteredGrowth.map((d, idx) => {
                  const maxVal = getMax(filteredGrowth, 'users');
                  const uH = Math.round((d.users / maxVal) * 100);
                  const pH = Math.round((d.plantations / maxVal) * 100);
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="flex-1 flex flex-col items-center group h-full justify-end relative cursor-pointer"
                    >
                      {/* Tooltip Hover Bubble */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 whitespace-nowrap animate-in fade-in zoom-in-95">
                          <span className="text-emerald-400">{d.month}</span>: {d.users} Farmers | {d.plantations} Estates ({d.growth})
                        </div>
                      )}

                      <div className="w-full flex items-end justify-center gap-1 h-full max-h-[180px] bg-slate-50 dark:bg-slate-800/40 rounded-t-xl p-1">
                        {/* Farmers Bar */}
                        <div className="w-1/2 h-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${uH}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.04 }}
                            className="w-full bg-gradient-to-t from-[#1F5E3B] via-[#2E7D32] to-[#4CAF50] rounded-t-md group-hover:brightness-110 shadow-xs relative"
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#1F5E3B] dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {d.users}
                            </span>
                          </motion.div>
                        </div>
                        {/* Estates Bar */}
                        <div className="w-1/2 h-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${pH}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.04 + 0.02 }}
                            className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 rounded-t-md group-hover:brightness-110 shadow-xs relative"
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {d.plantations}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-2">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Horizontal Bar Alignment */
              <div className="space-y-3 pt-2">
                {filteredGrowth.map((d, idx) => {
                  const maxVal = getMax(filteredGrowth, 'users');
                  const uW = Math.round((d.users / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        <span>{d.month}</span>
                        <span>{d.users} Farmers • {d.plantations} Estates</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                        <div style={{ width: `${uW}%` }} className="h-full bg-gradient-to-r from-[#1F5E3B] to-[#4CAF50] rounded-full transition-all duration-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: CARDAMOM HARVEST YIELD BAR CHART --- */}
        {activeChartTab === 'yield' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-extrabold text-[#1F2937] dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                  Monthly Cardamom Harvest Production (Metric Tons)
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 font-medium">
                  Grade 1 Extra Bold (8mm+) vs Grade 2 Bold (7mm) yield per picking season
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#1F5E3B]">
                  <span className="w-3 h-3 rounded bg-emerald-600" /> Grade 1 (8mm+)
                </span>
                <span className="flex items-center gap-1.5 text-teal-600">
                  <span className="w-3 h-3 rounded bg-teal-400" /> Grade 2 (7mm)
                </span>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2.5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 relative">
              {filteredYield.map((d, idx) => {
                const maxVal = getMax(filteredYield, 'total');
                const g1H = Math.round((d.grade1 / maxVal) * 100);
                const g2H = Math.round((d.grade2 / maxVal) * 100);
                const isPeak = d.total === Math.max(...filteredYield.map((y) => y.total));
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center group h-full justify-end relative cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-14 z-20 bg-slate-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 whitespace-nowrap">
                        <strong>{d.month}</strong>: G1: {d.grade1}T | G2: {d.grade2}T (Avg: {d.pricePerKg}/kg)
                      </div>
                    )}

                    {isPeak && (
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 mb-1 animate-pulse">
                        🏆 Peak
                      </span>
                    )}

                    <div className="w-full flex items-end justify-center gap-1 h-full max-h-[180px] bg-slate-50 dark:bg-slate-800/40 rounded-t-xl p-1">
                      <div className="w-1/2 h-full flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${g1H}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.04 }}
                          className="w-full bg-gradient-to-t from-[#1F5E3B] to-[#2E7D32] rounded-t-md group-hover:brightness-110 shadow-xs"
                        />
                      </div>
                      <div className="w-1/2 h-full flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${g2H}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.04 + 0.02 }}
                          className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md group-hover:brightness-110 shadow-xs"
                        />
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-2">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 3: DISTRICT ACREAGE BAR CHART --- */}
        {activeChartTab === 'districts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-extrabold text-[#1F2937] dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                  District Acreage & Registered Plantation Share (Idukki)
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 font-medium">
                  Total cultivated acreage and farmer density per regional agricultural block
                </p>
              </div>
              <span className="text-xs font-bold text-[#1F5E3B] bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200">
                1,400 Total Acres Registered
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {districtData.map((d, idx) => {
                const maxAcreage = Math.max(...districtData.map((item) => item.acreage));
                const pct = Math.round((d.acreage / maxAcreage) * 100);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex justify-between items-center text-xs font-extrabold">
                      <span className="text-[#1F2937] dark:text-white flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#1F5E3B]" /> {d.district}
                      </span>
                      <span className="text-[#1F5E3B] dark:text-emerald-400">{d.acreage} Acres ({d.share}% share)</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="h-full bg-gradient-to-r from-[#1F5E3B] via-[#2E7D32] to-[#4CAF50] rounded-full"
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-bold pt-1">
                      <span>{d.count} Registered Estates</span>
                      <span>{d.farmers} Farmers</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 4: AI DISEASE FREQUENCY BAR CHART --- */}
        {activeChartTab === 'diseases' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-extrabold text-[#1F2937] dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  AI Disease Detection & Pest Diagnostics Frequency
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 font-medium">
                  Scan diagnostics reported by Cardora AI Mobile Vision & IoT Leaf Sensors
                </p>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-3 py-1 rounded-full border border-rose-200">
                374 Total Scans Processed
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {diseaseData.map((dis, idx) => {
                const maxCases = Math.max(...diseaseData.map((d) => d.cases));
                const pct = Math.round((dis.cases / maxCases) * 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-extrabold">
                      <span className="text-[#1F2937] dark:text-white flex items-center gap-2">
                        <span>{dis.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          dis.severity === 'High' ? 'bg-rose-100 text-rose-700' : dis.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-[#1F5E3B]'
                        }`}>
                          {dis.severity} Severity
                        </span>
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">{dis.cases} Scan Alerts</span>
                    </div>

                    <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`h-full bg-gradient-to-r ${dis.color} rounded-full shadow-xs`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 5: MARKETPLACE TRADE VOLUME BAR CHART --- */}
        {activeChartTab === 'marketplace' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-extrabold text-[#1F2937] dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                  Monthly Cardamom Trade Volume (₹ in Lakhs)
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 font-medium">
                  Verified B2B Cardamom marketplace transactions & trader listings
                </p>
              </div>
              <span className="text-xs font-bold text-[#1F5E3B] bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200">
                ₹434.5 Lakhs Total GMV
              </span>
            </div>

            <div className="h-64 flex items-end justify-between gap-2.5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 relative">
              {filteredMarketplace.map((d, idx) => {
                const maxVol = getMax(filteredMarketplace, 'volume');
                const vH = Math.round((d.volume / maxVol) * 100);
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center group h-full justify-end relative cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 whitespace-nowrap">
                        <strong>{d.month}</strong>: ₹{d.volume} Lakhs ({d.listings} active listings)
                      </div>
                    )}

                    <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-t-xl overflow-hidden h-full max-h-[180px] flex items-end p-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${vH}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.04 }}
                        className="w-full bg-gradient-to-t from-[#1F5E3B] via-[#2E7D32] to-[#4CAF50] rounded-t-md group-hover:brightness-110 shadow-xs relative"
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#1F5E3B] dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{d.volume}L
                        </span>
                      </motion.div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-2">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#1F5E3B]" /> Verified MongoDB Atlas Dynamic Telemetry Aggregation
          </span>
          <span>Updated Live</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECONDARY STAT & DISTRIBUTION METRICS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Widget 1: Plantation Health Score Distribution */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1F5E3B] flex items-center justify-center">
              <PieChart size={15} />
            </span>
            <h4 className="text-xs font-extrabold text-[#1F2937] dark:text-white">Plantation Health Breakdown</h4>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Healthy (≥80%)', pct: 70, color: 'bg-[#1F5E3B]', text: 'text-[#1F5E3B]' },
              { name: 'Moderate (60-79%)', pct: 22, color: 'bg-amber-500', text: 'text-amber-600' },
              { name: 'Critical (<60%)', pct: 8, color: 'bg-rose-500', text: 'text-rose-600' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className={item.text}>{item.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full transition-all duration-500`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Soil Moisture Telemetry */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1F5E3B] flex items-center justify-center">
              <Activity size={15} />
            </span>
            <h4 className="text-xs font-extrabold text-[#1F2937] dark:text-white">Soil Moisture Telemetry</h4>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-slate-800 dark:to-slate-850 border border-emerald-100 dark:border-slate-700 text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Average Soil Moisture</span>
            <p className="text-3xl font-black text-[#1F5E3B] dark:text-emerald-400 my-1">74%</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-[#1F5E3B]">
              Optimal Range (65% - 80%)
            </span>
          </div>
        </div>

        {/* Widget 3: AI Advisory Accuracy & Response Rate */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1F5E3B] flex items-center justify-center">
              <Award size={15} />
            </span>
            <h4 className="text-xs font-extrabold text-[#1F2937] dark:text-white">AI Scan Diagnostic Index</h4>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-800 dark:to-slate-850 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AI Diagnostic Precision</span>
            <p className="text-3xl font-black text-[#1F5E3B] dark:text-emerald-400 my-1">96.4%</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
              Validated by Agro Experts
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalyticsCharts;
