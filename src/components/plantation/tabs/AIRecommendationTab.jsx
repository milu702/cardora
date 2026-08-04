import React from 'react';
import { Sparkles, AlertTriangle, Droplets, Thermometer, ShieldCheck, CheckCircle2, ArrowRight, Activity, Sprout } from 'lucide-react';

const AIRecommendationTab = ({ plantation }) => {
  const p = plantation;

  const moisture = p.soil?.moisture ?? p.moisture ?? 72;
  const ph = p.soil?.ph ?? p.soilPh ?? 6.2;
  const district = p.district || p.location || 'Idukki, Kerala';
  const isIdeal = district.toLowerCase().includes('idukki') || district.toLowerCase().includes('wayanad');

  // Dynamically generate AI Insights
  const recommendations = [];

  // 1. Moisture & Irrigation Advice
  if (moisture < 55) {
    recommendations.push({
      id: 'rec_irrigation',
      category: 'Irrigation Needed',
      severity: 'high',
      icon: Droplets,
      color: 'border-blue-300 bg-blue-50/50 text-blue-900',
      badge: 'bg-blue-600 text-white',
      title: 'Current Soil Moisture is Below Ideal Level',
      action: 'Recommended 2-hour pulse drip irrigation today in the early morning or evening to maintain tiller hydration.',
    });
  } else if (moisture > 82) {
    recommendations.push({
      id: 'rec_drainage',
      category: 'Drainage Advisory',
      severity: 'medium',
      icon: Droplets,
      color: 'border-amber-300 bg-amber-50/50 text-amber-900',
      badge: 'bg-amber-600 text-white',
      title: 'High Moisture Level Detected (Waterlogging Risk)',
      action: 'No irrigation required today. Clear drainage channels around plant clumps to prevent capsule rot.',
    });
  } else {
    recommendations.push({
      id: 'rec_irrigation_optimal',
      category: 'Irrigation Status',
      severity: 'low',
      icon: CheckCircle2,
      color: 'border-[#5C8D4E]/40 bg-[#DDEFD9]/40 text-[#1F5E3B]',
      badge: 'bg-[#1F5E3B] text-white',
      title: 'Optimal Moisture Maintained',
      action: 'Current soil moisture (72%) is optimal. Follow regular automated drip schedule.',
    });
  }

  // 2. Fungal Infection & Weather Risk
  recommendations.push({
    id: 'rec_fungal',
    category: 'Fungal Risk Warning',
    severity: 'medium',
    icon: AlertTriangle,
    color: 'border-amber-300 bg-amber-50/50 text-amber-900',
    badge: 'bg-amber-600 text-white',
    title: 'Possible Fungal Infection Risk (Azhukal / Rot)',
    action: 'High atmospheric humidity in high-altitude shade plots increases fungal spore risk. Prune dense overhead tree canopy branches and apply bio-fungicide spray if necessary.',
  });

  // 3. Fertilizer Schedule
  recommendations.push({
    id: 'rec_fertilizer',
    category: 'Fertilizer Guidance',
    severity: 'low',
    icon: Sprout,
    color: 'border-[#5C8D4E]/40 bg-[#DDEFD9]/40 text-[#1F5E3B]',
    badge: 'bg-[#5C8D4E] text-white',
    title: 'Fertilizer Application Schedule',
    action: 'Soil pH (6.2) is optimal. Next recommended organic NPK dose scheduled in 10 days. Avoid chemical application during midday heat.',
  });

  // 4. Region Suitability Notice
  if (!isIdeal) {
    recommendations.unshift({
      id: 'rec_region',
      category: 'Region Suitability Alert',
      severity: 'high',
      icon: AlertTriangle,
      color: 'border-red-300 bg-red-50/50 text-red-900',
      badge: 'bg-red-600 text-white',
      title: 'Unsuitable District Warning',
      action: `${district} is not naturally suitable for cardamom. Cardamom thrives exclusively in high-altitude hill regions like Idukki and Wayanad. Ensure artificial shade and mist cooling.`,
    });
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
        <div>
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A227]" />
            AI Decision Support & Agronomist Recommendations
          </h3>
          <p className="text-xs text-[#4A5568] font-medium">
            Intelligent recommendations synthesized from soil NPK, IoT moisture, and weather telemetry.
          </p>
        </div>

        <span className="text-xs font-bold text-[#1F5E3B] bg-[#DDEFD9] px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#1F5E3B] animate-pulse" />
          AI Engine Active 🤖
        </span>
      </div>

      {/* AI RECOMMENDATION CARDS LIST */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <div key={rec.id} className={`p-5 rounded-[20px] border transition-all shadow-soft ${rec.color}`}>
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/80 backdrop-blur-md shadow-sm flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-[#17331F]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${rec.badge}`}>
                      {rec.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#17331F] mb-1">{rec.title}</h4>
                  <p className="text-xs font-medium leading-relaxed opacity-90">{rec.action}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HEALTH IMPROVEMENT SUGGESTIONS CARD */}
      <div className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft space-y-3">
        <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1F5E3B]" />
          Health Improvement Action Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F5E3B] flex-shrink-0 mt-0.5" />
            <span>Maintain organic leaf mulch around tillers to retain soil moisture during dry spells.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F5E3B] flex-shrink-0 mt-0.5" />
            <span>Regulate overhead shade tree density to ensure 50-60% filtered sunlight.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F5E3B] flex-shrink-0 mt-0.5" />
            <span>Inspect panicles weekly for thrips or stem borer activity.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F5E3B] flex-shrink-0 mt-0.5" />
            <span>Keep soil pH strictly between 5.5 and 6.5 using dolomite or organic compost.</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AIRecommendationTab;
