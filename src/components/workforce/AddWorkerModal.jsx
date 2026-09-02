import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Phone,
  User,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  HeartHandshake,
  Check,
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'm1', label: 'Worker 1', url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200', gender: 'Male' },
  { id: 'm2', label: 'Worker 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', gender: 'Male' },
  { id: 'f1', label: 'Worker 3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', gender: 'Female' },
  { id: 'f2', label: 'Worker 4', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', gender: 'Female' },
];

const WORK_TYPES = [
  { id: 'Capsule Harvesting', label: 'Capsule Harvesting', icon: '🍇', desc: 'Ripe cardamom capsule picking' },
  { id: 'Shade Pruning', label: 'Shade Pruning', icon: '✂️', desc: 'Overhead shade tree trimming' },
  { id: 'Drip & Spraying', label: 'Drip & Spraying', icon: '💦', desc: 'Foliar nutrition & pesticide' },
  { id: 'Weeding & Tilling', label: 'Weeding & Tilling', icon: '🌿', desc: 'Soil aeration & weed removal' },
  { id: 'General Plantation Work', label: 'General Work', icon: '🚜', desc: 'All-round estate maintenance' },
];

const WAGE_PRESETS = [600, 700, 750, 800, 850, 900, 1000];

const LOCATION_PRESETS = [
  'Vandanmedu, Idukki',
  'Nedumkandam, Idukki',
  'Kattappana, Idukki',
  'Udumbanchola, Idukki',
  'Rajakumari, Idukki',
];

