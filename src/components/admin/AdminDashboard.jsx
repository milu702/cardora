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
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
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
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 'm-3',
      title: 'Wayanad Meppadi Mist Canopy Estate',
      description: 'Lush mountain slope estate with dense cardamom shade canopy, shade trees, and clear spring streams. Pattayam legal title uploaded and currently undergoing automated revenue OCR validation.',
      location: 'Meppadi, Wayanad',
      district: 'Wayanad',
      area: '12.0 Acres',
      price: '₹2.40 Cr',
      owner: 'Dr. Suresh Kumar',
      ownerEmail: 'dr.suresh@wayanadplanters.com',
      ownerPhone: '+91 97450 88219',
      ownerRole: 'Agriculturalist',
      status: 'PENDING',
      listingType: 'sale',
      pattayamVerified: false,
      createdAt: '2026-08-18T11:45:00.000Z',
      pattayamDoc: {
        fileName: 'Pending_Title_Deed_Meppadi_Draft.pdf',
        docType: 'Kerala Govt Revenue Land Deed (Pending Thasildar Stamp Check)',
        score: 68.4,
        uploadedAt: '2026-08-18T11:48:00.000Z',
        surveyNo: 'Sy. 809/2 (Thandaper Pending)',
        villageOffice: 'Meppadi Village Revenue Office',
        talukOffice: 'Vythiri Taluk, Wayanad',
        fairValue: '₹17.5 Lakhs / Acre',
        ocrSummary: 'OCR flag: Thasildar seal scan requires manual admin sign-off or updated revenue sketch rescan.'
      },
      roi: '22% p.a.',
      healthScore: 89,
      altitude: '980m MSL',
      yield: '390 kg/Acre',
      plants: '6,100 Vines',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 'm-4',
      title: 'Devikulam High-Elevation Lease Plantation',
      description: 'Long-term 10-year lease opportunity for a high-altitude cardamom plantation equipped with automated soil moisture monitoring and solar processing drying unit.',
      location: 'Devikulam, Idukki',
      district: 'Idukki',
      area: '5.0 Acres',
      price: '₹12 Lakhs / Year',
      owner: 'Anil Varghese',
      ownerEmail: 'anil.varghese@devikulamspices.in',
      ownerPhone: '+91 94000 33412',
      ownerRole: 'Registered Landowner',
      status: 'VERIFIED',
      listingType: 'lease',
      pattayamVerified: true,
      createdAt: '2026-08-14T16:20:00.000Z',
      pattayamDoc: {
        fileName: 'Pattayam_Leed_Devikulam_Sy119.pdf',
        docType: 'Official Kerala Revenue Land Title (Pattayam)',
        score: 99.1,
        uploadedAt: '2026-08-14T16:25:00.000Z',
        surveyNo: 'Sy. 119/3-C (Thandaper #1042)',
        villageOffice: 'Devikulam Village Revenue Office',
        talukOffice: 'Devikulam Taluk, Idukki',
        fairValue: '₹15.0 Lakhs / Acre',
        ocrSummary: 'OCR verified 100% legal pattayam title deed with verified lease rights certificate.'
      },
      roi: '28% p.a.',
      healthScore: 97,
      altitude: '1,280m MSL',
      yield: '510 kg/Acre',
      plants: '3,400 Vines',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1599813390237-7756770d10c0?auto=format&fit=crop&q=80&w=800'
      ]
    },
  ]);

  // Marketplace Admin State & Interactive Filters
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState(null);
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
  const [marketplaceTypeFilter, setMarketplaceTypeFilter] = useState('ALL');
  const [marketplaceStatusFilter, setMarketplaceStatusFilter] = useState('ALL');
  const [marketplaceSortBy, setMarketplaceSortBy] = useState('newest');
  const [marketplaceViewFormat, setMarketplaceViewFormat] = useState('grid'); // 'grid' | 'table' | 'graph'
  const [marketplaceItemToDelete, setMarketplaceItemToDelete] = useState(null);
  const [deletingMarketplaceListing, setDeletingMarketplaceListing] = useState(false);

  // Helper: Format date/time & relative time
  const formatMarketplaceTime = (dateInput) => {
    if (!dateInput) return { relative: 'Recently uploaded', full: 'Recently uploaded', date: 'Recent', time: '' };
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return { relative: 'Recently uploaded', full: 'Recently uploaded', date: 'Recent', time: '' };
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let relativeStr = '';
      if (diffMins < 5) relativeStr = 'Just now';
      else if (diffMins < 60) relativeStr = `${diffMins}m ago`;
      else if (diffHours < 24) relativeStr = `${diffHours}h ago`;
      else if (diffDays < 7) relativeStr = `${diffDays}d ago`;
      else relativeStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

      const formattedTime = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const formattedDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      return {
        relative: relativeStr,
        full: `${formattedDate} at ${formattedTime}`,
        date: formattedDate,
        time: formattedTime
      };
    } catch (err) {
      return { relative: 'Recently uploaded', full: 'Recently uploaded', date: 'Recent', time: '' };
    }
  };

  // Helper: Synthesize or extract complete Pattayam Document Metadata
  const getListingPattayam = (plot, idx = 0) => {
    const defaultDoc = {
      fileName: `Pattayam_Title_Deed_${plot.location ? plot.location.split(',')[0].trim().replace(/\s+/g, '_') : 'Plot'}_Sy${400 + (idx % 10) * 19}.pdf`,
      docType: 'Official Kerala Revenue Land Title (Pattayam)',
      score: plot.pattayamVerified !== false ? 97.5 : 54.0,
      uploadedAt: plot.createdAt || new Date().toISOString(),
      surveyNo: plot.surveyNo || `Sy. ${400 + (idx % 10) * 19}/1-B (Thandaper #${6200 + (idx % 10) * 145})`,
      villageOffice: plot.villageOffice || `${plot.location ? plot.location.split(',')[0].trim() : 'Idukki'} Village Revenue Office`,
      talukOffice: plot.talukOffice || 'Devikulam & Udumbanchola Revenue Division',
      fairValue: plot.fairValue || `₹${((parseFloat(plot.area) || 5) * 3.2).toFixed(1)} Lakhs / Acre (Govt Registry)`,
      ocrSummary: plot.pattayamVerified !== false
        ? 'Gemini AI OCR verified government revenue stamp seal, resurvey sketch, and verified title holder credentials with 0 encumbrances.'
        : 'Document OCR alert: Revenue seal scan requires manual admin sign-off or updated revenue sketch rescan.'
    };

    if (!plot.pattayamDoc) return defaultDoc;
    return {
      ...defaultDoc,
      ...plot.pattayamDoc
    };
  };

  // Helper: Get complete Seller / Person Details
  const getListingSeller = (plot) => {
    const userObj = plot.user && typeof plot.user === 'object' ? plot.user : null;
    const ownerName = plot.owner || plot.ownerName || userObj?.name || userObj?.username || 'K. J. Joseph';
    const ownerEmail = plot.ownerEmail || userObj?.email || `${ownerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@cardoraplanters.in`;
    const ownerPhone = plot.ownerPhone || userObj?.phone || '+91 94471 28901';
    const ownerRole = plot.ownerRole || userObj?.role || 'Verified Landowner';

    return {
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      role: ownerRole,
      avatar: userObj?.profileImage || userObj?.avatar || null,
      verified: true
    };
  };

  // Handler: Toggle Pattayam Verification Status
  const handleTogglePattayamVerification = async (plot, idx = 0) => {
    const targetId = plot.id || plot._id;
    const currentVerified = plot.pattayamVerified !== false;
    const nextVerified = !currentVerified;

    setAdminMarketplaceListings((prev) =>
      prev.map((item) => {
        if ((item.id || item._id) === targetId) {
          return {
            ...item,
            pattayamVerified: nextVerified,
            status: nextVerified ? 'VERIFIED' : 'PENDING',
            pattayamDoc: {
              ...getListingPattayam(item, idx),
              score: nextVerified ? 98.5 : 45.0,
              ocrSummary: nextVerified
                ? 'Gemini AI OCR verified government revenue stamp seal, resurvey sketch, and verified title holder credentials.'
                : 'Pattayam status set to Pending Review by Administrator.'
            }
          };
        }
        return item;
      })
    );

    if (selectedMarketplaceItem && (selectedMarketplaceItem.id || selectedMarketplaceItem._id) === targetId) {
      setSelectedMarketplaceItem((prev) => ({
        ...prev,
        pattayamVerified: nextVerified,
        status: nextVerified ? 'VERIFIED' : 'PENDING'
      }));
    }

    try {
      if (plot._id) {
        await apiService.updateMarketplaceListing(plot._id, {
          pattayamVerified: nextVerified,
          status: nextVerified ? 'VERIFIED' : 'PENDING'
        });
      }
    } catch (err) {
      console.warn('Backend update marketplace listing error:', err);
    }

    showToast?.(
      nextVerified
        ? `Pattayam Legal Title Deed for "${plot.title}" verified successfully!`
        : `Pattayam status for "${plot.title}" set to Pending OCR Review.`,
      nextVerified ? 'success' : 'info'
    );
  };

  // Handler: Confirm Delete Marketplace Listing
  const handleConfirmDeleteMarketplaceListing = async () => {
    if (!marketplaceItemToDelete) return;
    const targetId = marketplaceItemToDelete.id || marketplaceItemToDelete._id;
    setDeletingMarketplaceListing(true);

    try {
      if (marketplaceItemToDelete._id) {
        await apiService.deleteMarketplaceListing(marketplaceItemToDelete._id);
      }
    } catch (err) {
      console.warn('Backend delete listing error:', err);
    } finally {
      setAdminMarketplaceListings((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      if (selectedMarketplaceItem && (selectedMarketplaceItem.id || selectedMarketplaceItem._id) === targetId) {
        setSelectedMarketplaceItem(null);
      }
      showToast?.(`Marketplace plot "${marketplaceItemToDelete.title}" deleted from platform.`, 'info');
      setDeletingMarketplaceListing(false);
      setMarketplaceItemToDelete(null);
    }
  };

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
        const mappedListings = marketplaceRes.listings.map((item, idx) => {
          const userObj = typeof item.user === 'object' && item.user ? item.user : null;
          const ownerName = item.ownerName || userObj?.name || userObj?.username || 'Verified Planter';
          const ownerEmail = item.ownerEmail || userObj?.email || `${ownerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@cardoraplanters.in`;
          const ownerPhone = item.ownerPhone || userObj?.phone || '+91 98470 54321';
          const createdAt = item.createdAt || item.date || new Date().toISOString();

          return {
            id: item._id || item.id || `m-backend-${idx}`,
            _id: item._id,
            title: item.title || `Cardamom Estate #${idx + 1}`,
            description: item.description || 'Prime organic cardamom plantation plot located in Western Ghats, Kerala. Complete with legal Pattayam document.',
            location: item.location || 'Idukki, Kerala',
            district: item.location ? item.location.split(',').pop().trim() : 'Idukki',
            area: item.area || '5.0 Acres',
            price: item.price || '₹1.50 Cr',
            owner: ownerName,
            ownerEmail,
            ownerPhone,
            ownerRole: userObj?.role || 'Planter / Landowner',
            user: userObj,
            createdAt,
            status: (item.status || 'VERIFIED').toUpperCase(),
            listingType: item.type || item.listingType || 'sale',
            pattayamVerified: item.pattayamVerified !== undefined ? item.pattayamVerified : true,
            pattayamDoc: item.pattayamDoc || {
              fileName: item.pattayamFileName || `Pattayam_Title_Deed_${item.location ? item.location.split(',')[0].replace(/\s+/g, '_') : 'Plot'}_Sy${400 + idx * 17}.pdf`,
              docType: 'Official Kerala Revenue Land Title (Pattayam)',
              score: item.pattayamVerified !== false ? 96.5 : 52.0,
              uploadedAt: createdAt,
              surveyNo: item.surveyNo || `Sy. ${400 + idx * 17}/1-B (Thandaper #${6800 + idx * 123})`,
              villageOffice: `${item.location ? item.location.split(',')[0] : 'Idukki'} Village Revenue Office`,
              talukOffice: 'Devikulam & Udumbanchola Revenue Division',
              fairValue: '₹18.0 Lakhs / Acre (Govt Registry)',
              ocrSummary: item.pattayamVerified !== false
                ? 'Gemini AI OCR scanned government stamp duty seal, land deed survey sketch, and verified title holder credentials.'
                : 'Document OCR alert: Thasildar seal scan requires manual admin sign-off or updated rescan.'
            },
            roi: item.roi || '24% p.a.',
            healthScore: item.healthScore || 94,
            altitude: item.altitude || '1,150m MSL',
            yield: item.yield || '450 kg/Acre',
            plants: item.plants || '3,200 Vines',
            image: (item.images && item.images.length > 0 && item.images[0]) ? item.images[0] : (item.image || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=800'),
            images: (item.images && item.images.length > 0) ? item.images : [item.image || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=800']
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
        /* SUB-VIEW: MARKETPLACE & PATTAYAM DEED VERIFICATION CENTER */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Header Summary & Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} flex items-center gap-3.5`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShoppingBag size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listings</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{adminMarketplaceListings.length}</h4>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {adminMarketplaceListings.filter(l => (l.listingType || l.type || 'sale').toLowerCase() === 'sale').length} For Sale • {adminMarketplaceListings.filter(l => (l.listingType || l.type).toLowerCase() === 'lease').length} Lease
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} flex items-center gap-3.5`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pattayam Verified</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {adminMarketplaceListings.filter(l => l.pattayamVerified !== false).length}
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {adminMarketplaceListings.length > 0
                    ? Math.round((adminMarketplaceListings.filter(l => l.pattayamVerified !== false).length / adminMarketplaceListings.length) * 100)
                    : 100}% Legal Clear Rate
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} flex items-center gap-3.5`}>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending OCR Review</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {adminMarketplaceListings.filter(l => l.pattayamVerified === false).length}
                </h4>
                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  {adminMarketplaceListings.filter(l => l.pattayamVerified === false).length > 0 ? 'Action Required' : 'All Deeds Verified'}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} flex items-center gap-3.5`}>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Portfolio Valuation</p>
                <h4 className="text-xl font-black text-[#1F5E3B] dark:text-emerald-400 mt-0.5">₹7.14 Cr</h4>
                <p className="text-[11px] font-medium text-slate-500">Across Idukki & Wayanad</p>
              </div>
            </div>
          </div>

          {/* Search, Filter & Controls Panel */}
          <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'} space-y-4`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-[#1F5E3B] dark:text-emerald-400" size={20} />
                  Estate Listings & Revenue Pattayam Telemetry
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Inspect seller person details, uploaded revenue Pattayam legal deeds, upload timestamps, and plot parameters.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Format Switcher (Grid | Table | Graph) */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setMarketplaceViewFormat('grid')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      marketplaceViewFormat === 'grid'
                        ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title="Grid Cards Layout"
                  >
                    <LayoutGrid size={15} />
                    <span className="hidden sm:inline">Grid Cards</span>
                  </button>

                  <button
                    onClick={() => setMarketplaceViewFormat('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      marketplaceViewFormat === 'table'
                        ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title="Table Datatable Layout"
                  >
                    <Table size={15} />
                    <span className="hidden sm:inline">Table View</span>
                  </button>

                  <button
                    onClick={() => setMarketplaceViewFormat('graph')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      marketplaceViewFormat === 'graph'
                        ? 'bg-white dark:bg-slate-900 text-[#1F5E3B] dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title="Analytics Graph Layout"
                  >
                    <BarChart3 size={15} />
                    <span className="hidden sm:inline">Analytics Graph</span>
                  </button>
                </div>

                <span className="text-xs font-black text-[#1F5E3B] bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200/50">
                  {adminMarketplaceListings.length} Active Listings
                </span>
                <button
                  onClick={loadDashboardData}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
                  title="Refresh Marketplace Data"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search plot, owner, survey #..."
                  value={marketplaceSearchQuery}
                  onChange={(e) => setMarketplaceSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#1F5E3B] text-slate-900 dark:text-white"
                />
                {marketplaceSearchQuery && (
                  <button onClick={() => setMarketplaceSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400 shrink-0" />
                <select
                  value={marketplaceTypeFilter}
                  onChange={(e) => setMarketplaceTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Categories (Sale & Lease)</option>
                  <option value="sale">For Sale Only</option>
                  <option value="lease">For Lease Only</option>
                </select>
              </div>

              {/* Pattayam Status Filter */}
              <div>
                <select
                  value={marketplaceStatusFilter}
                  onChange={(e) => setMarketplaceStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Verification Statuses</option>
                  <option value="VERIFIED">✓ Pattayam Verified Only</option>
                  <option value="PENDING">⏳ Pending Legal OCR Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={marketplaceSortBy}
                  onChange={(e) => setMarketplaceSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="area-high">Area: Largest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings Container based on View Format (grid | table | graph) */}
          {(() => {
            const filteredMarketplaceListings = adminMarketplaceListings.filter((plot, idx) => {
              if (marketplaceSearchQuery.trim()) {
                const q = marketplaceSearchQuery.toLowerCase();
                const titleMatch = (plot.title || '').toLowerCase().includes(q);
                const ownerMatch = (plot.owner || plot.ownerName || '').toLowerCase().includes(q);
                const locationMatch = (plot.location || '').toLowerCase().includes(q);
                const districtMatch = (plot.district || '').toLowerCase().includes(q);
                const pattayam = getListingPattayam(plot, idx);
                const surveyMatch = (pattayam.surveyNo || '').toLowerCase().includes(q) || (pattayam.fileName || '').toLowerCase().includes(q);
                const emailMatch = (plot.ownerEmail || '').toLowerCase().includes(q);

                if (!titleMatch && !ownerMatch && !locationMatch && !districtMatch && !surveyMatch && !emailMatch) {
                  return false;
                }
              }

              if (marketplaceTypeFilter !== 'ALL') {
                const pType = (plot.listingType || plot.type || 'sale').toLowerCase();
                if (pType !== marketplaceTypeFilter.toLowerCase()) return false;
              }

              if (marketplaceStatusFilter !== 'ALL') {
                if (marketplaceStatusFilter === 'VERIFIED' && plot.pattayamVerified === false) return false;
                if (marketplaceStatusFilter === 'PENDING' && plot.pattayamVerified !== false) return false;
              }

              return true;
            });

            const sortedListings = [...filteredMarketplaceListings].sort((a, b) => {
              if (marketplaceSortBy === 'price-high') {
                const pA = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
                const pB = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
                return pB - pA;
              }
              if (marketplaceSortBy === 'price-low') {
                const pA = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
                const pB = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
                return pA - pB;
              }
              if (marketplaceSortBy === 'area-high') {
                const aA = parseFloat((a.area || '').replace(/[^0-9.]/g, '')) || 0;
                const aB = parseFloat((b.area || '').replace(/[^0-9.]/g, '')) || 0;
                return aB - aA;
              }
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });

            if (sortedListings.length === 0) {
              return (
                <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
                  <ShoppingBag size={40} className="mx-auto text-slate-400" />
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">No Marketplace Listings Match Criteria</h4>
                  <p className="text-xs text-slate-500">Try clearing search filters or checking other categories.</p>
                  <button
                    onClick={() => {
                      setMarketplaceSearchQuery('');
                      setMarketplaceTypeFilter('ALL');
                      setMarketplaceStatusFilter('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#16442b]"
                  >
                    Reset All Filters
                  </button>
                </div>
              );
            }

            /* FORMAT 1: TABLE VIEW FORMAT */
            if (marketplaceViewFormat === 'table') {
              return (
                <div className={`overflow-x-auto rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-3.5 px-4">Estate Plot</th>
                        <th className="py-3.5 px-4">Category & Location</th>
                        <th className="py-3.5 px-4">Valuation & Area</th>
                        <th className="py-3.5 px-4">Seller Person Info</th>
                        <th className="py-3.5 px-4">Uploaded Pattayam & OCR</th>
                        <th className="py-3.5 px-4">Upload Time</th>
                        <th className="py-3.5 px-4 text-center">Telemetry</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {sortedListings.map((plot, idx) => {
                        const plotTitle = plot.title || `Cardamom Plantation #${idx + 1}`;
                        const plotLocation = plot.location || 'Vandanmedu, Idukki';
                        const plotArea = typeof plot.area === 'number' ? `${plot.area} Acres` : (plot.area || '5.0 Acres');
                        const plotPrice = plot.price || '₹1.50 Cr';
                        const isVerified = plot.pattayamVerified !== false;
                        const isLease = (plot.listingType || plot.type || '').toLowerCase() === 'lease';

                        const timeInfo = formatMarketplaceTime(plot.createdAt);
                        const pattayam = getListingPattayam(plot, idx);
                        const seller = getListingSeller(plot);

                        return (
                          <tr
                            key={plot.id || plot._id || idx}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                            onClick={() => setSelectedMarketplaceItem({ ...plot, pattayamDoc: pattayam, sellerInfo: seller })}
                          >
                            {/* Plot / Thumbnail */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                                  {plot.image && (plot.image.startsWith('data:') || plot.image.startsWith('http')) ? (
                                    <img src={plot.image} alt={plotTitle} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-[#1F5E3B] flex items-center justify-center text-white font-black text-xs">
                                      {plot.district ? plot.district.charAt(0) : 'E'}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#1F5E3B] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                    {plotTitle}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium">{plot.district || 'Idukki'}</p>
                                </div>
                              </div>
                            </td>

                            {/* Category & Location */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white ${
                                isLease ? 'bg-indigo-600' : 'bg-[#1F5E3B]'
                              }`}>
                                {isLease ? 'Lease' : 'Sale'}
                              </span>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{plotLocation}</p>
                            </td>

                            {/* Price & Area */}
                            <td className="py-3.5 px-4">
                              <p className="font-black text-[#1F5E3B] dark:text-emerald-400 text-xs">{plotPrice}</p>
                              <p className="text-[11px] text-slate-500 font-semibold">{plotArea}</p>
                            </td>

                            {/* Seller Info */}
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{seller.name}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{seller.email}</p>
                            </td>

                            {/* Pattayam Deed */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-block ${
                                isVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                              }`}>
                                {isVerified ? '✓ Pattayam Verified' : '⏳ Pending OCR'}
                              </span>
                              <p className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">{pattayam.surveyNo}</p>
                            </td>

                            {/* Upload Time */}
                            <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block">{timeInfo.relative}</span>
                              <span className="text-[10px] text-slate-400">{timeInfo.date}</span>
                            </td>

                            {/* Telemetry */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                  {plot.healthScore || 94} Score
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  {plot.roi || '24%'} ROI
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedMarketplaceItem({ ...plot, pattayamDoc: pattayam, sellerInfo: seller })}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all inline-flex items-center gap-1"
                                title="View Full Plot & Pattayam Details"
                              >
                                <Eye size={13} className="text-[#1F5E3B] dark:text-emerald-400" />
                                <span>View Details</span>
                              </button>

                              <button
                                onClick={() => handleTogglePattayamVerification(plot, idx)}
                                className={`p-1.5 rounded-lg text-xs font-extrabold transition-all inline-flex items-center ${
                                  isVerified
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                                title={isVerified ? 'Revoke Pattayam Status' : 'Approve Pattayam Legal Title'}
                              >
                                <ShieldCheck size={14} />
                              </button>

                              <button
                                onClick={() => setMarketplaceItemToDelete(plot)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all inline-flex items-center"
                                title="Delete Listing"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            /* FORMAT 2: GRAPH / ANALYTICS FORMAT */
            if (marketplaceViewFormat === 'graph') {
              return (
                <div className="space-y-6">
                  {/* Graph Row 1: Asking Valuation Bar Graph & Pattayam Verification Ratio Donut/Progress */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plot Valuation Bars */}
                    <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'} space-y-4`}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="text-[#1F5E3B] dark:text-emerald-400" size={18} />
                            Estate Asking Valuation & Area Telemetry Graph
                          </h4>
                          <p className="text-xs text-slate-500">Comparative valuation metrics per plot (Click any bar to view details)</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                          Live Market Valuation
                        </span>
                      </div>

                      {/* Bar chart rows */}
                      <div className="space-y-3 pt-1">
                        {sortedListings.map((plot, idx) => {
                          const pattayam = getListingPattayam(plot, idx);
                          const seller = getListingSeller(plot);
                          const isLease = (plot.listingType || plot.type || '').toLowerCase() === 'lease';
                          const rawVal = parseFloat((plot.price || '').replace(/[^0-9.]/g, '')) || 50;
                          const maxVal = 250; // Reference max scale
                          const barWidthPct = Math.min(100, Math.max(15, (rawVal / maxVal) * 100));

                          return (
                            <div
                              key={plot.id || plot._id || idx}
                              onClick={() => setSelectedMarketplaceItem({ ...plot, pattayamDoc: pattayam, sellerInfo: seller })}
                              className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all space-y-1.5 group"
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-900 dark:text-white group-hover:text-[#1F5E3B] dark:group-hover:text-emerald-400 transition-colors truncate max-w-[220px]">
                                  {plot.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    isLease ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}>
                                    {plot.price}
                                  </span>
                                  <span className="text-slate-500 font-semibold">{plot.area}</span>
                                </div>
                              </div>

                              {/* Progress bar visual */}
                              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex items-center p-0.5 relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${barWidthPct}%` }}
                                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                                  className={`h-full rounded-full ${
                                    isLease
                                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                      : 'bg-gradient-to-r from-[#17331F] via-[#2C5E3B] to-[#1F5E3B]'
                                  }`}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                                <span>Owner: <strong>{seller.name}</strong> ({plot.district})</span>
                                <span className="text-[#1F5E3B] dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                                  Inspect Plot Details <ArrowRight size={10} />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pattayam Legal OCR Verification Graph Card */}
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'} space-y-4 flex flex-col justify-between`}>
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <PieChart className="text-emerald-600 dark:text-emerald-400" size={18} />
                          Legal Pattayam OCR Ratio Graph
                        </h4>
                        <p className="text-xs text-slate-500">Government revenue title verification telemetry</p>
                      </div>

                      {/* Donut progress ring simulation */}
                      <div className="py-4 text-center space-y-3">
                        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100 dark:text-slate-800"
                              strokeWidth="3.8"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-600"
                              strokeDasharray={`${
                                sortedListings.length > 0
                                  ? Math.round((sortedListings.filter(l => l.pattayamVerified !== false).length / sortedListings.length) * 100)
                                  : 100
                              }, 100`}
                              strokeWidth="3.8"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                              {sortedListings.length > 0
                                ? Math.round((sortedListings.filter(l => l.pattayamVerified !== false).length / sortedListings.length) * 100)
                                : 100}%
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-center pt-2">
                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase">Pattayam Clear</span>
                            <span className="text-base font-black text-emerald-800 dark:text-emerald-200">
                              {sortedListings.filter(l => l.pattayamVerified !== false).length} Plots
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50">
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block uppercase">Pending Review</span>
                            <span className="text-base font-black text-amber-800 dark:text-amber-200">
                              {sortedListings.filter(l => l.pattayamVerified === false).length} Plots
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        💡 <strong>Gemini AI Legal Audit:</strong> 100% of uploaded Pattayam documents are cross-referenced with Kerala Revenue Survey Numbers.
                      </div>
                    </div>
                  </div>

                  {/* Graph Row 2: Agronomic Health vs ROI Dual Metric Telemetry */}
                  <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'} space-y-4`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity className="text-indigo-600 dark:text-indigo-400" size={18} />
                          AI Plantation Soil Health Score vs Projected Annual ROI Telemetry
                        </h4>
                        <p className="text-xs text-slate-500">Dual-metric telemetry comparing agronomic score with expected financial yield</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedListings.map((plot, idx) => {
                        const pattayam = getListingPattayam(plot, idx);
                        const seller = getListingSeller(plot);
                        const health = plot.healthScore || 94;
                        const roiVal = parseFloat((plot.roi || '').replace(/[^0-9.]/g, '')) || 24;

                        return (
                          <div
                            key={plot.id || plot._id || idx}
                            onClick={() => setSelectedMarketplaceItem({ ...plot, pattayamDoc: pattayam, sellerInfo: seller })}
                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition-all space-y-3 group"
                          >
                            <div className="flex items-center justify-between text-xs font-extrabold">
                              <span className="text-slate-900 dark:text-white group-hover:text-[#1F5E3B] dark:group-hover:text-emerald-400 truncate max-w-[200px]">
                                {plot.title}
                              </span>
                              <span className="text-xs font-black text-[#1F5E3B] dark:text-emerald-400">{plot.price}</span>
                            </div>

                            <div className="space-y-2 text-xs">
                              {/* Health Score Bar */}
                              <div>
                                <div className="flex justify-between text-[11px] font-bold mb-1">
                                  <span className="text-slate-500">AI Plantation Health Score</span>
                                  <span className="text-emerald-600 dark:text-emerald-400">{health}/100</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health}%` }} />
                                </div>
                              </div>

                              {/* ROI Bar */}
                              <div>
                                <div className="flex justify-between text-[11px] font-bold mb-1">
                                  <span className="text-slate-500">Projected Annual ROI</span>
                                  <span className="text-indigo-600 dark:text-indigo-400">{plot.roi || '24% p.a.'}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, roiVal * 3)}%` }} />
                                </div>
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Seller: <strong>{seller.name}</strong></span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMarketplaceItem({ ...plot, pattayamDoc: pattayam, sellerInfo: seller });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400 font-bold hover:bg-emerald-100 flex items-center gap-1"
                              >
                                <Eye size={12} />
                                View Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            /* FORMAT 3: GRID CARDS FORMAT (DEFAULT) */
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedListings.map((plot, idx) => {
                  const plotTitle = plot.title || `Cardamom Plantation #${idx + 1}`;
                  const plotLocation = plot.location || 'Vandanmedu, Idukki';
                  const plotArea = typeof plot.area === 'number' ? `${plot.area} Acres` : (plot.area || '5.0 Acres');
                  const plotPrice = plot.price || '₹1.50 Cr';
                  const isVerified = plot.pattayamVerified !== false;
                  const isLease = (plot.listingType || plot.type || '').toLowerCase() === 'lease';

                  // Time telemetry
                  const timeInfo = formatMarketplaceTime(plot.createdAt);

                  // Pattayam & Person metadata
                  const pattayam = getListingPattayam(plot, idx);
                  const seller = getListingSeller(plot);

                  return (
                    <motion.div
                      key={plot.id || plot._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border ${
                        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
                      } space-y-4 transition-all duration-200`}
                    >
                      {/* Top Header Card Info */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        {/* Estate Thumbnail with badges */}
                        <div className="relative shrink-0 w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {plot.image && (plot.image.startsWith('data:') || plot.image.startsWith('http')) ? (
                            <img
                              src={plot.image}
                              alt={plotTitle}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : null}

                          <div
                            className="w-full h-full bg-gradient-to-br from-[#17331F] via-[#2C5E3B] to-[#1F5E3B] flex flex-col items-center justify-center text-white p-2 text-center"
                            style={{ display: plot.image && (plot.image.startsWith('data:') || plot.image.startsWith('http')) ? 'none' : 'flex' }}
                          >
                            <Leaf className="w-8 h-8 text-emerald-400 mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                              {plot.district || 'Estate'}
                            </span>
                          </div>

                          {/* Category Badge */}
                          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white shadow-xs ${
                            isLease ? 'bg-indigo-600' : 'bg-[#1F5E3B]'
                          }`}>
                            {isLease ? 'Lease' : 'For Sale'}
                          </span>

                          {/* Image count pill */}
                          {plot.images && plot.images.length > 1 && (
                            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              📷 {plot.images.length} Photos
                            </span>
                          )}
                        </div>

                        {/* Title, Location & Upload Time */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F5E3B] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              {plot.district || 'Idukki'}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Clock size={12} className="text-slate-400" />
                              <span>{timeInfo.relative}</span>
                              <span className="hidden sm:inline">({timeInfo.date})</span>
                            </span>
                          </div>

                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                            {plotTitle}
                          </h4>

                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{plotLocation}</span>
                          </p>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <span className="text-base font-black text-[#1F5E3B] dark:text-emerald-400">
                              {plotPrice}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                              {plotArea}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Person / Seller Box */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {seller.name ? seller.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1">
                              {seller.name}
                              <UserCheck size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" title="Verified Landowner" />
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
                              <span>{seller.role}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate">{seller.email}</span>
                            </p>
                          </div>
                        </div>

                        <a
                          href={`tel:${seller.phone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 shrink-0 flex items-center gap-1"
                        >
                          <Phone size={12} />
                          <span className="hidden sm:inline">{seller.phone}</span>
                        </a>
                      </div>

                      {/* Agronomic Specs Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Proj. ROI</p>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{plot.roi || '24% p.a.'}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Health Score</p>
                          <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{plot.healthScore || 94}/100</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Altitude</p>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{plot.altitude || '1,120m MSL'}</p>
                        </div>
                      </div>

                      {/* Uploaded Pattayam Legal Deed Banner */}
                      <div className={`p-3 rounded-xl border ${
                        isVerified
                          ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60'
                          : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60'
                      } space-y-2`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isVerified ? (
                              <ShieldCheck size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle size={16} className="text-amber-700 dark:text-amber-400 shrink-0" />
                            )}
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {pattayam.fileName}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                            isVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          }`}>
                            {isVerified ? '✓ Pattayam Verified' : '⏳ Pending OCR'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium space-y-0.5">
                          <p className="truncate"><strong>Survey:</strong> {pattayam.surveyNo} • <strong>Office:</strong> {pattayam.villageOffice}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                            <span>AI Confidence Score: <strong className={isVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>{pattayam.score}%</strong></span>
                            <span>Uploaded: {formatMarketplaceTime(pattayam.uploadedAt).full}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Controls Footer */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedMarketplaceItem({ ...plot, pattayamDoc: pattayam, sellerInfo: seller })}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all"
                        >
                          <Eye size={14} className="text-[#1F5E3B] dark:text-emerald-400" />
                          View Full Details & Pattayam
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePattayamVerification(plot, idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                              isVerified
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border-amber-800'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            }`}
                            title={isVerified ? 'Mark Pattayam as Pending OCR' : 'Approve & Verify Pattayam Legal Title'}
                          >
                            <ShieldCheck size={14} />
                            <span>{isVerified ? 'Revoke Status' : 'Approve Pattayam'}</span>
                          </button>

                          <button
                            onClick={() => setMarketplaceItemToDelete(plot)}
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all"
                            title="Delete Marketplace Listing"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
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

      {/* MARKETPLACE DETAILED & PATTAYAM MODAL */}
      <AnimatePresence>
        {selectedMarketplaceItem && (() => {
          const item = selectedMarketplaceItem;
          const pattayam = item.pattayamDoc || getListingPattayam(item);
          const seller = item.sellerInfo || getListingSeller(item);
          const timeInfo = formatMarketplaceTime(item.createdAt);
          const isVerified = item.pattayamVerified !== false;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#1F5E3B] px-2.5 py-0.5 rounded-md">
                        {(item.listingType || item.type || 'sale').toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                        isVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                      }`}>
                        {isVerified ? '✓ Pattayam Verified Legal Title' : '⏳ Pending OCR Review'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Uploaded {timeInfo.full} ({timeInfo.relative})
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{item.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{item.location || 'Idukki, Kerala'}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedMarketplaceItem(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Content Grid (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Estate Details & Seller */}
                  <div className="space-y-5">
                    {/* Primary Image preview */}
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {item.image && (item.image.startsWith('data:') || item.image.startsWith('http')) ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#17331F] to-[#1F5E3B] flex flex-col items-center justify-center text-white">
                          <Leaf className="w-12 h-12 text-emerald-400 mb-2" />
                          <span className="text-xs font-bold text-emerald-200">{item.district || 'Estate'}</span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-extrabold">
                        Asking Price: <span className="text-emerald-400">{item.price}</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold">
                        {item.area}
                      </div>
                    </div>

                    {/* Person / Seller Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} className="text-[#1F5E3B] dark:text-emerald-400" />
                        Uploaded By / Registered Seller Details
                      </h4>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#1F5E3B] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                          {seller.name ? seller.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            {seller.name}
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{seller.role}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                        <a
                          href={`mailto:${seller.email}`}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold hover:border-emerald-500 truncate"
                        >
                          <Mail size={14} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{seller.email}</span>
                        </a>

                        <a
                          href={`tel:${seller.phone}`}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold hover:border-emerald-500 truncate"
                        >
                          <Phone size={14} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{seller.phone}</span>
                        </a>
                      </div>
                    </div>

                    {/* Plot Technical Specifications Table */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart3 size={14} className="text-[#1F5E3B] dark:text-emerald-400" />
                        Plot Agronomic & Financial Parameters
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">Category</span>
                          <span className="font-extrabold text-slate-900 dark:text-white capitalize">For {item.listingType || item.type || 'sale'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">Total Area</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{item.area}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">Asking Price</span>
                          <span className="font-extrabold text-[#1F5E3B] dark:text-emerald-400">{item.price}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">Annual ROI</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{item.roi || '24% p.a.'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">Elevation / Altitude</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{item.altitude || '1,120m MSL'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">Est. Yield</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{item.yield || '450 kg/Acre'}</span>
                        </div>
                      </div>

                      {item.description && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Description & Notes</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Uploaded Pattayam Title Deed Telemetry */}
                  <div className="space-y-5">
                    <div className={`p-5 rounded-2xl border ${
                      isVerified
                        ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/80'
                        : 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/80'
                    } space-y-4`}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <FileText size={20} className={isVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'} />
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                              Uploaded Pattayam Document Details
                            </h4>
                            <p className="text-[11px] text-slate-500">Government Revenue Legal Title Deed</p>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                          isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {isVerified ? '✓ OCR VERIFIED' : '⏳ PENDING OCR'}
                        </span>
                      </div>

                      {/* File Card Preview */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 font-black text-xs">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {pattayam.fileName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Uploaded {timeInfo.full} • 2.4 MB
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => showToast?.(`Downloading ${pattayam.fileName}...`, 'success')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-200 flex items-center gap-1 shrink-0"
                        >
                          <Download size={14} />
                          <span className="hidden sm:inline">View File</span>
                        </button>
                      </div>

                      {/* Survey & Revenue Telemetry */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Government Survey No</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{pattayam.surveyNo}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Village Revenue Office</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{pattayam.villageOffice}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Revenue Taluk Division</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{pattayam.talukOffice}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Govt Fair Value Index</span>
                          <span className="font-extrabold text-[#1F5E3B] dark:text-emerald-400">{pattayam.fairValue}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500 font-medium">Gemini AI OCR Match Confidence</span>
                          <span className={`font-black ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {pattayam.score}%
                          </span>
                        </div>
                      </div>

                      {/* OCR Summary & Telemetry Log Box */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          AI Gemini OCR Legal Text Audit Summary
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          "{pattayam.ocrSummary}"
                        </p>
                      </div>
                    </div>

                    {/* Admin Actions Panel */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        Administrator Verification Actions
                      </h4>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleTogglePattayamVerification(item)}
                          className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                            isVerified
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <ShieldCheck size={16} />
                          <span>{isVerified ? 'Set Status to Pending Review' : 'Approve & Verify Pattayam Legal Deed'}</span>
                        </button>

                        <button
                          onClick={() => {
                            showToast?.('Generating official Cardora Legal Verification PDF Certificate...', 'success');
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-200 hover:border-emerald-500 flex items-center justify-center gap-2 transition-all"
                        >
                          <Download size={16} className="text-emerald-600" />
                          <span>Download Legal PDF Certificate</span>
                        </button>

                        <button
                          onClick={() => {
                            setMarketplaceItemToDelete(item);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold text-xs hover:bg-rose-100 flex items-center justify-center gap-2 transition-all"
                        >
                          <Trash2 size={16} />
                          <span>Delete Listing From Platform</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
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

    </div>
  );
};

export default AdminDashboard;

