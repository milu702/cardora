import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, ShieldCheck, Users, ArrowLeft, Gavel, CheckCircle2,
  AlertTriangle, Sparkles, RefreshCw, FileText
} from 'lucide-react';
import { getSocket } from '../../utils/socket';
import axios from 'axios';

const AuctionDetailView = ({ auctionId, onBack, user, onToast }) => {
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Bidding state
  const [bidAmount, setBidAmount] = useState(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [newBidNotice, setNewBidNotice] = useState(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Fetch auction details
  const fetchAuctionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get(`/api/auctions/${auctionId}`, config);

      if (data.success) {
        setAuction(data.auction);
        setBids(data.bids || []);

        const minNextBid = (data.auction.currentBid || data.auction.startingPrice) + (data.auction.minIncrement || 1000);
        setBidAmount(minNextBid);
      }
    } catch (error) {
      console.error('Error loading auction details:', error);
      if (onToast) onToast('Failed to load auction details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [auctionId, onToast]);

  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  // Real-Time Socket.IO Integration
  useEffect(() => {
    if (!auctionId) return;

    const socket = getSocket();
    socket.emit('join_auction', auctionId);

    const handleNewBid = (data) => {
      if (data.auctionId === auctionId) {
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentBid: data.currentBid,
            highestBidderMasked: data.highestBidderMasked,
            biddersCount: data.biddersCount,
            totalBidsCount: data.totalBidsCount,
          };
        });

        if (data.newBid) {
          setBids((prev) => [data.newBid, ...prev]);
        }

        // Show live update notification toast/banner
        setNewBidNotice(`🔴 New Bid Placed: ₹${data.currentBid.toLocaleString()} by ${data.highestBidderMasked}`);
        setTimeout(() => setNewBidNotice(null), 4000);

        // Update local min next bid input
        setBidAmount((prev) => {
          const nextMin = data.currentBid + (auction?.minIncrement || 1000);
          return prev < nextMin ? nextMin : prev;
        });
      }
    };

    socket.on('new_bid', handleNewBid);

    return () => {
      socket.emit('leave_auction', auctionId);
      socket.off('new_bid', handleNewBid);
    };
  }, [auctionId, auction?.minIncrement]);

  // Countdown Interval
  useEffect(() => {
    if (!auction?.endDate) return;

    const calculateTime = () => {
      const diff = new Date(auction.endDate) - new Date();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction?.endDate]);

  const formatDigit = (num) => String(num).padStart(2, '0');

  const minNextBid = (auction?.currentBid || auction?.startingPrice || 0) + (auction?.minIncrement || 1000);

  const handleIncrement = () => {
    setBidAmount((prev) => prev + (auction?.minIncrement || 1000));
  };

  const handleDecrement = () => {
    setBidAmount((prev) => {
      const next = prev - (auction?.minIncrement || 1000);
      return next >= minNextBid ? next : minNextBid;
    });
  };

  const handlePlaceBidSubmit = async () => {
    if (!user) {
      if (onToast) onToast('Please log in to place a bid on this auction.', 'error');
      return;
    }

    if (bidAmount < minNextBid) {
      if (onToast) onToast(`Bid must be at least ₹${minNextBid.toLocaleString()}`, 'error');
      return;
    }

    try {
      setSubmittingBid(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/auctions/${auctionId}/bid`, { amount: bidAmount }, config);

      if (data.success) {
        if (onToast) onToast(data.message || '🎉 Bid placed successfully!', 'success');
        setConfirmModalOpen(false);
        setAuction(data.auction);
        if (data.bid) {
          setBids((prev) => [data.bid, ...prev]);
        }
        setBidAmount(data.auction.currentBid + (data.auction.minIncrement || 1000));
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to place bid. Please try again.';
      if (onToast) onToast(msg, 'error');
    } finally {
      setSubmittingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-md max-w-7xl mx-auto my-8">
        <RefreshCw size={44} className="mx-auto animate-spin text-[#1F5E3B]" />
        <h3 className="text-xl font-black text-[#17331F] dark:text-white">Connecting to Live Auction Bidding Feed...</h3>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="py-20 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 max-w-7xl mx-auto my-8 p-10">
        <AlertTriangle size={48} className="mx-auto text-amber-500" />
        <h3 className="text-xl font-black text-[#17331F] dark:text-white">Auction Not Found</h3>
        <button onClick={onBack} className="px-6 py-3 rounded-2xl bg-[#1F5E3B] text-white font-black text-sm">
          ← Back to Live Auctions
        </button>
      </div>
    );
  }

  const isOwner = user && String(auction.seller?._id || auction.seller) === String(user._id);
  const isWinner = user && auction.status === 'COMPLETED' && String(auction.highestBidder) === String(user._id);
  const images = auction.images && auction.images.length > 0
    ? auction.images
    : ['https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 font-sans text-slate-800 dark:text-slate-100">
      
      {/* BACK BUTTON & TOP BAR */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 font-extrabold text-sm border border-[#D7E6D5] dark:border-slate-800 shadow-xs hover:bg-[#DDEFD9] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Live Auctions</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-300">
            📍 {auction.location || 'Idukki, Kerala'}
          </span>
          <span className="text-xs font-extrabold text-gray-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-[#D7E6D5] dark:border-slate-800">
            ID: #{auction._id.substring(auction._id.length - 6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* LIVE BID FLASH NOTICE BANNER */}
      {newBidNotice && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white font-black text-sm flex items-center justify-between shadow-lg animate-bounce">
          <span className="flex items-center gap-2">
            <Sparkles size={18} />
            {newBidNotice}
          </span>
          <span className="text-xs font-extrabold bg-white/20 px-3 py-1 rounded-full">LIVE FEED</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: PLANTATION GALLERY & DETAILED SPECS (col-span-7) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* IMAGE GALLERY WITH THUMBNAIL SELECTOR */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-4 shadow-md space-y-4">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={auction.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-black/70 text-white backdrop-blur-md border border-white/20">
                  📷 Photo {activeImageIndex + 1} of {images.length}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx ? 'border-[#1F5E3B] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PLANTATION INFORMATION SPECS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-7 shadow-md space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#17331F] dark:text-slate-100 font-poppins">
                {auction.title}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                {auction.description || 'Verified high-yielding cardamom plantation listed for live competitive bidding on Cardora Platform.'}
              </p>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700">
              <div>
                <span className="text-xs font-black uppercase text-gray-500 block mb-1">Area Size</span>
                <span className="text-lg font-black text-[#17331F] dark:text-slate-100 font-poppins">{auction.areaAcres || 5.5} Acres</span>
                <span className="text-[10px] text-gray-500 block">Registered Estate</span>
              </div>
              <div>
                <span className="text-xs font-black uppercase text-gray-500 block mb-1">Est. Annual Yield</span>
                <span className="text-lg font-black text-[#17331F] dark:text-slate-100 font-poppins">{auction.estimatedYieldKg || 1450} kg</span>
                <span className="text-[10px] text-gray-500 block">Dry Cardamom Pods</span>
              </div>
              <div>
                <span className="text-xs font-black uppercase text-gray-500 block mb-1">Cardamom Variety</span>
                <span className="text-base font-black text-[#1F5E3B] dark:text-emerald-400 block font-poppins">{auction.plantationType || 'Njallani Gold'}</span>
                <span className="text-[10px] text-gray-500 block">High Density</span>
              </div>
              <div>
                <span className="text-xs font-black uppercase text-gray-500 block mb-1">Quality Grade</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400 block font-poppins">{auction.grade || '8mm AGEB'}</span>
                <span className="text-[10px] text-gray-500 block">Export Quality</span>
              </div>
            </div>

            {/* DETAILED SPECIFICATIONS TABLE */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-[#17331F] dark:text-slate-100 flex items-center gap-2">
                <FileText size={18} className="text-[#1F5E3B]" />
                Plantation Specifications & Verification
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                <div className="py-3 flex justify-between">
                  <span className="font-bold text-gray-500">Estate Owner</span>
                  <span className="font-extrabold text-[#17331F] dark:text-slate-100">{auction.seller?.name || 'Verified Cardora Planter'}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-bold text-gray-500">Location & District</span>
                  <span className="font-extrabold text-[#17331F] dark:text-slate-100">{auction.location || 'Idukki, Kerala'}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-bold text-gray-500">Soil Condition & pH</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Loamy Forest Soil (pH 6.2 - Ideal)</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-bold text-gray-500">Irrigation System</span>
                  <span className="font-extrabold text-[#17331F] dark:text-slate-100">Automated Micro-Drip System</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-bold text-gray-500">Spices Board Registration</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={16} /> Verified Active Certificate
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY LIVE BIDDING PANEL (col-span-5) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          
          {/* STICKY LIVE BIDDING CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#1F5E3B] dark:border-emerald-500/50 p-7 shadow-xl space-y-6">
            
            {/* CARD HEADER & BADGE */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="px-4 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white flex items-center gap-2 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                🔴 LIVE AUCTION
              </span>

              <span className="text-xs font-extrabold text-gray-500 flex items-center gap-1">
                <Users size={14} className="text-[#1F5E3B]" />
                {auction.biddersCount || 0} active bidders
              </span>
            </div>

            {/* CURRENT HIGHEST BID DISPLAY */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#DDEFD9] via-emerald-100 to-[#DDEFD9] dark:from-emerald-950 dark:to-slate-800 border border-[#5C8D4E]/30 space-y-1 text-center">
              <span className="text-xs font-black uppercase text-[#1F5E3B] dark:text-emerald-400 tracking-wider">
                Current Highest Bid
              </span>
              <div className="text-4xl sm:text-5xl font-black text-[#17331F] dark:text-slate-100 font-poppins">
                ₹{(auction.currentBid || auction.startingPrice).toLocaleString()}
              </div>
              <span className="text-xs text-gray-500 font-bold block pt-1">
                Starting Price: ₹{auction.startingPrice.toLocaleString()}
              </span>
            </div>

            {/* REAL-TIME COUNTDOWN TIMER */}
            <div className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-center space-y-2">
              <span className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center justify-center gap-1.5">
                <Clock size={16} className="text-[#1F5E3B]" />
                Auction Ends In
              </span>

              {timeLeft.isExpired ? (
                <div className="py-2 text-rose-600 font-black text-xl">AUCTION CLOSED</div>
              ) : (
                <div className={`text-3xl sm:text-4xl font-black font-mono tracking-wider ${
                  timeLeft.hours === 0 && timeLeft.minutes < 5 ? 'text-amber-600 animate-pulse' : 'text-[#17331F] dark:text-white'
                }`}>
                  ⏱ {formatDigit(timeLeft.hours)} : {formatDigit(timeLeft.minutes)} : {formatDigit(timeLeft.seconds)}
                </div>
              )}
            </div>

            {/* PLACE BID CALCULATOR & BUTTON */}
            {!timeLeft.isExpired && auction.status !== 'COMPLETED' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-gray-500">
                    <span>Minimum Next Bid:</span>
                    <span className="text-[#1F5E3B] dark:text-emerald-400">₹{minNextBid.toLocaleString()}</span>
                  </div>

                  {/* Increment/Decrement Input */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDecrement}
                      disabled={bidAmount <= minNextBid}
                      className="w-12 h-12 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 hover:bg-[#DDEFD9] border border-[#D7E6D5] text-[#17331F] dark:text-slate-100 font-black text-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-40"
                    >
                      -
                    </button>

                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#17331F] dark:text-slate-100 text-lg">₹</span>
                      <input
                        type="number"
                        step={auction.minIncrement || 1000}
                        min={minNextBid}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border-2 border-[#1F5E3B] dark:border-emerald-500 text-xl font-black text-[#17331F] dark:text-white focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleIncrement}
                      className="w-12 h-12 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 hover:bg-[#DDEFD9] border border-[#D7E6D5] text-[#17331F] dark:text-slate-100 font-black text-xl flex items-center justify-center cursor-pointer transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* BID BUTTON */}
                <button
                  onClick={() => setConfirmModalOpen(true)}
                  disabled={isOwner || bidAmount < minNextBid}
                  className="w-full py-4 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Gavel size={20} />
                  <span>🔨 PLACE BID (₹{bidAmount.toLocaleString()})</span>
                </button>

                {isOwner && (
                  <p className="text-xs text-amber-600 font-extrabold text-center">
                    ⚠️ You are the owner of this auction and cannot bid on your own listing.
                  </p>
                )}
              </div>
            ) : (
              /* CLOSED AUCTION SUMMARY */
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                <h4 className="text-lg font-black text-[#17331F] dark:text-white">This Auction Has Concluded</h4>
                <div className="text-xs font-extrabold text-gray-600 dark:text-slate-300">
                  Winning Bid: <strong className="text-emerald-700 text-base">₹{auction.currentBid.toLocaleString()}</strong>
                </div>
                <div className="text-xs font-extrabold text-gray-600 dark:text-slate-300">
                  Winner: <strong className="text-slate-900 dark:text-white">{auction.highestBidderMasked || 'Buyer #A82'}</strong>
                </div>

                {isWinner && (
                  <div className="p-3 rounded-xl bg-emerald-500 text-white font-black text-xs">
                    🎉 Congratulations! You won this plantation auction.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* LIVE BID ACTIVITY TIMELINE */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-[#17331F] dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-[#1F5E3B]" />
                Live Bid Activity
              </h3>
              <span className="text-[11px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-full border border-rose-200">
                🔴 Live updates enabled
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {bids.length > 0 ? (
                bids.map((b, idx) => (
                  <div key={b._id || idx} className="p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 flex items-center justify-between text-xs sm:text-sm">
                    <div className="space-y-0.5">
                      <span className="font-black text-[#17331F] dark:text-slate-100 block">
                        {b.bidderMasked || 'Buyer #A82'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {new Date(b.placedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-base font-poppins block">
                        ₹{b.amount.toLocaleString()}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Highest Bid
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs font-semibold text-gray-400">
                  No bids placed yet. Be the first to place a bid!
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CONFIRMATION BID MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-7 shadow-2xl border border-[#D7E6D5] dark:border-slate-800 space-y-5 text-center font-sans">
            <div className="w-14 h-14 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center mx-auto shadow-md">
              <Gavel size={28} />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#17331F] dark:text-white">Confirm Your Bid</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                You are about to place a binding bid on "{auction.title}".
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 space-y-2">
              <span className="text-xs font-black uppercase text-gray-400 block">Your Bid Amount</span>
              <div className="text-4xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins">
                ₹{bidAmount.toLocaleString()}
              </div>
              <span className="text-xs text-gray-500 font-semibold block">
                Current highest bid: ₹{(auction.currentBid || auction.startingPrice).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handlePlaceBidSubmit}
                disabled={submittingBid}
                className="flex-1 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {submittingBid ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Confirm Bid</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuctionDetailView;
