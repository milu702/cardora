import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { apiService } from '../../services/api';

const PlantationVisitsManager = ({ onToast, onOpenChat }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Declined'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [declineModalId, setDeclineModalId] = useState(null);
  const [declineNote, setDeclineNote] = useState('');

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await apiService.getOwnerPlantationVisits();
      if (res && res.success && Array.isArray(res.visits)) {
        setVisits(res.visits);
      }
    } catch (err) {
      console.warn('Failed to fetch owner visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
    const interval = setInterval(fetchVisits, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (visitId, newStatus, note = '') => {
    setActionLoadingId(visitId);
    try {
      const res = await apiService.updatePlantationVisitStatus(visitId, newStatus, note);
      if (res && res.success) {
        if (onToast) {
          onToast(
            newStatus === 'Approved'
              ? '✅ Visit Approved! Notification & confirmation sent to visitor.'
              : '❌ Visit Request Declined.'
          );
        }
        setVisits((prev) =>
          prev.map((v) => (v._id === visitId || v.id === visitId ? { ...v, status: newStatus, ownerNote: note } : v))
        );
        setDeclineModalId(null);
        setDeclineNote('');
      } else {
        if (onToast) onToast(res?.message || 'Failed to update visit status');
      }
    } catch (err) {
      if (onToast) onToast('Error updating visit status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredVisits = visits.filter((v) => {
    if (filter === 'Pending') return v.status === 'Pending';
    if (filter === 'Approved') return v.status === 'Approved';
    if (filter === 'Declined') return v.status === 'Declined';
    return true;
  });

  const pendingCount = visits.filter((v) => v.status === 'Pending').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#D7E6D5] dark:border-slate-800 shadow-sm space-y-6 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1F5E3B] dark:text-emerald-400" />
              On-Site Plantation Visit Requests
            </h3>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] animate-pulse">
                {pendingCount} PENDING
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage buyer & visitor appointments for plot boundary inspection in person.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#F8FAF7] dark:bg-slate-800 p-1.5 rounded-2xl border border-[#D7E6D5] dark:border-slate-700 self-start sm:self-auto">
          {['All', 'Pending', 'Approved', 'Declined'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f
                  ? 'bg-[#1F5E3B] text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={fetchVisits}
            className="p-1.5 rounded-xl text-slate-500 hover:text-[#1F5E3B] dark:hover:text-emerald-400 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* VISITS LIST */}
      {loading && visits.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#1F5E3B]" />
          Loading incoming plantation visit appointments...
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto opacity-50" />
          <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
            No {filter !== 'All' ? filter.toLowerCase() : ''} visit appointments found.
          </p>
          <p className="text-[11px] text-slate-400">
            When buyers request an on-site visit for your estate plots, they will appear here for your approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVisits.map((visit) => {
            const isPending = visit.status === 'Pending';
            const isApproved = visit.status === 'Approved';
            const isDeclined = visit.status === 'Declined';
            const visitorObj = visit.visitor || {};

            return (
              <div
                key={visit._id || visit.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${isPending
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-700/60 shadow-sm'
                    : isApproved
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        visitorObj.avatar ||
                        visitorObj.profilePhoto ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          visit.visitorName || 'Visitor'
                        )}&background=1F5E3B&color=ffffff`
                      }
                      alt=""
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#1F5E3B]"
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white font-poppins">
                        {visit.visitorName || visitorObj.name || 'Interested Planter'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        📱 {visit.visitorPhone || visitorObj.phone || 'Phone upon approval'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isPending
                        ? 'bg-amber-500 text-white'
                        : isApproved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                  >
                    {isPending && <Clock className="w-3 h-3 animate-spin" />}
                    {isApproved && <CheckCircle2 className="w-3 h-3" />}
                    {isDeclined && <XCircle className="w-3 h-3" />}
                    {visit.status}
                  </span>
                </div>

                {/* Plot & Appointment Details */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5 text-[#1F5E3B] dark:text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {visit.plotTitle}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">{visit.plotLocation}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold">
                      <Calendar className="w-3 h-3 text-[#1F5E3B]" /> Date: {visit.visitDate}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold">
                      <Clock className="w-3 h-3 text-[#1F5E3B]" /> Slot: {visit.visitTime}
                    </span>
                  </div>

                  {visit.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                      "{visit.notes}"
                    </p>
                  )}

                  {visit.ownerNote && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                      Owner Note: {visit.ownerNote}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  {onOpenChat && (
                    <button
                      onClick={() => onOpenChat(visitorObj._id ? visitorObj : { id: visit.visitor, name: visit.visitorName })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#1F5E3B]" />
                      <span>Chat</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => setDeclineModalId(visit._id || visit.id)}
                          disabled={actionLoadingId === (visit._id || visit.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-red-300 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(visit._id || visit.id, 'Approved')}
                          disabled={actionLoadingId === (visit._id || visit.id)}
                          className="px-4 py-1.5 rounded-xl bg-[#1F5E3B] hover:bg-[#154329] text-white text-xs font-black shadow-xs flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoadingId === (visit._id || visit.id) ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Visit</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Appointment Approved
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">Request Declined</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DECLINE REASON MODAL */}
      <AnimatePresence>
        {declineModalId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h4 className="text-base font-black text-slate-900 dark:text-white font-poppins">
                Decline Site Visit Request
              </h4>
              <p className="text-xs text-slate-500">
                Optionally provide a reason or suggest alternative visit dates to the buyer.
              </p>
              <textarea
                rows={3}
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="e.g. Please select a weekend date as monsoon pruning is underway this week..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeclineModalId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(declineModalId, 'Declined', declineNote)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs"
                >
                  Confirm Decline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantationVisitsManager;
