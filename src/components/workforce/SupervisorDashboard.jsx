import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  IndianRupee,
  Star,
  Plus,
  Send,
  ShieldCheck,
  Search,
  Eye,
  Trash2,
  Edit,
  Award,
} from 'lucide-react';
import apiService from '../../services/api';
import AddWorkerModal from './AddWorkerModal';
import AttendanceTracker from './AttendanceTracker';
import StarRatingModal from './StarRatingModal';
import WagePaymentManager from './WagePaymentManager';
import WorkerProfileModal from './WorkerProfileModal';
import SmsNotificationModal from './SmsNotificationModal';
import OwnerMonitoringView from './OwnerMonitoringView';

const SupervisorDashboard = ({ plantationId = 'default_plantation_id', showToast }) => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard | attendance | wages | owner | sms
  const [workers, setWorkers] = useState([]);
  const [plantationInfo, setPlantationInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileWorker, setSelectedProfileWorker] = useState(null);
  const [showSmsModal, setShowSmsModal] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Stats calculation
  const [todayAttendance, setTodayAttendance] = useState([]);

  const loadWorkersData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getSupervisorPlantationWorkers(plantationId, {
        search: searchQuery,
        status: statusFilter,
      });
      if (res.success) {
        setWorkers(res.workers || []);
        if (res.plantation) setPlantationInfo(res.plantation);
      }
    } catch (err) {
      console.error('Error loading workers data:', err);
    } finally {
      setLoading(false);
    }
  }, [plantationId, searchQuery, statusFilter]);

  const loadTodayAttendance = useCallback(async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await apiService.getSupervisorAttendanceByDate(plantationId, todayStr);
      if (res.success && res.records) {
        setTodayAttendance(res.records);
      }
    } catch (err) {
      console.error('Error loading today attendance:', err);
    }
  }, [plantationId]);

  useEffect(() => {
    if (plantationId) {
      loadWorkersData();
      loadTodayAttendance();
    }
  }, [plantationId, loadWorkersData, loadTodayAttendance]);

  // Save new or updated worker
  const handleSaveWorker = async (formData) => {
    try {
      let res;
      if (editingWorker) {
        res = await apiService.updateSupervisorWorker(editingWorker._id, formData);
      } else {
        res = await apiService.createSupervisorWorker(formData);
      }

      if (res.success) {
        if (showToast) showToast(editingWorker ? '🎉 Worker updated' : '🎉 Worker registered!');
        setEditingWorker(null);
        loadWorkersData();
      } else {
        if (showToast) showToast(`❌ ${res.message}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    }
  };

  // Delete/Deactivate worker
  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to set this worker status to Inactive?')) return;
    try {
      const res = await apiService.deleteSupervisorWorker(workerId);
      if (res.success) {
        if (showToast) showToast('Worker marked as Inactive');
        loadWorkersData();
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    }
  };

  // KPI Calculations
  let presentTodayCount = 0;
  let absentTodayCount = 0;
  let halfDayTodayCount = 0;
  let leaveTodayCount = 0;
  let totalOvertimeHours = 0;

  todayAttendance.forEach((att) => {
    if (att.status === 'Present') presentTodayCount++;
    else if (att.status === 'Absent') absentTodayCount++;
    else if (att.status === 'Half Day') halfDayTodayCount++;
    else if (att.status === 'Leave') leaveTodayCount++;

    if (att.overtimeHours) totalOvertimeHours += att.overtimeHours;
  });

  const totalDailyWageSum = workers.reduce((sum, w) => sum + (w.dailyWage || 700), 0);
  const totalMonthlyWageEst = totalDailyWageSum * 26; // 26 working days estimate
  const activeWorkersCount = workers.filter((w) => w.status === 'Active').length;

  const avgRatingSum = workers.length
    ? (workers.reduce((acc, w) => acc + (w.rating || 4.5), 0) / workers.length).toFixed(1)
    : '4.5';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & View Navigation Switcher */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Cardora Supervisor Hub
          </span>
          <h1 className="text-2xl font-black text-[#17331F] dark:text-white">
            {plantationInfo?.name || 'Cardamom Estate'} — Worker Management
          </h1>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Users },
            { id: 'attendance', label: "Today's Attendance", icon: UserCheck },
            { id: 'wages', label: 'Wages & Payments', icon: IndianRupee },
            { id: 'owner', label: 'Owner View', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER VIEW: 1. DASHBOARD OVERVIEW */}
      {activeView === 'dashboard' && (
        <>
          {/* Mobile-Friendly KPI Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Workers */}
            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Total Workers</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{workers.length}</p>
              <span className="text-[10px] text-emerald-600 font-bold">{activeWorkersCount} Active</span>
            </div>

            {/* Present Today */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800/50 shadow-md">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Present Today</span>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">🟢 {presentTodayCount}</p>
              <span className="text-[10px] text-emerald-600">{halfDayTodayCount} Half Day</span>
            </div>

            {/* Absent Today */}
            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-800/50 shadow-md">
              <span className="text-[11px] font-bold text-red-700 dark:text-red-300 uppercase">Absent / Leave</span>
              <p className="text-2xl font-black text-red-800 dark:text-red-200 mt-1">🔴 {absentTodayCount}</p>
              <span className="text-[10px] text-blue-600">{leaveTodayCount} On Leave</span>
            </div>

            {/* Total Daily Wage */}
            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Total Daily Wage</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{totalDailyWageSum.toLocaleString()}
              </p>
              <span className="text-[10px] text-gray-400">Est. ₹{totalMonthlyWageEst.toLocaleString()}/mo</span>
            </div>

            {/* Average Rating & Overtime */}
            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Avg Rating & OT</span>
              <p className="text-2xl font-black text-amber-500 mt-1">★ {avgRatingSum}</p>
              <span className="text-[10px] text-blue-600 font-bold">{totalOvertimeHours} Overtime Hrs</span>
            </div>
          </div>

          {/* Quick Action Buttons Bar */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Supervisor Actions</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setEditingWorker(null);
                  setShowAddModal(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Worker</span>
              </button>

              <button
                onClick={() => setActiveView('attendance')}
                className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-500/30 flex items-center space-x-2 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Today's Attendance</span>
              </button>

              <button
                onClick={() => setActiveView('wages')}
                className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-300 rounded-2xl text-xs font-bold border border-green-500/30 flex items-center space-x-2 transition-all"
              >
                <IndianRupee className="w-4 h-4" />
                <span>Wages & Payments</span>
              </button>

              <button
                onClick={() => setShowSmsModal(true)}
                className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-bold border border-blue-500/30 flex items-center space-x-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send Worker SMS</span>
              </button>

              <button
                onClick={() => setActiveView('owner')}
                className="px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-2xl text-xs font-bold border border-purple-500/30 flex items-center space-x-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Owner Reports</span>
              </button>
            </div>
          </div>

          {/* Registered Worker List Table & Cards */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Registered Workers ({workers.length})
              </h2>

              {/* Search & Status Filters */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading workers list...</div>
            ) : workers.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">No workers found. Click "Add Worker" to register one.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <div
                    key={worker._id}
                    className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700/60 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white font-bold flex items-center justify-center text-sm shadow-md overflow-hidden">
                            {worker.photo ? (
                              <img src={worker.photo} alt={worker.fullName} className="w-full h-full object-cover" />
                            ) : (
                              worker.fullName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{worker.fullName}</h4>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                              {worker.workerId}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {worker.rating || 4.5}
                        </span>
                      </div>

                      {/* Info Details */}
                      <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <p className="flex justify-between">
                          <span>Role / Work:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{worker.workType || 'Capsule Harvesting'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Daily Wage:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{worker.dailyWage || 700} / day</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Mobile:</span>
                          <span className="font-mono text-gray-800 dark:text-gray-200">{worker.phone || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedProfileWorker(worker);
                          setShowProfileModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-500/20 flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setRatingWorker(worker);
                          setShowRatingModal(true);
                        }}
                        className="px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold hover:bg-amber-500/20 flex items-center space-x-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Rate</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingWorker(worker);
                          setShowAddModal(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteWorker(worker._id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* RENDER VIEW: 2. TODAY'S ATTENDANCE */}
      {activeView === 'attendance' && (
        <AttendanceTracker
          plantationId={plantationId}
          workers={workers}
          onAttendanceSaved={() => {
            loadTodayAttendance();
            loadWorkersData();
          }}
          showToast={showToast}
        />
      )}

      {/* RENDER VIEW: 3. WAGES & PAYMENTS */}
      {activeView === 'wages' && (
        <WagePaymentManager plantationId={plantationId} workers={workers} showToast={showToast} />
      )}

      {/* RENDER VIEW: 4. OWNER REPORTING */}
      {activeView === 'owner' && <OwnerMonitoringView plantationId={plantationId} showToast={showToast} />}

      {/* MODALS */}
      <AddWorkerModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingWorker(null);
        }}
        onSave={handleSaveWorker}
        plantationId={plantationId}
        initialData={editingWorker}
      />

      <StarRatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRatingWorker(null);
        }}
        worker={ratingWorker}
        plantationId={plantationId}
        onRatingSaved={loadWorkersData}
        showToast={showToast}
      />

      <WorkerProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedProfileWorker(null);
        }}
        worker={selectedProfileWorker}
        plantationId={plantationId}
        showToast={showToast}
      />

      <SmsNotificationModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        workers={workers}
        showToast={showToast}
      />
    </div>
  );
};

export default SupervisorDashboard;
