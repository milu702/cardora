import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Menu,
  X,
  Globe,
  LogOut,
  Home,
  Users,
  MapPin,
  Sparkles,
  User,
  UserCheck,
  Bell,
  Search,
  Shield,
  Moon,
  Sun,
  CloudSun,
  MessageSquare,
  ShieldCheck,
  Gavel,
  Mic,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVoiceNavigation } from '../../context/VoiceNavigationContext';
import { apiService } from '../../services/api';
import Button from '../ui/Button';

const dashboardModules = [
  { name: 'Dashboard Overview', tab: 'dashboard', icon: Home, category: 'Core' },
  { name: 'Yield Prediction', tab: 'yield-prediction', icon: TrendingUp, category: 'AI Analytics' },
  { name: 'Live Auctions', tab: 'auctions', icon: Gavel, category: 'Auctions' },
  { name: 'Live Plantation Intelligence', tab: 'intelligence', icon: Sparkles, category: 'Telemetry' },
  { name: 'Expert Consultation Desk', tab: 'expert', icon: UserCheck, category: 'Expert Advisory' },
  { name: 'My Plantation Hub', tab: 'plantations', icon: Leaf, category: 'Plantations' },
  { name: 'Workforce & Workers', tab: 'workforce', icon: Users, category: 'Workforce' },
  { name: 'Weather Intelligence', tab: 'weather', icon: CloudSun, category: 'Weather' },
  { name: 'AI Fertilizer Advisor', tab: 'ai', icon: Sparkles, category: 'AI Advisory' },
  { name: 'Marketplace & Plots', tab: 'plots', icon: MapPin, category: 'Marketplace' },
  { name: 'Community Hub', tab: 'community', icon: Users, category: 'Community' },
];

