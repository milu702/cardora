import React from 'react';
import { MessageSquare, Sparkles, PlusCircle, CheckCircle2 } from 'lucide-react';

const EmptyChatState = ({ type = 'noSelected', onStartNewChat, darkMode }) => {
  if (type === 'noConversations') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center font-sans space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EAF3E8] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center shadow-inner">
          <CheckCircle2 size={32} />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-poppins">You're All Caught Up</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            You don't have any active conversations yet. Start a conversation with a farmer, supervisor, worker, or buyer to begin messaging.
          </p>
        </div>
        {onStartNewChat && (
          <button
            onClick={onStartNewChat}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Start New Conversation</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center font-sans space-y-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EAF3E8] to-[#DDEFD9] dark:from-emerald-950/90 dark:to-slate-900 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center shadow-sm border border-[#D7E6D5] dark:border-slate-800">
        <MessageSquare size={36} />
      </div>
      <div className="max-w-md space-y-2">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-poppins">Your Messages</h3>
          <Sparkles className="w-4 h-4 text-[#C9A227]" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Select a conversation from the left to start chatting with farmers, supervisors, buyers, and Cardora agricultural experts.
        </p>
      </div>
      {onStartNewChat && (
        <button
          onClick={onStartNewChat}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>New Message</span>
        </button>
      )}
    </div>
  );
};

export default EmptyChatState;
