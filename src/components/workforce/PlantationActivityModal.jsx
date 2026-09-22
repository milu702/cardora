import React, { useState } from 'react';
import { Leaf, Calendar, Layers, FileText, CheckCircle, Clock } from 'lucide-react';
import apiService from '../../services/api';
import FullScreenFormModal from '../ui/FullScreenFormModal';

const ACTIVITY_TYPES = [
  'Fertilizer application',
  'Irrigation',
  'Weeding',
  'Mulching',
  'Pest control',
  'Disease treatment',
  'Shade management',
  'Harvesting',
  'Cleaning',
  'Soil testing',
  'Plant inspection',
  'Other',
];

const PlantationActivityModal = ({ isOpen, onClose, plantationId, onSaved, showToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    activityType: 'Fertilizer application',
    description: '',
    quantity: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      const msg = 'Please enter an activity title';
      if (showToast) showToast(msg, 'error');
      else alert(msg);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        plantationId: plantationId || undefined,
        title: formData.title.trim(),
        activityType: formData.activityType,
        type: formData.activityType,
        description: formData.description.trim() || formData.title.trim(),
        quantity: formData.quantity.trim(),
      };

      const res = await apiService.logPlantationActivity(payload);
      if (res && res.success) {
        const msg = 'Plantation activity logged successfully!';
        if (showToast) showToast(msg);
        else alert(msg);
        if (onSaved) onSaved(res.activity || res);
        onClose();
      } else {
        const errMsg = res?.message || 'Failed to log activity';
        if (showToast) showToast(errMsg, 'error');
        else alert(errMsg);
      }
    } catch (err) {
      const errMsg = err?.message || 'Error logging activity';
      if (showToast) showToast(errMsg, 'error');
      else alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const rightActivityPreview = (
    <div className="space-y-4 font-sans">
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#D7E6D5] dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-black uppercase text-[#1F5E3B] dark:text-emerald-400 flex items-center gap-1.5">
            <Leaf className="w-4 h-4" />
            Activity Log Summary
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            FIELD LOG ENTRY
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Activity Category:</span>
            <strong className="text-[#17331F] dark:text-emerald-300 font-bold">{formData.activityType}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Entry Title:</span>
            <strong className="text-slate-900 dark:text-white font-extrabold truncate max-w-[160px]">
              {formData.title || 'Untitled Log'}
            </strong>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-medium">Logged Date:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#1F5E3B]" />
              Today
            </strong>
          </div>
        </div>
      </div>
    </div>
  );

  const footerActions = (
    <div className="w-full flex items-center justify-between gap-3 font-sans">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs sm:text-sm cursor-pointer transition"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95"
      >
        <CheckCircle className="w-4 h-4" />
        <span>{submitting ? 'Saving Log...' : 'Save Activity Log'}</span>
      </button>
    </div>
  );

  return (
    <FullScreenFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Plantation Field Activity"
      subtitle="Log field work, fertigation tasks, harvesting, or crop care telemetry to plantation history"
      badgeText="PLANTATION ACTIVITY LOG"
      badgeIcon={Leaf}
      rightPanel={rightActivityPreview}
      footerActions={footerActions}
    >
      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#D7E6D5] dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">
              Activity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Bio-N P K Fertigation Application — Plot 2"
              className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-sm font-bold text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">
                Activity Category
              </label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData((prev) => ({ ...prev, activityType: e.target.value }))}
                className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#17331F] dark:text-white"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">
                Quantity / Dosage (Optional)
              </label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g. 250 kg or 50 Liters"
                className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#17331F] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">
              Activity Description & Field Observations
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter field notes, fertilizer ratio, worker observations, weather conditions..."
              className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-medium text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
            />
          </div>
        </div>
      </form>
    </FullScreenFormModal>
  );
};

export default PlantationActivityModal;
