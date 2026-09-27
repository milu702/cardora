import React, { useState } from 'react';
import { useVoiceNavigation } from '../../context/VoiceNavigationContext';
import { Mic, X, HelpCircle, CheckCircle, ArrowRight, RotateCcw, Send, Keyboard, ChevronUp, Minus } from 'lucide-react';

const VoiceNavigationOverlay = () => {
  const {
    isListening,
    transcript,
    recognitionStatus,
    statusMessage,
    setStatusMessage,
    ambiguousMatches,
    overlayOpen,
    setOverlayOpen,
    voiceHelpOpen,
    setVoiceHelpOpen,
    voiceLang,
    setVoiceLang,
    startListening,
    stopListening,
    executeVoiceNavigation,
    parseVoiceIntent,
    registry,
    micVolume = 0,
  } = useVoiceNavigation();

  const [manualQuery, setManualQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const query = manualQuery.trim();
    if (!query) return;

    try {
      if (typeof parseVoiceIntent === 'function') {
        const result = parseVoiceIntent(query);
        if (result && result.feature) {
          executeVoiceNavigation(result.feature);
          setManualQuery('');
          return;
        } else if (result && result.type === 'AMBIGUOUS' && result.candidates && result.candidates.length > 0) {
          executeVoiceNavigation(result.candidates[0]);
          setManualQuery('');
          return;
        }
      }

      const queryLower = query.toLowerCase();
      const match = (registry || []).find((r) =>
        r.keywords.some((k) => k.toLowerCase().includes(queryLower) || queryLower.includes(k.toLowerCase())) ||
        r.labelEn.toLowerCase().includes(queryLower) ||
        r.labelMl.includes(query)
      );

      if (match) {
        executeVoiceNavigation(match);
        setManualQuery('');
      } else {
        if (setStatusMessage) {
          setStatusMessage(voiceLang === 'ml' ? 'കണ്ടെത്തിയില്ല. മറ്റൊരു വാക്ക് ടൈപ്പ് ചെയ്യുക.' : 'Command not recognized. Try another word.');
        }
      }
    } catch (err) {
      console.error('Manual command error:', err);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. UNIVERSAL FLOATING MICROPHONE BUTTON (ACCESSIBLE FROM EVERY PAGE) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 font-sans select-none">
        {isMinimized ? (
          /* COMPACT MINI MIC PILL (Zero UI Blocking) */
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsMinimized(false);
            }}
            className={`relative p-3 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer border ${
              isListening
                ? 'bg-rose-600 text-white border-rose-400 scale-110 ring-4 ring-rose-500/30'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 hover:scale-105 shadow-amber-950/40'
            }`}
            title="Speak to Cardora Voice Assist (Click to Listen, Right-Click or Expand to restore label)"
          >
            {isListening && (
              <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
            )}
            <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce text-white' : 'text-slate-950'}`} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-emerald-600 shadow-sm"
              title="Expand Voice Widget"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </button>
        ) : (
          /* FULL GOLD VOICE BADGE WITH MINIMIZE BUTTON */
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`relative group px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 cursor-pointer border ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-400 scale-105 ring-4 ring-rose-500/30 shadow-rose-950/50'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-[#D4AF37] text-slate-950 border-amber-300 hover:scale-105 shadow-amber-950/40 font-black'
              }`}
              title="Universal Voice Navigation (പറയൂ, Cardora ചെയ്യും)"
            >
              {/* Pulse Ripple Effect when listening */}
              {isListening && (
                <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
              )}

              <div className={`p-1.5 rounded-full ${isListening ? 'bg-white/20' : 'bg-slate-950/10'} backdrop-blur-xs`}>
                <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : 'text-slate-950'}`} />
              </div>

              <div className="text-left hidden sm:block pr-1">
                <p className="text-xs font-black tracking-wide leading-none text-slate-950 font-poppins">
                  {isListening ? (voiceLang === 'ml' ? 'കേൾക്കുന്നു...' : 'Listening...') : 'Speak to Cardora'}
                </p>
                <p className="text-[10px] text-slate-900 font-extrabold leading-tight mt-0.5">
                  {voiceLang === 'ml' ? 'പറയൂ, Cardora ചെയ്യും 🎙️' : 'Voice Assistant'}
                </p>
              </div>
            </button>

            {/* MINIMIZE TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-amber-300 hover:text-white transition shadow-md border border-amber-400/30 cursor-pointer"
              title="Minimize Voice Button to prevent blocking UI"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE VOICE OVERLAY MODAL (PERFECTLY CENTERED z-[999]) */}
      {/* ========================================================================= */}
      {overlayOpen && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="bg-[#06150D] text-white border-2 border-emerald-500/50 w-full max-w-md rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-center relative overflow-hidden my-auto mx-auto">
            
            {/* BACKGROUND EMERALD GLOW */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* TOP HEADER CONTROLS */}
            <div className="flex items-center justify-between relative z-10 border-b border-emerald-500/20 pb-3">
              {/* Language Selector Pill */}
              <div className="flex items-center bg-[#0B2117] p-1 rounded-full border border-emerald-500/30">
                <button
                  onClick={() => setVoiceLang('ml')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition ${voiceLang === 'ml' ? 'bg-[#059669] text-white shadow-sm' : 'text-emerald-300/80 hover:text-white'}`}
                >
                  മലയാളം
                </button>
                <button
                  onClick={() => setVoiceLang('en')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition ${voiceLang === 'en' ? 'bg-[#059669] text-white shadow-sm' : 'text-emerald-300/80 hover:text-white'}`}
                >
                  English
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setVoiceHelpOpen(true);
                    setOverlayOpen(false);
                  }}
                  className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-950/60 transition"
                  title="Voice Help"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={stopListening}
                  className="p-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ANIMATED MIC WAVE GRAPHIC & TAP TO SPEAK BUTTON */}
            <div className="relative py-2 space-y-3">
              <button
                onClick={() => startListening()}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all cursor-pointer border-4 ${
                  isListening
                    ? 'bg-rose-600 border-white animate-pulse shadow-rose-900/60 scale-105'
                    : 'bg-gradient-to-br from-[#F59E0B] via-[#D4AF37] to-[#FBBF24] border-amber-300/60 text-slate-950 hover:scale-105 shadow-amber-950/50'
                }`}
                title={voiceLang === 'ml' ? 'വീണ്ടും സംസാരിക്കാൻ അമർത്തുക' : 'Tap to Speak'}
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-75" />
                    <span className="absolute -inset-3 rounded-full border border-amber-400/30 animate-pulse" />
                  </>
                )}
                {recognitionStatus === 'matched' ? (
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950 animate-in zoom-in" />
                ) : (
                  <Mic className={`w-10 h-10 sm:w-12 sm:h-12 ${isListening ? 'text-white' : 'text-slate-950'}`} />
                )}
              </button>

              {/* LIVE SOUND DECIBEL LEVEL METER */}
              {isListening && (
                <div className="flex items-center justify-center gap-2 py-1 bg-[#0B2117]/80 rounded-full px-4 w-fit mx-auto border border-emerald-500/30">
                  <span className="text-[11px] font-mono font-bold text-emerald-300">
                    {micVolume > 5 ? `🎙️ Live Sound: ${micVolume}%` : `🔊 Speak into mic (${micVolume}%)`}
                  </span>
                  <div className="flex items-center gap-1 h-3">
                    <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 10 ? 'bg-emerald-400 h-3' : 'bg-emerald-900 h-1.5'}`} />
                    <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 25 ? 'bg-emerald-400 h-3.5' : 'bg-emerald-900 h-1.5'}`} />
                    <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 40 ? 'bg-amber-400 h-4' : 'bg-emerald-900 h-1.5'}`} />
                    <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 60 ? 'bg-rose-400 h-4.5' : 'bg-emerald-900 h-1.5'}`} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-sm sm:text-base font-black text-white font-poppins px-2 leading-snug">
                  {statusMessage}
                </p>
                {!isListening && (
                  <button
                    onClick={() => startListening()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black hover:bg-amber-400/30 transition cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{voiceLang === 'ml' ? 'വീണ്ടും സംസാരിക്കാൻ ഇവിടെ തൊടുക' : 'Tap to Speak Again'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* LIVE SPEECH TRANSCRIPT / MANUAL TEXT INPUT FORM */}
            <form onSubmit={handleManualSubmit} className="relative flex items-center">
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder={transcript ? `"${transcript}"` : (voiceLang === 'ml' ? 'നിർദ്ദേശം ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പറയുക...' : 'Type or speak command...')}
                className="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-[#0B2117] border border-emerald-500/40 text-xs font-bold text-white placeholder:text-emerald-300/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
              <Keyboard className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-2 p-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition cursor-pointer"
                title="Submit"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* AMBIGUOUS CANDIDATES SELECTOR */}
            {recognitionStatus === 'ambiguous' && ambiguousMatches.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-emerald-500/20 text-left">
                <p className="text-xs font-bold text-amber-300">
                  {voiceLang === 'ml' ? 'ഏതാണ് ഉദ്ദേശിച്ചത്?' : 'Select destination:'}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {ambiguousMatches.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => executeVoiceNavigation(cand)}
                      className="p-3 rounded-xl bg-[#0D261B] hover:bg-emerald-900/60 text-white text-xs font-bold transition flex items-center justify-between cursor-pointer border border-emerald-500/40"
                    >
                      <span>{voiceLang === 'ml' ? cand.labelMl : cand.labelEn}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ⚡ DIRECT CLICKABLE QUICK FEATURE SHORTCUTS */}
            <div className="pt-2 border-t border-emerald-500/20 text-left space-y-2">
              <p className="text-[11px] font-black text-emerald-300/80 uppercase tracking-wider flex items-center justify-between">
                <span>{voiceLang === 'ml' ? 'നേരിട്ട് പോകാൻ ബട്ടൺ അമർത്താം:' : 'Or tap a feature shortcut:'}</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: voiceLang === 'ml' ? '🌱 തോട്ടം' : '🌱 Plantation', id: 'plantations' },
                  { label: voiceLang === 'ml' ? '🔬 രോഗ പരിശോധന' : '🔬 Plant Scanner', id: 'scanner' },
                  { label: voiceLang === 'ml' ? '☁ കാലാവസ്ഥ' : '☁ Weather', id: 'weather' },
                  { label: voiceLang === 'ml' ? '🔨 ലൈവ് ലേലം' : '🔨 Auctions', id: 'auctions' },
                  { label: voiceLang === 'ml' ? '🔑 ലോഗിൻ' : '🔑 Login', id: 'login' },
                  { label: voiceLang === 'ml' ? '👥 തൊഴിലാളികൾ' : '👥 Workforce', id: 'workforce' },
                  { label: voiceLang === 'ml' ? '💬 സന്ദേശങ്ങൾ' : '💬 Messages', id: 'messages' },
                ].map((shortcut) => (
                  <button
                    key={shortcut.id}
                    onClick={() => {
                      const targetItem = registry.find((r) => r.id === shortcut.id);
                      if (targetItem) executeVoiceNavigation(targetItem);
                      else setOverlayOpen(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#0D261B] hover:bg-[#144A2D] text-emerald-100 text-xs font-extrabold border border-emerald-500/40 transition-all cursor-pointer text-center truncate hover:border-amber-400 hover:text-amber-300"
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                onClick={() => {
                  setVoiceHelpOpen(true);
                  setOverlayOpen(false);
                }}
                className="font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{voiceLang === 'ml' ? 'എനിക്ക് എന്തൊക്കെ പറയാം?' : 'What can I say?'}</span>
              </button>

              <button
                onClick={stopListening}
                className="font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                {voiceLang === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VOICE HELP MODAL ("എനിക്ക് എന്തൊക്കെ പറയാം?") */}
      {/* ========================================================================= */}
      {voiceHelpOpen && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="bg-[#06150D] text-white border-2 border-emerald-500/40 w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto mx-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#059669] text-white shadow-md">
                  <Mic className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-poppins">
                    {voiceLang === 'ml' ? '🎙️ ശബ്ദ നിർദ്ദേശ സഹായം' : '🎙️ Universal Voice Commands Guide'}
                  </h3>
                  <p className="text-xs text-emerald-300/80 font-medium">
                    {voiceLang === 'ml' ? 'ഏതു പേജിലേക്കും ശബ്ദം വഴി വേഗത്തിൽ പോകാം' : 'Navigate anywhere in Cardora with natural speech'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setVoiceHelpOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-emerald-100 font-medium bg-[#0D261B] p-3.5 rounded-2xl border border-emerald-500/30">
              💡 <strong>{voiceLang === 'ml' ? 'നിർദ്ദേശം:' : 'Tip:'}</strong> {voiceLang === 'ml' 
                ? 'നിങ്ങൾക്ക് സ്വാഭാവിക മലയാളത്തിലോ ഇംഗ്ലീഷിലോ മംഗ്ലീഷിലോ സംസാരിക്കാം. താഴെയുള്ള ലിങ്കുകളിൽ അമർത്തിയാലും അങ്ങോട്ട് പോകാം!' 
                : 'Speak naturally in Malayalam, Manglish, or English. Or tap any feature below to open it instantly!'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {registry.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setVoiceHelpOpen(false);
                    executeVoiceNavigation(item);
                  }}
                  className="bg-[#0D261B] p-4 rounded-2xl border border-emerald-500/30 hover:border-amber-400 transition cursor-pointer space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {voiceLang === 'ml' ? item.labelMl : item.labelEn}
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div className="space-y-1 text-[11px] text-emerald-200/80 font-medium">
                    <p className="font-bold text-amber-300">
                      💬 "{item.keywords[0]}" / "{item.keywords[1] || item.keywords[0]}"
                    </p>
                    <p className="line-clamp-1 italic text-emerald-400/60">
                      "{item.keywords[2] || ''}", "{item.keywords[3] || ''}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-emerald-500/20 flex justify-end">
              <button
                onClick={() => setVoiceHelpOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#059669] to-[#047857] text-white text-xs font-black rounded-full hover:shadow-lg transition cursor-pointer border border-emerald-400/30"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceNavigationOverlay;
