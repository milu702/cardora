import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Trash2, Shield, 
  MessageSquare, AlertTriangle, UserPlus, Sparkles,
  ArrowRight, CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getNotifCategory = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('login') || t.includes('security')) return 'logins';
  if (t.includes('message')) return 'messages';
  if (t.includes('alert') || t.includes('weather')) return 'alerts';
  if (t.includes('register') || t.includes('registration')) return 'registrations';
  return 'general';
};

const getNotifIcon = (type = '') => {
  const cat = getNotifCategory(type);
  if (cat === 'logins') return <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
  if (cat === 'messages') return <MessageSquare className="w-5 h-5 text-[#1F5E3B] dark:text-emerald-400" />;
  if (cat === 'alerts') return <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
  if (cat === 'registrations') return <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  return <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
};

const getNotifBadgeStyle = (type = '') => {
  const cat = getNotifCategory(type);
  if (cat === 'logins') return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300';
  if (cat === 'messages') return 'bg-[#EAF3E8] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-300 border-emerald-300';
  if (cat === 'alerts') return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300';
  if (cat === 'registrations') return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300';
};

const NotificationModule = () => {
  const { notifications = [], markNotificationsRead, clearNotifications, darkMode } = useAuth();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'logins' | 'messages' | 'alerts' | 'registrations'
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((n) => {
    const cat = getNotifCategory(n.type);
    if (filter === 'unread') return !n.read;
    if (filter === 'logins') return cat === 'logins';
    if (filter === 'messages') return cat === 'messages';
    if (filter === 'alerts') return cat === 'alerts';
    if (filter === 'registrations') return cat === 'registrations';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#EAF3E8] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-400 font-bold shadow-xs">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2">
                <span>Real-Time Notification Center</span>
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync Active
                </span>
                <span>•</span>
                <span>Audit security logins, direct messages, IoT alerts & signups</span>
              </p>
            </div>
          </div>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={() => markNotificationsRead && markNotificationsRead()}
              className="px-4 py-2 rounded-xl bg-[#EAF3E8] hover:bg-[#DDEFD9] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#D7E6D5] dark:border-slate-700"
            >
              <CheckCheck size={15} />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => clearNotifications && clearNotifications()}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-800"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'logins', label: 'Security & Logins' },
          { id: 'messages', label: 'Direct Messages' },
          { id: 'alerts', label: 'Weather Alerts' },
          { id: 'registrations', label: 'Registrations' },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#1F5E3B] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-emerald-900 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATIONS CARDS LIST */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white font-poppins">No Notifications Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filter === 'all'
                ? 'You do not have any notifications yet. Real-time updates for logins, messages, registrations, and weather alerts will appear here.'
                : `No notifications matching the "${filter}" filter.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n, idx) => {
            const cat = getNotifCategory(n.type);

            return (
              <motion.div
                key={n._id || n.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (n.link) navigate(n.link);
                  else if (cat === 'messages') navigate('/dashboard?tab=messages');
                  else if (cat === 'logins' || cat === 'registrations') navigate('/dashboard?tab=admin');
                  else if (cat === 'alerts') navigate('/dashboard?tab=weather');
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  !n.read
                    ? 'bg-[#EAF3E8]/90 dark:bg-slate-850 border-[#1F5E3B]/40 shadow-sm hover:border-[#1F5E3B]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                    {getNotifIcon(n.type)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-poppins">
                        {n.title}
                      </h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getNotifBadgeStyle(n.type)}`}>
                        {cat}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {n.message || n.body}
                    </p>

                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-0.5">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (n.time || 'Just now')}
                    </p>
                  </div>
                </div>

                <div className="self-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-[#1F5E3B] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0">
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default NotificationModule;
