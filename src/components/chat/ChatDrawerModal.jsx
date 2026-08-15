import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Sparkles } from 'lucide-react';
import MessagingModule from '../messaging/MessagingModule';

const ChatDrawerModal = ({ targetUser, isOpen, onClose, onToast }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-md animate-in fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-6xl h-[88vh] max-h-[850px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans flex flex-col relative"
        >
          {/* MODAL TITLE & CLOSE BAR */}
          <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3E8] dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center font-bold">
                <MessageSquare size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-poppins flex items-center gap-1.5">
                <span>Cardora Messaging Portal</span>
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Messages"
            >
              <X size={18} />
            </button>
          </div>

          {/* MESSAGING MODULE INTEGRATION */}
          <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-[#F8FAF7]/60 dark:bg-slate-950">
            <MessagingModule
              initialTargetUser={targetUser}
              onToast={onToast}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChatDrawerModal;
