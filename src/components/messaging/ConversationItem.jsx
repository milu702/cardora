import React from 'react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getRoleBadgeStyle = (role = '') => {
  const r = role.toLowerCase();
  if (r.includes('admin')) return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300';
  if (r.includes('supervis') || r.includes('contractor')) return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300';
  if (r.includes('worker') || r.includes('labor')) return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300';
  return 'bg-[#EAF3E8] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-400 border-emerald-300';
};

const ConversationItem = ({ conversation, isActive, onClick, darkMode }) => {
  const { user, lastMessage, unreadCount } = conversation;
  const partnerName = user?.name || user?.username || 'Cardora User';
  const avatar = user?.avatar || user?.profilePhoto || '';
  const role = user?.role || 'Farmer';
  const initial = partnerName[0] ? partnerName[0].toUpperCase() : 'U';

  const lastText = lastMessage?.text || 'No messages yet';
  const timeFormatted = formatTimeAgo(lastMessage?.createdAt);
  const isUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl transition-all cursor-pointer border flex items-center justify-between gap-3 group ${
        isActive
          ? 'bg-[#EAF3E8] dark:bg-slate-800 border-[#1F5E3B] dark:border-emerald-500/50 shadow-xs'
          : darkMode
          ? 'bg-slate-900 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
      }`}
    >
      {/* AVATAR WITH ONLINE BADGE */}
      <div className="relative shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={partnerName}
            className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1F5E3B] to-[#5C8D4E] text-white flex items-center justify-center font-black text-sm shadow-xs font-poppins">
            {initial}
          </div>
        )}
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
      </div>

      {/* MID CONTENT: NAME, ROLE, LAST MESSAGE */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <h4 className={`text-xs font-black truncate font-poppins ${
            isUnread ? 'text-[#1F5E3B] dark:text-emerald-400 font-extrabold' : 'text-slate-900 dark:text-white'
          }`}>
            {partnerName}
          </h4>
          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            {timeFormatted}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={`text-[11px] truncate leading-tight ${
            isUnread ? 'font-black text-slate-900 dark:text-slate-100' : 'font-medium text-slate-500 dark:text-slate-400'
          }`}>
            {lastText}
          </p>

          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border shrink-0 uppercase tracking-wider ${getRoleBadgeStyle(role)}`}>
            {role}
          </span>
        </div>
      </div>

      {/* UNREAD BADGE */}
      {unreadCount > 0 && (
        <div className="w-5 h-5 rounded-full bg-[#1F5E3B] text-white text-[10px] font-black flex items-center justify-center shadow-xs shrink-0 font-poppins">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default ConversationItem;
