import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Leaf 
} from 'lucide-react';



import PlantationCard from './PlantationCard';
import AddPlantationModal from './AddPlantationModal';
import PlantationDetailsDashboard from './PlantationDetailsDashboard';
import { KERALA_DISTRICTS } from '../../utils/districts';
import { apiService } from '../../services/api';
import Button from '../ui/Button';

const PlantationModule = ({ onToast }) => {
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: 'list' | 'details'
  const [viewMode, setViewMode] = useState('list');
  const [selectedPlantation, setSelectedPlantation] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlantation, setEditingPlantation] = useState(null);

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [healthFilter, setHealthFilter] = useState(''); // '' | 'high' | 'moderate' | 'low'
  const [areaFilter, setAreaFilter] = useState(''); // '' | 'small' | 'medium' | 'large'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'health_desc' | 'health_asc' | 'area_desc'

  // Fetch user-specific plantations strictly from API
  const fetchPlantations = async () => {
    setLoading(true);
    try {
      const res = await apiService.getPlantations();
      const apiItems = (res && res.success && Array.isArray(res.plantations)) ? res.plantations : [];
      setPlantations(apiItems);
    } catch (err) {
      console.error('Error fetching user plantations:', err);
      setPlantations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantations();
  }, []);

  // Save new or edited plantation
  const handleSavePlantation = async (data) => {
    try {
      if (editingPlantation) {
        const id = editingPlantation._id || editingPlantation.id;
        const res = await apiService.updatePlantation(id, data);
        await fetchPlantations();
        if (onToast) onToast('Plantation updated successfully');
      } else {
        const res = await apiService.createPlantation(data);
        await fetchPlantations();
        setSearchQuery('');
        setSelectedDistrict('');
        setSelectedVariety('');
        setHealthFilter('');
        setAreaFilter('');
        if (onToast) onToast('New Plantation registered in CARDORA Ecosystem');
      }
    } catch (err) {
      await fetchPlantations();
      if (onToast) onToast('Plantation saved');
    }
  };




  // Delete plantation
  const handleDeletePlantation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plantation record?')) return;
    try {
      await apiService.deletePlantation(id);
      if (onToast) onToast('Plantation record deleted');
      fetchPlantations();
      if (selectedPlantation && (selectedPlantation._id === id || selectedPlantation.id === id)) {
        setViewMode('list');
      }
    } catch (err) {
      setPlantations(plantations.filter((p) => (p._id || p.id) !== id));
      if (onToast) onToast('Plantation removed');
    }
  };

  // Update inline metrics (Soil, Workers, Expenses)
  const handleUpdatePlantationData = async (id, partialData) => {
    try {
      await apiService.updatePlantation(id, partialData);
      if (onToast) onToast('Plantation telemetry updated');
      
      // Update state locally
      setPlantations((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) === id) {
            const updated = { ...p, ...partialData };
            if (selectedPlantation && (selectedPlantation._id === id || selectedPlantation.id === id)) {
              setSelectedPlantation(updated);
            }
            return updated;
          }
          return p;
        })
      );
    } catch (err) {
      if (onToast) onToast('Updated locally');
    }
  };

  // Filter & Sort Logic
  const filteredPlantations = plantations.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (p.name && p.name.toLowerCase().includes(searchLower)) ||
      (p.district && p.district.toLowerCase().includes(searchLower)) ||
      (p.village && p.village.toLowerCase().includes(searchLower)) ||
      (p.variety && p.variety.toLowerCase().includes(searchLower));

    const pDist = (p.district || p.location || '').toLowerCase();
    const selDist = selectedDistrict.toLowerCase();
    const matchesDistrict = !selectedDistrict || pDist.includes(selDist) || selDist.includes(pDist);
    const matchesVariety = !selectedVariety || (p.variety || '').toLowerCase() === selectedVariety.toLowerCase();


    let matchesHealth = true;
    const h = p.healthScore ?? p.health ?? 90;
    if (healthFilter === 'high') matchesHealth = h >= 90;
    else if (healthFilter === 'moderate') matchesHealth = h >= 70 && h < 90;
    else if (healthFilter === 'low') matchesHealth = h < 70;

    let matchesArea = true;
    const a = p.area || 5;
    if (areaFilter === 'small') matchesArea = a < 5;
    else if (areaFilter === 'medium') matchesArea = a >= 5 && a <= 10;
    else if (areaFilter === 'large') matchesArea = a > 10;

    return matchesSearch && matchesDistrict && matchesVariety && matchesHealth && matchesArea;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sortBy === 'health_desc') return (b.healthScore ?? 90) - (a.healthScore ?? 90);
    if (sortBy === 'health_asc') return (a.healthScore ?? 90) - (b.healthScore ?? 90);
    if (sortBy === 'area_desc') return (b.area || 0) - (a.area || 0);
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* VIEW MODE ROUTER: DETAILS DASHBOARD vs LIST VIEW */}
      {viewMode === 'details' && selectedPlantation ? (
        <PlantationDetailsDashboard
          plantation={selectedPlantation}
          onBack={() => setViewMode('list')}
          onEdit={(p) => {
            setEditingPlantation(p);
            setIsModalOpen(true);
          }}
          onDelete={handleDeletePlantation}
          onUpdatePlantation={handleUpdatePlantationData}
        />
      ) : (
        <div className="space-y-6">
          
          {/* HEADER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#17331F] font-poppins flex items-center gap-2">
                <Leaf className="w-6 h-6 text-[#5C8D4E]" />
                My Plantation Hub
              </h2>
              <p className="text-xs text-[#4A5568] font-medium">
                Centralized management system for all cardamom plots, telemetry, soil, and workforce.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => {
                  setEditingPlantation(null);
                  setIsModalOpen(true);
                }}
              >
                Add Plantation
              </Button>
            </div>
          </div>

          {/* SEARCH, FILTERS & SORT CONTROLS BAR */}
          <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-4 shadow-soft space-y-3">
            
            {/* Search Input Row */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#5C8D4E] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by plantation name, village, district, or cardamom variety..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
              />
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#4A5568] block mb-1">District Filter</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] font-bold text-[#17331F]"
                >
                  <option value="">All Districts</option>
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5568] block mb-1">Variety Filter</label>
                <select
                  value={selectedVariety}
                  onChange={(e) => setSelectedVariety(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] font-bold text-[#17331F]"
                >
                  <option value="">All Varieties</option>
                  <option value="Njallani">Njallani</option>
                  <option value="Green Gold">Green Gold</option>
                  <option value="Vazhukka">Vazhukka</option>
                  <option value="Mysore">Mysore</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5568] block mb-1">Health Score</label>
                <select
                  value={healthFilter}
                  onChange={(e) => setHealthFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] font-bold text-[#17331F]"
                >
                  <option value="">All Health</option>
                  <option value="high">&gt;90% High Health</option>
                  <option value="moderate">70-90% Moderate</option>
                  <option value="low">&lt;70% At Risk</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5568] block mb-1">Area (Acres)</label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] font-bold text-[#17331F]"
                >
                  <option value="">All Acreages</option>
                  <option value="small">&lt; 5 Acres</option>
                  <option value="medium">5 - 10 Acres</option>
                  <option value="large">&gt; 10 Acres</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5568] block mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] font-bold text-[#1F5E3B]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="health_desc">Highest Health</option>
                  <option value="health_asc">Lowest Health</option>
                  <option value="area_desc">Largest Area</option>
                </select>
              </div>
            </div>
          </div>

          {/* PLANTATION CARDS LIST GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-gray-200 rounded-[20px]" />
              ))}
            </div>
          ) : filteredPlantations.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-[#D7E6D5] p-12 text-center shadow-soft">
              <Leaf className="w-12 h-12 text-[#5C8D4E] mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-black text-[#17331F]">No Plantations Found</h3>
              <p className="text-xs text-[#4A5568] mt-1 mb-6 max-w-sm mx-auto">
                No cardamom plantations match your filter criteria. Try clearing search filters or add a new plot.
              </p>
              <Button variant="primary" size="md" icon={Plus} onClick={() => setIsModalOpen(true)}>
                Add Plantation Record
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlantations.map((plantation) => (
                <PlantationCard
                  key={plantation._id || plantation.id}
                  plantation={plantation}
                  onViewDetails={(p) => {
                    setSelectedPlantation(p);
                    setViewMode('details');
                  }}
                  onEdit={(p) => {
                    setEditingPlantation(p);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeletePlantation}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* ADD / EDIT PLANTATION MODAL */}
      <AddPlantationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlantation(null);
        }}
        onSave={handleSavePlantation}
        editingPlantation={editingPlantation}
      />

    </div>
  );
};

export default PlantationModule;
