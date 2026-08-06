import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, BarChart3, PieChart, ShieldCheck, MapPin, ArrowUpRight } from 'lucide-react';

const MarketAnalytics = ({ lang }) => {
  const districtAnalytics = [
    { district: 'Idukki (Vandenmedu & Kattappana)', avgPrice: '₹22.5 Lakhs / Acre', demand: 'High', cagr: '+14.8%' },
    { district: 'Wayanad (Meppadi & Vythiri)', avgPrice: '₹18.0 Lakhs / Acre', demand: 'Very High', cagr: '+12.4%' },
    { district: 'Palakkad (Nelliyampathy)', avgPrice: '₹14.2 Lakhs / Acre', demand: 'Moderate', cagr: '+9.6%' },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-[#2E7D32]/30 shadow-2xl space-y-6 mb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#2E7D32]/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#1B5E20] text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">
              {lang === 'ml' ? 'തത്സമയ മാർക്കറ്റ് അനലിറ്റിക്സ്' : 'Live Cardamom Plantation Market Intelligence'}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {lang === 'ml' ? 'ഇടുക്കിയിലെയും വയനാട്ടിലെയും ശരാശരി ഭൂമി വിലയും വരുംവർഷങ്ങളിലെ വർദ്ധനവും' : 'Real-time land valuation index, district pricing benchmark & 3-year investment yield CAGR'}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#1B5E20] text-[#66BB6A] text-xs font-black border border-[#66BB6A]/40">
          Q3 2026 BENCHMARK ACTIVE
        </span>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/20 space-y-1">
          <span className="text-[10px] uppercase font-black text-gray-500 block">Average Plantation Price</span>
          <p className="text-2xl font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">₹21.4 L / Acre</p>
          <p className="text-xs text-[#2E7D32] font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#66BB6A]" /> +8.4% YoY Land Valuation Rise
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/20 space-y-1">
          <span className="text-[10px] uppercase font-black text-gray-500 block">Ecosystem Trade Volume</span>
          <p className="text-2xl font-black text-[#2E7D32] dark:text-emerald-300 font-poppins">₹48.5 Cr</p>
          <p className="text-xs text-emerald-600 font-bold">120 Verified Plantations Sold</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/20 space-y-1">
          <span className="text-[10px] uppercase font-black text-gray-500 block">Overall Investment Rating</span>
          <p className="text-2xl font-black text-[#66BB6A] font-poppins">AA+ (9.4 / 10)</p>
          <p className="text-xs text-emerald-600 font-bold">High Liquidity & Green Growth</p>
        </div>
      </div>

      {/* District Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-medium border-collapse">
          <thead>
            <tr className="border-b border-[#2E7D32]/20 text-[#1B5E20] dark:text-emerald-400 font-black uppercase text-[10px]">
              <th className="py-3 px-2">District Region</th>
              <th className="py-3 px-2">Avg Land Price</th>
              <th className="py-3 px-2">Buyer Demand</th>
              <th className="py-3 px-2">3-Yr Valuation CAGR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
            {districtAnalytics.map((item, idx) => (
              <tr key={idx} className="hover:bg-[#F8FFF8] dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-2 font-bold text-[#1B5E20] dark:text-white">{item.district}</td>
                <td className="py-3 px-2 font-semibold">{item.avgPrice}</td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#1B5E20] text-white text-[10px] font-bold">
                    {item.demand}
                  </span>
                </td>
                <td className="py-3 px-2 font-black text-[#66BB6A]">{item.cagr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketAnalytics;
