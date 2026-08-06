import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Bot, Check, Globe } from 'lucide-react';

const VoiceAiWidget = ({ lang, toggleLang, onCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiMessage, setAiMessage] = useState(
    lang === 'ml'
      ? 'നമസ്കാരം! ഞാൻ കാർഡോറ വോയ്സ് എഐ. ഏലത്തോട്ടങ്ങളെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.'
      : 'Hello! I am Cardora Voice AI. Ask me anything about cardamom plantations.'
  );

  useEffect(() => {
    setAiMessage(
      lang === 'ml'
        ? 'നമസ്കാരം! ഞാൻ കാർഡോറ വോയ്സ് എഐ. ഏലത്തോട്ടങ്ങളെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.'
        : 'Hello! I am Cardora Voice AI. Ask me anything about cardamom plantations.'
    );
  }, [lang]);

  // Speech Recognition setup
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'ml' ? 'നിങ്ങളുടെ ബ്രൗസർ വോയ്സ് സേർച്ച് പിന്തുണയ്ക്കുന്നില്ല.' : 'Your browser does not support Speech Recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
      setIsListening(false);
      handleVoiceCommand(text);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
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

  const handleVoiceCommand = (cmd) => {
    const lower = cmd.toLowerCase();
    let response = '';

    if (lower.includes('verified') || lower.includes('വിശ്വസനീയ') || lower.includes('വേരിഫൈഡ്')) {
      response = lang === 'ml' ? 'വേരിഫൈഡ് ഏലത്തോട്ടങ്ങൾ കാണിക്കുന്നു.' : 'Showing verified plantations.';
      if (onCommand) onCommand('verified');
    } else if (lower.includes('map') || lower.includes('മാപ്പ്') || lower.includes('ഭൂപടം')) {
      response = lang === 'ml' ? 'ഇന്ററാക്ടീവ് സാറ്റലൈറ്റ് മാപ്പ് തുറക്കുന്നു.' : 'Opening interactive satellite map.';
      if (onCommand) onCommand('map');
    } else if (lower.includes('translate') || lower.includes('മലയാളം') || lower.includes('english')) {
      toggleLang();
      response = lang === 'ml' ? 'Switched to English language.' : 'ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി.';
    } else if (lower.includes('document') || lower.includes('രേഖകൾ')) {
      response = lang === 'ml' ? 'എഐ ലീഗൽ ഡോക്യുമെന്റ് റിപ്പോർട്ട് പരിശോധിക്കുന്നു.' : 'Reviewing AI verified document legal reports.';
      if (onCommand) onCommand('documents');
    } else {
      response = lang === 'ml' 
        ? `"${cmd}" എന്ന് തിരഞ്ഞു: മികച്ച ഉയർന്ന വിളവുള്ള തോട്ടങ്ങൾ കണ്ടെത്തി.`
        : `Searched for "${cmd}": Found top high-yield cardamom plantations.`;
      if (onCommand) onCommand('search', cmd);
    }

    setAiMessage(response);
    speakText(response);
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

            {/* AI Speech Bubble */}
            <div className="my-4 p-4 rounded-2xl bg-[#F8FFF8] dark:bg-slate-800/80 border border-[#66BB6A]/30">
              <p className="text-xs font-bold text-[#1B5E20] dark:text-emerald-300 leading-relaxed">
                {aiMessage}
              </p>

              {transcript && (
                <div className="mt-2 pt-2 border-t border-[#66BB6A]/20">
                  <span className="text-[10px] uppercase font-black text-gray-400 block">You said:</span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 italic">"{transcript}"</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Mic Listen Button */}
              <button
                onClick={startListening}
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
                  if (isSpeaking) stopSpeaking();
                  else speakText(aiMessage);
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
