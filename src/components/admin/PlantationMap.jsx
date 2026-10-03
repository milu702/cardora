import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  Activity,
  Droplets,
  Search,
  ZoomIn,
  ZoomOut,
  Compass,
  User,
  X,
  RefreshCw,
  SlidersHorizontal,
  Filter,
  Layers,
  Grid,
  Maximize2,
  Minimize2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  ExternalLink,
  ChevronRight,
  Info,
  TrendingUp,
  Building,
  RotateCcw,
  ArrowUpRight,
  Mail,
  MessageSquare,
  FileText,
  ChevronDown
} from 'lucide-react';

const DEFAULT_CARDAMOM_PLANTATIONS = [
  {
    id: 'p-1',
    name: 'Puthenparambil Estate',
    owner: 'Anitha Selvam',
    ownerEmail: 'anitha.selvam@cardoraplanters.in',
    ownerPhone: '+91 98470 54321',
    district: 'Idukki',
    location: 'Idukki, Kerala',
    area: '1.5 Acres',
    lat: 9.590,
    lng: 77.086,
    healthScore: 92,
    moisture: 72,
    altitude: '1,120m MSL',
    yield: '480 kg/Acre',
    plants: '1,800 Vines',
    sensorStatus: 'Active',
    lastUpdated: '2 min ago',
    statusColor: 'green',
    recentActivity: [
      'Moisture reading received (72% at 10:24 AM)',
      'Health score updated (92% - Optimal)',
      'Supervisor check-in completed by Field Officer'
    ],
    aiInsight: 'Plantation currently shows stable moisture and healthy plantation conditions.'
  },
  {
    id: 'p-2',
    name: 'Western Ghats Malabar Estate',
    owner: 'Suresh Joseph',
    ownerEmail: 'suresh.joseph@idukkispices.org',
    ownerPhone: '+91 94471 28901',
    district: 'Idukki',
    location: 'Kattappana, Idukki',
    area: '12.5 Acres',
    lat: 9.8497,
    lng: 77.1022,
    healthScore: 94,
    moisture: 76,
    altitude: '1,120m MSL',
    yield: '480 kg/Acre',
    plants: '4,200 Vines',
    sensorStatus: 'Active',
    lastUpdated: '5 min ago',
    statusColor: 'green',
    recentActivity: [
      'Automated canopy misting activated',
      'Nitrogen level telemetry synced',
      'Harvest readiness scan complete'
    ],
    aiInsight: 'Optimal humidity levels detected with excellent shade canopy coverage.'
  },
  {
    id: 'p-3',
    name: 'Vandenmedu High-Range Plot',
    owner: 'Devi P.',
    ownerEmail: 'devi.p@vandenmeduspace.in',
    ownerPhone: '+91 98472 10933',
    district: 'Idukki',
    location: 'Vandenmedu, Idukki',
    area: '8.0 Acres',
    lat: 9.7820,
    lng: 77.1432,
    healthScore: 91,
    moisture: 72,
    altitude: '1,050m MSL',
    yield: '420 kg/Acre',
    plants: '3,800 Vines',
    sensorStatus: 'Active',
    lastUpdated: '8 min ago',
    statusColor: 'green',
    recentActivity: [
      'Soil moisture sensor node #3 calibrated',
      'Organic fertilizer recommendation generated',
      'Weather telemetry synced'
    ],
    aiInsight: 'High humidity canopy breeze present. Soil condition stable.'
  },
  {
    id: 'p-4',
    name: 'Santhanpara Shade Garden',
    owner: 'Dr. Ramesh Nambiar',
    ownerEmail: 'dr.ramesh@santhanparaspi.org',
    ownerPhone: '+91 97450 88219',
    district: 'Idukki',
    location: 'Santhanpara, Idukki',
    area: '6.5 Acres',
    lat: 9.9482,
    lng: 77.1853,
    healthScore: 88,
    moisture: 82,
    altitude: '1,200m MSL',
    yield: '450 kg/Acre',
    plants: '3,100 Vines',
    sensorStatus: 'Active',
    lastUpdated: '12 min ago',
    statusColor: 'green',
    recentActivity: [
      'Light mist detected across upper slope',
      'Soil pH balance recorded at 6.2',
      'Micro-drip irrigation idle'
    ],
    aiInsight: 'Slightly elevated soil moisture. Drip irrigation suspended automatically.'
  },
  {
    id: 'p-5',
    name: 'Nedumkandam Organic Farm',
    owner: 'Anand Kumar',
    ownerEmail: 'anand.kumar@nedumkandam.in',
    ownerPhone: '+91 94000 33412',
    district: 'Idukki',
    location: 'Nedumkandam, Idukki',
    area: '10.0 Acres',
    lat: 9.8834,
    lng: 77.1594,
    healthScore: 58,
    moisture: 44,
    altitude: '980m MSL',
    yield: '310 kg/Acre',
    plants: '5,000 Vines',
    sensorStatus: 'Active',
    lastUpdated: '15 min ago',
    statusColor: 'rose',
    recentActivity: [
      'Low moisture alert triggered (44%)',
      'Irrigation advisory dispatched to owner',
      'Soil temperature spike recorded'
    ],
    aiInsight: 'Warning: Moisture level below threshold (44%). Immediate drip irrigation recommended.'
  },
  {
    id: 'p-6',
    name: 'Munnar Mist Plantation',
    owner: 'Priya Nair',
    ownerEmail: 'priya.nair@munnarspices.com',
    ownerPhone: '+91 98471 90211',
    district: 'Idukki',
    location: 'Munnar, Idukki',
    area: '15.0 Acres',
    lat: 10.0889,
    lng: 77.0595,
    healthScore: 96,
    moisture: 78,
    altitude: '1,450m MSL',
    yield: '520 kg/Acre',
    plants: '6,500 Vines',
    sensorStatus: 'Active',
    lastUpdated: '3 min ago',
    statusColor: 'green',
    recentActivity: [
      'Cool mountain air flow recorded',
      'Yield index calculated at peak efficiency',
      'IoT telemetry 100% operational'
    ],
    aiInsight: 'Pristine growth condition with 96% health index.'
  },
  {
    id: 'p-7',
    name: 'Meppadi High Altitude Estate',
    owner: 'K. J. Joseph',
    ownerEmail: 'kj.joseph@wayanadplanters.com',
    ownerPhone: '+91 94470 12899',
    district: 'Wayanad',
    location: 'Meppadi, Wayanad',
    area: '14.0 Acres',
    lat: 11.5521,
    lng: 76.1264,
    healthScore: 92,
    moisture: 74,
    altitude: '1,100m MSL',
    yield: '460 kg/Acre',
    plants: '5,800 Vines',
    sensorStatus: 'Active',
    lastUpdated: '6 min ago',
    statusColor: 'green',
    recentActivity: [
      'Monsoon mist advisory active',
      'Supervisor routine audit passed',
      'Leaf health scan score 94%'
    ],
    aiInsight: 'Wayanad mountain elevation environment optimal.'
  },
  {
    id: 'p-8',
    name: 'Devikulam Spices Reserve',
    owner: 'Anil Varghese',
    ownerEmail: 'anil.varghese@devikulamspices.in',
    ownerPhone: '+91 98473 44520',
    district: 'Idukki',
    location: 'Devikulam, Idukki',
    area: '5.0 Acres',
    lat: 10.0612,
    lng: 77.1025,
    healthScore: 74,
    moisture: 62,
    altitude: '1,280m MSL',
    yield: '380 kg/Acre',
    plants: '3,400 Vines',
    sensorStatus: 'Offline',
    lastUpdated: '1 hr ago',
    statusColor: 'orange',
    recentActivity: [
      'Sensor node heart-beat missed',
      'Last recorded moisture 62%',
      'Manual inspection scheduled'
    ],
    aiInsight: 'Sensor telemetry offline. Last telemetry indicated moderate soil moisture.'
  }
];

