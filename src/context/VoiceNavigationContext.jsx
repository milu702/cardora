import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceNavigationContext = createContext();

// ============================================================================
// UNIVERSAL VOICE NAVIGATION REGISTRY
// Maps every existing & future Cardora feature to Malayalam, Manglish & English aliases
// ============================================================================
export const VOICE_NAV_REGISTRY = [
  {
    id: 'login',
    labelEn: 'Login / Sign In',
    labelMl: 'ലോഗിൻ / സൈൻ ഇൻ',
    route: '/auth?mode=login',
    tabId: 'login',
    keywords: [
      'login', 'log in', 'log', 'in', 'signin', 'sign in', 'auth', 'authentication',
      'login page', 'go to login page', 'go to login', 'open login', 'enter',
      'ലോഗിൻ', 'സൈൻ ഇൻ', 'പ്രവേശിക്കുക', 'login thurakku', 'login cheyyu', 'login kanikku',
      'sign-in', 'log-in', 'user login', 'planter login', 'login form', 'page login'
    ]
  },
  {
    id: 'signup',
    labelEn: 'Sign Up / Register',
    labelMl: 'സൈൻ അപ്പ് / രജിസ്റ്റർ',
    route: '/auth?mode=register',
    tabId: 'signup',
    keywords: [
      'signup', 'sign up', 'sign-up', 'register', 'registration', 'reg',
      'create account', 'new account', 'new user', 'join',
      'സൈൻ അപ്പ്', 'രജിസ്റ്റർ', 'അക്കൗണ്ട് ഉണ്ടാക്കുക', 'signup page', 'register page', 'go to signup', 'open signup'
    ]
  },
  {
    id: 'logout',
    labelEn: 'Logout / Sign Out',
    labelMl: 'ലോഗ് ഔട്ട്',
    route: '/auth?mode=login',
    tabId: 'logout',
    keywords: [
      'logout', 'log out', 'signout', 'sign out', 'exit', 'leave',
      'ലോഗ് ഔട്ട്', 'പുറത്തുപോകുക', 'logout cheyyu'
    ]
  },
  {
    id: 'home',
    labelEn: 'Cardora Landing Home',
    labelMl: 'ഹോം പേജ്',
    route: '/',
    tabId: 'home',
    keywords: [
      'home', 'landing', 'landing page', 'cardora home', 'start', 'front page', 'main page',
      'go to home', 'open home', 'ഹോം', 'പ്രധാന പേജ്', 'തുടക്കം', 'home page'
    ]
  },
  {
    id: 'dashboard',
    labelEn: 'Dashboard Overview',
    labelMl: 'ഹോം ഡാഷ്‌ബോർഡ്',
    route: '/dashboard?tab=dashboard',
    tabId: 'dashboard',
    keywords: [
      'dashboard', 'dash', 'board', 'overview', 'main page', 'start',
      'ഡാഷ്ബോർഡ്', 'ഹോം', 'പ്രധാന പേജ്', 'തുടക്കം',
      'home page', 'main', 'dash board', 'dashboard thurakku', 'home kanikku',
      'go to dashboard', 'open dashboard'
    ]
  },
  {
    id: 'auctions',
    labelEn: 'Live Auctions',
    labelMl: 'ലൈവ് ലേലം',
    route: '/dashboard?tab=auctions',
    tabId: 'auctions',
    keywords: [
      'auctions', 'auction', 'bidding', 'bid', 'bids', 'spice board auction', 'auction rate',
      'rate', 'rates', 'price', 'prices', 'lelam', 'live lelam', 'leylam',
      'ലൈവ് ലേലം', 'ലേലം', 'ഏലം ലേലം', 'വില വന്ദൻമേട്', 'വില', 'ഏലം',
      'auction open cheyyu', 'lelam kanikku', 'spice auction', 'lelam nokkanam', 'auction rate today', 'lelam thurakku', 'today rate'
    ]
  },
  {
    id: 'intelligence',
    labelEn: 'Live Intelligence',
    labelMl: 'ലൈവ് ഇൻ്റലിജൻസ്',
    route: '/dashboard?tab=intelligence',
    tabId: 'intelligence',
    keywords: [
      'intelligence', 'live intelligence', 'plantation intelligence', 'satellite data',
      'satellite', 'sensor', 'sensors', 'analytics',
      'ലൈവ് ഇൻ്റലിജൻസ്', 'ഡാറ്റ', 'സാറ്റലൈറ്റ്',
      'estate analytics', 'sensor data', 'intelligence open cheyyu'
    ]
  },
  {
    id: 'expert',
    labelEn: 'Expert Desk & Agronomists',
    labelMl: 'വിദഗ്ദ്ധ ഉപദേശം',
    route: '/dashboard?tab=expert',
    tabId: 'expert',
    keywords: [
      'expert', 'agronomist', 'consultation', 'doctor', 'doc', 'specialist', 'ask expert', 'agro',
      'വിദഗ്ദ്ധ ഉപദേശം', 'അഗ്രോണമിസ്റ്റ്', 'ഡോക്ടർ', 'വിദഗ്ദ്ധൻ', 'ഉപദേശം',
      'expert desk', 'ask agronomist', 'agro expert', 'expert advice', 'expert thurakku',
      'doctor thurakku', 'expert consultation'
    ]
  },
  {
    id: 'plantations',
    labelEn: 'My Plantation',
    labelMl: 'എന്റെ തോട്ടം',
    route: '/dashboard?tab=plantations',
    tabId: 'plantations',
    keywords: [
      'plantation', 'plantations', 'my plantation', 'farm', 'farms', 'estate', 'estates',
      'cardamom plot', 'garden', 'plot', 'plots', 'crop', 'crops',
      'തോട്ടം', 'തോട്ടങ്ങൾ', 'കൃഷി', 'കൃഷിയിടം', 'ഏലത്തോട്ടം',
      'thottam', 'tottam', 'ente thottam', 'plantation open cheyyu', 'thottam kanikku',
      'my farm', 'show my plantation', 'ente plantation', 'farm details', 'go to plantation', 'open plantation'
    ]
  },
  {
    id: 'workforce',
    labelEn: 'Workforce & Workers',
    labelMl: 'തൊഴിലാളികൾ & പണിക്കാർ',
    route: '/dashboard?tab=workforce',
    tabId: 'workforce',
    keywords: [
      'workforce', 'work', 'job', 'jobs', 'labor', 'labour', 'workers', 'worker', 'contractor', 'attendance',
      'panikkar', 'panikkaran', 'pani', 'panigal', 'vele', 'vela',
      'തൊഴിലാളികൾ', 'പണിക്കാർ', 'ഹാജർ', 'കരാറുകാരൻ', 'വേല', 'പണി', 'തൊഴിൽ', 'തൊഴിലിൽ',
      'panikkar kanikku', 'attendance nokkanam', 'labor contractor', 'workforce open cheyyu'
    ]
  },
  {
    id: 'weather',
    labelEn: 'Weather Intelligence',
    labelMl: 'കാലാവസ്ഥ വിവരങ്ങൾ',
    route: '/dashboard?tab=weather',
    tabId: 'weather',
    keywords: [
      'weather', 'forecast', 'rain', 'rainy', 'temperature', 'temp', 'climate', 'humidity',
      'കാലാവസ്ഥ', 'മഴ', 'താപനില', 'അന്തരീക്ഷം', 'മഴയുണ്ടോ',
      'kalavastha', 'kala vastha', 'mazha', 'weather nokkanam', 'kalavastha kanikku',
      'rain forecast', 'today weather', 'kalavastha thurakku', 'mazha undo', 'rain update'
    ]
  },
  {
    id: 'scanner',
    labelEn: 'AI Disease Pathology Scanner',
    labelMl: 'രോഗ നിർണ്ണയ സ്കാനർ',
    route: '/dashboard?tab=ai&action=scan',
    tabId: 'scanner',
    keywords: [
      'scanner', 'scan', 'leaf scan', 'disease scan', 'diagnose', 'diagnosis', 'plant scanner',
      'disease', 'leaf', 'leaves', 'rogam', 'roganirnayam', 'ila', 'pathology',
      'സ്കാനർ', 'രോഗം പരിശോധിക്കണം', 'ഇല സ്കാൻ', 'രോഗനിർണ്ണയം', 'രോഗം', 'ഇല',
      'rogam nokkanam', 'plant scan', 'scanner thurakku', 'disease check', 'crop pathology'
    ]
  },
  {
    id: 'ai',
    labelEn: 'AI Recommendations & Soil Advisor',
    labelMl: 'AI നിർദ്ദേശങ്ങൾ',
    route: '/dashboard?tab=ai',
    tabId: 'ai',
    keywords: [
      'ai', 'recommendations', 'recommendation', 'ai advisor', 'fertilizer advisor', 'npk advisor',
      'npk', 'fertilizer', 'soil', 'soil test', 'valam', 'mannu',
      'എഐ നിർദ്ദേശങ്ങൾ', 'വളപ്രയോഗം', 'മണ്ണ് പരിശോധന', 'വളം', 'മണ്ണ്',
      'valam adviser', 'npk calculator', 'ai thurakku', 'cardora ai', 'soil advisor'
    ]
  },
  {
    id: 'messages',
    labelEn: 'Messages & Chat',
    labelMl: 'സന്ദേശങ്ങൾ & ചാറ്റ്',
    route: '/dashboard?tab=messages',
    tabId: 'messages',
    keywords: [
      'messages', 'message', 'msg', 'chat', 'inbox', 'conversation', 'direct message',
      'sandheshangal', 'sandhesam',
      'സന്ദേശങ്ങൾ', 'ചാറ്റ്', 'മെസ്സേജ്', 'സന്ദേശം',
      'chat open cheyyu', 'inbox kanikku', 'message box', 'chat thurakku'
    ]
  },
  {
    id: 'plots',
    labelEn: 'Marketplace & Land Plots',
    labelMl: 'മാർക്കറ്റ് പ്ലേസ്',
    route: '/dashboard?tab=plots',
    tabId: 'plots',
    keywords: [
      'marketplace', 'market', 'plots', 'plot', 'lands', 'land', 'property', 'real estate',
      'buy land', 'buy', 'sell', 'sthalam', 'bhumi',
      'മാർക്കറ്റ് പ്ലേസ്', 'സ്ഥലം', 'ഭൂമി', 'വില്പന', 'മാർക്കറ്റ്',
      'land listings', 'estate for sale', 'marketplace thurakku'
    ]
  },
  {
    id: 'community',
    labelEn: 'Community Forum',
    labelMl: 'കമ്മ്യൂണിറ്റി',
    route: '/dashboard?tab=community',
    tabId: 'community',
    keywords: [
      'community', 'forum', 'feed', 'posts', 'post', 'discussions', 'discussion', 'planters group',
      'കമ്മ്യൂണിറ്റി', 'ഫോറം', 'ചർച്ചകൾ', 'കർഷക കൂട്ടായ്മ',
      'planters forum', 'community thurakku', 'kannadi post', 'planters chat'
    ]
  },
  {
    id: 'profile',
    labelEn: 'User Profile & Account',
    labelMl: 'പ്രൊഫൈൽ',
    route: '/dashboard?tab=dashboard',
    tabId: 'dashboard',
    keywords: [
      'profile', 'account', 'my profile', 'user info', 'my details', 'user', 'me', 'info',
      'പ്രൊഫൈൽ', 'അക്കൗണ്ട്', 'എന്റെ വിവരങ്ങൾ',
      'ente profile', 'account settings', 'profile open cheyyu'
    ]
  },
  {
    id: 'settings',
    labelEn: 'Settings & System Controls',
    labelMl: 'ക്രമീകരണങ്ങൾ',
    route: '/dashboard?tab=settings',
    tabId: 'settings',
    keywords: [
      'settings', 'setting', 'preferences', 'configuration', 'options', 'option', 'system settings',
      'ക്രമീകരണങ്ങൾ', 'സെറ്റിംഗ്സ്', 'app settings', 'settings thurakku'
    ]
  },
  {
    id: 'admin',
    labelEn: 'Admin Portal',
    labelMl: 'അഡ്മിൻ പോർട്ടൽ',
    route: '/dashboard?tab=admin',
    tabId: 'admin',
    keywords: [
      'admin', 'administrator', 'admin portal', 'system admin', 'control panel',
      'അഡ്മിൻ പോർട്ടൽ', 'അഡ്മിൻ', 'admin open cheyyu'
    ]
  },
  {
    id: 'supervisor',
    labelEn: 'Supervisor Hub',
    labelMl: 'സൂപ്പർവൈസർ പോർട്ടൽ',
    route: '/dashboard?tab=supervisor',
    tabId: 'supervisor',
    keywords: [
      'supervisor', 'super', 'supervisor portal', 'supervisor hub', 'field supervisor',
      'സൂപ്പർവൈസർ പോർട്ടൽ', 'സൂപ്പർവൈസർ', 'supervisor thurakku'
    ]
  }
];