const Navbar = ({ sidebarCollapsed, onToggleSidebar, onToggleMobileSidebar }) => {
  const { isAuthenticated, user, logout, lang, toggleLang, darkMode, toggleDarkMode, easyMode, toggleEasyMode, notifications = [], clearNotifications, markNotificationsRead } = useAuth();
  const { startListening, isListening } = useVoiceNavigation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [plantationsList, setPlantationsList] = useState([]);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    apiService.getDBStatus();
  }, []);

  // Load plantations list for live search indexing
  useEffect(() => {
    const loadSearchIndex = async () => {
      try {
        const res = await apiService.getPlantations();
        if (res && res.success && Array.isArray(res.data)) {
          setPlantationsList(res.data);
        }
      } catch (err) {
        console.error('Failed to load search index:', err);
      }
    };
    if (isAuthenticated) loadSearchIndex();
  }, [isAuthenticated]);

  // Click outside listener for search suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loggedOutNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'Growth Journey', href: '/#growth-journey' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'FAQ', href: '/#faq' },
  ];

  const userRoleClean = (user?.role || '').toLowerCase();
  const isAdminUser = userRoleClean.includes('admin') || (user?.email || '').toLowerCase().includes('admin');
  const isSupervisorUser = userRoleClean === 'supervisor';

  const loggedInNavLinks = isSupervisorUser
    ? [
      { name: 'Supervisor Hub', href: '/dashboard?tab=workforce', icon: ShieldCheck },
      { name: 'Messages', href: '/dashboard?tab=messages', icon: MessageSquare },
      { name: 'Profile', href: '/dashboard?tab=dashboard', icon: User },
    ]
    : [
      ...(isAdminUser ? [{ name: 'Admin Portal', href: '/dashboard?tab=admin', icon: Shield }] : []),
      { name: 'Dashboard', href: '/dashboard?tab=dashboard', icon: Home },
      { name: 'Yield Prediction', href: '/dashboard?tab=yield-prediction', icon: TrendingUp },
      { name: 'Live Auctions', href: '/dashboard?tab=auctions', icon: Gavel },
      { name: 'Live Intelligence', href: '/dashboard?tab=intelligence', icon: Sparkles },
      { name: 'Expert Consultation', href: '/dashboard?tab=expert', icon: UserCheck },
      { name: 'My Plantation', href: '/dashboard?tab=plantations', icon: Leaf },
      { name: 'Workforce & Workers', href: '/dashboard?tab=workforce', icon: Users },
      { name: 'Messages', href: '/dashboard?tab=messages', icon: MessageSquare },
      { name: 'Weather Intelligence', href: '/dashboard?tab=weather', icon: CloudSun },
      { name: 'AI Recommendations', href: '/dashboard?tab=ai', icon: Sparkles },
      { name: 'Marketplace', href: '/dashboard?tab=plots', icon: MapPin },
      { name: 'Community', href: '/dashboard?tab=community', icon: Users },
      { name: 'Profile', href: '/dashboard?tab=dashboard', icon: User },
    ];

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/auth?mode=login');
  };

  const handleMobileToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingModules = trimmedQuery
    ? dashboardModules.filter(m =>
      m.name.toLowerCase().includes(trimmedQuery) ||
      m.category.toLowerCase().includes(trimmedQuery) ||
      m.tab.toLowerCase().includes(trimmedQuery)
    )
    : [];

  const matchingPlantations = trimmedQuery
    ? plantationsList.filter(p =>
      (p.name && p.name.toLowerCase().includes(trimmedQuery)) ||
      (p.variety && p.variety.toLowerCase().includes(trimmedQuery)) ||
      (p.district && p.district.toLowerCase().includes(trimmedQuery)) ||
      (p.village && p.village.toLowerCase().includes(trimmedQuery))
    )
    : [];

  const handleSelectSearchResult = (targetTab, searchParam = '') => {
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    if (searchParam) {
      navigate(`/dashboard?tab=${targetTab}&search=${encodeURIComponent(searchParam)}`);
    } else {
      navigate(`/dashboard?tab=${targetTab}`);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const targetTab = (currentTab === 'plantations' || currentTab === 'workforce' || currentTab === 'community' || currentTab === 'auctions' || currentTab === 'plots')
      ? currentTab
      : 'plantations';

    handleSelectSearchResult(targetTab, searchQuery.trim());
  };

  return (
    <motion.nav
      initial={{ y: -80, scale: 0.98 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-[#04160E]/90 backdrop-blur-md border-b border-[#CDE3D5] dark:border-[#1A402D]/80 shadow-md transition-colors"
    >
      <div className="h-full w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">

        {/* Left Section: Menu Toggle, Sidebar Collapse Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {isAuthenticated && (
            <>
              {/* Mobile Drawer Menu Toggle (< lg screens) */}
              <button
                onClick={handleMobileToggle}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#0D261B] transition-colors focus:outline-none cursor-pointer border border-[#CDE3D5] dark:border-[#1A402D] shadow-xs shrink-0"
                title="Toggle Mobile Navigation Menu"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Desktop Sidebar Collapse Toggle Button in Header (lg+ screens) */}
              <button
                type="button"
                onClick={handleMobileToggle}
                className="hidden lg:flex p-2 rounded-xl text-slate-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#0D261B] transition-colors focus:outline-none cursor-pointer border border-[#CDE3D5] dark:border-[#1A402D] shadow-xs shrink-0 items-center justify-center"
                title={sidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669] dark:text-emerald-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669] dark:text-emerald-400" />
                )}
              </button>
            </>
          )}

          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[#059669]/30 rounded-xl blur-sm group-hover:scale-110 transition-transform" />
              <div className="relative bg-gradient-to-br from-[#059669] via-[#047857] to-[#06150D] rounded-xl p-2 text-amber-300 shadow-md border border-amber-400/30">
                <Leaf className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-base sm:text-lg md:text-xl font-black tracking-wider text-[#06150D] dark:text-white font-poppins flex items-center gap-1">
                CARDORA
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </span>
              <span className="text-[8px] uppercase font-extrabold tracking-widest text-[#059669] dark:text-emerald-400 -mt-1 hidden sm:inline-block">
                Smart Agriculture AI
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section: Live Search Bar */}
        {isAuthenticated ? (
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xs lg:max-w-md xl:max-w-lg mx-2 lg:mx-4 min-w-0 shrink relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full min-w-0">
              <Search className="w-4 h-4 text-[#059669] dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                placeholder={lang === 'ml' ? "ഡാഷ്‌ബോർഡ് അല്ലെങ്കിൽ കർഷകരെ തിരയുക..." : "Search farmers, plantations, workers..."}
                className="w-full min-w-0 pl-10 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-[#EAF4EE] dark:bg-[#0B2117] border border-[#CDE3D5] dark:border-[#1A402D] text-[#06150D] dark:text-emerald-100 placeholder:text-slate-400 dark:placeholder:text-emerald-600/70 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/30 transition-all shadow-inner truncate"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* LIVE INTERACTIVE SEARCH SUGGESTIONS DROPDOWN */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#081E12] rounded-2xl border border-[#CDE3D5] dark:border-[#1A402D] shadow-2xl p-3 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 font-sans text-left">
                
                {/* 1. Modules & System Features */}
                {matchingModules.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-black uppercase text-[#059669] dark:text-emerald-400 tracking-wider px-2 block mb-1">
                      System Modules ({matchingModules.length})
                    </span>
                    <div className="space-y-1">
                      {matchingModules.map((m) => {
                        const Icon = m.icon;
                        return (
                          <div
                            key={m.tab}
                            onClick={() => handleSelectSearchResult(m.tab, searchQuery.trim())}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#EAF4EE] dark:hover:bg-[#0D261B] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#059669] dark:text-emerald-400">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#059669] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/30">
                              Open {m.category}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Plantations / Plots */}
                {matchingPlantations.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider px-2 block mb-1">
                      Plantations ({matchingPlantations.length})
                    </span>
                    <div className="space-y-1">
                      {matchingPlantations.map((p) => (
                        <div
                          key={p._id || p.id}
                          onClick={() => handleSelectSearchResult('plantations', p.name)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#EAF4EE] dark:hover:bg-[#0D261B] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              <Leaf className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-emerald-400/80">{p.variety || 'Cardamom'} • {p.district || p.village || 'Idukki'}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            View Plantation
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Filter Action Button */}
                <div
                  onClick={() => handleSearchSubmit()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] text-white flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity mt-2 shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="text-xs font-bold">Search all for "{searchQuery.trim()}"</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">Press Enter ↵</span>
                </div>

              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            {loggedOutNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-bold text-[#06150D] dark:text-slate-200 hover:text-[#059669] dark:hover:text-emerald-400 transition-colors py-1"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Right Controls Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">

          {/* Mobile Search Icon Toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-full bg-[#EAF4EE] dark:bg-[#0B2117] text-[#059669] dark:text-emerald-400 border border-[#CDE3D5] dark:border-[#1A402D] shrink-0"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Universal Voice Navigation Button */}
          <button
            onClick={startListening}
            className={`p-1.5 sm:px-2.5 lg:px-3 rounded-full text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 border cursor-pointer shrink-0 ${isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-lg shadow-rose-900/40'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 border-amber-300 text-slate-950 hover:scale-105 shadow-md shadow-amber-950/20'
              }`}
            title="Voice Navigation (പറയൂ, Cardora ചെയ്യും)"
          >
            <Mic className={`w-4 h-4 shrink-0 ${isListening ? 'text-white' : 'text-slate-950'}`} />
            <span className="hidden lg:inline">{isListening ? 'Listening...' : 'Voice 🎙️'}</span>
          </button>

          {/* Farmer Easy Mode Toggle */}
          <button
            onClick={toggleEasyMode}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 sm:gap-1.5 border cursor-pointer shrink-0 ${easyMode
                ? 'bg-[#059669] border-emerald-400 text-white font-black shadow-md ring-2 ring-emerald-400/40'
                : 'bg-[#EAF4EE] dark:bg-[#0B2117] border-[#CDE3D5] dark:border-[#1A402D] text-[#06150D] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#0D261B]'
              }`}
            title="Farmer Easy Mode / വലിയ അക്ഷരങ്ങൾ"
          >
            <span className="text-sm shrink-0">🌿</span>
            <span className="hidden xl:inline">{easyMode ? (lang === 'ml' ? 'ഈസി ACTIVE' : 'Easy ON') : (lang === 'ml' ? 'ഈസി' : 'Easy')}</span>
          </button>

          {/* Language Selector Button */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#EAF4EE] dark:bg-[#0B2117] hover:bg-emerald-100 dark:hover:bg-[#0D261B] text-[#06150D] dark:text-emerald-300 text-xs font-black transition-colors border border-[#CDE3D5] dark:border-[#1A402D] shrink-0"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-[#059669] dark:text-emerald-400 shrink-0" />
            <span>{lang === 'en' ? 'EN' : 'ML'}</span>
          </button>

          {/* Dark/Light Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full text-xs font-bold transition-all border shrink-0 ${darkMode
              ? 'bg-[#0B2117] border-[#1A402D] text-amber-300 hover:bg-[#0D261B] shadow-inner'
              : 'bg-[#EAF4EE] border-[#CDE3D5] text-[#06150D] hover:bg-emerald-100 shadow-xs'
              }`}
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-[#1F5E3B] shrink-0" />}
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/auth?mode=login"
                className="px-3 py-1.5 text-xs font-bold text-[#06150D] dark:text-slate-200 hover:text-[#059669] dark:hover:text-emerald-400 transition-colors"
              >
                Login
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-[#CDE3D5] dark:border-[#1A402D] shrink-0">

              {/* Notification Bell */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                    if (!showNotificationsDropdown && markNotificationsRead) markNotificationsRead();
                  }}
                  className="relative p-1.5 rounded-lg bg-[#F4F8F3] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 hover:border-[#1F5E3B] text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-[#D7E6D5] dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 font-sans">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-poppins">Real-Time Notifications</h4>
                        {notifications.filter((n) => !n.read).length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <span className="text-[10px] font-black text-[#1F5E3B] bg-[#EAF3E8] dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            {notifications.filter((n) => !n.read).length} Unread
                          </span>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={() => clearNotifications && clearNotifications()}
                            className="text-[10px] font-extrabold text-red-600 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs max-h-72 overflow-y-auto scrollbar-none">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center space-y-1">
                          <p className="text-xs font-bold text-slate-400">No new notifications.</p>
                          <p className="text-[10px] text-slate-400">Logins, messages, registrations & alerts will appear here live.</p>
                        </div>
                      ) : (
                        notifications.map((n, idx) => {
                          const nType = (n.type || '').toLowerCase();
                          let iconSymbol = '🔔';
                          if (nType.includes('login')) iconSymbol = '🔐';
                          else if (nType.includes('message')) iconSymbol = '💬';
                          else if (nType.includes('alert') || nType.includes('weather')) iconSymbol = '⚠️';
                          else if (nType.includes('register') || nType.includes('registration')) iconSymbol = '👤';
                          else if (nType.includes('work') || nType.includes('task')) iconSymbol = '📋';

                          return (
                            <div
                              key={n._id || n.id || idx}
                              onClick={() => {
                                setShowNotificationsDropdown(false);
                                if (markNotificationsRead) markNotificationsRead();
                                if (n.link) navigate(n.link);
                                else if (nType.includes('message')) navigate('/dashboard?tab=messages');
                                else if (nType.includes('login') || nType.includes('register')) navigate('/dashboard?tab=admin');
                                else navigate('/dashboard');
                              }}
                              className={`p-3 rounded-2xl transition-all cursor-pointer border flex items-start gap-2.5 ${!n.read
                                ? 'bg-[#EAF3E8]/80 dark:bg-slate-800 border-[#1F5E3B]/40 shadow-xs'
                                : 'bg-slate-50/70 dark:bg-slate-850 border-slate-100 dark:border-slate-800 hover:bg-slate-100'
                                }`}
                            >
                              <span className="text-base shrink-0 mt-0.5">{iconSymbol}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-extrabold text-slate-900 dark:text-white truncate font-poppins">{n.title}</p>
                                  <span className="text-[9px] text-[#5C8D4E] font-bold shrink-0">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (n.time || 'Just now')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.message || n.body}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Badge & Link */}
              <Link to="/dashboard?tab=dashboard" className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F4F8F3] dark:hover:bg-slate-800 transition-colors">
                <img
                  src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`}
                  alt={user?.fullName || 'User avatar'}
                  className="w-7 h-7 rounded-full object-cover border border-[#1F5E3B]"
                />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white hidden xl:inline-block max-w-[100px] truncate">
                  {user?.fullName || user?.name || user?.username || 'Planter'}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Expandable Search Bar */}
      <AnimatePresence>
        {showMobileSearch && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-[#06150D]/95 backdrop-blur-xl border-b border-[#CDE3D5] dark:border-[#1A402D] px-4 py-2.5 shadow-lg"
          >
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-[#059669] dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/dashboard?tab=community&search=${encodeURIComponent(searchQuery.trim())}`);
                    setShowMobileSearch(false);
                  }
                }}
                placeholder={lang === 'ml' ? "ഡാഷ്‌ബോർഡ് അല്ലെങ്കിൽ കർഷകരെ തിരയുക..." : "Search farmers, plantations, workers..."}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full bg-[#EAF4EE] dark:bg-[#0B2117] border border-[#CDE3D5] dark:border-[#1A402D] text-[#06150D] dark:text-emerald-100 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#D7E6D5] px-6 py-6 shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {!isAuthenticated ? (
                <>
                  {loggedOutNavLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-bold text-[#17331F] py-2 border-b border-[#D7E6D5]/50"
                    >
                      {link.name}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 pt-4">
                    <Link to="/auth?mode=login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" size="md" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {loggedInNavLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-base font-bold text-[#17331F] py-2.5 border-b border-[#D7E6D5]/50"
                    >
                      <link.icon className="w-5 h-5 text-[#5C8D4E]" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1F5E3B]" />
                      <div>
                        <p className="text-sm font-black text-[#17331F]">{user?.fullName || user?.username || 'Planter'}</p>
                        <p className="text-xs text-[#5C8D4E] font-bold">{user?.district || user?.location || 'Idukki'}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold text-xs"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;