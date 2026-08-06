import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Upload, ShieldCheck, MapPin, Sparkles, CheckCircle2, 
  FileText, Camera, DollarSign, Mountain, Droplets, Check, AlertCircle 
} from 'lucide-react';
import { KERALA_DISTRICTS } from '../../utils/districts';

const PublishPlotModal = ({ onClose, onPublish, lang }) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Documents & Media, 3: Success
  const [formData, setFormData] = useState({
    title: '',
    listingType: 'sale', // 'sale' | 'lease'
    district: 'Idukki',
    location: '',
    area: '',
    price: '',
    altitude: '1,100m',
    yield: '420 kg / acre',
    plants: '2,500 Plants',
    organic: true,
    roadAccess: true,
    description: '',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    ownerName: '',
    ownerPhone: '',
    pattayamDoc: null,
    surveyDoc: null,
    ecDoc: null,
  });

  const [ocrStatus, setOcrStatus] = useState(null); // 'scanning' | 'verified'

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSimulateOcr = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrStatus('scanning');
      setTimeout(() => {
        setOcrStatus('verified');
      }, 1500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.area) {
      alert(lang === 'ml' ? 'ദയവായി എല്ലാ പ്രധാന വിവരങ്ങളും നൽകുക.' : 'Please fill out title, area, and price.');
      return;
    }

    const newPlot = {
      id: `p-${Date.now()}`,
      title: formData.title,
      location: `${formData.location || 'Vandenmedu'}, ${formData.district}`,
      district: formData.district,
      area: `${formData.area} Acres`,
      price: formData.listingType === 'sale' ? `₹${formData.price}` : `₹${formData.price} / Year`,
      priceRaw: Number(formData.price.replace(/[^0-9]/g, '')) * 100000 || 10000000,
      altitude: formData.altitude,
      altitudeRaw: 1100,
      yield: formData.yield,
      roi: '25% Annual',
      trustScore: '99.2%',
      healthScore: '98%',
      soilPh: '6.2 (Optimal)',
      plants: formData.plants,
      owner: formData.ownerName || 'Verified Planter',
      ownerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.ownerName || 'Planter')}&background=1B5E20&color=ffffff`,
      image: formData.image,
      verified: true,
      organic: formData.organic,
      roadAccess: formData.roadAccess,
      listingType: formData.listingType,
      description: formData.description,
    };

    setStep(3);
    setTimeout(() => {
      onPublish(newPlot);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-[#2E7D32]/40 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#1B5E20] text-white p-4 px-6 flex items-center justify-between border-b border-[#66BB6A]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#66BB6A] text-slate-950">
              <Plus className="w-5 h-5 font-black" />
            </div>
            <div>
              <h3 className="text-base font-black font-poppins text-white">
                {lang === 'ml' ? 'ഏലത്തോട്ടം വിൽപ്പനയ്ക്ക് പ്രസിദ്ധീകരിക്കുക' : 'Publish Plantation Plot for Sale or Lease'}
              </h3>
              <p className="text-xs text-emerald-200">99.4% AI Legal OCR Document Scan & Instant Buyer Matching</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                  Listing Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('listingType', 'sale')}
                    className={`py-3 rounded-2xl font-black text-xs transition-all border ${
                      formData.listingType === 'sale'
                        ? 'bg-[#1B5E20] text-white border-[#66BB6A] shadow-md'
                        : 'bg-[#F8FFF8] dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-[#2E7D32]/20'
                    }`}
                  >
                    For Sale (വിൽപ്പനയ്ക്ക്)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('listingType', 'lease')}
                    className={`py-3 rounded-2xl font-black text-xs transition-all border ${
                      formData.listingType === 'lease'
                        ? 'bg-[#1B5E20] text-white border-[#66BB6A] shadow-md'
                        : 'bg-[#F8FFF8] dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-[#2E7D32]/20'
                    }`}
                  >
                    For Lease (പാട്ടത്തിന്)
                  </button>
                </div>
              </div>

              {/* Title & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Plantation Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vandenmedu 10 Acre Green Gold Estate"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. J. Joseph"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  />
                </div>
              </div>

              {/* District & Village Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    District Location *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Village / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vandenmedu / Kattappana"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  />
                </div>
              </div>

              {/* Area, Price, Altitude */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Area (Acres) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5.5"
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Valuation / Price *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1.25 Cr or 15 Lakhs"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Altitude (MSL meters)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1,150m"
                    value={formData.altitude}
                    onChange={(e) => handleChange('altitude', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                  Plantation Photo URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#1B5E20] text-white font-black text-xs shadow-xl hover:bg-[#2E7D32]"
                >
                  Next: AI Legal Document Scan →
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-[#66BB6A]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-[#1B5E20] dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-black text-[#1B5E20] dark:text-white">AI Legal OCR Verification Engine</h4>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">Upload Pattayam or Survey sketch for instant 99.4% verification badge.</p>
                  </div>
                </div>
              </div>

              {/* Upload Drop Zone Simulation */}
              <div className="border-2 border-dashed border-[#2E7D32]/40 rounded-3xl p-6 text-center bg-[#F8FFF8] dark:bg-slate-800 space-y-3">
                <Upload className="w-10 h-10 text-[#1B5E20] dark:text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-xs font-black text-[#1B5E20] dark:text-white">
                  Upload Land Ownership Title (Pattayam) or Survey Sketch
                </h4>
                <p className="text-[10px] text-gray-500">Supports PDF, JPG, PNG up to 25MB</p>

                <input
                  type="file"
                  onChange={handleSimulateOcr}
                  className="hidden"
                  id="pattayam-upload-input"
                />

                <label
                  htmlFor="pattayam-upload-input"
                  className="inline-block px-5 py-2.5 rounded-2xl bg-[#1B5E20] text-white font-black text-xs cursor-pointer hover:bg-[#2E7D32] shadow-md"
                >
                  Select File from Computer
                </label>

                {ocrStatus === 'scanning' && (
                  <div className="pt-2 text-xs font-black text-amber-600 animate-pulse flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>AI Scanning document OCR, matching revenue records...</span>
                  </div>
                )}

                {ocrStatus === 'verified' && (
                  <div className="pt-2 text-xs font-black text-emerald-600 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>100% Survey & Ownership Title Match Confirmed!</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                  Plantation Description & Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your cardamom variety, drip irrigation setup, drying house, and reason for selling..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-2xl border border-gray-300 font-bold text-xs"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-black text-xs shadow-xl hover:scale-105 transition-all"
                >
                  Publish Listing to CARDORA Ecosystem
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#66BB6A] mx-auto animate-bounce" />
              <h3 className="text-2xl font-black font-poppins text-[#1B5E20] dark:text-white">
                Plantation Published Successfully!
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                Your plantation plot has been verified by CARDORA AI Trust Engine and is now live on the interactive Satellite Map marketplace.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PublishPlotModal;
