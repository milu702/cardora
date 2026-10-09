import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check, Sparkles } from 'lucide-react';

/**
 * FullScreenFormModal — Project-wide shared full-screen application-style modal dialog
 *
 * Provides a standardized full-screen UX for multi-step wizards, forms, and creation flows:
 * - Top header with title, badge, step indicator, and close button
 * - Main 2-column grid layout (Form left, Context/Preview right)
 * - Sticky footer action bar for step controls & submit buttons
 */
const FullScreenFormModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badgeText,
  badgeIcon: BadgeIcon = Sparkles,
  currentStep,
  totalSteps,
  steps = [],
  onStepClick,
  rightPanel,
  footerActions,
  children,
  maxWidth = 'max-w-7xl',
}) => {
  // Handle ESC key press to close modal safely
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center p-0 sm:p-3 md:p-5 font-sans">
        
        {/* BACKDROP BLUR OVERLAY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-0"
        />

        {/* MAIN FULL-SCREEN CONTAINER CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className={`relative z-10 w-full ${maxWidth} h-full sm:h-[96vh] bg-[#F8FAF7] dark:bg-[#06150D] text-slate-900 dark:text-slate-100 sm:rounded-3xl border border-[#CDE3D5] dark:border-[#1A402D] shadow-2xl flex flex-col overflow-hidden`}
        >
          
          {/* ===== 1. FIXED TOP HEADER ===== */}
          <header className="shrink-0 z-30 px-4 sm:px-6 py-3.5 bg-white dark:bg-[#081E12] border-b border-[#D7E6D5] dark:border-[#1A402D] flex items-center justify-between gap-4 shadow-xs">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-3 min-w-0">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
                  title="Close Form (Esc)"
                >
                  <ArrowLeft className="w-5 h-5 text-[#1F5E3B] dark:text-emerald-400" />
                </button>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {badgeText && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3E8] dark:bg-emerald-950/80 text-[#1F5E3B] dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-[#5C8D4E]/30 flex items-center gap-1">
                      <BadgeIcon className="w-3 h-3" />
                      {badgeText}
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-black text-[#17331F] dark:text-white font-poppins truncate tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Step Wizard Indicator Pills */}
            {steps && steps.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                {steps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = currentStep === stepNum;
                  const isCompleted = currentStep > stepNum;
                  const label = typeof step === 'string' ? step : step.label;

                  return (
                    <div
                      key={stepNum}
                      onClick={() => isCompleted && onStepClick && onStepClick(stepNum)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isCompleted ? 'cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' : ''
                      } ${
                        isCurrent
                          ? 'bg-[#1F5E3B] text-white shadow-sm font-black'
                          : isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isCurrent
                            ? 'bg-white text-[#1F5E3B]'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stepNum}
                      </div>
                      <span className="truncate max-w-[120px]">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile Step Counter & Close Button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {totalSteps && (
                <span className="md:hidden text-xs font-black px-2.5 py-1 rounded-xl bg-[#EAF3E8] text-[#1F5E3B] dark:bg-emerald-950 dark:text-emerald-300">
                  Step {currentStep || 1} / {totalSteps}
                </span>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>

          {/* ===== 2. SCROLLABLE BODY CONTENT ===== */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto h-full">
              {rightPanel ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  
                  {/* MAIN FORM CONTENT (7/12 = ~60-65% width) */}
                  <div className="lg:col-span-7 space-y-6">
                    {children}
                  </div>

                  {/* RIGHT CONTEXT / PREVIEW PANEL (5/12 = ~35-40% width) */}
                  <div className="lg:col-span-5 lg:sticky lg:top-2 space-y-6">
                    {rightPanel}
                  </div>
                </div>
              ) : (
                /* SINGLE COLUMN FULL-WIDTH FORM (Centered max-w-4xl) */
                <div className="max-w-4xl mx-auto space-y-6">
                  {children}
                </div>
              )}
            </div>
          </div>

          {/* ===== 3. STICKY FOOTER ACTION BAR ===== */}
          {footerActions && (
            <footer className="shrink-0 z-30 px-4 sm:px-6 py-3.5 bg-white dark:bg-[#081E12] border-t border-[#D7E6D5] dark:border-[#1A402D] shadow-md flex items-center justify-between gap-3">
              {footerActions}
            </footer>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FullScreenFormModal;
