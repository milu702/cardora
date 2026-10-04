import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Home, Leaf, MapPin, Users, User, Settings,
  Search, Heart, MessageSquare, Share2,
  Sparkles, CheckCircle, Plus, Trash2, Edit, X, AlertCircle,
  Camera, Lock, Key, Bell, Upload, CornerDownRight, Shield, CloudSun,
  Droplets, TrendingUp, BarChart3, Calendar, ChevronRight, ChevronLeft,
  Clock, Sliders, UserCheck, ShieldCheck, FileText, Send, Filter, Tag, Award, Activity, RefreshCw, Gavel, Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVoiceNavigation } from '../context/VoiceNavigationContext';
import { apiService } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AdminDashboard from '../components/admin/AdminDashboard';
import WeatherModule from '../components/weather/WeatherModule';
import PublicProfileModal from '../components/profile/PublicProfileModal';
import ChatDrawerModal from '../components/chat/ChatDrawerModal';
import WorkforceModule from '../components/workforce/WorkforceModule';
import SupervisorDashboard from '../components/workforce/SupervisorDashboard';
import PlantationModule from '../components/plantation/PlantationModule';
import AddPlantationModal from '../components/plantation/AddPlantationModal';
import CardoraFertilizerAdvisor from '../components/ai/CardoraFertilizerAdvisor';
import AiAnalysisModule from '../components/ai/AiAnalysisModule';
import CardamomMarketplace from '../components/marketplace/CardamomMarketplace';
import MessagingModule from '../components/messaging/MessagingModule';
import NotificationModule from '../components/notifications/NotificationModule';
import LivePlantationIntelligenceModule from '../components/intelligence/LivePlantationIntelligenceModule';
import YieldPredictionModule from '../components/intelligence/YieldPredictionModule';
import ExpertDashboard from '../components/expert/ExpertDashboard';
import AuctionModule from '../components/auction/AuctionModule';
import ExpertConsultationPortal from '../components/community/ExpertConsultationPortal';
import { getTimeBasedGreeting } from '../utils/timeGreeting';
import { KERALA_DISTRICTS } from '../utils/districts';
import FullScreenFormModal from '../components/ui/FullScreenFormModal';
import PlantationVisitsManager from '../components/plantation/PlantationVisitsManager';


