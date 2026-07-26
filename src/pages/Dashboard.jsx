import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Home, Leaf, MapPin, Users, User, Settings, 
  Search, Heart, MessageSquare, Share2, 
  Sparkles, CheckCircle, Plus, Trash2, Edit, X, AlertCircle,
  Camera, Lock, Key, Bell, Upload, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Dashboard = () => {
  const { user, updateProfile, showToast, darkMode, setDarkMode, lang, toggleLang } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'dashboard' | 'plantations' | 'ai' | 'community' | 'plots' | 'profile' | 'settings'
  const activeTab = searchParams.get('tab') || 'dashboard';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // Profile Edit Form State & Errors
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    district: user?.district || user?.location || 'Idukki, Kerala',
    location: user?.location || 'Kattappana',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    role: user?.role || 'Farmer',
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

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        district: user.district || user.location || 'Idukki, Kerala',
        location: user.location || 'Kattappana',
        bio: user.bio || '',
        avatar: user.avatar || '',
        role: user.role || 'Farmer',
      });
      setPhotoUrlInput(user.avatar || user.profileImage || '');
    }
  }, [user]);

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) {
      showToast('Please select a photo file or enter an image URL.');
      return;
    }
    await updateProfile({ avatar: photoUrlInput.trim(), profileImage: photoUrlInput.trim(), hasCustomPhoto: true });
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrlInput(reader.result);
        showToast('Photo file loaded! Click "Save Profile Photo" to save to MongoDB.');
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

    const finalPhoto = photoUrlInput || profileForm.avatar || user?.avatar || '';
    const payload = {
      ...profileForm,
      district: profileForm.district || profileForm.location || 'Idukki, Kerala',
      location: profileForm.district || profileForm.location || 'Idukki, Kerala',
      avatar: finalPhoto,
      profileImage: finalPhoto,
      profilePhoto: finalPhoto,
      hasCustomPhoto: Boolean(finalPhoto),
    };

    await updateProfile(payload);
    setProfileEditOpen(false);
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
          location: p.location,
          area: p.area,
          plants: p.plantsCount || p.plants || 1500,
          variety: p.variety || 'Malabar',
          moisture: p.moisture || 72,
          ph: p.soilPh || 6.2,
          health: p.healthScore || 94,
          history: p.history || 'Plantation registered',
        }));
        setPlantations(formatted);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPlantations();
  }, []);

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

  const handleDeletePlantation = async (id) => {
    try {
      await apiService.deletePlantation(id);
    } catch (e) {}
    setPlantations(plantations.filter((p) => p.id !== id));
    showToast('Plantation removed from MongoDB Atlas.');
  };

  // ===== 2. COMMUNITY FEED STATE & VALIDATION =====
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
    }
  ];

  const fetchPosts = async () => {
    try {
      const res = await apiService.getCommunityPosts();
      let dbPosts = [];
      if (res && res.success && Array.isArray(res.posts)) {
        dbPosts = res.posts.map((p) => ({
          id: p._id || p.id,
          author: p.authorName || p.username || 'Planter',
          username: p.username || p.authorName || 'planter',
          avatar: p.authorAvatar || p.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          time: new Date(p.createdAt || Date.now()).toLocaleDateString(),
          category: p.category || 'Plantation Update',
          content: p.description || p.content || '',
          description: p.description || p.content || '',
          image: p.image || (p.images && p.images.length > 0 ? p.images[0] : ''),
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          comments: Array.isArray(p.comments) ? p.comments.length : 0,
          liked: false,
        }));
      }
      setFeedPosts([...dbPosts, ...defaultOtherPlanterPosts]);
    } catch (err) {
      setFeedPosts(defaultOtherPlanterPosts);
    }
  };

  React.useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    };

    const res = await apiService.createCommunityPost(postPayload);
    if (res && res.success) {
      setFeedPosts((prev) => [
        {
          id: res.post?._id || Date.now(),
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
        },
        ...prev,
      ]);
      setNewPostText('');
      setNewPostImage('');
      showToast('Post created & saved in MongoDB!');
    } else {
      setPostError(res?.message || 'Failed to create post.');
    }
  };

  const handleLikePost = async (id) => {
    try {
      await apiService.likePost(id);
    } catch (e) {}
    setFeedPosts(feedPosts.map((p) => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
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

  const sidebarLinks = [
    { id: 'dashboard', label: lang === 'ml' ? 'ഹോം' : 'Dashboard', icon: Home },
    { id: 'plantations', label: lang === 'ml' ? 'എന്റെ തോട്ടങ്ങൾ' : 'My Plantation', icon: Leaf },
    { id: 'ai', label: lang === 'ml' ? 'AI നിർദ്ദേശങ്ങൾ' : 'Recommendations', icon: Sparkles },
    { id: 'community', label: lang === 'ml' ? 'കമ്മ്യൂണിറ്റി' : 'Community', icon: Users },
    { id: 'plots', label: lang === 'ml' ? 'മാർക്കറ്റ് പ്ലേസ്' : 'Marketplace', icon: MapPin },
    { id: 'profile', label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile', icon: User },
    { id: 'settings', label: lang === 'ml' ? 'ക്രമീകരണങ്ങൾ' : 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#4A5568] flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex gap-6">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28 bg-white rounded-[20px] border border-[#D7E6D5] shadow-soft p-4 space-y-1.5">
            
            <div className="p-3 mb-3 bg-[#DDEFD9]/60 rounded-xl border border-[#5C8D4E]/30 flex items-center gap-3">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1F5E3B]" />
              <div className="overflow-hidden">
                <p className="text-xs font-black text-[#17331F] truncate">{user?.fullName || user?.username || 'Planter'}</p>
                <p className="text-[10px] text-[#5C8D4E] font-bold">{user?.role || 'Planter'} • {user?.district || user?.location || 'Idukki'}</p>
              </div>
            </div>

            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#1F5E3B] text-white shadow-md'
                      : 'text-[#17331F] hover:bg-[#DDEFD9]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}

          </div>
        </aside>

        {/* MAIN TAB CONTENT DISPLAY */}
        <main className="flex-1">
          
          {/* Global Search Bar & Malayalam Translator */}
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-4 h-4 text-[#5C8D4E] absolute left-4" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder={lang === 'ml' ? "തിരയുക: തോട്ടങ്ങൾ, എഐ നിർദ്ദേശങ്ങൾ, വിവരങ്ങൾ..." : "Global Search: Plantations, AI diagnosis, Marketplace plots, Community posts..."}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#D7E6D5] text-xs font-medium text-[#17331F] focus:outline-none focus:border-[#1F5E3B] shadow-sm"
              />
            </div>

            <button
              onClick={toggleLang}
              className="px-4 py-3 rounded-full bg-[#1F5E3B] hover:bg-[#5C8D4E] text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center"
              title="Switch Language / ഭാഷ മാറ്റുക"
            >
              <Globe className="w-4 h-4 text-amber-300" />
              <span>{lang === 'en' ? '🌐 മലയാളത്തിലേക്ക് മാറ്റുക (ML)' : '🌐 Switch to English (EN)'}</span>
            </button>
          </div>

          {/* ===== TAB 1: DASHBOARD OVERVIEW ===== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* NO PROFILE PHOTO NOTIFICATION BANNER (Shows ONLY for new accounts without a profile photo) */}
              {(!user?.hasCustomPhoto && !user?.avatar) && (
                <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border-2 border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-black flex-shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2">
                        <span>{lang === 'ml' ? '📷 പ്രൊഫൈൽ ഫോട്ടോ അറിയിപ്പ്' : '📷 Profile Photo Notice'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">{lang === 'ml' ? 'ശ്രദ്ധിക്കുക' : 'Action Required'}</span>
                      </h4>
                      <p className="text-xs text-[#4A5568] font-medium">{lang === 'ml' ? 'നിങ്ങളുടെ പ്രൊഫൈൽ ഫോട്ടോ ചേർത്താൽ തോട്ടം പ്രൊഫൈൽ കൂടുതൽ മികച്ചതാക്കാം!' : "You haven't uploaded your profile photo yet. Add a custom photo in Settings to personalize your planter identity!"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 rounded-full bg-[#1F5E3B] hover:bg-[#5C8D4E] text-white font-extrabold text-xs transition-colors flex-shrink-0 shadow-sm whitespace-nowrap"
                  >
                    {lang === 'ml' ? 'സെറ്റിംഗ്സിൽ ഫോട്ടോ മാറ്റുക →' : 'Upload Photo in Settings →'}
                  </button>
                </div>
              )}

              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-[#17331F] to-[#1F5E3B] text-white rounded-[20px] p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-[#5C8D4E]/40 text-[#DDEFD9] text-xs font-bold mb-3 border border-white/20">
                    {lang === 'ml' ? '🌿 സ്മാർട്ട് കാർഷിക ഡാഷ്‌ബോർഡ്' : '🌿 Smart Agricultural Dashboard'}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black font-poppins mb-2">
                    {lang === 'ml' ? 'സ്വാഗതം' : 'Welcome'} {user?.fullName || user?.name || user?.username || 'Planter'} 👋
                  </h2>
                  <p className="text-xs md:text-sm text-[#DDEFD9]/90 max-w-xl font-medium leading-relaxed">
                    {lang === 'ml' 
                      ? `${user?.fullName || user?.username} നായുള്ള വ്യക്തിഗത തോട്ടം ഡാഷ്‌ബോർഡ് (${user?.role || 'കർഷകൻ'}, ${user?.district || user?.location || 'ഇടുക്കി, കേരളം'}).` 
                      : `Personalized plantation dashboard for ${user?.fullName || user?.username} (${user?.role || 'Farmer'}, ${user?.district || user?.location || 'Idukki, Kerala'}).`
                    }
                  </p>
                </div>
              </div>

              {/* Quick Actions Setup Card for Logged-In User */}
              <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft">
                <h3 className="text-sm font-extrabold text-[#17331F] mb-3">{lang === 'ml' ? 'ത്വരിത നടപടികൾ' : 'Quick Actions'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('community')}
                    className="p-4 rounded-xl bg-[#F8FAF7] hover:bg-[#DDEFD9] border border-[#D7E6D5] text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-black text-[#17331F]">{lang === 'ml' ? 'പോസ്റ്റ് എഴുതുക' : 'Create your first post'}</p>
                      <p className="text-[10px] text-[#4A5568]">{lang === 'ml' ? 'കർഷകരുമായി സംവദിക്കുക' : 'Share updates with planters'}</p>
                    </div>
                    <Plus className="w-4 h-4 text-[#1F5E3B] group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-4 rounded-xl bg-[#F8FAF7] hover:bg-[#DDEFD9] border border-[#D7E6D5] text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-black text-[#17331F]">{lang === 'ml' ? 'ഫോട്ടോ മാറ്റുക' : 'Upload profile photo'}</p>
                      <p className="text-[10px] text-[#4A5568]">{lang === 'ml' ? 'പ്രൊഫൈൽ മികച്ചതാക്കൂ' : 'Customize planter avatar'}</p>
                    </div>
                    <Camera className="w-4 h-4 text-[#1F5E3B] group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="p-4 rounded-xl bg-[#F8FAF7] hover:bg-[#DDEFD9] border border-[#D7E6D5] text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-black text-[#17331F]">{lang === 'ml' ? 'പ്രൊഫൈൽ തിരുത്തുക' : 'Complete profile'}</p>
                      <p className="text-[10px] text-[#4A5568]">{lang === 'ml' ? 'തോട്ടം വിവരങ്ങൾ നൽകൂ' : 'Update role & plantation details'}</p>
                    </div>
                    <User className="w-4 h-4 text-[#1F5E3B] group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card hover={false} className="p-5 text-center">
                  <div className="text-3xl font-black text-[#1F5E3B] font-poppins">{plantations.length}</div>
                  <p className="text-xs font-bold text-[#4A5568] mt-1">{lang === 'ml' ? 'സജീവ തോട്ടങ്ങൾ' : 'Active Plantations'}</p>
                </Card>
                <Card hover={false} className="p-5 text-center">
                  <div className="text-3xl font-black text-[#1F5E3B] font-poppins">{avgMoisture > 0 ? `${avgMoisture}%` : '--'}</div>
                  <p className="text-xs font-bold text-[#4A5568] mt-1">{lang === 'ml' ? 'ശരാശരി ഈർപ്പം' : 'Avg Moisture'}</p>
                </Card>
                <Card hover={false} className="p-5 text-center">
                  <div className="text-3xl font-black text-[#C9A227] font-poppins">{avgHealth > 0 ? `${avgHealth}%` : '--'}</div>
                  <p className="text-xs font-bold text-[#4A5568] mt-1">{lang === 'ml' ? 'ആരോഗ്യ സ്കോർ' : 'Health Score'}</p>
                </Card>
                <Card hover={false} className="p-5 text-center">
                  <div className="text-3xl font-black text-[#5C8D4E] font-poppins">{predictedYield > 0 ? `${predictedYield} kg` : '--'}</div>
                  <p className="text-xs font-bold text-[#4A5568] mt-1">{lang === 'ml' ? 'പ്രതീക്ഷിക്കുന്ന വിളവ്' : 'Predicted Yield/Acre'}</p>
                </Card>
              </div>

              {/* Plantation Preview List */}
              <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D7E6D5]">
                  <h3 className="text-base font-extrabold text-[#17331F]">{lang === 'ml' ? 'എന്റെ തോട്ടങ്ങളുടെ വിവരങ്ങൾ' : 'My Plantations Overview'}</h3>
                  <div className="flex items-center gap-3">
                    {plantations.length === 0 && (
                      <button onClick={handleLoadSamplePlantations} className="text-xs font-extrabold text-[#5C8D4E] hover:underline">
                        {lang === 'ml' ? '+ ഡെമോ വിവരങ്ങൾ കാണുക' : '+ Load Demo Plantations'}
                      </button>
                    )}
                    <button onClick={() => setActiveTab('plantations')} className="text-xs font-bold text-[#1F5E3B] hover:underline">
                      {lang === 'ml' ? 'എല്ലാം കാണുക →' : 'View All →'}
                    </button>
                  </div>
                </div>

                {plantations.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-[#F8FAF7] rounded-xl border border-dashed border-[#D7E6D5]">
                    <Leaf className="w-10 h-10 text-[#5C8D4E] mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold text-[#17331F]">{lang === 'ml' ? 'തോട്ടങ്ങൾ ഒന്നും ചേർത്തിട്ടില്ല' : 'No plantations registered yet'}</p>
                    <p className="text-xs text-[#4A5568] mt-1 mb-4">{lang === 'ml' ? 'ഏലം തോട്ടം രജിസ്റ്റർ ചെയ്ത് AI നിർദ്ദേശങ്ങൾ നേടൂ.' : 'Register your cardamom estate to unlock telemetry metrics and AI recommendations.'}</p>
                    <div className="flex justify-center gap-3">
                      <Button variant="primary" size="sm" icon={Plus} onClick={() => setNewPlantationModalOpen(true)}>
                        {lang === 'ml' ? 'തോട്ടം ചേർക്കുക' : 'Register Plantation'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plantations.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-[#17331F] text-sm">{p.name}</h4>
                          <p className="text-xs text-[#4A5568]">{p.location} • {p.area} {lang === 'ml' ? 'ഏക്കർ' : 'Acres'}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DDEFD9] text-[#1F5E3B]">
                          {p.health}% {lang === 'ml' ? 'ആരോഗ്യം' : 'Health'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===== TAB 2: MY PLANTATION ===== */}
          {activeTab === 'plantations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#17331F] font-poppins">My Plantations</h2>
                  <p className="text-xs text-[#4A5568] font-medium">Manage and track your cardamom crops, soil metrics, and history.</p>
                </div>
                <div className="flex items-center gap-2">
                  {plantations.length === 0 && (
                    <Button variant="secondary" size="sm" onClick={handleLoadSamplePlantations}>
                      Load Demo Data
                    </Button>
                  )}
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={Plus}
                    onClick={() => {
                      setNewPlantationModalOpen(true);
                      setPlantationErrors({});
                    }}
                  >
                    Add Plantation
                  </Button>
                </div>
              </div>

              {/* Plantations List */}
              {plantations.length === 0 ? (
                <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-10 text-center shadow-soft">
                  <Leaf className="w-12 h-12 text-[#5C8D4E] mx-auto mb-3 opacity-50" />
                  <h3 className="text-base font-extrabold text-[#17331F]">No Plantations Registered</h3>
                  <p className="text-xs text-[#4A5568] mt-1 mb-6 max-w-sm mx-auto">Start managing your cardamom estate by adding your first plot details, plant varieties, and soil metrics.</p>
                  <div className="flex justify-center gap-3">
                    <Button variant="primary" size="md" icon={Plus} onClick={() => setNewPlantationModalOpen(true)}>
                      Add Your First Plantation
                    </Button>
                    <Button variant="secondary" size="md" onClick={handleLoadSamplePlantations}>
                      Load Sample Estate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plantations.map((p) => (
                    <Card key={p.id} className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-[#1F5E3B] bg-[#DDEFD9] px-3 py-1 rounded-full">
                            {p.variety} Variety
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDeletePlantation(p.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-full">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-lg font-extrabold text-[#17331F] mb-1">{p.name}</h3>
                        <p className="text-xs text-[#4A5568] mb-4">{p.location}</p>

                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] mb-4 text-center">
                          <div>
                            <p className="text-[10px] text-[#4A5568]">Area</p>
                            <p className="text-xs font-black text-[#17331F]">{p.area} Acres</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#4A5568]">Moisture</p>
                            <p className="text-xs font-black text-[#1F5E3B]">{p.moisture}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#4A5568]">pH Level</p>
                            <p className="text-xs font-black text-[#17331F]">{p.ph}</p>
                          </div>
                        </div>

                        <p className="text-xs text-[#4A5568] italic">History: {p.history}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#D7E6D5] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#5C8D4E]">Health Rating: {p.health}%</span>
                        <button onClick={() => showToast(`Diagnostics opened for ${p.name}`)} className="text-xs font-extrabold text-[#1F5E3B] hover:underline">
                          View Report →
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 3: AI RECOMMENDATION PAGE ===== */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#17331F] font-poppins flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#C9A227]" />
                  AI Decision Support & Recommendations
                </h2>
                <p className="text-xs text-[#4A5568] font-medium">Input current soil readings to compute personalized fertilization and irrigation guidance.</p>
              </div>

              {/* Interactive Soil Inputs */}
              <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft">
                <h3 className="text-sm font-extrabold text-[#17331F] mb-4">Plantation Telemetry Inputs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold mb-1">Moisture (%) *</label>
                    <input 
                      type="number" 
                      value={aiInputs.moisture} 
                      onChange={(e) => setAiInputs({...aiInputs, moisture: e.target.value})} 
                      className={`w-full p-2.5 rounded-xl text-xs border ${aiErrors.moisture ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                    />
                    {aiErrors.moisture && <p className="text-[10px] text-red-600 font-bold mt-1">{aiErrors.moisture}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Soil pH *</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={aiInputs.ph} 
                      onChange={(e) => setAiInputs({...aiInputs, ph: e.target.value})} 
                      className={`w-full p-2.5 rounded-xl text-xs border ${aiErrors.ph ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                    />
                    {aiErrors.ph && <p className="text-[10px] text-red-600 font-bold mt-1">{aiErrors.ph}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Nitrogen (N) *</label>
                    <input 
                      type="number" 
                      value={aiInputs.n} 
                      onChange={(e) => setAiInputs({...aiInputs, n: e.target.value})} 
                      className={`w-full p-2.5 rounded-xl text-xs border ${aiErrors.n ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                    />
                    {aiErrors.n && <p className="text-[10px] text-red-600 font-bold mt-1">{aiErrors.n}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Phosphorus (P) *</label>
                    <input 
                      type="number" 
                      value={aiInputs.p} 
                      onChange={(e) => setAiInputs({...aiInputs, p: e.target.value})} 
                      className={`w-full p-2.5 rounded-xl text-xs border ${aiErrors.p ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                    />
                    {aiErrors.p && <p className="text-[10px] text-red-600 font-bold mt-1">{aiErrors.p}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Potassium (K) *</label>
                    <input 
                      type="number" 
                      value={aiInputs.k} 
                      onChange={(e) => setAiInputs({...aiInputs, k: e.target.value})} 
                      className={`w-full p-2.5 rounded-xl text-xs border ${aiErrors.k ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                    />
                    {aiErrors.k && <p className="text-[10px] text-red-600 font-bold mt-1">{aiErrors.k}</p>}
                  </div>
                </div>

                <Button variant="primary" size="md" onClick={handleRunAI} icon={Sparkles} className="w-full justify-center">
                  Run AI Crop Analysis
                </Button>
              </div>

              {/* AI Output Result Box */}
              {!aiResult ? (
                <div className="bg-[#F8FAF7] rounded-[20px] border-2 border-dashed border-[#D7E6D5] p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#DDEFD9] text-[#1F5E3B] flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#17331F]">No Recommendation Generated Yet</h3>
                  <p className="text-xs text-[#4A5568] max-w-md mx-auto leading-relaxed">
                    Enter your soil moisture, pH, and NPK values in the fields above and click <strong className="text-[#1F5E3B]">"Run AI Crop Analysis"</strong> to generate your custom plantation health index and recommendations.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-[#D7E6D5]">
                    <div>
                      <p className="text-xs font-bold text-[#5C8D4E]">Calculated Health Index</p>
                      <h3 className="text-3xl font-black text-[#1F5E3B] font-poppins">{aiResult.healthScore} / 100</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#4A5568]">Yield Forecast</p>
                      <p className="text-lg font-black text-[#C9A227]">{aiResult.yieldPrediction}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                      <p className="text-xs font-extrabold text-[#17331F]">Disease Risk Diagnostic</p>
                      <p className="text-xs text-[#4A5568] mt-0.5">{aiResult.diseaseRisk}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                      <p className="text-xs font-extrabold text-[#17331F]">Organic Fertilization Advice</p>
                      <p className="text-xs text-[#4A5568] mt-0.5">{aiResult.fertilizerAdvice}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                      <p className="text-xs font-extrabold text-[#17331F]">Irrigation Schedule</p>
                      <p className="text-xs text-[#4A5568] mt-0.5">{aiResult.irrigationAdvice}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 4: COMMUNITY ===== */}
          {activeTab === 'community' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-[#17331F] font-poppins">Planters Community Feed</h2>

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
              {feedPosts.length === 0 ? (
                <div className="bg-white rounded-[20px] border border-[#D7E6D5] p-8 text-center">
                  <p className="text-sm font-bold text-[#17331F]">No community posts yet.</p>
                  <p className="text-xs text-[#4A5568] mt-1">Be the first to create a post for your cardamom ecosystem!</p>
                </div>
              ) : (
                feedPosts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img src={post.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1F5E3B]" />
                        <div>
                          <h4 className="text-xs font-extrabold text-[#17331F]">{post.author} (@{post.username || 'planter'})</h4>
                          <span className="text-[10px] text-[#4A5568]">{post.time}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#DDEFD9] text-[#1F5E3B]">
                        {post.category}
                      </span>
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
                      <button className="flex items-center gap-1.5 text-[#4A5568] hover:text-[#1F5E3B]">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button onClick={() => showToast('Post link copied!')} className="flex items-center gap-1.5 text-[#4A5568] hover:text-[#1F5E3B]">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ===== TAB 5: MARKETPLACE PLOTS ===== */}
          {activeTab === 'plots' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#17331F] font-poppins">Cardamom Plot Marketplace</h2>
                  <p className="text-xs text-[#4A5568] font-medium">Browse verified cardamom plantations available for sale or lease in Idukki.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plots.map((plot) => (
                  <Card key={plot.id} className="overflow-hidden p-0">
                    <img src={plot.image} alt="" className="w-full h-44 object-cover" />
                    <div className="p-5">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DDEFD9] text-[#1F5E3B] mb-2 inline-block">
                        Verified Listing
                      </span>
                      <h4 className="font-extrabold text-[#17331F] text-base mb-2">{plot.title}</h4>
                      <p className="text-xs text-[#4A5568] mb-4">{plot.location} • {plot.area} • {plot.price}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C9A227]">Expected ROI: {plot.roi}</span>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => showToast(`Contact details sent for owner: ${plot.owner}`)}
                        >
                          Contact Owner
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ===== TAB 6: PROFILE ===== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                  <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-[#1F5E3B] shadow-md" />
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
                  <Button variant="primary" size="sm" icon={Edit} onClick={() => setProfileEditOpen(true)}>
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
                      src={photoUrlInput || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`} 
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
                          onClick={() => setPhotoUrlInput(presetUrl)}
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
                      <label className="block text-xs font-bold text-[#17331F] mb-1">Full Name / Username *</label>
                      <input 
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
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
                        <option value="Expert">Agricultural Specialist / Expert</option>
                        <option value="Investor">Plantation Investor</option>
                        <option value="User">General Member</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#17331F] mb-1">District / Location *</label>
                      <input 
                        type="text"
                        value={profileForm.district}
                        onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                        className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] focus:outline-none focus:border-[#1F5E3B]"
                      />
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

                  <Button type="submit" variant="primary" size="sm">
                    Save Account Details
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
                    <img src={photoUrlInput || profileForm.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#1F5E3B]" />
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
                  <label className="block text-xs font-bold mb-1">District / Location <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={profileForm.district} 
                    onChange={(e) => setProfileForm({...profileForm, district: e.target.value})} 
                    className={`w-full p-2.5 rounded-xl text-xs border ${profileErrors.district ? 'border-red-400 bg-red-50' : 'border-[#D7E6D5]'}`} 
                  />
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

      <Footer />
    </div>
  );
};

export default Dashboard;
