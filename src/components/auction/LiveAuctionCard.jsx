import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, ArrowRight } from 'lucide-react';

const LiveAuctionCard = ({ auction, onSelect }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(auction.endDate) - new Date();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [auction.endDate]);

  // Format countdown string
  const formatDigit = (num) => String(num).padStart(2, '0');

  // Status Badge Logic
  const getStatusBadge = () => {
    if (timeLeft.isExpired || auction.status === 'COMPLETED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-800/90 text-white border border-slate-700 backdrop-blur-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          ✓ COMPLETED
        </span>
      );
    }
    if (auction.status === 'ENDING_SOON' || (timeLeft.hours === 0 && timeLeft.minutes < 5)) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/90 text-white border border-amber-400 backdrop-blur-md flex items-center gap-1.5 animate-pulse">
          <Clock size={13} />
          ⏰ ENDING SOON
        </span>
      );
    }
    if (auction.status === 'SCHEDULED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600/90 text-white border border-emerald-400 backdrop-blur-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-300" />
          🟢 STARTING SOON
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600/90 text-white border border-rose-400 backdrop-blur-md flex items-center gap-1.5 shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        🔴 LIVE NOW
      </span>
    );
  };

  const imageSrc =
    auction.images && auction.images.length > 0
      ? auction.images[0]
      : 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group font-sans">
      
      {/* CARD IMAGE & OVERLAY BADGES */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageSrc}
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {getStatusBadge()}
          <span className="px-3 py-1 rounded-full text-xs font-black bg-black/60 text-white backdrop-blur-md flex items-center gap-1 border border-white/20">
            <Users size={13} className="text-emerald-400" />
            {auction.biddersCount || 0} bidders
          </span>
        </div>

        {/* Location & Title Overlay */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1 mb-0.5">
            <MapPin size={13} />
            📍 {auction.location || 'Idukki, Kerala'}
          </span>
          <h3 className="text-lg font-black tracking-tight line-clamp-1 group-hover:text-emerald-300 transition-colors font-poppins">
            {auction.title}
          </h3>
        </div>
      </div>

      {/* CARD BODY CONTENT */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-1 text-center bg-[#F8FAF7] dark:bg-slate-800/80 rounded-2xl p-3 border border-[#D7E6D5] dark:border-slate-700">
          <div>
            <span className="text-[10px] uppercase font-black text-gray-400 block">Area</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#17331F] dark:text-slate-100">{auction.areaAcres || 5.0} Acres</span>
          </div>
          <div className="border-x border-[#D7E6D5] dark:border-slate-700">
            <span className="text-[10px] uppercase font-black text-gray-400 block">Est. Yield</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#17331F] dark:text-slate-100">{auction.estimatedYieldKg || 1200} kg</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-gray-400 block">Grade</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 truncate block px-1">
              {auction.grade ? auction.grade.split(' ')[0] : '8mm Bold'}
            </span>
          </div>
        </div>

        {/* Price & Countdown Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Current Highest Bid */}
          <div>
            <span className="text-[11px] font-black uppercase text-gray-400 block">Current Highest Bid</span>
            <span className="text-2xl font-black text-[#17331F] dark:text-emerald-400 font-poppins">
              ₹{(auction.currentBid || auction.startingPrice).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400 block font-semibold">
              Starting: ₹{auction.startingPrice.toLocaleString()}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="text-right">
            <span className="text-[11px] font-black uppercase text-gray-400 block">Time Remaining</span>
            {timeLeft.isExpired ? (
              <span className="text-xs font-black text-gray-400">Auction Closed</span>
            ) : (
              <span className={`text-base font-black font-mono tracking-tight ${
                timeLeft.hours === 0 && timeLeft.minutes < 5 ? 'text-amber-500 animate-pulse' : 'text-[#17331F] dark:text-slate-200'
              }`}>
                ⏱ {formatDigit(timeLeft.hours)}:{formatDigit(timeLeft.minutes)}:{formatDigit(timeLeft.seconds)}
              </span>
            )}
          </div>

        </div>

        {/* View Action Button */}
        <button
          onClick={() => onSelect(auction)}
          className="w-full py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 group-hover:bg-[#17331F]"
        >
          <span>View Auction Details</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
};

export default LiveAuctionCard;