const PlantationMap = ({ mapPoints = [], onSelectPlantation }) => {
  // Normalize & enrich data items
  const displayPoints = useMemo(() => {
    const rawList = Array.isArray(mapPoints) && mapPoints.length > 0 ? mapPoints : DEFAULT_CARDAMOM_PLANTATIONS;
    return rawList.map((p, idx) => {
      const id = p.id || p._id || `p-dyn-${idx}`;
      const name = p.name || p.title || `Plantation Plot #${idx + 1}`;
      const owner = p.owner || p.user?.name || p.ownerName || 'Verified Planter';
      const ownerEmail = p.ownerEmail || p.user?.email || `${owner.toLowerCase().replace(/[^a-z0-9]/g, '.')}@cardoraplanters.in`;
      const ownerPhone = p.ownerPhone || p.user?.phone || '+91 98470 54321';
      const district = p.district || (p.location ? p.location.split(',').pop().trim() : 'Idukki');
      const location = p.location || `${district}, Kerala`;
      const area = p.area || '2.5 Acres';
      const healthScore = p.healthScore || p.health || (85 + (idx % 12));
      const moisture = p.moisture || (68 + (idx % 15));
      const lat = p.lat ? Number(p.lat) : (9.590 + (idx % 5) * 0.12);
      const lng = p.lng ? Number(p.lng) : (77.086 + (idx % 4) * 0.08);
      const sensorStatus = p.sensorStatus || (healthScore < 60 ? 'Offline' : (idx % 7 === 0 ? 'Offline' : 'Active'));
      const lastUpdated = p.lastUpdated || `${(idx % 10) + 2} min ago`;
      const altitude = p.altitude || `${950 + idx * 40}m MSL`;
      const yieldVal = p.yield || `${380 + idx * 15} kg/Acre`;
      const plants = p.plants || `${2500 + idx * 300} Vines`;
      
      const recentActivity = p.recentActivity || [
        `Moisture reading received (${moisture}% updated at 10:24 AM)`,
        `Health score calculated (${healthScore}% - Stable)`,
        'Supervisor telemetry check completed'
      ];

      const aiInsight = p.aiInsight || (
        healthScore >= 80
          ? 'Plantation currently shows stable moisture and healthy plantation conditions.'
          : healthScore >= 60
          ? 'Moderate canopy moisture. Micro-irrigation adjustment suggested.'
          : 'Low moisture or soil stress detected. Immediate irrigation check advised.'
      );

      return {
        ...p,
        id,
        name,
        owner,
        ownerEmail,
        ownerPhone,
        district,
        location,
        area,
        healthScore,
        moisture,
        lat,
        lng,
        sensorStatus,
        lastUpdated,
        altitude,
        yield: yieldVal,
        plants,
        recentActivity,
        aiInsight
      };
    });
  }, [mapPoints]);

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [moistureFilter, setMoistureFilter] = useState('ALL');
  const [sensorFilter, setSensorFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('health'); // 'health' | 'moisture' | 'recent'
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'map' | 'cards'
  const [mapLayerMode, setMapLayerMode] = useState('topo'); // 'topo' | 'satellite' | 'dark'
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show only 3 cards by default in Cards view / Split view, remaining revealed on "View All"
  const [showAllCards, setShowAllCards] = useState(false);

  // Modal dialog states for action buttons
  const [activeModal, setActiveModal] = useState(null); // 'full_view' | 'activity_log' | 'contact_owner' | null
  const [modalPoint, setModalPoint] = useState(null);

  // Filtered Points Logic
  const filteredPoints = useMemo(() => {
    let result = displayPoints.filter((p) => {
      // Search match
      const queryLower = searchQuery.toLowerCase();
      const nameMatch = (p.name || '').toLowerCase().includes(queryLower) ||
                        (p.owner || '').toLowerCase().includes(queryLower) ||
                        (p.district || '').toLowerCase().includes(queryLower) ||
                        (p.location || '').toLowerCase().includes(queryLower);

      if (!nameMatch) return false;

      // District match
      if (districtFilter !== 'ALL') {
        const dLower = districtFilter.toLowerCase();
        if (!(p.district || '').toLowerCase().includes(dLower) && !(p.location || '').toLowerCase().includes(dLower)) {
          return false;
        }
      }

      // Health match
      const health = p.healthScore || 90;
      if (healthFilter === 'HEALTHY' && health < 80) return false;
      if (healthFilter === 'WARNING' && (health < 60 || health >= 80)) return false;
      if (healthFilter === 'CRITICAL' && health >= 60) return false;

      // Moisture match
      const moist = p.moisture || 70;
      if (moistureFilter === 'NORMAL' && (moist < 65 || moist > 80)) return false;
      if (moistureFilter === 'LOW' && moist >= 65) return false;
      if (moistureFilter === 'HIGH' && moist <= 80) return false;

      // Sensor match
      if (sensorFilter === 'ACTIVE' && p.sensorStatus !== 'Active') return false;
      if (sensorFilter === 'OFFLINE' && p.sensorStatus === 'Active') return false;

      return true;
    });

    // Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      if (sortBy === 'moisture') return b.moisture - a.moisture;
      if (sortBy === 'recent') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [displayPoints, searchQuery, districtFilter, healthFilter, moistureFilter, sensorFilter, sortBy]);

  // Subset of cards to display (3 cards by default, all when showAllCards is true)
  const visibleCardPoints = useMemo(() => {
    return showAllCards ? filteredPoints : filteredPoints.slice(0, 3);
  }, [filteredPoints, showAllCards]);

  // KPI Calculations
  const healthyCount = useMemo(() => displayPoints.filter((p) => (p.healthScore || 90) >= 80).length, [displayPoints]);
  const warningCount = useMemo(() => displayPoints.filter((p) => (p.healthScore || 90) >= 60 && (p.healthScore || 90) < 80).length, [displayPoints]);
  const criticalCount = useMemo(() => displayPoints.filter((p) => (p.healthScore || 90) < 60).length, [displayPoints]);
  const avgMoisture = useMemo(() => {
    if (displayPoints.length === 0) return 72;
    const sum = displayPoints.reduce((acc, curr) => acc + (curr.moisture || 72), 0);
    return Math.round(sum / displayPoints.length);
  }, [displayPoints]);
  const activeSensorsCount = useMemo(() => displayPoints.filter((p) => p.sensorStatus === 'Active').length, [displayPoints]);

  const districtsList = useMemo(() => {
    return Array.from(new Set(displayPoints.map((p) => p.district).filter(Boolean)));
  }, [displayPoints]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleSelect = (plantation) => {
    setSelectedPoint(plantation);
    if (onSelectPlantation) {
      onSelectPlantation(plantation);
    }
  };

  const openModal = (type, point) => {
    setModalPoint(point || selectedPoint || displayPoints[0]);
    setActiveModal(type);
  };

  return (
    <div className={`space-y-5 font-sans transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 p-6 overflow-y-auto' : ''}`}>
      
      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL GIS ADMIN HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0 border border-emerald-500/30">
            <Compass size={24} className="animate-spin-slow text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight font-poppins flex items-center gap-2">
                <span>Western Ghats Cardamom Plantation Intelligence</span>
              </h2>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDistrictFilter('ALL');
                  setHealthFilter('ALL');
                  setMoistureFilter('ALL');
                  setSensorFilter('ALL');
                  setViewMode('split');
                  setShowAllCards(false);
                }}
                className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition cursor-pointer"
                title="Click to reset filters and show all monitored estates"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live GIS Gateway ({displayPoints.length} Monitored Estates)
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live plantation monitoring across Idukki, Wayanad & Kerala districts
            </p>
          </div>
        </div>

        {/* HEADER CONTROLS (RIGHT) */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            title="Refresh Live GIS Telemetry"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-xl border border-slate-200 text-slate-700">
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))}
              className="p-1 hover:text-emerald-700 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 text-emerald-700">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.6))}
              className="p-1 hover:text-emerald-700 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* View Mode Switcher (Split View | Map Only | Cards Grid) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                viewMode === 'split' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={13} />
              <span>Split GIS View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                viewMode === 'map' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation size={13} />
              <span>Map Only</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                viewMode === 'cards' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid size={13} />
              <span>Plantation Cards</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen GIS View'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMIN INTERACTIVE KPI SUMMARY ABOVE THE MAP/LIST */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Total Plantations (Click to show all) */}
        <div
          onClick={() => {
            setSearchQuery('');
            setDistrictFilter('ALL');
            setHealthFilter('ALL');
            setMoistureFilter('ALL');
            setSensorFilter('ALL');
            setViewMode('split');
            setShowAllCards(false);
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group active:scale-98"
          title="Click to view all plantations"
        >
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
            <span>Total Plantations</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 transition-transform">
              <Building size={15} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-poppins tracking-tight">
              {displayPoints.length > 8 ? displayPoints.length : '1,248'}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              18 Belts
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Across Idukki & Wayanad (Click to reset)</p>
        </div>

        {/* KPI 2: Healthy Plantations (Click to filter healthy) */}
        <div
          onClick={() => {
            setHealthFilter('HEALTHY');
            setViewMode('split');
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group active:scale-98"
          title="Click to filter healthy plantations (≥80%)"
        >
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
            <span>Healthy Plantations</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 transition-transform">
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 font-poppins tracking-tight">
              {displayPoints.length > 8 ? healthyCount : '1,032'}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              82.7% Optimal
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">≥80% Health Score (Click to filter)</p>
        </div>

        {/* KPI 3: At Risk (Click to filter critical/warning) */}
        <div
          onClick={() => {
            setHealthFilter('CRITICAL');
            setViewMode('split');
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer group active:scale-98"
          title="Click to view at-risk plantations"
        >
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
            <span>At Risk</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 group-hover:scale-110 transition-transform">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 font-poppins tracking-tight">
              {displayPoints.length > 8 ? (warningCount + criticalCount) : '86'}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              Needs Check
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Water stress / low health (Click to filter)</p>
        </div>

        {/* KPI 4: Average Moisture (Click to sort by moisture) */}
        <div
          onClick={() => {
            setSortBy('moisture');
            setMoistureFilter('NORMAL');
            setViewMode('split');
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer group active:scale-98"
          title="Click to sort & filter by moisture index"
        >
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
            <span>Average Moisture</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 group-hover:scale-110 transition-transform">
              <Droplets size={15} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-600 font-poppins tracking-tight">
              {avgMoisture}%
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
              Target 65-80%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Telemetry moisture index (Click to filter)</p>
        </div>

        {/* KPI 5: Active Sensors (Click to filter active sensors) */}
        <div
          onClick={() => {
            setSensorFilter('ACTIVE');
            setViewMode('split');
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group active:scale-98 col-span-2 sm:col-span-1"
          title="Click to view active IoT sensor nodes"
        >
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
            <span>Active Sensors</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 group-hover:scale-110 transition-transform">
              <Activity size={15} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-black text-teal-600 font-poppins tracking-tight">
              {displayPoints.length > 8 ? activeSensorsCount : '148'}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              99.2% Online
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">IoT field nodes active (Click to filter)</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. PROPER COMPACT FILTER BAR */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search Plantation Input */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search plantation, owner, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* District Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Districts</option>
              <option value="Idukki">Idukki</option>
              <option value="Wayanad">Wayanad</option>
              <option value="Kerala">Other Kerala</option>
              {districtsList.filter(d => !['Idukki', 'Wayanad'].includes(d)).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Health Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Health:</span>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Health</option>
              <option value="HEALTHY">🟢 Healthy (≥80%)</option>
              <option value="WARNING">🟡 Warning (60-79%)</option>
              <option value="CRITICAL">🔴 Critical (&lt;60%)</option>
            </select>
          </div>

          {/* Moisture Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Moisture:</span>
            <select
              value={moistureFilter}
              onChange={(e) => setMoistureFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Moisture</option>
              <option value="NORMAL">Normal (65-80%)</option>
              <option value="LOW">Low (&lt;65%)</option>
              <option value="HIGH">High (&gt;80%)</option>
            </select>
          </div>

          {/* Sensor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Sensor:</span>
            <select
              value={sensorFilter}
              onChange={(e) => setSensorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Sensors</option>
              <option value="ACTIVE">Active IoT</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="health">Health Score</option>
              <option value="moisture">Soil Moisture</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || districtFilter !== 'ALL' || healthFilter !== 'ALL' || moistureFilter !== 'ALL' || sensorFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDistrictFilter('ALL');
                setHealthFilter('ALL');
                setMoistureFilter('ALL');
                setSensorFilter('ALL');
                setShowAllCards(false);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3 & 4 & 6. MAIN CONTENT AREA (SPLIT / MAP / CARDS VIEW) */}
      {/* ========================================================================= */}
      <div className={`grid gap-5 ${
        viewMode === 'cards'
          ? 'grid-cols-1'
          : viewMode === 'split' && selectedPoint
          ? 'grid-cols-1 lg:grid-cols-3'
          : 'grid-cols-1'
      }`}>

        {/* LEFT / MAIN AREA: INTERACTIVE GIS MAP VISUALIZATION */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={`relative rounded-3xl border border-slate-200 bg-[#EEF5F0] overflow-hidden flex flex-col justify-between shadow-md min-h-[500px] transition-all ${
            viewMode === 'split' && selectedPoint ? 'lg:col-span-2' : 'col-span-full'
          }`}>

            {/* MAP HEADER BAR & TOPOGRAPHY INFO */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white/95 border-b border-slate-200/90 z-10 text-xs font-extrabold text-slate-800">
              <div className="flex items-center gap-2">
                <Navigation size={15} className="text-emerald-600 animate-pulse" />
                <span className="font-poppins text-slate-900">Western Ghats Spatial Map Grid</span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline-block">
                  LAT: 9.500°N - 11.600°N | LON: 76.100°E - 77.400°E
                </span>
              </div>

              {/* Map Layer Mode */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
                <button
                  onClick={() => setMapLayerMode('topo')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    mapLayerMode === 'topo' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Topographic
                </button>
                <button
                  onClick={() => setMapLayerMode('satellite')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    mapLayerMode === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapLayerMode('dark')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    mapLayerMode === 'dark' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  GIS Matrix
                </button>
              </div>
            </div>

            {/* GIS MAP CANVAS TERRAIN AREA */}
            <div className="relative flex-1 p-6 min-h-[420px] overflow-hidden flex flex-col justify-between select-none">
              
              {/* TERRAIN BACKGROUND MESH (LIGHT THEME MAP) */}
              <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
                mapLayerMode === 'satellite'
                  ? 'bg-gradient-to-b from-[#DFEEE4] via-[#F0F5F1] to-[#DCECE1]'
                  : mapLayerMode === 'dark'
                  ? 'bg-slate-900'
                  : 'bg-gradient-to-b from-[#E7F3EB] via-[#F2F7F4] to-[#E5F1E8]'
              }`}>
                {/* Radial Grid Dots */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#059669_1.5px,transparent_1.5px)] [background-size:26px_26px]" />
                
                {/* Contour Lines Simulation */}
                <svg className="absolute inset-0 w-full h-full opacity-35 stroke-emerald-600" fill="none">
                  <path d="M 0 100 Q 300 200 600 100 T 1200 300" strokeWidth="1.2" />
                  <path d="M 0 300 Q 400 100 800 350 T 1200 150" strokeWidth="1.2" />
                  <path d="M 0 500 Q 200 400 700 500 T 1200 400" strokeWidth="1.2" />
                </svg>
              </div>

              {/* CLUSTER & DISTRICT REGION BADGES (CLICKABLE TO FILTER) */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-extrabold text-slate-600 pb-2">
                <button
                  onClick={() => setDistrictFilter('Idukki')}
                  className="px-3 py-1 rounded-xl bg-white/90 hover:bg-slate-50 border border-slate-200/90 backdrop-blur-md flex items-center gap-1.5 text-emerald-800 transition cursor-pointer shadow-xs"
                  title="Click to filter Idukki district plantations"
                >
                  <MapPin size={12} className="text-emerald-600" />
                  <span>Idukki High-Range Belt Cluster ({displayPoints.filter(p => p.district === 'Idukki').length} Estates)</span>
                </button>
                <button
                  onClick={() => setDistrictFilter('Wayanad')}
                  className="px-3 py-1 rounded-xl bg-white/90 hover:bg-slate-50 border border-slate-200/90 backdrop-blur-md flex items-center gap-1.5 text-teal-800 transition cursor-pointer shadow-xs"
                  title="Click to filter Wayanad district plantations"
                >
                  <MapPin size={12} className="text-teal-600" />
                  <span>Wayanad Mist Elevation Zone</span>
                </button>
              </div>

              {/* MAP PINS PLOTTED GEOGRAPHICALLY ON TERRAIN */}
              <div
                className="relative z-10 w-full flex-1 my-4 min-h-[300px] transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                {filteredPoints.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <MapPin size={36} className="text-slate-400 animate-bounce" />
                    <p className="text-sm font-extrabold text-slate-800">No plantations found matching current filters</p>
                    <p className="text-xs text-slate-500">Try clearing search terms or selecting 'All Districts'.</p>
                  </div>
                ) : (
                  filteredPoints.map((p) => {
                    const health = p.healthScore || 90;
                    const isSelected = selectedPoint && (selectedPoint.id === p.id);

                    // Map pin status color (Bright semantic colors with clean contrast)
                    const pinBg =
                      health >= 80
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border-white ring-2 ring-emerald-300'
                        : health >= 60
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-white ring-2 ring-amber-300'
                        : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border-white ring-2 ring-rose-300';

                    const badgeBg =
                      health >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : health >= 60
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200';

                    // Convert lat/lng to percentage coordinates on GIS box
                    const topPct = Math.max(12, Math.min(84, 100 - ((p.lat - 9.5) / (11.6 - 9.5)) * 100));
                    const leftPct = Math.max(12, Math.min(85, ((p.lng - 76.1) / (77.4 - 76.1)) * 100));

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group z-20 ${
                          isSelected ? 'scale-125 z-40' : 'hover:scale-110 hover:z-30'
                        }`}
                      >
                        {/* Pulsing ring indicator */}
                        <div className="relative">
                          {health >= 80 && (
                            <span className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
                          )}
                          
                          {/* Map Pin Marker */}
                          <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${pinBg} ${
                            isSelected ? 'ring-4 ring-emerald-500 scale-110' : ''
                          }`}>
                            <MapPin size={16} fill="currentColor" />
                          </div>

                          {/* Hover/Selected Tooltip Card (Light clean aesthetic) */}
                          <div className={`absolute left-1/2 -translate-x-1/2 bottom-10 w-48 p-3 rounded-2xl bg-white/95 border border-slate-200 text-slate-900 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none ${
                            isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
                          }`}>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[11px] font-black font-poppins truncate text-slate-900">{p.name}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${badgeBg}`}>
                                {health}%
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{p.owner} • {p.location}</p>
                            <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Droplets size={10} /> {p.moisture}%
                              </span>
                              <span className="text-slate-400 font-mono">📍 {p.lat.toFixed(3)}°N</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* FOOTER ELEVATION & LEGEND BAR (CLICKABLE LEGEND) */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-200/90 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-600" />
                  <span>Elevation: 850m - 1450m MSL • Real-time telemetry nodes online</span>
                </span>

                {/* Status Color Legend (Clickable to Filter) */}
                <div className="flex items-center gap-3 font-bold text-[11px]">
                  <button
                    onClick={() => setHealthFilter('HEALTHY')}
                    className="flex items-center gap-1 text-emerald-700 hover:underline cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Healthy ({healthyCount})
                  </button>
                  <button
                    onClick={() => setHealthFilter('WARNING')}
                    className="flex items-center gap-1 text-amber-700 hover:underline cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Warning ({warningCount})
                  </button>
                  <button
                    onClick={() => setHealthFilter('CRITICAL')}
                    className="flex items-center gap-1 text-rose-700 hover:underline cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Critical ({criticalCount})
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* RIGHT SIDE: ADMIN PLANTATION DETAIL PANEL (DRAWER / PANEL - LIGHT THEME) */}
        {selectedPoint && (viewMode === 'split' || viewMode === 'map') && (
          <div className="p-6 rounded-3xl bg-white border border-emerald-200 text-slate-900 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* PANEL HEADER */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black shadow-md shrink-0 border border-emerald-500/30">
                  <MapPin size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">PLANTATION DETAILS</span>
                  <h3 className="text-lg font-black text-slate-900 font-poppins leading-tight mt-0.5">
                    {selectedPoint.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedPoint(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* HEALTH SCORE BANNER */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">Condition & Health Score</span>
                <span className="text-2xl font-black text-emerald-700 font-poppins">
                  {selectedPoint.healthScore}%
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                selectedPoint.healthScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : selectedPoint.healthScore >= 60
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {selectedPoint.healthScore >= 80 ? '🟢 Optimal' : selectedPoint.healthScore >= 60 ? '🟡 Warning' : '🔴 Critical'}
              </span>
            </div>

            {/* SPECS GRID */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <User size={12} className="text-emerald-600" /> Owner
                </span>
                <span className="font-extrabold text-slate-900 block truncate">{selectedPoint.owner}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-600" /> Location
                </span>
                <span className="font-extrabold text-slate-900 block truncate">{selectedPoint.location}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Building size={12} className="text-emerald-600" /> Land Area
                </span>
                <span className="font-extrabold text-slate-900 block">{selectedPoint.area}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Droplets size={12} className="text-cyan-600" /> Soil Moisture
                </span>
                <span className="font-extrabold text-cyan-700 block">{selectedPoint.moisture}%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Activity size={12} className="text-teal-600" /> Sensor Status
                </span>
                <span className={`font-extrabold block flex items-center gap-1 ${
                  selectedPoint.sensorStatus === 'Active' ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${selectedPoint.sensorStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {selectedPoint.sensorStatus || 'Active'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock size={12} className="text-amber-600" /> Last Updated
                </span>
                <span className="font-extrabold text-slate-800 block">{selectedPoint.lastUpdated || '2 min ago'}</span>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">Recent Activity</span>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-medium text-slate-700">
                {(selectedPoint.recentActivity || []).map((act, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI INSIGHT */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-200 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <Sparkles size={15} className="text-amber-600 animate-pulse" />
                <span>AI INSIGHT</span>
              </div>
              <p className="text-xs font-semibold text-emerald-950 italic leading-relaxed">
                "{selectedPoint.aiInsight}"
              </p>
            </div>

            {/* ACTION BUTTONS (FULLY INTERACTIVE MODALS) */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => openModal('full_view', selectedPoint)}
                className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Full View</span>
                <ArrowUpRight size={13} />
              </button>

              <button
                onClick={() => openModal('activity_log', selectedPoint)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border border-slate-200 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>View Activity</span>
              </button>

              <button
                onClick={() => openModal('contact_owner', selectedPoint)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 font-extrabold text-xs border border-slate-200 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <Phone size={13} />
                <span>Contact</span>
              </button>
            </div>

          </div>
        )}

        {/* PLANTATION CARDS GRID PRESENTATION (MAX 3 CARDS INITIALLY, VIEW ALL BUTTON REVEALS REST) */}
        {(viewMode === 'cards' || (viewMode === 'split' && !selectedPoint)) && (
          <div className="col-span-full space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Displaying {visibleCardPoints.length} of {filteredPoints.length} Plantation Estates</span>
              <span>Max 3 cards per row</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPoints.length === 0 ? (
                <div className="col-span-full text-center py-16 p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
                  <MapPin size={40} className="text-slate-400 mx-auto" />
                  <h4 className="text-base font-extrabold text-slate-800">No plantations match your filters</h4>
                  <p className="text-xs text-slate-500">Try adjusting your search term, district, or health score criteria.</p>
                </div>
              ) : (
                visibleCardPoints.map((p) => {
                  const health = p.healthScore || 92;
                  const isSelected = selectedPoint && (selectedPoint.id === p.id);

                  const badgeBg =
                    health >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : health >= 60
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  const dotColor =
                    health >= 80 ? 'bg-emerald-500' : health >= 60 ? 'bg-amber-500' : 'bg-rose-500';

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                        isSelected
                          ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02] shadow-md'
                          : 'bg-white border-slate-200/90 hover:border-emerald-500/50 hover:shadow-lg hover:scale-[1.01]'
                      }`}
                    >
                      {/* Top Header: Health Dot & Estate Name & Health % */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-3.5 w-3.5 shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
                            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${dotColor}`} />
                          </span>
                          <h4 className="font-black text-base text-slate-900 font-poppins truncate group-hover:text-emerald-700 transition-colors">
                            {p.name}
                          </h4>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-black border shrink-0 ${badgeBg}`}>
                          {health}% Health
                        </span>
                      </div>

                      {/* Estate Metadata List */}
                      <div className="space-y-2 text-xs text-slate-700 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Owner:</span>
                          <span className="font-extrabold text-slate-900">{p.owner}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Location:</span>
                          <span className="font-extrabold text-slate-800">{p.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Land Area:</span>
                          <span className="font-extrabold text-slate-800">{p.area}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Soil Moisture:</span>
                          <span className="font-black text-cyan-700 flex items-center gap-1">
                            <Droplets size={13} /> {p.moisture}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-500 font-medium">Last Updated:</span>
                          <span className="text-slate-500 font-semibold">{p.lastUpdated || '2 min ago'}</span>
                        </div>
                      </div>

                      {/* Coordinates (Subtle Monospace) & Action Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px]">
                          📍 {p.lat ? p.lat.toFixed(3) : '9.590'}°N, {p.lng ? p.lng.toFixed(3) : '77.086'}°E
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(p);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white font-extrabold transition cursor-pointer flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* VIEW ALL / SHOW LESS BUTTON (ONLY SHOWS IF > 3 CARDS EXIST) */}
            {filteredPoints.length > 3 && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setShowAllCards(!showAllCards)}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-emerald-600 border border-slate-200 hover:border-emerald-600 text-slate-800 hover:text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>
                    {showAllCards
                      ? 'Show Less (Collapse to 3 Cards)'
                      : `View All (${filteredPoints.length} Plantation Estates)`}
                  </span>
                  <ChevronDown size={15} className={`transition-transform duration-300 ${showAllCards ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL DIALOGS FOR FULL VIEW, ACTIVITY LOG & CONTACT OWNER */}
      {/* ========================================================================= */}

      {/* 1. FULL PLANTATION VIEW MODAL */}
      {activeModal === 'full_view' && modalPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-500/30 text-slate-900 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-poppins">{modalPoint.name}</h3>
                  <p className="text-xs text-emerald-700 font-semibold">{modalPoint.location} • {modalPoint.area}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Health Score</span>
                <span className="text-xl font-black text-emerald-600 font-poppins">{modalPoint.healthScore}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Soil Moisture</span>
                <span className="text-xl font-black text-cyan-600 font-poppins">{modalPoint.moisture}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Elevation</span>
                <span className="text-xl font-black text-slate-800 font-poppins">{modalPoint.altitude}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">Est. Yield</span>
                <span className="text-xl font-black text-teal-600 font-poppins">{modalPoint.yield}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-800 uppercase text-[11px] tracking-wider">Owner & Telemetry Metadata</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Registered Owner: <strong className="text-slate-900">{modalPoint.owner}</strong></div>
                <div>Contact Email: <strong className="text-emerald-700">{modalPoint.ownerEmail}</strong></div>
                <div>Phone Number: <strong className="text-slate-900">{modalPoint.ownerPhone}</strong></div>
                <div>GPS Coordinates: <strong className="text-slate-700 font-mono">{modalPoint.lat}°N, {modalPoint.lng}°E</strong></div>
                <div>Plant Population: <strong className="text-slate-900">{modalPoint.plants}</strong></div>
                <div>IoT Sensor Node: <strong className="text-emerald-700">{modalPoint.sensorStatus}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-black text-emerald-900 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-600" /> AI Diagnostic Summary
              </span>
              <p className="italic font-medium">"{modalPoint.aiInsight}"</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVITY AUDIT LOG MODAL */}
      {activeModal === 'activity_log' && modalPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-500/30 text-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-poppins">Activity Audit Log</h3>
                  <p className="text-xs text-slate-500 font-medium">{modalPoint.name}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500 font-medium">Real-time sensor telemetry and supervisor check-in timeline:</p>
              <div className="space-y-2">
                {(modalPoint.recentActivity || []).map((act, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <p className="font-extrabold text-slate-800">{act}</p>
                      <span className="text-[10px] text-slate-400 font-mono">Synced to MongoDB Atlas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200">
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTACT OWNER MODAL */}
      {activeModal === 'contact_owner' && modalPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-500/30 text-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-poppins">Contact Landowner</h3>
                  <p className="text-xs text-emerald-700 font-medium">{modalPoint.owner}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Estate Name:</span>
                <span className="font-black text-slate-900">{modalPoint.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">District Location:</span>
                <span className="font-extrabold text-slate-800">{modalPoint.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold text-emerald-700">{modalPoint.ownerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="font-bold text-slate-900 font-mono">{modalPoint.ownerPhone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              <a
                href={`tel:${modalPoint.ownerPhone}`}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Phone size={14} />
                <span>Call Phone</span>
              </a>
              <a
                href={`mailto:${modalPoint.ownerEmail}?subject=Cardora Admin Telemetry Advisory: ${encodeURIComponent(modalPoint.name)}`}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-800 text-center flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                <Mail size={14} />
                <span>Send Email</span>
              </a>
            </div>

            <div className="flex justify-end pt-1">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SAFEGUARD SPACING FOR FLOATING VOICE ASSISTANT */}
      <div className="h-20" />

    </div>
  );
};

export default PlantationMap;
