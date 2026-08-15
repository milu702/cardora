import React, { useState } from 'react';
import { Search, PlusCircle, MessageSquare, Sparkles } from 'lucide-react';
import ConversationItem from './ConversationItem';

const ConversationList = ({ 
  conversations = [], 
  activeConversationId, 
  onSelectConversation, 
  onOpenNewChatModal, 
  loading,
  darkMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const name = c.user?.name || c.user?.username || '';
    const role = c.user?.role || '';
    const lastMsg = c.lastMessage?.text || '';
    const query = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      role.toLowerCase().includes(query) ||
      lastMsg.toLowerCase().includes(query)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="h-full flex flex-col font-sans bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* ===== LEFT PANEL HEADER ===== */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-1.5">
              <span>Cardora Messages</span>
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
            </h2>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#1F5E3B] text-white">
                {totalUnread} New
              </span>
            )}
          </div>

          <button
            onClick={onOpenNewChatModal}
            className="p-2 rounded-xl bg-[#EAF3E8] hover:bg-[#DDEFD9] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Start New Conversation"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline font-extrabold">New</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search messages, farmers, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1F5E3B]"
          />
        </div>
      </div>

      {/* ===== CONVERSATIONS SCROLLABLE LIST ===== */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
        {loading && conversations.length === 0 ? (
          /* SKELETON LOADER */
          <div className="space-y-2.5 p-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 animate-pulse flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          /* EMPTY SEARCH RESULT */
          <div className="py-12 text-center space-y-2 p-4">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No conversations found</p>
            <p className="text-[11px] text-slate-400 font-medium">Try searching another user name or role.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const partnerId = conv.user?.id || conv.user?._id;
            const isActive = activeConversationId && activeConversationId.toString() === partnerId?.toString();

            return (
              <ConversationItem
                key={partnerId}
                conversation={conv}
                isActive={isActive}
                onClick={() => onSelectConversation(conv)}
                darkMode={darkMode}
              />
            );
          })
        )}
      </div>

    </div>
  );
};

export default ConversationList;
