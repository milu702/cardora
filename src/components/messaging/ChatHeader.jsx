import { ArrowLeft, MapPin, UserCheck } from 'lucide-react';

const getRoleBadgeStyle = (role = '') => {
  const r = role.toLowerCase();
  if (r.includes('admin')) return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300';
  if (r.includes('supervis') || r.includes('contractor')) return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300';
  if (r.includes('worker') || r.includes('labor')) return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300';
  return 'bg-[#EAF3E8] dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400 border-emerald-300';
};

const ChatHeader = ({ partner, onBack, onOpenProfile, darkMode }) => {
  if (!partner) return null;

  const partnerName = partner.name || partner.username || 'Planter User';
  const avatar = partner.avatar || partner.photo || partner.profilePhoto || '';
  const role = partner.role || 'Farmer';
  const location = partner.location || partner.district || 'Idukki, Kerala';
  const initial = partnerName[0] ? partnerName[0].toUpperCase() : 'U';

  return (
    <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 shadow-xs shrink-0 transition-colors">
      
      {/* LEFT: BACK BUTTON (MOBILE) + PARTNER AVATAR & INFO */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Back to Conversations"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={partnerName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F5E3B] to-[#5C8D4E] text-white flex items-center justify-center font-black text-xs shadow-xs font-poppins">
              {initial}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black text-slate-900 dark:text-white font-poppins truncate">
              {partnerName}
            </h3>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(role)}`}>
              {role}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Online
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="text-[#1F5E3B]" />
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2">
        {onOpenProfile && (
          <button
            onClick={() => onOpenProfile(partner)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <UserCheck size={14} className="text-[#1F5E3B]" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default ChatHeader;
