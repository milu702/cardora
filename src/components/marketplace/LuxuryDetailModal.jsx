import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestmentRiskEvaluator from '../ai/InvestmentRiskEvaluator';
import { 
  X, ShieldCheck, Award, Eye, Video, Map, Volume2, Globe, Download, Printer, 
  Share2, Bookmark, CheckCircle, AlertTriangle, FileText, User, MessageSquare, 
  Phone, Video as VideoIcon, Calendar, Clock, Sparkles, TrendingUp, Droplets, 
  Thermometer, Trees, Mountain, Check, ArrowRight, CornerDownRight, Edit3
} from 'lucide-react';

const LuxuryDetailModal = ({ plot, onClose, onOpenChat, onScheduleVisit, onEditPlot, lang, toggleLang }) => {
  const [activeMediaTab, setActiveMediaTab] = useState('360'); // '360' | 'drone' | 'gallery' | 'map'
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // 'overview' | 'docs' | 'trust' | 'agriculture' | 'owner'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!plot) return null;

  const plotPhotos = (plot.images && plot.images.length > 0)
    ? plot.images
    : [
        plot.image || '/images/cardamom/cardamom_plantation_forest.jpg',
        '/images/cardamom/cardamom_panorama_360.jpg',
        '/images/cardamom/cardamom_drone_aerial.jpg',
        '/images/cardamom/cardamom_tillers_soil.jpg',
        '/images/cardamom/cardamom_hanging_pods.jpg',
        '/images/cardamom/cardamom_pods_pile.jpg'
      ];

  // Text-To-Speech Reader
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${plot.title}. Located at ${plot.location}. Total area ${plot.area}. Valuation price ${plot.price}. AI Legal verification score is ${plot.trustScore || '98%'}. Expected yield is ${plot.yield || '450 kilograms per acre'}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Generate & Download PDF Audit Report
  const handleDownloadPdf = () => {
    const ownerName = plot.ownerName || plot.owner || 'Verified Planter';
    const status = plot.verificationStatus || 'Pending';
    const capturedTime = plot.verificationCapturedAt || new Date().toLocaleString();
    const photoSrc = plot.verificationPhoto || plot.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300';
    const pattayamDocName = plot.pattayamFileName || 'Land_Ownership_Title_Pattayam.pdf';

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CARDORA Plot Verification Dossier - ${plot.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1B5E20; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            .header-banner { background: #1B5E20; color: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
            .header-banner h1 { margin: 0; font-size: 22px; color: #ffffff; }
            .header-banner p { margin: 4px 0 0 0; color: #A3E635; font-size: 13px; }
            .section { background: #F8FFF8; border: 1px solid #D7E6D5; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
            .section h2 { color: #1B5E20; font-size: 16px; margin-top: 0; border-bottom: 2px solid #66BB6A; padding-bottom: 8px; text-transform: uppercase; }
            .verify-grid { display: flex; gap: 20px; align-items: center; }
            .verify-photo { width: 140px; height: 140px; border-radius: 12px; object-cover: cover; border: 3px solid #1B5E20; }
            .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .table th, .table td { border: 1px solid #D7E6D5; padding: 10px; text-align: left; font-size: 13px; }
            .table th { background: #EAF5EA; color: #1B5E20; font-weight: bold; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; background: #1B5E20; color: #fff; }
            .status-pending { background: #D97706; }
            .status-verified { background: #15803D; }
            .status-rejected { background: #B91C1C; }
            .footer { text-align: center; font-size: 12px; color: #66BB6A; margin-top: 30px; border-top: 1px solid #D7E6D5; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1>CARDORA AGRICULTURAL PLOT VERIFICATION REPORT</h1>
            <p>Official Verification Dossier • Issued by Cardora Smart Agriculture Ecosystem</p>
          </div>

          <!-- OWNER VERIFICATION SECTION -->
          <div class="section">
            <h2>OWNER VERIFICATION</h2>
            <div class="verify-grid">
              <img src="${photoSrc}" class="verify-photo" alt="Live Captured Verification Photo" />
              <div>
                <p><strong>Owner Name:</strong> ${ownerName}</p>
                <p><strong>Verification Status:</strong> <span class="status-badge status-${status.toLowerCase()}">${status}</span></p>
                <p><strong>Verification Identity Photo:</strong> Live Camera Captured</p>
                <p><strong>Captured Date / Time:</strong> ${capturedTime}</p>
                <p><strong>Owner Email:</strong> ${plot.ownerEmail || 'planter@cardora.io'}</p>
              </div>
            </div>
          </div>

          <!-- PLOT DETAILS SECTION -->
          <div class="section">
            <h2>PLOT DETAILS</h2>
            <table class="table">
              <tr><th>Parameter</th><th>Specification</th></tr>
              <tr><td>Plot Title</td><td>${plot.title}</td></tr>
              <tr><td>Plot Ref ID</td><td>${plot.id || plot._id || 'CDR-1024'}</td></tr>
              <tr><td>Location</td><td>${plot.location}</td></tr>
              <tr><td>Total Area</td><td>${plot.area}</td></tr>
              <tr><td>Plant Count / Stock</td><td>${plot.plants || '2,500 Plants (Njallani Green Gold)'}</td></tr>
              <tr><td>Plantation Details</td><td>${plot.description || 'Prime Organic Cardamom Estate with Drip Irrigation'}</td></tr>
              <tr><td>Annual Yield Info</td><td>${plot.yield || '450 kg / acre'}</td></tr>
              <tr><td>Asking Valuation / Price</td><td><strong>${plot.price}</strong></td></tr>
            </table>
          </div>

          <!-- LEGAL DOCUMENTS SECTION -->
          <div class="section">
            <h2>LEGAL DOCUMENTS</h2>
            <table class="table">
              <tr><th>Document Name</th><th>Document Reference Type</th><th>Verification Status</th></tr>
              <tr>
                <td>${pattayamDocName}</td>
                <td>Official Kerala Govt Revenue Land Title (Pattayam)</td>
                <td><span class="status-badge status-verified">PATTAYAM ATTACHED</span></td>
              </tr>
              <tr>
                <td>Encumbrance Certificate (EC)</td>
                <td>15-Year Clean Search Record</td>
                <td><span class="status-badge status-verified">VERIFIED</span></td>
              </tr>
              <tr>
                <td>Revenue Mutation & Tax Receipts</td>
                <td>2026 Village Office Record</td>
                <td><span class="status-badge status-verified">VERIFIED</span></td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Report Generated on ${new Date().toLocaleString()} • Cardora AI Trust Engine Security Certified</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CARDORA_Plot_Verification_${(plot.title || 'Plot').replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-[#2E7D32]/40 max-h-[92vh] flex flex-col"
      >
        {/* Top Header Bar */}
        <div className="bg-[#1B5E20] text-white p-4 px-6 flex items-center justify-between flex-wrap gap-3 border-b border-[#66BB6A]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-[#66BB6A]" />
            </div>
            <div>
              <h2 className="text-lg font-black font-poppins text-white flex items-center gap-2">
                {plot.title}
                <span className="px-2.5 py-0.5 rounded-full bg-[#66BB6A] text-slate-950 text-[10px] font-black uppercase">
                  98.4% TRUST
                </span>
              </h2>
              <p className="text-xs text-emerald-200">{plot.location} • {plot.area}</p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20 border-white/20'
              }`}
              title="Voice Read Specification"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isSpeaking ? 'Reading...' : 'Listen'}</span>
            </button>

            {/* Language Switch Button */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-xl bg-white/10 text-emerald-100 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              className="p-2 rounded-xl bg-[#66BB6A] text-slate-950 hover:bg-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-md"
              title="Download AI Audit Report"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Report PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-all ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          
          {/* SECTION 1: MEDIA VIEWER (360 Virtual Tour / Drone Video / Gallery / Map) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#2E7D32]/20 pb-2">
              {[
                { id: '360', label: '360° Virtual Tour', icon: Eye },
                { id: 'drone', label: '4K Drone Video', icon: Video },
                { id: 'gallery', label: 'High-Res Photos', icon: FileText },
                { id: 'map', label: 'Satellite Boundary', icon: Map },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMediaTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      activeMediaTab === tab.id
                        ? 'bg-[#1B5E20] text-white shadow-md'
                        : 'bg-[#F8FFF8] dark:bg-slate-800 text-[#1B5E20] dark:text-emerald-400 hover:bg-[#66BB6A]/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#2E7D32]/30 shadow-2xl bg-slate-950 flex items-center justify-center">
              {/* 1. 360 PANORAMA VIEW */}
              {activeMediaTab === '360' && (
                <div className="relative w-full h-full group overflow-hidden">
                  <img
                    src="/images/cardamom/cardamom_panorama_360.jpg"
                    alt="Cardamom 360 Panorama View"
                    className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col justify-between p-4 sm:p-6 text-white select-none">
                    {/* Top HUD bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-xs font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>360° LIVE CANOPY PANORAMA</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[11px] font-bold">
                        📍 {plot.location || 'Kattappana, Idukki'} • Compass: N 42° E
                      </div>
                    </div>

                    {/* Center Interactive Hotspot Badge */}
                    <div className="relative flex-1 flex items-center justify-center">
                      <div className="text-center space-y-2 max-w-md bg-black/60 backdrop-blur-md p-4 rounded-3xl border border-emerald-400/40 shadow-2xl">
                        <span className="p-3.5 rounded-full bg-[#1B5E20]/90 backdrop-blur-md border-2 border-[#66BB6A] inline-flex items-center justify-center animate-bounce shadow-lg">
                          <Eye className="w-7 h-7 text-[#66BB6A]" />
                        </span>
                        <p className="text-sm font-black font-poppins text-white">Interactive 360° Cardamom Canopy Tour</p>
                        <p className="text-xs text-emerald-200">Drag to look around tiller clumps, shade canopy & soil pulse drip lines</p>
                      </div>

                      {/* Hotspot 1: Soil Drip */}
                      <div className="absolute top-1/4 left-10 hidden sm:flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md p-2 px-3 rounded-2xl border border-emerald-400/50 text-[10px] font-extrabold shadow-xl">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span>Micro-Drip Line • Moisture 82%</span>
                      </div>

                      {/* Hotspot 2: Cardamom Pods */}
                      <div className="absolute bottom-1/4 right-10 hidden sm:flex items-center gap-2 bg-amber-950/80 backdrop-blur-md p-2 px-3 rounded-2xl border border-amber-400/50 text-[10px] font-extrabold shadow-xl">
                        <Trees className="w-3.5 h-3.5 text-amber-400" />
                        <span>Njallani Clump • 48 capsules</span>
                      </div>
                    </div>

                    {/* Bottom Scrubber Indicator */}
                    <div className="flex items-center justify-between text-[11px] font-extrabold bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                      <span>↔ 360° Angle Rotation</span>
                      <span className="text-emerald-300 font-poppins">Tilt Elevation: +12° | Soil Depth: 40cm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 4K DRONE FLYOVER VIDEO */}
              {activeMediaTab === 'drone' && (
                <div className="relative w-full h-full group overflow-hidden">
                  <img
                    src="/images/cardamom/cardamom_drone_aerial.jpg"
                    alt="4K Cardamom Aerial Drone Shot"
                    className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col justify-between p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        4K HDR FLYOVER
                      </span>
                      <span className="text-xs font-mono font-bold bg-black/60 px-3 py-1 rounded-full border border-white/20">
                        ALT: 1,120m MSL | SPEED: 14 km/h
                      </span>
                    </div>

                    <div className="text-center space-y-3 my-auto">
                      <button
                        type="button"
                        onClick={() => {
                          window.open('/images/cardamom/cardamom_drone_aerial.jpg', '_blank');
                        }}
                        className="p-5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white backdrop-blur-md border-2 border-emerald-300 inline-flex items-center justify-center transition scale-110 shadow-2xl cursor-pointer hover:scale-125"
                      >
                        <Video className="w-8 h-8 text-white" />
                      </button>
                      <div>
                        <p className="text-base font-black font-poppins text-white">4K Ultra-HD Drone Flyover Video</p>
                        <p className="text-xs text-emerald-200">Aerial Survey of Estate Boundary & Silver Oak Canopy</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>REC 🔴 00:02:45 / 00:05:00</span>
                      <span>Resolution: 3840 x 2160 • Geo-Tagged</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. HIGH-RES PHOTOS GALLERY */}
              {activeMediaTab === 'gallery' && (
                <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                  <img
                    src={plotPhotos[activePhotoIdx] || '/images/cardamom/cardamom_plantation_forest.jpg'}
                    alt="Cardamom High-Res Photo"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-black border border-white/20">
                    Photo #{activePhotoIdx + 1} of {plotPhotos.length}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                    🌿 Authentic Cardamom Crop Foliage
                  </div>
                </div>
              )}

              {/* 4. SATELLITE BOUNDARY MAP */}
              {activeMediaTab === 'map' && (
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src="/images/cardamom/cardamom_drone_aerial.jpg"
                    alt="Satellite Geo-Fence Map"
                    className="w-full h-full object-cover filter contrast-125 saturate-150"
                  />
                  {/* Geo-Fenced Polygon Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon
                      points="20,25 75,20 85,75 30,85 15,50"
                      fill="rgba(5, 150, 105, 0.25)"
                      stroke="#34D399"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  </svg>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 p-4 sm:p-6 flex flex-col justify-between text-white select-none">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        NEON GEO-FENCE POLYGON ACTIVE
                      </span>
                      <span className="text-xs font-black bg-black/60 px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-300 font-mono">
                        99.4% AI Legal Trust Verified
                      </span>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 space-y-1 self-start max-w-xs">
                      <h4 className="text-xs font-black text-white font-poppins">Geo-Polygon Survey Reference</h4>
                      <p className="text-[11px] text-emerald-200">Survey No: 412/1-B • Kattappana Village</p>
                      <p className="text-[11px] text-emerald-300 font-bold">Total Acreage: {plot.area || '4.2 Acres'}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>LAT: 9.8512° N | LON: 77.0823° E</span>
                      <span>Elevation: 1,150m MSL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Gallery Thumbnails Strip (Up to 10 photos) */}
            {plotPhotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                {plotPhotos.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActivePhotoIdx(idx);
                      setActiveMediaTab('gallery');
                    }}
                    className={`relative w-16 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activePhotoIdx === idx && activeMediaTab === 'gallery'
                        ? 'border-[#66BB6A] ring-2 ring-[#66BB6A]/40 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/70 text-white text-[8px] font-black">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: DETAIL NAVIGATION TABS */}
          <div className="flex items-center gap-2 border-b border-[#2E7D32]/20 pb-3 overflow-x-auto">
            {[
              { id: 'overview', label: lang === 'ml' ? 'ആമുഖം' : 'Overview & Timeline' },
              { id: 'docs', label: lang === 'ml' ? 'രേഖാ പരിശോധന' : 'Legal Documents (OCR)' },
              { id: 'trust', label: lang === 'ml' ? 'എഐ ട്രസ്റ്റ് സ്കോർ' : 'AI Trust Engine (99.4%)' },
              { id: 'agriculture', label: lang === 'ml' ? 'കൃഷി വിശകലനം' : 'Agriculture AI Analytics' },
              { id: 'owner', label: lang === 'ml' ? 'ഉടമ പ്രൊഫൈൽ' : 'Owner & Direct Contact' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex-shrink-0 transition-all ${
                  activeDetailTab === tab.id
                    ? 'bg-[#1B5E20] text-white shadow-md'
                    : 'bg-[#F8FFF8] dark:bg-slate-800 text-[#1B5E20] dark:text-emerald-400 hover:bg-[#66BB6A]/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT 1: OVERVIEW & TIMELINE */}
          {activeDetailTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800/80 border border-[#2E7D32]/30">
                  <span className="text-[10px] uppercase font-black text-gray-500 block">Valuation Price</span>
                  <span className="text-2xl font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">{plot.price}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800/80 border border-[#2E7D32]/30">
                  <span className="text-[10px] uppercase font-black text-gray-500 block">Annual Cardamom Yield</span>
                  <span className="text-2xl font-black text-[#2E7D32] dark:text-emerald-300 font-poppins">{plot.yield || '450 kg/acre'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800/80 border border-[#2E7D32]/30">
                  <span className="text-[10px] uppercase font-black text-gray-500 block">Expected Annual ROI</span>
                  <span className="text-2xl font-black text-[#66BB6A] font-poppins">{plot.roi || '24% Net'}</span>
                </div>
              </div>

              {/* Plantation History Timeline */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/60 border border-[#2E7D32]/20 space-y-4">
                <h4 className="text-base font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">
                  Plantation History & Harvest Timeline
                </h4>
                <div className="space-y-4 relative border-l-2 border-[#66BB6A] pl-6 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#1B5E20] border-2 border-white" />
                    <h5 className="text-xs font-black text-[#1B5E20] dark:text-white">2021: Plantation Established</h5>
                    <p className="text-xs text-gray-600 dark:text-slate-300">Planted 3,200 High-Yield Njallani Green Gold Variety Cardamom plants.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#2E7D32] border-2 border-white" />
                    <h5 className="text-xs font-black text-[#1B5E20] dark:text-white">2024: Peak Commercial Harvest</h5>
                    <p className="text-xs text-gray-600 dark:text-slate-300">Achieved 4,200 kg total dry cardamom harvest with 8mm+ bold green pods.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#66BB6A] border-2 border-white" />
                    <h5 className="text-xs font-black text-[#1B5E20] dark:text-white">2026: AI Irrigation & Solar Drier Installed</h5>
                    <p className="text-xs text-gray-600 dark:text-slate-300">Upgraded with automated soil moisture sensors and 100% solar curing house.</p>
                  </div>
                </div>
              </div>

              {/* Owner Story */}
              <div className="p-6 rounded-3xl bg-[#F8FFF8] dark:bg-slate-800/80 border border-[#2E7D32]/30 space-y-2">
                <h4 className="text-sm font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">
                  Owner's Note & Reason for Sale
                </h4>
                <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed italic">
                  "I have personally cultivated this estate for 8 years using organic compost and pulse fertigation. Selling to relocate closer to family. All legal documents are 100% clean with clear title and zero encumbrances."
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: DOCUMENT VERIFICATION (AI OCR) */}
          {activeDetailTab === 'docs' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-[#66BB6A]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-[#1B5E20] dark:text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-black text-[#1B5E20] dark:text-white">AI OCR Legal Audit Result</h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">100% Document Authenticity • Zero Duplicate Titles Detected</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1B5E20] text-white font-black text-xs">
                  99.4% CONFIDENCE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Land Ownership Title (Pattayam)', status: 'VERIFIED', match: '100% Survey Match', icon: Award },
                  { title: 'Encumbrance Certificate (EC 15 Yrs)', status: 'CLEAN TITLE', match: 'Zero Encumbrances', icon: CheckCircle },
                  { title: 'Tax Receipt 2026', status: 'PAID & UP TO DATE', match: 'Revenue Mutation OK', icon: FileText },
                  { title: 'Geo-Tagged Soil & Water Lab Report', status: 'PASSED (pH 6.2)', match: 'High Organic Carbon', icon: Droplets },
                ].map((doc, idx) => {
                  const Icon = doc.icon;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#2E7D32]/20 shadow-sm flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-[#F8FFF8] dark:bg-slate-700 text-[#1B5E20] dark:text-emerald-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-[#1B5E20] dark:text-white">{doc.title}</h5>
                          <span className="text-[10px] font-black text-[#66BB6A] bg-[#1B5E20] px-2 py-0.5 rounded-full">
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-300 mt-1">{doc.match}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: AI TRUST ENGINE */}
          {activeDetailTab === 'trust' && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#123C15] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 rounded-full border-4 border-[#66BB6A] flex items-center justify-center bg-black/30 backdrop-blur-md shadow-inner">
                    <span className="text-3xl font-black font-poppins text-emerald-300">98.4%</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-poppins text-white">CARDORA AI TRUST ENGINE</h3>
                    <p className="text-xs text-emerald-200 mt-1">Multi-factor validation across Land Registry, Satellite GIS, and Farmer Reputation.</p>
                  </div>
                </div>

                <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                  <span className="text-xs font-bold text-emerald-200 block uppercase">AI Recommendation</span>
                  <span className="text-base font-black text-[#66BB6A]">STRONGLY RECOMMENDED TO BUY</span>
                </div>
              </div>

              {/* AI INVESTMENT RISK EVALUATOR WIDGET */}
              <InvestmentRiskEvaluator listingData={plot} />
            </div>
          )}

          {/* TAB CONTENT 4: AGRICULTURE AI ANALYTICS */}
          {activeDetailTab === 'agriculture' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 space-y-1">
                <span className="text-[10px] uppercase font-black text-gray-500">Soil Fertility Index</span>
                <p className="text-xl font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">88 / 100</p>
                <p className="text-[10px] text-[#2E7D32]">Optimal Nitrogen & Organic Matter</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 space-y-1">
                <span className="text-[10px] uppercase font-black text-gray-500">Water Availability</span>
                <p className="text-xl font-black text-[#2E7D32] dark:text-emerald-300 font-poppins">Perennial Stream</p>
                <p className="text-[10px] text-gray-500">30 HP Drip Pump Installed</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 space-y-1">
                <span className="text-[10px] uppercase font-black text-gray-500">Disease Risk Index</span>
                <p className="text-xl font-black text-[#66BB6A] font-poppins">Low Risk (8%)</p>
                <p className="text-[10px] text-emerald-600">Zero Stem Borer Infestation</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 space-y-1">
                <span className="text-[10px] uppercase font-black text-gray-500">Carbon Credit Score</span>
                <p className="text-xl font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">14.2 Tons/Yr</p>
                <p className="text-[10px] text-[#2E7D32]">High Density Shade Canopy</p>
              </div>
            </div>
          )}

          {/* TAB CONTENT 5: OWNER & DIRECT CONTACT */}
          {activeDetailTab === 'owner' && (
            <div className="p-6 rounded-3xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={plot.ownerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(plot.owner || 'Owner')}&background=1B5E20&color=ffffff`}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border-4 border-[#1B5E20]"
                />
                <div>
                  <h4 className="text-lg font-black text-[#1B5E20] dark:text-white font-poppins">{plot.owner || 'Verified Planter'}</h4>
                  <p className="text-xs text-[#2E7D32] dark:text-emerald-400 font-bold">12 Years Cardamom Planter • Idukki District</p>
                  <span className="text-[10px] font-black text-[#66BB6A] bg-[#1B5E20] px-2 py-0.5 rounded-full inline-block mt-1">
                    IDENTITY & PATTAYAM VERIFIED
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onOpenChat(plot)}
                  className="px-5 py-3 rounded-2xl bg-[#1B5E20] text-white font-black text-xs hover:bg-[#2E7D32] transition-all flex items-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Real-time Chat</span>
                </button>

                <button
                  onClick={() => onScheduleVisit(plot)}
                  className="px-5 py-3 rounded-2xl bg-[#66BB6A] text-slate-950 font-black text-xs hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Site Visit</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Action Strip */}
        <div className="bg-[#F8FFF8] dark:bg-slate-800 p-4 px-6 border-t border-[#2E7D32]/20 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-black text-gray-500 block">Total Listing Price</span>
            <span className="text-xl font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">{plot.price}</span>
          </div>

          <div className="flex items-center gap-3">
            {onEditPlot && (
              <button
                onClick={() => {
                  onClose();
                  onEditPlot(plot);
                }}
                className="px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-md flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Listing</span>
              </button>
            )}

            <button
              onClick={() => onOpenChat(plot)}
              className="px-6 py-3 rounded-2xl bg-[#1B5E20] text-white font-black text-xs hover:bg-[#2E7D32] transition-all shadow-xl flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Owner Now</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LuxuryDetailModal;
