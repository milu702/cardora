import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Bell,
  Search,
  Shield,
  Moon,
  Sun,
  CloudSun,
  MessageSquare,
  ShieldCheck,
  Gavel
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import Button from '../ui/Button';

const Navbar = ({ onToggleMobileSidebar }) => {
  const { isAuthenticated, user, logout, lang, toggleLang, darkMode, toggleDarkMode, notifications = [], clearNotifications, markNotificationsRead } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
        { name: 'Profile', href: '/dashboard?tab=profile', icon: User },
      ]
    : [
        ...(isAdminUser ? [{ name: 'Admin Portal', href: '/dashboard?tab=admin', icon: Shield }] : []),
        { name: 'Dashboard', href: '/dashboard?tab=dashboard', icon: Home },
        { name: 'Live Auctions', href: '/dashboard?tab=auctions', icon: Gavel },
        { name: 'Live Intelligence', href: '/dashboard?tab=intelligence', icon: Sparkles },
        { name: 'My Plantation', href: '/dashboard?tab=plantations', icon: Leaf },
        { name: 'Workforce & Workers', href: '/dashboard?tab=workforce', icon: Users },
        { name: 'Messages', href: '/dashboard?tab=messages', icon: MessageSquare },
        { name: 'Weather Intelligence', href: '/dashboard?tab=weather', icon: CloudSun },
        { name: 'AI Recommendations', href: '/dashboard?tab=ai', icon: Sparkles },
        { name: 'Marketplace', href: '/dashboard?tab=plots', icon: MapPin },
        { name: 'Community', href: '/dashboard?tab=community', icon: Users },
        { name: 'Profile', href: '/dashboard?tab=profile', icon: User },
      ];

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/auth?mode=login');
  };

  const handleMobileToggle = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  return (
    <motion.nav
      initial={{ y: -80, scale: 0.98 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 shadow-sm transition-colors"
    >
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={handleMobileToggle}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-[#F1F7F0] dark:hover:bg-slate-800 transition-colors focus:outline-none"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#1F5E3B]/20 rounded-xl blur-sm group-hover:scale-105 transition-transform" />
              <div className="relative bg-gradient-to-br from-[#1F5E3B] to-[#5C8D4E] rounded-xl p-2 text-white shadow-xs">
                <Leaf className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black tracking-wider text-[#17331F] dark:text-white font-poppins">
                CARDORA
              </span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-[#5C8D4E] dark:text-emerald-400 -mt-1 hidden sm:inline-block">
                Smart Agriculture
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section: Search Bar */}
        {isAuthenticated ? (
          <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden sm:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#5C8D4E] dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/dashboard?tab=community&search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                placeholder={lang === 'ml' ? "ഡാഷ്‌ബോർഡ് അല്ലെങ്കിൽ കർഷകരെ തിരയുക..." : "Search farmers, plantations, workers..."}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-[#F4F8F3] dark:bg-slate-800/80 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1F5E3B] focus:ring-1 focus:ring-[#1F5E3B] transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-5">
            {loggedOutNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-bold text-[#17331F] dark:text-slate-200 hover:text-[#1F5E3B] dark:hover:text-emerald-400 transition-colors py-1"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Right Controls Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Selector Button */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EAF3E8] dark:bg-slate-800 hover:bg-[#DDEFD9] dark:hover:bg-slate-700 text-[#17331F] dark:text-emerald-300 text-xs font-black transition-colors border border-[#5C8D4E]/30 dark:border-slate-700"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-[#1F5E3B] dark:text-emerald-400" />
            <span>{lang === 'en' ? 'EN' : 'മലയാളം'}</span>
          </button>

          {/* Dark/Light Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors border ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-[#EAF3E8] border-[#5C8D4E]/30 text-[#17331F] hover:bg-[#DDEFD9]'
            }`}
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1F5E3B]" />}
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/auth?mode=login">
                <button className="px-3 py-1.5 text-xs font-bold text-[#17331F] dark:text-slate-200 hover:text-[#1F5E3B]">
                  Login
                </button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-[#D7E6D5] dark:border-slate-800">
              
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                    if (!showNotificationsDropdown && markNotificationsRead) markNotificationsRead();
                  }}
                  className="relative p-1.5 rounded-lg bg-[#F4F8F3] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 hover:border-[#1F5E3B] text-slate-700 dark:text-slate-200 transition-colors"
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
                              className={`p-3 rounded-2xl transition-all cursor-pointer border flex items-start gap-2.5 ${
                                !n.read
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
              <Link to="/dashboard?tab=profile" className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F4F8F3] dark:hover:bg-slate-800 transition-colors">
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