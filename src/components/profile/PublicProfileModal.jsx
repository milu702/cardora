import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Calendar, Mail, Phone, ShieldCheck, UserPlus, UserCheck, 
  MessageSquare, Share2, Heart, Leaf, Award, Briefcase, GraduationCap, 
  Building, CheckCircle, Image, Sparkles, Activity, Lock, ExternalLink,
  ChevronRight, Users, Grid, Bookmark, ThumbsUp
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PublicProfileModal = ({ username, userId, isOpen, onClose, onOpenChat, onToast }) => {
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'plantations' | 'media' | 'about' | 'activity'
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersListModal, setShowFollowersListModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followersListType, setFollowersListType] = useState('followers'); // 'followers' | 'following'
  const [postsList, setPostsList] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);

  const targetIdentifier = username || userId;

  const fetchProfile = async () => {
    if (!targetIdentifier) return;
    setLoading(true);
    try {
      const res = await apiService.getPublicProfile(targetIdentifier);
      if (res && res.success) {
        setProfileData(res);
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.stats?.followersCount || 0);
        setFollowingCount(res.stats?.followingCount || 0);
        setPostsList(res.posts || []);
        const likes = (res.posts || []).reduce((acc, p) => acc + (p.likesCount || (p.likes ? p.likes.length : 0)), 0);
        setTotalLikes(res.stats?.totalLikes || likes);
      }
    } catch (err) {
      console.error('Error fetching public profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetIdentifier) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetIdentifier]);

  const handleToggleFollow = async () => {
    if (!profileUser?._id && !profileUser?.id) return;
    const targetId = profileUser._id || profileUser.id;

    // Optimistic UI Update
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await apiService.toggleFollowUser(targetId);
      if (res && res.success) {
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.followersCount);
        if (onToast) onToast(res.message || (res.isFollowing ? `Following @${profileUser.username}` : `Unfollowed @${profileUser.username}`));
      }
    } catch (err) {
      // Revert on error
      setIsFollowing(!nextState);
      setFollowersCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShareProfile = () => {
    const url = window.location.origin + `/profile/${profileUser?.username || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      if (onToast) onToast(`Profile link copied: @${profileUser?.username}`);
    }
  };

  const handleLikePost = async (postId) => {
    let wasLiked = false;
    setPostsList((prev) =>
      prev.map((p) => {
        if ((p._id || p.id) === postId) {
          wasLiked = p.isLiked;
          const currentCount = p.likesCount || (p.likes ? p.likes.length : 0);
          const newCount = wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
          return { ...p, isLiked: !wasLiked, likesCount: newCount };
        }
        return p;
      })
    );

    setTotalLikes((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      await apiService.likePost(postId);
      if (onToast) onToast(wasLiked ? 'Unliked post' : 'Liked post ❤️');
    } catch (err) {}
  };

  const openFollowersList = async (type = 'followers') => {
    setFollowersListType(type);
    setShowFollowersListModal(true);
    const targetId = profileUser?._id || profileUser?.id;
    if (!targetId) return;

    try {
      const res = type === 'followers'
        ? await apiService.getFollowersList(targetId)
        : await apiService.getFollowingList(targetId);
      if (res && res.success) {
        setFollowersList(res.followers || res.following || []);
      }
    } catch (err) {}
  };

  if (!isOpen) return null;

  const profileUser = profileData?.user || {
    name: 'Cardora Planter',
    username: username || 'planter',
    avatar: '',
    role: 'Farmer',
    bio: 'Cardamom cultivator & agriculture enthusiast',
    location: 'Idukki, Kerala',
    joinedDate: 'Jan 2025',
    experience: '10+ Years Cardamom Cultivation',
    skills: ['Organic Farming', 'Drip Irrigation', 'Azhukal Prevention'],
    certifications: ['Spices Board India Certified'],
    education: 'B.Sc. Agriculture',
    organization: 'Cardamom Growers Association',
  };

  const stats = {
    postsCount: postsList.length || (profileData?.stats?.postsCount || 0),
    plantationsCount: profileData?.stats?.plantationsCount || 0,
    followersCount,
    followingCount,
    totalLikes: totalLikes || (profileData?.stats?.totalLikes || 0),
    totalActivities: (postsList.length || 0) + (profileData?.stats?.plantationsCount || 0) + followersCount,
  };

  const plantations = profileData?.plantations || [];
  const media = profileData?.media || [];
  const isSelf = currentUser?.username === profileUser?.username || (currentUser?.id && currentUser.id === profileUser.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-[28px] border border-[#D7E6D5] dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-1">
            
            {/* ===== 1. PROFILE COVER BANNER & HEADER ===== */}
            <div className="relative">
              
              {/* Cover Banner Image */}
              <div className="h-44 sm:h-56 md:h-64 w-full bg-gradient-to-r from-[#17331F] to-[#1F5E3B] relative overflow-hidden">
                <img 
                  src={profileUser.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'} 
                  alt="Cover" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Avatar & Action Buttons Layer */}
              <div className="px-6 sm:px-8 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                
                {/* Profile Photo Avatar */}
                <div className="relative inline-block">
                  <img
                    src={profileUser.avatar || profileUser.profileImage || profileUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=1F5E3B&color=ffffff`}
                    alt={profileUser.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-white"
                  />
                  {profileUser.isVerified && (
                    <div className="absolute bottom-2 right-2 bg-[#1F5E3B] text-white p-1.5 rounded-full border-2 border-white shadow-md" title="Verified Planter">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pb-2">
                  {!isSelf ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleToggleFollow}
                        className={`px-5 py-2.5 rounded-full text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                          isFollowing
                            ? 'bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            : 'bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] text-white hover:from-[#5C8D4E] hover:to-[#1F5E3B]'
                        }`}
                      >
                        {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        <span>{isFollowing ? 'Following' : 'Follow Planter'}</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (onOpenChat) onOpenChat(profileUser);
                          onClose();
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#1F5E3B] hover:bg-[#5C8D4E] text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Message</span>
                      </motion.button>
                    </>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-[#DDEFD9] text-[#1F5E3B] font-black text-xs border border-[#5C8D4E]/30">
                      Your Personal Profile
                    </span>
                  )}

                  <button
                    onClick={handleShareProfile}
                    className="p-2.5 rounded-full bg-[#F8FAF7] dark:bg-slate-800 hover:bg-[#DDEFD9] border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white transition-colors cursor-pointer shadow-sm"
                    title="Share Profile"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Identity & Bio */}
              <div className="px-6 sm:px-8 mt-4 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#17331F] dark:text-white font-poppins">
                    {profileUser.name || profileUser.fullName}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-[#DDEFD9] text-[#1F5E3B] text-xs font-black border border-[#5C8D4E]/30">
                    {profileUser.role || 'Farmer'}
                  </span>
                </div>

                <p className="text-xs font-bold text-[#5C8D4E] dark:text-emerald-400">
                  @{profileUser.username}
                </p>

                <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                  {profileUser.bio || 'Cardamom planter, soil analytics advocate & agricultural enthusiast.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#4A5568] dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1F5E3B]" />
                    {profileUser.location || profileUser.district || 'Idukki, Kerala'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1F5E3B]" />
                    Joined {profileUser.joinedDate || 'Jan 2025'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#1F5E3B]" />
                    {profileUser.organization || 'Cardamom Growers Association'}
                  </span>
                </div>
              </div>

              {/* ===== 2. STATISTICS BAR ===== */}
              <div className="px-6 sm:px-8 my-6">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-800 text-center">
                  
                  <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('posts')}>
                    <span className="text-lg sm:text-xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins block">{stats.postsCount}</span>
                    <span className="text-[11px] font-bold text-[#4A5568] dark:text-slate-400">Posts</span>
                  </div>

                  <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('plantations')}>
                    <span className="text-lg sm:text-xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins block">{stats.plantationsCount}</span>
                    <span className="text-[11px] font-bold text-[#4A5568] dark:text-slate-400">Plantations</span>
                  </div>

                  <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openFollowersList('followers')}>
                    <span className="text-lg sm:text-xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins block">{followersCount}</span>
                    <span className="text-[11px] font-bold text-[#4A5568] dark:text-slate-400">Followers</span>
                  </div>

                  <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openFollowersList('following')}>
                    <span className="text-lg sm:text-xl font-black text-[#1F5E3B] dark:text-emerald-400 font-poppins block">{followingCount}</span>
                    <span className="text-[11px] font-bold text-[#4A5568] dark:text-slate-400">Following</span>
                  </div>

                  <div>
                    <span className="text-lg sm:text-xl font-black text-[#C9A227] font-poppins block">{stats.totalLikes}</span>
                    <span className="text-[11px] font-bold text-[#4A5568] dark:text-slate-400">Likes</span>
                  </div>

                  <div>
                    <span className="text-lg sm:text-xl font-black text-[#5C8D4E] dark:text-emerald-400 font-poppins block">{stats.totalActivities}</span>
                    <span className="text-[11px] font-bold text-[#4A5568] dark:text-slate-400">Activities</span>
                  </div>

                </div>
              </div>

              {/* ===== 3. PROFILE TABS NAVIGATION ===== */}
              <div className="px-6 sm:px-8 border-b border-[#D7E6D5] dark:border-slate-800 flex items-center gap-4 sm:gap-8 overflow-x-auto">
                {[
                  { id: 'posts', label: 'Posts', icon: Grid },
                  { id: 'plantations', label: 'Plantations', icon: Leaf },
                  { id: 'media', label: 'Media', icon: Image },
                  { id: 'about', label: 'About', icon: Award },
                  { id: 'activity', label: 'Activity', icon: Activity },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 flex items-center gap-2 text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'border-[#1F5E3B] text-[#1F5E3B] dark:text-emerald-400'
                          : 'border-transparent text-[#4A5568] dark:text-slate-400 hover:text-[#1F5E3B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* ===== 4. TAB CONTENTS ===== */}
            <div className="p-6 sm:p-8 bg-[#F8FAF7]/50 dark:bg-slate-900/50 min-h-[320px]">
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-[#1F5E3B] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold text-[#17331F] dark:text-white">Loading @{profileUser.username}'s records...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: POSTS */}
                  {activeTab === 'posts' && (
                    <div className="space-y-4">
                      {postsList.length > 0 ? (
                        postsList.map((post) => {
                          const postId = post._id || post.id;
                          const currentLikes = post.likesCount || (post.likes ? post.likes.length : 0);
                          return (
                            <div key={postId} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 shadow-sm space-y-3 hover:border-[#5C8D4E] transition-all">
                              <div className="flex items-center gap-3">
                                <img src={profileUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=1F5E3B&color=ffffff`} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1F5E3B]" />
                                <div>
                                  <h4 className="text-xs font-black text-[#17331F] dark:text-white flex items-center gap-1.5">
                                    <span>{profileUser.name}</span>
                                    <span className="text-[10px] text-[#5C8D4E] font-bold">@{profileUser.username}</span>
                                  </h4>
                                  <span className="text-[10px] text-[#4A5568] dark:text-slate-400">{new Date(post.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>

                              <p className="text-xs text-[#17331F] dark:text-slate-200 font-medium leading-relaxed">{post.content || post.text}</p>

                              {(post.image || post.mediaUrl) && (
                                <img src={post.image || post.mediaUrl} alt="" className="w-full max-h-80 object-cover rounded-xl border border-[#D7E6D5] dark:border-slate-700" />
                              )}

                              {/* Interactive Action Bar */}
                              <div className="flex items-center justify-between pt-3 border-t border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#4A5568] dark:text-slate-400">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => handleLikePost(postId)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                                    post.isLiked
                                      ? 'bg-red-50 text-red-600 border border-red-200'
                                      : 'hover:bg-red-50 hover:text-red-600'
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                                  <span>{currentLikes} Likes</span>
                                </motion.button>

                                <span className="flex items-center gap-1.5 px-3 py-1.5">
                                  <MessageSquare className="w-4 h-4 text-[#1F5E3B]" />
                                  {post.comments ? post.comments.length : 0} Comments
                                </span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onToast) onToast('Post link shared!');
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F8FAF7] rounded-full transition-all cursor-pointer"
                                >
                                  <Share2 className="w-4 h-4 text-[#1F5E3B]" />
                                  <span>Share</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#4A5568]">
                          🌿 @{profileUser.username} hasn't published any community posts yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: PLANTATIONS */}
                  {activeTab === 'plantations' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plantations.length > 0 ? (
                        plantations.map((p) => (
                          <div key={p._id || p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-[#17331F] dark:text-white flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-[#1F5E3B]" />
                                <span>{p.name}</span>
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DDEFD9] text-[#1F5E3B]">
                                {p.variety || 'Malabar'} Variety
                              </span>
                            </div>

                            <div className="space-y-1 text-xs text-[#4A5568] dark:text-slate-300 font-semibold">
                              <p>Location: {p.location || 'Idukki, Kerala'}</p>
                              <p>Acreage: {p.area || 10} Acres ({p.plantsCount || p.plants || 1500} Plants)</p>
                              <p>Soil Moisture: {p.moisture || 72}% • Soil pH: {p.soilPh || p.ph || 6.2}</p>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs">
                              <span className="font-extrabold text-[#1F5E3B]">Health Score: {p.healthScore || p.health || 94}%</span>
                              <span className="text-[10px] text-[#4A5568]">{p.history || 'Registered'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#4A5568]">
                          🌱 No public plantations registered under @{profileUser.username}.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: MEDIA GRID */}
                  {activeTab === 'media' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {media.length > 0 ? (
                        media.map((item, idx) => (
                          <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-[#D7E6D5] dark:border-slate-700 bg-black/5 relative group">
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#4A5568]">
                          📷 No media uploads found for @{profileUser.username}.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: ABOUT & CREDENTIALS */}
                  {activeTab === 'about' && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 shadow-sm space-y-3">
                        <h4 className="text-xs font-black text-[#17331F] dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#1F5E3B]" />
                          <span>Agronomic Experience & Credentials</span>
                        </h4>
                        <p className="text-xs text-[#4A5568] dark:text-slate-300 font-semibold">{profileUser.experience}</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 shadow-sm space-y-3">
                        <h4 className="text-xs font-black text-[#17331F] dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#C9A227]" />
                          <span>Specialized Skills & Techniques</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(profileUser.skills || []).map((sk, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-xl bg-[#F8FAF7] dark:bg-slate-700 border border-[#D7E6D5] dark:border-slate-600 text-xs font-extrabold text-[#17331F] dark:text-white">
                              🌿 {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 shadow-sm space-y-3">
                        <h4 className="text-xs font-black text-[#17331F] dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-[#1F5E3B]" />
                          <span>Certifications & Education</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#4A5568] dark:text-slate-300 font-semibold">
                          {(profileUser.certifications || []).map((c, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-[#5C8D4E]" />
                              <span>{c}</span>
                            </li>
                          ))}
                          <li className="flex items-center gap-2 pt-1 border-t border-[#D7E6D5] dark:border-slate-700">
                            <GraduationCap className="w-3.5 h-3.5 text-[#1F5E3B]" />
                            <span>{profileUser.education}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: ACTIVITY FEED */}
                  {activeTab === 'activity' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-semibold text-[#17331F] dark:text-white flex items-center gap-3">
                        <Activity className="w-4 h-4 text-[#1F5E3B]" />
                        <span>Registered new cardamom plantation telemetry for {profileUser.location}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-semibold text-[#17331F] dark:text-white flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-[#C9A227]" />
                        <span>Completed NPK & micro-climate advisory check</span>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

          </div>

        </motion.div>

        {/* FOLLOWERS / FOLLOWING LIST SUB-MODAL */}
        {showFollowersListModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#D7E6D5] dark:border-slate-800 p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowFollowersListModal(false)} className="absolute top-4 right-4 text-[#4A5568] hover:text-black">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-[#17331F] dark:text-white mb-4 capitalize">
                {followersListType} ({followersList.length})
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {followersList.length > 0 ? (
                  followersList.map((fUser) => (
                    <div key={fUser._id || fUser.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5]">
                      <div className="flex items-center gap-3">
                        <img src={fUser.avatar || fUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(fUser.name)}&background=1F5E3B&color=ffffff`} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-black text-[#17331F] dark:text-white">{fUser.name}</p>
                          <p className="text-[10px] text-[#5C8D4E]">@{fUser.username}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center text-[#4A5568] py-6 font-bold">No {followersListType} list available.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AnimatePresence>
  );
};

export default PublicProfileModal;
