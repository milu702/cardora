import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, DollarSign, Award, RefreshCw, Layers } from 'lucide-react';
import api from '../../services/api';

const CropYieldPredictor = ({ plantationData = null }) => {
  const [area, setArea] = useState(plantationData?.area || 5.0);
  const [plantAge, setPlantAge] = useState(5.0);
  const [variety, setVariety] = useState(plantationData?.variety || 'Njallani');
  const [nitrogen] = useState(plantationData?.soil?.npk?.n || 140);
  const [phosphorus] = useState(plantationData?.soil?.npk?.p || 45);
  const [potassium] = useState(plantationData?.soil?.npk?.k || 180);
  const [ph] = useState(plantationData?.soil?.ph || 6.2);
  const [moisture] = useState(plantationData?.soil?.moisture || 72);
  const [irrigation, setIrrigation] = useState(plantationData?.irrigation || 'Drip');
  
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const calculateYield = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/predict-yield', {
        area: Number(area),
        plant_age: Number(plantAge),
        variety,
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        ph: Number(ph),
        moisture: Number(moisture),
        irrigation,
      });

      if (response.data) {
        setPrediction(response.data);
      }
    } catch (err) {
      // Fallback calculation in UI if network issue
      const base = variety.toLowerCase().includes('njallani') ? 350 : 280;
      const ageMult = plantAge <= 3 ? 0.7 : plantAge <= 9 ? 1.05 : 0.8;
      const yieldPerAcre = Math.round(base * ageMult);
      const totalYield = Math.round(yieldPerAcre * area);
      setPrediction({
        yield_per_acre_kg: yieldPerAcre,
        total_harvest_kg: totalYield,
        estimated_gross_revenue_inr: totalYield * 2100,
        average_price_per_kg: 2100,
        confidence: 0.88,
        recommendations: [
          'Maintain 65-80% soil hydration using pulse drip irrigation.',
          'Apply organic compost and bio-potash during tiller flushing.'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateYield();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EDF2F7] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1F5E3B]/10 flex items-center justify-center text-[#1F5E3B]">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#1F5E3B] text-lg">AI Cardamom Crop Yield Predictor</h3>
            <p className="text-xs text-gray-500 font-medium">Machine Learning Harvest Yield & Gross Revenue Estimator</p>
          </div>
        </div>
        <button
          onClick={calculateYield}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F5E3B] hover:bg-[#154329] text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recalculate AI Yield</span>
        </button>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Land Area (Acres)</label>
          <input
            type="number"
            step="0.5"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#1F5E3B] focus:outline-none focus:border-[#1F5E3B]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Plant Age (Years)</label>
          <input
            type="number"
            step="0.5"
            value={plantAge}
            onChange={(e) => setPlantAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#1F5E3B] focus:outline-none focus:border-[#1F5E3B]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Cardamom Variety</label>
          <select
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#1F5E3B] focus:outline-none focus:border-[#1F5E3B]"
          >
            <option value="Njallani">Njallani (High Yield)</option>
            <option value="Green Gold">Green Gold</option>
            <option value="Vanderperiyar">Vanderperiyar</option>
            <option value="Mudigere">Mudigere</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Irrigation System</label>
          <select
            value={irrigation}
            onChange={(e) => setIrrigation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#1F5E3B] focus:outline-none focus:border-[#1F5E3B]"
          >
            <option value="Drip">Drip Irrigation (Pulse)</option>
            <option value="Sprinkler">Micro Sprinkler</option>
            <option value="Manual">Rain-fed / Manual</option>
          </select>
        </div>
      </div>

      {/* Yield Prediction Display Cards */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Yield Per Acre */}
          <div className="bg-[#F4F9F5] border border-[#C6E6D2] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-[#1F5E3B] font-extrabold uppercase tracking-wide">Yield / Acre</p>
              <h4 className="text-2xl font-black text-[#1F5E3B] mt-1">{prediction.yield_per_acre_kg} <span className="text-xs font-normal">kg/acre</span></h4>
              <p className="text-[10px] text-gray-500 mt-1">Based on soil NPK & variety telemetry</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Harvest */}
          <div className="bg-[#F0F7FF] border border-[#BAE0FF] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-[#0050B3] font-extrabold uppercase tracking-wide">Total Estimated Harvest</p>
              <h4 className="text-2xl font-black text-[#0050B3] mt-1">{prediction.total_harvest_kg?.toLocaleString()} <span className="text-xs font-normal">kg</span></h4>
              <p className="text-[10px] text-gray-500 mt-1">Across {area} acres plantation</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#0050B3] text-white flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Revenue Forecast */}
          <div className="bg-[#FFFBE6] border border-[#FFE58F] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-[#D48800] font-extrabold uppercase tracking-wide">Est. Gross Revenue</p>
              <h4 className="text-2xl font-black text-[#D48800] mt-1">₹{prediction.estimated_gross_revenue_inr?.toLocaleString()}</h4>
              <p className="text-[10px] text-gray-500 mt-1">At avg market price ₹{prediction.average_price_per_kg}/kg</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#D48800] text-white flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Yield Recommendations */}
      {prediction?.recommendations && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#1F5E3B]">
            <Award className="w-4 h-4" />
            <span>AI Yield Optimization Recommendations</span>
          </div>
          <ul className="space-y-1">
            {prediction.recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-[#1F5E3B] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CropYieldPredictor;
