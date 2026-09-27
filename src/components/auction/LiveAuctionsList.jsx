import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCw, Gavel, Sparkles } from 'lucide-react';
import LiveAuctionCard from './LiveAuctionCard';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LiveAuctionsList = ({ onSelectAuction, onCreateClick, onMyAuctionsClick, user, onToast }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Filters & Tabs
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [statusTab, setStatusTab] = useState('live');
  const [sortBy, setSortBy] = useState('endingSoon');
  const [maxPrice] = useState(150000);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cardora_token') || localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const params = new URLSearchParams({
        statusTab,
        sortBy,
        maxPrice,
      });

      if (search) params.append('search', search);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (selectedType !== 'all') params.append('plantationType', selectedType);

      const { data } = await axios.get(`${API_BASE}/auctions?${params.toString()}`, config);

      if (data.success) {
        setAuctions(data.auctions || []);
      }
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusTab, sortBy, selectedLocation, selectedType, maxPrice, search]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  // Seed sample auctions for instant working demonstration
  const handleSeedAuctions = async () => {
    if (!user) {
      if (onToast) onToast('Please log in first to seed sample live auctions.', 'error');
      return;
    }

    try {
      setSeeding(true);
      const token = localStorage.getItem('cardora_token') || localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.post(`${API_BASE}/auctions/seed`, {}, config);

      if (data.success) {
        if (onToast) onToast(data.message || 'Live sample auctions seeded!', 'success');
        fetchAuctions();
      }
    } catch (error) {
      console.error('Error seeding auctions:', error);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">

      {/* MODULE HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#17331F] via-[#1F5E3B] to-[#2E7D4E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-poppins flex items-center gap-2">
              <Gavel size={28} className="text-emerald-300" />
              Live Cardora Plantation Auctions
            </h1>
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center gap-1.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              Real-Time Bidding Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
            Discover verified cardamom plantation listings, view AI price insights, and participate in real-time competitive bidding.
          </p>
        </div>

        {/* Header CTAs */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <button
            onClick={handleSeedAuctions}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs border border-white/30 backdrop-blur-md transition-all cursor-pointer"
            title="Seed sample auctions for demonstration"
          >
            <Sparkles size={16} />
            <span>{seeding ? 'Seeding...' : '⚡ Load Demo Auctions'}</span>
          </button>

          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#17331F] font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus size={18} />
            <span>Create Auction</span>
          </button>
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-5 shadow-md space-y-4">

        {/* Status Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            {[
              { id: 'live', label: '🔴 Live Now' },
              { id: 'starting_soon', label: '🟢 Starting Soon' },
              { id: 'ending_soon', label: '⏰ Ending Soon' },
              { id: 'completed', label: '✓ Completed' },
              { id: 'all', label: 'All Listings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer font-extrabold shrink-0 ${statusTab === tab.id
                  ? 'bg-[#1F5E3B] text-white shadow-md'
                  : 'bg-[#F8FAF7] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#DDEFD9]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onMyAuctionsClick}
            className="px-4 py-2.5 rounded-2xl bg-[#DDEFD9] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 font-black text-xs sm:text-sm hover:bg-[#1F5E3B] hover:text-white transition-all shrink-0 cursor-pointer"
          >
            My Auctions →
          </button>
        </div>

        {/* Search & Secondary Filters Grid */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          {/* Search Bar */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by title, district (Idukki, Wayanad)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Location Dropdown */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-extrabold text-[#17331F] dark:text-white focus:outline-none"
            >
              <option value="all">📍 All Locations</option>
              <option value="Idukki">Idukki</option>
              <option value="Wayanad">Wayanad</option>
              <option value="Kattappana">Kattappana</option>
              <option value="Devikulam">Devikulam</option>
            </select>
          </div>

          {/* Plantation Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-extrabold text-[#17331F] dark:text-white focus:outline-none"
            >
              <option value="all">🌿 All Varieties</option>
              <option value="Njallani">Njallani Green Gold</option>
              <option value="Vazhukka">Vazhukka Special</option>
              <option value="Hybrid">Green Gold Hybrid</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-extrabold text-[#17331F] dark:text-white focus:outline-none"
            >
              <option value="endingSoon">⏱ Ending Soon</option>
              <option value="highestBid">💰 Highest Current Bid</option>
              <option value="lowestBid">🏷 Lowest Starting Bid</option>
              <option value="newest">✨ Newest Auctions</option>
            </select>
          </div>

        </form>

      </div>

      {/* AUCTION CARDS GRID */}
      {loading ? (
        <div className="py-20 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-8 shadow-md">
          <RefreshCw size={40} className="mx-auto animate-spin text-[#1F5E3B]" />
          <h3 className="text-lg font-black text-[#17331F] dark:text-white">Fetching Live Plantation Auctions...</h3>
        </div>
      ) : auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auc) => (
            <LiveAuctionCard
              key={auc._id}
              auction={auc}
              onSelect={onSelectAuction}
            />
          ))}
        </div>
      ) : (
        /* EMPTY STATE WITH CARDAMOM PLANTATION BACKGROUND */
        <div className="relative overflow-hidden py-20 text-center space-y-4 bg-slate-900 text-white rounded-3xl border border-emerald-500/30 p-10 shadow-2xl group">
          {/* Cardamom Plantation Image Backdrop */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/cardamom/cardamom_plantation_forest.jpg" 
              alt="Cardamom Plantation Background" 
              className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06150D]/90 via-[#0B2117]/80 to-[#17331F]/90 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto text-[#C9A227] shadow-lg">
              <Gavel size={36} />
            </div>

            <h3 className="text-2xl font-black text-white font-poppins tracking-wide">No Live Auctions Available</h3>

            <p className="text-sm text-emerald-100/90 font-medium max-w-md mx-auto leading-relaxed">
              New cardamom plantation auctions will appear here when approved by Admin.
            </p>

            <div className="text-xs text-amber-200 font-extrabold bg-amber-950/70 py-2.5 px-4 rounded-xl max-w-md mx-auto border border-amber-500/40 backdrop-blur-md shadow-md">
              ⏳ Submitted listings pending Admin approval can be tracked under <strong>"My Auctions"</strong> (top right button).
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-3">
              <button
                onClick={handleSeedAuctions}
                className="px-6 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500 text-white font-black text-sm border border-emerald-400/40 hover:border-emerald-400 transition-all duration-300 shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>⚡ Load Demo Auctions</span>
              </button>

              <button
                onClick={onCreateClick}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#1F5E3B] to-[#2E7D4E] hover:from-[#2E7D4E] hover:to-[#1F5E3B] text-white font-black text-sm shadow-xl border border-emerald-400/30 transition-all duration-300 cursor-pointer"
              >
                List Your Plantation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveAuctionsList;
