import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Sparkles, MessageSquare } from 'lucide-react';

const MessageList = ({ messages = [], loading, partner, currentUserId, onDeleteMessage, darkMode }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2/3 p-4 rounded-2xl animate-pulse ${
              i % 2 === 0 ? 'ml-auto bg-[#EAF3E8]' : 'bg-slate-100'
            }`}
          >
            <div className="h-3 bg-slate-300 rounded-full w-3/4 mb-2" />
            <div className="h-2 bg-slate-200 rounded-full w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-sans bg-slate-50/50 dark:bg-slate-900/50">
      
      {/* CHAT THREAD ENCRYPTION BANNER */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs max-w-md mx-auto text-center space-y-1 my-2">
        <span className="text-[10px] font-black text-[#1F5E3B] dark:text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-[#C9A227]" />
          Cardora Direct End-to-End Encrypted
        </span>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Messages & audio recordings are private between you and <strong className="text-slate-700 dark:text-slate-200">{partner?.name || 'this contact'}</strong>.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EAF3E8] text-[#1F5E3B] flex items-center justify-center mx-auto shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500">No messages yet. Send a greeting to start chatting!</p>
        </div>
      ) : (
        messages.map((msg, idx) => {
          const isMine = msg.isMine || (msg.senderId && msg.senderId.toString() === currentUserId?.toString());
          return (
            <MessageBubble
              key={msg.id || msg._id || idx}
              message={msg}
              isMine={isMine}
              partnerName={partner?.name}
              onDeleteMessage={isMine ? onDeleteMessage : null}
              darkMode={darkMode}
            />
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
