import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gavel, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const CreateAuctionModal = ({ isOpen, onClose, user, onAuctionCreated, onToast }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [userPlantations, setUserPlantations] = useState([]);
  const [selectedPlantationId, setSelectedPlantationId] = useState('');
  const [selectedPlantation, setSelectedPlantation] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(50000);
  const [minIncrement, setMinIncrement] = useState(1000);
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 16));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().substring(0, 16));

  // AI Price Insight State
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch farmer's plantations on load
  useEffect(() => {
    if (!isOpen) return;

    const fetchMyPlantations = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.get('/api/plantations/my-plantations', config);

        if (data.success && data.plantations?.length > 0) {
          setUserPlantations(data.plantations);
          setSelectedPlantationId(data.plantations[0]._id || data.plantations[0].id);
          setSelectedPlantation(data.plantations[0]);
          setTitle(`🌿 ${data.plantations[0].name} Cardamom Auction`);
        }
      } catch (error) {
        console.error('Error fetching plantations:', error);
      }
    };

    fetchMyPlantations();
  }, [isOpen]);

  // Update selected plantation obj when ID changes
  const handlePlantationChange = (id) => {
    setSelectedPlantationId(id);
    const found = userPlantations.find((p) => String(p._id || p.id) === String(id));
    if (found) {
      setSelectedPlantation(found);
      setTitle(`🌿 ${found.name} Cardamom Auction`);
    }
  };

  // Generate AI Price Insight
  const handleFetchAiPriceInsight = async () => {
    if (!selectedPlantation) return;

    try {
      setLoadingAi(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.post(
        '/api/auctions/ai-price-insight',
        {
          areaAcres: selectedPlantation.areaAcres || 5.0,
          district: selectedPlantation.district || 'Idukki',
          cardamomVariety: selectedPlantation.cardamomVariety || 'Njallani Green Gold',
        },
        config
      );

      if (data.success && data.insight) {
        setAiInsight(data.insight);
        if (data.insight.recommendedMinPrice) {
          setStartingPrice(data.insight.recommendedMinPrice);
        }
      }
    } catch (error) {
      console.error('Error generating AI price insight:', error);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (submitForApproval = true) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        plantationId: selectedPlantationId,
        title,
        description,
        startingPrice: Number(startingPrice),
        minIncrement: Number(minIncrement),
        startDate,
        endDate,
        submitForApproval,
      };

      const { data } = await axios.post('/api/auctions', payload, config);

      if (data.success) {
        if (onToast) onToast(data.message || 'Auction created successfully!', 'success');
        if (onAuctionCreated) onAuctionCreated(data.auction);
        onClose();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create auction.';
      if (onToast) onToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-7 shadow-2xl border border-[#D7E6D5] dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold shadow-xs">
              <Gavel size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#17331F] dark:text-white">
                Create Live Plantation Auction
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Step {step} of 3 — {step === 1 ? 'Select Plantation' : step === 2 ? 'Auction Details & AI Price Insight' : 'Review & Submit'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-[#1F5E3B] dark:bg-emerald-400' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: SELECT PLANTATION */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-[#17331F] dark:text-slate-200 mb-2">
                Select Plantation to Auction <span className="text-red-500">*</span>
              </label>

              {userPlantations.length > 0 ? (
                <select
                  value={selectedPlantationId}
                  onChange={(e) => handlePlantationChange(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-sm font-extrabold text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
                >
                  {userPlantations.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      🏡 {p.name} ({p.district || p.location || 'Idukki'}) — {p.areaAcres || 5} Acres
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 text-xs font-bold">
                  ⚠️ No registered plantations found under your account. Please register a plantation first under the "Plantations" tab.
                </div>
              )}
            </div>

            {selectedPlantation && (
              <div className="p-5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 space-y-3 text-xs sm:text-sm">
                <span className="font-black text-[#17331F] dark:text-slate-100 uppercase text-xs block">Plantation Overview:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 font-medium block">Location:</span>
                    <strong className="text-[#17331F] dark:text-white">{selectedPlantation.location || selectedPlantation.district || 'Idukki, Kerala'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Area Size:</span>
                    <strong className="text-[#17331F] dark:text-white">{selectedPlantation.areaAcres || 5.5} Acres</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Variety:</span>
                    <strong className="text-[#17331F] dark:text-white">{selectedPlantation.cardamomVariety || 'Njallani Green Gold'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Estimated Yield:</span>
                    <strong className="text-[#17331F] dark:text-white">{selectedPlantation.estimatedYieldKg || 1200} kg/year</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={() => {
                  handleFetchAiPriceInsight();
                  setStep(2);
                }}
                disabled={!selectedPlantationId}
                className="px-6 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span>Continue to Auction Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AUCTION DETAILS & AI PRICE INSIGHT */}
        {step === 2 && (
          <div className="space-y-5">
            {/* AI PRICE INSIGHT CARD */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#DDEFD9] via-emerald-100 to-[#DDEFD9] dark:from-emerald-950 dark:to-slate-800 border border-[#5C8D4E]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1F5E3B] dark:text-emerald-300 flex items-center gap-1.5 uppercase">
                  <Sparkles size={16} />
                  🤖 Cardora AI Price Insight
                </span>

                <button
                  onClick={handleFetchAiPriceInsight}
                  disabled={loadingAi}
                  className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 font-extrabold text-xs shadow-xs hover:bg-[#DDEFD9]"
                >
                  {loadingAi ? 'Calculating...' : 'Recalculate AI Price'}
                </button>
              </div>

              {aiInsight ? (
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600 font-extrabold">Recommended Starting Price:</span>
                    <strong className="text-xl font-black text-[#17331F] dark:text-slate-100 font-poppins">
                      ₹{aiInsight.recommendedMinPrice?.toLocaleString()} – ₹{aiInsight.recommendedMaxPrice?.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    <span>Expected Demand: <strong className="text-emerald-700 font-black">🟢 {aiInsight.expectedDemand || 'High'}</strong></span>
                    <span>Market Trend: <strong className="text-[#17331F] font-black">{aiInsight.marketTrend || '↗ Favorable'}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">
                    "{aiInsight.reasoning}"
                  </p>

                  <span className="text-[10px] text-gray-500 font-bold block">
                    * AI estimate/recommendation based on current Spices Board India auction trends.
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gray-600 font-semibold">
                  Generating AI price recommendation based on your plantation parameters...
                </div>
              )}
            </div>

            {/* FORM INPUTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-[#17331F] dark:text-slate-200 mb-1">
                  Auction Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl text-sm font-bold bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-[#17331F] dark:text-slate-200 mb-1">
                  Auction Description
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your plantation highlights, crop health, irrigation system, access roads..."
                  className="w-full p-3 rounded-2xl text-sm font-bold bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17331F] dark:text-slate-200 mb-1">
                  Starting Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="1000"
                  min="5000"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl text-sm font-bold bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17331F] dark:text-slate-200 mb-1">
                  Minimum Bid Increment (₹)
                </label>
                <input
                  type="number"
                  step="500"
                  min="500"
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl text-sm font-bold bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17331F] dark:text-slate-200 mb-1">
                  Auction Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-2xl text-xs font-bold bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17331F] dark:text-slate-200 mb-1">
                  Auction End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 rounded-2xl text-xs font-bold bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Review Auction</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & SUBMIT */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 space-y-4">
              <span className="text-xs font-black uppercase text-[#1F5E3B] dark:text-emerald-400 block">
                Auction Preview & Summary:
              </span>

              <div className="space-y-2 text-xs sm:text-sm">
                <h4 className="text-base font-black text-[#17331F] dark:text-white">{title}</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">Plantation:</span>
                    <strong className="block text-[#17331F] dark:text-white">{selectedPlantation?.name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Starting Price:</span>
                    <strong className="block text-emerald-700 font-black text-sm">₹{Number(startingPrice).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Min Increment:</span>
                    <strong className="block text-[#17331F] dark:text-white">₹{Number(minIncrement).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Duration:</span>
                    <strong className="block text-[#17331F] dark:text-white">Until {new Date(endDate).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm cursor-pointer"
              >
                ← Back
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs sm:text-sm hover:bg-slate-300 cursor-pointer"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit for Admin Approval</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateAuctionModal;
