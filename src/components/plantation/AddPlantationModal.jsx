import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, MapPin, Database, Droplets, Cpu, CheckCircle } from 'lucide-react';
import { CARDAMOM_SUITABLE_DISTRICTS, CARDAMOM_PLANTATION_PLACES } from '../../utils/districts';


const AddPlantationModal = ({ isOpen, onClose, onSave, editingPlantation = null }) => {

  const [activeSection, setActiveSection] = useState('basic'); // 'basic' | 'crop' | 'soil' | 'irrigation' | 'sensor'

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
    const letterOnlyRegex = /^[A-Za-z\s]+$/;

    switch (fieldName) {
      case 'name':
        if (!val) {
          err = 'Plantation Name is required.';
        } else if (val.length < 3) {
          err = 'Plantation Name must be at least 3 letters.';
        } else if (!letterOnlyRegex.test(val)) {
          err = 'Plantation Name must contain only letters and spaces (no numbers or special characters).';
        }
        break;

      case 'ownerName':
        if (val && !letterOnlyRegex.test(val)) {
          err = 'Owner Name must contain only letters and spaces.';
        }
        break;

      case 'taluk':
        if (val && !letterOnlyRegex.test(val)) {
          err = 'Taluk must contain only letters and spaces.';
        }
        break;

      case 'village':
        if (val && !letterOnlyRegex.test(val)) {
          err = 'Village must contain only letters and spaces.';
        }
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

    setFormData((prev) => ({
      ...prev,
      [name]: finalVal,
    }));

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[24px] border border-[#D7E6D5] shadow-2xl overflow-hidden my-8"
        >
          {/* MODAL HEADER */}
          <div className="bg-[#17331F] text-white p-6 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#5C8D4E] text-white">
                <Leaf className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black font-poppins text-white">
                  {editingPlantation ? 'Edit Plantation Record' : 'Register New Cardamom Plantation'}
                </h3>
                <p className="text-xs text-[#DDEFD9]/80 font-medium">
                  Add full plantation telemetry, soil metrics, and sensor metadata for decision support.
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

          {/* NAVIGATION TABS BAR */}
          <div className="bg-[#F8FAF7] border-b border-[#D7E6D5] px-6 py-2 flex items-center gap-2 overflow-x-auto">
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
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1F5E3B] text-white shadow-sm'
                      : 'text-[#4A5568] hover:bg-[#DDEFD9]/50 hover:text-[#17331F]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* MODAL FORM CONTENT */}
          <form onSubmit={handleSubmit} className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
            
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
                  </div>



                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">
                      Area (Acres) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="5.0"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
                    {errors.area && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.area}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Altitude (Meters)</label>
                    <input
                      type="number"
                      name="altitude"
                      value={formData.altitude}
                      onChange={handleChange}
                      placeholder="950"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
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

                <div>
                  <label className="block text-xs font-bold text-[#17331F] mb-1">Plantation Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                  />
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
                      <option value="Njallani">Njallani (High Yield)</option>
                      <option value="Green Gold">Green Gold</option>
                      <option value="Vazhukka">Vazhukka (Traditional High Altitude)</option>
                      <option value="Mysore">Mysore Variety</option>
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
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Planting Year</label>
                    <input
                      type="number"
                      name="plantingYear"
                      value={formData.plantingYear}
                      onChange={handleChange}
                      placeholder="2021"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border ${
                        errors.plantingYear ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5] bg-[#F8FAF7]'
                      } focus:outline-none focus:border-[#1F5E3B]`}
                    />
                    {errors.plantingYear && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.plantingYear}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Total Plant Count</label>
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
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Average Plant Age</label>
                    <input
                      type="text"
                      name="plantAge"
                      value={formData.plantAge}
                      onChange={handleChange}
                      placeholder="e.g. 3.5 Years"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
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
                    <input
                      type="text"
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      placeholder="e.g. Loamy Forest Soil"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] focus:outline-none focus:border-[#1F5E3B]"
                    />
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

            {/* MODAL FOOTER */}
            <div className="pt-4 border-t border-[#D7E6D5] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A5568]">
                <span>Section {['basic', 'crop', 'soil', 'irrigation', 'sensor'].indexOf(activeSection) + 1} of 5</span>
              </div>

              <div className="flex items-center gap-3">
                {activeSection !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      const sections = ['basic', 'crop', 'soil', 'irrigation', 'sensor'];
                      const idx = sections.indexOf(activeSection);
                      if (idx > 0) setActiveSection(sections[idx - 1]);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#D7E6D5] text-[#17331F] text-xs font-bold hover:bg-[#F8FAF7]"
                  >
                    Back
                  </button>
                )}

                {activeSection !== 'sensor' && (
                  <button
                    type="button"
                    onClick={() => {
                      const sections = ['basic', 'crop', 'soil', 'irrigation', 'sensor'];
                      const idx = sections.indexOf(activeSection);
                      if (idx < sections.length - 1) setActiveSection(sections[idx + 1]);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#5C8D4E] text-white text-xs font-bold hover:bg-[#1F5E3B]"
                  >
                    Next Section →
                  </button>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-extrabold hover:bg-[#17331F] shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                  <span>{editingPlantation ? 'Save Changes' : 'Register Plantation'}</span>
                </button>

              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddPlantationModal;
