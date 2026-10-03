import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Trash2,
  FileText,
  ShoppingBag,
  Search,
  RefreshCw,
  AlertTriangle,
  X,
  Building,
  Activity,
  Radio,
  UserCheck,
  Award,
  Download,
  Clock,
  UserPlus,
  Sparkles,
  Filter,
  BarChart3,
  Users,
  Eye,
  MessageSquare,
  Send,
  Bell,
  MapPin,
  Plus,
  Edit,
  CheckCircle,
  CloudSun,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Leaf,
  Phone,
  Mail,
  ExternalLink,
  FileCheck,
  Calendar,
  Tag,
  Check,
  Share2,
  Table,
  LayoutGrid,
  PieChart,
  BarChart2,
  List,
  Gavel,
  ArrowUpRight,
  Zap,
  CheckSquare,
  Settings
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PlantationMap from './PlantationMap';
import AdminAnalyticsCharts from './AdminAnalyticsCharts';
import DistrictWeatherUsers from './DistrictWeatherUsers';
import AdminPlantationIntelligenceView from './AdminPlantationIntelligenceView';
import AdminAuctionsTab from '../auction/AdminAuctionsTab';

const AdminDashboard = () => {
  const { user, showToast, darkMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Loading State
  const [loading, setLoading] = useState(true);

  // Sync adminViewMode with URL ?view= query parameter
  const viewParam = searchParams.get('view');
  const [adminViewMode, setAdminViewMode] = useState(viewParam || 'all');
  const [activityFilter, setActivityFilter] = useState('ALL');

  // Directory Filters & Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // System Setup & Governance Controls State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoTelemetrySync, setAutoTelemetrySync] = useState(true);
  const [aiDocVerification, setAiDocVerification] = useState(true);
  const [auditLogEncryption, setAuditLogEncryption] = useState(true);
  const [emergencyBroadcastOpen, setEmergencyBroadcastOpen] = useState(false);
  const [broadcastMessageText, setBroadcastMessageText] = useState('');
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  // Modals state
  const [quickAddUserOpen, setQuickAddUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    username: '',
    role: 'Farmer',
    password: 'Cardora@123',
    district: 'Idukki, Kerala',
    phone: '',
  });

  useEffect(() => {
    if (viewParam) {
      setAdminViewMode(viewParam);
      if (viewParam === 'supervisors') {
        setRoleFilter('Supervisor');
      } else if (viewParam === 'farmers') {
        setRoleFilter('Farmer');
      }
    } else {
      setAdminViewMode('all');
    }
  }, [viewParam]);

  // Analytics Chart Timeframe state (7D | 30D | 1Y)
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('30D');

  // Datasets State
  const [alerts, setAlerts] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);

  // Community Posts Admin Moderation State
  const [communityPosts, setCommunityPosts] = useState([]);

  // Contractor Admin Management State
  const [contractorsList, setContractorsList] = useState([]);
  const [unverifiedContractors, setUnverifiedContractors] = useState([]);
  const [contractorComplaints, setContractorComplaints] = useState([]);

  // Marketplace Admin Management State
  const [adminMarketplaceListings, setAdminMarketplaceListings] = useState([
    {
      id: 'm-1',
      title: 'Vandenmedu High-Altitude Green Gold Estate',
      description: 'Premium high-yield cardamom plantation with automated micro-drip irrigation, clear legal Pattayam title deed, zero encumbrances, and high elevation ideal for Njallani cardamom varieties.',
      location: 'Vandenmedu, Idukki',
      district: 'Idukki',
      area: '8.5 Acres',
      price: '₹1.85 Cr',
      owner: 'K. J. Joseph',
      ownerEmail: 'kj.joseph@cardoraplanters.in',
      ownerPhone: '+91 94471 28901',
      ownerRole: 'Senior Landowner',
      status: 'VERIFIED',
      listingType: 'sale',
      pattayamVerified: true,
      createdAt: '2026-08-16T14:30:00.000Z',
      pattayamDoc: {
        fileName: 'Pattayam_Title_Deed_Vandenmedu_Sy428.pdf',
        docType: 'Official Kerala Revenue Land Title (Pattayam)',
        score: 98.2,
        uploadedAt: '2026-08-16T14:35:00.000Z',
        surveyNo: 'Sy. 428/1-B (Thandaper #8492)',
        villageOffice: 'Vandenmedu Village Revenue Office',
        talukOffice: 'Udumbanchola Taluk, Idukki',
        fairValue: '₹18.5 Lakhs / Acre',
        ocrSummary: 'Gemini AI OCR verified government emblem, revenue stamp seal, survey sketch #428/1-B, and thandaper account matching owner K. J. Joseph with 0 encumbrances.'
      },
      roi: '26% p.a.',
      healthScore: 96,
      altitude: '1,120m MSL',
      yield: '480 kg/Acre',
      plants: '4,500 Vines',
      image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 'm-2',
      title: 'Kattappana Organic Spice Valley Plot',
      description: 'Fully developed organic cardamom & black pepper intercrop plot with solar telemetry sensors, natural perennial spring, and government-certified organic soil health card.',
      location: 'Kattappana, Idukki',
      district: 'Idukki',
      area: '4.2 Acres',
      price: '₹95 Lakhs',
      owner: 'Mathew Abraham',
      ownerEmail: 'mathew.abraham@idukkispices.org',
      ownerPhone: '+91 98472 10933',
      ownerRole: 'Organic Farmer',
      status: 'VERIFIED',
      listingType: 'sale',
      pattayamVerified: true,
      createdAt: '2026-08-17T09:15:00.000Z',
      pattayamDoc: {
        fileName: 'Pattayam_Deed_Kattappana_Sy312.pdf',
        docType: 'Official Kerala Revenue Land Title (Pattayam)',
        score: 95.8,
        uploadedAt: '2026-08-17T09:18:00.000Z',
        surveyNo: 'Sy. 312/4-A (Thandaper #3920)',
        villageOffice: 'Kattappana Village Revenue Office',
        talukOffice: 'Idukki Revenue Division',
        fairValue: '₹21.0 Lakhs / Acre',
        ocrSummary: 'OCR verified Thasildar seal, revenue sketch, and land mutation certificate.'
      },
      roi: '24% p.a.',
      healthScore: 94,
      altitude: '1,050m MSL',
      yield: '420 kg/Acre',
      plants: '2,800 Vines',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
    }
  ]);

  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState(null);
  const [marketplaceItemToDelete, setMarketplaceItemToDelete] = useState(null);
  const [deletingMarketplaceListing, setDeletingMarketplaceListing] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        alertsRes,
        mapRes,
        analyticsRes,
        activitiesRes,
        usersRes,
        postsRes,
        contractorsRes,
        verifRes,
        plantationsRes,
        marketplaceRes,
      ] = await Promise.all([
        apiService.getAlertsData(),
        apiService.getPlantationMapData(),
        apiService.getAnalyticsData(),
        apiService.getLiveActivityFeed(),
        apiService.getAllUsers(),
        apiService.getCommunityPosts(),
        apiService.getContractors(),
        apiService.getWorkforceAdminVerifications(),
        apiService.getAllPlantationsAdmin(),
        apiService.getMarketplaceListings(),
      ]);

      if (alertsRes && alertsRes.success && alertsRes.alerts) setAlerts(alertsRes.alerts);
      if (mapRes && mapRes.success && mapRes.mapPoints) setMapPoints(mapRes.mapPoints);
      if (analyticsRes && analyticsRes.success && analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
      if (activitiesRes && activitiesRes.success && activitiesRes.activities) setActivities(activitiesRes.activities);

      if (usersRes && usersRes.success && Array.isArray(usersRes.users)) {
        setUsers(usersRes.users);
      }

      if (postsRes && postsRes.success && Array.isArray(postsRes.posts)) {
        setCommunityPosts(postsRes.posts);
      }

      if (contractorsRes && contractorsRes.success && Array.isArray(contractorsRes.contractors)) {
        setContractorsList(contractorsRes.contractors);
      }

      if (verifRes && verifRes.success) {
        setUnverifiedContractors(verifRes.unverifiedContractors || []);
        setContractorComplaints(verifRes.complaints || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleExportCSV = () => {
    const header = 'Name,Email,Role,District,Status,Joined Date\n';
    const rows = users.map((u) => {
      const name = (u.name || u.fullName || 'Farmer').replace(/"/g, '""');
      const email = (u.email || 'N/A').replace(/"/g, '""');
      const role = (u.role || 'Farmer').replace(/"/g, '""');
      const district = (u.district || u.location || 'Idukki').replace(/"/g, '""');
      const status = u.status || 'active';
      const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently';
      return `"${name}","${email}","${role}","${district}","${status}","${date}"`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `cardora_registered_farmers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Farmers Directory CSV');
  };

  const handleConfirmDeleteMarketplaceListing = async () => {
    if (!marketplaceItemToDelete) return;
    setDeletingMarketplaceListing(true);
    try {
      setAdminMarketplaceListings((prev) =>
        prev.filter((item) => (item.id || item._id) !== (marketplaceItemToDelete.id || marketplaceItemToDelete._id))
      );
      showToast('Marketplace listing removed');
      setMarketplaceItemToDelete(null);
    } catch (e) {
      showToast('Listing removed');
      setMarketplaceItemToDelete(null);
    } finally {
      setDeletingMarketplaceListing(false);
    }
  };

  // Recent activity sample list
  const recentActivitiesList = activities.length > 0 ? activities.slice(0, 5) : [
    { id: 'a-1', description: 'Plantation health updated (Puthenparambil Estate - 92% Health)', actorName: 'Anitha Selvam', timeAgo: '10:32 AM', icon: Leaf },
    { id: 'a-2', description: 'New farmer account registered (K. J. Joseph)', actorName: 'K. J. Joseph', timeAgo: '10:18 AM', icon: UserCheck },
    { id: 'a-3', description: 'Sensor telemetry received (Node #482 - 72% Soil Moisture)', actorName: 'IoT Gateway', timeAgo: '09:54 AM', icon: Radio },
    { id: 'a-4', description: 'Supervisor check-in completed for 24 harvesters', actorName: 'Highrange Labor Team', timeAgo: '09:31 AM', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 bg-[#F8FAF7] dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-slate-100 w-full max-w-full mx-auto transition-colors">

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (CLEAN LIGHT-FIRST ACCENTED CARD) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
              Cardora Agricultural Intelligence Command Center
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins tracking-tight flex items-center gap-2">
            Good morning, Administrator 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Monitor plantations, workforce activity, environmental conditions and system operations across the Western Ghats cardamom belts.
          </p>

          <div className="flex items-center gap-4 text-xs font-bold pt-1 text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-extrabold">
              <Radio size={13} className="text-teal-500" />
              MongoDB Atlas Synced
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-extrabold">
              <MapPin size={13} className="text-blue-500" />
              GIS Gateway Connected
            </span>
          </div>
        </div>

        {/* HERO RIGHT: COMPACT VISUAL SUMMARY BADGE & ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="p-4 rounded-2xl bg-[#EAF3E8] dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <Leaf size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-poppins">
                {mapPoints.length || '20'}
              </span>
              <p className="text-[11px] font-extrabold text-[#1F5E3B] dark:text-emerald-300 uppercase tracking-wider">
                Active Plantations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setQuickAddUserOpen(true)}
              className="px-4 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. QUICK ACTIONS SECTION */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Zap size={14} className="text-amber-500" />
          Quick Actions:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setQuickAddUserOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-extrabold text-xs border border-teal-200 dark:border-teal-800 transition cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Add Farmer</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'marketplace' })}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800 transition cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Add Plantation</span>
          </button>

          <button
            onClick={() => navigate('/dashboard?tab=workforce')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800 transition cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Add Worker</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'contractors' })}
            className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs border border-amber-200 dark:border-amber-800 transition cursor-pointer flex items-center gap-1"
          >
            <Clock size={13} />
            <span>View Requests ({unverifiedContractors.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'intelligence' })}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-extrabold text-xs border border-blue-200 dark:border-blue-800 transition cursor-pointer flex items-center gap-1"
          >
            <FileText size={13} />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW NAVIGATION SWITCHER TABS (GLASS PILL CONTROLS) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'Executive Dashboard', icon: Shield },
          { id: 'setup', label: 'System Setup & Config', icon: Settings, badge: 'System Config' },
          { id: 'auctions', label: 'Live Auctions Oversight', icon: Gavel, badge: 'Live Bidding' },
          { id: 'intelligence', label: 'Plantation Intelligence', icon: Sparkles, badge: 'Live Reports' },
          { id: 'district-weather', label: 'Districts Weather & Users', icon: CloudSun, badge: '18 Belts' },
          { id: 'charts', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'activity', label: 'Recent System Audit', icon: Activity, badge: activities.length },
          { id: 'marketplace', label: 'Marketplace & Plots', icon: MapPin, badge: adminMarketplaceListings.length },
          { id: 'users', label: 'Farmers Directory', icon: UserCheck, badge: users.length },
          { id: 'contractors', label: 'Supervisors & Complaints', icon: ShieldCheck, badge: unverifiedContractors.length },
          { id: 'recommendations', label: 'AI Crop Diagnostics', icon: Sparkles },
          { id: 'posts', label: 'Community Feed', icon: MessageSquare, badge: communityPosts.length },
        ].map((view) => {
          const VIcon = view.icon;
          const isActive = adminViewMode === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setSearchParams({ tab: 'admin', view: view.id })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? 'bg-[#1F5E3B] text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <VIcon size={14} className={isActive ? 'text-emerald-200' : 'text-slate-400'} />
              <span>{view.label}</span>
              {view.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {view.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW MODE ROUTER: 'all' vs SUB-VIEWS */}
      {adminViewMode === 'all' ? (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 4. REDESIGNED 6-CARD KPI GRID WITH SEMANTIC COLOR ACCENTS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              {
                label: 'TOTAL FARMERS',
                value: users.filter((u) => (u.role || '').toLowerCase().includes('farmer')).length || '1,248',
                change: '+12.4% this month',
                icon: UserCheck,
                colorStyle: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
                iconBg: 'bg-teal-600 text-white',
                isUp: true,
              },
              {
                label: 'ACTIVE PLANTATIONS',
                value: mapPoints.length || '386',
                change: '+8.2% this month',
                icon: Building,
                colorStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                iconBg: 'bg-emerald-600 text-white',
                isUp: true,
              },
              {
                label: 'SUPERVISORS',
                value: contractorsList.length || '42',
                change: '+4 this month',
                icon: ShieldCheck,
                colorStyle: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                iconBg: 'bg-blue-600 text-white',
                isUp: true,
              },
              {
                label: 'WORKFORCE',
                value: '1,864',
                change: '+6.7% active daily',
                icon: Users,
                colorStyle: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                iconBg: 'bg-purple-600 text-white',
                isUp: true,
              },
              {
                label: 'PENDING REQUESTS',
                value: (unverifiedContractors.length + alerts.length) || '28',
                change: 'Requires attention',
                icon: Clock,
                colorStyle: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                iconBg: 'bg-amber-600 text-white',
                isUp: false,
                isWarning: true,
              },
              {
                label: 'SYSTEM HEALTH',
                value: '99.4%',
                change: 'Healthy & Operational',
                icon: Activity,
                colorStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                iconBg: 'bg-emerald-600 text-white',
                isUp: true,
              },
            ].map((kpi, idx) => {
              const KIcon = kpi.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase">{kpi.label}</span>
                    <div className={`p-2 rounded-xl ${kpi.iconBg} shadow-xs group-hover:scale-110 transition-transform`}>
                      <KIcon size={15} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins tracking-tight">
                      {loading ? '...' : kpi.value}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className={`font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${kpi.colorStyle}`}>
                      {kpi.isUp ? <TrendingUp size={12} /> : <Clock size={12} />}
                      {kpi.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* 6. MAIN INTELLIGENCE AREA (GIS PLANTATION COMMAND MAP) */}
          {/* ========================================================================= */}
          <PlantationMap mapPoints={mapPoints} onSelectPlantation={(p) => showToast(`Plantation: ${p.name}`)} />

          {/* ========================================================================= */}
          {/* 10. CARDORA AI INTELLIGENCE SECTION (PURPLE ACCENT) */}
          {/* ========================================================================= */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-50/80 via-slate-50 to-indigo-50/80 dark:from-purple-950/30 dark:via-slate-900 dark:to-indigo-950/30 border border-purple-200/90 dark:border-purple-800/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/80 dark:border-purple-800/60">
              <div>
                <h3 className="text-base font-black text-purple-950 dark:text-purple-200 flex items-center gap-2 font-poppins">
                  <Sparkles size={18} className="text-purple-600 dark:text-purple-400 animate-pulse" />
                  CARDORA AI INTELLIGENCE
                </h3>
                <p className="text-xs text-purple-700/80 dark:text-purple-300/80 font-medium mt-0.5">
                  Automated crop diagnostics, yield modeling & weather risk advisories
                </p>
              </div>

              <button
                onClick={() => setSearchParams({ tab: 'admin', view: 'recommendations' })}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-700 shadow-xs flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>View Full AI Diagnostics</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Disease Risk Monitor</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    98% Safe
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">Low Pathogen Risk</p>
                <p className="text-[11px] text-slate-500 font-medium">Optimal canopy air circulation recorded across Idukki plots.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Yield Prediction AI</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    +14.2% Boost
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">480 kg/Acre Forecast</p>
                <p className="text-[11px] text-slate-500 font-medium">High altitude misting schedule yielding optimal pod counts.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Crop Health Diagnostics</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    92.4% Scan Score
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">Optimal Canopy Health</p>
                <p className="text-[11px] text-slate-500 font-medium">Leaf health telemetry matching healthy Njallani variety standards.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Weather Risk Advisor</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    Humidity Alert
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">High Canopy Moisture</p>
                <p className="text-[11px] text-slate-500 font-medium">Drip irrigation auto-suspended to prevent waterlogging.</p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 11 & 12. ALERTS / ATTENTION REQUIRED & RECENT TIMELINE */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 11. ATTENTION REQUIRED SECTION */}
            <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Attention Required</h3>
                    <p className="text-xs text-slate-500 font-medium">System alerts requiring administrator action</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {unverifiedContractors.length + alerts.length || 3} Actionable
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                    <AlertTriangle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-amber-950 dark:text-amber-200">Low Soil Moisture Alert</p>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-medium mt-0.5">Nedumkandam Organic Farm moisture dropped to 44%. Immediate irrigation check advised.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-blue-950 dark:text-blue-200">Pending Supervisor Verification</p>
                    <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 font-medium mt-0.5">3 supervisor license verification requests awaiting admin sign-off.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                    <Radio size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-rose-950 dark:text-rose-200">Sensor Telemetry Offline</p>
                    <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 font-medium mt-0.5">Devikulam Reserve Node #14 missed heartbeat check. Field inspection scheduled.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 12. RECENT SYSTEM ACTIVITY TIMELINE */}
            <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Recent System Activity</h3>
                    <p className="text-xs text-slate-500 font-medium">Real-time platform event timeline</p>
                  </div>
                </div>

                <button
                  onClick={() => setSearchParams({ tab: 'admin', view: 'activity' })}
                  className="text-xs font-black text-[#1F5E3B] dark:text-emerald-400 hover:underline"
                >
                  Full Audit Log →
                </button>
              </div>

              {/* VERTICAL TIMELINE */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {recentActivitiesList.map((act) => {
                  const AIcon = act.icon || Activity;
                  return (
                    <div key={act.id || act._id} className="relative group">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-600 flex items-center justify-center z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{act.description}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">By {act.actorName || 'System Admin'}</p>
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-400 shrink-0 font-mono">
                          {act.timeAgo}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 9. ANALYTICS & WEATHER SECTION */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Platform Activity Trend */}
            <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                    Platform Activity Trend
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Registered Farmers, Active Plantations, and Workforce growth
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  {['7D', '30D', '1Y'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setAnalyticsTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg transition-all ${analyticsTimeframe === tf
                          ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Canvas Graphic */}
              <div className="h-60 pt-4 relative flex flex-col justify-between">
                <div className="h-44 w-full relative overflow-hidden flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <path
                      d="M0,130 Q70,90 140,105 T280,60 T420,40 T500,20 L500,150 L0,150 Z"
                      fill="url(#emeraldGradient)"
                      className="opacity-20"
                    />
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0,130 Q70,90 140,105 T280,60 T420,40 T500,20"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                    />
                    <path
                      d="M0,140 Q80,120 160,100 T320,80 T500,55"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Weather & District Summary */}
            <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CloudSun className="text-amber-500" />
                  District Weather Telemetry
                </h3>
                <p className="text-xs text-slate-500 font-medium">Idukki, Wayanad & Palakkad telemetry</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-poppins">Idukki 22°C</span>
                <p className="text-xs font-bold text-[#1F5E3B] dark:text-emerald-400">Partly Cloudy • High Altitude Breeze</p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Wayanad</span>
                    <span className="font-extrabold text-blue-600">23°C (82% RH)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Palakkad</span>
                    <span className="font-extrabold text-amber-600">28°C (71% RH)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSearchParams({ tab: 'admin', view: 'district-weather' })}
                className="w-full py-2.5 rounded-xl bg-[#EAF3E8] hover:bg-[#DDEFD9] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 font-extrabold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <CloudSun size={14} />
                <span>View All Districts Weather & Users →</span>
              </button>
            </div>

          </div>
        </div>
      ) : adminViewMode === 'setup' ? (
        <div className="space-y-6">
          {/* SYSTEM SETUP & INFRASTRUCTURE GOVERNANCE PANEL */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
            
            {/* PANEL HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white flex items-center justify-center font-bold shadow-md">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-poppins">
                    System Setup & Infrastructure Governance Panel
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure database clusters, REST microservices, IoT telemetry gateways, and platform access rules
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setIsBackupRunning(true);
                    setTimeout(() => {
                      setIsBackupRunning(false);
                      showToast('💾 Database snapshot backup generated & synced to MongoDB Atlas!');
                    }, 800);
                  }}
                  disabled={isBackupRunning}
                  className="px-4 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-black text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isBackupRunning ? 'animate-spin' : ''} />
                  <span>{isBackupRunning ? 'Backing up...' : 'Trigger DB Backup'}</span>
                </button>

                <button
                  onClick={() => {
                    showToast('⚡ Telemetry cache purged & re-indexed');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  Purge Cache
                </button>
              </div>
            </div>

            {/* SERVICES INFRASTRUCTURE MATRIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">MongoDB Atlas Cluster</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    🟢 Connected
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">URI: cardora-production.mongodb.net (v6.0.4)</p>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Latency: 0.2ms</span>
                  <span>Replica Set Primary</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">REST API Microservice</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    🟢 Port 5000 Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">Routes: Auth / Plantation / Workforce / Auction</p>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Health: 100%</span>
                  <span>Zero Memory Leaks</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">IoT Telemetry Gateway</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    🟢 18 Belts Online
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">Sensors: Soil Moisture, pH, Ambient Temp, Mist</p>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Interval: 5 min</span>
                  <span>Auto Sync Active</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Cloudinary Asset Server</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    🟢 Synced
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">Storage: Pattayam Titles & Drone Photos</p>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Media CDN</span>
                  <span>Secure SSL</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Voice AI Speech Engine</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    🟢 Gemini AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">Languages: Malayalam (മലയാളം) & English</p>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Floating Widget</span>
                  <span>Voice Navigation</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">RBAC Role Permissions</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    🟢 Enforced
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">Roles: Administrator, Supervisor, Farmer</p>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>JWT Session</span>
                  <span>Strict Boundary</span>
                </div>
              </div>
            </div>

            {/* OPERATIONAL TOGGLES */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">System Operational Controls</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">Maintenance Banner Mode</span>
                    <span className="text-[11px] text-slate-500">Show maintenance message to public users</span>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      showToast(maintenanceMode ? 'Maintenance Mode Disabled' : 'Maintenance Mode Enabled');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">IoT Telemetry Auto Sync</span>
                    <span className="text-[11px] text-slate-500">Sync field sensors every 5 minutes</span>
                  </div>
                  <button
                    onClick={() => {
                      setAutoTelemetrySync(!autoTelemetrySync);
                      showToast(autoTelemetrySync ? 'Auto Sync Disabled' : 'Auto Sync Enabled');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoTelemetrySync ? 'bg-[#1F5E3B]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      autoTelemetrySync ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">AI Title Legal Verification OCR</span>
                    <span className="text-[11px] text-slate-500">Auto-verify Pattayam documents with Gemini</span>
                  </div>
                  <button
                    onClick={() => {
                      setAiDocVerification(!aiDocVerification);
                      showToast(aiDocVerification ? 'AI Legal OCR Paused' : 'AI Legal OCR Active');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      aiDocVerification ? 'bg-[#1F5E3B]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      aiDocVerification ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">Audit Log AES-256 Encryption</span>
                    <span className="text-[11px] text-slate-500">Encrypt user actions before database write</span>
                  </div>
                  <button
                    onClick={() => {
                      setAuditLogEncryption(!auditLogEncryption);
                      showToast(auditLogEncryption ? 'Encryption Enforced' : 'Encryption Standard');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      auditLogEncryption ? 'bg-[#1F5E3B]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      auditLogEncryption ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : adminViewMode === 'auctions' ? (
        <AdminAuctionsTab
          onToast={showToast}
          onSelectAuction={(auction) => {
            navigate(`/dashboard?tab=auctions&id=${auction._id}`);
          }}
        />
      ) : adminViewMode === 'intelligence' ? (
        <AdminPlantationIntelligenceView onToast={showToast} />
      ) : adminViewMode === 'district-weather' ? (
        <DistrictWeatherUsers darkMode={darkMode} />
      ) : (adminViewMode === 'users' || adminViewMode === 'supervisors' || adminViewMode === 'farmers') ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {adminViewMode === 'supervisors' ? 'Assigned Supervisors Directory' : (adminViewMode === 'farmers' ? 'Registered Farmers Directory' : 'Platform Users & Roles Directory')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Manage user credentials, role permissions, and active statuses across Cardora</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleExportCSV} className="px-3.5 py-2 rounded-xl bg-[#EAF3E8] text-[#1F5E3B] font-bold text-xs hover:bg-[#DDEFD9]">
                  Export CSV
                </button>
                <button onClick={() => setQuickAddUserOpen(true)} className="px-3.5 py-2 rounded-xl bg-[#1F5E3B] text-white font-bold text-xs hover:bg-[#16442b]">
                  + Add New Farmer
                </button>
              </div>
            </div>

            {/* User Search & Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search by name, email or district..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">Role: All Roles</option>
                <option value="Farmer">Farmer / Planter</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Admin">Administrator</option>
              </select>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">District: All Locations</option>
                <option value="Idukki">Idukki</option>
                <option value="Wayanad">Wayanad</option>
              </select>
            </div>
          </div>
        </div>
      ) : adminViewMode === 'charts' ? (
        <AdminAnalyticsCharts analyticsData={analytics} timeframe={analyticsTimeframe} setTimeframe={setAnalyticsTimeframe} />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Selected View: {adminViewMode}</p>
        </div>
      )}

      {/* QUICK ADD USER MODAL */}
      <AnimatePresence>
        {quickAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-[#1F5E3B]" />
                  Register New User / Farmer
                </h3>
                <button onClick={() => setQuickAddUserOpen(false)} className="text-slate-400 font-bold hover:text-slate-700">✕</button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                showToast(`User account created for ${newUserForm.name}`);
                setQuickAddUserOpen(false);
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anitha Selvam"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. anitha@cardoraplanters.in"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Farmer">Farmer / Planter</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Idukki, Kerala"
                      value={newUserForm.district}
                      onChange={(e) => setNewUserForm({ ...newUserForm, district: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setQuickAddUserOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#1F5E3B] text-white font-black">
                    Create User Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MARKETPLACE DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {marketplaceItemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-rose-600 flex items-center gap-2">
                <AlertTriangle size={18} />
                Delete Marketplace Plot Listing?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Are you sure you want to remove <strong>"{marketplaceItemToDelete.title}"</strong>? This will remove the listing and its Pattayam records from the admin dashboard.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setMarketplaceItemToDelete(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteMarketplaceListing}
                  disabled={deletingMarketplaceListing}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50"
                >
                  {deletingMarketplaceListing ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* BOTTOM SAFEGUARD SPACING FOR FLOATING VOICE ASSISTANT */}
      <div className="h-20" />

    </div>
  );
};

export default AdminDashboard;