const Dashboard = () => {
  const { user, updateProfile, showToast, darkMode, setDarkMode, lang, toggleLang, addNotification, easyMode } = useAuth();
  const { isListening, startListening, statusMessage } = useVoiceNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdminAccount = (user?.role || '').toLowerCase().includes('admin') || (user?.email || '').toLowerCase().includes('admin');
  const isSupervisorUser = (user?.role || '').toLowerCase() === 'supervisor';
  const defaultTab = isAdminAccount ? 'admin' : isSupervisorUser ? 'supervisor' : 'dashboard';

  const rawTab = searchParams.get('tab') || defaultTab;
  const activeTab = rawTab === 'profile' ? 'dashboard' : ((isSupervisorUser && rawTab !== 'messages') ? 'supervisor' : rawTab);
  const isAdminUser = isAdminAccount || activeTab === 'admin';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('cardora_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cardora_sidebar_collapsed', String(next));
      return next;
    });
  };

  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [selectedPublicUser, setSelectedPublicUser] = useState(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState(null);

  // Profile Edit Form State & Errors
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.name || '',
    username: user?.username || '',
    phone: user?.phone || '',
    district: user?.district || user?.location || 'Idukki, Kerala',
    location: user?.location || 'Kattappana',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
    role: user?.role || 'Farmer',
    experience: user?.experience || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
    certifications: Array.isArray(user?.certifications) ? user.certifications.join(', ') : (user?.certifications || ''),
    education: user?.education || '',
    organization: user?.organization || '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Change Password State & Errors
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Photo Upload State
  const [photoUrlInput, setPhotoUrlInput] = useState(user?.avatar || '');

  const currentPhotoUrl = user?.avatar || user?.profileImage || user?.profilePhoto || '';

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        district: user.district || user.location || 'Idukki, Kerala',
        location: user.location || user.district || 'Idukki, Kerala',
        bio: user.bio || '',
        avatar: currentPhotoUrl,
        coverImage: user.coverImage || '',
        role: user.role || 'Farmer',
        experience: user.experience || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        certifications: Array.isArray(user.certifications) ? user.certifications.join(', ') : (user.certifications || ''),
        education: user.education || '',
        organization: user.organization || '',
      });
      setPhotoUrlInput(currentPhotoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id || user?._id, currentPhotoUrl]);

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) {
      showToast('Please select a photo file or enter an image URL.');
      return;
    }
    const newPhoto = photoUrlInput.trim();
    setProfileForm((prev) => ({ ...prev, avatar: newPhoto, profileImage: newPhoto, profilePhoto: newPhoto }));
    await updateProfile({ avatar: newPhoto, profileImage: newPhoto, profilePhoto: newPhoto, hasCustomPhoto: true });
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoData = reader.result;
        setPhotoUrlInput(photoData);
        setProfileForm((prev) => ({ ...prev, avatar: photoData }));
        await updateProfile({ avatar: photoData, profileImage: photoData, profilePhoto: photoData, hasCustomPhoto: true });
        showToast('Profile photo updated & saved to MongoDB Atlas!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Post image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result);
        showToast('Image attached to post!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    const errs = {};
    if (!profileForm.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const currentPhoto = photoUrlInput || profileForm.avatar || user?.avatar || user?.profileImage || user?.profilePhoto || '';
    const payload = {
      fullName: profileForm.fullName.trim(),
      name: profileForm.fullName.trim(),
      username: profileForm.username.trim(),
      district: (profileForm.district || profileForm.location || 'Idukki, Kerala').trim(),
      location: (profileForm.district || profileForm.location || 'Idukki, Kerala').trim(),
      phone: (profileForm.phone || '').trim(),
      bio: (profileForm.bio || '').trim(),
      role: profileForm.role || 'Farmer',
      coverImage: profileForm.coverImage || '',
      experience: profileForm.experience || '',
      skills: profileForm.skills || '',
      certifications: profileForm.certifications || '',
      education: profileForm.education || '',
      organization: profileForm.organization || '',
    };

    if (currentPhoto) {
      payload.avatar = currentPhoto;
      payload.profileImage = currentPhoto;
      payload.profilePhoto = currentPhoto;
      payload.hasCustomPhoto = true;
    }

    await updateProfile(payload);
    setProfileEditOpen(false);
    showToast('Profile updated & saved to MongoDB Atlas!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordForm.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters.';
    }
    if (passwordForm.confirmNewPassword !== passwordForm.newPassword) {
      errs.confirmNewPassword = 'Passwords do not match.';
    }
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    showToast('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  // ===== 1. PLANTATIONS STATE & VALIDATION =====
  const [plantations, setPlantations] = useState([]);

  const fetchPlantations = async () => {
    try {
      const res = await apiService.getPlantations();
      const apiItems = (res && res.success && Array.isArray(res.plantations)) ? res.plantations : [];

      const formatted = apiItems.map((p) => ({
        id: p._id || p.id,
        _id: p._id || p.id,
        name: p.name,
        location: p.district || p.location || 'Idukki, Kerala',
        area: p.area,
        plants: p.plantsCount || p.plants || 1500,
        variety: p.variety || 'Njallani',
        moisture: p.soil?.moisture ?? p.moisture ?? 72,
        ph: p.soil?.ph ?? p.soilPh ?? 6.2,
        health: p.healthScore || p.health || 94,
        history: (p.history && Array.isArray(p.history) && p.history[0]?.title) || 'Plantation registered',
      }));
      setPlantations(formatted);
    } catch (e) {
      setPlantations([]);
    }
  };

  useEffect(() => {
    fetchPlantations();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab, searchParams]);



  // Dynamic Telemetry Metrics
  const avgMoisture = plantations.length > 0
    ? Math.round(plantations.reduce((acc, p) => acc + (p.moisture || 70), 0) / plantations.length)
    : 0;

  const avgHealth = plantations.length > 0
    ? Math.round(plantations.reduce((acc, p) => acc + (p.health || 90), 0) / plantations.length)
    : 0;

  const predictedYield = plantations.length > 0
    ? Math.round(plantations.reduce((acc, p) => acc + (p.area ? Math.round(p.plants / p.area) : 400), 0) / plantations.length)
    : 0;

  const [newPlantationModalOpen, setNewPlantationModalOpen] = useState(false);

  // Dashboard Messaging Center State
  const [dashboardConversations, setDashboardConversations] = useState([]);

  const fetchDashboardConversations = async () => {
    try {
      const res = await apiService.getConversations();
      if (res && res.success && Array.isArray(res.conversations)) {
        setDashboardConversations(res.conversations);
      }
    } catch (err) { }
  };

  const currentUserIdVal = user?._id || user?.id || '';

  useEffect(() => {
    if (currentUserIdVal) {
      fetchDashboardConversations();
      const interval = setInterval(fetchDashboardConversations, 15000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserIdVal]);



  // Legacy delete helper
  // const handleDeletePlantation = async (id) => { ... }


  // ===== 2. COMMUNITY FEED STATE & VALIDATION =====
  const [localCommunityPosts, setLocalCommunityPosts] = useState(() => {
    const saved = localStorage.getItem('cardora_community_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => {
            const idStr = (p._id || p.id || '').toString();
            return idStr && !idStr.startsWith('community-10') && !idStr.startsWith('dummy') && !idStr.startsWith('post_');
          });
        }
      } catch (e) { }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cardora_community_posts', JSON.stringify(localCommunityPosts));
  }, [localCommunityPosts]);

  const [feedPosts, setFeedPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Plantation Update');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [postError, setPostError] = useState('');

  // Default community posts from other cardamom planters in the ecosystem
  const defaultOtherPlanterPosts = [
    {
      id: 'community-101',
      author: 'Rajesh Nair',
      username: 'rajesh_nair',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      time: '2 hours ago',
      category: 'Farming Tip',
      content: 'Organic neem cake application at 500g per clump significantly reduced root rot risk in Kattappana block this monsoon. Highly recommended for high-altitude cardamom estates!',
      description: 'Organic neem cake application at 500g per clump significantly reduced root rot risk in Kattappana block this monsoon. Highly recommended for high-altitude cardamom estates!',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=600',
      likes: 24,
      comments: 6,
      liked: false,
    },
    {
      id: 'community-102',
      author: 'Ananya Ramesh',
      username: 'ananya_planter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      time: '5 hours ago',
      category: 'Plantation Update',
      content: 'Harvested our second yield of Vazhukka variety pods today in Munnar plot. Average capsule weight is 1.8g with high essential oil aroma!',
      description: 'Harvested our second yield of Vazhukka variety pods today in Munnar plot. Average capsule weight is 1.8g with high essential oil aroma!',
      image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80&w=600',
      likes: 18,
      comments: 3,
      liked: false,
    },
    {
      id: 'community-103',
      author: 'Dr. Suresh Kumar (Expert)',
      username: 'suresh_agro',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      time: '1 day ago',
      category: 'Expert Advice',
      content: 'Keep drip pulse irrigation capped at 48-hour cycles when soil moisture reaches 75% to prevent soil compaction and fungal spores in root zones.',
      description: 'Keep drip pulse irrigation capped at 48-hour cycles when soil moisture reaches 75% to prevent soil compaction and fungal spores in root zones.',
      image: '',
      likes: 42,
      comments: 9,
      liked: false,
    },
    {
      id: 'community-104',
      author: 'Mathew George',
      username: 'mathew_cardamom',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      time: '2 days ago',
      category: 'Plantation Update',
      content: 'Pruned overhead shade trees (Silver Oak & Cedar) to maintain optimal 50% sun filtered canopy over 12 acres in Vandanmedu estate. Tillers looking healthy!',
      description: 'Pruned overhead shade trees (Silver Oak & Cedar) to maintain optimal 50% sun filtered canopy over 12 acres in Vandanmedu estate. Tillers looking healthy!',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=600',
      likes: 31,
      comments: 5,
      liked: false,
    },
    {
      id: 'community-105',
      author: 'Vijayan N.',
      username: 'vijayan_planter',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
      time: '3 days ago',
      category: 'Farming Tip',
      content: 'Njallani 777 high-yielding clone tillers transplanted 3 weeks ago are showing excellent root establishment in Kumily soil. Drip fertigation helped immensely.',
      description: 'Njallani 777 high-yielding clone tillers transplanted 3 weeks ago are showing excellent root establishment in Kumily soil. Drip fertigation helped immensely.',
      image: '',
      likes: 27,
      comments: 4,
      liked: false,
    },
    {
      id: 'community-106',
      author: 'Anitha Selvam',
      username: 'anitha_spices',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      time: '4 days ago',
      category: 'Expert Advice',
      content: 'Cardamom dryer temperature should be maintained strictly between 45°C - 50°C during hot air curing to preserve the deep emerald green capsule color!',
      description: 'Cardamom dryer temperature should be maintained strictly between 45°C - 50°C during hot air curing to preserve the deep emerald green capsule color!',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
      likes: 56,
      comments: 11,
      liked: false,
    }
  ];

  const fetchPosts = async () => {
    try {
      const res = await apiService.getCommunityPosts();
      let dbPosts = [];
      if (res && res.success && Array.isArray(res.posts)) {
        const initialComments = {};
        dbPosts = res.posts.map((p) => {
          const postComments = Array.isArray(p.comments) ? p.comments.map((c) => ({
            id: c._id || c.id || Date.now(),
            author: c.authorName || c.user?.name || 'Planter',
            avatar: c.authorAvatar || c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName || 'P')}&background=1F5E3B&color=ffffff`,
            text: c.text || c.content || '',
            time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently',
            replies: Array.isArray(c.replies) ? c.replies.map((r) => ({
              id: r._id || r.id || Date.now(),
              author: r.authorName || 'Planter',
              avatar: r.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.authorName || 'P')}&background=1F5E3B&color=ffffff`,
              text: r.text || '',
              isPostOwner: Boolean(r.isPostOwner || r.authorName === p.authorName),
              time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently',
            })) : [],
          })) : [];

          const pId = (p._id || p.id).toString();
          if (postComments.length > 0) {
            initialComments[pId] = postComments;
          }

          const currentUserId = user?.id || user?._id;
          const isLiked = Array.isArray(p.likes) && currentUserId ? p.likes.some((l) => (l._id || l || '').toString() === currentUserId.toString()) : false;

          const authorUser = typeof p.user === 'object' && p.user ? p.user : null;
          const authorName = authorUser?.name || p.authorName || p.username || 'Planter';
          const authorUsername = authorUser?.username || p.username || p.authorName || 'planter';
          const authorAvatar = authorUser?.avatar || authorUser?.profileImage || authorUser?.profilePhoto || p.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1F5E3B&color=ffffff`;

          return {
            id: pId,
            _id: pId,
            author: authorName,
            username: authorUsername,
            avatar: authorAvatar,
            time: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
            category: p.category || 'Plantation Update',
            content: p.description || p.content || '',
            description: p.description || p.content || '',
            image: p.image || (p.images && p.images.length > 0 ? p.images[0] : ''),
            likes: Array.isArray(p.likes) ? p.likes.length : 0,
            comments: postComments.length,
            liked: isLiked,
          };
        });

        setCommentsMap((prev) => ({ ...initialComments, ...prev }));
      }

      // Filter out local posts that match DB posts by ID or by Content + Author
      const dbIdsSet = new Set(dbPosts.map((p) => p.id.toString()));
      const dbContentsSet = new Set(
        dbPosts.map((p) => `${(p.author || '').toLowerCase()}_${(p.content || p.description || '').trim().toLowerCase()}`)
      );

      const localOnlyPosts = localCommunityPosts.filter((p) => {
        const idStr = (p._id || p.id || '').toString();
        const contentKey = `${(p.author || '').toLowerCase()}_${(p.content || p.description || '').trim().toLowerCase()}`;
        const isDummyId = idStr.startsWith('community-10') || idStr.startsWith('dummy');
        return idStr && !isDummyId && !dbIdsSet.has(idStr) && !dbContentsSet.has(contentKey);
      });

      // Show real user and database posts together with community ecosystem posts so posts are never missing
      const realPosts = [...dbPosts, ...localOnlyPosts];
      const allCandidatePosts = [...realPosts, ...defaultOtherPlanterPosts];

      const uniquePostsMap = new Map();
      allCandidatePosts.forEach((p) => {
        const pId = (p._id || p.id || '').toString();
        const pContent = (p.content || p.description || '').trim().toLowerCase();
        const pAuthor = (p.author || p.username || '').trim().toLowerCase();
        const key = pId.startsWith('post_') ? `content_${pAuthor}_${pContent}` : pId;
        if (key && !uniquePostsMap.has(key)) {
          uniquePostsMap.set(key, p);
        }
      });

      setFeedPosts(Array.from(uniquePostsMap.values()));
    } catch (err) {
      const realPosts = localCommunityPosts.filter((p) => {
        const idStr = (p._id || p.id || '').toString();
        return idStr && !idStr.startsWith('community-10') && !idStr.startsWith('dummy');
      });
      const allCandidatePosts = realPosts.length > 0 ? realPosts : defaultOtherPlanterPosts;
      const uniquePostsMap = new Map();
      allCandidatePosts.forEach((p) => {
        const pId = (p._id || p.id || '').toString();
        const pContent = (p.content || p.description || '').trim().toLowerCase();
        const pAuthor = (p.author || p.username || '').trim().toLowerCase();
        const key = pId.startsWith('post_') ? `content_${pAuthor}_${pContent}` : pId;
        if (key && !uniquePostsMap.has(key)) {
          uniquePostsMap.set(key, p);
        }
      });
      setFeedPosts(Array.from(uniquePostsMap.values()));
    }
  };

  const [communitySearchQuery, setCommunitySearchQuery] = useState(searchParams.get('search') || '');
  const [searchedPlanters, setSearchedPlanters] = useState([]);

  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setCommunitySearchQuery(searchVal);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleSearchPlanters = async () => {
      if (!communitySearchQuery.trim()) {
        setSearchedPlanters([]);
        return;
      }
      try {
        const res = await apiService.searchPlantersAndPosts(communitySearchQuery.trim());
        if (res && res.success && Array.isArray(res.users)) {
          setSearchedPlanters(res.users);
        }
      } catch (err) { }
    };
    handleSearchPlanters();
  }, [communitySearchQuery]);

  React.useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCommunityPosts.length, activeTab]);


  const handleAddPost = async (e) => {
    if (e) e.preventDefault();
    if (!newPostText.trim() || newPostText.trim().length < 3) {
      setPostError('Post description must contain at least 3 characters.');
      return;
    }
    setPostError('');

    const postPayload = {
      description: newPostText.trim(),
      content: newPostText.trim(),
      category: newPostCategory,
      image: newPostImage.trim(),
      images: newPostImage.trim() ? [newPostImage.trim()] : [],
      authorName: user?.fullName || user?.name || user?.username || 'Planter',
      username: user?.username || 'planter',
      authorAvatar: user?.avatar || user?.profileImage || user?.profilePhoto || '',
      userId: user?._id || user?.id,
    };

    const tempId = `post_${Date.now()}`;
    const newPostObj = {
      id: tempId,
      _id: tempId,
      author: postPayload.authorName,
      username: postPayload.username,
      avatar: postPayload.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(postPayload.authorName)}&background=1F5E3B&color=ffffff`,
      time: 'Just now',
      category: newPostCategory,
      content: postPayload.content,
      description: postPayload.content,
      image: postPayload.image,
      likes: 0,
      comments: 0,
      liked: false,
    };

    // Optimistically prepend post to state, clearing out any duplicate text matching
    setFeedPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== tempId && (p.content || p.description || '').trim() !== postPayload.content);
      return [newPostObj, ...filtered];
    });
    setLocalCommunityPosts((prev) => [newPostObj, ...prev.filter((p) => (p.content || p.description || '').trim() !== postPayload.content)]);
    setNewPostText('');
    setNewPostImage('');

    showToast('🎉 Post created & published live to Community Feed!');

    try {
      const res = await apiService.createCommunityPost(postPayload);
      if (res && res.success && res.post) {
        const savedPost = res.post;
        const realId = (savedPost._id || savedPost.id).toString();
        const formattedSavedPost = {
          id: realId,
          _id: realId,
          author: savedPost.authorName || postPayload.authorName,
          username: savedPost.username || postPayload.username,
          avatar: savedPost.authorAvatar || postPayload.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(postPayload.authorName)}&background=1F5E3B&color=ffffff`,
          time: 'Just now',
          category: savedPost.category || newPostCategory,
          content: savedPost.content || postPayload.content,
          description: savedPost.description || postPayload.content,
          image: savedPost.image || postPayload.image,
          likes: 0,
          comments: 0,
          liked: false,
        };

        setFeedPosts((prev) => prev.map((p) => (p.id === tempId ? formattedSavedPost : p)));
        setLocalCommunityPosts((prev) => [formattedSavedPost, ...prev.filter((p) => (p.id || p._id) !== tempId)]);
      }
    } catch (err) {
      console.error('Error creating community post:', err);
    } finally {
      fetchPosts();
    }
  };

  // Interactive Comments State
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [commentsMap, setCommentsMap] = useState({});

  const handleLikePost = async (id) => {
    try {
      await apiService.likePost(id);
    } catch (e) { }
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiking = !p.liked;
          const likerName = user?.fullName || user?.name || user?.username || 'A planter';
          const postOwner = p.author || p.username || 'Planter';

          const isSelfAction = likerName.toLowerCase().trim() === postOwner.toLowerCase().trim();

          if (isLiking && !isSelfAction && addNotification) {
            const snippet = p.description ? p.description.slice(0, 30) : 'Community update';
            addNotification({
              type: 'like',
              title: '❤️ Post Liked!',
              senderName: likerName,
              targetOwner: postOwner,
              body: `${likerName} liked your post: "${snippet}..."`,
            });
          }
          return { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: isLiking };
        }
        return p;
      })
    );
  };

  const handleDeletePost = async (postId) => {
    try {
      const res = await apiService.deletePost(postId);
      if (res && res.success) {
        showToast('Post deleted from MongoDB Atlas');
      } else {
        showToast(res?.message || 'Post deleted');
      }
    } catch (e) {
      showToast('Post removed');
    }
    setFeedPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
  };

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');

  const handleSendReply = async (postId, commentId) => {
    if (!replyInputText || !replyInputText.trim()) return;
    const text = replyInputText.trim();
    const commenterName = user?.fullName || user?.name || user?.username || 'Planter';
    const targetPost = feedPosts.find((p) => p.id === postId);
    const postOwnerName = targetPost?.author || targetPost?.username || '';
    const isOwner = commenterName.toLowerCase().trim() === postOwnerName.toLowerCase().trim();

    const newReply = {
      id: Date.now(),
      author: commenterName,
      avatar: user?.avatar || user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      text,
      isPostOwner: isOwner,
      time: 'Just now',
    };

    setCommentsMap((prev) => {
      const existingComments = prev[postId] || [];
      const updatedComments = existingComments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      });
      return { ...prev, [postId]: updatedComments };
    });

    try {
      await apiService.replyToComment(postId, commentId, text);
      showToast('Reply posted successfully!');
    } catch (e) {
      showToast('Reply posted!');
    }

    setReplyInputText('');
    setActiveReplyCommentId(null);
  };

  const handleAddComment = async (postId) => {
    if (!commentInputText.trim()) return;
    const text = commentInputText.trim();
    const targetPost = feedPosts.find((p) => p.id === postId);

    const commenterName = user?.fullName || user?.name || user?.username || 'Planter';
    const postOwner = targetPost?.author || targetPost?.username || 'Planter';

    const newComment = {
      id: Date.now(),
      author: commenterName,
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      text,
      time: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    setFeedPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p))
    );

    try {
      await apiService.commentOnPost(postId, text);
    } catch (e) { }

    const isSelfAction = commenterName.toLowerCase().trim() === postOwner.toLowerCase().trim();

    if (!isSelfAction && addNotification) {
      addNotification({
        type: 'comment',
        title: '💬 New Comment!',
        senderName: commenterName,
        targetOwner: postOwner,
        body: `${commenterName} commented on your post: "${text.slice(0, 30)}"`,
      });
    }

    setCommentInputText('');
    showToast('Comment saved to MongoDB Atlas!');
  };

  const handleSaveEditComment = async (postId, commentId) => {
    if (!editingCommentText.trim()) return;
    const newText = editingCommentText.trim();

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((c) => (c.id === commentId ? { ...c, text: newText } : c)),
    }));

    try {
      await apiService.updateComment(postId, commentId, newText);
    } catch (e) { }

    setEditingCommentId(null);
    setEditingCommentText('');
    showToast('Comment updated in MongoDB Atlas!');
  };




  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isExpertUser = (user?.role || '').toLowerCase() === 'expert' || user?.isExpert;

  const sidebarLinks = isAdminUser
    ? [
      { id: 'admin', label: lang === 'ml' ? 'അഡ്മിൻ പോർട്ടൽ' : 'Admin Portal', icon: Shield },
      { id: 'expert-dashboard', label: lang === 'ml' ? 'അഗ്രോണമിസ്റ്റ് പോർട്ടൽ' : 'Agronomist Portal 🎓', icon: Award },
      { id: 'dashboard', label: lang === 'ml' ? 'ഹോം' : 'Dashboard Overview', icon: Home },
      { id: 'yield-prediction', label: lang === 'ml' ? 'വിളവ് പ്രവചനം' : 'Yield Prediction 🌾', icon: TrendingUp },
      { id: 'auctions', label: lang === 'ml' ? 'ലൈവ് ലേലം' : 'Live Auctions 🔨', icon: Gavel },
      { id: 'intelligence', label: lang === 'ml' ? 'ലൈവ് ഇൻ്റലിജൻസ്' : 'Live Intelligence 🌿', icon: Sparkles },
      { id: 'expert', label: lang === 'ml' ? 'വിദഗ്ദ്ധ ഉപദേശം' : 'Expert Desk 👨‍🌾', icon: UserCheck },
      { id: 'plantations', label: lang === 'ml' ? 'എന്റെ തോട്ടം' : 'My Plantation', icon: Leaf },
      { id: 'workforce', label: lang === 'ml' ? 'തൊഴിലാളികൾ' : 'Workforce & Workers', icon: Users },
      { id: 'weather', label: lang === 'ml' ? 'കാലാവസ്ഥ' : 'Weather Intelligence', icon: CloudSun },
      { id: 'ai', label: lang === 'ml' ? 'AI നിർദ്ദേശങ്ങൾ' : 'AI Recommendations', icon: Sparkles },
      { id: 'messages', label: lang === 'ml' ? 'സന്ദേശങ്ങൾ' : 'Messages', icon: MessageSquare, isAction: true },
      { id: 'plots', label: lang === 'ml' ? 'മാർക്കറ്റ് പ്ലേസ്' : 'Marketplace', icon: MapPin },
      { id: 'community', label: lang === 'ml' ? 'കമ്മ്യൂണിറ്റി' : 'Community', icon: Share2 },
      { id: 'dashboard', label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile', icon: User },
      { id: 'settings', label: lang === 'ml' ? 'ക്രമീകരണങ്ങൾ' : 'Settings', icon: Settings },
    ]
    : isSupervisorUser
      ? [
        { id: 'supervisor', label: lang === 'ml' ? 'സൂപ്പർവൈസർ പോർട്ടൽ' : 'Supervisor Portal', icon: ShieldCheck },
        { id: 'messages', label: lang === 'ml' ? 'സന്ദേശങ്ങൾ' : 'Messages', icon: MessageSquare, isAction: true },
        { id: 'dashboard', label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile', icon: User },
      ]
      : isExpertUser
        ? [
          { id: 'expert-dashboard', label: lang === 'ml' ? 'അഗ്രോണമിസ്റ്റ് പോർട്ടൽ' : 'Agronomist Portal 🎓', icon: Award },
          { id: 'expert', label: lang === 'ml' ? 'വിദഗ്ദ്ധ ഉപദേശം' : 'Expert Desk 👨‍🌾', icon: UserCheck },
          { id: 'messages', label: lang === 'ml' ? 'സന്ദേശങ്ങൾ' : 'Messages', icon: MessageSquare, isAction: true },
          { id: 'dashboard', label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile', icon: User },
        ]
        : [
          { id: 'dashboard', label: lang === 'ml' ? 'ഹോം' : 'Dashboard', icon: Home },
          { id: 'yield-prediction', label: lang === 'ml' ? 'വിളവ് പ്രവചനം' : 'Yield Prediction 🌾', icon: TrendingUp },
          { id: 'auctions', label: lang === 'ml' ? 'ലൈവ് ലേലം' : 'Live Auctions 🔨', icon: Gavel },
          { id: 'intelligence', label: lang === 'ml' ? 'ലൈവ് ഇൻ്റലിജൻസ്' : 'Live Intelligence 🌿', icon: Sparkles },
          { id: 'expert', label: lang === 'ml' ? 'വിദഗ്ദ്ധ ഉപദേശം' : 'Expert Desk 👨‍🌾', icon: UserCheck },
          { id: 'plantations', label: lang === 'ml' ? 'എന്റെ തോട്ടം' : 'My Plantation', icon: Leaf },
          { id: 'workforce', label: lang === 'ml' ? 'തൊഴിലാളികൾ' : 'Workforce & Workers', icon: Users },
          { id: 'weather', label: lang === 'ml' ? 'കാലാവസ്ഥ' : 'Weather Intelligence', icon: CloudSun },
          { id: 'ai', label: lang === 'ml' ? 'AI നിർദ്ദേശങ്ങൾ' : 'AI Recommendations', icon: Sparkles },
          { id: 'messages', label: lang === 'ml' ? 'സന്ദേശങ്ങൾ' : 'Messages', icon: MessageSquare, isAction: true },
          { id: 'plots', label: lang === 'ml' ? 'മാർക്കറ്റ് പ്ലേസ്' : 'Marketplace', icon: MapPin },
          { id: 'community', label: lang === 'ml' ? 'കമ്മ്യൂണിറ്റി' : 'Community', icon: Share2 },
          { id: 'dashboard', label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile', icon: User },
          { id: 'settings', label: lang === 'ml' ? 'ക്രമീകരണങ്ങൾ' : 'Settings', icon: Settings },
        ];

  return (
    <div className="min-h-screen text-slate-800 dark:text-emerald-100 transition-colors flex flex-col justify-between relative overflow-x-hidden">
      {/* 🌿 CARDORA KERALA CARDAMOM PLANTATION ATMOSPHERIC BACKGROUND LAYER */}
      <div className="cardora-plantation-backdrop">
        <div className="cardora-bg-mesh" />
        <div className="cardora-bg-photo" />
        <div className="cardora-bg-leaf-pattern" />
        <div className="cardora-bg-vignette" />
      </div>
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => {
          if (window.innerWidth >= 1024) {
            setSidebarCollapsed(!sidebarCollapsed);
          } else {
            setMobileSidebarOpen(!mobileSidebarOpen);
          }
        }}
        onToggleMobileSidebar={() => {
          if (window.innerWidth >= 1024) {
            setSidebarCollapsed(!sidebarCollapsed);
          } else {
            setMobileSidebarOpen(!mobileSidebarOpen);
          }
        }}
      />

      {/* FIXED DESKTOP LEFT SIDEBAR NAVIGATION */}
      <aside className={`hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-[#03180F] border-r-2 border-[#CDE3D5] dark:border-emerald-500/30 z-30 flex-col justify-between p-3 overflow-y-auto shadow-2xl transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-60'}`}>
        <div className="space-y-3">

          {/* Toggle Sidebar Collapse Button Header */}
          <div className="flex items-center justify-between pb-1 border-b border-[#CDE3D5] dark:border-[#1A402D]">
            {!sidebarCollapsed ? (
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-emerald-400 tracking-widest px-1">
                Navigation
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase text-slate-500 dark:text-emerald-400 tracking-tighter mx-auto">
                Menu
              </span>
            )}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-xl bg-[#EAF4EE] dark:bg-[#0D261B] hover:bg-[#059669] hover:text-white text-[#059669] dark:text-emerald-400 border border-[#CDE3D5] dark:border-[#1A402D] transition-all cursor-pointer shadow-xs shrink-0"
              title={sidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Admin / Planter Info Card */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 bg-[#EAF4EE] dark:bg-[#0D261B] rounded-2xl border border-[#CDE3D5] dark:border-[#1A402D] flex items-center shadow-xs cursor-pointer hover:bg-[#E2F0E7] dark:hover:bg-[#123324] transition-colors ${sidebarCollapsed ? 'justify-center' : 'gap-3 p-3'}`}
            title={sidebarCollapsed ? (isAdminUser ? 'System Administrator' : (user?.fullName || user?.username || 'Planter')) : 'Click to go to Dashboard'}
          >
            <img
              src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Admin')}&background=059669&color=ffffff`}
              alt=""
              className="w-9 h-9 rounded-full object-cover border-2 border-[#059669] shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate font-poppins">
                  {isAdminUser ? 'System Administrator' : (user?.fullName || user?.username || 'Planter')}
                </p>
                <p className="text-[10px] text-[#059669] dark:text-emerald-400 font-extrabold truncate">
                  {isAdminUser ? 'Admin • Idukki, Kerala' : `${user?.role || 'Farmer'} • ${user?.district || 'Idukki'}`}
                </p>
              </div>
            )}
          </div>

          {/* Grouped Sidebar Navigation for Admin */}
          {isAdminUser ? (
            <nav className="space-y-3">
              {[
                {
                  title: 'OVERVIEW',
                  items: [
                    { id: 'admin', view: 'all', label: 'Dashboard', icon: Home },
                  ],
                },
                {
                  title: 'MANAGEMENT',
                  items: [
                    { id: 'admin', view: 'users', label: 'Farmers', icon: UserCheck },
                    { id: 'admin', view: 'marketplace', label: 'Plantations', icon: Leaf },
                    { id: 'admin', view: 'supervisors', label: 'Supervisors', icon: ShieldCheck },
                    { id: 'admin', view: 'contractors', label: 'Workers', icon: Users },
                  ],
                },
                {
                  title: 'OPERATIONS',
                  items: [
                    { id: 'admin', view: 'feed', label: 'Attendance Audit', icon: Clock },
                    { id: 'admin', view: 'charts', label: 'Wages Telemetry', icon: FileText },
                    { id: 'messages', isAction: true, label: 'Messages', icon: MessageSquare },
                  ],
                },
                {
                  title: 'INSIGHTS',
                  items: [
                    { id: 'admin', view: 'charts', label: 'Reports & Analytics', icon: BarChart3 },
                    { id: 'weather', label: 'Weather Intelligence', icon: CloudSun },
                  ],
                },
                {
                  title: 'PLATFORM',
                  items: [
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'community', label: 'Community', icon: Share2 },
                    { id: 'plots', label: 'Marketplace', icon: MapPin },
                    { id: 'settings', label: 'Settings', icon: Settings },
                  ],
                },
              ].map((group) => (
                <div key={group.title} className="space-y-1">
                  {!sidebarCollapsed ? (
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2 mb-1">
                      {group.title}
                    </p>
                  ) : (
                    <div className="h-px bg-slate-200 dark:bg-slate-800/80 my-1.5" />
                  )}
                  {group.items.map((link) => {
                    const Icon = link.icon;
                    const currentView = searchParams.get('view') || 'all';
                    const isActive = link.view
                      ? activeTab === 'admin' && currentView === link.view
                      : activeTab === link.id;

                    return (
                      <button
                        key={`${link.id}-${link.view || link.label}`}
                        onClick={() => {
                          if (link.isAction) {
                            setChatTargetUser(null);
                            setChatModalOpen(true);
                          } else if (link.isSmsAction) {
                            showToast('Opening system notifications center...');
                          } else if (link.view) {
                            setSearchParams({ tab: link.id, view: link.view });
                          } else {
                            setSearchParams({ tab: link.id });
                          }
                        }}
                        title={link.label}
                        className={`w-full flex items-center rounded-xl transition-all ${sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-xs font-black border-l-3'} ${isActive
                          ? 'bg-[#EAF3E8] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-300 border-[#1F5E3B] font-black shadow-xs'
                          : 'text-slate-900 dark:text-emerald-100 border-transparent hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 hover:text-slate-950'
                          }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1F5E3B] dark:text-emerald-400' : 'text-[#059669] dark:text-emerald-400'}`} />
                        {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          ) : (
            /* Sidebar Navigation Items for Non-Admin Planters */
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.isAction) {
                        setChatTargetUser(null);
                        setChatModalOpen(true);
                      } else {
                        setActiveTab(link.id);
                      }
                    }}
                    title={link.label}
                    className={`w-full flex items-center rounded-xl transition-all ${sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-xs font-black'} ${isActive
                      ? 'bg-gradient-to-r from-[#059669] via-[#047857] to-[#022C1C] text-white shadow-lg shadow-emerald-950/40 border-l-4 border-amber-400 font-black'
                      : 'text-slate-900 dark:text-emerald-100 hover:bg-emerald-100/80 dark:hover:bg-[#0D261B] hover:text-emerald-950 dark:hover:text-white'
                      }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-[#059669] dark:text-emerald-400'}`} />
                    {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
                    {!sidebarCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-300" />}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className={`pt-3 border-t border-[#CDE3D5] dark:border-[#1A402D] text-[10px] text-slate-500 dark:text-emerald-400/80 font-medium ${sidebarCollapsed ? 'flex flex-col items-center' : 'space-y-1'}`}>
          {!sidebarCollapsed ? (
            <>
              <p className="flex items-center gap-1.5 font-bold text-[#059669] dark:text-emerald-400">
                <Leaf className="w-3.5 h-3.5" />
                <span>Cardora Agriculture Platform</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-400">
                <span>System status:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  Operational <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </p>
            </>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#059669] dark:text-emerald-400 flex items-center justify-center" title="Cardora Operational">
              <Leaf className="w-4 h-4" />
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE SLIDE-OUT DRAWER NAVIGATION */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] bg-white dark:bg-[#03180F] h-full p-5 shadow-2xl flex flex-col justify-between z-10 border-r-2 border-[#CDE3D5] dark:border-emerald-500/30"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#1F5E3B] text-white">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white font-poppins">CARDORA</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-[#F4F8F3] dark:bg-slate-800 rounded-xl flex items-center gap-3">
                  <img
                    src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-[#1F5E3B]"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user?.fullName || user?.username || 'Planter'}</p>
                    <p className="text-[10px] text-[#5C8D4E] font-bold truncate">{user?.district || user?.location || 'Idukki'}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = activeTab === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setMobileSidebarOpen(false);
                          if (link.isAction) {
                            setChatTargetUser(null);
                            setChatModalOpen(true);
                          } else {
                            setActiveTab(link.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-black transition-all ${isActive
                          ? 'bg-gradient-to-r from-[#059669] via-[#047857] to-[#022C1C] text-white shadow-md border-l-4 border-amber-400 font-black'
                          : 'text-slate-900 dark:text-emerald-100 hover:bg-emerald-100/80 dark:hover:bg-[#0D261B] hover:text-emerald-950 dark:hover:text-white'
                          }`}
                      >
                        <Icon className="w-4 h-4 text-[#5C8D4E]" />
                        <span>{link.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className={`relative z-10 pt-20 sm:pt-24 flex-1 ${activeTab === 'expert' ? 'px-2 sm:px-4 pb-2 sm:pb-4 space-y-0' : 'px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 space-y-6'} w-full max-w-none min-h-[calc(100vh-4rem)] overflow-x-hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-64'}`}>
        {(activeTab === 'dashboard' || activeTab === 'overview' || !activeTab) && (
          <div className="space-y-6">
            {/* COMPACT WELCOME CARD */}
            <div className="bg-[#041D12] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden group">
              {/* Photorealistic Cardamom Plantation Hills Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 group-hover:opacity-55 transition-all duration-1000 pointer-events-none"
                style={{ backgroundImage: `url('/images/weather_hero_bg.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#041D12] via-[#041D12]/80 to-transparent pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/40 shadow-xs">
                      🌱 Farmer First Portal
                    </span>
                    {easyMode && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                        🌿 Easy Mode Active
                      </span>
                    )}
                    <span className="text-xs text-emerald-200 font-bold hidden sm:inline-block">• Cardamom Management</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black font-poppins text-white flex items-center gap-2">
                    {getTimeBasedGreeting(user?.fullName || user?.name || user?.username || 'Planter', lang)} 🌱
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
                    {lang === 'ml'
                      ? 'ഇന്ന് നിങ്ങളുടെ തോട്ടത്തിൽ എന്താണ് നടക്കുന്നത്? Cardora-യോട് ചോദിക്കാം.'
                      : "What is happening in your plantation today? Ask Cardora."}
                  </p>
                </div>

                {/* Location & Date Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-black/30 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 self-start md:self-auto">
                  <div className="flex items-center gap-1.5 text-xs text-white font-bold px-2.5 py-1 rounded-xl bg-white/10">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    <span>{user?.district || user?.location || 'Idukki, Kerala'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium px-2 py-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{new Date().toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-black px-2.5 py-1 bg-amber-400/20 rounded-xl border border-amber-400/40">
                    <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                    <span>28°C • Sunny</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🎙️ PROMINENT CARDORA VOICE HERO CARD */}
            <div className="bg-[#041D12] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/40 relative overflow-hidden space-y-4 group">
              {/* Photorealistic Cardamom Flower & Pods Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-45 group-hover:scale-105 group-hover:opacity-60 transition-all duration-1000 pointer-events-none"
                style={{ backgroundImage: `url('/images/cardamom_flower_hero_bg.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#041D12] via-[#041D12]/85 to-black/20 pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Mic className="w-3.5 h-3.5" />
                      {lang === 'ml' ? 'പറഞ്ഞാൽ മതി. Cardora വഴികാട്ടും' : 'Voice-First Assistant'}
                    </span>
                    <span className="text-xs text-emerald-200 font-bold hidden sm:inline-block">• Malayalam, Manglish & English</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-poppins text-white flex items-center gap-2">
                    {lang === 'ml' ? 'SPEAK TO CARDORA 🎙️' : 'Speak to Cardora 🎙️'}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                    {lang === 'ml' ? 'എന്താണ് വേണ്ടത്? Just tell Cardora what you want.' : 'Just tell Cardora what you want, it will navigate automatically.'}
                  </p>
                </div>

                {/* Big 64px Tap Target Microphone Button */}
                <div className="flex flex-col items-center gap-2 shrink-0 self-center md:self-auto">
                  <button
                    onClick={startListening}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-black shadow-2xl transition-all cursor-pointer ${isListening
                      ? 'bg-rose-600 border-4 border-white animate-pulse scale-105 shadow-rose-900/50'
                      : 'bg-gradient-to-br from-[#F59E0B] via-[#D4AF37] to-[#FBBF24] hover:scale-105 border-4 border-amber-300/60 text-slate-950 shadow-amber-950/50'
                      }`}
                    title={lang === 'ml' ? 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക' : 'Tap to Speak'}
                  >
                    <Mic className={`w-8 h-8 sm:w-10 sm:h-10 ${isListening ? 'text-white' : 'text-slate-950'}`} />
                  </button>
                  <span className="text-xs font-extrabold text-amber-300">
                    {isListening ? (lang === 'ml' ? '🎙️ കേൾക്കുന്നു...' : 'Listening...') : (lang === 'ml' ? '[ 🎙️ സംസാരിക്കുക ]' : '[ Tap to Speak ]')}
                  </span>
                </div>
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <div className="p-3 rounded-2xl bg-black/30 border border-white/20 text-xs font-extrabold text-amber-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Voice Prompts Hints */}
              <div className="pt-3 border-t border-white/20 flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">{lang === 'ml' ? 'ഉദാഹരണം:' : 'Examples:'}</span>
                {[
                  { text: lang === 'ml' ? '"എന്റെ തോട്ടം കാണിക്കൂ"' : '"Show my plantation"', tab: 'plantations' },
                  { text: lang === 'ml' ? '"ലൈവ് ലേലം തുറക്കൂ"' : '"Open live auctions"', tab: 'auctions' },
                  { text: lang === 'ml' ? '"കാലാവസ്ഥ കാണിക്കൂ"' : '"Check weather"', tab: 'weather' },
                  { text: lang === 'ml' ? '"രോഗം പരിശോധിക്കണം"' : '"Plant health scanner"', tab: 'ai' },
                  { text: lang === 'ml' ? '"തൊഴിലാളികൾ കാണിക്കൂ"' : '"Labour workforce"', tab: 'workforce' },
                ].map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(hint.tab)}
                    className="px-3.5 py-1.5 rounded-full bg-[#02180F]/85 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-xs font-black border border-amber-400/50 shadow-md backdrop-blur-md transition-all cursor-pointer"
                  >
                    {hint.text}
                  </button>
                ))}
              </div>
            </div>

            {/* ⚡ HIGH-VISIBILITY QUICK ACTION TILES */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 font-poppins flex items-center gap-2">
                <span>{lang === 'ml' ? 'നിങ്ങൾക്ക് എന്ത് ചെയ്യണം?' : 'Quick Actions'}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => setActiveTab('plantations')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0D261B] border-2 border-[#CDE3D5] dark:border-[#1A402D] hover:border-[#059669] transition-all text-left shadow-md hover:shadow-xl hover:shadow-emerald-950/20 group cursor-pointer flex flex-col justify-between h-28"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-xs">
                    🌱
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900 dark:text-white font-poppins">
                      {lang === 'ml' ? 'തോട്ടം കാണുക' : 'My Plantation'}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#059669] dark:text-emerald-400">
                      {lang === 'ml' ? 'തോട്ടം മാനേജ് ചെയ്യുക' : 'Manage Plots'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('ai')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0D261B] border-2 border-[#CDE3D5] dark:border-[#1A402D] hover:border-[#059669] transition-all text-left shadow-md hover:shadow-xl hover:shadow-emerald-950/20 group cursor-pointer flex flex-col justify-between h-28"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-xs">
                    🔬
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900 dark:text-white font-poppins">
                      {lang === 'ml' ? 'രോഗം പരിശോധിക്കുക' : 'Plant Scanner'}
                    </span>
                    <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400">
                      {lang === 'ml' ? 'ഇല സ്കാൻ ചെയ്യുക' : 'Scan Leaf Health'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('weather')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0D261B] border-2 border-[#CDE3D5] dark:border-[#1A402D] hover:border-[#059669] transition-all text-left shadow-md hover:shadow-xl hover:shadow-emerald-950/20 group cursor-pointer flex flex-col justify-between h-28"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-xs">
                    ☁
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900 dark:text-white font-poppins">
                      {lang === 'ml' ? 'കാലാവസ്ഥ' : 'Weather'}
                    </span>
                    <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400">
                      {lang === 'ml' ? 'മഴ പ്രവചനം' : 'Rain Forecast'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('auctions')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0D261B] border-2 border-[#CDE3D5] dark:border-[#1A402D] hover:border-[#059669] transition-all text-left shadow-md hover:shadow-xl hover:shadow-emerald-950/20 group cursor-pointer flex flex-col justify-between h-28"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-xs">
                    🔨
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900 dark:text-white font-poppins">
                      {lang === 'ml' ? 'ലൈവ് ലേലം' : 'Live Auctions'}
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                      {lang === 'ml' ? 'ഏലക്കായ് വില' : 'Daily Spice Prices'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 4 OVERVIEW STATISTICS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Active Plantations */}
              <div className="bg-white dark:bg-[#0D261B] rounded-2xl p-4 border border-[#CDE3D5] dark:border-[#1A402D] shadow-md hover:border-[#059669] transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400">
                    <Leaf className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    {plantations.length > 0 ? (lang === 'ml' ? 'സജീവം' : 'Active') : (lang === 'ml' ? 'ഇല്ല' : 'No Plots')}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                    {plantations.length}
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-emerald-200 mt-0.5">
                    {lang === 'ml' ? 'സജീവ തോട്ടങ്ങൾ' : 'Active Plantations'}
                  </p>
                </div>
              </div>

              {/* Soil Moisture */}
              <div className="bg-white dark:bg-[#0D261B] rounded-2xl p-4 border border-[#CDE3D5] dark:border-[#1A402D] shadow-md hover:border-[#059669] transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                    <Droplets className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                    {plantations.length > 0 ? (lang === 'ml' ? 'ഉചിതം' : 'Optimal') : 'N/A'}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                    {plantations.length > 0 ? `${avgMoisture}%` : '0%'}
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-emerald-200 mt-0.5">
                    {lang === 'ml' ? 'മണ്ണിലെ ഈർപ്പം' : 'Soil Moisture'}
                  </p>
                </div>
              </div>

              {/* Plantation Health */}
              <div className="bg-white dark:bg-[#0D261B] rounded-2xl p-4 border border-[#CDE3D5] dark:border-[#1A402D] shadow-md hover:border-[#059669] transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    {plantations.length > 0 ? (lang === 'ml' ? 'ആരോഗ്യം' : 'Healthy') : 'N/A'}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                    {plantations.length > 0 ? `${avgHealth}%` : '0%'}
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-emerald-200 mt-0.5">
                    {lang === 'ml' ? 'തോട്ടം ആരോഗ്യം' : 'Plantation Health'}
                  </p>
                </div>
              </div>

              {/* Predicted Yield (Clickable KPI Summary Card) */}
              <div
                onClick={() => setActiveTab('yield-prediction')}
                className="bg-white dark:bg-[#0D261B] rounded-2xl p-4 border border-[#CDE3D5] dark:border-[#1A402D] shadow-md hover:border-[#059669] transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 group-hover:bg-[#1F5E3B] group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    {plantations.length > 0 ? (lang === 'ml' ? 'വിളവെടുപ്പ്' : 'Est. Harvest') : 'N/A'}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                    {plantations.length > 0 ? `${predictedYield} kg` : '0 kg'}
                  </div>
                  <p className="text-[10px] font-bold text-[#059669] dark:text-emerald-400 mt-0.5">
                    Estimated range: {Math.round(predictedYield * 0.91)}–{Math.round(predictedYield * 1.09)} kg
                  </p>
                  <p className="text-xs font-black text-[#1F5E3B] dark:text-emerald-300 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {lang === 'ml' ? 'പ്രവചനം കാണുക →' : 'View Forecast →'}
                  </p>
                </div>
              </div>
            </div>

            {/* CARDORA COMMAND CENTER INTELLIGENCE & ACTION BOARD */}
            <div className="bg-gradient-to-r from-[#17331F] via-[#1F5E3B] to-[#2E7D4E] text-white rounded-3xl p-6 shadow-xl border-2 border-emerald-400/40 space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-400/20 text-[#C9A227] font-bold border border-[#C9A227]/40 shadow-inner">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-poppins text-white flex items-center gap-2">
                      CARDORA INTELLIGENCE COMMAND CENTER
                    </h3>
                    <p className="text-xs text-emerald-100 font-medium">Real-time agronomic decision-support ecosystem for your cardamom estate</p>
                  </div>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  High Priority Alert
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {/* 1. What is Happening? */}
                <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1.5">
                  <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider block">1. WHAT IS HAPPENING?</span>
                  <h4 className="text-sm font-black text-white leading-tight font-poppins">Fungal Disease Risk Elevated (+8%)</h4>
                  <p className="text-emerald-100/90 text-[11px] leading-relaxed">
                    Plot <strong className="text-amber-300">{plantations[0]?.name || 'P-102'}</strong> shows 24% capsule rot exposure risk.
                  </p>
                </div>

                {/* 2. Why is it Happening? */}
                <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1.5">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">2. WHY IS IT HAPPENING?</span>
                  <h4 className="text-sm font-black text-white leading-tight font-poppins">Micro-Climate Saturation</h4>
                  <p className="text-emerald-100/90 text-[11px] leading-relaxed">
                    Humidity: 82% | Soil Moisture: 72% | 3-day expected rain in Idukki belt.
                  </p>
                </div>

                {/* 3. What Should I Do? */}
                <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1.5">
                  <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">3. WHAT SHOULD I DO?</span>
                  <h4 className="text-sm font-black text-white leading-tight font-poppins">Drainage & Neem Cake Action</h4>
                  <p className="text-emerald-100/90 text-[11px] leading-relaxed">
                    Inspect lower plot channels and apply organic bio-fungicide + Neem cake.
                  </p>
                </div>

                {/* 4. What Happened After Action? */}
                <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1.5">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider block">4. WHAT HAPPENED AFTER ACTION?</span>
                  <h4 className="text-sm font-black text-white leading-tight font-poppins">Historical Decision Tracking</h4>
                  <p className="text-emerald-100/90 text-[11px] leading-relaxed">
                    Previous action in North Plot reduced rot exposure by 45%. Outcome logged.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/15 flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Open Decision Center</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('plantations')}
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer"
                  >
                    View Affected Plot
                  </button>
                </div>

                <span className="text-emerald-200 text-[11px] font-semibold">
                  Synced with Real MongoDB Telemetry & Open-Meteo Weather APIs
                </span>
              </div>
            </div>

            {/* MAIN DASHBOARD 2-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT COLUMN: MY PLANTATION SUMMARY CARD */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
                {plantations.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF3E8] dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <Leaf className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white font-poppins">
                      No Plantations Added Yet
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                      You have not registered any cardamom plantations under your account. Register your estate to view real-time micro-climate telemetry, soil pH, and yield predictions.
                    </p>
                    <button
                      onClick={() => setNewPlantationModalOpen(true)}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-black transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Plantation</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400">
                          <Leaf className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {lang === 'ml' ? 'എന്റെ തോട്ടം' : 'My Plantation Summary'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {plantations[0]?.name} • {plantations[0]?.location}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('plantations')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <span>{lang === 'ml' ? 'തോട്ടം കാണുക' : 'View Plantation'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metric Badges Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">
                          {lang === 'ml' ? 'വിസ്തീർണ്ണം' : 'Plot Area'}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {plantations[0]?.area} Acres
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">
                          {lang === 'ml' ? 'മണ്ണിന്റെ അവസ്ഥ' : 'Soil Condition'}
                        </span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                          pH {plantations[0]?.ph || 6.2} (Balanced)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">
                          {lang === 'ml' ? 'കാലാവസ്ഥ' : 'Current Weather'}
                        </span>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                          28°C Sunny
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">
                          {lang === 'ml' ? 'ഈർപ്പം തലം' : 'Moisture Level'}
                        </span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                          {plantations[0]?.moisture || 72}% Optimal
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">
                          {lang === 'ml' ? 'ആരോഗ്യ സ്കോർ' : 'Health Score'}
                        </span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                          {plantations[0]?.health || 94}% Healthy
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">
                          {lang === 'ml' ? 'അവസാന പ്രവർത്തനം' : 'Recent Activity'}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                          Irrigated 2 days ago
                        </span>
                      </div>
                    </div>

                    {plantations.length > 1 && (
                      <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <span>Registered Estates: <strong>{plantations.length} Plots</strong></span>
                        <button onClick={() => setActiveTab('plantations')} className="text-[#1F5E3B] dark:text-emerald-400 font-bold hover:underline">Manage All Plots →</button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* RIGHT COLUMN: MESSAGES CARD (CRITICAL - IMMEDIATELY VISIBLE ON DASHBOARD TOP RIGHT) */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'സന്ദേശങ്ങൾ' : 'Messages'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Recent farm conversations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setChatTargetUser(null); setChatModalOpen(true); }}
                    className="px-3 py-1.5 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition"
                  >
                    <span>{lang === 'ml' ? 'തുറക്കുക' : 'Open Messages'}</span>
                  </button>
                </div>

                {/* Conversations List */}
                <div className="space-y-2.5">
                  {dashboardConversations.length > 0 ? (
                    dashboardConversations.slice(0, 4).map((conv) => {
                      const u = conv.user || {};
                      const lastMsg = conv.lastMessage || {};
                      return (
                        <div
                          key={u._id || u.id}
                          onClick={() => { setChatTargetUser(u); setChatModalOpen(true); }}
                          className="p-3 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700 hover:border-[#1F5E3B] dark:hover:border-emerald-500 hover:shadow-sm transition cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                              <img
                                src={u.avatar || u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=1F5E3B&color=ffffff`}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border border-[#1F5E3B] shadow-xs"
                              />
                              {conv.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{u.name}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-extrabold">{u.role || 'Planter'}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">{lastMsg.text || 'Latest update...'}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-400 whitespace-nowrap">
                            {lastMsg.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    /* Clean Dynamic Empty State for Conversations */
                    <div className="py-6 px-4 text-center rounded-2xl bg-[#F8FAF7]/80 dark:bg-slate-800/40 border border-[#D7E6D5]/80 dark:border-slate-800 space-y-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-poppins">
                          {lang === 'ml' ? 'സന്ദേശങ്ങൾ ഒന്നുമില്ല' : 'No Active Conversations'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-[220px] mx-auto leading-relaxed">
                          {lang === 'ml' ? 'തോട്ടം തൊഴിലാളികൾ, വിതരണക്കാർ അല്ലെങ്കിൽ അഗ്രോണമിസ്റ്റുകളുമായി തത്സമയം ചാറ്റ് ചെയ്യുക.' : 'Start messaging farmers, labor contractors, or experts in your network.'}
                        </p>
                      </div>
                      <button
                        onClick={() => { setChatTargetUser(null); setChatModalOpen(true); }}
                        className="px-4 py-2 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'ml' ? 'പുതിയ സന്ദേശം' : 'Start New Message'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ON-SITE PLANTATION VISIT REQUESTS MANAGER (FULL WIDTH) */}
            <div className="w-full my-6 font-sans">
              <PlantationVisitsManager
                onToast={showToast}
                onOpenChat={(targetUser) => {
                  setChatTargetUser(targetUser);
                  setChatModalOpen(true);
                }}
              />
            </div>



            {/* IMPORTANT QUICK ACTIONS SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1F5E3B] dark:text-emerald-400" />
                <span>{lang === 'ml' ? 'ത്വരിത നടപടികൾ' : 'Important Quick Actions'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* Action 1: Add Plantation */}
                <button
                  onClick={() => setNewPlantationModalOpen(true)}
                  className="p-4 rounded-xl bg-[#F4F8F3] dark:bg-slate-800/80 hover:bg-[#EAF3E8] dark:hover:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-left transition-all group flex flex-col justify-between h-24"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-[#1F5E3B] text-white">
                      <Plus className="w-4 h-4" />
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#5C8D4E] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{lang === 'ml' ? 'തോട്ടം ചേർക്കുക' : 'Add Plantation'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Register a cardamom plot</p>
                  </div>
                </button>

                {/* Action 2: Manage Workers */}
                <button
                  onClick={() => setActiveTab('workforce')}
                  className="p-4 rounded-xl bg-[#F4F8F3] dark:bg-slate-800/80 hover:bg-[#EAF3E8] dark:hover:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-left transition-all group flex flex-col justify-between h-24"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                      <Users className="w-4 h-4" />
                    </span>
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{lang === 'ml' ? 'തൊഴിലാളികൾ' : 'Manage Workers'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">View roster & tasks</p>
                  </div>
                </button>

                {/* Action 3: Mark Attendance */}
                <button
                  onClick={() => setActiveTab('workforce')}
                  className="p-4 rounded-xl bg-[#F4F8F3] dark:bg-slate-800/80 hover:bg-[#EAF3E8] dark:hover:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-left transition-all group flex flex-col justify-between h-24"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{lang === 'ml' ? 'ഹാജർ രേഖപ്പെടുത്തുക' : 'Mark Attendance'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Track labor hours</p>
                  </div>
                </button>

                {/* Action 4: Get AI Recommendation */}
                <button
                  onClick={() => setActiveTab('ai')}
                  className="p-4 rounded-xl bg-[#F4F8F3] dark:bg-slate-800/80 hover:bg-[#EAF3E8] dark:hover:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-left transition-all group flex flex-col justify-between h-24"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-purple-600 text-white">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{lang === 'ml' ? 'AI നിർദ്ദേശങ്ങൾ' : 'AI Recommendation'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Soil & disease advice</p>
                  </div>
                </button>

                {/* Action 5: Live Auctions */}
                <button
                  onClick={() => setActiveTab('auctions')}
                  className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 hover:scale-102 border-2 border-rose-300 dark:border-rose-800 text-left transition-all group flex flex-col justify-between h-24 shadow-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs">
                      <Gavel className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse">🔴 LIVE</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                      {lang === 'ml' ? 'ലൈവ് ലേലം' : 'Live Auctions 🔨'}
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">Real-time estate bidding</p>
                  </div>
                </button>

                {/* Action 6: Send Message */}
                <button
                  onClick={() => { setChatTargetUser(null); setChatModalOpen(true); }}
                  className="p-4 rounded-xl bg-[#F4F8F3] dark:bg-slate-800/80 hover:bg-[#EAF3E8] dark:hover:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-left transition-all group flex flex-col justify-between h-24"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{lang === 'ml' ? 'സന്ദേശം അയക്കുക' : 'Send Message'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Chat with team & buyers</p>
                  </div>
                </button>
              </div>
            </div>

            {/* WEATHER MODULE SNIPPET ON DASHBOARD */}
            <WeatherModule
              userLocation={user?.district || user?.location || 'Idukki, Kerala'}
              onToast={showToast}
            />

            {/* CARDORA AI SOIL & FERTILIZER ADVISOR ON DASHBOARD */}
            <CardoraFertilizerAdvisor
              plantation={plantations[0]}
              onToast={showToast}
            />

            {/* AI ANALYSIS MODULE SNIPPET ON DASHBOARD */}
            <AiAnalysisModule
              plantation={plantations[0]}
              onToast={showToast}
            />

          </div>
        )}

        {/* ===== TAB: WEATHER INTELLIGENCE ===== */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <WeatherModule
              userLocation={user?.district || user?.location || 'Idukki, Kerala'}
              onToast={showToast}
            />
          </div>
        )}

        {/* ===== TAB 2: MY PLANTATION ===== */}
        {activeTab === 'plantations' && (
          <PlantationModule onToast={showToast} />
        )}


        {/* ===== TAB 3: AI RECOMMENDATION PAGE ===== */}
        {activeTab === 'ai' && (
          <div className="space-y-6 w-full max-w-none">
            <CardoraFertilizerAdvisor
              plantation={plantations[0]}
              onToast={showToast}
            />
            <AiAnalysisModule
              plantation={plantations[0]}
              onToast={showToast}
            />
          </div>
        )}

        {/* ===== DEDICATED SUPERVISOR PORTAL HUB ===== */}
        {(activeTab === 'supervisor' || (isSupervisorUser && activeTab !== 'messages' && activeTab !== 'profile')) && (
          <div className="w-full">
            <SupervisorDashboard
              plantationId={
                (typeof user?.assignedPlantation === 'object'
                  ? user?.assignedPlantation?._id || user?.assignedPlantation?.id
                  : user?.assignedPlantation) ||
                plantations[0]?._id ||
                plantations[0]?.id ||
                'default_plantation_id'
              }
              showToast={showToast}
              onNavigateTab={(targetTab) => {
                if (targetTab === 'messages') {
                  setChatTargetUser(null);
                  setChatModalOpen(true);
                } else {
                  setActiveTab(targetTab);
                }
              }}
            />
          </div>
        )}

        {/* ===== WORKFORCE & WORKER CONNECTION SYSTEM ===== */}
        {activeTab === 'workforce' && (
          <WorkforceModule
            onOpenChat={(targetUserId) => {
              setChatTargetUser(targetUserId);
              setChatModalOpen(true);
            }}
          />
        )}

        {/* ===== TAB: DEDICATED MESSAGES DASHBOARD ===== */}
        {activeTab === 'messages' && (
          <div className="w-full">
            <MessagingModule
              initialTargetUser={searchParams.get('userId') || chatTargetUser}
              onToast={showToast}
            />
          </div>
        )}

        {/* ===== TAB: REAL-TIME NOTIFICATIONS CENTER ===== */}
        {activeTab === 'notifications' && (
          <div className="w-full">
            <NotificationModule />
          </div>
        )}

        {/* ===== TAB: CARDORA LIVE AUCTION MODULE ===== */}
        {(activeTab === 'auctions' || activeTab === 'auction') && (
          <div className="w-full">
            <AuctionModule user={user} onToast={showToast} />
          </div>
        )}

        {/* ===== TAB: EXPERT CONSULTATION PORTAL ===== */}
        {activeTab === 'expert' && (
          <div className="w-full max-w-7xl mx-auto">
            <ExpertConsultationPortal />
          </div>
        )}

        {/* ===== TAB 4: COMMUNITY ===== */}
        {activeTab === 'community' && (
          <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4">
            {/* Expert Consultation Entry Banner */}
            <div className="bg-[#EAF3E8] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 rounded-3xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#1F5E3B] dark:text-emerald-400 text-sm">Need Agricultural Advice for your Cardamom Plantation?</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-300">Consult with verified Cardora agronomists, ask questions in Malayalam or English.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('expert')}
                className="px-4 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-black hover:bg-[#17331F] transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                Ask an Agronomist →
              </button>
            </div>
            {/* Header Title & DB Sync Banner */}
            <div className="bg-gradient-to-r from-[#17331F] via-[#1F5E3B] to-[#2E7D4E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-wider uppercase border border-emerald-400/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Planter Social Hub
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-bold backdrop-blur-md">
                    🌿 1,420+ Planters Online
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black font-poppins tracking-tight text-white">
                  Cardamom Planters Community Feed
                </h2>
                <p className="text-emerald-100/90 text-sm max-w-xl font-medium">
                  Connect with estate owners, share live harvest yields, discover organic spice tips, and ask farming experts in real time.
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <button
                  onClick={() => {
                    fetchPosts();
                    showToast('🔄 Live sync complete! Synced directly with Cardora DB.');
                  }}
                  className="px-5 py-3 rounded-2xl bg-white text-[#17331F] hover:bg-emerald-50 text-xs font-black transition-all border border-white/20 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Fetch live posts directly from MongoDB Database"
                >
                  <RefreshCw className="w-4 h-4 text-[#1F5E3B]" />
                  <span>Sync Live DB</span>
                </button>
              </div>
            </div>

            {/* Main Search & Category Filter Navigation Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-[#D7E6D5] dark:border-slate-800 shadow-md space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full relative">
                  <Search className="w-5 h-5 text-[#1F5E3B] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={communitySearchQuery}
                    onChange={(e) => setCommunitySearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && communitySearchQuery.trim()) {
                        showToast(`Showing search results for "${communitySearchQuery.trim()}"`);
                      }
                    }}
                    placeholder="Search planter name (e.g. Rajesh, Ananya, Suresh), district, or post topics..."
                    className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-2xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-slate-100 font-bold focus:outline-none focus:border-[#1F5E3B] focus:ring-2 focus:ring-[#1F5E3B]/20 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      if (communitySearchQuery.trim()) {
                        showToast(`Showing search results for "${communitySearchQuery.trim()}"`);
                      }
                    }}
                    className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Community</span>
                  </button>
                  {communitySearchQuery && (
                    <button
                      onClick={() => {
                        setCommunitySearchQuery('');
                        setSearchParams({ tab: 'community' });
                      }}
                      className="px-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 text-sm font-bold transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills Filter Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-[#D7E6D5]/60 dark:border-slate-800">
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5 text-[#1F5E3B]" />
                  Filter Feed:
                </span>
                {[
                  { id: 'All', label: 'All Updates', icon: '🌐' },
                  { id: 'Plantation Update', label: 'Plantation Updates', icon: '🌿' },
                  { id: 'Farming Tip', label: 'Organic Tips', icon: '💡' },
                  { id: 'Expert Advice', label: 'Expert Advice', icon: '🎓' },
                  { id: 'Question', label: 'Farmer Questions', icon: '❓' },
                ].map((cat) => {
                  const isActive = selectedCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${isActive
                        ? 'bg-[#1F5E3B] text-white shadow-md shadow-[#1F5E3B]/20 scale-105'
                        : 'bg-[#F8FAF7] dark:bg-slate-800/60 hover:bg-[#DDEFD9] text-[#17331F] dark:text-slate-200 border border-[#D7E6D5] dark:border-slate-700'
                        }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Responsive Main Layout: 2 Columns on Desktop (Feed 8 cols, Sidebar 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT MAIN FEED COLUMN (col-span-8) */}
              <div className="lg:col-span-8 space-y-6">

                {/* Matching Planter Profiles Banner (Live Search Results) */}
                {communitySearchQuery.trim() && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-[#17331F] dark:text-emerald-400 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#1F5E3B]" />
                        <span>Matching Planter Profiles ({searchedPlanters.length})</span>
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#1F5E3B] text-xs font-bold border border-emerald-200">
                        Live Planter Search
                      </span>
                    </div>

                    {searchedPlanters.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">No planter accounts found matching "{communitySearchQuery}".</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {searchedPlanters.map((planter) => (
                          <div
                            key={planter._id || planter.id}
                            onClick={() => setSelectedPublicUser({
                              author: planter.name,
                              username: planter.username,
                              avatar: planter.avatar || planter.profileImage || planter.profilePhoto,
                              role: planter.role,
                              location: planter.location || planter.district,
                              district: planter.district || planter.location,
                              bio: planter.bio,
                            })}
                            className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800/70 hover:bg-[#DDEFD9] dark:hover:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 flex items-center justify-between cursor-pointer group transition-all shadow-xs hover:shadow-md"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img
                                src={(planter.avatar || planter.profileImage || planter.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(planter.name || 'Planter')}&background=1F5E3B&color=ffffff`}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#1F5E3B] group-hover:scale-105 transition-transform flex-shrink-0"
                              />
                              <div className="overflow-hidden">
                                <h4 className="text-sm font-extrabold text-[#17331F] dark:text-slate-100 flex items-center gap-1.5 truncate">
                                  <span className="truncate">{planter.name}</span>
                                  <CheckCircle className="w-4 h-4 text-[#1F5E3B] flex-shrink-0" />
                                </h4>
                                <p className="text-xs text-[#5C8D4E] font-bold truncate">@{planter.username || 'planter'} • {planter.role || 'Farmer'}</p>
                              </div>
                            </div>
                            <button className="px-3.5 py-1.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-black group-hover:bg-[#17331F] transition-colors whitespace-nowrap ml-2 flex-shrink-0 cursor-pointer">
                              View Profile
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Create New Post Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'P')}&background=1F5E3B&color=ffffff`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1F5E3B] shadow-xs flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-black text-[#17331F] dark:text-slate-100">Publish a Community Post</h3>
                      <p className="text-xs text-gray-500 font-medium">Share updates, ask questions, or recommend farming practices</p>
                    </div>
                  </div>

                  <textarea
                    rows="4"
                    value={newPostText}
                    onChange={(e) => {
                      setNewPostText(e.target.value);
                      if (postError) setPostError('');
                    }}
                    placeholder="Write your cardamom plantation update, ask a question, or share an organic farming tip..."
                    className={`w-full p-4 rounded-2xl text-sm sm:text-base leading-relaxed focus:outline-none resize-none border font-medium ${postError ? 'border-red-400 bg-red-50/50' : 'border-[#D7E6D5] dark:border-slate-700 bg-[#F8FAF7] dark:bg-slate-800 focus:border-[#1F5E3B] focus:ring-2 focus:ring-[#1F5E3B]/20 text-[#17331F] dark:text-slate-100'
                      }`}
                  />

                  {/* Image Preview Box if set */}
                  {newPostImage && (
                    <div className="relative rounded-2xl overflow-hidden border border-[#D7E6D5] max-h-60 group">
                      <img src={newPostImage} alt="Post attachment preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setNewPostImage('')}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold transition-transform hover:scale-110 cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                      {/* Category Dropdown */}
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#1F5E3B]" />
                        <select
                          value={newPostCategory}
                          onChange={(e) => setNewPostCategory(e.target.value)}
                          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border border-[#D7E6D5] dark:border-slate-700 bg-[#F8FAF7] dark:bg-slate-800 text-[#17331F] dark:text-slate-100 focus:outline-none focus:border-[#1F5E3B]"
                        >
                          <option value="Plantation Update">🌿 Plantation Update</option>
                          <option value="Farming Tip">💡 Organic Tip</option>
                          <option value="Question">❓ Farmer Question</option>
                          <option value="Expert Advice">🎓 Expert Advice</option>
                        </select>
                      </div>

                      {/* Image Upload Input */}
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={newPostImage}
                          onChange={(e) => setNewPostImage(e.target.value)}
                          placeholder="Paste image URL (optional)..."
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#D7E6D5] dark:border-slate-700 bg-[#F8FAF7] dark:bg-slate-800 text-[#17331F] dark:text-slate-100 focus:outline-none focus:border-[#1F5E3B]"
                        />
                        <input
                          type="file"
                          id="post-photo-upload-main"
                          accept="image/*"
                          onChange={handlePostFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="post-photo-upload-main"
                          className="cursor-pointer px-3.5 py-2 rounded-xl bg-[#DDEFD9] dark:bg-emerald-950/60 border border-[#5C8D4E]/40 text-[#1F5E3B] dark:text-emerald-300 text-xs font-extrabold hover:bg-[#1F5E3B] hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Upload Image</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleAddPost}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1F5E3B] to-[#17331F] hover:from-[#17331F] hover:to-[#0f2415] text-white text-sm font-black transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>Publish Post</span>
                    </button>
                  </div>

                  {postError && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{postError}</span>
                    </p>
                  )}
                </div>

                {/* Feed Posts List */}
                {feedPosts.filter((post) => {
                  // Category Filter
                  if (selectedCategoryFilter !== 'All') {
                    const catMatch = (post.category || '').toLowerCase().trim() === selectedCategoryFilter.toLowerCase().trim() ||
                      (selectedCategoryFilter === 'Farming Tip' && (post.category || '').toLowerCase().includes('tip')) ||
                      (selectedCategoryFilter === 'Question' && (post.category || '').toLowerCase().includes('question'));
                    if (!catMatch) return false;
                  }
                  // Search Query Filter
                  if (!communitySearchQuery.trim()) return true;
                  const q = communitySearchQuery.toLowerCase().trim();
                  return (
                    (post.author && post.author.toLowerCase().includes(q)) ||
                    (post.username && post.username.toLowerCase().includes(q)) ||
                    (post.content && post.content.toLowerCase().includes(q)) ||
                    (post.description && post.description.toLowerCase().includes(q)) ||
                    (post.category && post.category.toLowerCase().includes(q))
                  );
                }).length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-12 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#DDEFD9] text-[#1F5E3B] flex items-center justify-center mx-auto text-2xl">
                      🍃
                    </div>
                    <h4 className="text-lg font-black text-[#17331F] dark:text-slate-100">No community posts match your filter.</h4>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">Try clearing search filters or selecting another category above to view updates from other planters.</p>
                    <button
                      onClick={() => {
                        setCommunitySearchQuery('');
                        setSelectedCategoryFilter('All');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-extrabold hover:bg-[#17331F] transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  feedPosts.filter((post) => {
                    if (selectedCategoryFilter !== 'All') {
                      const catMatch = (post.category || '').toLowerCase().trim() === selectedCategoryFilter.toLowerCase().trim() ||
                        (selectedCategoryFilter === 'Farming Tip' && (post.category || '').toLowerCase().includes('tip')) ||
                        (selectedCategoryFilter === 'Question' && (post.category || '').toLowerCase().includes('question'));
                      if (!catMatch) return false;
                    }
                    if (!communitySearchQuery.trim()) return true;
                    const q = communitySearchQuery.toLowerCase().trim();
                    return (
                      (post.author && post.author.toLowerCase().includes(q)) ||
                      (post.username && post.username.toLowerCase().includes(q)) ||
                      (post.content && post.content.toLowerCase().includes(q)) ||
                      (post.description && post.description.toLowerCase().includes(q)) ||
                      (post.category && post.category.toLowerCase().includes(q))
                    );
                  }).map((post) => (
                    <div key={post.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 sm:p-7 shadow-md space-y-4 hover:shadow-lg transition-all">
                      {/* Author Header Row */}
                      <div className="flex items-center justify-between gap-4">
                        <div
                          onClick={() => setSelectedPublicUser(post)}
                          className="flex items-center gap-3.5 cursor-pointer group"
                          title="Click to view planter profile"
                        >
                          <img
                            src={post.avatar}
                            alt=""
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#1F5E3B] group-hover:scale-105 transition-transform shadow-xs flex-shrink-0"
                          />
                          <div>
                            <h4 className="text-sm sm:text-base font-extrabold text-[#17331F] dark:text-slate-100 group-hover:text-[#1F5E3B] flex items-center gap-2">
                              <span>{post.author}</span>
                              <CheckCircle className="w-4 h-4 text-[#1F5E3B]" />
                            </h4>
                            <p className="text-xs text-[#5C8D4E] font-semibold flex items-center gap-2 mt-0.5">
                              <span>@{post.username || 'planter'}</span>
                              <span>•</span>
                              <span className="text-gray-400 font-normal">{post.time}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wide border ${post.category === 'Expert Advice'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : post.category === 'Farming Tip'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : post.category === 'Question'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-[#DDEFD9] text-[#1F5E3B] border-[#5C8D4E]/30'
                            }`}>
                            {post.category}
                          </span>

                          {((user?.role || '').toLowerCase() === 'admin' || user?.username === post.username || user?.fullName === post.author) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id);
                              }}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Post (Admin / Owner)"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Description Body Text */}
                      <p className="text-sm sm:text-base text-[#17331F] dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                        {post.description || post.content}
                      </p>

                      {/* Attached Image Preview */}
                      {post.image && (
                        <div className="rounded-2xl overflow-hidden border border-[#D7E6D5] dark:border-slate-800 max-h-96 w-full shadow-xs">
                          <img src={post.image} alt="Post media asset" className="w-full h-full object-cover hover:scale-101 transition-transform duration-300" />
                        </div>
                      )}

                      {/* Interaction Bar: Heart, Comment, Share */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#D7E6D5]/70 dark:border-slate-800 text-xs sm:text-sm font-extrabold">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${post.liked
                              ? 'bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200'
                              : 'bg-[#F8FAF7] dark:bg-slate-800 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent'
                              }`}
                          >
                            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{post.likes} Likes</span>
                          </button>

                          <button
                            onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                            className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${activeCommentPostId === post.id
                              ? 'bg-[#DDEFD9] dark:bg-emerald-950/50 text-[#1F5E3B] dark:text-emerald-300 border border-[#5C8D4E]/30'
                              : 'bg-[#F8FAF7] dark:bg-slate-800 text-gray-600 hover:bg-[#DDEFD9] hover:text-[#1F5E3B] border border-transparent'
                              }`}
                          >
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F5E3B]" />
                            <span>{post.comments} Comments</span>
                          </button>
                        </div>

                        <button
                          onClick={() => showToast('Post link copied to clipboard!')}
                          className="px-4 py-2 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 text-gray-600 hover:text-[#1F5E3B] hover:bg-[#DDEFD9] transition-all flex items-center gap-2 border border-transparent cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                      </div>

                      {/* Interactive Comment Input & Threaded Comments Drawer */}
                      {activeCommentPostId === post.id && (
                        <div className="mt-4 pt-4 border-t border-[#D7E6D5] dark:border-slate-800 space-y-4">
                          {/* Comment Input Box */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentInputText}
                              onChange={(e) => setCommentInputText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                              placeholder="Add a comment to this discussion..."
                              className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm border border-[#D7E6D5] dark:border-slate-700 bg-[#F8FAF7] dark:bg-slate-800 text-[#17331F] dark:text-slate-100 focus:outline-none focus:border-[#1F5E3B] focus:ring-2 focus:ring-[#1F5E3B]/20"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="px-5 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#17331F] text-white text-xs sm:text-sm font-black transition-colors shadow-sm cursor-pointer"
                            >
                              Comment
                            </button>
                          </div>

                          {/* Comments List Thread */}
                          {commentsMap[post.id] && commentsMap[post.id].length > 0 && (
                            <div className="space-y-3 pt-2">
                              {commentsMap[post.id].map((c) => {
                                const currentUserName = user?.fullName || user?.name || user?.username || '';
                                const isPostAuthor = currentUserName.toLowerCase().trim() === (post.author || post.username || '').toLowerCase().trim();
                                return (
                                  <div key={c.id} className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700 space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div className="flex gap-3 items-start flex-1">
                                        <img src={c.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#1F5E3B] flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-extrabold text-[#17331F] dark:text-slate-100 text-xs sm:text-sm">{c.author}</span>
                                            {c.author === post.author && (
                                              <span className="px-2 py-0.5 rounded bg-[#1F5E3B] text-white text-[10px] font-black tracking-wide uppercase">
                                                POST OWNER
                                              </span>
                                            )}
                                            <span className="text-xs text-gray-400 font-normal">{c.time}</span>
                                          </div>

                                          {editingCommentId === c.id ? (
                                            <div className="flex items-center gap-2 mt-2">
                                              <input
                                                type="text"
                                                value={editingCommentText}
                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                className="flex-1 px-3 py-1.5 rounded-xl border border-[#1F5E3B] text-xs sm:text-sm bg-white dark:bg-slate-900 focus:outline-none"
                                              />
                                              <button onClick={() => handleSaveEditComment(post.id, c.id)} className="px-3 py-1.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F] cursor-pointer">
                                                Save
                                              </button>
                                              <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 cursor-pointer">
                                                Cancel
                                              </button>
                                            </div>
                                          ) : (
                                            <p className="text-xs sm:text-sm text-[#334155] dark:text-slate-300 mt-1 font-medium leading-relaxed">{c.text}</p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            setActiveReplyCommentId(activeReplyCommentId === c.id ? null : c.id);
                                            setReplyInputText('');
                                          }}
                                          className="text-xs font-extrabold text-[#1F5E3B] hover:bg-[#DDEFD9] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                          <CornerDownRight className="w-3.5 h-3.5" />
                                          <span>Reply</span>
                                        </button>

                                        {editingCommentId !== c.id && (
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(c.id);
                                              setEditingCommentText(c.text);
                                            }}
                                            className="text-xs font-bold text-gray-400 hover:text-[#1F5E3B] px-1 py-1 cursor-pointer"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Inline Reply Input */}
                                    {activeReplyCommentId === c.id && (
                                      <div className="mt-3 pl-8 flex gap-2 items-center">
                                        <input
                                          type="text"
                                          value={replyInputText}
                                          onChange={(e) => setReplyInputText(e.target.value)}
                                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(post.id, c.id); }}
                                          placeholder={isPostAuthor ? "Reply as Post Owner..." : `Replying to @${c.author}...`}
                                          className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-[#1F5E3B] bg-white dark:bg-slate-900 focus:outline-none"
                                          autoFocus
                                        />
                                        <button
                                          onClick={() => handleSendReply(post.id, c.id)}
                                          className="px-4 py-2 rounded-xl bg-[#1F5E3B] hover:bg-[#17331F] text-white text-xs font-extrabold transition-colors whitespace-nowrap cursor-pointer"
                                        >
                                          Send Reply
                                        </button>
                                      </div>
                                    )}

                                    {/* Nested Replies List */}
                                    {c.replies && c.replies.length > 0 && (
                                      <div className="pl-8 space-y-2 mt-3 pt-3 border-t border-[#D7E6D5]/60 dark:border-slate-700">
                                        {c.replies.map((r) => (
                                          <div key={r.id} className="p-3 rounded-xl bg-[#EAF3E8] dark:bg-slate-800 border-l-4 border-[#1F5E3B] text-xs sm:text-sm flex items-start gap-3">
                                            <img src={r.avatar} alt="" className="w-7 h-7 rounded-full object-cover mt-0.5 border border-[#1F5E3B]" />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-[#17331F] dark:text-slate-100">{r.author}</span>
                                                {(r.isPostOwner || r.author === post.author) && (
                                                  <span className="px-2 py-0.5 rounded bg-[#C9A227] text-white text-[9px] font-black uppercase tracking-wider">
                                                    👑 POST OWNER REPLY
                                                  </span>
                                                )}
                                                <span className="text-[10px] text-[#5C8D4E] font-medium ml-auto">{r.time}</span>
                                              </div>
                                              <p className="text-[#334155] dark:text-slate-300 text-xs sm:text-sm mt-1 font-medium">{r.text}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* RIGHT SIDEBAR COLUMN (col-span-4) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Cardora Community Pulse Widget */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 shadow-md space-y-4">
                  <h3 className="text-base font-black text-[#17331F] dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#1F5E3B]" />
                    <span>Community Pulse Metrics</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#DDEFD9] text-[#1F5E3B] flex items-center justify-center mx-auto mb-2">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-xl font-black text-[#17331F] dark:text-slate-100">1,420</p>
                      <p className="text-xs text-gray-500 font-bold">Active Planters</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1F5E3B] flex items-center justify-center mx-auto mb-2">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <p className="text-xl font-black text-[#17331F] dark:text-slate-100">{feedPosts.length}</p>
                      <p className="text-xs text-gray-500 font-bold">Live Feed Updates</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1F5E3B] to-[#17331F] text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Top Cardamom Hubs</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-emerald-100 font-medium">
                      Idukki • Vandanmedu • Kattappana • Kumily • Munnar
                    </p>
                  </div>
                </div>

                {/* Trending Spice Topics Widget */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 shadow-md space-y-4">
                  <h3 className="text-base font-black text-[#17331F] dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1F5E3B]" />
                    <span>Trending Spice Topics</span>
                  </h3>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { tag: '#Njallani777', count: '142 posts' },
                      { tag: '#OrganicNeemCake', count: '89 posts' },
                      { tag: '#MonsoonCare', count: '64 posts' },
                      { tag: '#CardamomAuctions', count: '110 posts' },
                      { tag: '#CapsuleGrade8mm', count: '75 posts' },
                      { tag: '#DripFertigation', count: '53 posts' },
                    ].map((item) => (
                      <button
                        key={item.tag}
                        onClick={() => {
                          setCommunitySearchQuery(item.tag.replace('#', ''));
                          showToast(`Filtered feed by topic: ${item.tag}`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#F8FAF7] dark:bg-slate-800 hover:bg-[#DDEFD9] text-[#17331F] dark:text-slate-200 border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="text-[#1F5E3B] font-black">{item.tag}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({item.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Cardamom Experts & Planters */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#17331F] dark:text-slate-100 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#1F5E3B]" />
                      <span>Featured Planters</span>
                    </h3>
                    <span className="text-xs text-[#5C8D4E] font-bold">Verified</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {[
                      {
                        name: 'Rajesh Nair',
                        username: 'rajesh_nair',
                        role: 'High Altitude Planter',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
                        location: 'Kattappana, Idukki',
                      },
                      {
                        name: 'Dr. Suresh Kumar',
                        username: 'suresh_agro',
                        role: 'Agronomy Specialist',
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                        location: 'Spices Board Advisory',
                      },
                      {
                        name: 'Ananya Ramesh',
                        username: 'ananya_planter',
                        role: 'Organic Spice Grower',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                        location: 'Munnar Estate',
                      },
                    ].map((planter) => (
                      <div
                        key={planter.username}
                        onClick={() => setSelectedPublicUser({
                          author: planter.name,
                          username: planter.username,
                          avatar: planter.avatar,
                          role: planter.role,
                          location: planter.location,
                        })}
                        className="p-3 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800/80 hover:bg-[#DDEFD9] dark:hover:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img src={planter.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1F5E3B] flex-shrink-0" />
                          <div className="overflow-hidden">
                            <h4 className="text-xs sm:text-sm font-extrabold text-[#17331F] dark:text-slate-100 truncate group-hover:text-[#1F5E3B]">
                              {planter.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 font-medium truncate">{planter.role}</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 rounded-lg bg-[#1F5E3B] text-white text-[10px] font-black group-hover:bg-[#17331F] transition-colors whitespace-nowrap ml-2 flex-shrink-0 cursor-pointer">
                          Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ===== TAB 5: FUTURISTIC CARDAMOM MARKETPLACE ===== */}
        {activeTab === 'plots' && <CardamomMarketplace />}

        {/* ===== TAB: AGRONOMIST EXPERT DEDICATED DASHBOARD ===== */}
        {activeTab === 'expert-dashboard' && <ExpertDashboard onToast={showToast} />}

        {/* ===== TAB: YIELD PREDICTION DEDICATED MODULE ===== */}
        {activeTab === 'yield-prediction' && <YieldPredictionModule onToast={showToast} onNavigateTab={(tab) => setSearchParams({ tab })} />}

        {/* ===== TAB: LIVE PLANTATION INTELLIGENCE & AI RECOMMENDATIONS ===== */}
        {(activeTab === 'intelligence' || activeTab === 'ai') && <LivePlantationIntelligenceModule onToast={showToast} />}



        {/* ===== TAB: ADMIN PORTAL ===== */}
        {activeTab === 'admin' && <AdminDashboard />}

        {/* ===== TAB 6: PROFILE ===== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 w-full">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <img src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-[#1F5E3B] shadow-md" />
                <div>
                  <h3 className="text-2xl font-black text-[#17331F] font-poppins flex items-center gap-2">
                    {user?.fullName || user?.username || 'Planter'}
                    <CheckCircle className="w-5 h-5 text-[#1F5E3B]" />
                  </h3>
                  <p className="text-xs text-[#5C8D4E] font-bold mt-0.5">{user?.district || user?.location || 'Idukki, Kerala'} • Planter</p>
                  <p className="text-xs text-[#4A5568] mt-2 leading-relaxed">{user?.bio || 'Cardamom cultivator with high-altitude plantation records.'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D7E6D5] flex gap-3">
                <Button variant="primary" size="sm" icon={Edit} onClick={() => {
                  setProfileForm({
                    fullName: user?.fullName || user?.name || '',
                    phone: user?.phone || '',
                    district: user?.district || user?.location || 'Idukki, Kerala',
                    location: user?.location || user?.district || 'Idukki, Kerala',
                    bio: user?.bio || '',
                    avatar: user?.avatar || user?.profileImage || '',
                    role: user?.role || 'Farmer',
                  });
                  setPhotoUrlInput(user?.avatar || user?.profileImage || '');
                  setProfileEditOpen(true);
                }}>
                  Edit Profile Details
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ===== TAB 7: SETTINGS ===== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 w-full">
            <div>
              <h2 className="text-2xl font-black text-[#17331F] font-poppins flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#1F5E3B]" />
                Account Settings & Preferences
              </h2>
              <p className="text-xs text-[#4A5568] font-medium">Manage your profile photo, username, role, security credentials, and app preferences.</p>
            </div>

            {/* SECTION 1: PROFILE PHOTO UPLOAD */}
            <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#D7E6D5]">
                <Camera className="w-5 h-5 text-[#1F5E3B]" />
                <h3 className="text-base font-extrabold text-[#17331F]">Profile Photo Management</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <img
                    src={photoUrlInput || (user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#1F5E3B] shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold pointer-events-none">
                    Preview
                  </div>
                </div>

                <form onSubmit={handleUpdatePhoto} className="flex-1 w-full space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Profile Photo Upload & URL</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={photoUrlInput}
                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                        placeholder="Paste image URL or select a file..."
                        className="flex-1 w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                      />
                      <input
                        type="file"
                        id="profile-photo-upload"
                        accept="image/*"
                        onChange={handleProfileFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-photo-upload"
                        className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#DDEFD9] border border-[#5C8D4E]/40 text-[#1F5E3B] text-xs font-black hover:bg-[#5C8D4E] hover:text-white transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-bold text-[#4A5568] self-center">Presets:</span>
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
                    ].map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={async () => {
                          setPhotoUrlInput(presetUrl);
                          setProfileForm((prev) => ({ ...prev, avatar: presetUrl }));
                          await updateProfile({ avatar: presetUrl, profileImage: presetUrl, profilePhoto: presetUrl, hasCustomPhoto: true });
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#F8FAF7] border border-[#D7E6D5] text-[10px] font-bold text-[#1F5E3B] hover:bg-[#DDEFD9]"
                      >
                        Avatar {idx + 1}
                      </button>
                    ))}
                  </div>

                  <Button type="submit" variant="primary" size="sm" icon={Upload}>
                    Save Profile Photo to MongoDB
                  </Button>
                </form>
              </div>
            </div>

            {/* SECTION 2: EDIT PROFILE & ROLE DETAILS */}
            <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#D7E6D5]">
                <User className="w-5 h-5 text-[#1F5E3B]" />
                <h3 className="text-base font-extrabold text-[#17331F]">Profile & Account Details</h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Username (@handle)</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="e.g. suresh_planter"
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Account Role</label>
                    <select
                      value={profileForm.role}
                      onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] bg-white focus:outline-none focus:border-[#1F5E3B] font-bold"
                    >
                      <option value="Farmer">Farmer / Cardamom Cultivator</option>
                      <option value="Supervisor">Plantation Supervisor</option>
                      <option value="Expert">Agronomist / Specialist</option>
                      <option value="Labor Contractor">Labor Contractor</option>
                      <option value="Buyer">Cardamom Buyer / Trader</option>
                      <option value="Investor">Plantation Investor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">District / Place *</label>
                    <select
                      value={KERALA_DISTRICTS.includes(profileForm.district) ? profileForm.district : (profileForm.district === 'Other' || profileForm.district ? (KERALA_DISTRICTS.includes(profileForm.district) ? profileForm.district : 'Other') : 'Idukki, Kerala')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setProfileForm({ ...profileForm, district: 'Other', location: 'Other' });
                        } else {
                          setProfileForm({ ...profileForm, district: val, location: val });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B] cursor-pointer"
                    >
                      {KERALA_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                    {(profileForm.district === 'Other' || (!KERALA_DISTRICTS.includes(profileForm.district) && profileForm.district !== 'Idukki, Kerala')) && (
                      <input
                        type="text"
                        placeholder="Type your specific district or location"
                        value={profileForm.district === 'Other' ? '' : profileForm.district}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfileForm({ ...profileForm, district: val || 'Other', location: val || 'Other' });
                        }}
                        className="w-full mt-2 p-2.5 rounded-xl text-xs bg-white border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Mobile Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 94470 12345"
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Cover Photo URL</label>
                    <input
                      type="text"
                      value={profileForm.coverImage}
                      onChange={(e) => setProfileForm({ ...profileForm, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17331F] mb-1">Personal Bio</label>
                  <textarea
                    rows="2"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Brief description about your plantation background..."
                    className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] resize-none focus:outline-none focus:border-[#1F5E3B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D7E6D5]">
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Cultivation Experience</label>
                    <input
                      type="text"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      placeholder="e.g. 12 Years Cardamom & Spice Cultivation"
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Skills & Techniques (comma separated)</label>
                    <input
                      type="text"
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      placeholder="Organic Farming, Drip Irrigation, Azhukal Prevention"
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Certifications (comma separated)</label>
                    <input
                      type="text"
                      value={profileForm.certifications}
                      onChange={(e) => setProfileForm({ ...profileForm, certifications: e.target.value })}
                      placeholder="Spices Board India Certified, Organic Specialist"
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Education / Qualifications</label>
                    <input
                      type="text"
                      value={profileForm.education}
                      onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                      placeholder="e.g. B.Sc. Agriculture / Horticulture"
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#17331F] mb-1">Organization / Society</label>
                    <input
                      type="text"
                      value={profileForm.organization}
                      onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                      placeholder="e.g. Cardamom Growers Association, Idukki"
                      className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="sm">
                  Save Profile Details to MongoDB Atlas
                </Button>
              </form>
            </div>

            {/* SECTION 3: CHANGE PASSWORD */}
            <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#D7E6D5]">
                <Lock className="w-5 h-5 text-[#1F5E3B]" />
                <h3 className="text-base font-extrabold text-[#17331F]">Security & Change Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-[#17331F] mb-1">Current Password *</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full p-2.5 rounded-xl text-xs border ${passwordErrors.currentPassword ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17331F] mb-1">New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full p-2.5 rounded-xl text-xs border ${passwordErrors.newPassword ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17331F] mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full p-2.5 rounded-xl text-xs border ${passwordErrors.confirmNewPassword ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`}
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{passwordErrors.confirmNewPassword}</p>
                  )}
                </div>

                <Button type="submit" variant="primary" size="sm" icon={Key}>
                  Update Password
                </Button>
              </form>
            </div>

            {/* SECTION 4: PREFERENCES & TOGGLES */}
            <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#D7E6D5]">
                <Bell className="w-5 h-5 text-[#1F5E3B]" />
                <h3 className="text-base font-extrabold text-[#17331F]">App Preferences & Customization</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <div>
                    <p className="text-xs font-extrabold text-[#17331F]">Interface Language</p>
                    <p className="text-[11px] text-[#4A5568]">Switch between English and Malayalam (മലയാളം)</p>
                  </div>
                  <button
                    onClick={toggleLang}
                    className="px-3.5 py-1.5 rounded-full bg-[#1F5E3B] text-white font-extrabold text-xs"
                  >
                    {lang === 'en' ? 'English (EN)' : 'മലയാളം (ML)'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                  <div>
                    <p className="text-xs font-extrabold text-[#17331F]">Dark Theme Mode</p>
                    <p className="text-[11px] text-[#4A5568]">Toggle high-contrast dark green display theme</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs transition-colors ${darkMode ? 'bg-amber-500 text-white' : 'bg-emerald-800 text-white'}`}
                  >
                    {darkMode ? '🌙 Dark Active' : '☀️ Light Active'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* FULL-SCREEN EDIT PROFILE MODAL */}
      <FullScreenFormModal
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        title="Edit Planter Profile"
        subtitle="Update your personal details, profile picture, location, and bio across Cardora"
        badge="Planter Account"
        submitText="Save Changes to Atlas"
        onSubmit={handleSaveProfile}
        renderRightPanel={() => (
          <div className="space-y-6 font-sans">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                Live Profile Card
              </span>
              <h4 className="text-base font-black text-white mt-2 font-poppins">How others see you</h4>
              <p className="text-xs text-slate-400 mt-1">This is your public planter identity across community & marketplace.</p>
            </div>

            {/* LIVE USER CARD PREVIEW */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={photoUrlInput || profileForm.avatar || (user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.fullName || user?.fullName || 'Planter')}&background=1F5E3B&color=ffffff`}
                    alt="Profile Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 border-2 border-slate-800">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-white truncate font-poppins">
                    {profileForm.fullName || user?.fullName || 'Planter Name'}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-400 truncate">
                    @{profileForm.username || user?.username || 'planter'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <Shield className="w-3 h-3" />
                      {user?.role || 'Cardamom Planter'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <MapPin className="w-3 h-3" />
                      {profileForm.district || 'Idukki, Kerala'}
                    </span>
                  </div>
                </div>
              </div>

              {profileForm.bio ? (
                <p className="text-xs text-slate-300 italic bg-slate-900/50 p-3 rounded-xl border border-slate-700/40 leading-relaxed">
                  "{profileForm.bio}"
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
                  No bio added yet. Tell other cardamom planters about your experience!
                </p>
              )}

              <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> MongoDB Atlas Synced
                </span>
                <span className="font-semibold text-slate-400">Cardora Verified</span>
              </div>
            </div>

            <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-800/40 text-xs text-emerald-200/90 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-emerald-300 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Planter Privacy Assurance
              </p>
              Your contact info is kept private. Only your display name, district, and bio are shown on public marketplace listings.
            </div>
          </div>
        )}
      >
        <div className="space-y-6 font-sans">
          {/* PERSONAL DETAILS CARD */}
          <div className="bg-white rounded-2xl p-6 border border-[#D7E6D5] shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-[#17331F] font-poppins flex items-center gap-2">
              <User className="w-5 h-5 text-[#1F5E3B]" /> Member Identity & Contact
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                placeholder="e.g. Kurian Joseph"
                className={`w-full p-3 rounded-xl text-xs font-medium border ${profileErrors.fullName ? 'border-red-400 bg-red-50 text-red-900' : 'border-[#D7E6D5] bg-[#F8FAF7] text-[#17331F]'} focus:outline-none focus:border-[#1F5E3B]`}
              />
              {profileErrors.fullName && <p className="text-[11px] text-red-600 font-bold mt-1">{profileErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17331F] mb-1.5">Profile Photo / Avatar</label>
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={photoUrlInput || profileForm.avatar || (user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#1F5E3B] shadow-xs"
                />
                <div>
                  <input
                    type="file"
                    id="modal-profile-photo"
                    accept="image/*"
                    onChange={handleProfileFileChange}
                    className="hidden"
                  />
                  <label htmlFor="modal-profile-photo" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DDEFD9] border border-[#5C8D4E]/40 text-[#1F5E3B] text-xs font-bold hover:bg-[#5C8D4E] hover:text-white transition-all shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload New Photo</span>
                  </label>
                  <p className="text-[11px] text-[#4A5568] mt-1">PNG or JPG up to 5MB</p>
                </div>
              </div>
              <input
                type="text"
                value={photoUrlInput || profileForm.avatar || ''}
                onChange={(e) => {
                  setPhotoUrlInput(e.target.value);
                  setProfileForm({ ...profileForm, avatar: e.target.value });
                }}
                placeholder="Or paste image URL directly (https://...)"
                className="w-full p-3 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
              />
            </div>
          </div>

          {/* LOCATION & BIO CARD */}
          <div className="bg-white rounded-2xl p-6 border border-[#D7E6D5] shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-[#17331F] font-poppins flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1F5E3B]" /> Location & Planter Bio
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                District / Place <span className="text-red-500">*</span>
              </label>
              <select
                value={KERALA_DISTRICTS.includes(profileForm.district) ? profileForm.district : (profileForm.district === 'Other' || profileForm.district ? (KERALA_DISTRICTS.includes(profileForm.district) ? profileForm.district : 'Other') : 'Idukki, Kerala')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setProfileForm({ ...profileForm, district: 'Other', location: 'Other' });
                  } else {
                    setProfileForm({ ...profileForm, district: val, location: val });
                  }
                }}
                className={`w-full p-3 rounded-xl text-xs font-bold bg-[#F8FAF7] border cursor-pointer text-[#17331F] ${profileErrors.district ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'} focus:outline-none focus:border-[#1F5E3B]`}
              >
                {KERALA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              {(profileForm.district === 'Other' || (!KERALA_DISTRICTS.includes(profileForm.district) && profileForm.district !== 'Idukki, Kerala')) && (
                <input
                  type="text"
                  placeholder="Type your specific district or location"
                  value={profileForm.district === 'Other' ? '' : profileForm.district}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfileForm({ ...profileForm, district: val || 'Other', location: val || 'Other' });
                  }}
                  className="w-full mt-2.5 p-3 rounded-xl text-xs font-medium bg-white border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                />
              )}
              {profileErrors.district && <p className="text-[11px] text-red-600 font-bold mt-1">{profileErrors.district}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17331F] mb-1.5">Planter Bio & Experience</label>
              <textarea
                rows="4"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Share your cardamom farming journey, acreage, or variety specialties..."
                className="w-full p-3 rounded-xl text-xs font-medium border border-[#D7E6D5] bg-[#F8FAF7] text-[#17331F] focus:outline-none focus:border-[#1F5E3B] resize-none"
              />
            </div>
          </div>
        </div>
      </FullScreenFormModal>


      {/* PUBLIC USER PROFILE SYSTEM MODAL (Instagram/LinkedIn Style) */}
      <PublicProfileModal
        username={selectedPublicUser?.username || selectedPublicUser?.author}
        userId={selectedPublicUser?._id || selectedPublicUser?.id}
        isOpen={Boolean(selectedPublicUser)}
        onClose={() => setSelectedPublicUser(null)}
        onOpenChat={(targetUser) => {
          setChatTargetUser(targetUser);
          setChatModalOpen(true);
        }}
        onToast={showToast}
      />

      {/* REAL-TIME 1-TO-1 MESSAGING DRAWER MODAL */}
      <ChatDrawerModal
        targetUser={chatTargetUser}
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        onToast={showToast}
      />

      {/* ADD PLANTATION MODAL */}
      <AddPlantationModal
        isOpen={newPlantationModalOpen}
        onClose={() => setNewPlantationModalOpen(false)}
        onSave={async (newPlantation) => {
          const res = await apiService.createPlantation(newPlantation);
          if (res && res.success) {
            fetchPlantations();
            setNewPlantationModalOpen(false);
            showToast('Plantation registered & saved to MongoDB Atlas!');
          } else {
            showToast(res?.message || 'Plantation saved!');
            fetchPlantations();
            setNewPlantationModalOpen(false);
          }
        }}
      />

      <Footer className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-64'}`} />
    </div>
  );
};

export default Dashboard;
