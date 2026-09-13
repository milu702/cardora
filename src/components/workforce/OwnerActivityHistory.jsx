import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
} from 'lucide-react';
import apiService from '../../services/api';

const OwnerActivityHistory = ({ supervisorId = '', supervisorName = '', showToast }) => {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [selectedSupervisor, setSelectedSupervisor] = useState(supervisorId);
  const [selectedPlantation, setSelectedPlantation] = useState('');
  const [selectedAction, setSelectedAction] = useState('All');
  const [dateRangePreset, setDateRangePreset] = useState('All'); // All | Today | 7days | 30days | Custom
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Supervisors & Plantations options
  const [supervisorsList, setSupervisorsList] = useState([]);
  const [plantationsList, setPlantationsList] = useState([]);

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch Owner Options (Supervisors and Plantations dropdown options)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await apiService.getOwnerSupervisors();
        if (res && res.success) {
          setSupervisorsList(res.supervisors || []);
          setPlantationsList(res.plantations || []);
        }
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Compute date filter ranges based on presets
  const computeDateRange = (preset) => {
    const now = new Date();
    if (preset === 'Today') {
      const todayStr = now.toISOString().split('T')[0];
      return { from: todayStr, to: todayStr };
    }
    if (preset === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      return { from: past7, to: todayStr };
    }
    if (preset === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      return { from: past30, to: todayStr };
    }
    return { from: dateFrom, to: dateTo };
  };

  const loadActivityLogs = useCallback(async () => {
    setLoading(true);
    try {
      const range = computeDateRange(dateRangePreset);
      const params = {
        page,
        limit: 15,
        supervisorId: selectedSupervisor,
        plantationId: selectedPlantation,
        action: selectedAction,
        dateFrom: range.from,
        dateTo: range.to,
        search: searchQuery,
      };

      const res = await apiService.getOwnerActivityHistory(params);
      if (res && res.success) {
        setLogs(res.logs || []);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error loading activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedSupervisor, selectedPlantation, selectedAction, dateRangePreset, dateFrom, dateTo, searchQuery]);

  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  // Export Activity Report CSV
  const handleExportReport = () => {
    if (logs.length === 0) {
      if (showToast) showToast('No activity logs to export.');
      return;
    }

    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Description', 'Plantation Name', 'Entity Type', 'Metadata JSON'];
    const rows = logs.map((log) => [
      `"${new Date(log.createdAt).toLocaleString()}"`,
      `"${log.actorName || 'Supervisor'}"`,
      `"${log.actorRole || 'supervisor'}"`,
      `"${log.action || ''}"`,
      `"${(log.description || '').replace(/"/g, '""')}"`,
      `"${log.plantationId?.name || 'Plantation'}"`,
      `"${log.entityType || 'General'}"`,
      `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`,
    ]);

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cardora_Activity_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 500);

    if (showToast) showToast('📥 Activity Audit CSV Report exported!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#17331F] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            <span>Central Audit Log</span>
          </span>
          <h1 className="text-2xl font-black mt-1">
            {supervisorName ? `Supervisor Activity: ${supervisorName}` : 'Owner Activity Audit History'}
          </h1>
          <p className="text-xs text-emerald-200/80 mt-1">
            Complete real-time immutable timeline of supervisor, owner, and system actions across plantations
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Activity Report (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            Filter History Records
          </h3>
          <button
            onClick={() => {
              setSelectedSupervisor('');
              setSelectedPlantation('');
              setSelectedAction('All');
              setDateRangePreset('All');
              setDateFrom('');
              setDateTo('');
              setSearchQuery('');
              setPage(1);
            }}
            className="text-xs text-emerald-700 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {/* Supervisor Filter */}
          <div>
            <label className="block text-gray-500 font-bold mb-1">Supervisor</label>
            <select
              value={selectedSupervisor}
              onChange={(e) => {
                setSelectedSupervisor(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white"
            >
              <option value="">All Supervisors</option>
              {supervisorsList.map((assign) => (
                <option key={assign.supervisor?._id || assign._id} value={assign.supervisor?._id || ''}>
                  {assign.supervisor?.name || assign.supervisor?.fullName || 'Supervisor'}
                </option>
              ))}
            </select>
          </div>

          {/* Plantation Filter */}
          <div>
            <label className="block text-gray-500 font-bold mb-1">Plantation</label>
            <select
              value={selectedPlantation}
              onChange={(e) => {
                setSelectedPlantation(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white"
            >
              <option value="">All Plantations</option>
              {plantationsList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-gray-500 font-bold mb-1">Action Type</label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white"
            >
              <option value="All">All Actions</option>
              <option value="ATTENDANCE_MARKED">Attendance Marked</option>
              <option value="WORKER_ADDED">Worker Added</option>
              <option value="WORKER_UPDATED">Worker Updated</option>
              <option value="TASK_COMPLETED">Task Completed</option>
              <option value="PLANTATION_ACTIVITY_CREATED">Plantation Activity</option>
              <option value="WAGE_CREATED">Wage Created</option>
              <option value="SUPERVISOR_INVITATION_ACCEPTED">Invitation Accepted</option>
              <option value="SUPERVISOR_ACCESS_REVOKED">Access Revoked</option>
            </select>
          </div>

          {/* Date Range Preset */}
          <div>
            <label className="block text-gray-500 font-bold mb-1">Time Range</label>
            <select
              value={dateRangePreset}
              onChange={(e) => {
                setDateRangePreset(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="Custom">Custom Dates</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="sm:col-span-2">
            <label className="block text-gray-500 font-bold mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search description, worker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log List & Timeline */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-black text-gray-900 dark:text-white">
            Activity Log Entries ({totalCount})
          </h2>
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading activity audit log...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No supervisor activity recorded yet matching criteria.</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const formattedDate = new Date(log.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = new Date(log.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log._id}
                  onClick={() => {
                    setSelectedLog(log);
                    setShowDetailModal(true);
                  }}
                  className="p-4 bg-gray-50/60 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs flex-shrink-0">
                      {(log.actorRole || 'sup').slice(0, 3).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-gray-900 dark:text-white text-xs">{log.actorName || 'Supervisor'}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                          {log.action}
                        </span>
                        {log.plantationId?.name && (
                          <span className="text-[11px] text-gray-500 font-bold">• Plantation: {log.plantationId.name}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">{log.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 text-xs">
                    <div className="text-right text-[11px] text-gray-400 font-mono">
                      <div>{formattedDate}</div>
                      <div>{formattedTime}</div>
                    </div>
                    <button className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 rounded-xl font-bold disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-bold text-gray-600">Page {page} of {totalPages}</span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-100 rounded-xl font-bold disabled:opacity-50 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden space-y-4">
            <div className="px-6 py-5 bg-[#17331F] text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Activity Audit Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Action:</span>
                  <span className="font-black text-emerald-800 uppercase">{selectedLog.action}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Performed By:</span>
                  <span className="font-bold text-gray-900">{selectedLog.actorName || 'Supervisor'} ({selectedLog.actorRole})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Plantation:</span>
                  <span className="font-bold text-gray-900">{selectedLog.plantationId?.name || 'Cardora Estate'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Timestamp:</span>
                  <span className="font-mono text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h4 className="font-black text-gray-900 dark:text-white mb-1">Description</h4>
                <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200">{selectedLog.description}</p>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white mb-1">Metadata Details</h4>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerActivityHistory;
