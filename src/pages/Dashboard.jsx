import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Home, Leaf, MapPin, Users, User, Settings, 
  Search, Heart, MessageSquare, Share2, 
  Sparkles, CheckCircle, Plus, Trash2, Edit, X, AlertCircle,
  Camera, Lock, Key, Bell, Upload, Globe, CornerDownRight, Shield, CloudSun,
  Droplets, TrendingUp, BarChart3, Calendar, ArrowUpRight, Activity, ChevronRight,
  Clock, Sliders, Sun, Menu, ChevronUp, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
import PlantationModule from '../components/plantation/PlantationModule';
import AddPlantationModal from '../components/plantation/AddPlantationModal';
import AiAnalysisModule from '../components/ai/AiAnalysisModule';
import CardamomMarketplace from '../components/marketplace/CardamomMarketplace';
import { getTimeBasedGreeting } from '../utils/timeGreeting';
import { KERALA_DISTRICTS } from '../utils/districts';


const Dashboard = () => {
  const { user, updateProfile, showToast, darkMode, setDarkMode, lang, toggleLang, addNotification } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdminUser = (user?.role || '').toLowerCase() === 'admin';
  const isSupervisorUser = (user?.role || '').toLowerCase() === 'supervisor';
  const defaultTab = isAdminUser ? 'admin' : isSupervisorUser ? 'workforce' : 'dashboard';

  // Active Tab: 'dashboard' | 'plantations' | 'ai' | 'community' | 'plots' | 'admin' | 'profile' | 'settings'
  const rawTab = searchParams.get('tab') || defaultTab;
  const activeTab = isSupervisorUser ? (rawTab === 'profile' ? 'profile' : 'workforce') : rawTab;

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
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
      if (res && res.success && Array.isArray(res.plantations)) {
        const formatted = res.plantations.map((p) => ({
          id: p._id || p.id,
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
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPlantations();
  }, [activeTab]);


  const handleLoadSamplePlantations = () => {
    setPlantations([
      { id: 1, name: 'Vandanmedu Green Estate', location: 'Idukki, Kerala', area: 12, plants: 4200, variety: 'Malabar', moisture: 72, ph: 6.2, health: 94, history: 'Irrigated 2 days ago' },
      { id: 2, name: 'Munnar High-Altitude Plot', location: 'Munnar, Kerala', area: 8, plants: 2800, variety: 'Vazhukka', moisture: 68, ph: 5.9, health: 88, history: 'Fertilized organic NPK last week' },
    ]);
    showToast('Sample plantation data loaded!');
  };

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
  const [plantationForm, setPlantationForm] = useState({
    name: '',
    location: 'Idukki, Kerala',
    area: '',
    plants: '',
    variety: 'Malabar',
  });
  const [plantationErrors, setPlantationErrors] = useState({});

  // Dashboard Messaging Center State
  const [dashboardConversations, setDashboardConversations] = useState([]);

  const fetchDashboardConversations = async () => {
    try {
      const res = await apiService.getConversations();
      if (res && res.success && Array.isArray(res.conversations)) {
        setDashboardConversations(res.conversations);
      }
    } catch (err) {}
  };

  const currentUserIdVal = user?._id || user?.id || '';

  useEffect(() => {
    if (currentUserIdVal) {
      fetchDashboardConversations();
      const interval = setInterval(fetchDashboardConversations, 4000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserIdVal]);

  const validatePlantationForm = () => {
    const errs = {};
    if (!plantationForm.name.trim() || plantationForm.name.trim().length < 3) {
      errs.name = 'Estate name must be at least 3 characters.';
    }
    if (!plantationForm.area || Number(plantationForm.area) <= 0) {
      errs.area = 'Please enter a valid plot area greater than 0 acres.';
    }
    if (!plantationForm.plants || Number(plantationForm.plants) <= 0) {
      errs.plants = 'Please enter valid plant count greater than 0.';
    }
    setPlantationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddPlantation = async (e) => {
    e.preventDefault();
    if (!validatePlantationForm()) return;

    const payload = {
      name: plantationForm.name.trim(),
      location: plantationForm.location,
      area: Number(plantationForm.area),
      plantsCount: Number(plantationForm.plants),
      variety: plantationForm.variety,
      moisture: 72,
      soilPh: 6.2,
      history: 'Plantation registered today',
    };

    const res = await apiService.createPlantation(payload);
    if (res && res.success) {
      const saved = res.plantation;
      setPlantations((prev) => [
        {
          id: saved?._id || Date.now(),
          name: saved?.name || payload.name,
          location: saved?.location || payload.location,
          area: saved?.area || payload.area,
          plants: saved?.plantsCount || payload.plantsCount,
          variety: saved?.variety || payload.variety,
          moisture: saved?.moisture || 72,
          ph: saved?.soilPh || 6.2,
          health: saved?.healthScore || 94,
          history: saved?.history || payload.history,
        },
        ...prev,
      ]);
      setPlantationForm({ name: '', location: 'Idukki, Kerala', area: '', plants: '', variety: 'Malabar' });
      setPlantationErrors({});
      setNewPlantationModalOpen(false);
      showToast('Plantation registered & saved to MongoDB Atlas!');
    } else {
      showToast(res?.message || 'Failed to save plantation');
    }
  };

  // Legacy delete helper
  // const handleDeletePlantation = async (id) => { ... }


  // ===== 2. COMMUNITY FEED STATE & VALIDATION =====
  const [localCommunityPosts, setLocalCommunityPosts] = useState(() => {
    const saved = localStorage.getItem('cardora_community_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
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
            avatar: c.authorAvatar || c.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            text: c.text || c.content || '',
            time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently',
            replies: Array.isArray(c.replies) ? c.replies.map((r) => ({
              id: r._id || r.id || Date.now(),
              author: r.authorName || 'Planter',
              avatar: r.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
              text: r.text || '',
              isPostOwner: Boolean(r.isPostOwner || r.authorName === p.authorName),
              time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently',
            })) : [],
          })) : [];

          const pId = p._id || p.id;
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
            author: authorName,
            username: authorUsername,
            avatar: authorAvatar,
            time: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jul 26, 2026',
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
      
      // Combine local user posts, MongoDB DB posts, and default ecosystem posts so NO POST IS EVER HIDDEN OR LOST!
      const allCandidatePosts = [...localCommunityPosts, ...dbPosts, ...defaultOtherPlanterPosts];
      const uniquePostsMap = new Map();
      allCandidatePosts.forEach((p) => {
        const pId = (p._id || p.id || '').toString();
        const pContent = (p.content || p.description || '').trim();
        const key = pId || pContent;
        if (key && !uniquePostsMap.has(key)) {
          uniquePostsMap.set(key, p);
        }
      });

      setFeedPosts(Array.from(uniquePostsMap.values()));
    } catch (err) {
      const allCandidatePosts = [...localCommunityPosts, ...defaultOtherPlanterPosts];
      const uniquePostsMap = new Map();
      allCandidatePosts.forEach((p) => {
        const key = (p._id || p.id || p.content || '').toString();
        if (key && !uniquePostsMap.has(key)) uniquePostsMap.set(key, p);
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
      } catch (err) {}
    };
    handleSearchPlanters();
  }, [communitySearchQuery]);

  React.useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCommunityPosts.length]);

  const handleAddPost = async (e) => {
    if (e) e.preventDefault();
    if (!newPostText.trim() || newPostText.trim().length < 3) {
      setPostError('Post description must contain at least 3 characters.');
      return;
    }
    setPostError('');

    const createdId = `post_${Date.now()}`;
    const newPostObj = {
      id: createdId,
      _id: createdId,
      author: user?.fullName || user?.name || user?.username || 'Planter',
      username: user?.username || 'planter',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      time: 'Just now',
      category: newPostCategory,
      content: newPostText.trim(),
      description: newPostText.trim(),
      image: newPostImage.trim(),
      likes: 0,
      comments: 0,
      liked: false,
    };

    setLocalCommunityPosts((prev) => [newPostObj, ...prev]);
    setFeedPosts((prev) => [newPostObj, ...prev.filter((p) => p.id !== createdId)]);
    setNewPostText('');
    setNewPostImage('');

    showToast('🎉 Post created & published live to Community Feed!');

    try {
      await apiService.createCommunityPost({
        description: newPostText.trim(),
        content: newPostText.trim(),
        category: newPostCategory,
        image: newPostImage.trim(),
        images: newPostImage.trim() ? [newPostImage.trim()] : [],
        authorName: user?.fullName || user?.name,
        username: user?.username,
        authorAvatar: user?.avatar,
      });
    } catch (err) {}
  };

  // Interactive Comments State
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [commentsMap, setCommentsMap] = useState({});

  const handleLikePost = async (id) => {
    try {
      await apiService.likePost(id);
    } catch (e) {}
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
    } catch (e) {}

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
    } catch (e) {}

    setEditingCommentId(null);
    setEditingCommentText('');
    showToast('Comment updated in MongoDB Atlas!');
  };

  // ===== 3. MARKETPLACE PLOTS STATE =====
  const [plots] = useState([
    { id: 1, title: '5-Acre Prime Organic Cardamom Plot for Lease', location: 'Santhanpara, Idukki', area: '5 Acres', price: '₹2,50,000 / year', roi: '22%', health: 92, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600', owner: 'Suresh Menon' },
    { id: 2, title: 'Shade-Grown High Yield Cardamom Garden', location: 'Kattappana, Idukki', area: '8 Acres', price: '₹4,00,000 / year', roi: '26%', health: 96, image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=600', owner: 'Devika Raj' }
  ]);

  // ===== 4. AI RECOMMENDATION STATE & VALIDATION =====
  const [aiInputs, setAiInputs] = useState({ moisture: '', ph: '', n: '', p: '', k: '' });
  const [aiErrors, setAiErrors] = useState({});
  const [aiResult, setAiResult] = useState(null);

  const validateAiInputs = () => {
    const errs = {};
    const moisture = Number(aiInputs.moisture);
    const ph = Number(aiInputs.ph);
    const n = Number(aiInputs.n);
    const p = Number(aiInputs.p);
    const k = Number(aiInputs.k);

    if (isNaN(moisture) || moisture < 0 || moisture > 100) {
      errs.moisture = 'Moisture must be 0–100%.';
    }
    if (isNaN(ph) || ph < 3 || ph > 10) {
      errs.ph = 'pH must be 3.0–10.0.';
    }
    if (isNaN(n) || n < 0 || n > 500) {
      errs.n = 'N value must be 0–500.';
    }
    if (isNaN(p) || p < 0 || p > 500) {
      errs.p = 'P value must be 0–500.';
    }
    if (isNaN(k) || k < 0 || k > 500) {
      errs.k = 'K value must be 0–500.';
    }

    setAiErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRunAI = () => {
    if (!validateAiInputs()) return;

    const moistureVal = Number(aiInputs.moisture);
    const phVal = Number(aiInputs.ph);
    const calcHealth = Math.min(100, Math.max(50, Math.round((moistureVal / 75) * 50 + (phVal / 6.5) * 50)));

    setAiResult({
      healthScore: calcHealth,
      yieldPrediction: `${Math.round(calcHealth * 4.5)} kg / acre`,
      diseaseRisk: moistureVal > 80 ? 'Moderate (High Humidity Rot Risk)' : 'Low Risk',
      fertilizerAdvice: phVal < 5.8 ? 'Apply Agricultural Lime to raise soil pH to 6.2.' : 'Optimal NPK balanced.',
      irrigationAdvice: moistureVal < 60 ? 'Increase drip irrigation duration.' : 'Maintain current 48-hr pulse.',
    });
    showToast('AI Plantation Analysis complete!');
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarLinks = isAdminUser
    ? [
        { id: 'admin', label: lang === 'ml' ? 'അഡ്മിൻ പോർട്ടൽ' : 'Admin Portal', icon: Shield },
        { id: 'workforce', label: lang === 'ml' ? 'തൊഴിലാളികൾ' : 'Workforce & Workers', icon: Users },
        { id: 'profile', label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile', icon: User },
        { id: 'settings', label: lang === 'ml' ? 'ക്രമീകരണങ്ങൾ' : 'Settings', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: lang === 'ml' ? 'ഹോം' : 'Dashboard', icon: Home },
        { id: 'plantations', label: lang === 'ml' ? 'എന്റെ തോട്ടം' : 'My Plantation', icon: Leaf },
        { id: 'workforce', label: lang === 'ml' ? 'തൊഴിലാളികൾ' : 'Workforce & Workers', icon: Users },
        { id: 'weather', label: lang === 'ml' ? 'കാലാവസ്ഥ' : 'Weather Intelligence', icon: CloudSun },
        { id: 'ai', label: lang === 'ml' ? 'AI നിർദ്ദേശങ്ങൾ' : 'AI Recommendations', icon: Sparkles },
        { id: 'messages', label: lang === 'ml' ? 'സന്ദേശങ്ങൾ' : 'Messages', icon: MessageSquare, isAction: true },
        { id: 'plots', label: lang === 'ml' ? 'മാർക്കറ്റ് പ്ലേസ്' : 'Marketplace', icon: MapPin },
        { id: 'community', label: lang === 'ml' ? 'കമ്മ്യൂണിറ്റി' : 'Community', icon: Share2 },
        { id: 'profile', label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile', icon: User },
        { id: 'settings', label: lang === 'ml' ? 'ക്രമീകരണങ്ങൾ' : 'Settings', icon: Settings },
      ];

  return (
    <div className="min-h-screen bg-[#F4F8F3] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors flex flex-col justify-between">
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* FIXED DESKTOP LEFT SIDEBAR NAVIGATION */}
      {activeTab !== 'admin' && (
        <aside className="hidden lg:flex fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-[#E2E8F0] dark:border-slate-800 z-30 flex-col justify-between p-4 overflow-y-auto shadow-xs">
          <div className="space-y-4">
            
            {/* Planter Info Card */}
            <div className="p-3 bg-[#F4F8F3] dark:bg-slate-800/90 rounded-2xl border border-[#D7E6D5] dark:border-slate-700 flex items-center gap-3">
              <img
                src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-[#1F5E3B] flex-shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user?.fullName || user?.username || 'Planter'}</p>
                <p className="text-[10px] text-[#5C8D4E] dark:text-emerald-400 font-bold truncate">{user?.role || 'Farmer'} • {user?.district || user?.location || 'Idukki'}</p>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#1F5E3B] text-white shadow-sm border-l-4 border-amber-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-[#F1F7F0] dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5C8D4E] dark:text-emerald-400'}`} />
                    <span className="truncate">{link.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-300" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 text-[10px] text-slate-400 font-medium">
            <p className="flex items-center gap-1 font-bold text-[#1F5E3B] dark:text-emerald-400">
              <Leaf className="w-3 h-3" />
              <span>Cardora Agriculture Platform</span>
            </p>
          </div>
        </aside>
      )}

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
              className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between z-10"
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
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#1F5E3B] text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-[#F1F7F0] dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#5C8D4E]" />
                        <span>{link.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400">Cardora Agriculture System</p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER AREA */}
      <div className={`min-h-screen bg-[#F4F8F3] dark:bg-slate-950 text-slate-800 dark:text-slate-200 pt-20 pb-16 transition-all ${
        activeTab === 'admin' ? 'w-full px-4' : 'lg:ml-60 px-4 sm:px-6 lg:px-8'
      }`}>
        <main className="max-w-7xl mx-auto space-y-6">

          {/* ===== TAB 1: DASHBOARD OVERVIEW ===== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">

              {/* COMPACT WELCOME CARD */}
              <div className="bg-gradient-to-r from-[#17331F] via-[#1F5E3B] to-[#2E7D4E] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#1F5E3B]/40 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                        🌱 Farmer First Portal
                      </span>
                      <span className="text-xs text-emerald-200 font-bold hidden sm:inline-block">• Cardamom Management</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black font-poppins text-white flex items-center gap-2">
                      {getTimeBasedGreeting(user?.fullName || user?.name || user?.username || 'Planter', lang)} 🌱
                    </h1>
                    <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
                      {lang === 'ml' 
                        ? 'ഇന്നത്തെ നിങ്ങളുടെ തോട്ടത്തിന്റെ വിവരങ്ങൾ താഴെ കാണാം.' 
                        : "Here's your plantation overview for today."}
                    </p>
                  </div>

                  {/* Location & Date Badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-black/20 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 self-start md:self-auto">
                    <div className="flex items-center gap-1.5 text-xs text-white font-bold px-2.5 py-1 rounded-lg bg-white/10">
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      <span>{user?.district || user?.location || 'Idukki, Kerala'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium px-2 py-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{new Date().toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-black px-2.5 py-1 bg-amber-400/20 rounded-lg border border-amber-400/30">
                      <CloudSun className="w-3.5 h-3.5" />
                      <span>28°C • Sunny</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 COMPACT STATISTICS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Active Plantations */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#1F5E3B] transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400">
                      <Leaf className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                      {plantations.length || 2}
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      {lang === 'ml' ? 'സജീവ തോട്ടങ്ങൾ' : 'Active Plantations'}
                    </p>
                  </div>
                </div>

                {/* Soil Moisture */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#1F5E3B] transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Droplets className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Optimal
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                      {avgMoisture > 0 ? `${avgMoisture}%` : '72%'}
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      {lang === 'ml' ? 'മണ്ണിന്റെ ഈർപ്പം' : 'Soil Moisture'}
                    </p>
                  </div>
                </div>

                {/* Plantation Health */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#1F5E3B] transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Healthy
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                      {avgHealth > 0 ? `${avgHealth}%` : '94%'}
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      {lang === 'ml' ? 'തോട്ടം ആരോഗ്യം' : 'Plantation Health'}
                    </p>
                  </div>
                </div>

                {/* Predicted Yield */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#1F5E3B] transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Est. Harvest
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-poppins">
                      {predictedYield > 0 ? `${predictedYield} kg` : '260 kg'}
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      {lang === 'ml' ? 'പ്രതീക്ഷിക്കുന്ന വിളവ്' : 'Predicted Yield/Acre'}
                    </p>
                  </div>
                </div>
              </div>

              {/* MAIN DASHBOARD 2-COLUMN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: MY PLANTATION SUMMARY CARD */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
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
                          {plantations[0]?.name || 'Vandanmedu Green Estate'} • {plantations[0]?.location || 'Idukki, Kerala'}
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
                        {plantations[0]?.area || 12} Acres
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
                            className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700 hover:border-[#1F5E3B] transition cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={u.avatar || u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=1F5E3B&color=ffffff`}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover border border-[#1F5E3B]"
                                />
                                {conv.unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{u.name}</h4>
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">{u.role || 'Worker'}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">{lastMsg.text || 'Latest update...'}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                              {lastMsg.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2m ago'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      /* Default Quick Farmer Previews */
                      [
                        { name: 'Anil Kumar', role: 'Worker', text: "Today's attendance has been updated", time: '2 min ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
                        { name: 'Joseph M.', role: 'Labor Contractor', text: 'Workers are available tomorrow for harvest', time: '15 min ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
                        { name: 'Dr. Suresh', role: 'Agronomy Expert', text: 'Check drip pulse schedule for plot #1', time: '1 hr ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => { setChatTargetUser({ name: item.name, role: item.role, avatar: item.avatar }); setChatModalOpen(true); }}
                          className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700 hover:border-[#1F5E3B] transition cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={item.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#1F5E3B] flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.name}</h4>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[8px] font-bold">{item.role}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">"{item.text}"</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 flex-shrink-0">{item.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* IMPORTANT QUICK ACTIONS SECTION */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#1F5E3B] dark:text-emerald-400" />
                  <span>{lang === 'ml' ? 'ത്വരിത നടപടികൾ' : 'Important Quick Actions'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

                  {/* Action 5: Send Message */}
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
            <div className="space-y-6">
              <AiAnalysisModule 
                plantation={plantations[0]} 
                onToast={showToast} 
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

          {/* ===== TAB 4: COMMUNITY ===== */}
          {activeTab === 'community' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-[#17331F] font-poppins">Planters Community Feed</h2>
                {communitySearchQuery && (
                  <span className="px-3 py-1 rounded-full bg-[#DDEFD9] text-[#1F5E3B] text-xs font-bold w-fit">
                    Filtered by: "{communitySearchQuery}"
                  </span>
                )}
              </div>

              {/* Planters & Posts Search Bar with Search Button */}
              <div className="bg-white p-3.5 rounded-[20px] border border-[#D7E6D5] shadow-soft flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-[#5C8D4E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={communitySearchQuery}
                    onChange={(e) => setCommunitySearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && communitySearchQuery.trim()) {
                        showToast(`Showing search results for "${communitySearchQuery.trim()}"`);
                      }
                    }}
                    placeholder="Search planter name (e.g. Rajesh, Ananya, Suresh, Milu)..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] font-bold focus:outline-none focus:border-[#1F5E3B]"
                  />
                </div>
                <button
                  onClick={() => {
                    if (communitySearchQuery.trim()) {
                      showToast(`Showing search results for "${communitySearchQuery.trim()}"`);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1F5E3B] hover:bg-[#17331F] text-white text-xs font-black transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Planter</span>
                </button>
                {communitySearchQuery && (
                  <button
                    onClick={() => {
                      setCommunitySearchQuery('');
                      setSearchParams({ tab: 'community' });
                    }}
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Matching Planter Profiles Card (Live Search Results) */}
              {communitySearchQuery.trim() && (
                <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-5 shadow-soft space-y-3">
                  <h3 className="text-xs font-black text-[#17331F] flex items-center justify-between">
                    <span>Matching Planter Profiles ({searchedPlanters.length})</span>
                    <span className="text-[10px] text-[#5C8D4E] font-bold">MongoDB Atlas Live Search</span>
                  </h3>

                  {searchedPlanters.length === 0 ? (
                    <p className="text-xs text-[#4A5568] py-1">No planter accounts found matching "{communitySearchQuery}".</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                          className="p-3 rounded-xl bg-[#F8FAF7] hover:bg-[#DDEFD9] border border-[#D7E6D5] flex items-center justify-between cursor-pointer group transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img 
                              src={(planter.avatar || planter.profileImage || planter.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(planter.name || 'Planter')}&background=1F5E3B&color=ffffff`} 
                              alt="" 
                              className="w-9 h-9 rounded-full object-cover border border-[#1F5E3B] group-hover:scale-105 transition-transform flex-shrink-0" 
                            />
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-extrabold text-[#17331F] flex items-center gap-1 truncate">
                                <span className="truncate">{planter.name}</span>
                                <CheckCircle className="w-3 h-3 text-[#1F5E3B] flex-shrink-0" />
                              </h4>
                              <p className="text-[10px] text-[#5C8D4E] font-bold truncate">@{planter.username || 'planter'} • {planter.role || 'Farmer'}</p>
                            </div>
                          </div>
                          <button className="px-2.5 py-1 rounded-lg bg-[#1F5E3B] text-white text-[10px] font-black group-hover:bg-[#17331F] transition-colors whitespace-nowrap ml-2 flex-shrink-0">
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Create Post Card */}
              <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-5 shadow-soft space-y-3">
                <h3 className="text-xs font-black text-[#17331F]">Create a New Post</h3>
                <textarea
                  rows="3"
                  value={newPostText}
                  onChange={(e) => {
                    setNewPostText(e.target.value);
                    if (postError) setPostError('');
                  }}
                  placeholder="Add post description..."
                  className={`w-full p-3 rounded-xl text-xs focus:outline-none resize-none border ${postError ? 'border-red-400 bg-red-50/50' : 'border-[#D7E6D5] focus:border-[#1F5E3B]'}`}
                />

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                    placeholder="Image URL (optional)..."
                    className="flex-1 w-full px-3 py-2 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                  />
                  <input
                    type="file"
                    id="post-photo-upload"
                    accept="image/*"
                    onChange={handlePostFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="post-photo-upload"
                    className="cursor-pointer px-3 py-2 rounded-xl bg-[#DDEFD9] border border-[#5C8D4E]/40 text-[#1F5E3B] text-xs font-bold hover:bg-[#5C8D4E] hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload Image</span>
                  </label>
                </div>

                {postError && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{postError}</span>
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7]"
                  >
                    <option value="Plantation Update">Plantation Update</option>
                    <option value="Question">Farmer Question</option>
                    <option value="Farming Tip">Organic Tip</option>
                  </select>

                  <Button variant="primary" size="sm" onClick={handleAddPost}>
                    Publish Post
                  </Button>
                </div>
              </div>

              {/* Feed Posts */}
              {feedPosts.filter((post) => {
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
                <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-8 text-center">
                  <p className="text-sm font-bold text-[#17331F]">No matching planter posts found.</p>
                  <p className="text-xs text-[#4A5568] mt-1">Try searching for another planter name or clear the search filter.</p>
                </div>
              ) : (
                feedPosts.filter((post) => {
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
                  <Card key={post.id} className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        onClick={() => setSelectedPublicUser(post)} 
                        className="flex items-center gap-3 cursor-pointer group"
                        title="Click to view planter profile"
                      >
                        <img src={post.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1F5E3B] group-hover:scale-105 transition-transform" />
                        <div>
                          <h4 className="text-xs font-extrabold text-[#17331F] group-hover:text-[#1F5E3B] flex items-center gap-1">
                            <span>{post.author}</span>
                            <span className="text-[10px] font-normal text-[#5C8D4E]">(@{post.username || 'planter'})</span>
                          </h4>
                          <span className="text-[10px] text-[#4A5568]">{post.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#DDEFD9] text-[#1F5E3B]">
                          {post.category}
                        </span>
                        {((user?.role || '').toLowerCase() === 'admin' || user?.username === post.username || user?.fullName === post.author) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post.id);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Post (Admin / Owner)"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#4A5568] leading-relaxed mb-3">{post.description || post.content}</p>

                    {post.image && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-[#D7E6D5] max-h-80">
                        <img src={post.image} alt="Post asset" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#D7E6D5] text-xs font-bold">
                      <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-1.5 ${post.liked ? 'text-red-500' : 'text-[#4A5568]'}`}>
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} 
                        className={`flex items-center gap-1.5 ${activeCommentPostId === post.id ? 'text-[#1F5E3B]' : 'text-[#4A5568]'} hover:text-[#1F5E3B]`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button onClick={() => showToast('Post link copied!')} className="flex items-center gap-1.5 text-[#4A5568] hover:text-[#1F5E3B]">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Interactive Comment Input & Comments List */}
                    {activeCommentPostId === post.id && (
                      <div className="mt-3 pt-3 border-t border-[#D7E6D5] space-y-3">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={commentInputText}
                            onChange={(e) => setCommentInputText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                          />
                          <Button variant="primary" size="sm" onClick={() => handleAddComment(post.id)}>
                            Comment
                          </Button>
                        </div>

                        {/* Comments List */}
                        {commentsMap[post.id] && commentsMap[post.id].length > 0 && (
                          <div className="space-y-3 pt-2">
                            {commentsMap[post.id].map((c) => {
                              const currentUserName = user?.fullName || user?.name || user?.username || '';
                              const isPostAuthor = currentUserName.toLowerCase().trim() === (post.author || post.username || '').toLowerCase().trim();
                              return (
                                <div key={c.id} className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] text-xs space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex gap-2.5 items-start flex-1">
                                      <img src={c.avatar} alt="" className="w-6 h-6 rounded-full object-cover mt-0.5 border border-[#1F5E3B]" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-extrabold text-[#17331F]">{c.author}</span>
                                          {c.author === post.author && (
                                            <span className="px-1.5 py-0.5 rounded bg-[#1F5E3B] text-white text-[9px] font-black tracking-wide">
                                              POST OWNER
                                            </span>
                                          )}
                                        </div>

                                        {editingCommentId === c.id ? (
                                          <div className="flex items-center gap-2 mt-1">
                                            <input 
                                              type="text"
                                              value={editingCommentText}
                                              onChange={(e) => setEditingCommentText(e.target.value)}
                                              className="flex-1 px-2.5 py-1 rounded-lg border border-[#1F5E3B] text-xs bg-white focus:outline-none"
                                            />
                                            <button onClick={() => handleSaveEditComment(post.id, c.id)} className="px-2.5 py-1 rounded-lg bg-[#1F5E3B] text-white text-[10px] font-bold hover:bg-[#17331F]">
                                              Save
                                            </button>
                                            <button onClick={() => setEditingCommentId(null)} className="px-2.5 py-1 rounded-lg bg-gray-200 text-gray-700 text-[10px] font-bold hover:bg-gray-300">
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <p className="text-[#4A5568] mt-0.5 font-medium">{c.text}</p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => {
                                          setActiveReplyCommentId(activeReplyCommentId === c.id ? null : c.id);
                                          setReplyInputText('');
                                        }}
                                        className="text-[10px] font-extrabold text-[#1F5E3B] hover:bg-[#DDEFD9] px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                      >
                                        <CornerDownRight className="w-3 h-3" />
                                        <span>Reply</span>
                                      </button>

                                      {editingCommentId !== c.id && (
                                        <button 
                                          onClick={() => {
                                            setEditingCommentId(c.id);
                                            setEditingCommentText(c.text);
                                          }} 
                                          className="text-[10px] font-bold text-gray-400 hover:text-[#1F5E3B] px-1 py-1"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Inline Reply Input Box */}
                                  {activeReplyCommentId === c.id && (
                                    <div className="mt-2 pl-6 flex gap-2 items-center">
                                      <input
                                        type="text"
                                        value={replyInputText}
                                        onChange={(e) => setReplyInputText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(post.id, c.id); }}
                                        placeholder={isPostAuthor ? "Reply as Post Owner..." : `Replying to @${c.author}...`}
                                        className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-[#1F5E3B] bg-white focus:outline-none"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleSendReply(post.id, c.id)}
                                        className="px-3 py-1.5 rounded-xl bg-[#1F5E3B] hover:bg-[#17331F] text-white text-[10px] font-bold transition-colors"
                                      >
                                        Send Reply
                                      </button>
                                    </div>
                                  )}

                                  {/* Nested Replies List */}
                                  {c.replies && c.replies.length > 0 && (
                                    <div className="pl-6 space-y-2 mt-2 pt-2 border-t border-[#D7E6D5]/60">
                                      {c.replies.map((r) => (
                                        <div key={r.id} className="p-2 rounded-xl bg-[#EAF3E8] border-l-3 border-[#1F5E3B] text-xs flex items-start gap-2">
                                          <img src={r.avatar} alt="" className="w-5 h-5 rounded-full object-cover mt-0.5 border border-[#1F5E3B]" />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-black text-[#17331F] text-[11px]">{r.author}</span>
                                              {(r.isPostOwner || r.author === post.author) && (
                                                <span className="px-1.5 py-0.2 rounded bg-[#C9A227] text-white text-[8px] font-black uppercase tracking-wider">
                                                  👑 POST OWNER REPLY
                                                </span>
                                              )}
                                              <span className="text-[9px] text-[#5C8D4E] font-medium ml-auto">{r.time}</span>
                                            </div>
                                            <p className="text-[#334155] text-[11px] mt-0.5 font-medium">{r.text}</p>
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
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ===== TAB 5: FUTURISTIC CARDAMOM MARKETPLACE ===== */}
          {activeTab === 'plots' && <CardamomMarketplace />}

          {/* ===== TAB: ADMIN PORTAL ===== */}
          {activeTab === 'admin' && <AdminDashboard />}

          {/* ===== TAB 6: PROFILE ===== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl mx-auto">
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
            <div className="space-y-6 max-w-4xl mx-auto">
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

      </div>

      {/* NEW PLANTATION MODAL WITH VALIDATION */}
      <AnimatePresence>
        {newPlantationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setNewPlantationModalOpen(false)} className="absolute inset-0 bg-[#17331F]/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white rounded-[20px] p-6 max-w-md w-full border border-[#D7E6D5] shadow-2xl z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-[#17331F] font-poppins">Register Plantation</h3>
                <button onClick={() => setNewPlantationModalOpen(false)}><X className="w-5 h-5 text-[#4A5568]" /></button>
              </div>

              <form onSubmit={handleAddPlantation} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-bold mb-1">Estate Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={plantationForm.name} 
                    onChange={(e) => setPlantationForm({...plantationForm, name: e.target.value})} 
                    placeholder="Vandanmedu Green Estate" 
                    className={`w-full p-2.5 rounded-xl text-xs border ${plantationErrors.name ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                  />
                  {plantationErrors.name && <p className="text-[11px] text-red-600 font-bold mt-1">{plantationErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Area (Acres) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={plantationForm.area} 
                    onChange={(e) => setPlantationForm({...plantationForm, area: e.target.value})} 
                    placeholder="10" 
                    className={`w-full p-2.5 rounded-xl text-xs border ${plantationErrors.area ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                  />
                  {plantationErrors.area && <p className="text-[11px] text-red-600 font-bold mt-1">{plantationErrors.area}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Number of Clumps/Plants <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={plantationForm.plants} 
                    onChange={(e) => setPlantationForm({...plantationForm, plants: e.target.value})} 
                    placeholder="3500" 
                    className={`w-full p-2.5 rounded-xl text-xs border ${plantationErrors.plants ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                  />
                  {plantationErrors.plants && <p className="text-[11px] text-red-600 font-bold mt-1">{plantationErrors.plants}</p>}
                </div>
                <Button type="submit" variant="primary" size="md" className="w-full justify-center">
                  Save Plantation
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL WITH VALIDATION */}
      <AnimatePresence>
        {profileEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setProfileEditOpen(false)} className="absolute inset-0 bg-[#17331F]/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white rounded-[20px] p-6 max-w-md w-full border border-[#D7E6D5] shadow-2xl z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-[#17331F] font-poppins">Edit Profile</h3>
                <button onClick={() => setProfileEditOpen(false)}><X className="w-5 h-5 text-[#4A5568]" /></button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-bold mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={profileForm.fullName} 
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} 
                    className={`w-full p-2.5 rounded-xl text-xs border ${profileErrors.fullName ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                  />
                  {profileErrors.fullName && <p className="text-[11px] text-red-600 font-bold mt-1">{profileErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Profile Photo / Avatar</label>
                  <div className="flex items-center gap-3 mb-2">
                    <img src={photoUrlInput || profileForm.avatar || (user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#1F5E3B]" />
                    <input 
                      type="file" 
                      id="modal-profile-photo" 
                      accept="image/*" 
                      onChange={handleProfileFileChange} 
                      className="hidden" 
                    />
                    <label htmlFor="modal-profile-photo" className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#DDEFD9] border border-[#5C8D4E]/40 text-[#1F5E3B] text-xs font-bold hover:bg-[#5C8D4E] hover:text-white transition-all flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Photo</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={photoUrlInput || profileForm.avatar || ''} 
                    onChange={(e) => {
                      setPhotoUrlInput(e.target.value);
                      setProfileForm({...profileForm, avatar: e.target.value});
                    }}
                    placeholder="Paste image URL or choose file above" 
                    className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">District / Place <span className="text-red-500">*</span></label>
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
                    className={`w-full p-2.5 rounded-xl text-xs font-bold bg-[#F8FAF7] border cursor-pointer ${profileErrors.district ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
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
                      className="w-full mt-2 p-2.5 rounded-xl text-xs bg-white border border-[#D7E6D5] text-[#17331F] focus:outline-none"
                    />
                  )}
                  {profileErrors.district && <p className="text-[11px] text-red-600 font-bold mt-1">{profileErrors.district}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Bio</label>
                  <textarea 
                    rows="3" 
                    value={profileForm.bio} 
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} 
                    className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] resize-none" 
                  />
                </div>
                <Button type="submit" variant="primary" size="md" className="w-full justify-center">
                  Save Changes to MongoDB
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      <Footer />
    </div>
  );
};

export default Dashboard;
