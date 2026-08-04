import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Leaf, Thermometer, Droplets, Gauge, Users, 
  Sparkles, CloudSun, ShieldCheck, Database, TrendingUp, FileText, Clock, Edit3, Trash2
} from 'lucide-react';

import OverviewTab from './tabs/OverviewTab';
import SoilTab from './tabs/SoilTab';
import WeatherTab from './tabs/WeatherTab';
import WorkersTab from './tabs/WorkersTab';
import AIRecommendationTab from './tabs/AIRecommendationTab';
import ExpenseTab from './tabs/ExpenseTab';
import ReportsTab from './tabs/ReportsTab';
import HistoryTab from './tabs/HistoryTab';

const PlantationDetailsDashboard = ({ plantation, onBack, onEdit, onDelete, onUpdatePlantation }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'soil' | 'weather' | 'workers' | 'ai' | 'expenses' | 'reports' | 'history'

  if (!plantation) return null;

  const p = plantation;

  const name = p.name || 'Cardamom Plantation';
  const ownerName = p.ownerName || 'Cardora Planter';
  const district = p.district || p.location || 'Idukki, Kerala';
  const village = p.village || 'Vandanmedu';
  const variety = p.variety || 'Njallani';
  const area = p.area || 5.0;
  const altitude = p.altitude || 950;
  const healthScore = p.healthScore ?? p.health ?? 92;
  const lastUpdated = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today';
  const image = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80';

  const isIdealRegion = district.toLowerCase().includes('idukki') || district.toLowerCase().includes('wayanad');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Leaf },
    { id: 'soil', label: 'Soil Metrics', icon: Database },
    { id: 'weather', label: 'Weather Telemetry', icon: CloudSun },
    { id: 'workers', label: 'Workforce', icon: Users },
    { id: 'ai', label: 'AI Advice', icon: Sparkles },
    { id: 'expenses', label: 'Expenses', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      
      {/* TOP NAVIGATION BACK BAR */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#D7E6D5] text-[#17331F] text-xs font-bold hover:bg-[#F8FAF7] transition-all flex items-center gap-2 shadow-soft"
        >
          <ArrowLeft className="w-4 h-4 text-[#1F5E3B]" />
          <span>Back to All Plantations</span>
        </button>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(p)}
              className="px-3.5 py-2 rounded-xl bg-[#DDEFD9] border border-[#5C8D4E]/40 text-[#1F5E3B] text-xs font-bold hover:bg-[#5C8D4E] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(p._id || p.id)}
              className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* HERO SECTION - LARGE PLANTATION HEADER */}
      <div className="relative rounded-[24px] overflow-hidden bg-[#17331F] border border-[#D7E6D5] shadow-xl text-white">
        <div className="h-64 sm:h-72 w-full relative">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17331F] via-[#17331F]/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#1F5E3B]/90 backdrop-blur-md border border-[#5C8D4E]/50 text-[#DDEFD9] text-xs font-bold shadow-md">
                🌿 {variety} Variety
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                {area} Acres
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#17331F] px-3.5 py-1.5 rounded-2xl shadow-md border border-[#D7E6D5]">
              <span className="text-xs font-bold text-[#4A5568]">Health Score:</span>
              <span className="text-base font-black text-[#1F5E3B]">{healthScore}%</span>
            </div>
          </div>

          {/* Bottom Title & Details Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
            <h1 className="text-2xl sm:text-3xl font-black font-poppins text-white drop-shadow-md">
              {name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium text-[#DDEFD9]">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                {village}, {district}
              </span>
              <span>• Owner: {ownerName}</span>
              <span>• Altitude: {altitude}m</span>
              <span>• Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 HORIZONTAL NAVIGATION TABS */}
      <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-2 shadow-soft flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#1F5E3B] text-white shadow-sm scale-105'
                  : 'text-[#4A5568] hover:bg-[#F8FAF7] hover:text-[#17331F]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 shadow-soft"
      >
        {activeTab === 'overview' && (
          <OverviewTab plantation={p} onSwitchTab={setActiveTab} />
        )}

        {activeTab === 'soil' && (
          <SoilTab plantation={p} onUpdateSoil={(data) => onUpdatePlantation && onUpdatePlantation(p._id || p.id, data)} />
        )}

        {activeTab === 'weather' && (
          <WeatherTab plantation={p} />
        )}

        {activeTab === 'workers' && (
          <WorkersTab plantation={p} onUpdateWorkers={(data) => onUpdatePlantation && onUpdatePlantation(p._id || p.id, data)} />
        )}

        {activeTab === 'ai' && (
          <AIRecommendationTab plantation={p} />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTab plantation={p} onAddExpense={(newExp) => onUpdatePlantation && onUpdatePlantation(p._id || p.id, { expenses: [newExp, ...(p.expenses || [])] })} />
        )}

        {activeTab === 'reports' && (
          <ReportsTab plantation={p} />
        )}

        {activeTab === 'history' && (
          <HistoryTab plantation={p} />
        )}
      </motion.div>

    </div>
  );
};

export default PlantationDetailsDashboard;
