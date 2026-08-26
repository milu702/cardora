import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const AdminAuctionsTab = ({ onSelectAuction, onToast }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchAllAuctions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get('/api/auctions?statusTab=all', config);

      if (data.success) {
        setAuctions(data.auctions || []);
      }
    } catch (error) {
      console.error('Error fetching admin auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAuctions();
  }, []);

  const handleAdminAction = async (auctionId, action) => {
    try {
      setProcessingId(auctionId);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.put(`/api/auctions/${auctionId}/approve`, { action }, config);

      if (data.success) {
        if (onToast) onToast(data.message || 'Auction status updated successfully!', 'success');
        fetchAllAuctions();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update auction status.';
      if (onToast) onToast(msg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white">🔴 LIVE</span>;
      case 'ENDING_SOON':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white">⏰ ENDING SOON</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-yellow-500 text-white animate-pulse">⏳ PENDING</span>;
      case 'SCHEDULED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">🟢 SCHEDULED</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-700 text-white">✓ COMPLETED</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-200 text-rose-800">REJECTED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-800">DRAFT</span>;
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw size={36} className="mx-auto animate-spin text-[#1F5E3B]" />
        <h4 className="text-base font-black text-[#17331F] dark:text-white">Loading Auction Management Console...</h4>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-[#17331F] dark:text-white font-poppins flex items-center gap-2">
            <ShieldCheck size={24} className="text-[#1F5E3B]" />
            Admin Auction Oversight & Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review submitted plantation auctions, approve listings, monitor live bidding telemetry, and audit sales.
          </p>
        </div>

        <button
          onClick={fetchAllAuctions}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#1F5E3B] font-extrabold text-xs flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* MONITORING TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-xs tracking-wider border-b border-[#D7E6D5] dark:border-slate-700">
              <tr>
                <th className="py-4 px-5">Auction Title</th>
                <th className="py-4 px-5">Seller / Owner</th>
                <th className="py-4 px-5">Current Bid</th>
                <th className="py-4 px-5">Bids</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auctions.map((auc) => (
                <tr key={auc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-5 font-black text-[#17331F] dark:text-white max-w-xs">
                    <div className="truncate">{auc.title}</div>
                    <span className="text-[10px] text-gray-400 font-semibold block">{auc.location || 'Idukki'} • {auc.areaAcres || 5} Acres</span>
                  </td>

                  <td className="py-4 px-5 font-bold text-slate-700 dark:text-slate-300">
                    {auc.seller?.name || 'Farmer'}
                  </td>

                  <td className="py-4 px-5 font-black text-emerald-700 dark:text-emerald-400 text-base font-poppins">
                    ₹{(auc.currentBid || auc.startingPrice).toLocaleString()}
                  </td>

                  <td className="py-4 px-5 font-extrabold text-slate-800 dark:text-slate-200">
                    {auc.totalBidsCount || 0} bids
                  </td>

                  <td className="py-4 px-5">
                    {getStatusBadge(auc.status)}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectAuction(auc)}
                        className="p-2 rounded-xl bg-[#EAF3E8] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 font-bold hover:bg-[#DDEFD9]"
                        title="View Auction Details"
                      >
                        <Eye size={16} />
                      </button>

                      {auc.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => handleAdminAction(auc._id, 'approve')}
                            disabled={processingId === auc._id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={14} />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleAdminAction(auc._id, 'reject')}
                            disabled={processingId === auc._id}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {(auc.status === 'LIVE' || auc.status === 'ENDING_SOON') && (
                        <button
                          onClick={() => handleAdminAction(auc._id, 'suspend')}
                          disabled={processingId === auc._id}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle size={14} />
                          <span>Suspend</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminAuctionsTab;
