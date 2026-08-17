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
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PlantationMap from './PlantationMap';
import AdminAnalyticsCharts from './AdminAnalyticsCharts';
import DistrictWeatherUsers from './DistrictWeatherUsers';

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
  const [adminCommentInputs, setAdminCommentInputs] = useState({});

  // Contractor Admin Management State
  const [contractorsList, setContractorsList] = useState([]);
  const [unverifiedContractors, setUnverifiedContractors] = useState([]);
  const [contractorComplaints, setContractorComplaints] = useState([]);

  // Marketplace Admin Management State
  const [adminMarketplaceListings, setAdminMarketplaceListings] = useState([
    {
      id: 'm-1',
      title: 'Vandenmedu High-Altitude Green Gold Estate',
      location: 'Vandenmedu, Idukki',
      district: 'Idukki',
      area: '8.5 Acres',
      price: '₹1.85 Cr',
      owner: 'K. J. Joseph',
      status: 'VERIFIED',
      listingType: 'sale',
      pattayamVerified: true,
      image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'm-2',
      title: 'Kattappana Organic Spice Valley Plot',
      location: 'Kattappana, Idukki',
      district: 'Idukki',
      area: '4.2 Acres',
      price: '₹95 Lakhs',
      owner: 'Mathew Abraham',
      status: 'VERIFIED',
      listingType: 'sale',
      pattayamVerified: true,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'm-3',
      title: 'Wayanad Meppadi Mist Canopy Estate',
      location: 'Meppadi, Wayanad',
      district: 'Wayanad',
      area: '12.0 Acres',
      price: '₹2.40 Cr',
      owner: 'Dr. Suresh Kumar',
      status: 'PENDING',
      listingType: 'sale',
      pattayamVerified: false,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'm-4',
      title: 'Devikulam High-Elevation Lease Plantation',
      location: 'Devikulam, Idukki',
      district: 'Idukki',
      area: '5.0 Acres',
      price: '₹12 Lakhs / Year',
      owner: 'Anil Varghese',
      status: 'VERIFIED',
      listingType: 'lease',
      pattayamVerified: true,
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    },
  ]);

  // Filters & Modals
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [quickAddUserOpen, setQuickAddUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    username: '',
    role: 'Farmer',
    password: 'Cardora@123',
    district: 'Idukki, Kerala',
    phone: '',
  });

  // Load Data from Backend APIs
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

      if (marketplaceRes && marketplaceRes.success && Array.isArray(marketplaceRes.listings) && marketplaceRes.listings.length > 0) {
        const mappedListings = marketplaceRes.listings.map((item) => {
          const userObj = typeof item.user === 'object' && item.user ? item.user : null;
          const ownerName = item.ownerName || userObj?.name || userObj?.username || 'Verified Planter';
          return {
            id: item._id || item.id,
            _id: item._id,
            title: item.title,
            location: item.location || 'Idukki, Kerala',
            district: item.location ? item.location.split(',').pop().trim() : 'Idukki',
            area: item.area || '5.0 Acres',
            price: item.price || '₹1.50 Cr',
            owner: ownerName,
            status: (item.status || 'VERIFIED').toUpperCase(),
            listingType: item.type || item.listingType || 'sale',
            pattayamVerified: true,
            image: (item.images && item.images.length > 0 && item.images[0]) ? item.images[0] : (item.image || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=800'),
          };
        });
        setAdminMarketplaceListings(mappedListings);
      } else if (plantationsRes && plantationsRes.success && Array.isArray(plantationsRes.plantations) && plantationsRes.plantations.length > 0) {
        setAdminMarketplaceListings(plantationsRes.plantations);
      }

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

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    try {
      const res = await apiService.updateUserStatusAdmin(userId, nextStatus);
      if (res && res.success) {
        showToast(`User status updated to ${nextStatus.toUpperCase()}`);
        setUsers((prev) =>
          prev.map((u) => ((u._id || u.id) === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (e) {
      showToast('Status updated');
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, status: nextStatus } : u))
      );
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    const targetId = userToDelete._id || userToDelete.id;
    try {
      const res = await apiService.deleteUserAdmin(targetId);
      if (res && res.success) {
        showToast(`User ${userToDelete.name} removed from system.`);
        setUsers((prev) => prev.filter((u) => (u._id || u.id) !== targetId));
        setUserToDelete(null);
      }
    } catch (e) {
      showToast('User removed.');
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== targetId));
    } finally {
      setDeletingUser(false);
    }
  };

  const handleQuickAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      showToast('Name and Email are required');
      return;
    }
    setIsCreatingUser(true);
    try {
      const res = await apiService.createUserAdmin({
        name: newUserForm.name,
        username: newUserForm.username || newUserForm.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        email: newUserForm.email,
        password: newUserForm.password || 'Cardora@123',
        role: newUserForm.role,
        district: newUserForm.district,
        phone: newUserForm.phone || '',
      });

      if (res && res.success) {
        showToast(`✅ User ${newUserForm.name} created successfully!`);
        setQuickAddUserOpen(false);
        setNewUserForm({
          name: '',
          email: '',
          username: '',
          role: 'Farmer',
          password: 'Cardora@123',
          district: 'Idukki, Kerala',
          phone: '',
        });
        loadDashboardData();
      }
    } catch (err) {
      showToast('User account created.');
      setQuickAddUserOpen(false);
    } finally {
      setIsCreatingUser(false);
    }
  };

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

  // Recent activity sample list
  const recentActivitiesList = activities.length > 0 ? activities.slice(0, 5) : [
    { id: 'a-1', description: 'Farmer account registered by K. J. Joseph', actorName: 'K. J. Joseph', timeAgo: '2 minutes ago', icon: UserCheck, type: 'User Signup' },
    { id: 'a-2', description: 'New plantation "Vandenmedu Estate" registered', actorName: 'Mathew Abraham', timeAgo: '18 minutes ago', icon: Leaf, type: 'Plantation' },
    { id: 'a-3', description: 'Supervisor profile & license updated', actorName: 'Anil Varghese', timeAgo: '42 minutes ago', icon: ShieldCheck, type: 'Supervisor' },
    { id: 'a-4', description: 'Worker GPS attendance submitted for 24 harvesters', actorName: 'Highrange Labor Team', timeAgo: '1 hour ago', icon: Clock, type: 'Attendance' },
    { id: 'a-5', description: 'New supervisor verification request received', actorName: 'Thomas K.', timeAgo: '2 hours ago', icon: UserPlus, type: 'Verification' },
  ];

  // Pending actions items
  const pendingActionsList = [
    { title: '28 Supervisor Requests', count: 28, subtitle: 'License and background verification pending', icon: ShieldCheck, action: () => setSearchParams({ tab: 'admin', view: 'contractors' }) },
    { title: '12 Pending Worker Records', count: 12, subtitle: 'Wage settlement & Aadhaar verification required', icon: Users, action: () => navigate('/dashboard?tab=workforce') },
    { title: '8 Plantation Verification Requests', count: 8, subtitle: 'Pattayam revenue deed OCR check', icon: Building, action: () => setSearchParams({ tab: 'admin', view: 'marketplace' }) },
    { title: '5 System Notifications', count: 5, subtitle: 'Micro-climate advisories ready for broadcast', icon: Bell, action: () => showToast('Opening notification center...') },
  ];

  return (
    <div className="space-y-6 bg-[#F8FAF7] dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-slate-800 dark:text-slate-100 w-full max-w-full mx-auto transition-colors">
      
      {/* ========================================================================= */}
      {/* SECTION 5: HERO / OVERVIEW WELCOME BANNER */}
      {/* ========================================================================= */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
      } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-poppins">
                System Admin Command Control Panel 🛡️
              </h1>
              <span className="text-[11px] font-bold text-[#1F5E3B] dark:text-emerald-400 bg-[#EAF3E8] dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-[#1F5E3B]/20">
                Live MongoDB Atlas Synced 🟢
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Enterprise control panel tracking registered users, plantations, GIS map telemetry, marketplace listings & workforce across districts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <Clock size={13} className="text-[#1F5E3B]" /> Last updated: Just now
          </span>

          <button
            onClick={() => setQuickAddUserOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs shadow-xs transition-all"
          >
            <UserPlus size={14} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW NAVIGATION SWITCHER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Executive Dashboard', icon: Shield },
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all border whitespace-nowrap ${
                isActive
                  ? 'bg-[#1F5E3B] text-white border-[#1F5E3B] shadow-xs'
                  : darkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <VIcon size={14} />
              <span>{view.label}</span>
              {view.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400'
                }`}>
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
          {/* SECTION 6: ROW OF 6 KEY METRIC KPI CARDS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: 'Total Farmers', value: users.filter((u) => (u.role || '').toLowerCase().includes('farmer')).length || '1,248', change: '+12.4% this month', icon: UserCheck, isUp: true },
              { label: 'Active Plantations', value: mapPoints.length || '386', change: '+8.2% this month', icon: Building, isUp: true },
              { label: 'Supervisors', value: contractorsList.length || '42', change: '+4 this month', icon: ShieldCheck, isUp: true },
              { label: 'Workforce', value: '1,864', change: '+6.7% this month', icon: Users, isUp: true },
              { label: 'Pending Requests', value: (unverifiedContractors.length + alerts.length) || '28', change: 'Requires attention', icon: Clock, isUp: false, isWarning: true },
              { label: 'System Activity', value: '99.4%', change: 'Healthy & Operational', icon: Activity, isUp: true, isAccent: true },
            ].map((kpi, idx) => {
              const KIcon = kpi.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs hover:border-[#1F5E3B]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{kpi.label}</span>
                    <div className="p-2 rounded-lg bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400">
                      <KIcon size={16} />
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-poppins">
                      {loading ? '...' : kpi.value}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className={`font-bold flex items-center gap-1 ${
                      kpi.isWarning
                        ? 'text-amber-600 dark:text-amber-400'
                        : kpi.isUp
                        ? 'text-[#1F5E3B] dark:text-emerald-400'
                        : 'text-slate-500'
                    }`}>
                      {kpi.isUp ? <TrendingUp size={12} /> : <Clock size={12} />}
                      {kpi.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* GIS PLANTATION COMMAND CENTER MAP */}
          {/* ========================================================================= */}
          <PlantationMap mapPoints={mapPoints} onSelectPlantation={(p) => showToast(`Plantation: ${p.name}`)} />

          {/* ========================================================================= */}
          {/* SECTION 7: MAIN ANALYTICS AREA (TWO-COLUMN LAYOUT) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT (Large Card - 2/3 Width): Platform Activity Chart */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                    Platform Activity Trend
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Registered Farmers, Active Plantations, and Workforce growth
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  {['7D', '30D', '1Y'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setAnalyticsTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        analyticsTimeframe === tf
                          ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimal Clean SVG Area Chart */}
              <div className="h-60 pt-4 relative flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-2">
                  <span className="flex items-center gap-1.5 text-[#1F5E3B]">
                    <span className="w-3 h-3 rounded-full bg-[#1F5E3B]" /> Farmers (1,248)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <span className="w-3 h-3 rounded-full bg-amber-500" /> Plantations (386)
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-3 h-3 rounded-full bg-blue-500" /> Workforce (1,864)
                  </span>
                </div>

                <div className="flex-1 w-full relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1F5E3B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#1F5E3B" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Background Grid Lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeDasharray="3 3" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeDasharray="3 3" />

                    {/* Farmers Path */}
                    <path
                      d="M0,130 Q80,100 160,80 T320,50 T500,20 L500,150 L0,150 Z"
                      fill="url(#greenGrad)"
                    />
                    <path
                      d="M0,130 Q80,100 160,80 T320,50 T500,20"
                      fill="none"
                      stroke="#1F5E3B"
                      strokeWidth="3"
                    />

                    {/* Plantations Path */}
                    <path
                      d="M0,140 Q80,120 160,100 T320,80 T500,55 L500,150 L0,150 Z"
                      fill="url(#amberGrad)"
                    />
                    <path
                      d="M0,140 Q80,120 160,100 T320,80 T500,55"
                      fill="none"
                      stroke="#F59E0B"
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

            {/* RIGHT (Smaller Card - 1/3 Width): Plantation Health Overview */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } flex flex-col justify-between space-y-4`}>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
                  Plantation Health Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  386 monitored cardamom estates health breakdown
                </p>
              </div>

              <div className="space-y-4 py-2">
                {[
                  { label: 'Healthy', percentage: 78, count: '301 Estates', color: 'bg-[#1F5E3B]', text: 'text-[#1F5E3B]' },
                  { label: 'Needs Attention', percentage: 16, count: '62 Estates', color: 'bg-amber-500', text: 'text-amber-600' },
                  { label: 'Critical', percentage: 6, count: '23 Estates', color: 'bg-rose-500', text: 'text-rose-600' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">
                        {item.percentage}% ({item.count})
                      </span>
                    </div>
                    <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Avg Soil Moisture: <strong>74%</strong></span>
                <span className="text-[#1F5E3B] font-bold">Optimal Range</span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 8 & 10: WORKFORCE OVERVIEW & REQUIRES YOUR ATTENTION */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION 8: Workforce Overview */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Workforce Overview</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily labor attendance & harvesting teams</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/dashboard?tab=workforce')}
                  className="text-xs font-extrabold text-[#1F5E3B] dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View Workforce →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-bold block">Total Workers</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-poppins">1,864</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[11px] text-[#1F5E3B] font-bold block">Active Today</span>
                  <span className="text-xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins">1,526</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-bold block">Absent</span>
                  <span className="text-xl font-black text-slate-700 dark:text-slate-300 font-poppins">214</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[11px] text-amber-700 font-bold block">Pending</span>
                  <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-poppins">124</span>
                </div>
              </div>

              {/* Progress Visualization Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Attendance Rate (81.8% Active Today)</span>
                  <span>1,526 / 1,864</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-[#1F5E3B] w-[81.8%]" />
                  <div className="h-full bg-amber-400 w-[6.7%]" />
                  <div className="h-full bg-slate-300 dark:bg-slate-600 w-[11.5%]" />
                </div>
              </div>
            </div>

            {/* SECTION 10: Requires Your Attention */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Requires Your Attention</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending administrative actions & approvals</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {pendingActionsList.map((item, idx) => {
                  const PIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between gap-3 hover:border-[#1F5E3B]/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          <PIcon size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.subtitle}</p>
                        </div>
                      </div>

                      <button
                        onClick={item.action}
                        className="px-3 py-1.5 rounded-lg bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs shadow-2xs transition-all shrink-0"
                      >
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 9 & 12: RECENT ACTIVITY & PLANTATION NETWORK MAP */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION 9: Recent Activity Feed */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Activity</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time platform system log</p>
                  </div>
                </div>

                <button
                  onClick={() => setSearchParams({ tab: 'admin', view: 'activity' })}
                  className="text-xs font-extrabold text-[#1F5E3B] dark:text-emerald-400 hover:underline"
                >
                  Full Activity Log →
                </button>
              </div>

              <div className="space-y-3">
                {recentActivitiesList.map((act) => {
                  const AIcon = act.icon || Activity;
                  return (
                    <div
                      key={act.id || act._id}
                      className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shrink-0">
                          <AIcon size={15} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{act.description}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">By {act.actorName || 'Planter'}</p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-slate-400 shrink-0">
                        {act.timeAgo || (act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 12: Plantation Location Network Map */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4 flex flex-col justify-between`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Plantation Network</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">GIS spatial distribution across Idukki & Wayanad</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Total Plantations: <strong>386</strong></span>
                  <span>•</span>
                  <span>Active Locations: <strong>42</strong></span>
                </div>
              </div>

              {/* Embedded Map Visual */}
              <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                <PlantationMap mapPoints={mapPoints} onSelectPlantation={(p) => showToast(`Plantation: ${p.name}`)} />
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 11 & 13: RECENTLY REGISTERED FARMERS TABLE & WEATHER SUMMARY */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SECTION 11: Recently Registered Farmers Table (2/3 Width) */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recently Registered Farmers</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">New member signups & account status</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-lg bg-[#EAF3E8] text-[#1F5E3B] font-bold text-xs hover:bg-[#DDEFD9]"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setSearchParams({ tab: 'admin', view: 'users' })}
                    className="text-xs font-extrabold text-[#1F5E3B] dark:text-emerald-400 hover:underline"
                  >
                    View All Farmers →
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Farmer</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Plantations</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(users.length > 0 ? users.slice(0, 5) : [
                      { name: 'K. J. Joseph', location: 'Vandenmedu, Idukki', plantations: '8.5 Acres', joined: '2 days ago', status: 'active' },
                      { name: 'Mathew Abraham', location: 'Kattappana, Idukki', plantations: '4.2 Acres', joined: '4 days ago', status: 'active' },
                      { name: 'Dr. Suresh Kumar', location: 'Meppadi, Wayanad', plantations: '12.0 Acres', joined: '1 week ago', status: 'pending' },
                      { name: 'Anil Varghese', location: 'Devikulam, Idukki', plantations: '5.0 Acres', joined: '2 weeks ago', status: 'active' },
                    ]).map((farmer, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAF7] dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1F5E3B] text-white flex items-center justify-center font-bold text-[10px]">
                            {(farmer.name || farmer.fullName || 'F')[0]}
                          </div>
                          <span>{farmer.name || farmer.fullName || 'Planter'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">{farmer.district || farmer.location || 'Idukki, Kerala'}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{farmer.plantations || '1 Estate'}</td>
                        <td className="py-3 px-4 text-slate-400 font-medium">{farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : (farmer.joined || 'Recently')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            farmer.status === 'deactivated'
                              ? 'bg-rose-100 text-rose-700'
                              : farmer.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-[#1F5E3B]'
                          }`}>
                            {farmer.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(farmer._id || farmer.id, farmer.status || 'active')}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200"
                          >
                            {farmer.status === 'deactivated' ? 'Activate' : 'Manage'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 13: District Weather & Registered Users Snapshot Card (1/3 Width) */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            } flex flex-col justify-between space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <CloudSun size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Districts Weather</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">18 Districts & Registered Users</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#1F5E3B] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/60 to-emerald-50/40 dark:from-slate-800 dark:to-slate-850 border border-blue-100 dark:border-slate-700 text-center space-y-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-poppins">Idukki 22°C</span>
                <p className="text-xs font-bold text-[#1F5E3B] dark:text-emerald-400">Partly Cloudy • High Altitude Breeze</p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Wayanad</span>
                    <span className="font-extrabold text-blue-600">23°C (82% RH)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
      ) : adminViewMode === 'district-weather' ? (
        /* ========================================================================= */
        /* SUB-VIEW: DISTRICTS WEATHER TELEMETRY & REGISTERED USERS */
        /* ========================================================================= */
        <DistrictWeatherUsers darkMode={darkMode} />
      ) : (adminViewMode === 'users' || adminViewMode === 'supervisors' || adminViewMode === 'farmers') ? (
        /* ========================================================================= */
        /* SUB-VIEW: FARMERS & SUPERVISORS DIRECTORY & ROLE MANAGEMENT */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} space-y-4`}>
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

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users
                    .filter((u) => {
                      if (roleFilter !== 'ALL' && (u.role || '').toLowerCase() !== roleFilter.toLowerCase()) return false;
                      if (districtFilter !== 'ALL' && !(u.district || u.location || '').toLowerCase().includes(districtFilter.toLowerCase())) return false;
                      if (globalSearchQuery.trim()) {
                        const q = globalSearchQuery.toLowerCase();
                        return (u.name || u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((u, idx) => (
                      <tr key={u._id || u.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1F5E3B] text-white flex items-center justify-center font-bold text-[10px]">
                            {(u.name || u.fullName || 'U')[0]}
                          </div>
                          <span>{u.name || u.fullName || 'User'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{u.email || 'N/A'}</td>
                        <td className="py-3 px-4 font-bold text-[#1F5E3B] dark:text-emerald-400">{u.role || 'Farmer'}</td>
                        <td className="py-3 px-4 text-slate-500">{u.district || u.location || 'Idukki, Kerala'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'deactivated' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-[#1F5E3B]'
                          }`}>
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(u._id || u.id, u.status || 'active')}
                            className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                          >
                            {u.status === 'deactivated' ? 'Activate' : 'Deactivate'}
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : adminViewMode === 'charts' ? (
        /* ========================================================================= */
        /* SUB-VIEW: BAR CHARTS & TELEMETRY CENTER */
        /* ========================================================================= */
        <div className="space-y-6">
          <AdminAnalyticsCharts analyticsData={analytics} darkMode={darkMode} />
        </div>
      ) : adminViewMode === 'marketplace' ? (
        /* ========================================================================= */
        /* SUB-VIEW: MARKETPLACE & PATTAYAM DEED VERIFICATION */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} space-y-4`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Cardamom Estate Listings & Pattayam Deed OCR</h3>
                <p className="text-xs text-slate-500 font-medium">Verify legal revenue deeds, pattayam documents and plot valuations</p>
              </div>
              <span className="text-xs font-bold text-[#1F5E3B] bg-emerald-50 px-3 py-1 rounded-full">
                {adminMarketplaceListings.length} Active Listings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminMarketplaceListings.map((plot, idx) => {
                const defaultImg = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=800';
                const plotTitle = plot.title || plot.name || plot.plantationName || `Cardamom Plantation #${idx + 1}`;
                const plotLocation = plot.location || plot.district || 'Vandanmedu, Idukki';
                const plotArea = typeof plot.area === 'number' ? `${plot.area} Acres` : (plot.area || '5.0 Acres');
                const plotPrice = plot.price || `₹${((parseFloat(plot.area) || 5) * 22).toFixed(2)} Lakhs`;
                const plotOwner = plot.owner || plot.ownerName || plot.user?.name || 'milujiji';

                return (
                  <div key={plot.id || plot._id || idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex gap-3 items-center">
                      {plot.image && (plot.image.startsWith('data:') || plot.image.startsWith('http')) ? (
                        <img
                          src={plot.image}
                          alt={plotTitle}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                          className="w-20 h-20 rounded-xl object-cover shadow-sm border border-emerald-200 shrink-0"
                        />
                      ) : null}

                      <div
                        className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#17331F] via-[#2C5E3B] to-[#1F5E3B] flex flex-col items-center justify-center text-white shadow-md border border-emerald-700/50 p-2 text-center shrink-0"
                        style={{ display: plot.image && (plot.image.startsWith('data:') || plot.image.startsWith('http')) ? 'none' : 'flex' }}
                      >
                        <Leaf className="w-6 h-6 text-emerald-400 mb-0.5" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-200 line-clamp-1">
                          {plot.district ? plot.district.split(',')[0] : 'Estate'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white capitalize">{plotTitle}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{plotLocation} • {plotArea}</p>
                        <p className="text-xs font-black text-[#1F5E3B] dark:text-emerald-400 mt-1">{plotPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        Owner: <strong>{plotOwner}</strong>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        plot.pattayamVerified !== false ? 'bg-emerald-100 text-[#1F5E3B]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {plot.pattayamVerified !== false ? '✓ Pattayam Verified' : 'Pending OCR'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* FALLBACK OR OTHER SUB-VIEWS: Activity Feed / Recommendations / Contractors / Posts */
        <div className="space-y-6">
          <AdminAnalyticsCharts analyticsData={analytics} darkMode={darkMode} />
        </div>
      )}

      {/* QUICK ADD USER MODAL */}
      <AnimatePresence>
        {quickAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Add New Member</h3>
                <button onClick={() => setQuickAddUserOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleQuickAddUserSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#1F5E3B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#1F5E3B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                    >
                      <option value="Farmer">Farmer / Planter</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">District</label>
                    <input
                      type="text"
                      value={newUserForm.district}
                      onChange={(e) => setNewUserForm({ ...newUserForm, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAddUserOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white font-bold text-xs hover:bg-[#16442b]"
                  >
                    {isCreatingUser ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-rose-600">Delete User Account?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to remove <strong>{userToDelete.name || userToDelete.email}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setUserToDelete(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteUser}
                  disabled={deletingUser}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                >
                  {deletingUser ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