export const VoiceNavigationProvider = ({ children }) => {
  const navigate = useNavigate();

  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionStatus, setRecognitionStatus] = useState('idle'); // 'idle'|'listening'|'processing'|'matched'|'ambiguous'|'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [matchedFeature, setMatchedFeature] = useState(null);
  const [ambiguousMatches, setAmbiguousMatches] = useState([]);
  const [micVolume, setMicVolume] = useState(0);
  
  // UI Overlays
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [voiceHelpOpen, setVoiceHelpOpen] = useState(false);
  const [voiceLang, setVoiceLang] = useState('ml'); // 'ml' | 'en'

  const recognitionRef = useRef(null);
  const latestTranscriptRef = useRef('');
  const hasProcessedRef = useRef(false);
  const audioStreamRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Stop Media Stream & Audio Context
  const stopAudioAnalyser = useCallback(() => {
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      audioStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setMicVolume(0);
  }, []);

  // Initialize SpeechSynthesis Text-to-Speech Feedback
  const speakVoiceResponse = useCallback((text, langCode = 'ml-IN') => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Pick preferred voice if available
        const voices = window.speechSynthesis.getVoices();
        const prefVoice = voices.find((v) => v.lang.includes(langCode.substring(0, 2)));
        if (prefVoice) utterance.voice = prefVoice;

        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('SpeechSynthesis notice:', err.message);
    }
  }, []);

  // Multi-tier Speech Intent Matcher Engine
  const parseVoiceIntent = useCallback((rawSpeechText) => {
    if (!rawSpeechText || typeof rawSpeechText !== 'string') return null;

    const raw = rawSpeechText.trim();
    if (!raw) return null;

    // 1. Clean & normalize speech input (remove punctuation, quotes, double spaces)
    const clean = raw
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return null;

    // 2. Greetings & Universal Commands
    const greetings = ['hi', 'hello', 'hey', 'namaskaram', 'ഹലോ', 'നമസ്കാരം', 'cardora', 'start', 'test'];
    if (greetings.some((g) => clean === g || clean.startsWith(g + ' ') || clean.endsWith(' ' + g))) {
      return { type: 'GREETING' };
    }

    if (
      clean === 'help' ||
      clean === 'what can i say' ||
      clean === 'സഹായം' ||
      clean.includes('എന്തൊക്കെ പറയാം')
    ) {
      return { type: 'HELP' };
    }

    // 3. Extract tokens & create noise-filtered text
    const tokens = clean.split(' ').filter(Boolean);

    // Common filler words to ignore when comparing full phrases
    const noiseWords = new Set([
      'go', 'to', 'the', 'page', 'open', 'show', 'me', 'take', 'i', 'want', 'please',
      'navigate', 'view', 'enter', 'section', 'tab', 'kanikku', 'thurakku', 'cheyyu',
      'nokkanam', 'poka', 'pokanam', 'ഒരു', 'ഈ', 'പോവുക', 'തുറക്കുക'
    ]);

    const nonNoiseTokens = tokens.filter((t) => !noiseWords.has(t));
    const cleanNoNoise = nonNoiseTokens.length > 0 ? nonNoiseTokens.join(' ') : clean;

    // 4. Score every registry item against clean, cleanNoNoise, and tokens
    const scoredResults = [];

    VOICE_NAV_REGISTRY.forEach((feature) => {
      let score = 0;
      const allKeywords = [
        ...feature.keywords,
        feature.labelEn.toLowerCase(),
        feature.labelMl.toLowerCase(),
        feature.id.toLowerCase()
      ];

      allKeywords.forEach((kw) => {
        const kwLower = kw.toLowerCase().trim();
        if (!kwLower) return;

        // --- Tier A: Exact Match ---
        if (clean === kwLower) {
          score += 1000;
        } else if (cleanNoNoise === kwLower) {
          score += 850;
        }

        // --- Tier B: Speech Contains Keyword / Keyword Contains Speech ---
        if (clean.includes(kwLower) || cleanNoNoise.includes(kwLower)) {
          score += 300 + kwLower.length * 15;
        }
        if (kwLower.length >= 3 && (kwLower.includes(clean) || kwLower.includes(cleanNoNoise))) {
          score += 200 + cleanNoNoise.length * 10;
        }

        // --- Tier C: Individual Token Level Matching ---
        tokens.forEach((token) => {
          if (!token || token.length < 2) return;

          // Exact Token Match
          if (token === kwLower) {
            score += 400;
          }
          // Token is Prefix of Keyword (e.g., "log" -> "login", "auth" -> "auth", "thott" -> "thottam", "doc" -> "doctor", "scan" -> "scanner")
          else if (kwLower.startsWith(token)) {
            score += 250 + token.length * 20;
          }
          // Keyword is Prefix of Token (e.g., "plantations" -> "plantation")
          else if (token.startsWith(kwLower)) {
            score += 250 + kwLower.length * 20;
          }
          // Substring token match (for tokens length >= 3)
          else if (token.length >= 3 && kwLower.includes(token)) {
            score += 150 + token.length * 10;
          }
          else if (kwLower.length >= 3 && token.includes(kwLower)) {
            score += 150 + kwLower.length * 10;
          }
        });
      });

      if (score > 0) {
        scoredResults.push({ feature, score });
      }
    });

    // Sort descending by score
    if (scoredResults.length > 0) {
      scoredResults.sort((a, b) => b.score - a.score);
      const topScore = scoredResults[0].score;

      // High confidence match
      if (
        scoredResults.length === 1 ||
        topScore >= 200 ||
        topScore >= scoredResults[1].score * 1.3
      ) {
        return { type: 'MATCH', feature: scoredResults[0].feature };
      } else {
        // Ambiguous if top scores are close
        const candidates = scoredResults
          .slice(0, 3)
          .map((s) => s.feature);
        const uniqueCandidates = candidates.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );
        return {
          type: 'AMBIGUOUS',
          candidates: uniqueCandidates,
        };
      }
    }

    return null;
  }, []);

  // Execute Voice Navigation & Auto-Transition
  const executeVoiceNavigation = useCallback((feature) => {
    if (!feature) return;

    setRecognitionStatus('matched');
    setMatchedFeature(feature);

    const spokenText = voiceLang === 'ml' 
      ? `${feature.labelMl} തുറക്കുന്നു...` 
      : `Opening ${feature.labelEn}...`;

    setStatusMessage(spokenText);
    speakVoiceResponse(spokenText, voiceLang === 'ml' ? 'ml-IN' : 'en-US');

    // Auto navigate without requiring another click
    setTimeout(() => {
      navigate(feature.route);
      setOverlayOpen(false);
      setIsListening(false);
      setRecognitionStatus('idle');
      stopAudioAnalyser();
    }, 1200);
  }, [navigate, voiceLang, speakVoiceResponse, stopAudioAnalyser]);

  // Start Speech Recognition
  const startListening = useCallback((forcedLang) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    stopAudioAnalyser();

    // Start Web Audio API Volume Decibel Meter
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        audioStreamRef.current = stream;
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyser || !audioStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round(avg * 2.2)));
            requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch (e) {
          console.warn('Audio meter init error:', e);
        }
      }).catch((err) => {
        console.warn('Microphone permission request notice:', err.message);
      });
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    const targetLang = forcedLang || (voiceLang === 'ml' ? 'ml-IN' : 'en-US');
    recognition.lang = targetLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    latestTranscriptRef.current = '';
    hasProcessedRef.current = false;

    setTranscript('');
    setMatchedFeature(null);
    setAmbiguousMatches([]);
    setRecognitionStatus('listening');
    setStatusMessage(
      targetLang === 'ml-IN'
        ? '🎙️ കേൾക്കുന്നു... ഉച്ചത്തിൽ പറയൂ (e.g. തോട്ടം, ലേലം, ഹലോ, weather)'
        : '🎙️ Listening... Say clearly (e.g. hello, weather, farm, thottam)'
    );
    setOverlayOpen(true);
    setIsListening(true);

    const processFinalSpeech = (rawText) => {
      if (hasProcessedRef.current || !rawText || !rawText.trim()) return;
      hasProcessedRef.current = true;

      setRecognitionStatus('processing');
      setStatusMessage(voiceLang === 'ml' ? '⚡ വിശകലനം ചെയ്യുന്നു...' : '⚡ Understanding intent...');

      const result = parseVoiceIntent(rawText);

      if (!result) {
        setRecognitionStatus('error');
        const errTxt = voiceLang === 'ml'
          ? '😕 എനിക്ക് അത് മനസ്സിലായില്ല. വീണ്ടും പറയുക അല്ലെങ്കിൽ താഴെ ടൈപ്പ് ചെയ്യുക.'
          : '😕 Could not recognize feature. Please try again or type below.';
        setStatusMessage(errTxt);
        speakVoiceResponse(errTxt, voiceLang === 'ml' ? 'ml-IN' : 'en-US');
      } else if (result.type === 'GREETING') {
        setRecognitionStatus('matched');
        const greetText = voiceLang === 'ml'
          ? '👋 ഹലോ! Cardora വോയ്‌സ് അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. തോട്ടം, ലേലം, രോഗം, കാലാവസ്ഥ എന്ന് പറയൂ!'
          : '👋 Hello! Welcome to Cardora Voice Assistant. Say farm, auctions, disease scan, or weather!';
        setStatusMessage(greetText);
        speakVoiceResponse(greetText, voiceLang === 'ml' ? 'ml-IN' : 'en-US');
      } else if (result.type === 'HELP') {
        setVoiceHelpOpen(true);
        setOverlayOpen(false);
        setIsListening(false);
      } else if (result.type === 'MATCH') {
        executeVoiceNavigation(result.feature);
      } else if (result.type === 'AMBIGUOUS') {
        setRecognitionStatus('ambiguous');
        setAmbiguousMatches(result.candidates);
        const ambTxt = voiceLang === 'ml'
          ? 'ഏത് തുറക്കണം? താഴെ നിന്ന് തിരഞ്ഞെടുക്കുക.'
          : 'Which feature did you mean? Select below.';
        setStatusMessage(ambTxt);
        speakVoiceResponse(ambTxt, voiceLang === 'ml' ? 'ml-IN' : 'en-US');
      }
    };

    recognition.onresult = (event) => {
      let accumulated = '';
      let isFinal = false;

      for (let i = 0; i < event.results.length; i++) {
        accumulated += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      const text = accumulated.trim();
      if (text) {
        latestTranscriptRef.current = text;
        setTranscript(text);
      }

      if (isFinal) {
        processFinalSpeech(text);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'no-speech') {
        if (latestTranscriptRef.current && !hasProcessedRef.current) {
          processFinalSpeech(latestTranscriptRef.current);
          return;
        }
        // Auto fallback to en-IN on desktop if ml-IN produced no-speech
        if (targetLang === 'ml-IN') {
          console.log('ml-IN produced no-speech, auto retrying with en-IN...');
          startListening('en-IN');
          return;
        }

        setRecognitionStatus('error');
        const msg = voiceLang === 'ml'
          ? '🤫 ശബ്ദം ലഭിച്ചില്ല. ഉച്ചത്തിൽ സംസാരിക്കുക അല്ലെങ്കിൽ താഴെയുള്ള ബട്ടൺ അമർത്തുക.'
          : '🤫 No speech heard. Please speak clearly or tap a shortcut below.';
        setStatusMessage(msg);
      } else if (event.error === 'not-allowed') {
        setRecognitionStatus('error');
        const msg = voiceLang === 'ml'
          ? '⚠️ മൈക്രോഫോൺ അനുമതി തടഞ്ഞു. ബ്രൗസർ സെറ്റിങ്സിൽ അലൗ ചെയ്യുക.'
          : '⚠️ Microphone access blocked. Please allow mic in browser settings.';
        setStatusMessage(msg);
      } else {
        setRecognitionStatus('error');
        const msg = voiceLang === 'ml' ? 'ശബ്ദം തിരിച്ചറിഞ്ഞില്ല. താഴെയുള്ള ലിങ്കുകൾ ഉപയോഗിക്കുക.' : 'Speech error. Please try again or tap below.';
        setStatusMessage(msg);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!hasProcessedRef.current && latestTranscriptRef.current) {
        processFinalSpeech(latestTranscriptRef.current);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn('Could not start recognition:', err.message);
    }
  }, [voiceLang, parseVoiceIntent, executeVoiceNavigation, speakVoiceResponse, stopAudioAnalyser]);

  // Stop Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setOverlayOpen(false);
  }, []);

  return (
    <VoiceNavigationContext.Provider
      value={{
        isListening,
        transcript,
        recognitionStatus,
        statusMessage,
        setStatusMessage,
        matchedFeature,
        ambiguousMatches,
        overlayOpen,
        setOverlayOpen,
        voiceHelpOpen,
        setVoiceHelpOpen,
        voiceLang,
        setVoiceLang,
        startListening,
        stopListening,
        parseVoiceIntent,
        executeVoiceNavigation,
        registry: VOICE_NAV_REGISTRY,
      }}
    >
      {children}
    </VoiceNavigationContext.Provider>
  );
};

export const useVoiceNavigation = () => {
  const context = useContext(VoiceNavigationContext);
  if (!context) {
    throw new Error('useVoiceNavigation must be used within a VoiceNavigationProvider');
  }
  return context;
};
