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
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import Button from '../ui/Button';

const Navbar = () => {
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

  const isAdminUser = (user?.role || '').toLowerCase() === 'admin';

  const loggedInNavLinks = isAdminUser
    ? [
        { name: 'Admin Portal', href: '/dashboard?tab=admin', icon: Shield },
        { name: 'Profile', href: '/dashboard?tab=profile', icon: User },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard?tab=dashboard', icon: Home },
        { name: 'My Plantation', href: '/dashboard?tab=plantations', icon: Leaf },
        { name: 'AI Recommendations', href: '/dashboard?tab=ai', icon: Sparkles },
        { name: 'Community', href: '/dashboard?tab=community', icon: Users },
        { name: 'Marketplace', href: '/dashboard?tab=plots', icon: MapPin },
        { name: 'Profile', href: '/dashboard?tab=profile', icon: User },
      ];

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/auth?mode=login');
  };

  return (
    <motion.nav
      initial={{ y: -80, scale: 0.98 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-nav-scrolled py-3' : 'glass-nav py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#1F5E3B]/30 rounded-xl blur-lg group-hover:scale-110 transition-transform duration-300" />
              <div className="relative bg-gradient-to-br from-[#1F5E3B] to-[#5C8D4E] rounded-xl p-2.5 text-white shadow-md">
                <Leaf className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black tracking-wider text-[#17331F] font-poppins">
                CARDORA
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#5C8D4E] -mt-1">
                Agriculture Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-5">
          {!isAuthenticated ? (
            loggedOutNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="animated-underline text-sm font-bold text-[#17331F] hover:text-[#1F5E3B] transition-colors py-1"
              >
                {link.name}
              </a>
            ))
          ) : (
            loggedInNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="animated-underline flex items-center gap-1.5 text-xs font-bold text-[#17331F] hover:text-[#1F5E3B] transition-colors py-1"
              >
                <link.icon className="w-3.5 h-3.5 text-[#5C8D4E]" />
                <span>{link.name}</span>
              </Link>
            ))
          )}
        </div>

        {/* Global Planter Search Bar */}
        {isAuthenticated && (
          <div className="relative hidden md:block w-48 lg:w-56">
            <div className="flex items-center rounded-full bg-[#F8FAF7] border border-[#D7E6D5] focus-within:border-[#1F5E3B] px-3 py-1.5 shadow-inner transition-all">
              <Search className="w-3.5 h-3.5 text-[#5C8D4E] mr-1.5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/dashboard?tab=community&search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                placeholder="Search planter name..."
                className="w-full text-xs bg-transparent text-[#17331F] font-bold focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/dashboard?tab=community&search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="p-1 rounded-full bg-[#1F5E3B] text-white hover:bg-[#17331F] transition-colors ml-1"
                title="Search Planters"
              >
                <Search className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Action Controls & User Options */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DDEFD9] dark:bg-slate-800 hover:bg-[#D7E6D5] dark:hover:bg-slate-700 text-[#17331F] dark:text-slate-100 text-xs font-bold transition-all border border-[#5C8D4E]/30 dark:border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-[#1F5E3B] dark:text-emerald-400" />
            <span>{lang === 'en' ? 'EN' : 'മലയാളം'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              darkMode
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                : 'bg-[#DDEFD9] border-[#5C8D4E]/30 text-[#17331F] hover:bg-[#D7E6D5]'
            }`}
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#1F5E3B]" />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>

          {!isAuthenticated ? (
            <>
              <Link to="/auth?mode=login">
                <button className="px-4 py-2 text-xs md:text-sm font-bold text-[#17331F] hover:text-[#1F5E3B] transition-colors">
                  Login
                </button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 pl-2 border-l border-[#D7E6D5]">
              
              {/* Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                    if (!showNotificationsDropdown && markNotificationsRead) markNotificationsRead();
                  }}
                  className="relative p-2 rounded-full bg-white border border-[#D7E6D5] hover:border-[#1F5E3B] text-[#17331F] shadow-sm transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                  )}
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-[20px] border border-[#D7E6D5] shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D7E6D5]">
                      <h4 className="text-xs font-black text-[#17331F]">Notifications</h4>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <span className="text-[10px] font-bold text-[#1F5E3B] bg-[#DDEFD9] px-2 py-0.5 rounded-full">
                            {notifications.length} New
                          </span>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => clearNotifications && clearNotifications()}
                            className="text-[10px] font-bold text-red-600 hover:underline"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs font-bold text-[#4A5568] py-4">No notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5]">
                            <p className="font-bold text-[#17331F]">{n.title}</p>
                            <p className="text-[11px] text-[#4A5568] mt-0.5">{n.body}</p>
                            <span className="text-[9px] text-[#5C8D4E] font-bold mt-1 block">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu Link */}
              <Link to="/dashboard?tab=profile" className="flex items-center gap-2">
                <img
                  src={(user?.avatar || user?.profileImage || user?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || user?.username || 'Planter')}&background=1F5E3B&color=ffffff`}
                  alt={user?.fullName || 'User avatar'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#1F5E3B] shadow-sm"
                />
                <span className="text-xs font-black text-[#17331F]">
                  {user?.fullName || user?.name || user?.username || 'Planter'}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-[#17331F] hover:bg-[#DDEFD9] transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

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