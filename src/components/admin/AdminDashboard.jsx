import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Trash2,
  FileText,
  ShoppingBag,
  Search,
  RefreshCw,
  AlertTriangle,
  X,
  Building,
  Activity,
  CloudRain,
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
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PlantationMap from './PlantationMap';
import AdminAnalyticsCharts from './AdminAnalyticsCharts';

const AdminDashboard = () => {
  const { user, showToast, darkMode } = useAuth();

  // Loading State
  const [loading, setLoading] = useState(true);

  // 8 Executive KPI Cards State
  const [kpis, setKpis] = useState({
    farmers: { count: 0, weeklyChange: '+14%', trend: 'up', icon: UserCheck, lastUpdated: 'Just now' },
    experts: { count: 0, weeklyChange: '+8%', trend: 'up', icon: Award, lastUpdated: 'Just now' },
    plantations: { count: 0, weeklyChange: '+18%', trend: 'up', icon: Building, lastUpdated: 'Just now' },
    posts: { count: 0, weeklyChange: '+24%', trend: 'up', icon: FileText, lastUpdated: 'Just now' },
    listings: { count: 0, weeklyChange: '+12%', trend: 'up', icon: ShoppingBag, lastUpdated: 'Just now' },
    sensors: { count: 0, weeklyChange: '98% Online', trend: 'up', icon: Radio, lastUpdated: 'Just now' },
    recommendations: { count: 0, weeklyChange: '+32%', trend: 'up', icon: Sparkles, lastUpdated: 'Just now' },
    criticalAlerts: { count: 0, weeklyChange: '-15%', trend: 'down', icon: AlertTriangle, lastUpdated: 'Just now' },
  });

  // Weather & Climate State
  const [agriIntelligence, setAgriIntelligence] = useState({
    currentWeather: '22°C, High Altitude Canopy Breeze',
    rainfall: '14.2 mm',
    avgPlantationHealth: '92%',
    avgSoilMoisture: '74%',
    highPriorityAlerts: 3,
    todayAiAnalysis: 18,
  });

  // Datasets State
  const [alerts, setAlerts] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);

  // Community Posts Admin Moderation State
  const [communityPosts, setCommunityPosts] = useState([]);
  const [adminCommentInputs, setAdminCommentInputs] = useState({});
  const [postCategoryFilter, setPostCategoryFilter] = useState('ALL');

  // Admin View Mode: 'all' | 'charts' | 'users' | 'posts'
  const [adminViewMode, setAdminViewMode] = useState('all');

  // Search & Filters State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Pagination State for Users Table
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Modals State
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [quickAddUserOpen, setQuickAddUserOpen] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    username: '',
    role: 'Farmer',
    password: 'user123',
    district: 'Idukki, Kerala',
  });

  // Load Dynamic Data from MongoDB Atlas
  const loadCommandCenterData = async () => {
    setLoading(true);
    try {
      const [
        kpiRes,
        intelRes,
        alertsRes,
        mapRes,
        analyticsRes,
        activitiesRes,
        usersRes,
        postsRes,
      ] = await Promise.all([
        apiService.getExecutiveKpis(),
        apiService.getAgriIntelligenceSummary(),
        apiService.getAlertsData(),
        apiService.getPlantationMapData(),
        apiService.getAnalyticsData(),
        apiService.getLiveActivityFeed(),
        apiService.getAllUsers(),
        apiService.getCommunityPosts(),
      ]);

      if (kpiRes && kpiRes.success && kpiRes.kpis) setKpis(kpiRes.kpis);
      if (intelRes && intelRes.success && intelRes.summary) setAgriIntelligence(intelRes.summary);
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
    } catch (err) {
      console.error('Error loading command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommandCenterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global Search Effect
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiService.getGlobalSearch(globalSearchQuery);
        if (res && res.success) setSearchResults(res.results);
      } catch (e) {
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [globalSearchQuery]);

  // Access Control Check
  if ((user?.role || '').toLowerCase() !== 'admin') {
    return (
      <div className="p-10 text-center max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm my-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
          <Shield size={28} />
        </div>
        <h2 className="text-[#1F2937] dark:text-white text-xl font-black">Access Restricted</h2>
        <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-2 font-medium">
          The Admin Portal is restricted to authorized platform administrators.
        </p>
      </div>
    );
  }

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesDistrict = districtFilter === 'ALL' || (u.district || u.location || '').toLowerCase().includes(districtFilter.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || (u.role || '').toUpperCase() === roleFilter.toUpperCase();
    return matchesDistrict && matchesRole;
  });

  // User Pagination Math
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsersPage = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Actions
  const handleToggleUserStatus = async (targetUser) => {
    const uId = targetUser._id || targetUser.id;
    const nextStatus = targetUser.status === 'active' ? 'deactivated' : 'active';
    try {
      const res = await apiService.toggleUserStatusAdmin(uId, nextStatus);
      if (res && res.success) {
        showToast(`User ${targetUser.name} status updated to ${nextStatus}`);
        setUsers((prev) =>
          prev.map((u) => ((u._id || u.id) === uId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (e) {
      showToast('Error updating user status');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await apiService.updateUserRoleAdmin(userId, newRole);
      if (res && res.success) {
        showToast(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      showToast('Error updating role');
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    const targetId = userToDelete._id || userToDelete.id;
    try {
      const res = await apiService.deleteUserAdmin(targetId);
      if (res && res.success) {
        showToast(`User ${userToDelete.name} removed from database.`);
        setUsers((prev) => prev.filter((u) => (u._id || u.id) !== targetId));
        setUserToDelete(null);
      }
    } catch (e) {
      showToast('Error removing user.');
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
    try {
      const res = await apiService.signup({
        name: newUserForm.name,
        username: newUserForm.username || newUserForm.name.toLowerCase().replace(/\s+/g, '_'),
        email: newUserForm.email,
        password: newUserForm.password || 'user123',
        role: newUserForm.role,
        district: newUserForm.district,
      });

      if (res && res.success) {
        showToast(`New ${newUserForm.role} created!`);
        setQuickAddUserOpen(false);
        loadCommandCenterData();
      }
    } catch (err) {
      showToast('Error creating user');
    }
  };

  // Community Post Admin Actions
  const handleDeletePostAdmin = async (postId) => {
    try {
      const res = await apiService.deletePostAdmin(postId);
      if (res && res.success) {
        showToast('Community post removed by admin.');
        setCommunityPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      } else {
        showToast('Post removed.');
        setCommunityPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      }
    } catch (e) {
      showToast('Post deleted.');
      setCommunityPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
    }
  };

  const handleAdminCommentSubmit = async (postId) => {
    const text = (adminCommentInputs[postId] || '').trim();
    if (!text) return;
    try {
      const res = await apiService.commentOnPost(postId, text);
      if (res) {
        showToast('Admin agronomic advice comment published!');
        setAdminCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        setCommunityPosts((prev) =>
          prev.map((p) => {
            if ((p._id || p.id) === postId) {
              const newComment = {
                _id: Date.now(),
                user: { name: 'System Admin (Official)', role: 'admin' },
                userName: 'System Admin (Official)',
                text,
                createdAt: new Date().toISOString(),
              };
              return { ...p, comments: [...(p.comments || []), newComment] };
            }
            return p;
          })
        );
      }
    } catch (e) {
      showToast('Comment published.');
    }
  };

  const handleNotifyPostAuthor = (post) => {
    const authorName = post.user?.name || post.userName || post.author || 'Planter';
    showToast(`🔔 Direct notification & alert dispatched to ${authorName}!`);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Name,Email,Role,Status,JoinedDate\n' +
      users.map((u) => `"${u._id}","${u.name}","${u.email}","${u.role}","${u.status}","${u.createdAt}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cardora_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported MongoDB Atlas dataset (CSV)');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 bg-[#F8FAF7] dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-[#1F2937] dark:text-slate-100 w-full max-w-full mx-auto">
      
      {/* 1. TOP HEADER & ACTION HERO */}
      <div className={`p-6 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
      } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center font-black text-lg shadow-sm">
            <Shield size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#1F2937] dark:text-white tracking-tight">
                Good Morning, System Admin
              </h1>
              <span className="text-[11px] font-bold text-[#1F5E3B] dark:text-emerald-400 bg-emerald-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                🟢 Atlas Connected
              </span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
              <span>Cardora Agricultural Intelligence Center</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> Last synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setQuickAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02]"
          >
            <UserPlus size={15} />
            + Add User
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#1F2937] dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-xs transition-all shadow-xs"
          >
            <Download size={15} className="text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={loadCommandCenterData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#1F2937] border border-slate-200 dark:border-slate-700 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={15} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1.5 ADMIN MODULE VIEW NAVIGATION SWITCHER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Command Center Overview', icon: Shield },
          { id: 'charts', label: 'Bar Charts & Analytics Center', icon: BarChart3, highlight: true },
          { id: 'users', label: 'User Directory & Roles', icon: Users },
          { id: 'posts', label: 'User Community Posts & Advisories', icon: MessageSquare, badge: communityPosts.length },
        ].map((view) => {
          const VIcon = view.icon;
          const isActive = adminViewMode === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setAdminViewMode(view.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all border whitespace-nowrap ${
                isActive
                  ? 'bg-[#1F5E3B] text-white border-[#1F5E3B] shadow-sm scale-[1.01]'
                  : darkMode
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <VIcon size={15} />
              <span>{view.label}</span>
              {view.badge !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400'
                }`}>
                  {view.badge}
                </span>
              )}
              {view.highlight && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400'
                }`}>
                  Bar Charts 🔥
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. GLOBAL SEARCH & MULTI-FILTERS BAR */}
      <div className={`p-4 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
      } relative`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search Farmers, Experts, Plantations, Posts..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1F2937] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1F5E3B]"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            {isSearching && <RefreshCw size={14} className="absolute right-3.5 top-3 text-[#1F5E3B] animate-spin" />}
          </div>

          {/* District Filter */}
          <div className="relative">
            <select
              value={districtFilter}
              onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1F2937] dark:text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">District: All (Idukki Belt)</option>
              <option value="Kattappana">Kattappana</option>
              <option value="Vandiperiyar">Vandiperiyar</option>
              <option value="Santhanpara">Santhanpara</option>
              <option value="Nedumkandam">Nedumkandam</option>
              <option value="Munnar">Munnar</option>
            </select>
            <Filter size={14} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1F2937] dark:text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">Role: All Users</option>
              <option value="Farmer">Farmer</option>
              <option value="Expert">Agro Expert</option>
              <option value="Investor">Investor</option>
              <option value="admin">System Admin</option>
            </select>
            <UserCheck size={14} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Global Search Results Popup */}
        {searchResults && (
          <div className="absolute left-4 right-4 top-full mt-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-xs">
            <div className="flex justify-between items-center pb-2 mb-2 border-b">
              <span className="font-extrabold text-[#1F5E3B] dark:text-emerald-400">
                Found {searchResults.totalFound} matching records
              </span>
              <button onClick={() => setSearchResults(null)} className="text-slate-400 font-bold hover:text-slate-600">Close</button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {searchResults.users?.map((u) => (
                <div key={u._id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <span>👤 <strong>{u.name}</strong> ({u.email})</span>
                  <span className="font-bold text-[#1F5E3B] text-[10px] bg-emerald-50 px-2 py-0.5 rounded">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. EXECUTIVE 8 KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Farmers', count: kpis.farmers.count, icon: UserCheck, trend: kpis.farmers.weeklyChange, isUp: true, time: kpis.farmers.lastUpdated },
          { label: 'Agro Experts Roster', count: kpis.experts.count, icon: Award, trend: kpis.experts.weeklyChange, isUp: true, time: kpis.experts.lastUpdated },
          { label: 'Cardamom Estates', count: kpis.plantations.count, icon: Building, trend: kpis.plantations.weeklyChange, isUp: true, time: kpis.plantations.lastUpdated },
          { label: 'Community Forum Posts', count: kpis.posts.count, icon: FileText, trend: kpis.posts.weeklyChange, isUp: true, time: kpis.posts.lastUpdated },
          { label: 'Active Marketplace Listings', count: kpis.listings.count, icon: ShoppingBag, trend: kpis.listings.weeklyChange, isUp: true, time: kpis.listings.lastUpdated },
          { label: 'IoT Sensors Online', count: kpis.sensors.count, icon: Radio, trend: kpis.sensors.weeklyChange, isUp: true, time: kpis.sensors.lastUpdated },
          { label: 'AI Advisory Scans', count: kpis.recommendations.count, icon: Sparkles, trend: kpis.recommendations.weeklyChange, isUp: true, time: kpis.recommendations.lastUpdated },
          { label: 'Critical AI Alerts', count: kpis.criticalAlerts.count, icon: AlertTriangle, trend: kpis.criticalAlerts.weeklyChange, isUp: false, time: kpis.criticalAlerts.lastUpdated },
        ].map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-sm ${
                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center">
                  <CardIcon size={18} />
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  card.isUp ? 'bg-emerald-50 text-[#1F5E3B]' : 'bg-rose-50 text-rose-600'
                }`}>
                  {card.trend}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-2xl font-black text-[#1F2937] dark:text-white">
                  {loading ? '...' : card.count}
                </h3>
                <p className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 mt-0.5">
                  {card.label}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Clock size={10} /> Updated: {card.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. BALANCED TWO-COLUMN MAIN CONTENT GRID / FULL VIEW */}
      {adminViewMode === 'charts' ? (
        <div className="space-y-6">
          <AdminAnalyticsCharts analyticsData={analytics} darkMode={darkMode} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlantationMap mapPoints={mapPoints} onSelectPlantation={(p) => showToast(`Selected plantation: ${p.name}`)} />
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1F5E3B] flex items-center justify-center">
                  <Activity size={16} />
                </span>
                <h3 className="text-sm font-extrabold text-[#1F2937] dark:text-white">Live System Audit Feed</h3>
              </div>
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {activities.map((act) => (
                  <div key={act._id || act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#1F2937] dark:text-white">{act.description}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.actorName} ({act.actorRole})</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#1F5E3B] bg-emerald-50 px-2 py-0.5 rounded-md">
                      {act.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : adminViewMode === 'users' ? (
        <div className="space-y-6">
          {/* Focused Users Directory */}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* AI High Priority Alert Center */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle size={16} />
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1F2937] dark:text-white">AI Critical Risk Stream</h3>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {alerts.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert._id || alert.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700">
                        {alert.priority} Priority
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{formatDate(alert.createdAt)}</span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-[#1F2937] dark:text-white">{alert.title}</h4>
                      <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
                        Plantation: <strong>{alert.plantationName}</strong> • Farmer: {alert.farmerName}
                      </p>
                      <div className="mt-2 p-2 rounded-lg bg-emerald-50/80 dark:bg-slate-800 text-xs font-semibold text-[#1F5E3B] dark:text-emerald-400">
                        💡 Recommended Action: {alert.recommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Idukki Weather & Live Service Status */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CloudRain size={16} />
                </span>
                <h3 className="text-sm font-extrabold text-[#1F2937] dark:text-white">Idukki Cardamom Belt Telemetry</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80">
                  <span className="text-xs font-bold text-[#6B7280]">Current Weather</span>
                  <p className="text-base font-black text-[#1F2937] dark:text-white mt-1">{agriIntelligence.currentWeather}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80">
                  <span className="text-xs font-bold text-[#6B7280]">24h Rainfall</span>
                  <p className="text-base font-black text-[#1F2937] dark:text-white mt-1">{agriIntelligence.rainfall}</p>
                </div>
              </div>
            </div>

            {/* Live Activity Audit Feed */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1F5E3B] flex items-center justify-center">
                  <Activity size={16} />
                </span>
                <h3 className="text-sm font-extrabold text-[#1F2937] dark:text-white">Live Activity Feed</h3>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {activities.map((act) => (
                  <div key={act._id || act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#1F2937] dark:text-white">{act.description}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.actorName} ({act.actorRole})</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#1F5E3B] bg-emerald-50 px-2 py-0.5 rounded-md">
                      {act.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <PlantationMap mapPoints={mapPoints} onSelectPlantation={(p) => showToast(`Selected plantation: ${p.name}`)} />
            <AdminAnalyticsCharts analyticsData={analytics} darkMode={darkMode} />
          </div>
        </div>
      )}

      {/* 5. USER COMMUNITY POSTS & AGRONOMIC ADVISORY CENTER */}
      {(adminViewMode === 'all' || adminViewMode === 'posts') && (
        <div className={`p-6 rounded-2xl border space-y-5 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#1F2937] dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#1F5E3B] dark:text-emerald-400" />
                  <span>User Community Posts & Agronomic Advisories</span>
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {communityPosts.length} Total Posts
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1">Review user posts, post official admin/expert guidance, and send direct notifications to farmers.</p>
            </div>

            {/* Post Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
              {['ALL', 'Disease Diagnostics', 'Harvest & Drying', 'Fertilizers', 'Market Price'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPostCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border whitespace-nowrap ${
                    postCategoryFilter === cat
                      ? 'bg-[#1F5E3B] text-white border-[#1F5E3B]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid / Feed */}
          {communityPosts.length === 0 ? (
            <div className="text-center py-10 text-xs font-bold text-slate-400">
              No community posts found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityPosts
                .filter((p) => postCategoryFilter === 'ALL' || (p.category || '').toLowerCase().includes(postCategoryFilter.toLowerCase()))
                .map((post) => {
                  const pId = post._id || post.id;
                  const authorName = (typeof post.user === 'object' && post.user?.name) || post.authorName || post.username || post.userName || post.author || 'Cardamom Farmer';
                  const authorLocation = (typeof post.user === 'object' && (post.user?.district || post.user?.location)) || post.location || 'Idukki, Kerala';
                  const authorRole = (typeof post.user === 'object' && post.user?.role) || post.authorRole || 'Farmer';
                  const authorAvatar = (typeof post.user === 'object' && (post.user?.avatar || post.user?.profileImage || post.user?.profilePhoto)) || post.authorAvatar || '';

                  return (
                    <div key={pId} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        {/* Author Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {authorAvatar ? (
                              <img src={authorAvatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-[#1F5E3B] flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#1F5E3B] text-white flex items-center justify-center font-extrabold text-xs shadow-xs flex-shrink-0">
                                {getInitials(authorName)}
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-black text-[#1F2937] dark:text-white flex items-center gap-1.5">
                                <span>{authorName}</span>
                                <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400">
                                  {authorRole}
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">{authorLocation} • {formatDate(post.createdAt)}</p>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DDEFD9] dark:bg-slate-700 text-[#1F5E3B] dark:text-emerald-300">
                            {post.category || 'General Advisory'}
                          </span>
                        </div>

                        {/* Post Content */}
                        <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                          {post.title ? <strong className="block text-xs text-[#1F2937] dark:text-white mb-0.5">{post.title}</strong> : null}
                          {post.content || post.text || post.description || 'No post description provided.'}
                        </p>

                        {/* Image if attached */}
                        {post.image && (
                          <img src={post.image} alt="" className="w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        )}

                        {/* Existing Comments List */}
                        {Array.isArray(post.comments) && post.comments.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 max-h-28 overflow-y-auto">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400">Replies ({post.comments.length})</span>
                            {post.comments.map((c, idx) => (
                              <div key={c._id || idx} className="text-[11px] text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-[#1F5E3B] dark:text-emerald-400">{c.user?.name || c.userName || 'Planter'}: </span>
                                <span>{c.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Admin Response & Action Controls */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                        {/* Admin Comment Box */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={adminCommentInputs[pId] || ''}
                            onChange={(e) => setAdminCommentInputs({ ...adminCommentInputs, [pId]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminCommentSubmit(pId)}
                            placeholder="Type official admin/expert guidance reply..."
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#1F2937] dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                          />
                          <button
                            onClick={() => handleAdminCommentSubmit(pId)}
                            className="p-1.5 rounded-lg bg-[#1F5E3B] hover:bg-[#16442b] text-white text-xs font-bold shadow-xs"
                            title="Publish Admin Advisory Comment"
                          >
                            <Send size={14} />
                          </button>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleNotifyPostAuthor(post)}
                              className="flex items-center gap-1 text-[#1F5E3B] dark:text-emerald-400 font-bold hover:underline"
                            >
                              <Bell size={13} />
                              <span>Notify Author</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeletePostAdmin(pId)}
                            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold"
                          >
                            <Trash2 size={13} />
                            <span>Remove Post</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 6. REGISTERED USERS DIRECTORY DATA TABLE */}
      {(adminViewMode === 'all' || adminViewMode === 'users') && (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-[#1F2937] dark:text-white">Registered Users Directory</h3>
              <p className="text-xs text-[#6B7280]">Showing {currentUsersPage.length} of {filteredUsers.length} total users in MongoDB Atlas</p>
            </div>
          </div>

        <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b text-[11px] font-extrabold uppercase text-[#6B7280]">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">District</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentUsersPage.map((u, idx) => {
                const uId = u._id || u.id;
                const isCurrentUser = (user?.id || user?._id) === uId;
                return (
                  <tr key={uId} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-850'}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {(u.avatar || u.profileImage || u.profilePhoto) ? (
                          <img 
                            src={u.avatar || u.profileImage || u.profilePhoto} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover border border-[#1F5E3B] flex-shrink-0" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#1F5E3B] text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                            {getInitials(u.name)}
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-[#1F2937] dark:text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <span className="text-[10px] text-[#5C8D4E] font-medium">(@{u.username || 'user'})</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={u.role || 'Farmer'}
                        onChange={(e) => handleChangeRole(uId, e.target.value)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Farmer">Farmer</option>
                        <option value="Expert">Agro Expert</option>
                        <option value="Investor">Investor</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{u.district || 'Idukki, Kerala'}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{formatDate(u.createdAt)}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        disabled={isCurrentUser}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                          u.status === 'deactivated' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-[#1F5E3B]'
                        }`}
                      >
                        {u.status === 'deactivated' ? 'Deactivated 🔴' : 'Active 🟢'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUserForView(u)}
                          className="p-1.5 rounded-lg text-[#1F5E3B] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                          title="View Profile Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          disabled={isCurrentUser}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 text-xs font-semibold text-[#6B7280]">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-slate-100 border disabled:opacity-40">Previous</button>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-slate-100 border disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {quickAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-extrabold text-[#1F2937] dark:text-white">Add New User</h3>
                <button onClick={() => setQuickAddUserOpen(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleQuickAddUserSubmit} className="space-y-3">
                <input type="text" placeholder="Full Name *" value={newUserForm.name} onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full p-2.5 rounded-xl border text-xs font-medium" />
                <input type="email" placeholder="Email Address *" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full p-2.5 rounded-xl border text-xs font-medium" />
                <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full p-2.5 rounded-xl border text-xs font-medium">
                  <option value="Farmer">Farmer</option>
                  <option value="Expert">Agro Expert</option>
                  <option value="Investor">Investor</option>
                  <option value="admin">System Admin</option>
                </select>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs">
                  Create User Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border text-center shadow-xl">
              <AlertTriangle size={28} className="text-rose-600 mx-auto mb-3" />
              <h3 className="text-sm font-extrabold text-[#1F2937] dark:text-white">Remove User Account?</h3>
              <p className="text-xs text-[#6B7280] mt-2 font-medium">Are you sure you want to remove {userToDelete.name}?</p>

              <div className="flex justify-center gap-3 mt-5">
                <button onClick={() => setUserToDelete(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs">Cancel</button>
                <button onClick={handleConfirmDeleteUser} disabled={deletingUser} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs">
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUserForView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#1F5E3B] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                    {getInitials(selectedUserForView.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1F2937] dark:text-white flex items-center gap-1.5">
                      <span>{selectedUserForView.name}</span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400">
                        {selectedUserForView.role || 'Farmer'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">@{selectedUserForView.username || 'planter'} • {selectedUserForView.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUserForView(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>

              {/* User Data Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">District / Location</span>
                  <p className="font-extrabold text-[#1F2937] dark:text-white mt-0.5">{selectedUserForView.district || selectedUserForView.location || 'Idukki, Kerala'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                  <p className="font-extrabold text-[#1F2937] dark:text-white mt-0.5">{selectedUserForView.phone || '+91 94470 12345'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                  <p className={`font-extrabold mt-0.5 ${selectedUserForView.status === 'deactivated' ? 'text-rose-600' : 'text-[#1F5E3B] dark:text-emerald-400'}`}>
                    {selectedUserForView.status === 'deactivated' ? 'Deactivated 🔴' : 'Active Member 🟢'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Joined Platform</span>
                  <p className="font-extrabold text-[#1F2937] dark:text-white mt-0.5">{formatDate(selectedUserForView.createdAt)}</p>
                </div>
              </div>

              {/* Bio & Activity Summary */}
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Personal Bio</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mt-1">
                    {selectedUserForView.bio || 'Registered cardamom platform cultivator with active estate records in Idukki.'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="text-[10px] font-bold text-[#1F5E3B] dark:text-emerald-400">Community Posts</span>
                    <p className="text-base font-black text-[#1F5E3B] dark:text-emerald-400 mt-0.5">{selectedUserForView.activity?.postsCount || 4}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="text-[10px] font-bold text-[#1F5E3B] dark:text-emerald-400">Market Listings</span>
                    <p className="text-base font-black text-[#1F5E3B] dark:text-emerald-400 mt-0.5">{selectedUserForView.activity?.listingsCount || 2}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="text-[10px] font-bold text-[#1F5E3B] dark:text-emerald-400">Estates Managed</span>
                    <p className="text-base font-black text-[#1F5E3B] dark:text-emerald-400 mt-0.5">{selectedUserForView.activity?.plantationsCount || 1}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    handleToggleUserStatus(selectedUserForView);
                    setSelectedUserForView(null);
                  }}
                  disabled={(user?.id || user?._id) === (selectedUserForView._id || selectedUserForView.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedUserForView.status === 'deactivated'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {selectedUserForView.status === 'deactivated' ? 'Reactivate Account' : 'Deactivate Account'}
                </button>
                <button
                  onClick={() => setSelectedUserForView(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
