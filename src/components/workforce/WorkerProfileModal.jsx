import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle, ShieldCheck, Phone, Star, DollarSign,
  Award, MessageSquare, UserPlus, Briefcase, Clock
} from 'lucide-react';

const WorkerProfileModal = ({
  worker,
  isOpen,
  onClose,
  onConnect,
  onOpenChat,
  onAssignTask,
  onPayWage,
  isConnected = false,
  isPending = false,
}) => {
  if (!isOpen || !worker) return null;

  const user = worker.user || {};
  const photo = worker.photo || user.avatar || user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.fullName || user.name || 'Worker')}&background=1F5E3B&color=ffffff`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#D7E6D5] dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-[#1F5E3B] via-[#2D7A4F] to-[#5C8D4E] relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            {worker.isVerified && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-[#1F5E3B] dark:text-emerald-400 text-xs font-black rounded-full flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-[#1F5E3B] dark:text-emerald-400" />
                <span>Verified Cardora Worker</span>
              </div>
            )}
          </div>

          {/* Profile Header Main */}
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 mb-4 gap-4">
              <div className="relative">
                <img
                  src={photo}
                  alt={worker.fullName}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800"
                />
                <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
                  worker.availability === 'Available Today' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => { onClose(); onOpenChat && onOpenChat(user._id || worker.user); }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat Direct</span>
                    </button>
                    <button
                      onClick={() => { onClose(); onAssignTask && onAssignTask(worker); }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-[#5C8D4E] hover:bg-[#4a743e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Assign Work</span>
                    </button>
                    <button
                      onClick={() => { onClose(); onPayWage && onPayWage(worker); }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Pay Wage</span>
                    </button>
                  </>
                ) : isPending ? (
                  <button
                    disabled
                    className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-2 cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Connection Request Pending</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onConnect && onConnect(user._id || worker.user)}
                    className="px-6 py-2.5 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Connect Worker</span>
                  </button>
                )}
              </div>
            </div>

            {/* Name & Title Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#17331F] dark:text-white">{worker.fullName || user.name}</h2>
                <span className="px-2.5 py-0.5 bg-[#DDEFD9] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 text-[10px] font-black rounded-md">
                  {worker.workerId}
                </span>
              </div>
              <p className="text-xs text-[#5C8D4E] dark:text-emerald-400 font-bold">
                {worker.experience} • {worker.district}, {worker.village}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">{worker.bio}</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-xl border border-[#D7E6D5] dark:border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{worker.rating || 4.9}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Average Rating</p>
              </div>

              <div className="p-3 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-xl border border-[#D7E6D5] dark:border-slate-800 text-center">
                <p className="text-sm font-black text-[#1F5E3B] dark:text-emerald-400">₹{worker.dailyWage} / day</p>
                <p className="text-[10px] text-slate-500 font-medium">Daily Wage</p>
              </div>

              <div className="p-3 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-xl border border-[#D7E6D5] dark:border-slate-800 text-center">
                <p className="text-sm font-black text-slate-800 dark:text-white">{worker.completedJobs || 0}</p>
                <p className="text-[10px] text-slate-500 font-medium">Completed Jobs</p>
              </div>

              <div className="p-3 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-xl border border-[#D7E6D5] dark:border-slate-800 text-center">
                <span className={`text-xs font-black px-2 py-0.5 rounded-md inline-block ${
                  worker.availability === 'Available Today'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {worker.availability}
                </span>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Status</p>
              </div>
            </div>

            {/* Detailed Info Sections */}
            <div className="space-y-4 text-xs">
              {/* Skills & Specializations */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
                <h4 className="font-extrabold text-[#17331F] dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1F5E3B] dark:text-emerald-400" />
                  <span>Plantation Skills & Specializations</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(worker.skills || []).map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-300 border border-[#D7E6D5] dark:border-slate-700 rounded-lg font-medium shadow-2xs">
                      {skill}
                    </span>
                  ))}
                  {(worker.specializations || []).map((spec, idx) => (
                    <span key={`spec-${idx}`} className="px-2.5 py-1 bg-[#DDEFD9] dark:bg-slate-700 text-[#17331F] dark:text-emerald-200 font-bold rounded-lg">
                      ★ {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages & Districts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-bold text-slate-500 text-[10px]">Languages Spoken</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {(worker.languages || ['Malayalam', 'Tamil']).join(', ')}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-bold text-slate-500 text-[10px]">Preferred Work Districts</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {(worker.preferredDistricts || ['Idukki', 'Wayanad']).join(', ')}
                  </p>
                </div>
              </div>

              {/* Certificates */}
              {worker.certificates && worker.certificates.length > 0 && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="font-bold text-slate-500 text-[10px] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Certifications & Verification Badges</span>
                  </p>
                  <div className="space-y-1">
                    {worker.certificates.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#17331F] dark:text-slate-300 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sensitive Info (Only if connected or owner) */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#1F5E3B] dark:text-emerald-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Verified Contact Information</span>
                  </h4>
                  {!isConnected && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                      🔒 Protected (Connect to View)
                    </span>
                  )}
                </div>

                {isConnected ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium">
                    <p><strong className="text-slate-500">Phone:</strong> {worker.phone || user.phone || '+91 98471 11223'}</p>
                    <p><strong className="text-slate-500">Village:</strong> {worker.village}</p>
                    <p><strong className="text-slate-500">District:</strong> {worker.district}</p>
                    <p><strong className="text-slate-500">Emergency Contact:</strong> {worker.emergencyContact?.name || 'Family'} ({worker.emergencyContact?.phone || worker.phone})</p>
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                    Full phone number and emergency contacts are protected. Click "Connect Worker" to request access.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkerProfileModal;
