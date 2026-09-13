import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Eye,
  Activity,
  RefreshCw,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import apiService from '../../services/api';

const OwnerSupervisorManagement = ({ showToast, onViewActivity, onViewProfile }) => {
  const [data, setData] = useState({ supervisors: [], invitations: [], plantations: [] });
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  // Add Supervisor Form State
  const [addForm, setAddForm] = useState({
    email: '',
    plantationId: '',
    message: '',
    permissions: {
      workersManagement: true,
      attendanceManagement: true,
      taskManagement: true,
      activityManagement: true,
      wageManagement: true,
      plantationReports: true,
      weatherView: true,
      plantationDataView: true,
      messaging: true,
    },
  });

  // Edit Permissions Form State
  const [editPermissions, setEditPermissions] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reassign Plantation Form State
  const [targetPlantationId, setTargetPlantationId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getOwnerSupervisors();
      if (res && res.success) {
        setData({
          supervisors: res.supervisors || [],
          invitations: res.invitations || [],
          plantations: res.plantations || [],
        });
        if (res.plantations?.length > 0 && !addForm.plantationId) {
          setAddForm((prev) => ({ ...prev, plantationId: res.plantations[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error loading owner supervisors data:', err);
    } finally {
      setLoading(false);
    }
  }, [addForm.plantationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Send Invitation
  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!addForm.email.trim()) {
      if (showToast) showToast('Please enter a supervisor email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.sendSupervisorInvitation(addForm);
      if (res && res.success) {
        if (showToast) showToast(`🎉 Invitation sent to ${addForm.email}`);
        setShowAddModal(false);
        setAddForm({
          email: '',
          plantationId: data.plantations[0]?._id || '',
          message: '',
          permissions: {
            workersManagement: true,
            attendanceManagement: true,
            taskManagement: true,
            activityManagement: true,
            wageManagement: true,
            plantationReports: true,
            weatherView: true,
            plantationDataView: true,
            messaging: true,
          },
        });
        loadData();
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to send invitation'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Save Permissions
  const handleSavePermissions = async (e) => {
    e.preventDefault();
    if (!selectedSupervisor) return;
    setSubmitting(true);
    try {
      const res = await apiService.updateSupervisorPermissions(selectedSupervisor._id, {
        permissions: editPermissions,
        plantationId: selectedSupervisor.plantation?._id,
      });

      if (res && res.success) {
        if (showToast) showToast('🎉 Permissions updated successfully!');
        setShowPermModal(false);
        setSelectedSupervisor(null);
        loadData();
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to update permissions'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Revoke Access
  const handleRevoke = async (supervisorAssignId, supervisorName) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${supervisorName}? Historical activity logs will be preserved!`)) return;

    try {
      const res = await apiService.revokeSupervisorAccess(supervisorAssignId);
      if (res && res.success) {
        if (showToast) showToast('Access revoked. Historical logs preserved.');
        loadData();
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to revoke access'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    }
  };

  // Handle Reassign Plantation
  const handleReassign = async (e) => {
    e.preventDefault();
    if (!selectedSupervisor || !targetPlantationId) return;
    setSubmitting(true);
    try {
      const res = await apiService.reassignSupervisor(selectedSupervisor._id, {
        newPlantationId: targetPlantationId,
      });

      if (res && res.success) {
        if (showToast) showToast('🎉 Supervisor reassigned successfully!');
        setShowReassignModal(false);
        setSelectedSupervisor(null);
        loadData();
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to reassign supervisor'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const activeSupervisorsCount = data.supervisors.filter((s) => s.status === 'Active').length;
  const pendingInvitationsCount = data.invitations.filter((i) => i.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#17331F] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Owner Dashboard — Supervisors</span>
          </span>
          <h1 className="text-2xl font-black mt-1">Supervisor Roster & Permissions</h1>
          <p className="text-xs text-emerald-200/80 mt-1">
            Manage assigned supervisors, invitation status, customizable permission flags, and activity history
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Supervisor</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
          <span className="text-xs font-bold text-gray-500 uppercase">Active Supervisors</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeSupervisorsCount}</p>
          <span className="text-[10px] text-gray-400">Assigned & Supervising</span>
        </div>

        <div className="p-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
          <span className="text-xs font-bold text-gray-500 uppercase">Pending Invitations</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{pendingInvitationsCount}</p>
          <span className="text-[10px] text-gray-400">Awaiting Acceptance</span>
        </div>

        <div className="p-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-md">
          <span className="text-xs font-bold text-gray-500 uppercase">Assigned Plantations</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{data.plantations.length}</p>
          <span className="text-[10px] text-gray-400">Plantation Estates</span>
        </div>
      </div>

      {/* Assigned Supervisors Table/Cards */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Assigned Supervisors ({data.supervisors.length})
        </h2>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Loading supervisor roster...</div>
        ) : data.supervisors.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-3">
            <p className="text-sm font-bold">No supervisors assigned yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              + Add Supervisor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.supervisors.map((assign) => {
              const sup = assign.supervisor || {};
              const plantation = assign.plantation || {};
              const perms = assign.permissions || {};
              const isActive = assign.status === 'Active';

              return (
                <div
                  key={assign._id}
                  className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                          {sup.name ? sup.name.slice(0, 2).toUpperCase() : 'SV'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white">{sup.fullName || sup.name || 'Supervisor'}</h4>
                          <p className="text-xs text-gray-500">{sup.email}</p>
                          <p className="text-xs text-emerald-700 font-bold mt-0.5">🌱 Plantation: {plantation.name || 'Estate'}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {assign.status}
                      </span>
                    </div>

                    {/* Permissions Badges */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {Object.entries(perms).map(([key, value]) => (
                        <span
                          key={key}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${
                            value
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                          }`}
                        >
                          {key.replace(/Management|View/, '')}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 text-[11px] text-gray-400 flex items-center justify-between">
                      <span>Assigned: {new Date(assign.assignedAt).toLocaleDateString()}</span>
                      <span>Last: {assign.lastActivityAction || 'Active'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                    <button
                      onClick={() => onViewActivity && onViewActivity(sup._id, sup.name)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>View Activity</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSupervisor(assign);
                        setEditPermissions(assign.permissions || {});
                        setShowPermModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Permissions</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSupervisor(assign);
                        setShowReassignModal(true);
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reassign</span>
                    </button>

                    <button
                      onClick={() => handleRevoke(assign._id, sup.name)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      title="Revoke Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Invitations Table */}
      {data.invitations.length > 0 && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-500" />
            Pending Invitations ({data.invitations.length})
          </h2>

          <div className="space-y-2">
            {data.invitations.map((inv) => (
              <div
                key={inv._id}
                className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 flex items-center justify-between text-xs gap-3"
              >
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{inv.email}</h4>
                  <p className="text-gray-500">Plantation: {inv.plantationName || inv.plantation?.name}</p>
                  <p className="text-[10px] text-amber-700">Expires: {new Date(inv.expiresAt).toLocaleDateString()}</p>
                </div>

                <span
                  className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                    inv.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Supervisor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 bg-[#17331F] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Send Supervisor Email Invitation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvitation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Supervisor Email *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="supervisor@example.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Select Plantation *</label>
                <select
                  value={addForm.plantationId}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, plantationId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                >
                  {data.plantations.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.location || 'Idukki'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Custom Invitation Message</label>
                <textarea
                  rows="2"
                  value={addForm.message}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Add a welcome message for the supervisor..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                ></textarea>
              </div>

              {/* Permissions Checkboxes */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Configure Allowed Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-xl border">
                  {Object.keys(addForm.permissions).map((permKey) => (
                    <label key={permKey} className="flex items-center space-x-2 font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addForm.permissions[permKey]}
                        onChange={(e) =>
                          setAddForm((prev) => ({
                            ...prev,
                            permissions: { ...prev.permissions, [permKey]: e.target.checked },
                          }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{permKey.replace(/Management|View/, '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showPermModal && selectedSupervisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 bg-[#17331F] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Supervisor Permissions</h3>
              <button onClick={() => setShowPermModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="p-6 space-y-4 text-xs">
              <p className="font-bold text-gray-700">
                Updating permissions for: <span className="text-emerald-700">{selectedSupervisor.supervisor?.name}</span>
              </p>

              <div className="space-y-2 p-3 bg-gray-50 rounded-xl border">
                {Object.keys(editPermissions).map((permKey) => (
                  <label key={permKey} className="flex items-center justify-between p-1.5 font-bold text-gray-700 cursor-pointer border-b border-gray-100 last:border-0">
                    <span>{permKey.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(editPermissions[permKey])}
                      onChange={(e) =>
                        setEditPermissions((prev) => ({
                          ...prev,
                          [permKey]: e.target.checked,
                        }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPermModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Plantation Modal */}
      {showReassignModal && selectedSupervisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 bg-[#17331F] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Reassign Plantation</h3>
              <button onClick={() => setShowReassignModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleReassign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select New Plantation *</label>
                <select
                  required
                  value={targetPlantationId}
                  onChange={(e) => setTargetPlantationId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                >
                  <option value="">Select Plantation...</option>
                  {data.plantations.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.location || 'Idukki'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !targetPlantationId}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerSupervisorManagement;
