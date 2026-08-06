import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Phone, Video, Calendar, MapPin, Paperclip, Mic, 
  Sparkles, Globe, Check, CheckCheck, User, Bot, Volume2 
} from 'lucide-react';

const LiveCommunicationModal = ({ plot, mode = 'chat', onClose, lang }) => {
  const [messages, setMessages] = useState([
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
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [activeMode, setActiveMode] = useState(mode); // 'chat' | 'call' | 'video' | 'visit'
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00 AM');
  const [visitConfirmed, setVisitConfirmed] = useState(false);
  const [translateChat, setTranslateChat] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Simulated Owner Reply after 1.5s
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

  const handleConfirmVisit = (e) => {
    e.preventDefault();
    setVisitConfirmed(true);
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
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'chat' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Chat"
            >
              Chat
            </button>
            <button
              onClick={() => setActiveMode('call')}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'call' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Audio Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveMode('video')}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'video' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveMode('visit')}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'visit' ? 'bg-[#66BB6A] text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Schedule Site Visit"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white ml-2"
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
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
                  translateChat ? 'bg-[#1B5E20] text-white' : 'bg-gray-200 text-gray-700'
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
                      className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs font-medium shadow-sm ${
                        isUser
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
                className="p-3 rounded-2xl bg-[#1B5E20] text-white hover:bg-[#2E7D32] transition-all shadow-md"
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
              <p className="text-xs text-emerald-300">Encrypted Cardora Voice Bridge • Calling...</p>
            </div>
            <button
              onClick={() => setActiveMode('chat')}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl animate-bounce"
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
              <h4 className="text-xl font-black font-poppins">Live Drone 4K Video Stream</h4>
              <p className="text-xs text-emerald-300">Connecting live camera feed with planter...</p>
            </div>
            <button
              onClick={() => setActiveMode('chat')}
              className="px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-black"
            >
              End Stream
            </button>
          </div>
        )}

        {/* SITE VISIT SCHEDULER MODE */}
        {activeMode === 'visit' && (
          <div className="flex-1 p-6 bg-[#F8FFF8] dark:bg-slate-900 space-y-6 overflow-y-auto">
            <div className="text-center space-y-1">
              <h4 className="text-lg font-black text-[#1B5E20] dark:text-white font-poppins">
                {lang === 'ml' ? 'ഏലത്തോട്ട സന്ദർശനം ബുക്ക് ചെയ്യുക' : 'Schedule On-Site Plantation Visit'}
              </h4>
              <p className="text-xs text-gray-500">Pick a date to meet the owner & inspect plot boundaries in person.</p>
            </div>

            {visitConfirmed ? (
              <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-slate-800 border-2 border-[#66BB6A] text-center space-y-3">
                <CheckCheck className="w-12 h-12 text-[#1B5E20] dark:text-emerald-400 mx-auto" />
                <h5 className="text-base font-black text-[#1B5E20] dark:text-white">Visit Confirmed!</h5>
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  Appointment set for <strong>{visitDate}</strong> at <strong>{visitTime}</strong>. Confirmation SMS & GPS pin sent to your registered mobile number.
                </p>
                <button
                  onClick={() => setVisitConfirmed(false)}
                  className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold"
                >
                  Reschedule
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
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-400 uppercase block mb-1">
                    Select Time Slot
                  </label>
                  <select
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                  >
                    <option value="09:00 AM">09:00 AM (Morning Canopy Inspection)</option>
                    <option value="11:30 AM">11:30 AM (Solar & Stream Inspection)</option>
                    <option value="03:00 PM">03:00 PM (Afternoon Soil Harvest Check)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-black text-xs shadow-xl hover:scale-105 transition-all"
                >
                  Confirm Appointment
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
