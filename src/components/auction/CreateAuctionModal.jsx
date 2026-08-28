import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gavel, RefreshCw, ArrowRight, ArrowLeft, Upload, Image as ImageIcon, Plus } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

  // Gallery Images State
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const presetPhotos = [
    'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80',
  ];

  const handleAddImageUrl = () => {
    if (imageUrlInput && imageUrlInput.startsWith('http')) {
      setImages((prev) => [...prev, imageUrlInput]);
      setImageUrlInput('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Price Insight State
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch farmer's plantations on load
  useEffect(() => {
    if (!isOpen) return;

    const fetchMyPlantations = async () => {
      try {
        const token = localStorage.getItem('cardora_token') || localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.get(`${API_BASE}/plantations/my-plantations`, config);

        if (data.success && data.plantations?.length > 0) {
          setUserPlantations(data.plantations);
          setSelectedPlantationId(data.plantations[0]._id || data.plantations[0].id);
          setSelectedPlantation(data.plantations[0]);
          setTitle(`🌿 ${data.plantations[0].name} Cardamom Auction`);
        } else {
          // Default fallback plantation if user hasn't registered one yet
          const fallback = {
            _id: '',
            name: `${user?.fullName || user?.name || 'My'} Cardamom Estate`,
            district: user?.district || 'Idukki',
            location: user?.location || 'Idukki, Kerala',
            areaAcres: 5.5,
            cardamomVariety: 'Njallani Green Gold',
            estimatedYieldKg: 1200,
          };
          setSelectedPlantation(fallback);
          setTitle(`🌿 ${fallback.name} Auction`);
        }
      } catch (error) {
        console.error('Error fetching plantations:', error);
        const fallback = {
          _id: '',
          name: `${user?.fullName || user?.name || 'My'} Cardamom Estate`,
          district: user?.district || 'Idukki',
          location: user?.location || 'Idukki, Kerala',
          areaAcres: 5.5,
          cardamomVariety: 'Njallani Green Gold',
          estimatedYieldKg: 1200,
        };
        setSelectedPlantation(fallback);
        setTitle(`🌿 ${fallback.name} Auction`);
      }
    };

    fetchMyPlantations();
  }, [isOpen, user]);

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
      const token = localStorage.getItem('cardora_token') || localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const { data } = await axios.post(
        `${API_BASE}/auctions/ai-price-insight`,
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
      let token = localStorage.getItem('cardora_token') || localStorage.getItem('token');
      
      // Failsafe: Scan localStorage for any valid session token
      if (!token) {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('token') || key.includes('auth'))) {
              const val = localStorage.getItem(key);
              if (val && val.length > 15) {
                token = val.replace(/"/g, '');
                break;
              }
            }
          }
        } catch (e) {}
      }

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        plantationId: (selectedPlantationId && selectedPlantationId.length > 5) ? selectedPlantationId : undefined,
        title: title || '🌿 Cardamom Estate Auction',
        description: description || 'High yield cardamom plantation auction.',
        startingPrice: Number(startingPrice) || 50000,
        minIncrement: Number(minIncrement) || 1000,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(Date.now() + 3 * 24 * 3600 * 1000),
        images: images.length > 0 ? images : undefined,
        submitForApproval,
      };

      const { data } = await axios.post(`${API_BASE}/auctions`, payload, config);

      if (data.success) {
        const successMsg = submitForApproval
          ? '🎉 Auction submitted for Admin Approval successfully!'
          : 'Draft saved successfully!';
        if (onToast) onToast(data.message || successMsg, 'success');
        if (onAuctionCreated) onAuctionCreated(data.auction);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting auction:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to create auction.';
      if (onToast) onToast(`⚠️ ${msg}`, 'error');
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
                disabled={!selectedPlantation}
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

              {/* PLANTATION GALLERY PHOTOS & FILE UPLOAD */}
              <div className="sm:col-span-2 space-y-3 pt-2 border-t border-dashed border-[#D7E6D5] dark:border-slate-700">
                <label className="block text-xs font-extrabold text-[#17331F] dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-[#1F5E3B] dark:text-emerald-400" />
                    Plantation Photos & Gallery
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">Upload file, URL, or pick presets</span>
                </label>

                {/* IMAGE PREVIEW THUMBNAILS */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-20 rounded-2xl overflow-hidden border border-[#D7E6D5] dark:border-slate-700 shrink-0 group shadow-xs">
                      <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* UPLOAD FILE BUTTON */}
                  <label className="w-24 h-20 rounded-2xl border-2 border-dashed border-[#1F5E3B]/40 hover:border-[#1F5E3B] bg-[#F8FAF7] dark:bg-slate-800 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shrink-0">
                    <Upload size={18} className="text-[#1F5E3B] dark:text-emerald-400" />
                    <span className="text-[10px] font-black text-[#1F5E3B] dark:text-emerald-400">Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* PASTE IMAGE URL & ADD BUTTON */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Paste Image URL (https://...)"
                    className="flex-1 p-2.5 rounded-xl text-xs font-bold bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add URL</span>
                  </button>
                </div>

                {/* QUICK PRESET PHOTOS */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-gray-400 font-bold block">Preset Spice Estate Photos:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {presetPhotos.map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!images.includes(imgUrl)) setImages((prev) => [...prev, imgUrl]);
                        }}
                        className={`relative h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          images.includes(imgUrl) ? 'border-[#1F5E3B] ring-2 ring-[#1F5E3B]/30' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        {images.includes(imgUrl) && (
                          <span className="absolute top-1 right-1 bg-[#1F5E3B] text-white rounded-full p-0.5 text-[8px]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
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

                {images.length > 0 && (
                  <div className="pt-2">
                    <span className="text-gray-400 font-medium text-xs block mb-1">Attached Gallery Photos ({images.length}):</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <img key={i} src={img} alt={`Preview ${i}`} className="w-16 h-12 rounded-xl object-cover border border-[#D7E6D5] shrink-0" />
                      ))}
                    </div>
                  </div>
                )}
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
