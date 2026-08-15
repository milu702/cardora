import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, MessageSquare, MapPin, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

const getRoleBadgeStyle = (role = '') => {
  const r = role.toLowerCase();
  if (r.includes('admin')) return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300';
  if (r.includes('supervis') || r.includes('contractor')) return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300';
  if (r.includes('worker') || r.includes('labor')) return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300';
  return 'bg-[#EAF3E8] dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400 border-emerald-300';
};

const NewChatModal = ({ isOpen, onClose, onSelectUser, darkMode }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiService.searchUsersForMessaging(query);
        if (res && res.success && Array.isArray(res.users)) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans flex flex-col max-h-[85vh]"
        >
          {/* MODAL HEADER */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-poppins flex items-center gap-1.5">
                  <span>Start New Conversation</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Search farmers, supervisors, contractors, and experts across Cardora
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, username, role (Farmer, Supervisor, Admin)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1F5E3B]"
              />
            </div>
          </div>

          {/* USER RESULTS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[220px]">
            {loading ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400">
                Searching Cardora users...
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No users found</p>
                <p className="text-[11px] text-slate-400 font-medium">Try searching another user name or role.</p>
              </div>
            ) : (
              users.map((u) => {
                const partnerName = u.name || u.username || 'Cardora User';
                const initial = partnerName[0] ? partnerName[0].toUpperCase() : 'U';

                return (
                  <div
                    key={u._id || u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[#EAF3E8]/50 dark:hover:bg-slate-800 hover:border-[#1F5E3B]/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={partnerName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1F5E3B] to-[#5C8D4E] text-white flex items-center justify-center font-black text-xs shrink-0 font-poppins">
                          {initial}
                        </div>
                      )}

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white font-poppins truncate">
                            {partnerName}
                          </h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(u.role)}`}>
                            {u.role || 'Farmer'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 truncate">
                          <MapPin size={11} className="text-[#1F5E3B]" />
                          <span>{u.location || u.district || 'Idukki, Kerala'}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-[#1F5E3B] group-hover:bg-[#16442b] text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
                    >
                      Chat
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewChatModal;
