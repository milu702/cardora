import React, { useState, useEffect } from 'react';
import { Gavel, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

const MyAuctionsTab = ({ onSelectAuction, onCreateClick, onToast }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAuctions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get('/api/auctions/my-auctions', config);

      if (data.success) {
        setAuctions(data.auctions || []);
      }
    } catch (error) {
      console.error('Error fetching my auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white">🔴 LIVE</span>;
      case 'ENDING_SOON':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white">⏰ ENDING SOON</span>;
      case 'SCHEDULED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">🟢 SCHEDULED</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-yellow-500 text-white">⏳ PENDING APPROVAL</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-700 text-white">✓ COMPLETED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-800">DRAFT</span>;
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw size={36} className="mx-auto animate-spin text-[#1F5E3B]" />
        <h4 className="text-base font-black text-[#17331F] dark:text-white">Loading your plantation auctions...</h4>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER & CREATE CTA */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-[#17331F] dark:text-white font-poppins">
            My Plantation Auctions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your listed cardamom estate auctions, monitor bids in real-time, and view sales reports.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus size={18} />
          <span>Create New Auction</span>
        </button>
      </div>

      {/* AUCTIONS TABLE / GRID */}
      {auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auc) => (
            <div
              key={auc._id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(auc.status)}
                  <span className="text-xs font-bold text-gray-400">
                    {new Date(auc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#17331F] dark:text-white line-clamp-1">
                  {auc.title}
                </h3>

                <div className="p-3 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Current Bid:</span>
                    <strong className="text-emerald-700 font-black text-sm">₹{auc.currentBid?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Starting Price:</span>
                    <strong className="text-slate-800 dark:text-slate-200">₹{auc.startingPrice?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Total Bids:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{auc.totalBidsCount || 0} bids ({auc.biddersCount || 0} bidders)</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectAuction(auc)}
                className="w-full py-3 rounded-2xl bg-[#EAF3E8] hover:bg-[#1F5E3B] hover:text-white text-[#1F5E3B] dark:bg-slate-800 dark:text-emerald-400 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>View Live Auction</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-8 shadow-md">
          <Gavel size={44} className="mx-auto text-[#1F5E3B]" />
          <h3 className="text-xl font-black text-[#17331F] dark:text-white">No Auctions Created Yet</h3>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            You haven't created any live plantation auctions. Click below to start your first auction!
          </p>
          <button
            onClick={onCreateClick}
            className="px-6 py-3 rounded-2xl bg-[#1F5E3B] text-white font-black text-sm shadow-md"
          >
            Create Your First Auction
          </button>
        </div>
      )}

    </div>
  );
};

export default MyAuctionsTab;
