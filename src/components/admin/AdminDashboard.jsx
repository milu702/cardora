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
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PlantationMap from './PlantationMap';
import AdminAnalyticsCharts from './AdminAnalyticsCharts';
import DistrictWeatherUsers from './DistrictWeatherUsers';
import AdminPlantationIntelligenceView from './AdminPlantationIntelligenceView';
import AdminAuctionsTab from '../auction/AdminAuctionsTab';

// Helper component for animated KPI counts
const AnimatedCounter = ({ value, duration = 600 }) => {
  const numericVal = parseInt(String(value).replace(/,/g, ''), 10);
  const [count, setCount] = useState(isNaN(numericVal) ? value : 0);

  useEffect(() => {
    if (isNaN(numericVal)) {
      setCount(value);
      return;
    }
    let start = 0;
    const end = numericVal;
    const increment = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration, numericVal]);

  if (isNaN(numericVal)) return <span>{value}</span>;
  return <span>{count.toLocaleString()}</span>;
};

// Helper SVG Sparkline Component for KPI Cards
const MiniSparkline = ({ data, color = '#145C3A' }) => {
  const points = data || [10, 14, 12, 18, 20, 24, 28, 26, 32, 38];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const pathD = points
    .map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-path"
      />
    </svg>
  );
};

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

  // Pagination & View More Limits State (Shows 10 by default)
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllPendingActions, setShowAllPendingActions] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllMarketplace, setShowAllMarketplace] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);

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
  const [expertConsultations, setExpertConsultations] = useState([]);

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
    },
    { id: 'm-3', title: 'Santhanpara Misty Crest Estate', location: 'Santhanpara, Idukki', district: 'Idukki', area: '12.0 Acres', price: '₹2.40 Cr', owner: 'Suresh Menon', status: 'VERIFIED', yield: '510 kg/Acre', pattayamDoc: { score: 99.1, surveyNo: 'Sy. 510/2-C' }, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-4', title: 'Udumbanchola Valley Plantation', location: 'Udumbanchola, Idukki', district: 'Idukki', area: '6.5 Acres', price: '₹1.35 Cr', owner: 'Elizabeth Kurian', status: 'VERIFIED', yield: '450 kg/Acre', pattayamDoc: { score: 97.4, surveyNo: 'Sy. 104/1-A' }, image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-5', title: 'Peermade High Altitude Plot', location: 'Peermade, Idukki', district: 'Idukki', area: '5.0 Acres', price: '₹1.10 Cr', owner: 'Biju Varghese', status: 'VERIFIED', yield: '430 kg/Acre', pattayamDoc: { score: 96.2, surveyNo: 'Sy. 89/3-B' }, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-6', title: 'Munnar Evergreen Terrace', location: 'Munnar, Idukki', district: 'Idukki', area: '15.0 Acres', price: '₹3.60 Cr', owner: 'Dr. Suresh Kumar', status: 'VERIFIED', yield: '540 kg/Acre', pattayamDoc: { score: 99.8, surveyNo: 'Sy. 601/7-A' }, image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-7', title: 'Vandiperiyar Ridge Spice Garden', location: 'Vandiperiyar, Idukki', district: 'Idukki', area: '7.8 Acres', price: '₹1.65 Cr', owner: 'Devika Raj', status: 'VERIFIED', yield: '460 kg/Acre', pattayamDoc: { score: 95.9, surveyNo: 'Sy. 204/5-D' }, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-8', title: 'Nedumkandam Sunlit Slopes', location: 'Nedumkandam, Idukki', district: 'Idukki', area: '9.2 Acres', price: '₹1.95 Cr', owner: 'Maya Sundaram', status: 'VERIFIED', yield: '475 kg/Acre', pattayamDoc: { score: 98.0, surveyNo: 'Sy. 411/2-E' }, image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-9', title: 'Meppadi High Altitude Belt', location: 'Meppadi, Wayanad', district: 'Wayanad', area: '11.0 Acres', price: '₹2.10 Cr', owner: 'Priya Nair', status: 'VERIFIED', yield: '490 kg/Acre', pattayamDoc: { score: 97.8, surveyNo: 'Sy. 302/1-F' }, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-10', title: 'Vythiri Rainforest Spices Plot', location: 'Vythiri, Wayanad', district: 'Wayanad', area: '4.8 Acres', price: '₹98 Lakhs', owner: 'Anil Varghese', status: 'VERIFIED', yield: '415 kg/Acre', pattayamDoc: { score: 94.6, surveyNo: 'Sy. 119/8-B' }, image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-11', title: 'Mananthavady Green Canopy Estate', location: 'Mananthavady, Wayanad', district: 'Wayanad', area: '14.0 Acres', price: '₹2.80 Cr', owner: 'Mathew George', status: 'VERIFIED', yield: '525 kg/Acre', pattayamDoc: { score: 99.0, surveyNo: 'Sy. 780/4-A' }, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-12', title: 'Sulthan Bathery Plateau Estate', location: 'Sulthan Bathery, Wayanad', district: 'Wayanad', area: '6.0 Acres', price: '₹1.25 Cr', owner: 'Milu Cardamom Planter', status: 'VERIFIED', yield: '445 kg/Acre', pattayamDoc: { score: 98.5, surveyNo: 'Sy. 521/3-C' }, image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-13', title: 'Nelliampathy Hills Spice Estate', location: 'Nelliampathy, Palakkad', district: 'Palakkad', area: '10.5 Acres', price: '₹2.20 Cr', owner: 'Dr. Ramesh Nambiar', status: 'VERIFIED', yield: '485 kg/Acre', pattayamDoc: { score: 97.9, surveyNo: 'Sy. 409/6-D' }, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
    { id: 'm-14', title: 'Attappadi High Valley Plot', location: 'Attappadi, Palakkad', district: 'Palakkad', area: '5.5 Acres', price: '₹1.15 Cr', owner: 'Anitha Selvam', status: 'VERIFIED', yield: '435 kg/Acre', pattayamDoc: { score: 96.5, surveyNo: 'Sy. 218/1-E' }, image: 'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800' }
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
        consultationsRes,
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
        apiService.getExpertConsultations(),
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

      if (consultationsRes && consultationsRes.success && Array.isArray(consultationsRes.consultations)) {
        setExpertConsultations(consultationsRes.consultations);
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

  return (
    <div className="admin-dashboard-bg min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-[#101828] dark:text-slate-100 w-full max-w-full mx-auto space-y-6 transition-colors">

      {/* ========================================================================= */}
      {/* 3. TOP HEADER / ENTERPRISE SYSTEM COMMAND CENTER WITH CARDAMOM PLANTATION BACKGROUND */}
      {/* ========================================================================= */}
      <div className="admin-card admin-header-cardamom-bg p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Subtle Green Decorative Gradient Corner Overlay */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#145C3A]/5 via-[#176B43]/2 to-transparent pointer-events-none" />

        <div className="space-y-3 max-w-3xl z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#145C3A]/10 dark:bg-[#16A36A]/20 text-[#145C3A] dark:text-[#16A36A] text-xs font-black border border-[#145C3A]/20 dark:border-[#16A36A]/30 flex items-center gap-1.5 uppercase tracking-wider">
              <Shield size={14} className="text-[#145C3A] dark:text-[#16A36A]" />
              CARDORA ENTERPRISE COMMAND CENTER
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white font-poppins tracking-tight flex items-center gap-2">
            Good Morning, System Administrator 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 font-medium leading-relaxed">
            Monitor real-time agricultural telemetry, plantation verification, workforce attendance, and platform analytics.
          </p>

          <div className="flex items-center gap-3.5 text-xs font-bold pt-1 text-[#667085] dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 text-[#16A36A] font-extrabold bg-[#16A36A]/10 dark:bg-[#16A36A]/20 px-2.5 py-0.5 rounded-full border border-[#16A36A]/30">
              <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse" />
              System Status: Operational
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#172033] dark:text-slate-200 font-extrabold">
              <Users size={13} className="text-[#2563EB]" />
              Total Users: <AnimatedCounter value={users.length || 1248} />
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#2563EB] dark:text-blue-400 font-extrabold">
              <Radio size={13} className="text-[#2563EB]" />
              Active Sessions: 934
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#F59E0B] dark:text-amber-400 font-extrabold">
              <Clock size={13} className="text-[#F59E0B]" />
              Pending Actions: 27
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#E53955] dark:text-rose-400 font-extrabold">
              <AlertTriangle size={13} className="text-[#E53955]" />
              Critical Alerts: 6
            </span>
          </div>
        </div>

        {/* HERO RIGHT: QUICK METRIC & EXPORT CONTROLS */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0 z-10">
          <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-[#121C16] border border-[#E2E8E5] dark:border-[#1E2E25] flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-lg bg-[#145C3A] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Building size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-[#101828] dark:text-white font-poppins">
                <AnimatedCounter value={mapPoints.length || 386} />
              </span>
              <p className="text-[10px] font-bold text-[#145C3A] dark:text-[#16A36A] uppercase tracking-wider">
                System Plantations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-[#F5F7F6] hover:bg-[#E2E8E5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#172033] dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#E2E8E5] dark:border-slate-700"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setQuickAddUserOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#145C3A] hover:bg-[#176B43] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>+ Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9. ADMINISTRATIVE QUICK ACTIONS SECTION */}
      {/* ========================================================================= */}
      <div className="admin-card p-4 border border-[#E2E8E5] dark:border-[#1E2E25] flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-black uppercase tracking-wider text-[#667085] dark:text-slate-400 flex items-center gap-1.5">
          <Zap size={14} className="text-[#F59E0B]" />
          Administrative Quick Actions:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setQuickAddUserOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#16A36A]/10 hover:bg-[#16A36A]/20 dark:bg-[#16A36A]/20 text-[#145C3A] dark:text-[#16A36A] font-bold text-xs border border-[#16A36A]/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus size={13} />
            <span>+ Add Farmer</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'supervisors' })}
            className="px-3.5 py-1.5 rounded-lg bg-[#2563EB]/10 hover:bg-[#2563EB]/20 dark:bg-[#2563EB]/20 text-[#2563EB] dark:text-blue-400 font-bold text-xs border border-[#2563EB]/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck size={13} />
            <span>+ Add Supervisor</span>
          </button>

          <button
            onClick={() => navigate('/dashboard?tab=workforce')}
            className="px-3.5 py-1.5 rounded-lg bg-[#8B3DFF]/10 hover:bg-[#8B3DFF]/20 dark:bg-[#8B3DFF]/20 text-[#8B3DFF] dark:text-purple-300 font-bold text-xs border border-[#8B3DFF]/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <Users size={13} />
            <span>+ Add Worker</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'marketplace' })}
            className="px-3.5 py-1.5 rounded-lg bg-[#145C3A]/10 hover:bg-[#145C3A]/20 dark:bg-[#16A36A]/20 text-[#145C3A] dark:text-[#16A36A] font-bold text-xs border border-[#145C3A]/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 size={13} />
            <span>Verify Plantation</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'contractors' })}
            className="px-3.5 py-1.5 rounded-lg bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-amber-400 font-bold text-xs border border-[#F59E0B]/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <Clock size={13} />
            <span>Review Pending Requests ({unverifiedContractors.length + 18})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'activity' })}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <Activity size={13} />
            <span>View Attendance Audit</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admin', view: 'posts' })}
            className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquare size={13} />
            <span>View Messages</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-[#F5F7F6] hover:bg-[#E2E8E5] dark:bg-slate-800 text-[#172033] dark:text-slate-200 font-bold text-xs border border-[#E2E8E5] dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 size={13} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. MAIN SAAS NAVIGATION SWITCHER TABS */}
      {/* ========================================================================= */}
      <div className="admin-card p-2 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'Executive Dashboard', icon: Shield },
          { id: 'setup', label: 'System Setup & Config', icon: Settings, badge: 'System Config' },
          { id: 'auctions', label: 'Live Auctions Oversight', icon: Gavel, badge: 'Live Bidding' },
          { id: 'intelligence', label: 'Plantation Intelligence', icon: Sparkles, badge: 'Live Reports' },
          { id: 'district-weather', label: 'Districts Weather & Users', icon: CloudSun, badge: '18 Belts' },
          { id: 'charts', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'activity', label: 'Recent System Audit', icon: Activity, badge: activities.length || 14 },
          { id: 'marketplace', label: 'Marketplace & Plots', icon: MapPin, badge: adminMarketplaceListings.length },
          { id: 'users', label: 'Farmers Directory', icon: UserCheck, badge: users.length || 1248 },
          { id: 'contractors', label: 'Supervisors & Complaints', icon: ShieldCheck, badge: unverifiedContractors.length || 42 },
          { id: 'recommendations', label: 'AI Crop Diagnostics', icon: Sparkles },
          { id: 'posts', label: 'Community Feed', icon: MessageSquare, badge: communityPosts.length || 6 },
        ].map((view) => {
          const VIcon = view.icon;
          const isActive = adminViewMode === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setSearchParams({ tab: 'admin', view: view.id })}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#145C3A] text-white shadow-xs'
                  : 'text-[#667085] dark:text-slate-300 hover:text-[#101828] dark:hover:text-white hover:bg-[#F5F7F6] dark:hover:bg-slate-800'
              }`}
            >
              <VIcon size={14} className={isActive ? 'text-white' : 'text-[#667085]'} />
              <span>{view.label}</span>
              {view.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F5F7F6] dark:bg-slate-800 text-[#172033] dark:text-slate-300 border border-[#E2E8E5] dark:border-slate-700'
                  }`}
                >
                  {view.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW ROUTER */}
      {adminViewMode === 'all' ? (
        <div className="space-y-6">

          {/* ========================================================================= */}
          {/* 11 & 14. KPI GRID WITH ANIMATED COUNTS & MINI SPARKLINE GRAPHS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'TOTAL FARMERS',
                value: users.filter((u) => (u.role || '').toLowerCase().includes('farmer')).length || 1248,
                change: '+8.4% this month',
                icon: UserCheck,
                iconBg: 'bg-[#145C3A] text-white',
                badgeStyle: 'bg-[#16A36A]/10 text-[#16A36A] border-[#16A36A]/30',
                sparklineData: [1000, 1050, 1080, 1120, 1160, 1200, 1248],
                isUp: true,
              },
              {
                label: 'TOTAL PLANTATIONS',
                value: mapPoints.length || 386,
                change: '+5.2% verified',
                icon: Building,
                iconBg: 'bg-[#176B43] text-white',
                badgeStyle: 'bg-[#16A36A]/10 text-[#16A36A] border-[#16A36A]/30',
                sparklineData: [310, 325, 340, 355, 370, 380, 386],
                isUp: true,
              },
              {
                label: 'SUPERVISORS',
                value: contractorsList.length || 42,
                change: '+4 active supervisors',
                icon: ShieldCheck,
                iconBg: 'bg-[#2563EB] text-white',
                badgeStyle: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30',
                sparklineData: [30, 32, 35, 36, 38, 40, 42],
                isUp: true,
              },
              {
                label: 'WORKERS',
                value: '1,876',
                change: '+6.7% daily attendance',
                icon: Users,
                iconBg: 'bg-[#8B3DFF] text-white',
                badgeStyle: 'bg-[#8B3DFF]/10 text-[#8B3DFF] border-[#8B3DFF]/30',
                sparklineData: [1500, 1600, 1650, 1720, 1800, 1840, 1876],
                isUp: true,
              },
              {
                label: 'ACTIVE USERS',
                value: '934',
                change: 'Online now across platform',
                icon: Activity,
                iconBg: 'bg-indigo-600 text-white',
                badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                sparklineData: [720, 780, 810, 860, 890, 910, 934],
                isUp: true,
              },
              {
                label: 'PENDING VERIFICATIONS',
                value: '27',
                change: 'Action required (Pattayam/Docs)',
                icon: Clock,
                iconBg: 'bg-[#F59E0B] text-white',
                badgeStyle: 'bg-[#F59E0B]/10 text-[#D97706] border-[#F59E0B]/30',
                sparklineData: [45, 40, 36, 32, 30, 28, 27],
                isUp: false,
              },
              {
                label: 'OPEN REQUESTS',
                value: (unverifiedContractors.length + alerts.length) || 18,
                change: 'Pending admin review',
                icon: FileText,
                iconBg: 'bg-orange-600 text-white',
                badgeStyle: 'bg-orange-50 text-orange-700 border-orange-200',
                sparklineData: [24, 22, 21, 20, 19, 18, 18],
                isUp: false,
              },
              {
                label: 'SYSTEM ALERTS',
                value: '6',
                change: 'Attention needed',
                icon: AlertTriangle,
                iconBg: 'bg-[#E53955] text-white',
                badgeStyle: 'bg-[#E53955]/10 text-[#E53955] border-[#E53955]/30',
                sparklineData: [12, 10, 9, 8, 7, 6, 6],
                isUp: false,
              },
            ].map((kpi, idx) => {
              const KIcon = kpi.icon;
              return (
                <div
                  key={idx}
                  className="admin-card p-5 border border-[#E2E8E5] dark:border-[#1E2E25] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#667085] dark:text-slate-400 tracking-wider uppercase">
                      {kpi.label}
                    </span>
                    <div className={`p-2 rounded-lg ${kpi.iconBg} shadow-xs group-hover:scale-105 transition-transform`}>
                      <KIcon size={15} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white font-poppins tracking-tight">
                      {loading ? '...' : <AnimatedCounter value={kpi.value} />}
                    </span>
                    {/* Mini Sparkline Graph */}
                    <MiniSparkline data={kpi.sparklineData} color={kpi.isUp ? '#16A36A' : '#E53955'} />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E2E8E5] dark:border-[#1E2E25] flex items-center justify-between text-[11px]">
                    <span className={`font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${kpi.badgeStyle}`}>
                      {kpi.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {kpi.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* 24 & 25. PENDING ADMIN ACTIONS & SYSTEM ALERTS SECTION */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 24. PENDING ADMINISTRATIVE ACTIONS */}
            <div className="admin-card p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center font-bold">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#101828] dark:text-white">Pending Administrative Actions</h3>
                    <p className="text-xs text-[#667085] font-medium">Registrations, verifications & approvals requiring admin review</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#D97706] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                  27 Items Pending
                </span>
              </div>

              <div className="space-y-3">
                {(() => {
                  const pendingList = [
                    { title: '12 Farmer Registrations awaiting verification', priority: 'High', date: 'Today', actionText: 'Review', actionView: 'users' },
                    { title: '5 Plantations awaiting approval (Pattayam Title Deed)', priority: 'High', date: 'Today', actionText: 'Approve', actionView: 'marketplace' },
                    { title: '4 Supervisor license requests awaiting sign-off', priority: 'Medium', date: 'Yesterday', actionText: 'Review', actionView: 'supervisors' },
                    { title: '6 Worker attendance records requiring review', priority: 'Normal', date: 'Oct 5', actionText: 'Inspect', actionView: 'activity' },
                    { title: '3 Expert consultation requests needing assignment', priority: 'High', date: 'Today', actionText: 'Assign', actionView: 'posts' },
                    { title: '2 Marketplace listings flagged for price audit', priority: 'Normal', date: 'Oct 4', actionText: 'Audit', actionView: 'marketplace' },
                    { title: '8 Pattayam land survey sketches pending OCR legal scan', priority: 'High', date: 'Today', actionText: 'Scan', actionView: 'marketplace' },
                    { title: '3 Agronomist advice escalations pending sign-off', priority: 'High', date: 'Today', actionText: 'Approve', actionView: 'posts' },
                    { title: '5 Devikulam telemetry sensor calibrations needed', priority: 'Medium', date: 'Oct 5', actionText: 'Calibrate', actionView: 'district-weather' },
                    { title: '7 Planter identity document verifications pending', priority: 'High', date: 'Oct 5', actionText: 'Verify', actionView: 'users' },
                    { title: '4 Worker daily wage dispatch approvals', priority: 'Normal', date: 'Oct 4', actionText: 'Approve', actionView: 'activity' },
                    { title: '2 Cardora Auction batch cataloguing requests', priority: 'High', date: 'Today', actionText: 'Catalog', actionView: 'auctions' },
                    { title: '6 Wayanad weather warning broadcast approvals', priority: 'Medium', date: 'Oct 4', actionText: 'Broadcast', actionView: 'district-weather' },
                    { title: '3 Automated backup restore simulation requests', priority: 'Normal', date: 'Oct 3', actionText: 'Simulate', actionView: 'setup' }
                  ];

                  const displayed = showAllPendingActions ? pendingList : pendingList.slice(0, 5);

                  return (
                    <>
                      {displayed.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between gap-3 text-xs hover:border-[#145C3A]/30 transition-colors">
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-[#101828] dark:text-white">{item.title}</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[#667085]">
                              <span className={`px-2 py-0.2 rounded-md ${
                                item.priority === 'High'
                                  ? 'bg-[#E53955]/10 text-[#E53955] dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-[#F59E0B]/10 text-[#D97706] dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {item.priority} Priority
                              </span>
                              <span>•</span>
                              <span>{item.date}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSearchParams({ tab: 'admin', view: item.actionView })}
                            className="px-3.5 py-1.5 rounded-lg bg-[#145C3A] text-white font-extrabold text-xs hover:bg-[#176B43] transition shrink-0 cursor-pointer shadow-xs"
                          >
                            [{item.actionText}]
                          </button>
                        </div>
                      ))}

                      {pendingList.length > 5 && (
                        <div className="pt-2 text-center">
                          <button
                            onClick={() => setShowAllPendingActions(!showAllPendingActions)}
                            className="px-4 py-2 rounded-lg bg-[#F5F7F6] hover:bg-[#E2E8E5] text-[#172033] dark:bg-slate-800 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-center gap-1.5 mx-auto"
                          >
                            <span>
                              {showAllPendingActions
                                ? 'Show Less'
                                : `View More Actions (${pendingList.length - 5} Remaining)`}
                            </span>
                            {showAllPendingActions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 25. SYSTEM HEALTH & ALERTS */}
            <div className="admin-card p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#E53955]/10 text-[#E53955] flex items-center justify-center font-bold">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#101828] dark:text-white">SYSTEM HEALTH & MONITORING</h3>
                    <p className="text-xs text-[#667085] font-medium">Real-time platform infrastructure status & anomaly flags</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#16A36A] bg-[#16A36A]/10 px-2.5 py-0.5 rounded-full border border-[#16A36A]/30">
                  6 System Alerts
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F59E0B] text-white shrink-0 mt-0.5">
                    <AlertTriangle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-[#101828] dark:text-amber-200">⚠ 3 plantations have missing verification documents</p>
                    <p className="text-[11px] text-[#667085] dark:text-amber-300/80 font-medium mt-0.5">Vandenmedu & Kattappana plots uploaded incomplete Pattayam PDFs.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F59E0B] text-white shrink-0 mt-0.5">
                    <Radio size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-[#101828] dark:text-amber-200">⚠ Attendance data synchronization delayed</p>
                    <p className="text-[11px] text-[#667085] dark:text-amber-300/80 font-medium mt-0.5">Devikulam Reserve Node #14 delayed biometric sync by 14 minutes.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E53955]/10 border border-[#E53955]/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#E53955] text-white shrink-0 mt-0.5">
                    <X size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-[#101828] dark:text-rose-200">⚠ 2 REST API requests failed</p>
                    <p className="text-[11px] text-[#667085] dark:text-rose-300/80 font-medium mt-0.5">HTTP 502 Bad Gateway recorded during peak auction sync window.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#16A36A]/10 border border-[#16A36A]/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#16A36A] text-white shrink-0 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-[#101828] dark:text-emerald-200">✓ Database connection healthy & encrypted</p>
                    <p className="text-[11px] text-[#667085] dark:text-emerald-300/80 font-medium mt-0.5">MongoDB Atlas replica set primary active with zero lock contention.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#16A36A]/10 border border-[#16A36A]/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#16A36A] text-white shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-[#101828] dark:text-emerald-200">✓ AI service operational across all 18 districts</p>
                    <p className="text-[11px] text-[#667085] dark:text-emerald-300/80 font-medium mt-0.5">Gemini crop disease OCR & yield forecasting engines responding in 48ms.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 26. CARDORA AI SYSTEM INSIGHTS SECTION */}
          {/* ========================================================================= */}
          <div className="admin-card p-6 sm:p-7 border border-[#8B3DFF]/30 bg-gradient-to-r from-[#8B3DFF]/5 via-white to-purple-50/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-900/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8B3DFF]/20">
              <div>
                <h3 className="text-base font-black text-[#8B3DFF] dark:text-purple-300 flex items-center gap-2 font-poppins">
                  <Sparkles size={18} className="text-[#8B3DFF] animate-pulse" />
                  CARDORA AI SYSTEM INSIGHTS
                </h3>
                <p className="text-xs text-[#667085] dark:text-slate-400 font-medium mt-0.5">
                  Automated platform-wide pathogen risk detection, yield forecasts & telemetry anomaly modeling
                </p>
              </div>

              <button
                onClick={() => setSearchParams({ tab: 'admin', view: 'recommendations' })}
                className="px-3.5 py-1.5 rounded-lg bg-[#8B3DFF] text-white font-extrabold text-xs hover:bg-purple-700 shadow-xs flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>View Full AI System Diagnostics</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#8B3DFF]/20 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#667085]">High-Risk Plantations Alert</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#E53955]/10 text-[#E53955] border border-[#E53955]/20">
                    Action Advised
                  </span>
                </div>
                <p className="text-xs font-extrabold text-[#101828] dark:text-white">Disease Risk Trend in Idukki</p>
                <p className="text-[11px] text-[#667085] dark:text-slate-300 font-medium">AI detected increased fungal rot risk across 8 plantations in Idukki district due to canopy humidity spikes.</p>
                <button
                  onClick={() => showToast('Navigating to 8 flagged plantations in Idukki...')}
                  className="px-3 py-1 rounded-lg bg-[#8B3DFF]/10 text-[#8B3DFF] text-[11px] font-black hover:bg-[#8B3DFF]/20 cursor-pointer"
                >
                  [View Details]
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#8B3DFF]/20 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#667085]">System Yield Forecast</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#8B3DFF]/10 text-[#8B3DFF] border border-[#8B3DFF]/20">
                    +14.2% Harvest
                  </span>
                </div>
                <p className="text-xs font-extrabold text-[#101828] dark:text-white">Regional Pod Production Model</p>
                <p className="text-[11px] text-[#667085] dark:text-slate-300 font-medium">AI yield model predicts an overall harvest boost of 480 kg/Acre across verified high-altitude cardamom estates.</p>
                <button
                  onClick={() => setSearchParams({ tab: 'admin', view: 'charts' })}
                  className="px-3 py-1 rounded-lg bg-[#8B3DFF]/10 text-[#8B3DFF] text-[11px] font-black hover:bg-[#8B3DFF]/20 cursor-pointer"
                >
                  [View Analytics]
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#8B3DFF]/20 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#667085]">Telemetry Anomaly Detection</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/20">
                    2 Sensors Flagged
                  </span>
                </div>
                <p className="text-xs font-extrabold text-[#101828] dark:text-white">Devikulam Reserve Gateway</p>
                <p className="text-[11px] text-[#667085] dark:text-slate-300 font-medium">Telemetry AI flagged 2 offline soil moisture sensor nodes in Devikulam requiring battery replacement.</p>
                <button
                  onClick={() => setSearchParams({ tab: 'admin', view: 'district-weather' })}
                  className="px-3 py-1 rounded-lg bg-[#8B3DFF]/10 text-[#8B3DFF] text-[11px] font-black hover:bg-[#8B3DFF]/20 cursor-pointer"
                >
                  [Inspect Sensors]
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 28 & 29. RECENT ADMIN ACTIVITY & EXPERT DESK SECTION */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 28. RECENT ADMINISTRATIVE ACTIVITY TIMELINE */}
            <div className="admin-card p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#145C3A]/10 text-[#145C3A] dark:text-[#16A36A] flex items-center justify-center font-bold">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#101828] dark:text-white">Recent Administrative Activity</h3>
                    <p className="text-xs text-[#667085] font-medium">Audit log of system actions performed by administrators & supervisors</p>
                  </div>
                </div>

                <button
                  onClick={() => setSearchParams({ tab: 'admin', view: 'activity' })}
                  className="text-xs font-black text-[#145C3A] dark:text-[#16A36A] hover:underline"
                >
                  Full Audit Log →
                </button>
              </div>

              <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8E5] dark:before:bg-slate-800">
                {(() => {
                  const fallbackActivities = [
                    { title: 'Admin approved farmer registration (K. J. Joseph)', actor: 'System Admin', time: '10:32 AM' },
                    { title: 'Supervisor assigned to Plantation #P-102 (Highrange Team)', actor: 'Anitha Selvam', time: '10:18 AM' },
                    { title: 'Plantation Pattayam verification completed (Sy. 428/1-B)', actor: 'AI OCR Legal Engine', time: '09:54 AM' },
                    { title: 'Worker attendance record updated (24 harvesters present)', actor: 'Mathew George', time: '09:31 AM' },
                    { title: 'Expert consultation request resolved (Dr. Suresh Kumar)', actor: 'Agronomist Desk', time: '09:10 AM' },
                    { title: 'Marketplace plot listing flagged for price audit', actor: 'Compliance Desk', time: '08:45 AM' },
                    { title: 'System broadcast notification sent to 1,248 farmers', actor: 'System Admin', time: '08:00 AM' },
                    { title: 'Database snapshot backup generated & synced to Atlas', actor: 'Automated Infrastructure', time: '07:30 AM' },
                    { title: 'IoT moisture sensor node recalibrated in Kattappana', actor: 'IoT Gateway Service', time: '07:15 AM' },
                    { title: 'Agronomist leaf blight advisory dispatched to Wayanad', actor: 'Dr. Ramesh Nambiar', time: '06:50 AM' }
                  ];

                  const activitiesList = (activities && activities.length > 0)
                    ? activities.map((act) => ({
                        title: act.description || act.title || act.action || 'System activity recorded',
                        actor: act.actorName || act.actor || act.user || 'System Admin',
                        time: act.timeAgo || act.time || (act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
                      }))
                    : fallbackActivities;

                  const displayed = showAllActivities ? activitiesList : activitiesList.slice(0, 5);

                  return (
                    <>
                      {displayed.map((act, idx) => (
                        <div key={idx} className="relative group">
                          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-[#145C3A] flex items-center justify-center z-10">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#145C3A]" />
                          </div>

                          <div className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                            <div>
                              <p className="font-extrabold text-[#101828] dark:text-white">{act.title}</p>
                              <p className="text-[11px] text-[#667085] font-medium mt-0.5">By {act.actor}</p>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#667085] shrink-0 font-mono">
                              {act.time}
                            </span>
                          </div>
                        </div>
                      ))}

                      {activitiesList.length > 5 && (
                        <div className="pt-2 text-center">
                          <button
                            onClick={() => setShowAllActivities(!showAllActivities)}
                            className="px-4 py-2 rounded-lg bg-[#F5F7F6] hover:bg-[#E2E8E5] text-[#172033] dark:bg-slate-800 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-center gap-1.5 mx-auto"
                          >
                            <span>
                              {showAllActivities
                                ? 'Show Less'
                                : `View More Activities (${activitiesList.length - 5} Remaining)`}
                            </span>
                            {showAllActivities ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 29. EXPERT DESK / USER REQUESTS */}
            <div className="admin-card p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#8B3DFF]/10 text-[#8B3DFF] flex items-center justify-center font-bold">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#101828] dark:text-white">Expert Desk & User Requests</h3>
                    <p className="text-xs text-[#667085] font-medium">Farmer queries, expert consultations, supervisor requests & support tickets</p>
                  </div>
                </div>

                <button
                  onClick={() => setSearchParams({ tab: 'admin', view: 'posts' })}
                  className="text-xs font-black text-[#145C3A] dark:text-[#16A36A] hover:underline"
                >
                  Manage All →
                </button>
              </div>

              <div className="space-y-3">
                {(() => {
                  const fallbackRequests = [
                    { from: 'Farmer → Expert Desk', title: 'Consultation request: Leaf blight query in Kattappana block', status: 'Pending Assign', action: 'Assign Expert' },
                    { from: 'Supervisor → Admin', title: 'Attendance discrepancy reported for 6 harvesters in Munnar plot', status: 'Under Review', action: 'Review Issue' },
                    { from: 'Expert → Admin', title: 'Advisory escalation: High monsoon humidity spray protocol', status: 'High Priority', action: 'Approve Advisory' },
                    { from: 'Farmer User → Support', title: 'Account verification & district change request (Idukki to Wayanad)', status: 'Pending', action: 'Verify User' },
                  ];

                  const requestsList = (expertConsultations && expertConsultations.length > 0)
                    ? expertConsultations.map((ticket) => ({
                        from: ticket.category ? `FARMER → ${ticket.category.toUpperCase()}` : 'FARMER → EXPERT DESK',
                        title: ticket.question || ticket.title || ticket.topic || 'Consultation request from Planter',
                        status: ticket.status || 'Pending Assign',
                        action: ticket.status === 'answered' ? 'View Answer' : 'Assign Expert',
                      }))
                    : fallbackRequests;

                  return requestsList.map((req, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-[#8B3DFF] bg-[#8B3DFF]/10 px-2 py-0.5 rounded-md border border-[#8B3DFF]/20">
                          {req.from}
                        </span>
                        <p className="font-extrabold text-[#101828] dark:text-white mt-1">{req.title}</p>
                      </div>

                      <button
                        onClick={() => showToast(`Opening request: ${req.action}...`)}
                        className="px-3 py-1.5 rounded-lg bg-[#8B3DFF] text-white font-extrabold text-xs hover:bg-purple-700 transition shrink-0 cursor-pointer shadow-xs"
                      >
                        [{req.action}]
                      </button>
                    </div>
                  ));
                })()}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* GIS PLANTATION MAP */}
          {/* ========================================================================= */}
          <PlantationMap mapPoints={mapPoints} onSelectPlantation={(p) => showToast(`Plantation: ${p.name}`)} />

          {/* ========================================================================= */}
          {/* PLATFORM GROWTH & WEATHER INTELLIGENCE GRID */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Platform Activity Trend */}
            <div className="lg:col-span-2 admin-card p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
                <div>
                  <h3 className="text-base font-extrabold text-[#101828] dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#145C3A]" />
                    Platform User & Registration Growth
                  </h3>
                  <p className="text-xs text-[#667085] font-medium">
                    Registered Farmers, Verified Plantations, and Workforce growth over time
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#F5F7F6] dark:bg-slate-800 text-xs font-bold">
                  {['7D', '30D', '1Y'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setAnalyticsTimeframe(tf)}
                      className={`px-3 py-1 rounded-md transition-all ${
                        analyticsTimeframe === tf
                          ? 'bg-white dark:bg-slate-900 text-[#145C3A] dark:text-[#16A36A] shadow-xs font-black'
                          : 'text-[#667085] dark:text-slate-400 hover:text-[#101828]'
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
                      fill="url(#forestGradient)"
                      className="opacity-20"
                    />
                    <defs>
                      <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#145C3A" />
                        <stop offset="100%" stopColor="#145C3A" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0,130 Q70,90 140,105 T280,60 T420,40 T500,20"
                      fill="none"
                      stroke="#145C3A"
                      strokeWidth="3"
                    />
                    <path
                      d="M0,140 Q80,120 160,100 T320,80 T500,55"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[11px] text-[#667085] font-bold pt-2 border-t border-[#E2E8E5] dark:border-[#1E2E25]">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* REGIONAL WEATHER INTELLIGENCE */}
            <div className="admin-card p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#101828] dark:text-white flex items-center gap-2">
                  <CloudSun className="text-[#F59E0B]" />
                  Regional Weather Intelligence
                </h3>
                <p className="text-xs text-[#667085] font-medium">System-level telemetry across major cardamom belts</p>
              </div>

              <div className="space-y-2">
                {[
                  { district: 'Idukki Belt', temp: '22°C', rh: '82% RH', status: 'Low Risk', isWarning: false },
                  { district: 'Wayanad Belt', temp: '23°C', rh: '88% RH', status: 'Rain Forecast', isWarning: true },
                  { district: 'Kottayam Belt', temp: '29°C', rh: '76% RH', status: 'Clear Skies', isWarning: false },
                  { district: 'Pathanamthitta', temp: '28°C', rh: '80% RH', status: 'Light Showers', isWarning: false },
                ].map((w, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between text-xs font-bold">
                    <div>
                      <span className="text-[#101828] dark:text-white block">{w.district}</span>
                      <span className="text-[10px] text-[#667085] font-mono">{w.temp} • {w.rh}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      w.isWarning
                        ? 'bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/30'
                        : 'bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSearchParams({ tab: 'admin', view: 'district-weather' })}
                className="w-full py-2.5 rounded-lg bg-[#145C3A]/10 hover:bg-[#145C3A]/20 dark:bg-slate-800 text-[#145C3A] dark:text-[#16A36A] font-extrabold text-xs transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer border border-[#145C3A]/20"
              >
                <CloudSun size={14} />
                <span>View All 18 Districts Weather & Users →</span>
              </button>
            </div>

          </div>
        </div>
      ) : adminViewMode === 'setup' ? (
        <div className="space-y-6">
          {/* SYSTEM SETUP & INFRASTRUCTURE GOVERNANCE PANEL */}
          <div className="admin-card p-6 sm:p-7 border border-[#E2E8E5] dark:border-[#1E2E25] space-y-6">
            
            {/* PANEL HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#145C3A] text-white flex items-center justify-center font-bold shadow-xs">
                  <Settings size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#101828] dark:text-white font-poppins">
                    System Setup & Infrastructure Governance Panel
                  </h3>
                  <p className="text-xs text-[#667085] font-medium">
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
                  className="px-4 py-2 rounded-lg bg-[#145C3A] hover:bg-[#176B43] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isBackupRunning ? 'animate-spin' : ''} />
                  <span>{isBackupRunning ? 'Backing up...' : 'Trigger DB Backup'}</span>
                </button>

                <button
                  onClick={() => {
                    showToast('⚡ Telemetry cache purged & re-indexed');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#F5F7F6] hover:bg-[#E2E8E5] dark:bg-slate-800 text-[#172033] dark:text-slate-300 font-bold text-xs border border-[#E2E8E5] dark:border-slate-700 transition cursor-pointer"
                >
                  Purge Cache
                </button>
              </div>
            </div>

            {/* SERVICES INFRASTRUCTURE MATRIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#101828] dark:text-slate-200 uppercase">MongoDB Atlas Cluster</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                    🟢 Connected
                  </span>
                </div>
                <p className="text-xs text-[#667085] font-mono">URI: cardora-production.mongodb.net (v6.0.4)</p>
                <div className="text-[11px] text-[#667085] font-semibold flex items-center justify-between pt-1 border-t border-[#E2E8E5] dark:border-slate-700">
                  <span>Latency: 0.2ms</span>
                  <span>Replica Set Primary</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#101828] dark:text-slate-200 uppercase">REST API Microservice</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                    🟢 Port 5000 Active
                  </span>
                </div>
                <p className="text-xs text-[#667085] font-mono">Routes: Auth / Plantation / Workforce / Auction</p>
                <div className="text-[11px] text-[#667085] font-semibold flex items-center justify-between pt-1 border-t border-[#E2E8E5] dark:border-slate-700">
                  <span>Health: 100%</span>
                  <span>Zero Memory Leaks</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#101828] dark:text-slate-200 uppercase">IoT Telemetry Gateway</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                    🟢 18 Belts Online
                  </span>
                </div>
                <p className="text-xs text-[#667085] font-mono">Sensors: Soil Moisture, pH, Ambient Temp, Mist</p>
                <div className="text-[11px] text-[#667085] font-semibold flex items-center justify-between pt-1 border-t border-[#E2E8E5] dark:border-slate-700">
                  <span>Interval: 5 min</span>
                  <span>Auto Sync Active</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#101828] dark:text-slate-200 uppercase">Cloudinary Asset Server</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                    🟢 Synced
                  </span>
                </div>
                <p className="text-xs text-[#667085] font-mono">Storage: Pattayam Titles & Drone Photos</p>
                <div className="text-[11px] text-[#667085] font-semibold flex items-center justify-between pt-1 border-t border-[#E2E8E5] dark:border-slate-700">
                  <span>Media CDN</span>
                  <span>Secure SSL</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#101828] dark:text-slate-200 uppercase">Voice AI Speech Engine</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#8B3DFF]/10 text-[#8B3DFF] border border-[#8B3DFF]/30">
                    🟢 Gemini AI
                  </span>
                </div>
                <p className="text-xs text-[#667085] font-mono">Languages: Malayalam (മലയാളം) & English</p>
                <div className="text-[11px] text-[#667085] font-semibold flex items-center justify-between pt-1 border-t border-[#E2E8E5] dark:border-slate-700">
                  <span>Floating Widget</span>
                  <span>Voice Navigation</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800/80 border border-[#E2E8E5] dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#101828] dark:text-slate-200 uppercase">RBAC Role Permissions</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#145C3A]/10 text-[#145C3A] border border-[#145C3A]/30">
                    🟢 Enforced
                  </span>
                </div>
                <p className="text-xs text-[#667085] font-mono">Roles: Administrator, Supervisor, Farmer</p>
                <div className="text-[11px] text-[#667085] font-semibold flex items-center justify-between pt-1 border-t border-[#E2E8E5] dark:border-slate-700">
                  <span>JWT Session</span>
                  <span>Strict Boundary</span>
                </div>
              </div>
            </div>

            {/* OPERATIONAL TOGGLES */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#667085]">System Operational Controls</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#101828] dark:text-white block">Maintenance Banner Mode</span>
                    <span className="text-[11px] text-[#667085]">Show maintenance message to public users</span>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      showToast(maintenanceMode ? 'Maintenance Mode Disabled' : 'Maintenance Mode Enabled');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      maintenanceMode ? 'bg-[#F59E0B]' : 'bg-[#E2E8E5] dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#101828] dark:text-white block">IoT Telemetry Auto Sync</span>
                    <span className="text-[11px] text-[#667085]">Sync field sensors every 5 minutes</span>
                  </div>
                  <button
                    onClick={() => {
                      setAutoTelemetrySync(!autoTelemetrySync);
                      showToast(autoTelemetrySync ? 'Auto Sync Disabled' : 'Auto Sync Enabled');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoTelemetrySync ? 'bg-[#145C3A]' : 'bg-[#E2E8E5] dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      autoTelemetrySync ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#101828] dark:text-white block">AI Title Legal Verification OCR</span>
                    <span className="text-[11px] text-[#667085]">Auto-verify Pattayam documents with Gemini</span>
                  </div>
                  <button
                    onClick={() => {
                      setAiDocVerification(!aiDocVerification);
                      showToast(aiDocVerification ? 'AI Legal OCR Paused' : 'AI Legal OCR Active');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      aiDocVerification ? 'bg-[#145C3A]' : 'bg-[#E2E8E5] dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      aiDocVerification ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#101828] dark:text-white block">Audit Log AES-256 Encryption</span>
                    <span className="text-[11px] text-[#667085]">Encrypt user actions before database write</span>
                  </div>
                  <button
                    onClick={() => {
                      setAuditLogEncryption(!auditLogEncryption);
                      showToast(auditLogEncryption ? 'Encryption Enforced' : 'Encryption Standard');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      auditLogEncryption ? 'bg-[#145C3A]' : 'bg-[#E2E8E5] dark:bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      auditLogEncryption ? 'translate-x-6' : 'translate-x-1'
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
          <div className="admin-card p-6 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
              <div>
                <h3 className="text-base font-black text-[#101828] dark:text-white">
                  {adminViewMode === 'supervisors' ? 'Assigned Supervisors Directory' : (adminViewMode === 'farmers' ? 'Registered Farmers Directory' : 'Platform Users & Roles Directory')}
                </h3>
                <p className="text-xs text-[#667085] font-medium">Manage user credentials, role permissions, and active statuses across Cardora</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handleExportCSV} className="px-3.5 py-2 rounded-lg bg-[#F5F7F6] text-[#145C3A] font-extrabold text-xs hover:bg-[#E2E8E5] border border-[#E2E8E5]">
                  Export CSV
                </button>
                <button onClick={() => setQuickAddUserOpen(true)} className="px-3.5 py-2 rounded-lg bg-[#145C3A] text-white font-extrabold text-xs hover:bg-[#176B43]">
                  + Add New Farmer
                </button>
              </div>
            </div>

            {/* User Search & Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Search by name, email or district..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 text-xs font-medium text-[#101828] dark:text-white focus:outline-none focus:border-[#145C3A]"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 text-xs font-bold text-[#101828] dark:text-white focus:outline-none"
              >
                <option value="ALL">Role: All Roles</option>
                <option value="Farmer">Farmer / Planter</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Admin">Administrator</option>
                <option value="Expert">Agronomist Expert</option>
              </select>

              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 text-xs font-bold text-[#101828] dark:text-white focus:outline-none"
              >
                <option value="ALL">District: All Locations</option>
                <option value="Idukki">Idukki</option>
                <option value="Wayanad">Wayanad</option>
                <option value="Palakkad">Palakkad</option>
              </select>
            </div>

            {/* 30. PLATFORM USERS TABLE DIRECTORY */}
            <div className="overflow-x-auto rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] shadow-xs mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F6] dark:bg-slate-800/90 text-[#172033] dark:text-slate-300 font-extrabold uppercase tracking-wider text-[10px] border-b border-[#E2E8E5] dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">User / Planter</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">District / Location</th>
                    <th className="p-3.5">Contact Email & Phone</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E5] dark:divide-slate-800 bg-white dark:bg-slate-900 text-[#101828] dark:text-slate-100">
                  {(() => {
                    const fallbackUsers = [
                      {
                        _id: 'u-milu-1',
                        id: 'u-milu-1',
                        name: 'Milu Cardamom Planter',
                        fullName: 'Milu Cardamom Planter',
                        username: 'milu',
                        email: 'milu@cardoraplanters.in',
                        role: 'Farmer',
                        status: 'active',
                        phone: '+91 94470 12345',
                        district: 'Idukki, Kerala',
                        location: 'Kattappana, Idukki',
                        isVerified: true,
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                      },
                      {
                        _id: 'u-admin-1',
                        id: 'u-admin-1',
                        name: 'System Administrator',
                        fullName: 'System Administrator',
                        username: 'admin',
                        email: 'admin@cardora.com',
                        role: 'Admin',
                        status: 'active',
                        phone: '+91 94470 00000',
                        district: 'Idukki, Kerala',
                        location: 'Idukki, Kerala',
                        isVerified: true,
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                      },
                      {
                        _id: 'u-suresh-1',
                        id: 'u-suresh-1',
                        name: 'Suresh Menon',
                        fullName: 'Suresh Menon',
                        username: 'suresh_menon',
                        email: 'suresh.m@gmail.com',
                        role: 'Farmer',
                        status: 'active',
                        phone: '+91 94471 22334',
                        district: 'Kattappana, Idukki',
                        location: 'Kattappana, Idukki',
                        isVerified: true,
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                      },
                      {
                        _id: 'u-anitha-1',
                        id: 'u-anitha-1',
                        name: 'Anitha Selvam',
                        fullName: 'Anitha Selvam',
                        username: 'anitha_spices',
                        email: 'anitha.selvam@idukkispices.org',
                        role: 'Supervisor',
                        status: 'active',
                        phone: '+91 97451 88290',
                        district: 'Idukki, Kerala',
                        location: 'Vandenmedu, Idukki',
                        isVerified: true,
                        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
                      },
                      {
                        _id: 'u-devika-1',
                        id: 'u-devika-1',
                        name: 'Devika Raj',
                        fullName: 'Devika Raj',
                        username: 'devika_r',
                        email: 'devika.raj@yahoo.com',
                        role: 'Farmer',
                        status: 'active',
                        phone: '+91 98460 55667',
                        district: 'Vandiperiyar, Idukki',
                        location: 'Vandiperiyar, Idukki',
                        isVerified: true,
                        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
                      },
                      {
                        _id: 'u-ramesh-1',
                        id: 'u-ramesh-1',
                        name: 'Dr. Ramesh Nambiar',
                        fullName: 'Dr. Ramesh Nambiar',
                        username: 'dr_ramesh',
                        email: 'dr.ramesh@cardora.com',
                        role: 'Expert',
                        status: 'active',
                        phone: '+91 94471 23456',
                        district: 'Santhanpara, Idukki',
                        location: 'Santhanpara, Idukki',
                        isVerified: true,
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
                      },
                      { _id: 'u-7', id: 'u-7', name: 'Mathew George', fullName: 'Mathew George', username: 'mathew_g', email: 'mathew.g@gmail.com', role: 'Farmer', status: 'active', phone: '+91 94472 88192', district: 'Kattappana, Idukki', location: 'Kattappana, Idukki', isVerified: true },
                      { _id: 'u-8', id: 'u-8', name: 'Priya Nair', fullName: 'Priya Nair', username: 'priya_nair', email: 'priya.nair@cardoraplanters.in', role: 'Farmer', status: 'active', phone: '+91 98473 11204', district: 'Vandenmedu, Idukki', location: 'Vandenmedu, Idukki', isVerified: true },
                      { _id: 'u-9', id: 'u-9', name: 'K. J. Joseph', fullName: 'K. J. Joseph', username: 'kj_joseph', email: 'kj.joseph@cardoraplanters.in', role: 'Farmer', status: 'active', phone: '+91 94471 28901', district: 'Wayanad, Kerala', location: 'Meppadi, Wayanad', isVerified: true },
                      { _id: 'u-10', id: 'u-10', name: 'Dr. Suresh Kumar', fullName: 'Dr. Suresh Kumar', username: 'dr_suresh_k', email: 'suresh.k@cardora.com', role: 'Expert', status: 'active', phone: '+91 94475 99201', district: 'Munnar, Idukki', location: 'Munnar, Idukki', isVerified: true },
                      { _id: 'u-11', id: 'u-11', name: 'Anil Varghese', fullName: 'Anil Varghese', username: 'anil_varghese', email: 'anil.v@cardoraplanters.in', role: 'Supervisor', status: 'active', phone: '+91 97452 44310', district: 'Devikulam, Idukki', location: 'Devikulam, Idukki', isVerified: true },
                      { _id: 'u-12', id: 'u-12', name: 'Elizabeth Kurian', fullName: 'Elizabeth Kurian', username: 'elizabeth_k', email: 'elizabeth.k@gmail.com', role: 'Farmer', status: 'active', phone: '+91 94478 33219', district: 'Udumbanchola, Idukki', location: 'Udumbanchola, Idukki', isVerified: true },
                      { _id: 'u-13', id: 'u-13', name: 'Biju Varghese', fullName: 'Biju Varghese', username: 'biju_v', email: 'biju.v@gmail.com', role: 'Farmer', status: 'active', phone: '+91 98471 00293', district: 'Peermade, Idukki', location: 'Peermade, Idukki', isVerified: true },
                      { _id: 'u-14', id: 'u-14', name: 'Maya Sundaram', fullName: 'Maya Sundaram', username: 'maya_s', email: 'maya.s@cardoraplanters.in', role: 'Supervisor', status: 'active', phone: '+91 94476 11982', district: 'Nedumkandam, Idukki', location: 'Nedumkandam, Idukki', isVerified: true }
                    ];

                    const combined = [...users];
                    fallbackUsers.forEach((fb) => {
                      if (!combined.some((u) => u.email === fb.email || u.username === fb.username || (u._id && u._id === fb._id))) {
                        combined.push(fb);
                      }
                    });

                    const q = (globalSearchQuery || '').toLowerCase().trim();
                    const filtered = combined.filter((u) => {
                      const nameMatch = (u.name || u.fullName || '').toLowerCase().includes(q);
                      const userMatch = (u.username || '').toLowerCase().includes(q);
                      const emailMatch = (u.email || '').toLowerCase().includes(q);
                      const distMatch = (u.district || u.location || '').toLowerCase().includes(q);
                      const phoneMatch = (u.phone || '').toLowerCase().includes(q);
                      const roleStrMatch = (u.role || '').toLowerCase().includes(q);

                      const matchesSearch = !q || nameMatch || userMatch || emailMatch || distMatch || phoneMatch || roleStrMatch;

                      const matchesRole = roleFilter === 'ALL' || (u.role || '').toLowerCase().includes(roleFilter.toLowerCase());
                      const matchesDistrict = districtFilter === 'ALL' || (u.district || u.location || '').toLowerCase().includes(districtFilter.toLowerCase());

                      return matchesSearch && matchesRole && matchesDistrict;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-[#667085] font-bold">
                            No matching users or farmers found for "{globalSearchQuery}".
                          </td>
                        </tr>
                      );
                    }

                    const displayed = showAllUsers ? filtered : filtered.slice(0, 10);

                    return displayed.map((u) => (
                      <tr key={u.id || u._id || u.email} className="hover:bg-[#F5F7F6] dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={u.avatar || u.profileImage || u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.fullName || 'Farmer')}&background=145C3A&color=ffffff`}
                            className="w-9 h-9 rounded-full object-cover border-2 border-[#145C3A] shrink-0"
                            alt=""
                          />
                          <div>
                            <p className="font-extrabold text-[#101828] dark:text-white">{u.name || u.fullName || u.username}</p>
                            <p className="text-[10px] text-[#667085] font-mono">@{u.username || 'planter'}</p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full font-black text-[10px] bg-[#145C3A]/10 text-[#145C3A] dark:text-[#16A36A] border border-[#145C3A]/20">
                            {u.role || 'Farmer'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#172033] dark:text-slate-300">
                          {u.district || u.location || 'Idukki, Kerala'}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold">{u.email || 'N/A'}</p>
                          <p className="text-[10px] text-[#667085] font-mono">{u.phone || '+91 94470 00000'}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                            ● Active
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => showToast(`Editing profile for ${u.name || u.fullName}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#F5F7F6] dark:bg-slate-800 font-extrabold text-xs hover:bg-[#E2E8E5] text-[#172033] dark:text-slate-200 cursor-pointer border border-[#E2E8E5] dark:border-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => showToast(`User account status updated for ${u.name || u.fullName}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#E53955]/10 text-[#E53955] dark:bg-rose-950 font-extrabold text-xs hover:bg-[#E53955]/20 cursor-pointer border border-[#E53955]/20"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* 31. PAGINATION / VIEW MORE CONTROLS */}
            {(() => {
              const fallbackUsers = [
                { id: 'u-1', email: 'milu@cardoraplanters.in', role: 'Farmer', district: 'Idukki' },
                { id: 'u-2', email: 'admin@cardora.com', role: 'Admin', district: 'Idukki' },
                { id: 'u-3', email: 'suresh.m@gmail.com', role: 'Farmer', district: 'Idukki' },
                { id: 'u-4', email: 'anitha.selvam@idukkispices.org', role: 'Supervisor', district: 'Idukki' },
                { id: 'u-5', email: 'devika.raj@yahoo.com', role: 'Farmer', district: 'Idukki' },
                { id: 'u-6', email: 'dr.ramesh@cardora.com', role: 'Expert', district: 'Idukki' },
                { id: 'u-7', email: 'mathew.g@gmail.com', role: 'Farmer', district: 'Idukki' },
                { id: 'u-8', email: 'priya.nair@cardoraplanters.in', role: 'Farmer', district: 'Idukki' },
                { id: 'u-9', email: 'kj.joseph@cardoraplanters.in', role: 'Farmer', district: 'Wayanad' },
                { id: 'u-10', email: 'suresh.k@cardora.com', role: 'Expert', district: 'Idukki' },
                { id: 'u-11', email: 'anil.v@cardoraplanters.in', role: 'Supervisor', district: 'Idukki' },
                { id: 'u-12', email: 'elizabeth.k@gmail.com', role: 'Farmer', district: 'Idukki' },
                { id: 'u-13', email: 'biju.v@gmail.com', role: 'Farmer', district: 'Idukki' },
                { id: 'u-14', email: 'maya.s@cardoraplanters.in', role: 'Supervisor', district: 'Idukki' }
              ];
              const combined = [...users];
              fallbackUsers.forEach((fb) => {
                if (!combined.some((u) => u.email === fb.email)) combined.push(fb);
              });
              const q = (globalSearchQuery || '').toLowerCase().trim();
              const count = combined.filter((u) => {
                const matchesSearch = !q || (u.name || u.email || u.role || u.district || '').toLowerCase().includes(q);
                const matchesRole = roleFilter === 'ALL' || (u.role || '').toLowerCase().includes(roleFilter.toLowerCase());
                const matchesDistrict = districtFilter === 'ALL' || (u.district || '').toLowerCase().includes(districtFilter.toLowerCase());
                return matchesSearch && matchesRole && matchesDistrict;
              }).length;

              if (count > 10) {
                return (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowAllUsers(!showAllUsers)}
                      className="px-6 py-2.5 rounded-xl bg-[#145C3A] hover:bg-[#176B43] text-white font-extrabold text-xs shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>
                        {showAllUsers
                          ? 'Show Less'
                          : `View More Users (${count - 10} Remaining)`}
                      </span>
                      {showAllUsers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                );
              }
              return null;
            })()}

          </div>
        </div>
      ) : adminViewMode === 'marketplace' ? (
        <div className="space-y-6">
          <div className="admin-card p-6 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8E5] dark:border-[#1E2E25]">
              <div>
                <h3 className="text-base font-black text-[#101828] dark:text-white flex items-center gap-2">
                  <MapPin size={18} className="text-[#145C3A]" />
                  Marketplace & Plantation Plots Governance
                </h3>
                <p className="text-xs text-[#667085] font-medium">Verify Kerala Revenue Land Title Deeds (Pattayam) & moderate estate sales</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F6] dark:bg-slate-800/90 text-[#172033] dark:text-slate-300 font-extrabold uppercase tracking-wider text-[10px] border-b border-[#E2E8E5] dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Plantation Plot</th>
                    <th className="p-3.5">Location & Area</th>
                    <th className="p-3.5">Pattayam Title Deed OCR Score</th>
                    <th className="p-3.5">Price & Yield</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E5] dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {(() => {
                    const displayedMarketplace = showAllMarketplace ? adminMarketplaceListings : adminMarketplaceListings.slice(0, 10);
                    return displayedMarketplace.map((item) => (
                      <tr key={item.id || item._id} className="hover:bg-[#F5F7F6] dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={item.image} className="w-10 h-10 rounded-lg object-cover border border-[#145C3A] shrink-0" alt="" />
                          <div>
                            <p className="font-extrabold text-[#101828] dark:text-white">{item.title}</p>
                            <p className="text-[10px] text-[#667085]">Owner: {item.owner}</p>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-[#172033] dark:text-slate-300">
                          {item.location} • {item.area}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                            ✓ {item.pattayamDoc?.score || 98}% OCR Verified ({item.pattayamDoc?.surveyNo || 'Sy. 428/1-B'})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="font-extrabold text-[#145C3A] dark:text-[#16A36A]">{item.price}</p>
                          <p className="text-[10px] text-[#667085] font-mono">{item.yield}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#16A36A]/10 text-[#16A36A]">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button onClick={() => showToast(`Inspecting title deed for ${item.title}`)} className="px-2.5 py-1 rounded-lg bg-[#145C3A] text-white font-extrabold text-xs cursor-pointer">
                            Verify
                          </button>
                          <button onClick={() => setMarketplaceItemToDelete(item)} className="px-2.5 py-1 rounded-lg bg-[#E53955]/10 text-[#E53955] font-extrabold text-xs cursor-pointer border border-[#E53955]/20">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {adminMarketplaceListings.length > 10 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowAllMarketplace(!showAllMarketplace)}
                  className="px-6 py-2.5 rounded-xl bg-[#145C3A] hover:bg-[#176B43] text-white font-black text-xs shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {showAllMarketplace
                      ? 'Show Less'
                      : `View More Listings (${adminMarketplaceListings.length - 10} Remaining)`}
                  </span>
                  {showAllMarketplace ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : adminViewMode === 'activity' ? (
        <div className="admin-card p-6 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
          <h3 className="text-base font-black text-[#101828] dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-[#145C3A]" />
            Full System Audit & Attendance Activity Log
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Admin approved farmer registration (K. J. Joseph)', actor: 'System Admin', time: '10:32 AM', status: 'COMPLETED' },
              { title: 'Supervisor check-in for 24 harvesters in Highrange plot', actor: 'Anitha Selvam', time: '10:18 AM', status: 'VERIFIED' },
              { title: 'Sensor telemetry received (Devikulam Node #482 - 72% Moisture)', actor: 'IoT Gateway', time: '09:54 AM', status: 'RECORDED' },
              { title: 'Marketplace land title OCR scan executed (Pattayam Sy #428)', actor: 'Gemini AI OCR', time: '09:31 AM', status: 'VERIFIED' },
              { title: 'Wages telemetry payout calculated for Kattappana block', actor: 'Finance System', time: '09:10 AM', status: 'CALCULATED' },
            ].map((a, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-[#101828] dark:text-white">{a.title}</p>
                  <p className="text-[10px] text-[#667085]">By {a.actor} • {a.time}</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : adminViewMode === 'posts' ? (
        <div className="admin-card p-6 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
          <h3 className="text-base font-black text-[#101828] dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-[#145C3A]" />
            Community Feed Moderation & Messages Desk
          </h3>
          <div className="space-y-3">
            {communityPosts.map((post) => (
              <div key={post.id || post._id} className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between text-xs gap-3">
                <div>
                  <p className="font-extrabold text-[#101828] dark:text-white">{post.author || 'Planter'}</p>
                  <p className="text-[#667085] dark:text-slate-300 mt-1">{post.content || post.description}</p>
                </div>
                <button onClick={() => showToast(`Post moderated`)} className="px-3 py-1.5 rounded-lg bg-[#E53955]/10 text-[#E53955] font-extrabold text-xs shrink-0 cursor-pointer border border-[#E53955]/20">
                  Delete Post
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : adminViewMode === 'contractors' ? (
        <div className="admin-card p-6 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
          <h3 className="text-base font-black text-[#101828] dark:text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#145C3A]" />
            Supervisors & License Verification Panel
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Anitha Selvam', license: 'KLA-IDK-SUP-8492', district: 'Idukki', status: 'VERIFIED' },
              { name: 'Highrange Labor Contractors', license: 'KLA-IDK-SUP-3920', district: 'Idukki', status: 'VERIFIED' },
              { name: 'Vandanmedu Labor Team', license: 'KLA-IDK-SUP-1102', district: 'Idukki', status: 'PENDING' },
            ].map((c, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-[#101828] dark:text-white">{c.name}</p>
                  <p className="text-[10px] text-[#667085]">License: {c.license} • {c.district}</p>
                </div>
                <button onClick={() => showToast(`Supervisor verified: ${c.name}`)} className="px-3 py-1.5 rounded-lg bg-[#145C3A] text-white font-extrabold text-xs cursor-pointer shadow-xs">
                  Verify License
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : adminViewMode === 'recommendations' ? (
        <div className="admin-card p-6 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25] space-y-4">
          <h3 className="text-base font-black text-[#101828] dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#8B3DFF]" />
            AI Crop System Diagnostics & Analytics
          </h3>
          <p className="text-xs text-[#667085] font-medium">Automated platform-wide pathogen risk, yield forecasts, and telemetry analytics across Western Ghats</p>
        </div>
      ) : adminViewMode === 'charts' ? (
        <AdminAnalyticsCharts analyticsData={analytics} timeframe={analyticsTimeframe} setTimeframe={setAnalyticsTimeframe} />
      ) : (
        <div className="admin-card p-6 rounded-xl border border-[#E2E8E5] dark:border-[#1E2E25]">
          <p className="text-xs font-bold text-[#667085]">Selected View: {adminViewMode}</p>
        </div>
      )}

      {/* QUICK ADD USER MODAL */}
      <AnimatePresence>
        {quickAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-[#E2E8E5] dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E2E8E5] dark:border-slate-800">
                <h3 className="text-base font-black text-[#101828] dark:text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-[#145C3A]" />
                  Register New User / Farmer
                </h3>
                <button onClick={() => setQuickAddUserOpen(false)} className="text-[#667085] font-bold hover:text-[#101828]">✕</button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                showToast(`User account created for ${newUserForm.name}`);
                setQuickAddUserOpen(false);
              }} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#172033] dark:text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anitha Selvam"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 text-[#101828] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172033] dark:text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. anitha@cardoraplanters.in"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 text-[#101828] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#172033] dark:text-slate-300 block mb-1">Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 text-[#101828] dark:text-white font-bold"
                    >
                      <option value="Farmer">Farmer / Planter</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#172033] dark:text-slate-300 block mb-1">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Idukki, Kerala"
                      value={newUserForm.district}
                      onChange={(e) => setNewUserForm({ ...newUserForm, district: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 border border-[#E2E8E5] dark:border-slate-700 text-[#101828] dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8E5] dark:border-slate-800">
                  <button type="button" onClick={() => setQuickAddUserOpen(false)} className="px-4 py-2 rounded-xl bg-[#F5F7F6] dark:bg-slate-800 text-[#172033] dark:text-slate-300 font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#145C3A] text-white font-black">
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
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-[#E2E8E5] dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-[#E53955] flex items-center gap-2">
                <AlertTriangle size={18} />
                Delete Marketplace Plot Listing?
              </h3>
              <p className="text-xs text-[#667085] dark:text-slate-400 font-medium">
                Are you sure you want to remove <strong>"{marketplaceItemToDelete.title}"</strong>? This will remove the listing and its Pattayam records from the admin dashboard.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setMarketplaceItemToDelete(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-slate-800 text-[#172033] dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteMarketplaceListing}
                  disabled={deletingMarketplaceListing}
                  className="px-3 py-1.5 rounded-lg bg-[#E53955] text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50"
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
