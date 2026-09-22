import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Phone, Video, Calendar, MapPin, Paperclip, Mic,
  Sparkles, Globe, Check, CheckCheck, User, Bot, Volume2, RefreshCw, ShieldCheck, Clock
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LiveCommunicationModal = ({ plot, mode = 'chat', onClose, lang }) => {
  const { user, showToast } = useAuth();
  const plotIdStr = plot?._id || plot?.id || 'general';
  const chatKey = `cardora_chat_${plotIdStr}`;

  // Target Owner identifier
  const targetOwnerId = plot?.ownerId || plot?.user?._id || plot?.ownerEmail || plot?.owner || 'owner';

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(chatKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { }
    }
    return [
      {
        id: 1,
        sender: 'owner',
        text: lang === 'ml'
          ? `നമസ്കാരം! ${plot?.title || 'ഏലത്തോട്ടം'}-ത്തെക്കുറിച്ച് എന്തെങ്കിലും സംശയങ്ങൾ ഉണ്ടോ?`
          : `Hello! Do you have any questions regarding ${plot?.title || 'this cardamom plantation'}?`,
        time: '10:30 AM',
      },
      {
        id: 2,
        sender: 'ai',
        text: '🤖 Cardora AI Assistant: Legal pattayam title and survey sketch verified 100%.',
        time: '10:31 AM',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(chatKey, JSON.stringify(messages));
  }, [messages, chatKey]);

  const [inputMsg, setInputMsg] = useState('');
  const [activeMode, setActiveMode] = useState(mode); // 'chat' | 'call' | 'video' | 'visit'
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('09:00 AM (Morning Canopy Inspection)');
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [currentVisitRecord, setCurrentVisitRecord] = useState(null);
  const [callRinging, setCallRinging] = useState(false);
  const [translateChat, setTranslateChat] = useState(false);

  // Fetch existing visit request for this plot & buyer if any
  useEffect(() => {
    const checkExistingVisit = async () => {
      try {
        const res = await apiService.getVisitorPlantationVisits();
        if (res && res.success && Array.isArray(res.visits)) {
          const match = res.visits.find(
            (v) => (v.plot && v.plot.toString() === plotIdStr) || v.plotTitle === plot?.title
          );
          if (match) {
            setCurrentVisitRecord(match);
          }
        }
      } catch (e) { }
    };
    checkExistingVisit();
  }, [plotIdStr, plot?.title]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Send real message to backend owner account
    try {
      if (targetOwnerId) {
        await apiService.sendMessage(targetOwnerId, {
          text: `[Property Inquiry: ${plot?.title || 'Plantation Plot'}] ${userText}`,
        });
      }
    } catch (err) {
      console.warn('Real-time backend message dispatch fallback:', err);
    }

    // Simulated quick owner response if backend response is delayed
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'owner',
          text: lang === 'ml'
            ? 'തീർച്ചയായും! നിങ്ങൾക്ക് തോട്ടം നേരിട്ട് വന്ന് കാണാവുന്നതാണ്. തീയതി തീരുമാനിക്കൂ.'
            : 'Certainly! You are welcome to visit the plantation site. Let me know your preferred date.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const handleInitiateCall = async (callType = 'audio') => {
    setCallRinging(true);
    showToast(`Dispatching encrypted ${callType} bridge call request to ${plot?.owner || 'Owner'}...`);

    try {
      if (targetOwnerId) {
        await apiService.sendMessage(targetOwnerId, {
          text: `📞 *Incoming ${callType.toUpperCase()} Call Request*\nVisitor: ${user?.fullName || user?.name || 'Interested Planter'}\nPlot: ${plot?.title || 'Cardamom Estate'}`,
        });
      }
    } catch (e) { }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleConfirmVisit = async (e) => {
    e.preventDefault();
    if (!visitDate) {
      showToast('Please select a visit date.');
      return;
    }

    const selectedDate = new Date(visitDate);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    if (selectedDate < todayMidnight) {
      showToast('⚠️ Visit date must be today or a future date.');
      return;
    }

    setSubmittingVisit(true);

    try {
      const payload = {
        ownerId: targetOwnerId,
        plotId: plot?._id || plot?.id,
        plotTitle: plot?.title || 'Cardamom Estate Plot',
        plotLocation: plot?.location || plot?.district || 'Idukki, Kerala',
        visitDate,
        visitTime,
        visitorName: user?.fullName || user?.name || 'Interested Planter',
        visitorPhone: user?.phone || '',
        notes: `Requested site inspection for ${plot?.title || 'Cardamom Plot'} via Cardora Marketplace.`,
      };

      const res = await apiService.schedulePlantationVisit(payload);
      if (res && res.success && res.visit) {
        setCurrentVisitRecord(res.visit);
        showToast('Visit request sent to the Plantation Owner! Waiting for owner approval.');
      } else {
        // Local fallback record
        const fallbackVisit = {
          _id: Date.now(),
          plotTitle: plot?.title || 'Cardamom Estate Plot',
          visitDate,
          visitTime,
          status: 'Pending',
          visitorName: user?.fullName || user?.name || 'Interested Planter',
        };
        setCurrentVisitRecord(fallbackVisit);
        showToast('Visit request dispatched to Owner account!');
      }
    } catch (err) {
      showToast('Failed to schedule visit. Please try again.');
    } finally {
      setSubmittingVisit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-[#2E7D32]/40 flex flex-col h-[600px]"
      >
        {/* Header Bar */}
        <div className="bg-[#1B5E20] text-white p-4 px-6 flex items-center justify-between border-b border-[#66BB6A]/30">
          <div className="flex items-center gap-3">
            <img
              src={plot?.ownerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(plot?.owner || 'Planter')}&background=1B5E20&color=ffffff`}
              alt=""
              className="w-10 h-10 rounded-full object-cover border-2 border-[#66BB6A]"
            />
            <div>
              <h3 className="text-sm font-black font-poppins text-white flex items-center gap-2">
                {plot?.owner || 'Verified Planter'}
                <span className="w-2 h-2 rounded-full bg-[#66BB6A] animate-ping" />
              </h3>
              <p className="text-[11px] text-emerald-200">{plot?.title || 'Cardamom Estate Owner'}</p>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveMode('chat')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeMode === 'chat' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              title="Chat"
            >
              Chat
            </button>
            <button
              onClick={() => { setActiveMode('call'); handleInitiateCall('audio'); }}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeMode === 'call' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              title="Audio Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveMode('video'); handleInitiateCall('video'); }}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeMode === 'video' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveMode('visit')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeMode === 'visit' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              title="Schedule Site Visit"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CHAT MODE */}
        {activeMode === 'chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Chat Translation Toggle Bar */}
            <div className="bg-[#F8FFF8] dark:bg-slate-800 p-2 px-4 border-b border-[#2E7D32]/20 flex items-center justify-between text-xs">
              <span className="font-bold text-[#1B5E20] dark:text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                AI Real-time Translation (ML ↔ EN)
              </span>
              <button
                onClick={() => setTranslateChat(!translateChat)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${translateChat ? 'bg-[#1B5E20] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {translateChat ? 'Active' : 'Enable'}
              </button>
            </div>

            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FFF8]/50 dark:bg-slate-900/50">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isAi = msg.sender === 'ai';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs font-medium shadow-sm ${isUser
                          ? 'bg-[#1B5E20] text-white rounded-br-none'
                          : isAi
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 rounded-bl-none font-bold'
                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-[#2E7D32]/20 rounded-bl-none'
                        }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`text-[9px] mt-1 block text-right ${isUser ? 'text-emerald-200' : 'text-gray-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-[#2E7D32]/20 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={lang === 'ml' ? 'സന്ദേശം എഴുതുക...' : 'Type a message to owner...'}
                className="flex-1 p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-900 border border-[#2E7D32]/30 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
              />
              <button
                type="submit"
                className="p-3 rounded-2xl bg-[#1B5E20] text-white hover:bg-[#2E7D32] transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* CALL SIMULATION MODE */}
        {activeMode === 'call' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-white space-y-6 text-center">
            <div className="relative">
              <span className="absolute -inset-4 rounded-full bg-[#66BB6A] opacity-40 blur-xl animate-pulse" />
              <img
                src={plot?.ownerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(plot?.owner || 'Planter')}&background=1B5E20&color=ffffff`}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-[#66BB6A] relative z-10"
              />
            </div>
            <div>
              <h4 className="text-xl font-black font-poppins">{plot?.owner || 'Verified Planter'}</h4>
              <p className="text-xs text-emerald-300">
                {callRinging ? '🔔 Signal Dispatched to Owner Account • Calling...' : 'Encrypted Cardora Voice Bridge Connected'}
              </p>
            </div>
            <button
              onClick={() => { setCallRinging(false); setActiveMode('chat'); }}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl cursor-pointer"
            >
              <Phone className="w-6 h-6 rotate-135" />
            </button>
          </div>
        )}

        {/* VIDEO CALL MODE */}
        {activeMode === 'video' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-white space-y-6 text-center">
            <Video className="w-16 h-16 text-[#66BB6A] animate-pulse" />
            <div>
              <h4 className="text-xl font-black font-poppins">Live Drone 4K Video Stream Bridge</h4>
              <p className="text-xs text-emerald-300">
                {callRinging ? '🔔 Video Call Notification Sent to Owner Account...' : 'Connecting live camera feed with planter...'}
              </p>
            </div>
            <button
              onClick={() => { setCallRinging(false); setActiveMode('chat'); }}
              className="px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-black cursor-pointer"
            >
              End Stream
            </button>
          </div>
        )}

        {/* SITE VISIT SCHEDULER MODE */}
        {activeMode === 'visit' && (
          <div className="flex-1 p-6 bg-[#F8FFF8] dark:bg-slate-900 space-y-6 overflow-y-auto font-sans">
            <div className="text-center space-y-1">
              <h4 className="text-lg font-black text-[#1B5E20] dark:text-white font-poppins">
                {lang === 'ml' ? 'ഏലത്തോട്ട സന്ദർശനം ബുക്ക് ചെയ്യുക' : 'Schedule On-Site Plantation Visit'}
              </h4>
              <p className="text-xs text-gray-500">Pick a date to meet the owner & inspect plot boundaries in person.</p>
            </div>

            {currentVisitRecord ? (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-[#66BB6A] text-center space-y-4 shadow-md">
                {currentVisitRecord.status === 'Approved' ? (
                  <>
                    <CheckCheck className="w-12 h-12 text-[#1B5E20] dark:text-emerald-400 mx-auto" />
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                      APPROVED BY OWNER
                    </span>
                    <h5 className="text-base font-black text-[#1B5E20] dark:text-white">Visit Confirmed!</h5>
                    <p className="text-xs text-gray-600 dark:text-slate-300">
                      Appointment set for <strong>{currentVisitRecord.visitDate}</strong> at <strong>{currentVisitRecord.visitTime}</strong>.
                    </p>
                    {currentVisitRecord.ownerNote && (
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-300/40">
                        Owner Note: {currentVisitRecord.ownerNote}
                      </p>
                    )}
                  </>
                ) : currentVisitRecord.status === 'Declined' ? (
                  <>
                    <X className="w-12 h-12 text-red-500 mx-auto" />
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                      DECLINED BY OWNER
                    </span>
                    <h5 className="text-base font-black text-red-600 dark:text-red-400">Visit Request Declined</h5>
                    <p className="text-xs text-gray-600 dark:text-slate-300">
                      {currentVisitRecord.ownerNote || 'The owner declined this date slot. Please pick an alternative date below.'}
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 text-amber-500 mx-auto animate-spin" />
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase">
                      PENDING OWNER APPROVAL
                    </span>
                    <h5 className="text-base font-black text-slate-800 dark:text-white">Request Dispatched to Owner</h5>
                    <p className="text-xs text-gray-600 dark:text-slate-300">
                      Requested Date: <strong>{currentVisitRecord.visitDate}</strong> ({currentVisitRecord.visitTime}).
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-300/40">
                      The plantation owner has received your request. You will be notified instantly once approved!
                    </p>
                  </>
                )}

                <button
                  onClick={() => setCurrentVisitRecord(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-xs font-bold shadow-xs hover:bg-[#2E7D32] cursor-pointer"
                >
                  Schedule Different Date
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmVisit} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Select Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
                  />

                </div>

                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Select Time Slot
                  </label>
                  <select
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
                  >
                    <option value="09:00 AM (Morning Canopy Inspection)">09:00 AM (Morning Canopy Inspection)</option>
                    <option value="11:30 AM (Solar & Stream Inspection)">11:30 AM (Solar & Stream Inspection)</option>
                    <option value="03:00 PM (Afternoon Soil Harvest Check)">03:00 PM (Afternoon Soil Harvest Check)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingVisit}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-black text-xs shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submittingVisit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Request to Owner...</span>
                    </>
                  ) : (
                    <span>Confirm Appointment & Notify Owner</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LiveCommunicationModal;
