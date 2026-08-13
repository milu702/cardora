import React, { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, IndianRupee, CreditCard, Send, Star } from 'lucide-react';
import apiService from '../../services/api';

const WorkerProfileModal = ({ isOpen, onClose, worker, plantationId, showToast }) => {
  const [activeTab, setActiveTab] = useState('attendance'); // attendance | work | rating | wages | payments | sms
  const [wageDetails, setWageDetails] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfileDetails = async () => {
      if (!isOpen || !worker) return;
      setLoading(true);
      try {
        const [wRes, rRes, sRes] = await Promise.all([
          apiService.getSupervisorWorkerWageDetails(worker._id),
          apiService.getSupervisorWorkerRatings(worker._id),
          apiService.getSupervisorWorkerSmsLogs(worker._id),
        ]);

        if (wRes.success) setWageDetails(wRes);
        if (rRes.success) setRatings(rRes.ratings || []);
        if (sRes.success) setSmsLogs(sRes.logs || []);
      } catch (err) {
        console.error('Error loading worker profile stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileDetails();
  }, [isOpen, worker]);

  if (!isOpen || !worker) return null;

  const summary = wageDetails?.summary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-3xl rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Profile Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#17331F] via-[#2C5E3B] to-[#17331F] text-white flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 text-white font-bold flex items-center justify-center text-xl shadow-lg overflow-hidden">
              {worker.photo ? (
                <img src={worker.photo} alt={worker.fullName} className="w-full h-full object-cover" />
              ) : (
                worker.fullName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-black">{worker.fullName}</h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 rounded-md text-xs font-mono font-bold border border-emerald-400/30">
                  {worker.workerId}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-3">
                <span>{worker.workType || 'Capsule Harvesting'}</span>
                <span>•</span>
                <span>{worker.phone || 'No phone registered'}</span>
                <span>•</span>
                <span className="font-bold text-amber-300">★ {worker.rating || 4.5} / 5</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex items-center space-x-1 px-6 bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'work', label: 'Work & Profile', icon: Briefcase },
            { id: 'rating', label: 'Rating', icon: Star },
            { id: 'wages', label: 'Wages', icon: IndianRupee },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'sms', label: 'SMS History', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#1E293B]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading worker statistics...</div>
          ) : (
            <>
              {/* TAB 1: ATTENDANCE */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-center">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Present</span>
                      <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
                        {summary.presentDays || 0} days
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/50 text-center">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Half Day</span>
                      <p className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1">
                        {summary.halfDays || 0} days
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800/50 text-center">
                      <span className="text-xs font-bold text-red-700 dark:text-red-300">Absent</span>
                      <p className="text-2xl font-black text-red-800 dark:text-red-200 mt-1">
                        {summary.absentDays || 0} days
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/50 text-center">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Overtime</span>
                      <p className="text-2xl font-black text-blue-800 dark:text-blue-200 mt-1">
                        {summary.totalOvertimeHours || 0} hrs
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Attendance Compliance Rate
                    </h4>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{
                          width: `${
                            summary.presentDays || summary.halfDays
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (((summary.presentDays || 0) + (summary.halfDays || 0) * 0.5) /
                                      Math.max(1, (summary.presentDays || 0) + (summary.absentDays || 0) + (summary.halfDays || 0))) *
                                      100
                                  )
                                )
                              : 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WORK & PROFILE */}
              {activeTab === 'work' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl space-y-3 text-xs">
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <p className="font-bold text-gray-900 dark:text-white">{worker.gender || 'Male'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Daily Wage:</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{worker.dailyWage || 700} / day</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Joining Date:</span>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {new Date(worker.joiningDate || worker.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="font-bold text-emerald-600">{worker.status || 'Active'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl space-y-3 text-xs">
                      <div>
                        <span className="text-gray-500">Address:</span>
                        <p className="font-bold text-gray-900 dark:text-white">{worker.address || 'Vandanmedu, Idukki'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Emergency Contact:</span>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {worker.emergencyContact?.name || 'Family Contact'} ({worker.emergencyContact?.phone || 'N/A'})
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Login Access:</span>
                        <p className="font-bold text-gray-500 italic">None (Supervisor Managed)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RATING */}
              {activeTab === 'rating' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Overall Rating</span>
                      <p className="text-3xl font-black text-amber-600 dark:text-amber-400">★ {worker.rating || 4.5} / 5</p>
                    </div>
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                      Based on {ratings.length} supervisor evaluations
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ratings.length === 0 ? (
                      <p className="text-xs text-gray-400">No rating history logged yet.</p>
                    ) : (
                      ratings.map((r, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white">{r.date}</span>
                            <p className="text-[10px] text-gray-500">{r.comment || 'General rating'}</p>
                          </div>
                          <span className="font-black text-amber-500">★ {r.overallRating}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: WAGES */}
              {activeTab === 'wages' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <span className="text-gray-500">Gross Earned</span>
                      <p className="font-black text-emerald-600 text-base">₹{summary.totalEarned || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <span className="text-gray-500">Total Paid</span>
                      <p className="font-black text-green-600 text-base">₹{summary.totalPaidAmount || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <span className="text-gray-500">Pending</span>
                      <p className="font-black text-amber-600 text-base">₹{summary.pendingAmount || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-2">
                  {!wageDetails?.payments || wageDetails.payments.length === 0 ? (
                    <p className="text-xs text-gray-400">No payment logs.</p>
                  ) : (
                    wageDetails.payments.map((p, i) => (
                      <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs flex justify-between">
                        <div>
                          <p className="font-bold">{p.type || 'Salary'} via {p.paymentMethod}</p>
                          <p className="text-[10px] text-gray-400">{new Date(p.paymentDate).toLocaleDateString()}</p>
                        </div>
                        <span className="font-black text-emerald-600">₹{p.amount}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 6: SMS HISTORY */}
              {activeTab === 'sms' && (
                <div className="space-y-2">
                  {smsLogs.length === 0 ? (
                    <p className="text-xs text-gray-400">No SMS dispatch history found.</p>
                  ) : (
                    smsLogs.map((log, i) => (
                      <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-emerald-600">{log.type} SMS</span>
                          <span className="text-gray-400 text-[10px]">{new Date(log.sentAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-mono text-[11px]">"{log.message}"</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerProfileModal;
