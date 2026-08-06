import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

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
  const [userPlantations, setUserPlantations] = useState([]);
  const [communicationModal, setCommunicationModal] = useState({
    open: false,
    plot: null,
    mode: 'chat',
  });

  // Sample High-Grade Cardamom Plantation Listings
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

  const allPlantations = [...userPlantations, ...mockPlantations];

  // Filtering Logic
  const filteredPlantations = allPlantations.filter((plot) => {
    // District Filter
    if (selectedDistrict !== 'All' && plot.district !== selectedDistrict) return false;

    // Listing Category (Sale / Lease)
    if (filters.listingType !== 'all' && plot.listingType !== filters.listingType) return false;

    // Organic Filter
    if (filters.organicOnly && !plot.organic) return false;

    // Search Query Text Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = plot.title.toLowerCase().includes(q);
      const matchLoc = plot.location.toLowerCase().includes(q);
      const matchOwner = plot.owner.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchOwner) return false;
    }

    return true;
  });

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
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#1B5E20] dark:text-emerald-400 font-poppins flex items-center gap-2">
              {lang === 'ml' ? 'സ്ഥിരീകരിച്ച ഏലത്തോട്ടങ്ങൾ' : 'Featured Verified Cardamom Estates'}
              <span className="px-2.5 py-0.5 rounded-full bg-[#1B5E20] text-[#66BB6A] text-xs font-black">
                {filteredPlantations.length} LISTINGS
              </span>
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {lang === 'ml' ? 'എഐ ലീഗൽ റിപ്പോർട്ടുകളും 360° ഡ്രോൺ വിഷ്വലുകളും സഹിതം' : 'All listings backed by 99.4% AI Legal Verification & Soil Quality Index'}
            </p>
          </div>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 border border-[#66BB6A]/40"
          >
            <Plus className="w-4 h-4 text-[#66BB6A]" />
            <span>{lang === 'ml' ? 'തോട്ടം വിൽപ്പനയ്ക്ക് ചേർക്കുക' : '+ Publish Plot for Sale'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPlantations.map((plot) => (
            <PlantationCard
              key={plot.id}
              plot={plot}
              lang={lang}
              onOpenDetail={(p) => setSelectedDetailPlot(p)}
              onOpenContact={(p) => setCommunicationModal({ open: true, plot: p, mode: 'chat' })}
              onShare={handleShare}
            />
          ))}
        </div>
      </div>

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

      {/* 10. PUBLISH PLANTATION PLOT MODAL */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <PublishPlotModal
            onClose={() => setIsPublishModalOpen(false)}
            onPublish={(newPlot) => {
              setUserPlantations((prev) => [newPlot, ...prev]);
              setIsPublishModalOpen(false);
              showToast(lang === 'ml' ? 'ഏലത്തോട്ടം വിജയികരമായി ചേർത്തു!' : 'Plantation published to ecosystem!');
            }}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* 10. FLOATING VOICE AI ASSISTANT WIDGET */}
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
