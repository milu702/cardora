import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import apiService from '../../services/api';

const OwnerMonitoringView = ({ plantationId, showToast }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [supervisorQuery, setSupervisorQuery] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadOwnerSummary = useCallback(async () => {
    if (!plantationId) return;
    setLoading(true);
    try {
      const res = await apiService.getOwnerMonitoringSummary(plantationId);
      if (res.success) {
        setSummaryData(res);
      }
    } catch (err) {
      console.error('Error loading owner summary:', err);
    } finally {
      setLoading(false);
    }
  }, [plantationId]);

  useEffect(() => {
    loadOwnerSummary();
  }, [loadOwnerSummary]);

  const handleAssignSupervisor = async (e) => {
    e.preventDefault();
    if (!supervisorQuery.trim()) return;

    setAssigning(true);
    try {
      const res = await apiService.assignSupervisorToPlantation(plantationId, {
        emailOrUsername: supervisorQuery,
      });

      if (res.success) {
        if (showToast) showToast(`🎉 ${res.message}`);
        setShowAssignModal(false);
        setSupervisorQuery('');
        loadOwnerSummary();
      } else {
        if (showToast) showToast(`❌ ${res.message}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const stats = summaryData?.stats || {};
  const supervisors = summaryData?.supervisors || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#17331F] via-[#2C5E3B] to-[#17331F] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Owner Executive Oversight</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Supervisor & Workforce Monitoring Hub</h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            Real-time audit of assigned supervisors, daily attendance, ratings, and wage liabilities
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Assign New Supervisor</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading owner monitoring metrics...</div>
      ) : !summaryData ? (
        <div className="py-12 text-center text-gray-500">No monitoring summary data available.</div>
      ) : (
        <>
          {/* KPI Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Workers */}
            <div className="p-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total Workers</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {stats.totalWorkers || 0}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">Supervisor-managed</p>
            </div>

            {/* Today's Attendance */}
            <div className="p-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Present Today</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {stats.presentToday || 0} / {stats.totalWorkers || 0}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {stats.absentToday || 0} Absent | {stats.halfDayToday || 0} Half Day
              </p>
            </div>

            {/* Average Worker Rating */}
            <div className="p-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Avg Workforce Rating</span>
              <p className="text-2xl font-black text-amber-500 mt-1">
                ★ {stats.avgWorkerRating || '4.5'} / 5
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Quality & Punctuality</p>
            </div>

            {/* Pending Wages Liability */}
            <div className="p-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Pending Wage Liability</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                ₹{(stats.pendingWages || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-green-600 font-bold mt-1">₹{(stats.totalPaid || 0).toLocaleString()} paid</p>
            </div>
          </div>

          {/* Assigned Supervisors Section */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Assigned Plantation Supervisors ({supervisors.length})
            </h3>

            {supervisors.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No supervisors assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supervisors.map((sup) => (
                  <div
                    key={sup._id}
                    className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                      {sup.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{sup.name}</h4>
                      <p className="text-xs text-gray-500">{sup.email} • {sup.role || 'Supervisor'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Assign Supervisor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-[#17331F] to-[#2C5E3B] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Assign Supervisor Account</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSupervisor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Supervisor Username or Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supervisorQuery}
                  onChange={(e) => setSupervisorQuery(e.target.value)}
                  placeholder="e.g. supervisor@cardora.com or supervisor_idk"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerMonitoringView;
