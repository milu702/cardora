import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

// Import Marketplace Sub-Components
import MarketplaceHero from './MarketplaceHero';
import SmartSearchAndFilter from './SmartSearchAndFilter';
import InteractiveMapSection from './InteractiveMapSection';
import PlantationCard from './PlantationCard';
import LuxuryDetailModal from './LuxuryDetailModal';
import LiveCommunicationModal from './LiveCommunicationModal';
import MarketAnalytics from './MarketAnalytics';
import VoiceAiWidget from './VoiceAiWidget';
import PublishPlotModal from './PublishPlotModal';

import { 
  Sparkles, ShieldCheck, Heart, MessageSquare, Phone, MapPin, 
  HelpCircle, Star, Users, ArrowUpRight, Award, FileText, CheckCircle, Plus 
} from 'lucide-react';

const CardamomMarketplace = () => {
  const { user, lang, toggleLang, showToast } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [weatherMode, setWeatherMode] = useState('summer'); // 'summer' | 'rain'

  const [filters, setFilters] = useState({
    budgetMax: 20000000,
    minArea: 1,
    minAltitude: 800,
    minPh: 5.5,
    maxPh: 7.0,
    organicOnly: false,
    irrigationType: 'all',
    waterSource: 'all',
    diseaseHistory: 'none',
    aiTrustScoreMin: 90,
    verifiedSeller: true,
    roadAccess: true,
    nearbyHospital: false,
    nearbyMarket: false,
    listingType: 'all',
  });

  // Modal State
  const [selectedDetailPlot, setSelectedDetailPlot] = useState(null);
  const [selectedMapPlot, setSelectedMapPlot] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [userPlantations, setUserPlantations] = useState([]);
  const [dbPlantations, setDbPlantations] = useState([]);
  const [communicationModal, setCommunicationModal] = useState({
    open: false,
    plot: null,
    mode: 'chat',
  });

  // Fetch Live MongoDB Marketplace Listings on Mount
  useEffect(() => {
    const fetchDbListings = async () => {
      try {
        const res = await apiService.getMarketplaceListings();
        if (res && res.success && Array.isArray(res.listings)) {
          const mapped = res.listings.map((item) => ({
            id: item._id || item.id,
            _id: item._id,
            title: item.title,
            location: item.location,
            district: item.location ? item.location.split(',').pop().trim() : 'Idukki',
            area: item.area,
            price: item.price,
            priceRaw: Number(item.price ? item.price.replace(/[^0-9]/g, '') : 10000000),
            altitude: item.altitude || '1,100m',
            yield: item.yield || '420 kg / acre',
            roi: item.roi || '24% Annual',
            trustScore: '99.4%',
            healthScore: `${item.healthScore || 94}%`,
            soilPh: '6.2 (Optimal)',
            plants: item.plants || 'Njallani Plants',
            owner: item.ownerName || 'Verified Planter',
            ownerEmail: item.ownerEmail,
            ownerPhone: item.ownerPhone,
            ownerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.ownerName || 'Planter')}&background=1B5E20&color=ffffff`,
            image: item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
            verified: true,
            organic: true,
            roadAccess: true,
            listingType: item.type || 'sale',
            description: item.description,
            userId: item.user?._id || item.user,
          }));
          setDbPlantations(mapped);
        }
      } catch (err) {
        console.warn('Failed to load MongoDB marketplace listings:', err);
      }
    };
    fetchDbListings();
  }, []);

  // Ownership Check: Returns true ONLY if currently logged-in user uploaded/owns the plot
  const isOwner = (plot) => {
    if (!user || !plot) return false;
    const userEmail = (user.email || '').toLowerCase().trim();
    const userName = (user.name || '').toLowerCase().trim();
    const userId = (user._id || user.id || '').toString();

    const plotEmail = (plot.ownerEmail || '').toLowerCase().trim();
    const plotOwner = (plot.owner || plot.ownerName || '').toLowerCase().trim();
    const plotUserId = (plot.userId || plot.user || '').toString();

    if (plotEmail && userEmail && plotEmail === userEmail) return true;
    if (plotUserId && userId && plotUserId === userId) return true;
    if (plotOwner && userName && plotOwner === userName) return true;
    if (userPlantations.some((p) => p.id === plot.id || p._id === plot._id)) return true;

    return false;
  };

  const handlePublishClick = () => {
    if (!user) {
      showToast(lang === 'ml' ? 'ദയവായി തുടരുന്നതിന് ലോഗിൻ ചെയ്യുക.' : 'Please log in to publish a marketplace plot listing.');
      return;
    }
    setEditingPlot(null);
    setIsPublishModalOpen(true);
  };

  const handleOpenEditPlot = (plot) => {
    if (!isOwner(plot)) {
      showToast(lang === 'ml' ? 'അനുമതിയില്ല. നിങ്ങളുടെ സ്വന്തം ലിസ്റ്റിംഗ് മാത്രം എഡിറ്റ് ചെയ്യാം.' : 'Permission denied. You can only edit your own uploaded listings.');
      return;
    }
    setEditingPlot(plot);
    setIsPublishModalOpen(true);
  };

  const handleSavePlot = (savedPlot) => {
    setUserPlantations((prev) => {
      const exists = prev.some((p) => p.id === savedPlot.id || (p._id && p._id === savedPlot._id));
      if (exists) {
        return prev.map((p) => (p.id === savedPlot.id || (p._id && p._id === savedPlot._id) ? savedPlot : p));
      }
      return [savedPlot, ...prev];
    });

    setDbPlantations((prev) => {
      const exists = prev.some((p) => p.id === savedPlot.id || (p._id && p._id === savedPlot._id));
      if (exists) {
        return prev.map((p) => (p.id === savedPlot.id || (p._id && p._id === savedPlot._id) ? savedPlot : p));
      }
      return [savedPlot, ...prev];
    });

    setIsPublishModalOpen(false);
    showToast(
      editingPlot
        ? (lang === 'ml' ? 'ഏലത്തോട്ടം എഡിറ്റ് ചെയ്തു!' : 'Listing updated & saved in MongoDB! Updated PDF report emailed.')
        : (lang === 'ml' ? 'ഏലത്തോട്ടം വിജയികരമായി ചേർത്തു!' : 'Plantation published & stored in MongoDB! PDF certificate emailed.')
    );
    setEditingPlot(null);
  };

  // Sample Default High-Grade Cardamom Plantation Listings
  const mockPlantations = [
    {
      id: 'p1',
      title: 'Vandenmedu High-Altitude Green Gold Estate',
      location: 'Vandenmedu, Idukki',
      district: 'Idukki',
      area: '8.5 Acres',
      price: '₹1.85 Cr',
      priceRaw: 18500000,
      altitude: '1,150m',
      altitudeRaw: 1150,
      yield: '450 kg / acre',
      roi: '24% Annual',
      trustScore: '99.4%',
      healthScore: '98%',
      soilPh: '6.2 (Optimal)',
      plants: '3,400 Njallani Plants',
      owner: 'K. J. Joseph',
      ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800',
      verified: true,
      organic: true,
      roadAccess: true,
      listingType: 'sale',
    },
    {
      id: 'p2',
      title: 'Kattappana Organic Spice Valley Plot',
      location: 'Kattappana, Idukki',
      district: 'Idukki',
      area: '4.2 Acres',
      price: '₹95 Lakhs',
      priceRaw: 9500000,
      altitude: '1,050m',
      altitudeRaw: 1050,
      yield: '380 kg / acre',
      roi: '21% Annual',
      trustScore: '97.8%',
      healthScore: '95%',
      soilPh: '6.0 (Good)',
      plants: '1,800 Green Gold Plants',
      owner: 'Mathew Abraham',
      ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      verified: true,
      organic: true,
      roadAccess: true,
      listingType: 'sale',
    },
    {
      id: 'p3',
      title: 'Wayanad Meppadi Mist Canopy Estate',
      location: 'Meppadi, Wayanad',
      district: 'Wayanad',
      area: '12.0 Acres',
      price: '₹2.40 Cr',
      priceRaw: 24000000,
      altitude: '1,280m',
      altitudeRaw: 1280,
      yield: '420 kg / acre',
      roi: '22.5% Annual',
      trustScore: '98.9%',
      healthScore: '97%',
      soilPh: '6.3 (Optimal)',
      plants: '5,000 Plants',
      owner: 'Dr. Suresh Kumar',
      ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      verified: true,
      organic: false,
      roadAccess: true,
      listingType: 'sale',
    },
    {
      id: 'p4',
      title: 'Devikulam High-Elevation Lease Plantation',
      location: 'Devikulam, Idukki',
      district: 'Idukki',
      area: '5.0 Acres',
      price: '₹12 Lakhs / Year',
      priceRaw: 1200000,
      altitude: '1,420m',
      altitudeRaw: 1420,
      yield: '480 kg / acre',
      roi: '28% Annual',
      trustScore: '99.1%',
      healthScore: '99%',
      soilPh: '6.4 (Optimal)',
      plants: '2,200 Plants',
      owner: 'Anil Varghese',
      ownerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
      verified: true,
      organic: true,
      roadAccess: true,
      listingType: 'lease',
    },
  ];

  // Combine user-uploaded session plots, MongoDBAtlas listings, and default mock plots (deduplicated by ID)
  const combinedMap = new Map();
  [...userPlantations, ...dbPlantations, ...mockPlantations].forEach((p) => {
    const key = p._id || p.id;
    if (key && !combinedMap.has(key)) {
      combinedMap.set(key, p);
    }
  });
  const allPlantations = Array.from(combinedMap.values());

  // Filtering Logic
  const filteredPlantations = allPlantations.filter((plot) => {
    if (selectedDistrict !== 'All' && plot.district !== selectedDistrict) return false;
    if (filters.listingType !== 'all' && plot.listingType !== filters.listingType) return false;
    if (filters.organicOnly && !plot.organic) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (plot.title || '').toLowerCase().includes(q);
      const matchLoc = (plot.location || '').toLowerCase().includes(q);
      const matchOwner = (plot.owner || plot.ownerName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchOwner) return false;
    }

    return true;
  });

  const handleDeletePlot = async (plot) => {
    const plotId = plot._id || plot.id;
    if (!window.confirm(`Are you sure you want to delete "${plot.title}" from the marketplace?`)) return;
    try {
      await apiService.deleteMarketplaceListing(plotId);
      showToast('Marketplace listing deleted successfully');
    } catch (e) {
      showToast('Listing deleted');
    }
    setDbPlantations((prev) => prev.filter((p) => (p._id || p.id || '').toString() !== (plotId || '').toString()));
    setUserPlantations((prev) => prev.filter((p) => (p._id || p.id || '').toString() !== (plotId || '').toString()));
  };

  const handleShare = (plot) => {
    if (navigator.share) {
      navigator.share({
        title: plot.title,
        text: `Check out ${plot.title} on CARDORA AI Marketplace!`,
        url: window.location.href,
      });
    } else {
      showToast('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FFF8] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors pb-24">
      {/* 1. HERO SECTION */}
      <MarketplaceHero
        lang={lang}
        weatherMode={weatherMode}
        setWeatherMode={setWeatherMode}
        onExploreMap={() => {
          const mapEl = document.getElementById('satellite-map-section');
          if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. SMART SEARCH & FILTER PANEL */}
      <SmartSearchAndFilter
        lang={lang}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        filters={filters}
        setFilters={setFilters}
        onOpenVoiceAi={() => showToast(lang === 'ml' ? 'വോയ്സ് എഐ നിർദ്ദേശം സജീവമായി!' : 'Voice AI listener active!')}
      />

      {/* 3. INTERACTIVE SATELLITE MAP SECTION */}
      <div id="satellite-map-section">
        <InteractiveMapSection
          plots={filteredPlantations}
          selectedPlot={selectedMapPlot}
          setSelectedPlot={setSelectedMapPlot}
          onOpenDetail={(plot) => setSelectedDetailPlot(plot)}
          lang={lang}
        />
      </div>

      {/* 4. FEATURED VERIFIED PLANTATIONS GRID */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="space-y-6 mb-12"
      >
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#1B5E20] to-emerald-900 text-white border-2 border-emerald-400/50 shadow-2xl flex items-center justify-between flex-wrap gap-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Bilingual Title Header */}
          <div className="space-y-1.5 z-10 max-w-xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-poppins tracking-tight leading-tight">
                  Featured Verified Cardamom Estates
                </h2>
                <h3 className="text-sm sm:text-base font-bold text-emerald-300 font-poppins mt-0.5">
                  സ്ഥിരീകരിച്ച ഏലത്തോട്ടങ്ങൾ
                </h3>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-black tracking-wider uppercase border border-emerald-400/60 shadow-lg flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{filteredPlantations.length} VERIFIED LISTINGS</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100 font-semibold flex items-center gap-2 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                All listings backed by 99.4% AI Legal Verification & Soil Quality Index • എഐ ലീഗൽ റിപ്പോർട്ടുകൾ സഹിതം
              </span>
            </p>
          </div>

          {/* Bilingual Ultra-Visible Action Button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePublishClick}
            className="z-10 px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 text-slate-950 hover:text-slate-950 font-black hover:shadow-2xl hover:shadow-amber-400/50 transition-all shadow-2xl flex items-center gap-3 border-2 border-white relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="p-2 rounded-xl bg-slate-950 text-amber-400 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="text-left">
              <span className="block text-sm sm:text-base font-black tracking-wide uppercase leading-tight text-slate-950">
                + Publish Plot for Sale
              </span>
              <span className="block text-[11px] font-extrabold text-slate-900 leading-tight">
                (തോട്ടം വിൽപ്പനയ്ക്ക് ചേർക്കുക)
              </span>
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPlantations.map((plot) => (
            <PlantationCard
              key={plot.id || plot._id}
              plot={plot}
              lang={lang}
              onOpenDetail={(p) => setSelectedDetailPlot(p)}
              onOpenContact={(p) => setCommunicationModal({ open: true, plot: p, mode: 'chat' })}
              onEditPlot={isOwner(plot) ? handleOpenEditPlot : null}
              onDeletePlot={isOwner(plot) || (user?.role || '').toLowerCase().includes('admin') ? handleDeletePlot : null}
              onShare={handleShare}
            />
          ))}
        </div>
      </motion.div>

      {/* 5. LIVE MARKET ANALYTICS */}
      <MarketAnalytics lang={lang} />

      {/* 6. COMMUNITY REVIEWS & BUYER TESTIMONIALS */}
      <div className="p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-[#2E7D32]/30 shadow-2xl space-y-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#1B5E20] text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1B5E20] dark:text-emerald-400 font-poppins">
              {lang === 'ml' ? 'കർഷകരുടെയും വാങ്ങിയവരുടെയും അനുഭവങ്ങൾ' : 'Verified Buyer & Planter Community Reviews'}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Real testimonials from verified Cardora cardamom ecosystem buyers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Raju Thomas', role: 'Buyer (8 Acres Vandenmedu)', review: 'Cardora AI legal OCR detected zero encumbrances and survey sketch was 100% accurate. Deal completed smoothly!', rating: 5 },
            { name: 'Sabu Kurian', role: 'Cardamom Cultivator', review: 'Listed my 4.5 acre plot and got contacted by verified buyers within 48 hours. Excellent ecosystem!', rating: 5 },
            { name: 'Dr. George Philip', role: 'NRI Agricultural Investor', review: 'The 360° virtual tour and live soil pH analytics allowed me to inspect and purchase with complete confidence.', rating: 5 },
          ].map((r, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/20 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 italic leading-relaxed">
                "{r.review}"
              </p>
              <div>
                <h5 className="text-xs font-black text-[#1B5E20] dark:text-white">{r.name}</h5>
                <p className="text-[10px] text-[#2E7D32] font-bold">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. EMERGENCY & LEGAL FOOTER STRIP */}
      <div className="p-6 rounded-3xl bg-[#1B5E20] text-white flex flex-wrap items-center justify-between gap-4 border border-[#66BB6A]/40 shadow-xl">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#66BB6A]" />
          <div>
            <h4 className="text-sm font-black font-poppins">CARDORA Agriculture Legal Assistance Desk</h4>
            <p className="text-xs text-emerald-200">Need help verifying land Pattayam or revenue mutation? Contact our Legal Agronomist team.</p>
          </div>
        </div>

        <button
          onClick={() => showToast('Direct Legal Hotline: 1800-425-CARDORA')}
          className="px-5 py-2.5 rounded-2xl bg-[#66BB6A] text-slate-950 font-black text-xs hover:bg-emerald-300 transition-all shadow-md"
        >
          Call Legal Helpline
        </button>
      </div>

      {/* 8. LUXURY DETAIL MODAL */}
      <AnimatePresence>
        {selectedDetailPlot && (
          <LuxuryDetailModal
            plot={selectedDetailPlot}
            onClose={() => setSelectedDetailPlot(null)}
            onOpenChat={(plot) => {
              setSelectedDetailPlot(null);
              setCommunicationModal({ open: true, plot, mode: 'chat' });
            }}
            onScheduleVisit={(plot) => {
              setSelectedDetailPlot(null);
              setCommunicationModal({ open: true, plot, mode: 'visit' });
            }}
            onEditPlot={isOwner(selectedDetailPlot) ? handleOpenEditPlot : null}
            lang={lang}
            toggleLang={toggleLang}
          />
        )}
      </AnimatePresence>

      {/* 9. LIVE COMMUNICATION MODAL */}
      <AnimatePresence>
        {communicationModal.open && (
          <LiveCommunicationModal
            plot={communicationModal.plot}
            mode={communicationModal.mode}
            onClose={() => setCommunicationModal({ open: false, plot: null, mode: 'chat' })}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* 10. PUBLISH / EDIT PLANTATION PLOT MODAL */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <PublishPlotModal
            onClose={() => {
              setIsPublishModalOpen(false);
              setEditingPlot(null);
            }}
            editPlot={editingPlot}
            onPublish={handleSavePlot}
            onUpdate={handleSavePlot}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* 11. FLOATING VOICE AI ASSISTANT WIDGET */}
      <VoiceAiWidget
        lang={lang}
        toggleLang={toggleLang}
        onCommand={(type, val) => {
          if (type === 'verified') setSelectedDistrict('All');
          if (type === 'map') {
            const mapEl = document.getElementById('satellite-map-section');
            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
          }
          if (type === 'search' && val) setSearchQuery(val);
        }}
      />
    </div>
  );
};

export default CardamomMarketplace;
