import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, Calendar, MapPin, CheckCircle, XCircle, User, Clock, AlertTriangle, Lock } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token.');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      setLoading(true);
      try {
        const res = await apiService.getInvitationByToken(token);
        if (res && res.success && res.invitation) {
          setInvitation(res.invitation);
        } else {
          setError(res?.message || 'Invalid or expired invitation token.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load invitation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiService.acceptSupervisorInvitation(token, { password, name });
      if (res && res.success) {
        if (showToast) showToast('🎉 Invitation accepted! Welcome to Supervisor Portal.');
        navigate('/dashboard?tab=workforce');
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to accept invitation'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to decline this supervisor invitation?')) return;
    setSubmitting(true);
    try {
      const res = await apiService.rejectSupervisorInvitation(token);
      if (res && res.success) {
        if (showToast) showToast('Invitation declined.');
        navigate('/');
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to reject invitation'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1F5E3B] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-[#1F5E3B]">Loading Invitation Details...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100 space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-gray-900">Invitation Expired or Invalid</h2>
          <p className="text-sm text-gray-600">{error || 'This invitation token is invalid or has already been used.'}</p>
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="px-6 py-2.5 bg-[#1F5E3B] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#17331F]"
          >
            Go to Login Portal
          </button>
        </div>
      </div>
    );
  }

  const permissions = invitation.permissions || {};
  const isExpired = invitation.status === 'Expired' || new Date() > new Date(invitation.expiresAt);

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-4 py-12">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#17331F] via-[#2C5E3B] to-[#17331F] p-8 text-white text-center space-y-2">
          <div className="flex justify-center items-center gap-2">
            <Leaf className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-black tracking-tight">CARDORA</h1>
          </div>
          <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Smart Agriculture Portal</p>
          <h2 className="text-xl font-bold text-white pt-3">You have been invited to supervise a plantation.</h2>
        </div>

        {/* Body Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 text-xs">
            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Estate Owner:</span>
              <p className="font-extrabold text-gray-900 flex items-center gap-1.5 text-sm">
                <User className="w-4 h-4 text-emerald-700" />
                {invitation.owner?.fullName || invitation.owner?.name || 'Cardora Planter'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Plantation Estate:</span>
              <p className="font-extrabold text-gray-900 flex items-center gap-1.5 text-sm">
                <Leaf className="w-4 h-4 text-emerald-700" />
                {invitation.plantation?.name || invitation.plantationName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Location:</span>
              <p className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                {invitation.plantation?.location || 'Idukki, Kerala'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Invitation Expiry:</span>
              <p className="font-extrabold text-amber-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {invitation.message && (
            <div className="p-4 bg-gray-50 rounded-xl text-xs italic text-gray-700 border-l-4 border-emerald-600">
              "{invitation.message}"
            </div>
          )}

          {/* Assigned Permissions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Assigned Permissions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { key: 'workersManagement', label: 'Workers Management' },
                { key: 'attendanceManagement', label: 'Attendance Management' },
                { key: 'taskManagement', label: 'Task Management' },
                { key: 'activityManagement', label: 'Activity Management' },
                { key: 'wageManagement', label: 'Wage Management' },
                { key: 'plantationReports', label: 'Plantation Reports' },
                { key: 'weatherView', label: 'Weather View' },
                { key: 'plantationDataView', label: 'Plantation Data' },
                { key: 'messaging', label: 'Messaging System' },
              ].map((perm) => {
                const isEnabled = permissions[perm.key] !== false;
                return (
                  <div
                    key={perm.key}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2 font-bold ${
                      isEnabled
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-gray-50 border-gray-200 text-gray-400 line-through'
                    }`}
                  >
                    {isEnabled ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{perm.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Details if not logged in */}
          {!user && (
            <form onSubmit={handleAccept} className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-black uppercase text-gray-700">Set Up Your Supervisor Account</h3>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supervisor Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Mathew"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </form>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReject}
              disabled={submitting || isExpired}
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Reject Invitation
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={submitting || isExpired}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Processing...' : 'Accept Invitation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
