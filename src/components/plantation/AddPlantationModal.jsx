import React, { useState, useEffect, useRef } from 'react';
import { Leaf, MapPin, Database, Droplets, Cpu, CheckCircle, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { CARDAMOM_SUITABLE_DISTRICTS, CARDAMOM_PLANTATION_PLACES } from '../../utils/districts';
import { SOIL_TYPES } from '../../utils/soilTypes';
import FullScreenFormModal from '../ui/FullScreenFormModal';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AddPlantationModal = ({ isOpen, onClose, onSave, editingPlantation = null }) => {

  const [activeSection, setActiveSection] = useState('basic'); // 'basic' | 'crop' | 'soil' | 'irrigation' | 'sensor'
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const presetPhotos = [
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
  ];

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const token = localStorage.getItem('cardora_token') || localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      const { data } = await axios.post(`${API_BASE}/plantations/upload`, formDataUpload, config);

      if (data.success && data.imageUrl) {
        setFormData((prev) => ({ ...prev, image: data.imageUrl }));
      } else {
        throw new Error('Upload response did not return valid URL');
      }
    } catch (err) {
      console.warn('Backend upload fallback to FileReader base64:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    district: 'Idukki, Kerala',
    taluk: 'Udumbanchola',
    village: 'Vandanmedu',
    address: '',
    pincode: '685551',
    latitude: 9.85,
    longitude: 76.97,
    area: 5.0,
    altitude: 950,
    image: '',
    variety: 'Njallani',
    customVariety: '',
    plantingYear: 2021,
    plantsCount: 1750,
    plantAge: '3.5 Years',
    soilType: 'Loamy Forest Soil',
    ph: 6.2,
    nitrogen: 140,
    phosphorus: 45,
    potassium: 180,
    organicCarbon: 1.8,
    moisture: 72,
    irrigation: 'Drip',
    sensorId: 'SENSOR-IDK-01',
    sensorMoisture: 72,
    gpsEnabled: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingPlantation) {
      const p = editingPlantation;
      setFormData({
        name: p.name || '',
        ownerName: p.ownerName || '',
        district: p.district || p.location || 'Idukki, Kerala',
        taluk: p.taluk || 'Udumbanchola',
        village: p.village || 'Vandanmedu',
        address: p.address || '',
        pincode: p.pincode || '685551',
        latitude: p.latitude || 9.85,
        longitude: p.longitude || 76.97,
        area: p.area || 5.0,
        altitude: p.altitude || 950,
        image: p.image || (p.images && p.images[0]) || '',
        variety: p.variety || 'Njallani',
        customVariety: '',
        plantingYear: p.plantingYear || 2021,
        plantsCount: p.plantsCount || 1750,
        plantAge: p.plantAge || '3.5 Years',
        soilType: p.soil?.soilType || 'Loamy Forest Soil',
        ph: p.soil?.ph ?? p.soilPh ?? 6.2,
        nitrogen: p.soil?.npk?.n ?? p.npk?.n ?? 140,
        phosphorus: p.soil?.npk?.p ?? p.npk?.p ?? 45,
        potassium: p.soil?.npk?.k ?? p.npk?.k ?? 180,
        organicCarbon: p.soil?.organicCarbon ?? 1.8,
        moisture: p.soil?.moisture ?? p.moisture ?? 72,
        irrigation: p.irrigation || 'Drip',
        sensorId: p.sensor?.sensorId || 'SENSOR-IDK-01',
        sensorMoisture: p.sensor?.currentMoisture ?? 72,
        gpsEnabled: p.sensor?.gpsEnabled !== undefined ? p.sensor.gpsEnabled : true,
      });
    } else {
      setFormData({
        name: '',
        ownerName: '',
        district: 'Idukki, Kerala',
        taluk: 'Udumbanchola',
        village: 'Vandanmedu',
        address: '',
        pincode: '685551',
        latitude: 9.85,
        longitude: 76.97,
        area: 5.0,
        altitude: 950,
        image: '',
        variety: 'Njallani',
        customVariety: '',
        plantingYear: 2021,
        plantsCount: 1750,
        plantAge: '3.5 Years',
        soilType: 'Loamy Forest Soil',
        ph: 6.2,
        nitrogen: 140,
        phosphorus: 45,
        potassium: 180,
        organicCarbon: 1.8,
        moisture: 72,
        irrigation: 'Drip',
        sensorId: `SENSOR-IDK-${Math.floor(10 + Math.random() * 90)}`,
        sensorMoisture: 72,
        gpsEnabled: true,
      });
    }
    setErrors({});
  }, [editingPlantation, isOpen]);

  const validateField = (fieldName, fieldValue) => {
    let err = '';
    const val = String(fieldValue || '').trim();

    switch (fieldName) {
      case 'name':
        if (!val) {
          err = 'Plantation Name is required.';
        } else if (val.length < 2) {
          err = 'Plantation Name must be at least 2 characters.';
        }
        break;

      case 'ownerName':
        // Optional or standard text
        break;

      case 'taluk':
        // Optional or standard text
        break;

      case 'village':
        // Optional or standard text
        break;

      case 'pincode':
        if (val && !/^\d{6}$/.test(val)) {
          err = 'Pincode must be exactly 6 digits (e.g. 685551).';
        }
        break;

      case 'area':
        if (!fieldValue || Number(fieldValue) <= 0) {
          err = 'Area must be a valid positive number in Acres (e.g. 5.0).';
        }
        break;

      case 'plantingYear':
        if (fieldValue && (Number(fieldValue) < 1950 || Number(fieldValue) > 2026)) {
          err = 'Planting Year must be between 1950 and 2026.';
        }
        break;

      case 'plantsCount':
        if (fieldValue && Number(fieldValue) <= 0) {
          err = 'Total plant count must be greater than 0.';
        }
        break;

      case 'ph':
        if (fieldValue && (Number(fieldValue) < 3.0 || Number(fieldValue) > 10.0)) {
          err = 'Soil pH must be between 3.0 and 10.0.';
        }
        break;

      case 'moisture':
        if (fieldValue && (Number(fieldValue) < 0 || Number(fieldValue) > 100)) {
          err = 'Soil Moisture must be between 0% and 100%.';
        }
        break;

      default:
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: finalVal,
      };

      // ⚡ AUTO-CALCULATE AVERAGE PLANT AGE FROM PLANTING YEAR
      if (name === 'plantingYear' && value) {
        const year = Number(value);
        const currentYear = new Date().getFullYear(); // 2026
        if (year >= 1950 && year <= currentYear) {
          const age = Math.max(0.5, currentYear - year);
          updated.plantAge = `${age} Years`;
        }
      }

      // ⚡ AUTO-CALCULATE ESTIMATED PLANT COUNT FROM AREA (350 plants per acre)
      if (name === 'area' && value && Number(value) > 0) {
        const acres = Number(value);
        updated.plantsCount = Math.round(acres * 350);
      }

      return updated;
    });

    const fieldError = validateField(name, finalVal);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleDistrictChange = (e) => {
    const selDist = e.target.value;
    const places = CARDAMOM_PLANTATION_PLACES[selDist] || CARDAMOM_PLANTATION_PLACES['Idukki, Kerala'];
    const defPlace = places[0];

    setFormData((prev) => ({
      ...prev,
      district: selDist,
      village: defPlace.village,
      taluk: defPlace.taluk,
      pincode: defPlace.pincode,
      altitude: defPlace.altitude,
      latitude: defPlace.lat,
      longitude: defPlace.lng,
    }));
    setErrors((prev) => ({ ...prev, district: '', village: '', taluk: '', pincode: '' }));
  };

  const handlePlaceChange = (e) => {
    const val = e.target.value;
    const places = CARDAMOM_PLANTATION_PLACES[formData.district] || CARDAMOM_PLANTATION_PLACES['Idukki, Kerala'];
    const found = places.find((p) => p.village === val);

    if (found) {
      setFormData((prev) => ({
        ...prev,
        village: found.village,
        taluk: found.taluk,
        pincode: found.pincode,
        altitude: found.altitude,
        latitude: found.lat,
        longitude: found.lng,
      }));
    } else {
      setFormData((prev) => ({ ...prev, village: val }));
    }
    setErrors((prev) => ({ ...prev, village: '', taluk: '', pincode: '' }));
  };


  const validate = () => {
    const errs = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) errs[key] = errorMsg;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setActiveSection('basic');
      return;
    }
    const finalVariety = formData.variety === 'Custom Variety' ? (formData.customVariety || 'Custom Cardamom') : formData.variety;
    onSave({
      ...formData,
      area: Number(formData.area),
      latitude: Number(formData.latitude) || 9.85,
      longitude: Number(formData.longitude) || 76.97,
      altitude: Number(formData.altitude) || 950,
      plantingYear: Number(formData.plantingYear) || 2021,
      plantsCount: Number(formData.plantsCount) || 1750,
      ph: Number(formData.ph) || 6.2,
      nitrogen: Number(formData.nitrogen) || 140,
      phosphorus: Number(formData.phosphorus) || 45,
      potassium: Number(formData.potassium) || 180,
      organicCarbon: Number(formData.organicCarbon) || 1.8,
      moisture: Number(formData.moisture) || 72,
      variety: finalVariety,
    });
    onClose();
  };



  if (!isOpen) return null;

  const sectionKeys = ['basic', 'crop', 'soil', 'irrigation', 'sensor'];
  const currentStepIndex = sectionKeys.indexOf(activeSection) + 1;

  // RIGHT SIDE PANEL PREVIEW
  const rightPreviewPanel = (
    <div className="space-y-4 font-sans">
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#D7E6D5] dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-black uppercase text-[#1F5E3B] dark:text-emerald-400 flex items-center gap-1.5">
            <Leaf className="w-4 h-4" />
            Live Estate Telemetry Summary
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {editingPlantation ? 'EDITING RECORD' : 'NEW REGISTRATION'}
          </span>
        </div>

        {/* Plantation Cover Preview Image */}
        <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700">
          <img
            src={formData.image || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80'}
            alt="Estate Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 mb-0.5">
              <MapPin className="w-3 h-3" />
              📍 {formData.village || 'Vandanmedu'}, {formData.district}
            </span>
            <h4 className="text-sm font-black truncate">{formData.name || 'Cardamom Estate'}</h4>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-center">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Area</span>
            <span className="text-xs font-black text-[#17331F] dark:text-slate-200">
              {formData.area || 5.0} Acres
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Cultivation Variety</span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 truncate block">
              {formData.variety === 'Custom' ? formData.customVariety || 'Custom' : formData.variety || 'Njallani'}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Soil Classification</span>
            <span className="text-xs font-black text-[#17331F] dark:text-slate-200 truncate block">
              {formData.soilType || 'Loamy Forest Soil'}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Soil pH & Moisture</span>
            <span className="text-xs font-black text-[#1F5E3B] dark:text-emerald-400 block">
              pH {formData.ph || 6.2} • {formData.moisture || 72}%
            </span>
          </div>
        </div>

        {/* Telemetry Highlights */}
        <div className="p-3.5 rounded-2xl bg-[#EAF3E8] dark:bg-emerald-950/40 border border-[#5C8D4E]/30 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Estimated Plants:</span>
            <strong className="text-slate-900 dark:text-white font-black">
              {Math.round((Number(formData.area) || 5) * (Number(formData.plantsPerAcre) || 400))} Plants
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Irrigation Method:</span>
            <strong className="text-emerald-800 dark:text-emerald-300 font-bold">
              {formData.irrigationType || 'Micro-Drip System'}
            </strong>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#5C8D4E]/20">
            <span className="text-slate-700 dark:text-slate-300 font-bold">IoT Telemetry Node:</span>
            <strong className="text-[#17331F] dark:text-emerald-300 font-mono text-[11px]">
              {formData.sensorId || 'CARDORA-S-882'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );

  // STICKY FOOTER ACTIONS
  const footerActions = (
    <div className="w-full flex items-center justify-between gap-3 font-sans">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span>Section {currentStepIndex} of 5</span>
      </div>

      <div className="flex items-center gap-3">
        {activeSection !== 'basic' && (
          <button
            type="button"
            onClick={() => {
              const idx = sectionKeys.indexOf(activeSection);
              if (idx > 0) setActiveSection(sectionKeys[idx - 1]);
            }}
            className="px-4 py-2.5 rounded-xl border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-slate-200 text-xs font-bold hover:bg-[#F8FAF7] dark:hover:bg-slate-800 cursor-pointer transition"
          >
            Back
          </button>
        )}

        {activeSection !== 'sensor' && (
          <button
            type="button"
            onClick={() => {
              const idx = sectionKeys.indexOf(activeSection);
              if (idx < sectionKeys.length - 1) setActiveSection(sectionKeys[idx + 1]);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#5C8D4E] hover:bg-[#1F5E3B] text-white text-xs font-bold shadow-xs cursor-pointer transition"
          >
            Next Section →
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#17331F] text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <CheckCircle className="w-4 h-4 text-[#C9A227]" />
          <span>{editingPlantation ? 'Save Plantation Changes' : 'Register Plantation'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <FullScreenFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPlantation ? 'Edit Plantation Record' : 'Register New Cardamom Plantation'}
      subtitle="Complete estate location, cultivation parameters, soil chemistry, and sensor metadata"
      badgeText="ESTATE TELEMETRY WIZARD"
      badgeIcon={Leaf}
      currentStep={currentStepIndex}
      totalSteps={5}
      steps={['Basic Info', 'Crop Details', 'Soil Metrics', 'Irrigation', 'IoT Sensor']}
      onStepClick={(stepNum) => setActiveSection(sectionKeys[stepNum - 1])}
      rightPanel={rightPreviewPanel}
      footerActions={footerActions}
    >
      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        
        {/* TAB STEP INDICATOR BAR */}
        <div className="bg-white dark:bg-slate-900 border border-[#D7E6D5] dark:border-slate-800 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'basic', label: '1. Basic Info', icon: MapPin },
            { id: 'crop', label: '2. Crop Details', icon: Leaf },
            { id: 'soil', label: '3. Soil Metrics', icon: Database },
            { id: 'irrigation', label: '4. Irrigation', icon: Droplets },
            { id: 'sensor', label: '5. IoT Sensor', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1F5E3B] text-white shadow-xs font-black'
                    : 'text-[#4A5568] dark:text-slate-400 hover:bg-[#DDEFD9]/40 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN SECTION CONTENT CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#D7E6D5] dark:border-slate-800 shadow-sm space-y-5">
          {/* SECTION 1: BASIC INFORMATION */}

            {activeSection === 'basic' && (
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2 pb-2 border-b border-[#D7E6D5]">
                  <MapPin className="w-4 h-4 text-[#5C8D4E]" />
                  Basic Plantation Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">
                      Plantation Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Vandanmedu Green Estate"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border ${
                        errors.name ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5] bg-[#F8FAF7]'
                      } focus:outline-none focus:border-[#1F5E3B]`}
                    />
                    {errors.name && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="e.g. Milu George"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border ${
                        errors.ownerName ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5] bg-[#F8FAF7]'
                      } focus:outline-none focus:border-[#1F5E3B]`}
                    />
                    {errors.ownerName && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.ownerName}</p>}
                  </div>


                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">
                      Cardamom Suitable District <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleDistrictChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    >
                      {CARDAMOM_SUITABLE_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#5C8D4E] font-medium mt-1">
                      High-Altitude micro-climate suitable for Cardamom.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">
                      Cultivation Hub / Place <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="village"
                      value={formData.village}
                      onChange={handlePlaceChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    >
                      {(CARDAMOM_PLANTATION_PLACES[formData.district] || CARDAMOM_PLANTATION_PLACES['Idukki, Kerala']).map((place) => (
                        <option key={place.village} value={place.village}>
                          {place.village} ({place.taluk} Taluk)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Taluk (Auto-filled)</label>
                    <input
                      type="text"
                      name="taluk"
                      value={formData.taluk}
                      onChange={handleChange}
                      placeholder="e.g. Udumbanchola"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border ${
                        errors.taluk ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5] bg-[#F8FAF7]'
                      } focus:outline-none focus:border-[#1F5E3B]`}
                    />
                    {errors.taluk && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.taluk}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Pincode (Auto-filled)</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="685551"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border ${
                        errors.pincode ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5] bg-[#F8FAF7]'
                      } focus:outline-none focus:border-[#1F5E3B]`}
                    />
                    {errors.pincode && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.pincode}</p>}
                  </div>                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">
                      Area (Acres) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    >
                      <option value="0.5">0.5 Acre (Small Holding)</option>
                      <option value="1.0">1.0 Acre</option>
                      <option value="1.5">1.5 Acres</option>
                      <option value="2.0">2.0 Acres</option>
                      <option value="2.5">2.5 Acres</option>
                      <option value="3.0">3.0 Acres</option>
                      <option value="4.0">4.0 Acres</option>
                      <option value="5.0">5.0 Acres (Standard Cardamom Plot)</option>
                      <option value="7.5">7.5 Acres</option>
                      <option value="10.0">10.0 Acres</option>
                      <option value="12.5">12.5 Acres</option>
                      <option value="15.0">15.0 Acres</option>
                      <option value="20.0">20.0 Acres</option>
                      <option value="25.0">25.0 Acres</option>
                      <option value="50.0">50.0+ Acres (Commercial Estate)</option>
                    </select>
                    {errors.area && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.area}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Altitude (Meters)</label>
                    <select
                      name="altitude"
                      value={formData.altitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    >
                      <option value="800">800 m (Mid Elevation)</option>
                      <option value="900">900 m (Optimal Cardamom Elevation)</option>
                      <option value="950">950 m (Vandanmedu Ideal Belt)</option>
                      <option value="1050">1050 m (High Elevation Plot)</option>
                      <option value="1200">1200 m (Peak Cardamom Altitude)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Latitude (°N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="9.8500"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Longitude (°E)</label>
                    <input
                      type="number"
                      step="0.0001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="76.9700"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>

                {/* Plantation Photo Upload & Selector Section */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-[#17331F] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#1F5E3B]" />
                      Plantation Photo & Canopy Image
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Upload or choose preset</span>
                  </label>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  {/* Upload Dropzone Box */}
                  <div
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="border-2 border-dashed border-[#D7E6D5] dark:border-slate-700 hover:border-[#1F5E3B] bg-[#F8FAF7] dark:bg-slate-800/50 hover:bg-emerald-50/50 transition-all rounded-2xl p-4 text-center cursor-pointer group"
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2 text-[#1F5E3B]">
                        <RefreshCw className="w-6 h-6 animate-spin mb-1.5" />
                        <span className="text-xs font-black">Uploading photo to server...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F2E6] text-[#1F5E3B] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-[#17331F] dark:text-white">
                            Click to Upload Plantation Photo
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            JPG, PNG, WEBP — High resolution estate photo
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preset Photos Selection */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 mb-1.5">
                      Or select a high-resolution estate photo preset:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {presetPhotos.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setFormData((prev) => ({ ...prev, image: preset }))}
                          className={`relative h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                            formData.image === preset ? 'border-[#1F5E3B] ring-2 ring-[#1F5E3B]/30 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text URL Input Fallback */}
                  <div className="pt-1">
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: CROP DETAILS */}
            {activeSection === 'crop' && (
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2 pb-2 border-b border-[#D7E6D5]">
                  <Leaf className="w-4 h-4 text-[#5C8D4E]" />
                  Cardamom Crop & Cultivation Parameters
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Cardamom Variety</label>
                    <select
                      name="variety"
                      value={formData.variety}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    >
                      <option value="Njallani">Njallani (High Yield — Green Gold)</option>
                      <option value="Green Gold">Green Gold Hybrid</option>
                      <option value="Vazhukka">Vazhukka (Traditional High Altitude)</option>
                      <option value="Mysore">Mysore Variety</option>
                      <option value="Palakuzhi">Palakuzhi</option>
                      <option value="Custom Variety">Custom Variety</option>
                    </select>
                  </div>

                  {formData.variety === 'Custom Variety' && (
                    <div>
                      <label className="block text-xs font-bold text-[#17331F] mb-1">Specify Custom Variety</label>
                      <input
                        type="text"
                        name="customVariety"
                        value={formData.customVariety}
                        onChange={handleChange}
                        placeholder="e.g. Malabar Hybrid Grade-1"
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">
                      Planting Year <span className="text-[#5C8D4E] text-[10px] font-normal">(Auto-calculates Plant Age)</span>
                    </label>
                    <select
                      name="plantingYear"
                      value={formData.plantingYear}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold border ${
                        errors.plantingYear ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5] bg-[#F8FAF7]'
                      } focus:outline-none focus:border-[#1F5E3B]`}
                    >
                      {Array.from({ length: 35 }, (_, i) => 2026 - i).map((yr) => (
                        <option key={yr} value={yr}>
                          Year {yr} ({2026 - yr} yrs old)
                        </option>
                      ))}
                    </select>
                    {errors.plantingYear && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.plantingYear}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Total Plant Count (Est: 350 / acre)</label>
                    <input
                      type="number"
                      name="plantsCount"
                      value={formData.plantsCount}
                      onChange={handleChange}
                      placeholder="1750"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border ${
                        errors.plantsCount ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5] bg-[#F8FAF7]'
                      } focus:outline-none focus:border-[#1F5E3B]`}
                    />
                    {errors.plantsCount && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.plantsCount}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#17331F]">Average Plant Age</label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                        ✨ Auto-Filled
                      </span>
                    </div>
                    <input
                      type="text"
                      name="plantAge"
                      value={formData.plantAge}
                      onChange={handleChange}
                      placeholder="e.g. 5 Years"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-emerald-50/50 text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: SOIL INFORMATION */}
            {activeSection === 'soil' && (
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2 pb-2 border-b border-[#D7E6D5]">
                  <Database className="w-4 h-4 text-[#5C8D4E]" />
                  Soil Chemistry & Telemetry Readings
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Soil Type</label>
                    <select
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B] font-bold text-[#17331F]"
                    >
                      {SOIL_TYPES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Soil pH Level (Ideal: 5.5 - 6.5)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="ph"
                      value={formData.ph}
                      onChange={handleChange}
                      placeholder="6.2"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Nitrogen N (kg/ha)</label>
                    <input
                      type="number"
                      name="nitrogen"
                      value={formData.nitrogen}
                      onChange={handleChange}
                      placeholder="140"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Phosphorus P (kg/ha)</label>
                    <input
                      type="number"
                      name="phosphorus"
                      value={formData.phosphorus}
                      onChange={handleChange}
                      placeholder="45"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Potassium K (kg/ha)</label>
                    <input
                      type="number"
                      name="potassium"
                      value={formData.potassium}
                      onChange={handleChange}
                      placeholder="180"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Organic Carbon (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="organicCarbon"
                      value={formData.organicCarbon}
                      onChange={handleChange}
                      placeholder="1.8"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Current Soil Moisture (%)</label>
                    <input
                      type="number"
                      name="moisture"
                      value={formData.moisture}
                      onChange={handleChange}
                      placeholder="72"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: IRRIGATION */}
            {activeSection === 'irrigation' && (
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2 pb-2 border-b border-[#D7E6D5]">
                  <Droplets className="w-4 h-4 text-[#5C8D4E]" />
                  Irrigation System & Water Supply
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Primary Irrigation Method</label>
                    <select
                      name="irrigation"
                      value={formData.irrigation}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    >
                      <option value="Drip">Drip Irrigation (Automated IoT)</option>
                      <option value="Sprinkler">Micro Sprinkler Overhead System</option>
                      <option value="Manual">Manual Hose / Stream Irrigation</option>
                      <option value="Rainfed">Rainfed Plantation</option>
                      <option value="Mixed">Mixed Drip & Overhead Sprinkler</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: IOT SENSOR */}
            {activeSection === 'sensor' && (
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2 pb-2 border-b border-[#D7E6D5]">
                  <Cpu className="w-4 h-4 text-[#5C8D4E]" />
                  IoT Moisture Sensor Integration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Assigned IoT Sensor ID</label>
                    <input
                      type="text"
                      name="sensorId"
                      value={formData.sensorId}
                      onChange={handleChange}
                      placeholder="e.g. SENSOR-IDK-01"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Live Sensor Moisture Reading (%)</label>
                    <input
                      type="number"
                      name="sensorMoisture"
                      value={formData.sensorMoisture}
                      onChange={handleChange}
                      placeholder="72"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="gpsEnabled"
                    name="gpsEnabled"
                    checked={formData.gpsEnabled}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#1F5E3B] focus:ring-[#1F5E3B]"
                  />
                  <label htmlFor="gpsEnabled" className="text-xs font-bold text-[#17331F]">
                    Enable GPS Telemetry Sync & Weather Warnings for this Plantation
                  </label>
                </div>
              </div>
            )}
        </div>
      </form>

    </FullScreenFormModal>

  );
};

export default AddPlantationModal;
