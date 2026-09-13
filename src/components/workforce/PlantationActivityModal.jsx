import React, { useState } from 'react';
import { Leaf, Calendar, Layers, FileText, CheckCircle } from 'lucide-react';
import apiService from '../../services/api';

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
    activityType: 'Fertilizer application',
    date: new Date().toISOString().split('T')[0],
    block: 'Main Block',
    description: '',
    materialsUsed: '',
    quantity: '',
    workersInvolved: 5,
    weatherCondition: 'Clear',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      if (showToast) showToast('Please enter a description for the activity.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.recordPlantationActivity({
        ...formData,
        plantationId,
      });

      if (res && res.success) {
        if (showToast) showToast('🎉 Plantation activity recorded successfully!');
        onClose();
        if (onSaved) onSaved();
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to record activity'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden space-y-4">
        {/* Header */}
        <div className="px-6 py-5 bg-[#17331F] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Record Plantation Activity</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Activity Type *</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData((prev) => ({ ...prev, activityType: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white outline-none"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Block / Section Area</label>
              <input
                type="text"
                value={formData.block}
                onChange={(e) => setFormData((prev) => ({ ...prev, block: e.target.value }))}
                placeholder="e.g. Block A, North Plot"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Workers Involved</label>
              <input
                type="number"
                min="0"
                value={formData.workersInvolved}
                onChange={(e) => setFormData((prev) => ({ ...prev, workersInvolved: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Applied 500g organic NPK fertilizer per cardamom clump."
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Materials Used</label>
              <input
                type="text"
                value={formData.materialsUsed}
                onChange={(e) => setFormData((prev) => ({ ...prev, materialsUsed: e.target.value }))}
                placeholder="e.g. Organic NPK, Neem Cake"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g. 250 kg"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantationActivityModal;
