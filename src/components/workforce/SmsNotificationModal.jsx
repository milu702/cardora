import React, { useState, useEffect } from 'react';
import { X, Send, Settings, MessageSquare } from 'lucide-react';
import apiService from '../../services/api';

const SmsNotificationModal = ({ isOpen, onClose, workers = [], showToast }) => {
  const [activeTab, setActiveTab] = useState('send'); // send | settings
  const [selectedWorker, setSelectedWorker] = useState(workers[0] || null);
  const [smsType, setSmsType] = useState('Attendance');
  const [settings, setSettings] = useState({
    attendanceSMS: true,
    wageSMS: true,
    paymentSMS: true,
    workAssignmentSMS: true,
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isOpen) return;
      try {
        const res = await apiService.getSmsSettings();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Error fetching SMS settings:', err);
      }
    };

    loadSettings();
  }, [isOpen]);

  useEffect(() => {
    if (workers.length > 0 && !selectedWorker) {
      setSelectedWorker(workers[0]);
    }
  }, [workers, selectedWorker]);

  if (!isOpen) return null;

  const getTemplatePreview = () => {
    const name = selectedWorker?.fullName || 'Worker Name';
    switch (smsType) {
      case 'Attendance':
        return `Hello ${name}, your attendance for ${new Date().toLocaleDateString()} has been marked as Present. Daily wage: ₹${selectedWorker?.dailyWage || 700}. – Cardora`;
      case 'Wage':
        return `Hello ${name}, your wage for this month is ₹14,000. Paid: ₹10,000. Pending: ₹4,000. – Cardora`;
      case 'Payment':
        return `Hello ${name}, ₹700 has been recorded as your wage payment on ${new Date().toLocaleDateString()}. – Cardora`;
      case 'WorkAssignment':
        return `Hello ${name}, you have been assigned ${selectedWorker?.workType || 'Capsule Harvesting'} at Cardora Plantation on ${new Date().toLocaleDateString()}. – Cardora`;
      default:
        return `Hello ${name}, update from Cardora Plantation. – Cardora`;
    }
  };

  const handleSendSms = async (e) => {
    e.preventDefault();
    if (!selectedWorker) {
      if (showToast) showToast('⚠️ Select a worker first');
      return;
    }

    setSending(true);
    try {
      const res = await apiService.sendSupervisorWorkerSms({
        workerId: selectedWorker._id,
        type: smsType,
        data: {
          workType: selectedWorker.workType,
          dailyWage: selectedWorker.dailyWage,
          date: new Date().toLocaleDateString(),
        },
      });

      if (res.success) {
        if (showToast) showToast(`📱 SMS dispatched to ${selectedWorker.phone || selectedWorker.fullName}`);
      } else {
        if (showToast) showToast(`⚠️ ${res.message}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error sending SMS: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleToggleSetting = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await apiService.updateSmsSettings(updated);
      if (showToast) showToast('Settings updated');
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#17331F] to-[#2C5E3B] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <Send className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Worker SMS Notifications</h3>
              <p className="text-xs text-emerald-200/80">Send automated & manual SMS to workers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'send'
                ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-[#1E293B]'
                : 'border-transparent text-gray-500'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-[#1E293B]'
                : 'border-transparent text-gray-500'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>SMS Settings (ON/OFF)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'send' ? (
            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Select Target Worker:
                </label>
                <select
                  value={selectedWorker?._id || ''}
                  onChange={(e) => {
                    const w = workers.find((item) => item._id === e.target.value);
                    setSelectedWorker(w);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                >
                  {workers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.fullName} ({w.workerId}) - Mobile: {w.phone || 'No phone'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Notification Type:
                </label>
                <select
                  value={smsType}
                  onChange={(e) => setSmsType(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                >
                  <option value="Attendance">Attendance Notification</option>
                  <option value="Wage">Monthly Wage Summary</option>
                  <option value="Payment">Payment Receipt</option>
                  <option value="WorkAssignment">Work Assignment Notice</option>
                </select>
              </div>

              {/* Message Template Live Preview */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Live SMS Template Preview
                </span>
                <p className="text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200">
                  "{getTemplatePreview()}"
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending SMS...' : 'Dispatch SMS'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Settings Tab */
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Toggle automatic SMS notifications sent to worker mobile numbers:
              </p>

              {[
                { key: 'attendanceSMS', label: 'Attendance SMS', desc: 'Auto-send SMS when daily attendance is saved' },
                { key: 'wageSMS', label: 'Wage SMS', desc: 'Auto-send monthly wage updates' },
                { key: 'paymentSMS', label: 'Payment SMS', desc: 'Auto-send receipt SMS when payment is recorded' },
                { key: 'workAssignmentSMS', label: 'Work Assignment SMS', desc: 'Auto-send SMS when worker is assigned tasks' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.label}</h4>
                    <p className="text-[11px] text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting(item.key)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings[item.key] ? 'bg-emerald-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsNotificationModal;