const AddWorkerModal = ({ isOpen, onClose, onSave, plantationId, initialData = null }) => {
  const [formData, setFormData] = useState({
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customWorkTypeActive, setCustomWorkTypeActive] = useState(false);
  const [activeTab, setActiveTab] = useState('primary'); // 'primary' | 'role' | 'contact'

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        gender: initialData.gender || 'Male',
        address: initialData.address || '',
        workType: initialData.workType || 'Capsule Harvesting',
        dailyWage: initialData.dailyWage ?? 700,
        joiningDate: initialData.joiningDate ? initialData.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
        emergencyName: initialData.emergencyContact?.name || initialData.emergencyName || '',
        emergencyPhone: initialData.emergencyContact?.phone || initialData.emergencyPhone || '',
        emergencyRelation: initialData.emergencyContact?.relation || initialData.emergencyRelation || 'Spouse',
        status: initialData.status || 'Active',
        photo: initialData.photo || '',
        sendAssignmentSms: false,
      });

      const isKnownType = WORK_TYPES.some((w) => w.id === initialData.workType);
      setCustomWorkTypeActive(!isKnownType && Boolean(initialData.workType));
    } else {
      setFormData({
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
      });
      setCustomWorkTypeActive(false);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePresetLocation = (loc) => {
    setFormData((prev) => ({ ...prev, address: loc }));
  };

  const handleSelectWorkType = (typeId) => {
    setCustomWorkTypeActive(false);
    setFormData((prev) => ({ ...prev, workType: typeId }));
  };

  const handleSelectAvatar = (avatarUrl) => {
    setFormData((prev) => ({ ...prev, photo: avatarUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = (formData.fullName || '').trim();
    if (!cleanName || cleanName.length < 2) {
      setError('⚠️ Please enter a valid worker full name (at least 2 characters).');
      setActiveTab('primary');
      return;
    }

    const cleanPhone = (formData.phone || '').trim().replace(/[\s-]/g, '');
    if (cleanPhone && !/^[+0-9]{10,14}$/.test(cleanPhone)) {
      setError('⚠️ Please enter a valid 10-digit mobile number (e.g. +91 98470 12345).');
      setActiveTab('primary');
      return;
    }

    const wage = Number(formData.dailyWage);
    if (isNaN(wage) || wage < 100 || wage > 50000) {
      setError('⚠️ Daily wage must be a valid amount between ₹100 and ₹50,000.');
      setActiveTab('role');
      return;
    }

    if (!formData.workType || !formData.workType.trim()) {
      setError('⚠️ Please select or specify a work type / specialization.');
      setActiveTab('role');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        fullName: cleanName,
        phone: cleanPhone,
        plantationId,
        dailyWage: wage,
        emergencyContact: {
          name: (formData.emergencyName || '').trim(),
          phone: (formData.emergencyPhone || '').trim(),
          relation: formData.emergencyRelation || 'Spouse',
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

  const estMonthlyPay = (Number(formData.dailyWage) || 0) * 26;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#111827] w-full max-w-3xl rounded-[28px] shadow-2xl border border-emerald-500/20 dark:border-emerald-500/30 overflow-hidden max-h-[92vh] flex flex-col transition-all">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0F2D18] via-[#17331F] to-[#2C5E3B] text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="p-3 bg-emerald-500/25 rounded-2xl border border-emerald-400/30 shadow-inner flex items-center justify-center text-emerald-300">
              <UserPlus className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight font-poppins text-white">
                  {initialData ? 'Edit Worker Roster Entry' : 'Register Plantation Worker'}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {initialData ? `ID: ${initialData.workerId || 'WRK-01'}` : 'Direct Roster'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5 font-medium">
                Configure field parameters, wage rates, emergency profile, and SMS notification settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION NAVIGATION PILLS */}
        <div className="bg-[#F8FAF7] dark:bg-[#1E293B]/70 px-6 py-2.5 border-b border-emerald-100 dark:border-gray-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'primary', label: '1. Identity & Avatar', icon: User },
              { id: 'role', label: '2. Role & Wage Rates', icon: Briefcase },
              { id: 'contact', label: '3. Address & Emergency', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1F5E3B] text-white shadow-md shadow-emerald-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-100/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className="hidden sm:inline-flex text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
            Est. Monthly Wage: <strong className="ml-1 text-emerald-800 dark:text-emerald-300">₹{estMonthlyPay.toLocaleString()}</strong>
          </span>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
          
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: IDENTITY & AVATAR */}
          {activeTab === 'primary' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name Field */}
                <div>
                  <label className="block text-xs font-black text-[#17331F] dark:text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Worker Full Name <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">Official Name</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Joykutty Joseph"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Mobile Number Field */}
                <div>
                  <label className="block text-xs font-black text-[#17331F] dark:text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Mobile Phone Number</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Send className="w-2.5 h-2.5" /> Direct SMS Alerts
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 text-slate-400 border-r border-slate-300 dark:border-slate-700 pr-2">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">+91</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="98470 12345"
                      className="w-full pl-20 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Gender Segmented Switch */}
                <div>
                  <label className="block text-xs font-black text-[#17331F] dark:text-slate-200 mb-1.5">Gender Selection</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                        className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          formData.gender === g
                            ? 'bg-[#1F5E3B] text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {formData.gender === g && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{g}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Joining Date Field */}
                <div>
                  <label className="block text-xs font-black text-[#17331F] dark:text-slate-200 mb-1.5">Joining Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Avatar Preset Selector */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Worker Profile Picture Avatar</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Click preset or paste custom photo link</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {AVATAR_PRESETS.map((av) => {
                    const isSelected = formData.photo === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleSelectAvatar(av.url)}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                            : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="w-12 h-12 object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      name="photo"
                      value={formData.photo}
                      onChange={handleChange}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE & COMPENSATION */}
          {activeTab === 'role' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Work Type / Role Chips Field */}
              <div>
                <label className="block text-xs font-black text-[#17331F] dark:text-slate-200 mb-2 flex items-center justify-between">
                  <span>Work Type / Primary Specialization <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-600 font-bold">Cardamom Field Operation</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  {WORK_TYPES.map((wt) => {
                    const isSelected = !customWorkTypeActive && formData.workType === wt.id;
                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => handleSelectWorkType(wt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 text-[#17331F] dark:text-white'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        <span className="text-xl p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs">{wt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">{wt.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{wt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Work Type Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="workType"
                    value={formData.workType}
                    onChange={(e) => {
                      setCustomWorkTypeActive(true);
                      handleChange(e);
                    }}
                    placeholder="Or type custom specialization (e.g. Nursery Grafting)..."
                    className={`w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold outline-none transition-all ${
                      customWorkTypeActive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Daily Wage Field with Presets */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black text-[#17331F] dark:text-slate-200 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Daily Wage Compensation Rate (₹ / Day) <span className="text-red-500">*</span></span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2.5 py-0.5 rounded-full">
                    Est. ₹{(formData.dailyWage * 26).toLocaleString()} / month
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-emerald-700 dark:text-emerald-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    name="dailyWage"
                    value={formData.dailyWage}
                    onChange={handleChange}
                    placeholder="700"
                    min="100"
                    step="50"
                    required
                    className="w-full pl-8 pr-4 py-2.5 text-sm sm:text-base font-black bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Quick Wage Select Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Wage Select:</span>
                  {WAGE_PRESETS.map((amt) => {
                    const isSelected = Number(formData.dailyWage) === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, dailyWage: amt }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#1F5E3B] text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADDRESS & EMERGENCY */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Residential Address Field */}
              <div>
                <label className="block text-xs font-black text-[#17331F] dark:text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>Residential Address & Panchayath</span>
                  <span className="text-[10px] text-slate-400">Cardamom Plantation Hubs</span>
                </label>

                <div className="relative mb-2">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. House No. 42, Vandanmedu, Idukki, Kerala"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Quick Location Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Quick Locations:</span>
                  {LOCATION_PRESETS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handlePresetLocation(loc)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                    >
                      + {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Contact Container */}
              <div className="p-4 bg-amber-500/10 dark:bg-amber-500/15 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>Emergency Kin Contact Details</span>
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Safety Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleChange}
                      placeholder="e.g. Mary Joseph"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      placeholder="+91 98470 99999"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Relationship</label>
                    <select
                      name="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Relative">Relative / Neighbor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Automatic Assignment SMS Checkbox */}
              {!initialData && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <label className="flex items-center space-x-3 text-xs text-slate-800 dark:text-slate-200 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      name="sendAssignmentSms"
                      checked={formData.sendAssignmentSms}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <span>Automatically send welcome SMS & wage details to registered phone number</span>
                  </label>
                  <Send className="w-4 h-4 text-emerald-600 hidden sm:block" />
                </div>
              )}
            </div>
          )}

          {/* MODAL ACTIONS BAR */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              {activeTab !== 'primary' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'contact' ? 'role' : 'primary')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ← Back
                </button>
              )}
              {activeTab !== 'contact' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'primary' ? 'role' : 'contact')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors"
                >
                  Next Step →
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 hover:from-emerald-700 hover:to-green-800 shadow-lg shadow-emerald-700/25 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <span>Saving Entry...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{initialData ? 'Update Worker Entry' : 'Register & Save Worker'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;
