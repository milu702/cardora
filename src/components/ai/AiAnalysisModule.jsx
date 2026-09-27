import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Droplets,
  Sprout, TrendingUp, Calendar, Clock, Activity, Zap, Check, AlertCircle, RefreshCw, Layers,
  Camera, Upload, FileText, Eye, Globe, ShieldAlert, Bug, ArrowLeft, Volume2, VolumeX,
  MessageSquare, History, GitCompare, HelpCircle, UserCheck, CloudRain, Thermometer, ChevronRight, Scan, Target, Cpu
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SCAN_STEPS = [
  { id: 1, text: 'Initializing Image Pixel Matrix & Chlorophyll Index...', icon: Scan },
  { id: 2, text: 'Segmenting Foliage Margins & Lesion Geometry...', icon: Target },
  { id: 3, text: 'Querying Google Gemini Vision AI Model...', icon: Cpu },
  { id: 4, text: 'Matching Cardora Agricultural Knowledge Base (ICAR-IISR)...', icon: ShieldCheck },
  { id: 5, text: 'Synthesizing Real-Time Agronomic Remedies & Action Plan...', icon: Sparkles }
];

const AiAnalysisModule = ({ plantation, onToast, hideHeader = false }) => {
  const { user } = useAuth();
  const [plantationsList, setPlantationsList] = useState([]);
  const [selectedPlantationId, setSelectedPlantationId] = useState(plantation?._id || plantation?.id || '');
  const [currentPlantation, setCurrentPlantation] = useState(plantation || null);

  // MAIN TAB STATE: 'scan' | 'history' | 'compare'
  const [activeTab, setActiveTab] = useState('scan');

  // UPLOAD & SCAN STATE
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [scanningImage, setScanningImage] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // MALAYALAM & SPEECH SYNTHESIS STATE
  const [showMalayalam, setShowMalayalam] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ASK CARDORA STATE
  const [askInput, setAskInput] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askHistory, setAskHistory] = useState([]);

  // HISTORY STATE
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // COMPARE IMAGES STATE
  const [comparePrevPreview, setComparePrevPreview] = useState('');
  const [compareCurrPreview, setCompareCurrPreview] = useState('');
  const [compareNotes, setCompareNotes] = useState('');
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState(null);

  // ESCALATION STATE
  const [escalating, setEscalating] = useState(false);

  const fileInputRef = useRef(null);

  // STEPPING ANIMATION TIMER DURING AI SCANNING
  useEffect(() => {
    let interval = null;
    if (scanningImage) {
      setScanStepIndex(0);
      interval = setInterval(() => {
        setScanStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
      }, 750);
    } else {
      setScanStepIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanningImage]);

  // Load Plantations & Initial History
  useEffect(() => {
    const fetchPlantations = async () => {
      try {
        const res = await apiService.getPlantations();
        if (res && res.success && Array.isArray(res.plantations)) {
          setPlantationsList(res.plantations);
          if (!selectedPlantationId && res.plantations.length > 0) {
            setSelectedPlantationId(res.plantations[0]._id);
            setCurrentPlantation(res.plantations[0]);
          }
        }
      } catch (err) {
        console.warn('Notice fetching plantations:', err.message);
      }
    };

    fetchPlantations();
    loadDiagnosisHistory();
  }, []);

  const loadDiagnosisHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiService.getCropDiagnosisHistory(selectedPlantationId);
      if (res && res.success && Array.isArray(res.history)) {
        setHistoryList(res.history);
      }
    } catch (err) {
      console.warn('Notice fetching diagnosis history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePlantationChange = (id) => {
    setSelectedPlantationId(id);
    const found = plantationsList.find(p => p._id === id || p.id === id);
    setCurrentPlantation(found || null);
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (onToast) onToast('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setImageFile(file);
    setScanError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  // 1. RUN REAL AI CROP DIAGNOSIS (CALLS GEMINI VISION VIA BACKEND API)
  const handleRunRealDiagnosis = async () => {
    if (!imagePreview && !imageFile) {
      if (onToast) onToast('Please upload a crop image for AI diagnosis.');
      return;
    }

    setScanningImage(true);
    setScanError(null);
    setDiagnosisResult(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('imageBase64', imagePreview);
      }
      formData.append('plantationId', selectedPlantationId || '');
      formData.append('farmerNotes', farmerNotes);
      formData.append('userLocation', currentPlantation?.district || currentPlantation?.location || 'Idukki, Kerala');

      const res = await apiService.analyzeCropImageReal(formData);

      if (res && res.success && res.data) {
        setDiagnosisResult(res.data);
        if (onToast) onToast('✅ Real AI Crop Diagnosis Complete!');
        loadDiagnosisHistory();
      } else {
        const errorMsg = res?.message || 'AI analysis could not be completed.';
        setScanError(errorMsg);
        if (onToast) onToast(`❌ ${errorMsg}`);
      }
    } catch (err) {
      console.error('Run Real Diagnosis Error:', err);
      const errorMsg = 'AI analysis could not be completed. Please try again.';
      setScanError(errorMsg);
      if (onToast) onToast(`❌ ${errorMsg}`);
    } finally {
      setScanningImage(false);
    }
  };

  // 2. ASK CARDORA Q&A FOR CURRENT DIAGNOSIS
  const handleAskCardora = async (customPrompt = '') => {
    const textToAsk = customPrompt || askInput.trim();
    if (!textToAsk) return;

    setAskLoading(true);
    try {
      const res = await apiService.askCardoraAboutDiagnosis({
        diagnosis: diagnosisResult,
        question: textToAsk,
        language: showMalayalam ? 'ml' : 'en',
        farmContext: diagnosisResult?.farmContext || {},
      });

      if (res && res.success && res.answer) {
        setAskHistory(prev => [
          ...prev,
          { question: textToAsk, answer: res.answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        setAskInput('');
      } else {
        if (onToast) onToast('Could not answer question. Please try again.');
      }
    } catch (err) {
      if (onToast) onToast('Error querying Ask Cardora.');
    } finally {
      setAskLoading(false);
    }
  };

  // 3. VOICE TEXT-TO-SPEECH (🔊 LISTEN)
  const handleToggleVoicePlayback = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!diagnosisResult) return;

    const textToSpeak = showMalayalam
      ? `ഡിറ്റക്റ്റ് ചെയ്ത രോഗം: ${diagnosisResult.diagnosis}. ലെവൽ: ${diagnosisResult.severity}. ${diagnosisResult.explanation || ''}`
      : `AI Crop Diagnosis: ${diagnosisResult.diagnosis}. Scientific name: ${diagnosisResult.scientificName || 'Not available'}. Severity level: ${diagnosisResult.severity}. Summary: ${diagnosisResult.explanation || ''}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = showMalayalam ? 'ml-IN' : 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 4. COMPARE IMAGES (BEFORE / AFTER)
  const handleRunComparison = async () => {
    if (!comparePrevPreview || !compareCurrPreview) {
      if (onToast) onToast('Please select both Previous and Current crop images to compare.');
      return;
    }

    setCompareLoading(true);
    setCompareResult(null);

    try {
      const res = await apiService.compareCropImages({
        previousImageBase64: comparePrevPreview,
        currentImageBase64: compareCurrPreview,
        farmerNotes: compareNotes,
      });

      if (res && res.success && res.comparison) {
        setCompareResult(res.comparison);
        if (onToast) onToast('✅ AI Crop Progress Comparison Complete!');
      } else {
        if (onToast) onToast(res?.message || 'Comparison failed.');
      }
    } catch (err) {
      if (onToast) onToast('Error running comparison.');
    } finally {
      setCompareLoading(false);
    }
  };

  // 5. ESCALATE TO AGRICULTURAL EXPERT
  const handleEscalateToExpert = async () => {
    if (!diagnosisResult) return;
    setEscalating(true);
    try {
      const res = await apiService.createExpertConsultation({
        title: `AI Escalation Query: ${diagnosisResult.diagnosis}`,
        category: 'Plant Pathology & Diseases',
        questionText: `Farmer requested human agricultural expert review for recent AI Crop Scan. Observed: ${diagnosisResult.visualEvidence?.join(', ') || 'Visual symptoms'}`,
        plantation: selectedPlantationId || null,
        image: imagePreview || '',
        language: showMalayalam ? 'ml' : 'en',
      });

      if (res && res.success) {
        if (onToast) onToast('✅ Ticket submitted to Agricultural Expert Desk!');
      } else {
        if (onToast) onToast(res?.message || 'Escalation failed.');
      }
    } catch (err) {
      if (onToast) onToast('Error submitting consultation ticket.');
    } finally {
      setEscalating(false);
    }
  };

  // Reset to Scan View
  const handleResetScan = () => {
    setDiagnosisResult(null);
    setScanError(null);
    setImagePreview('');
    setImageFile(null);
    setFarmerNotes('');
    setAskHistory([]);
  };

  // Helper for rendering bounding box SVG overlays
  const renderBoundingBoxOverlay = () => {
    if (!diagnosisResult?.affectedRegions || !Array.isArray(diagnosisResult.affectedRegions) || diagnosisResult.affectedRegions.length === 0) {
      return null;
    }

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {diagnosisResult.affectedRegions.map((region, idx) => {
          if (!region.box || region.box.length < 4) return null;
          const [x, y, w, h] = region.box;
          const leftPct = x <= 1 ? `${x * 100}%` : `${x}%`;
          const topPct = y <= 1 ? `${y * 100}%` : `${y}%`;
          const widthPct = w <= 1 ? `${w * 100}%` : `${w}%`;
          const heightPct = h <= 1 ? `${h * 100}%` : `${h}%`;

          return (
            <g key={idx}>
              <rect
                x={leftPct}
                y={topPct}
                width={widthPct}
                height={heightPct}
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                rx="4"
              />
              <text
                x={leftPct}
                y={topPct}
                dy="-6"
                fill="#EF4444"
                fontSize="11"
                fontWeight="bold"
                className="bg-black/70 px-1 rounded"
              >
                {region.label || `Affected Area #${idx + 1}`}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-900 text-slate-100 p-4 md:p-8">
      {/* HEADER BAR */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-emerald-800/40 pb-5">
          <div className="flex items-center gap-3">
            {diagnosisResult && (
              <button
                onClick={handleResetScan}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> ← Back to Scan
              </button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
                AI Crop Diagnosis Engine
              </h1>
              <p className="text-slate-400 text-xs md:text-sm">
                Real Gemini Vision Analysis • Peer-Reviewed Cardora Knowledge Base • Live Telemetry
              </p>
            </div>
          </div>

          {/* Plantations Selector & Tab Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {plantationsList.length > 0 && (
              <select
                value={selectedPlantationId}
                onChange={(e) => handlePlantationChange(e.target.value)}
                className="bg-slate-800/90 border border-emerald-700/50 text-emerald-300 text-xs md:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Plantation Plot Context...</option>
                {plantationsList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    🌿 {p.name || 'Estate Plot'} ({p.district || p.location || 'Idukki'})
                  </option>
                ))}
              </select>
            )}

            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-emerald-900/60">
              <button
                onClick={() => setActiveTab('scan')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${activeTab === 'scan' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Camera className="w-4 h-4" /> AI Scan
              </button>
              <button
                onClick={() => { setActiveTab('history'); loadDiagnosisHistory(); }}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <History className="w-4 h-4" /> History
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${activeTab === 'compare' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <GitCompare className="w-4 h-4" /> Compare Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TAB CONTENT */}
      {activeTab === 'scan' && (
        <>
          {/* STATE 1: UPLOAD & SCANNING INTERFACE */}
          {!diagnosisResult && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* HIGH-TECH AI SCANNING LASER OVERLAY WHEN SCANNING IS ACTIVE */}
              {scanningImage ? (
                <div className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden">
                  <div className="text-center space-y-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      LIVE GEMINI VISION SPECTRAL LASER SCANNING
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white">Analyzing Crop Image Structure</h2>
                  </div>

                  {/* LASER SCANNER FRAME */}
                  <div className="relative max-w-md mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-emerald-400/90 bg-black shadow-2xl">
                    {/* Background Target Image */}
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Scanning target"
                        className="w-full h-full object-contain filter brightness-90 contrast-110"
                      />
                    )}

                    {/* HUD CYBER GRID OVERLAY */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966920_1px,transparent_1px),linear-gradient(to_bottom,#05966920_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                    {/* HUD CORNER BRACKETS */}
                    <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl shadow-[0_0_10px_#10B981]" />
                    <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr shadow-[0_0_10px_#10B981]" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl shadow-[0_0_10px_#10B981]" />
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br shadow-[0_0_10px_#10B981]" />

                    {/* ANIMATED VERTICAL LASER SWEEP LINE */}
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '95%', '0%'] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee,0_0_40px_#10b981] z-20"
                    >
                      <div className="w-full h-12 bg-gradient-to-b from-cyan-500/25 to-transparent -translate-y-12" />
                    </motion.div>

                    {/* CENTER HUD CROSSHAIR */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 border border-emerald-500/40 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR & ANIMATED STEP CHECKLIST */}
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-emerald-900/60">
                      <motion.div
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 h-full"
                        animate={{ width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    <div className="bg-slate-800/80 border border-emerald-900/80 rounded-2xl p-4 space-y-2">
                      {SCAN_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = idx < scanStepIndex;
                        const isCurrent = idx === scanStepIndex;

                        return (
                          <div
                            key={step.id}
                            className={`flex items-center gap-3 text-xs p-2 rounded-xl transition-all duration-300 ${isCurrent
                                ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 font-bold scale-[1.02]'
                                : isDone
                                  ? 'text-emerald-400/70 font-medium'
                                  : 'text-slate-500 font-normal'
                              }`}
                          >
                            <div className={`p-1 rounded-lg ${isCurrent ? 'bg-emerald-500 text-white animate-spin' : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                              {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                            </div>
                            <span>{step.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* UPLOAD SELECTION BOX WHEN NOT SCANNING */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging
                      ? 'border-emerald-400 bg-emerald-950/50 scale-[1.01]'
                      : 'border-emerald-700/60 bg-slate-800/40 hover:border-emerald-500 hover:bg-slate-800/60'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e.target.files?.[0])}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative max-w-md mx-auto group">
                      <img
                        src={imagePreview}
                        alt="Uploaded crop target"
                        className="w-full h-64 object-cover rounded-xl border border-emerald-500/40 shadow-xl"
                      />
                      <button
                        onClick={() => { setImagePreview(''); setImageFile(null); }}
                        className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-full hover:bg-red-500 shadow-md transition"
                        title="Remove image"
                      >
                        ✕
                      </button>
                      <p className="text-xs text-emerald-400 mt-2">✓ Actual Image Loaded Ready for Analysis</p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-900/50 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shadow-inner">
                        <Upload className="w-10 h-10 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Upload Crop Leaf / Pod Image</h3>
                        <p className="text-slate-400 text-xs md:text-sm mt-1">
                          Drag & drop your actual plant photo here, or click to browse files
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg transition"
                      >
                        Select Plant Image
                      </button>
                      <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP (Max 20MB)</p>
                    </div>
                  )}
                </div>
              )}

              {/* FARMER NOTES INPUT */}
              {!scanningImage && (
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                  <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Farmer Notes / Observed Symptoms (Optional)
                  </label>
                  <input
                    type="text"
                    value={farmerNotes}
                    onChange={(e) => setFarmerNotes(e.target.value)}
                    placeholder="e.g. Yellow discoloration on leaf margins, dark spots on lower capsules..."
                    className="w-full bg-slate-900/80 border border-emerald-900/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* RUN DIAGNOSIS BUTTON */}
              {!scanningImage && (
                <div className="flex justify-center">
                  <button
                    disabled={scanningImage || (!imagePreview && !imageFile)}
                    onClick={handleRunRealDiagnosis}
                    className={`w-full max-w-md py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition transform active:scale-98 ${scanningImage || (!imagePreview && !imageFile)
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-950/50'
                      }`}
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    Diagnose Actual Crop Image Now
                  </button>
                </div>
              )}

              {/* ERROR STATE DISPLAY (REQUIREMENT #22 - NO DEMO FALLBACK ON ERROR) */}
              {scanError && !scanningImage && (
                <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-5 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                  <h4 className="text-base font-bold text-red-200">AI Analysis Could Not Be Completed</h4>
                  <p className="text-xs text-red-300 max-w-md mx-auto">{scanError}</p>
                  <button
                    onClick={handleRunRealDiagnosis}
                    className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: FULL SCREEN DATA-DRIVEN DIAGNOSIS RESULT VIEW (REQUIREMENT #24) */}
          {diagnosisResult && (
            <div className="space-y-8 animate-fadeIn">
              {/* TOP BANNER */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-700/50 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {diagnosisResult.crop || 'Cardamom'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {diagnosisResult.diagnosisType || 'Botanical Assessment'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                    {diagnosisResult.diagnosis}
                  </h2>
                  {diagnosisResult.scientificName && (
                    <p className="text-emerald-400 text-xs italic mt-0.5">
                      Scientific Name: {diagnosisResult.scientificName}
                    </p>
                  )}
                </div>

                {/* CONTROLS: MALAYALAM TOGGLE & 🔊 LISTEN */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMalayalam(!showMalayalam)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 ${showMalayalam
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {showMalayalam ? 'English' : 'മലയാളം'}
                  </button>

                  <button
                    onClick={handleToggleVoicePlayback}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 ${isSpeaking
                        ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isSpeaking ? 'Stop' : '🔊 Listen'}
                  </button>
                </div>
              </div>

              {/* POOR IMAGE QUALITY WARNING BANNER (REQUIREMENT #4) */}
              {diagnosisResult.qualityWarning && (
                <div className="bg-amber-950/60 border border-amber-800/80 rounded-2xl p-4 flex items-center gap-4">
                  <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-200">
                      {diagnosisResult.qualityWarning.title}
                    </h4>
                    <p className="text-xs text-amber-300/90 mt-0.5">
                      {diagnosisResult.qualityWarning.suggestion}
                    </p>
                  </div>
                </div>
              )}

              {/* TWO COLUMN GRID: LEFT = ACTUAL IMAGE & VISUAL EVIDENCE, RIGHT = METRICS & DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN (5 COLS): ACTUAL UPLOADED IMAGE & BOUNDING BOX OVERLAY */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Actual Uploaded Image & AI Highlighting
                    </h3>

                    <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-black aspect-square flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Actual uploaded crop target"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-500">No Image Preview</div>
                      )}

                      {/* SVG BOUNDING BOX OVERLAY (REQUIREMENT #8) */}
                      {renderBoundingBoxOverlay()}
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">
                      Displaying exact user upload. Red bounding boxes indicate AI-detected region coordinates if identified.
                    </p>
                  </div>

                  {/* VISUAL EVIDENCE LIST (REQUIREMENT #6) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Visual Evidence (Image Supported)
                    </h3>
                    {Array.isArray(diagnosisResult.visualEvidence) && diagnosisResult.visualEvidence.length > 0 ? (
                      <ul className="space-y-2">
                        {diagnosisResult.visualEvidence.map((ev, i) => (
                          <li key={i} className="text-xs text-slate-200 flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific visual features isolated from this image.</p>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN (7 COLS): METRICS & DETAILED SPECIFICATIONS */}
                <div className="lg:col-span-7 space-y-6">
                  {/* METRICS ROW (DIAGNOSIS, CONFIDENCE, SEVERITY, QUALITY) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* CONFIDENCE CARD (REQUIREMENT #5 - DO NOT FAKE CONFIDENCE) */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">AI Confidence</p>
                      <p className="text-sm font-extrabold text-amber-300 mt-1">
                        {diagnosisResult.confidenceAvailable && diagnosisResult.confidence !== null
                          ? `${diagnosisResult.confidence}%`
                          : 'AI confidence: Not available'}
                      </p>
                    </div>

                    {/* SEVERITY CARD */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Severity Level</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold mt-1 ${diagnosisResult.severity === 'High' || diagnosisResult.severity === 'Critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : diagnosisResult.severity === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                        {diagnosisResult.severity || 'Undetermined'}
                      </span>
                    </div>

                    {/* IMAGE QUALITY CARD */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Image Quality</p>
                      <p className={`text-xs font-bold mt-1 ${diagnosisResult.imageQuality === 'Poor' || diagnosisResult.imageQuality === 'Insufficient'
                          ? 'text-red-400'
                          : 'text-emerald-400'
                        }`}>
                        {diagnosisResult.imageQuality || 'Good'}
                      </p>
                    </div>

                    {/* CROP CARD */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Identified Crop</p>
                      <p className="text-xs font-bold text-emerald-300 mt-1">
                        {diagnosisResult.crop || 'Cardamom'}
                      </p>
                    </div>
                  </div>

                  {/* AI EXPLANATION */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      AI Analysis Summary
                    </h3>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                      {diagnosisResult.explanation}
                    </p>
                  </div>

                  {/* SYMPTOMS & POSSIBLE CAUSES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5" /> Observed Symptoms
                      </h4>
                      {Array.isArray(diagnosisResult.symptoms) && diagnosisResult.symptoms.length > 0 ? (
                        <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                          {diagnosisResult.symptoms.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">None logged.</p>
                      )}
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Possible Causes
                      </h4>
                      {Array.isArray(diagnosisResult.possibleCauses) && diagnosisResult.possibleCauses.length > 0 ? (
                        <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                          {diagnosisResult.possibleCauses.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">None logged.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* FULL WIDTH CARDORA KNOWLEDGE BASE & VERIFIED RECOMMENDATIONS (REQUIREMENT #9 & #10) */}
              <div className="bg-slate-900/90 border border-emerald-800/60 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Cardora Agricultural Knowledge Base Recommendations
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Peer-reviewed treatments from verified agricultural research bodies
                    </p>
                  </div>

                  {/* SOURCE ATTRIBUTION BADGE (REQUIREMENT #10) */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Source: {diagnosisResult.knowledgeSource || 'ICAR–Indian Institute of Spices Research'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ORGANIC MANAGEMENT */}
                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-emerald-400" /> Organic Management & Bio-Control
                    </h4>
                    {Array.isArray(diagnosisResult.organicTreatment) && diagnosisResult.organicTreatment.length > 0 ? (
                      <ul className="space-y-2">
                        {diagnosisResult.organicTreatment.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No organic recommendations listed.</p>
                    )}
                  </div>

                  {/* CHEMICAL CONTROL */}
                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-teal-400" /> Chemical Control Protocols
                    </h4>
                    {Array.isArray(diagnosisResult.chemicalControl) && diagnosisResult.chemicalControl.length > 0 ? (
                      <ul className="space-y-2">
                        {diagnosisResult.chemicalControl.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                            <span className="text-teal-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No chemical treatments listed.</p>
                    )}
                  </div>
                </div>

                {/* PREVENTION PROTOCOLS */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Long-Term Field Prevention
                  </h4>
                  {Array.isArray(diagnosisResult.prevention) && diagnosisResult.prevention.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {diagnosisResult.prevention.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-amber-400 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No long-term prevention protocols logged.</p>
                  )}
                </div>
              </div>

              {/* ACTION PLAN SECTION (REQUIREMENT #13) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" /> Practical Action Plan Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/60 border border-emerald-900/60 rounded-xl p-4 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300">TODAY</span>
                    <p className="text-xs text-slate-200 mt-2">
                      {diagnosisResult.immediateActions?.[0] || 'Inspect plant clump margins.'}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-500/20 text-teal-300">NEXT 24 HOURS</span>
                    <p className="text-xs text-slate-200 mt-2">
                      {diagnosisResult.immediateActions?.[1] || 'Apply bio-control or prune affected tillers.'}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300">NEXT 3 DAYS</span>
                    <p className="text-xs text-slate-200 mt-2">
                      {diagnosisResult.followUpActions?.[0] || 'Monitor surrounding plot clumps.'}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-700 text-slate-300">FOLLOW-UP</span>
                    <p className="text-xs text-slate-200 mt-2">
                      {diagnosisResult.followUpActions?.[1] || 'Re-evaluate crop health in 14 days.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SEPARATE DATA SOURCES: FARM CONTEXT & WEATHER TELEMETRY (REQUIREMENT #11 & #12) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FARM DATA */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> Farm & Soil Context (MongoDB)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                      <span className="text-slate-400 block text-[10px]">Plantation Plot</span>
                      <span className="text-white font-bold">{diagnosisResult.farmContext?.plantationName || 'Field Context'}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                      <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
                      <span className="text-emerald-300 font-bold">{diagnosisResult.farmContext?.soilMoisture || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                      <span className="text-slate-400 block text-[10px]">Soil pH</span>
                      <span className="text-teal-300 font-bold">{diagnosisResult.farmContext?.soilPh || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                      <span className="text-slate-400 block text-[10px]">Soil NPK</span>
                      <span className="text-amber-300 font-bold">{diagnosisResult.farmContext?.npk || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* WEATHER DATA */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-teal-400" /> Weather API Telemetry (Live API)
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40 text-center">
                      <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <span className="text-slate-400 block text-[10px]">Temperature</span>
                      <span className="text-white font-bold">{diagnosisResult.farmContext?.weatherTemp || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40 text-center">
                      <Droplets className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                      <span className="text-slate-400 block text-[10px]">Humidity</span>
                      <span className="text-teal-300 font-bold">{diagnosisResult.farmContext?.weatherHumidity || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40 text-center">
                      <CloudRain className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <span className="text-slate-400 block text-[10px]">Rainfall</span>
                      <span className="text-blue-300 font-bold">{diagnosisResult.farmContext?.weatherRain || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ASK CARDORA SECTION (REQUIREMENT #14) */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-800/50 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" /> Ask Cardora About This Diagnosis
                </h3>
                <p className="text-xs text-slate-400">
                  Ask follow-up questions specifically regarding this crop diagnosis result:
                </p>

                {/* QUICK PROMPT PILLS */}
                <div className="flex flex-wrap gap-2">
                  {[
                    'What should I do today?',
                    'Why did this happen?',
                    'Can I use organic treatment?',
                    'Is this dangerous for my plantation?',
                    'Explain this in Malayalam.'
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskCardora(pill)}
                      disabled={askLoading}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900/60 border border-slate-700 text-xs text-emerald-300 font-medium transition"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Q&A CHAT INPUT */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={askInput}
                    onChange={(e) => setAskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskCardora()}
                    placeholder="Ask Cardora anything about this diagnosis..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => handleAskCardora()}
                    disabled={askLoading || !askInput.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    {askLoading ? 'Asking...' : 'Ask'}
                  </button>
                </div>

                {/* Q&A RESPONSES LIST */}
                {askHistory.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    {askHistory.map((item, idx) => (
                      <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-semibold">
                          <span>Q: {item.question}</span>
                          <span>{item.time}</span>
                        </div>
                        <p className="text-xs md:text-sm text-emerald-200 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-emerald-900/40">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS: CONSULT EXPERT ESCALATION (REQUIREMENT #21) */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div>
                  <h4 className="text-sm font-bold text-white">Need Additional Agronomist Advice?</h4>
                  <p className="text-xs text-slate-400">Escalate this image and diagnosis to Cardora Expert Desk.</p>
                </div>
                <button
                  onClick={handleEscalateToExpert}
                  disabled={escalating}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {escalating ? 'Submitting Ticket...' : 'Consult Agricultural Expert'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: DIAGNOSIS HISTORY (REQUIREMENT #16 & #17) */}
      {activeTab === 'history' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" /> Stored Crop Diagnosis History
            </h2>
            <button
              onClick={loadDiagnosisHistory}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading stored history...</div>
          ) : historyList.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <History className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Stored Diagnoses Found</h3>
              <p className="text-xs text-slate-400">Perform an AI Crop Scan to save real results to MongoDB.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyList.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setDiagnosisResult(item);
                    setImagePreview(item.imageUrl);
                    setActiveTab('scan');
                  }}
                  className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition space-y-3 group"
                >
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="font-semibold text-emerald-400">{item.plotId || 'Main Plot'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt="Diagnosis target"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-700"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                        {item.diagnosis}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.crop}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.severity === 'High' || item.severity === 'Critical'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                      {item.severity}
                    </span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 group-hover:translate-x-1 transition">
                      View Result <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BEFORE / AFTER IMAGE COMPARISON (REQUIREMENT #18) */}
      {activeTab === 'compare' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <GitCompare className="w-5 h-5 text-emerald-400" /> Compare Crop Images (Progress Tracking)
            </h2>
            <p className="text-xs text-slate-400">Select previous and current crop photos to analyze visual changes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* PREVIOUS IMAGE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase">1. Previous Crop Photo</h3>
              {comparePrevPreview ? (
                <div className="relative">
                  <img src={comparePrevPreview} alt="Previous crop" className="w-full h-48 object-cover rounded-xl" />
                  <button onClick={() => setComparePrevPreview('')} className="absolute top-2 right-2 bg-red-600 text-white text-xs p-1 rounded-full">✕</button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onloadend = () => setComparePrevPreview(r.result);
                      r.readAsDataURL(file);
                    }
                  }}
                  className="text-xs text-slate-400"
                />
              )}
            </div>

            {/* CURRENT IMAGE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
              <h3 className="text-xs font-bold text-emerald-300 uppercase">2. Current Crop Photo</h3>
              {compareCurrPreview ? (
                <div className="relative">
                  <img src={compareCurrPreview} alt="Current crop" className="w-full h-48 object-cover rounded-xl" />
                  <button onClick={() => setCompareCurrPreview('')} className="absolute top-2 right-2 bg-red-600 text-white text-xs p-1 rounded-full">✕</button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onloadend = () => setCompareCurrPreview(r.result);
                      r.readAsDataURL(file);
                    }
                  }}
                  className="text-xs text-slate-400"
                />
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRunComparison}
              disabled={compareLoading || !comparePrevPreview || !compareCurrPreview}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition"
            >
              {compareLoading ? 'Comparing Images...' : 'Run Progress Comparison'}
            </button>
          </div>

          {/* COMPARISON RESULT */}
          {compareResult && (
            <div className="bg-slate-900/90 border border-emerald-800/60 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-emerald-300">Comparison Result</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Previous Condition:</span>
                  <span className="text-white font-bold">{compareResult.previousCondition}</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Current Condition:</span>
                  <span className="text-emerald-300 font-bold">{compareResult.currentCondition}</span>
                </div>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 text-xs space-y-1">
                <span className="text-amber-400 font-bold block">Improvement Status: {compareResult.improvementStatus}</span>
                <p className="text-slate-200">{compareResult.visualChange}</p>
                <p className="text-emerald-300 pt-1 font-medium">{compareResult.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiAnalysisModule;
