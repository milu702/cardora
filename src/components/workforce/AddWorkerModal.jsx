import React, { useState } from 'react';
import { X, UserPlus, Phone, User, MapPin, Briefcase, IndianRupee, Calendar, AlertCircle } from 'lucide-react';

const AddWorkerModal = ({ isOpen, onClose, onSave, plantationId, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || {
      fullName: '',
      phone: '',
      gender: 'Male',
      address: '',
      workType: 'Capsule Harvesting',
      dailyWage: 700,
      joiningDate: new Date().toISOString().split('T')[0],
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: 'Spouse',
      status: 'Active',
      photo: '',
      sendAssignmentSms: true,
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please enter worker full name');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        plantationId,
        dailyWage: Number(formData.dailyWage) || 700,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-xl rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#17331F] to-[#2C5E3B] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <UserPlus className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{initialData ? 'Edit Worker Profile' : 'Register New Worker'}</h3>
              <p className="text-xs text-emerald-200/80">
                {initialData ? `Worker ID: ${initialData.workerId}` : 'Workers do NOT require login accounts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Worker Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Mobile Number (For SMS)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Work Type / Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Capsule Harvesting">Capsule Harvesting</option>
                  <option value="Shade Pruning">Shade Pruning</option>
                  <option value="Drip & Spraying">Drip & Spraying</option>
                  <option value="Weeding & Tilling">Weeding & Tilling</option>
                  <option value="General Plantation Work">General Plantation Work</option>
                </select>
              </div>
            </div>

            {/* Daily Wage */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Daily Wage (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="dailyWage"
                  value={formData.dailyWage}
                  onChange={handleChange}
                  placeholder="700"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Joining Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Residential Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. House No. 42, Vandanmedu, Idukki"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Emergency Contact Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                placeholder="Contact Person Name"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="Contact Phone"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <input
                type="text"
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleChange}
                placeholder="Relation (e.g. Spouse)"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Send SMS checkbox */}
          {!initialData && (
            <label className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                name="sendAssignmentSms"
                checked={formData.sendAssignmentSms}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <span>Send welcome SMS to registered mobile number automatically</span>
            </label>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : initialData ? 'Update Worker' : 'Register Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;
