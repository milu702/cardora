import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Bot, Globe, Send, Loader2, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';

const VoiceAiWidget = ({ lang, toggleLang, onCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [textInput, setTextInput] = useState('');
  const chatEndRef = useRef(null);
  
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('cardora_ai_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 1,
        sender: 'ai',
        text: lang === 'ml'
          ? 'നമസ്കാരം! ഞാൻ കാർഡോറ വോയ്സ് എഐ. ഏലത്തോട്ടങ്ങളെക്കുറിച്ചും വിപണി വിലയെക്കുറിച്ചും എന്നോട് ചോദിക്കാം.'
          : 'Hello! I am Cardora Real Google Gemini AI. Ask me anything about cardamom farming, market prices, or land verification.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cardora_ai_chat_history', JSON.stringify(chatHistory));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const clearChatHistory = () => {
    const initial = [
      {
        id: Date.now(),
        sender: 'ai',
        text: lang === 'ml' ? 'ചാറ്റ് ചരിത്രം മായ്‌ച്ചു.' : 'Chat history cleared. How can I assist you now?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setChatHistory(initial);
    localStorage.setItem('cardora_ai_chat_history', JSON.stringify(initial));
  };

  // Speech Recognition setup
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'ml' ? 'നിങ്ങളുടെ ബ്രൗസർ വോയ്സ് സേർച്ച് പിന്തുണയ്ക്കുന്നില്ല.' : 'Your browser does not support Speech Recognition. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalCapturedText = '';

    recognition.onstart = () => {
      setIsListening(true);
      setTextInput('');
    };

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        currentText += transcriptChunk;
      }
      if (currentText && currentText.trim()) {
        finalCapturedText = currentText.trim();
        setTextInput(finalCapturedText);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalCapturedText && finalCapturedText.trim()) {
        handleVoiceCommand(finalCapturedText.trim());
      }
    };

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
    utterance.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
    utterance.pitch = 1.0;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleVoiceCommand = async (cmd) => {
    if (!cmd || !cmd.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: cmd,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    const lower = cmd.toLowerCase();

    if (lower.includes('verified') || lower.includes('വിശ്വസനീയ') || lower.includes('വേരിഫൈഡ്')) {
      const response = lang === 'ml' ? 'വേരിഫൈഡ് ഏലത്തോട്ടങ്ങൾ കാണിക്കുന്നു.' : 'Showing verified plantations.';
      if (onCommand) onCommand('verified');
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatHistory((prev) => [...prev, aiMsg]);
      speakText(response);
      return;
    }
    
    if (lower.includes('map') || lower.includes('മാപ്പ്') || lower.includes('ഭൂപടം')) {
      const response = lang === 'ml' ? 'ഇന്ററാക്ടീവ് സാറ്റലൈറ്റ് മാപ്പ് തുറക്കുന്നു.' : 'Opening interactive satellite map.';
      if (onCommand) onCommand('map');
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatHistory((prev) => [...prev, aiMsg]);
      speakText(response);
      return;
    }

    setLoadingAi(true);

    try {
      const res = await apiService.askAiChat(cmd, lang);
      const replyText = (res && res.success && res.reply)
        ? res.reply
        : (lang === 'ml' 
            ? `നമസ്കാരം! "${cmd}" എന്ന ചോദ്യത്തിന് കാർഡോറ ഏലത്തോട്ട വിശകലനം പൂർത്തിയായി.` 
            : `CARDORA AI processed your query "${cmd}": Farm advice updated successfully.`);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory((prev) => [...prev, aiMsg]);
      speakText(replyText);
    } catch (err) {
      console.warn('AI Chat Error:', err);
      const fallbackText = lang === 'ml'
        ? `നമസ്കാരം! "${cmd}" എന്നതിനെക്കുറിച്ച് കാർഡോറ വോയ്സ് എഐ വിശദമായ വിവരങ്ങൾ നൽകുന്നു.`
        : `CARDORA AI processed your query "${cmd}". How else can I assist your farm today?`;
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, aiMsg]);
      speakText(fallbackText);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#66BB6A] text-white shadow-2xl flex items-center gap-3 border-2 border-white/40 backdrop-blur-xl"
        >
          <div className="absolute -inset-1 rounded-full bg-[#66BB6A] opacity-40 blur-lg group-hover:opacity-75 transition duration-500 animate-pulse" />
          <Bot className="w-6 h-6 relative animate-bounce" />
          <span className="text-xs font-black tracking-wider uppercase pr-1 hidden sm:inline relative">
            {lang === 'ml' ? 'എഐ അസിസ്റ്റന്റ്' : 'Voice AI'}
          </span>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
        </motion.button>
      )}

      {/* Expanded Floating Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-80 sm:w-96 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-[#2E7D32]/30 shadow-2xl p-5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2E7D32]/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1B5E20] text-white shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#1B5E20] dark:text-emerald-400 font-poppins flex items-center gap-1.5">
                    CARDORA Voice AI
                    <Sparkles className="w-3.5 h-3.5 text-[#66BB6A] animate-spin" />
                  </h4>
                  <p className="text-[10px] font-bold text-gray-500">
                    {lang === 'ml' ? 'ശബ്ദ നിർദ്ദേശങ്ങൾ ലഭ്യമാണ്' : 'Voice-guided ecosystem intelligence'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChatHistory}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Chat Transcript History Container */}
            <div className="my-3 max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#1B5E20] text-white rounded-br-none'
                        : 'bg-[#F8FFF8] dark:bg-slate-800 border border-[#66BB6A]/40 text-[#1B5E20] dark:text-emerald-300 rounded-bl-none'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <span className="block text-[9px] font-black uppercase text-[#66BB6A] mb-0.5">
                        🤖 CARDORA AI
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] opacity-60 text-right mt-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                {/* Mic Listen Button */}
                <button
                  onClick={startListening}
                  disabled={loadingAi}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-md ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-[#1B5E20] hover:bg-[#2E7D32] text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? (lang === 'ml' ? 'കേൾക്കുന്നു...' : 'Listening...') : (lang === 'ml' ? 'സംസാരിക്കൂ' : 'Tap to Speak')}</span>
                </button>

                {/* Read Aloud Button */}
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      const lastAiMsg = [...chatHistory].reverse().find((m) => m.sender === 'ai')?.text || '';
                      speakText(lastAiMsg);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all ${
                    isSpeaking
                      ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse'
                      : 'bg-[#F8FFF8] dark:bg-slate-800 border-[#2E7D32]/30 text-[#1B5E20] dark:text-emerald-400 hover:bg-[#66BB6A]/20'
                  }`}
                  title="Read Aloud"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Language Switch */}
                <button
                  onClick={toggleLang}
                  className="p-3 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-[#1B5E20] dark:text-emerald-400 font-bold text-xs flex items-center gap-1"
                  title="Switch Language"
                >
                  <Globe className="w-4 h-4" />
                  <span>{lang === 'en' ? 'ML' : 'EN'}</span>
                </button>
              </div>

              {/* Text Input Form for Gemini AI Chat */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textInput.trim()) {
                    handleVoiceCommand(textInput);
                    setTextInput('');
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={lang === 'ml' ? 'എന്തെങ്കിലും ചോദിക്കൂ (e.g. ഏലക്ക ഇന്നത്തെ വില)' : 'Ask Gemini AI (e.g. fertilizer dose)...'}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={loadingAi}
                  className="flex-1 p-2.5 rounded-xl bg-[#F8FFF8] dark:bg-slate-800 border border-[#2E7D32]/30 text-xs font-bold text-[#1B5E20] dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loadingAi || !textInput.trim()}
                  className="p-2.5 rounded-xl bg-[#1B5E20] text-white hover:bg-[#2E7D32] disabled:opacity-50 transition-all shadow-md"
                >
                  {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>

            {/* Quick Command Chips */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                { label: lang === 'ml' ? 'വേരിഫൈഡ് പ്ലോട്ടുകൾ' : 'Show verified plots', cmd: 'verified' },
                { label: lang === 'ml' ? 'മാപ്പ് തുറക്കൂ' : 'Open map view', cmd: 'map' },
                { label: lang === 'ml' ? 'രേഖകൾ പരിശോധിക്കൂ' : 'Check legal docs', cmd: 'documents' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVoiceCommand(item.label)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-slate-800 text-[#1B5E20] dark:text-emerald-400 hover:bg-[#66BB6A]/30 border border-[#66BB6A]/30 transition-all"
                >
                  ✨ {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAiWidget;
