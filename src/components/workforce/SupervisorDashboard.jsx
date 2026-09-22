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
  Leaf,
  Phone,
  CheckSquare,
  Activity,
  FileText,
  MessageSquare,
  Bell,
  User as UserIcon,
  Lock,
} from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddWorkerModal from './AddWorkerModal';
import AttendanceTracker from './AttendanceTracker';
import StarRatingModal from './StarRatingModal';
import WagePaymentManager from './WagePaymentManager';
import WorkerProfileModal from './WorkerProfileModal';
import SmsNotificationModal from './SmsNotificationModal';
import OwnerMonitoringView from './OwnerMonitoringView';
import PlantationActivityModal from './PlantationActivityModal';
import SupervisorTaskBoard from './SupervisorTaskBoard';

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SupervisorDashboard = ({ plantationId = 'default_plantation_id', showToast, onNavigateTab }) => {
  const { user } = useAuth();
  const isSupervisor = (user?.role || '').toLowerCase() === 'supervisor';

  const [activeView, setActiveView] = useState('dashboard'); // dashboard | plantations | tasks | workers | attendance | wages | activities | reports | messages | notifications | profile
  const [workers, setWorkers] = useState([]);
  const [plantationInfo, setPlantationInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const cleanPropPlantationId = typeof plantationId === 'object' ? (plantationId?._id || plantationId?.id) : plantationId;
  const activePlantationId = plantationInfo?.id || plantationInfo?._id || (cleanPropPlantationId && cleanPropPlantationId !== 'default_plantation_id' ? cleanPropPlantationId : undefined);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileWorker, setSelectedProfileWorker] = useState(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Stats calculation
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [tasksList, setTasksList] = useState([]);

  const loadWorkersData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getSupervisorPlantationWorkers(cleanPropPlantationId || plantationId, {
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
  }, [cleanPropPlantationId, plantationId, searchQuery, statusFilter]);

  const loadTodayAttendance = useCallback(async () => {
    try {
      const targetId = activePlantationId || plantationId;
      const todayStr = getTodayDateStr();
      const res = await apiService.getSupervisorAttendanceByDate(targetId, todayStr);
      if (res && res.success && Array.isArray(res.records)) {
        setTodayAttendance(res.records);
      }
    } catch (err) {
      console.error('Error loading today attendance:', err);
    }
  }, [plantationId, activePlantationId]);

  const loadRecentActivities = useCallback(async () => {
    try {
      const targetId = activePlantationId || plantationId;
      const res = await apiService.getPlantationActivities(targetId);
      if (res && res.success && Array.isArray(res.activities)) {
        setRecentActivities(res.activities);
      }
    } catch (err) {
      console.error('Error loading plantation activities:', err);
    }
  }, [plantationId, activePlantationId]);

  const loadTasks = useCallback(async () => {
    try {
      const res = await apiService.getTasks();
      if (res && res.success && Array.isArray(res.tasks)) {
        setTasksList(res.tasks);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  }, []);

  useEffect(() => {
    if (plantationId) {
      loadWorkersData();
      loadTodayAttendance();
      loadRecentActivities();
      loadTasks();
      const interval = setInterval(() => {
        loadWorkersData();
        loadTodayAttendance();
        loadRecentActivities();
        loadTasks();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [plantationId, loadWorkersData, loadTodayAttendance, loadRecentActivities, loadTasks]);

  // Save worker
  const handleSaveWorker = async (formData) => {
    try {
      let res;
      if (editingWorker) {
        res = await apiService.updateSupervisorWorker(editingWorker._id, formData);
      } else {
        res = await apiService.createSupervisorWorker(formData);
      }

      if (res && res.success) {
        if (showToast) showToast(editingWorker ? '🎉 Worker updated' : '🎉 Worker registered!');
        setEditingWorker(null);
        loadWorkersData();
      } else {
        const errMsg = res?.message || 'Failed to save worker';
        if (showToast) showToast(`❌ ${errMsg}`);
        throw new Error(errMsg);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  // Delete worker
  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to remove this worker from your plantation roster?')) return;
    try {
      const res = await apiService.deleteWorker(workerId);
      if (res && res.success) {
        if (showToast) showToast(res.message || 'Worker removed from roster');
        setWorkers((prev) => prev.filter((w) => (w._id || w.id || w.workerId || '').toString() !== (workerId || '').toString()));
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to remove worker'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error removing worker: ${err.message}`);
    }
    loadWorkersData();
  };

  // Stats Calculations
  let presentTodayCount = 0;
  let absentTodayCount = 0;
  todayAttendance.forEach((att) => {
    if (att.status === 'Present') presentTodayCount++;
    else if (att.status === 'Absent') absentTodayCount++;
  });

  const pendingTasksCount = tasksList.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasksCount = tasksList.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cardora Supervisor Hub</span>
          </span>
          <h1 className="text-2xl font-black text-[#17331F] dark:text-white mt-0.5">
            {plantationInfo?.name || 'Cardora Cardamom Estate'}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              👤 Estate Owner: <strong className="text-emerald-700 dark:text-emerald-400 font-black">{plantationInfo?.ownerName || 'Plantation Owner'}</strong>
            </span>
            {plantationInfo?.location && <span className="text-gray-500">• 📍 {plantationInfo.location}</span>}
          </div>
        </div>

        {/* View Switcher Navigation */}
        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Overview', icon: Users },
            { id: 'tasks', label: 'Assigned Tasks', icon: CheckSquare },
            { id: 'attendance', label: 'Attendance', icon: UserCheck },
            { id: 'wages', label: 'Wages', icon: IndianRupee },
            { id: 'activities', label: 'Plantation Activities', icon: Activity },
            ...(!isSupervisor ? [{ id: 'owner', label: 'Owner Monitoring', icon: ShieldCheck }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
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

      {/* OVERVIEW DASHBOARD VIEW */}
      {activeView === 'dashboard' && (
        <>
          {/* Summary Cards Grid (No Fake Data) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Assigned Plantations</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">1</p>
              <span className="text-[10px] text-gray-400">{plantationInfo?.name || 'Cardamom Estate'}</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Workers Present Today</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">🟢 {presentTodayCount}</p>
              <span className="text-[10px] text-gray-400">Out of {workers.length} registered</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Pending Tasks</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{pendingTasksCount}</p>
              <span className="text-[10px] text-gray-400">{completedTasksCount} Completed</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Recent Activities</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{recentActivities.length}</p>
              <span className="text-[10px] text-gray-400">Recorded on estate</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Supervisor Actions</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
              >
                <Activity className="w-4 h-4" />
                <span>Record Field Activity</span>
              </button>

              <button
                onClick={() => {
                  setEditingWorker(null);
                  setShowAddModal(true);
                }}
                className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-500/30 flex items-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Worker</span>
              </button>

              <button
                onClick={() => setActiveView('attendance')}
                className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-bold border border-blue-500/30 flex items-center space-x-2 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
            </div>
          </div>

          {/* Workers Roster Table */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Workers Roster ({workers.length})
              </h2>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Loading roster...</div>
            ) : workers.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">No workers added to this plantation yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <div
                    key={worker._id}
                    className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                          {worker.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{worker.fullName}</h4>
                          <span className="text-[10px] font-mono text-emerald-700">{worker.workerId}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-500">★ {worker.rating || 4.5}</span>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Role: <strong>{worker.workType || 'Harvesting'}</strong></p>
                      <p>Daily Wage: <strong>₹{worker.dailyWage || 700}</strong></p>
                      <p>Mobile: <strong className="font-mono">{worker.phone || 'N/A'}</strong></p>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs font-bold">
                      <button
                        onClick={() => {
                          setSelectedProfileWorker(worker);
                          setShowProfileModal(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          setRatingWorker(worker);
                          setShowRatingModal(true);
                        }}
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg"
                      >
                        Rate
                      </button>

                      <button
                        onClick={() => handleDeleteWorker(worker._id)}
                        className="p-1 text-red-500 hover:text-red-700"
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

      {/* VIEW: ASSIGNED TASKS */}
      {activeView === 'tasks' && <SupervisorTaskBoard plantationId={activePlantationId} showToast={showToast} />}

      {/* VIEW: ATTENDANCE */}
      {activeView === 'attendance' && (
        <AttendanceTracker
          plantationId={activePlantationId}
          workers={workers}
          onAttendanceSaved={() => {
            loadTodayAttendance();
            loadWorkersData();
          }}
          showToast={showToast}
        />
      )}

      {/* VIEW: WAGES */}
      {activeView === 'wages' && (
        <WagePaymentManager plantationId={activePlantationId} workers={workers} showToast={showToast} />
      )}

      {/* VIEW: PLANTATION ACTIVITIES */}
      {activeView === 'activities' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Recorded Plantation Activities ({recentActivities.length})
            </h2>

            <button
              onClick={() => setShowActivityModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Activity</span>
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No plantation activities recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-800 uppercase">{act.activityType}</span>
                    <span className="text-gray-400 font-mono">{new Date(act.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{act.description}</p>
                  {act.materialsUsed && (
                    <p className="text-gray-500">Materials: <strong>{act.materialsUsed}</strong> ({act.quantity})</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: OWNER MONITORING */}
      {!isSupervisor && activeView === 'owner' && (
        <OwnerMonitoringView plantationId={activePlantationId} showToast={showToast} />
      )}

      {/* MODALS */}
      <AddWorkerModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingWorker(null);
        }}
        onSave={handleSaveWorker}
        plantationId={activePlantationId}
        initialData={editingWorker}
      />

      <StarRatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRatingWorker(null);
        }}
        worker={ratingWorker}
        plantationId={activePlantationId}
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
        plantationId={activePlantationId}
        showToast={showToast}
      />

      <PlantationActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        plantationId={activePlantationId}
        onSaved={loadRecentActivities}
        showToast={showToast}
      />
    </div>
  );
};

export default SupervisorDashboard;
