import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  Leaf, 
  Cloud, 
  Sun, 
  Droplets, 
  TrendingUp, 
  Mic, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Database, 
  ChevronRight,
  Menu,
  X,
  Play,
  Volume2,
  Languages,
  Home,
  Sparkles,
  Award,
  Shield,
  RefreshCw,
  Thermometer,
  Wind,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { apiService } from './services/api';

// Language translations
const translations = {
  en: {
    nav: ['Home', 'Features', 'AI Assistant', 'Plantation Management', 'About', 'Contact'],
    hero: {
      title: 'Smart Farming Solutions for a Better Cardamom Future',
      subtitle: 'Cardora helps cardamom farmers make smarter decisions using AI-powered recommendations, plantation insights, weather intelligence, and digital management tools.',
      buttons: ['Explore Cardora', 'Get Started', 'Listen in Malayalam']
    },
    about: {
      title: 'Transforming Traditional Cardamom Farming into Smart Agriculture',
      description: 'Cardora is a digital ecosystem designed to support cardamom farmers by combining artificial intelligence, plantation records, weather intelligence, and expert knowledge. It helps farmers understand their plantation health and make better decisions for sustainable cultivation.'
    },
    features: {
      title: 'Smart Features',
      items: [
        { title: 'AI-Based Plantation Insights', desc: 'Analyze plantation data, soil conditions, weather patterns, and historical records to provide personalized farming recommendations.' },
        { title: 'Soil & Moisture Monitoring', desc: 'Monitor soil moisture conditions and maintain the ideal environment for healthy cardamom growth.' },
        { title: 'Weather Intelligence', desc: 'Get accurate weather updates and understand how climate conditions affect your plantation.' },
        { title: 'Expert Consultation', desc: 'Connect with agricultural experts and get guidance for plantation improvement.' },
        { title: 'Digital Plantation Management', desc: 'Manage workers, tasks, plantation activities, and records efficiently.' },
        { title: 'Smart Reports & Analytics', desc: 'Generate plantation health reports and understand your farm performance.' }
      ]
    },
    howItWorks: {
      title: 'How Cardora Works',
      steps: [
        'Add Plantation Details',
        'Analyze Data',
        'Receive Recommendations',
        'Improve Productivity'
      ]
    },
    voice: {
      title: 'Technology That Speaks Your Language',
      description: 'Cardora supports voice interaction to make smart farming accessible for every farmer.',
      features: ['Malayalam voice assistant', 'Text-to-speech support', 'Voice-based navigation', 'Malayalam translation', 'English ↔ Malayalam language conversion']
    },
    dashboard: {
      health: 'Plantation Health',
      moisture: 'Soil Moisture',
      weather: 'Weather',
      recommendation: 'AI Recommendation'
    },
    whyChoose: {
      title: 'Built for Cardamom Farmers',
      points: [
        'Simple and farmer-friendly interface',
        'AI-powered decision support',
        'Malayalam language assistance',
        'Data-driven farming decisions',
        'Sustainable plantation management'
      ]
    },
    cta: {
      title: 'Grow Smarter. Farm Better. Build a Sustainable Cardamom Future.',
      description: 'Join Cardora and experience the future of smart cardamom plantation management.',
      button: 'Start Your Smart Farming Journey'
    }
  },
  ml: {
    nav: ['ഹോം', 'സവിശേഷതകൾ', 'എഐ അസിസ്റ്റന്റ്', 'പ്ലാന്റേഷൻ മാനേജ്മെന്റ്', 'ഞങ്ങളെക്കുറിച്ച്', 'ബന്ധപ്പെടുക'],
    hero: {
      title: 'മികച്ച ഏലത്തിന്റെ ഭാവിക്കായി സ്മാർട്ട് കൃഷി പരിഹാരങ്ങൾ',
      subtitle: 'എഐ-പവർ ശുപാർശകൾ, പ്ലാന്റേഷൻ ഉൾക്കാഴ്ചകൾ, കാലാവസ്ഥ ബുദ്ധി, ഡിജിറ്റൽ മാനേജ്മെന്റ് ടൂളുകൾ എന്നിവ ഉപയോഗിച്ച് കർഷകരെ മികച്ച തീരുമാനങ്ങൾ എടുക്കാൻ കാർഡോറ സഹായിക്കുന്നു.',
      buttons: ['കാർഡോറ പര്യവേക്ഷണം ചെയ്യുക', 'ആരംഭിക്കുക', 'മലയാളത്തിൽ കേൾക്കുക']
    },
    about: {
      title: 'പരമ്പരാഗത ഏലം കൃഷിയെ സ്മാർട്ട് അഗ്രികൾച്ചറിലേക്ക് മാറ്റുന്നു',
      description: 'ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ്, പ്ലാന്റേഷൻ രേഖകൾ, കാലാവസ്ഥ ബുദ്ധി, വിദഗ്ദ്ധ അറിവ് എന്നിവ സംയോജിപ്പിച്ച് കർഷകരെ പിന്തുണയ്ക്കുന്ന ഒരു ഡിജിറ്റൽ ആവാസവ്യവസ്ഥയാണ് കാർഡോറ. പ്ലാന്റേഷന്റെ ആരോഗ്യം മനസ്സിലാക്കാനും സുസ്ഥിര കൃഷിക്ക് മികച്ച തീരുമാനങ്ങൾ എടുക്കാനും ഇത് കർഷകരെ സഹായിക്കുന്നു.'
    },
    features: {
      title: 'സ്മാർട്ട് സവിശേഷതകൾ',
      items: [
        { title: 'എഐ അധിഷ്ഠിത പ്ലാന്റേഷൻ ഉൾക്കാഴ്ചകൾ', desc: 'വ്യക്തിഗത കൃഷി ശുപാർശകൾ നൽകുന്നതിന് പ്ലാന്റേഷൻ ഡാറ്റ, മണ്ണിന്റെ അവസ്ഥ, കാലാവസ്ഥാ രീതികൾ, ചരിത്ര രേഖകൾ എന്നിവ വിശകലനം ചെയ്യുന്നു.' },
        { title: 'മണ്ണും ഈർപ്പവും നിരീക്ഷണം', desc: 'ആരോഗ്യകരമായ ഏലം വളർച്ചയ്ക്ക് അനുയോജ്യമായ അന്തരീക്ഷം നിലനിർത്തുന്നതിന് മണ്ണിന്റെ ഈർപ്പം നിരീക്ഷിക്കുക.' },
        { title: 'കാലാവസ്ഥാ ബുദ്ധി', desc: 'കൃത്യമായ കാലാവസ്ഥാ അപ്ഡേറ്റുകൾ നേടുകയും കാലാവസ്ഥാ സാഹചര്യങ്ങൾ നിങ്ങളുടെ പ്ലാന്റേഷനെ എങ്ങനെ ബാധിക്കുന്നുവെന്ന് മനസ്സിലാക്കുകയും ചെയ്യുക.' },
        { title: 'വിദഗ്ദ്ധ കൺസൾട്ടേഷൻ', desc: 'കാർഷിക വിദഗ്ധരുമായി ബന്ധപ്പെടുകയും പ്ലാന്റേഷൻ മെച്ചപ്പെടുത്തുന്നതിനുള്ള മാർഗ്ഗനിർദ്ദേശം നേടുകയും ചെയ്യുക.' },
        { title: 'ഡിജിറ്റൽ പ്ലാന്റേഷൻ മാനേജ്മെന്റ്', desc: 'തൊഴിലാളികൾ, ജോലികൾ, പ്ലാന്റേഷൻ പ്രവർത്തനങ്ങൾ, രേഖകൾ എന്നിവ കാര്യക്ഷമമായി കൈകാര്യം ചെയ്യുക.' },
        { title: 'സ്മാർട്ട് റിപ്പോർട്ടുകളും അനലിറ്റിക്സും', desc: 'പ്ലാന്റേഷൻ ആരോഗ്യ റിപ്പോർട്ടുകൾ സൃഷ്ടിക്കുകയും നിങ്ങളുടെ ഫാം പ്രകടനം മനസ്സിലാക്കുകയും ചെയ്യുക.' }
      ]
    },
    howItWorks: {
      title: 'കാർഡോറ എങ്ങനെ പ്രവർത്തിക്കുന്നു',
      steps: [
        'പ്ലാന്റേഷൻ വിശദാംശങ്ങൾ ചേർക്കുക',
        'ഡാറ്റ വിശകലനം ചെയ്യുക',
        'ശുപാർശകൾ സ്വീകരിക്കുക',
        'ഉൽപ്പാദനക്ഷമത മെച്ചപ്പെടുത്തുക'
      ]
    },
    voice: {
      title: 'നിങ്ങളുടെ ഭാഷ സംസാരിക്കുന്ന സാങ്കേതികവിദ്യ',
      description: 'എല്ലാ കർഷകർക്കും സ്മാർട്ട് കൃഷി പ്രാപ്യമാക്കുന്നതിന് കാർഡോറ വോയ്സ് ഇന്ററാക്ഷൻ പിന്തുണയ്ക്കുന്നു.',
      features: ['മലയാളം വോയ്സ് അസിസ്റ്റന്റ്', 'ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പിന്തുണ', 'വോയ്സ് അധിഷ്ഠിത നാവിഗേഷൻ', 'മലയാളം വിവർത്തനം', 'ഇംഗ്ലീഷ് ↔ മലയാളം ഭാഷാ പരിവർത്തനം']
    },
    dashboard: {
      health: 'പ്ലാന്റേഷൻ ആരോഗ്യം',
      moisture: 'മണ്ണിന്റെ ഈർപ്പം',
      weather: 'കാലാവസ്ഥ',
      recommendation: 'എഐ ശുപാർശ'
    },
    whyChoose: {
      title: 'ഏലം കർഷകർക്കായി നിർമ്മിച്ചത്',
      points: [
        'ലളിതവും കർഷക സൗഹൃദവുമായ ഇന്റർഫേസ്',
        'എഐ-പവർ തീരുമാന പിന്തുണ',
        'മലയാളം ഭാഷാ സഹായം',
        'ഡാറ്റാധിഷ്ഠിത കൃഷി തീരുമാനങ്ങൾ',
        'സുസ്ഥിര പ്ലാന്റേഷൻ മാനേജ്മെന്റ്'
      ]
    },
    cta: {
      title: 'സുസ്ഥിരമായ ഏലത്തിന്റെ ഭാവി നിർമ്മിക്കൂ. മികച്ചതായി കൃഷി ചെയ്യുക.',
      description: 'കാർഡോറയിൽ ചേരുക, സ്മാർട്ട് ഏലം പ്ലാന്റേഷൻ മാനേജ്മെന്റിന്റെ ഭാവി അനുഭവിക്കുക.',
      button: 'നിങ്ങളുടെ സ്മാർട്ട് കൃഷി യാത്ര ആരംഭിക്കുക'
    }
  }
};

// Floating Card Component
const FloatingCard = ({ icon: Icon, title, value, color, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6, type: 'spring' }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(27, 94, 32, 0.2)'
      }}
      className="glass-card p-5 rounded-2xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-lg"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.6 } }
      }}
      whileHover={{ 
        y: -10, 
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(27, 94, 32, 0.15)'
      }}
      className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200"
    >
      <motion.div 
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
        whileHover={{ rotate: 5 }}
      >
        <Icon className="w-8 h-8 text-green-700" />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Step Component for How It Works
const Step = ({ number, title, description, index }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        visible: { opacity: 1, x: 0, transition: { delay: index * 0.2, duration: 0.6 } }
      }}
      className="flex items-start gap-6"
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Main Homepage Component
export default function Homepage() {
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language];

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Voice recognition
  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = language === 'ml' ? 'ml-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          try {
            const res = await apiService.askAiChat(transcript, language);
            const reply = (res && res.success && res.reply) ? res.reply : 'Voice command processed by CARDORA AI.';
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(reply.replace(/[*#]/g, ''));
              utterance.lang = language === 'ml' ? 'ml-IN' : 'en-US';
              utterance.rate = 0.95;
              window.speechSynthesis.speak(utterance);
            }
          } catch (e) {
            console.warn('Voice AI API error:', e);
          }
        }
      };

      recognition.start();
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  };

  // Sample dashboard data
  const dashboardData = {
    health: 85,
    moisture: 'Optimal',
    weather: 'Rain Expected',
    recommendation: 'Apply organic fertilizer after rainfall'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Loading Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        style={{ pointerEvents: 'none' }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Leaf className="w-16 h-16 text-green-600" />
        </motion.div>
      </motion.div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-green-700" />
              <span className="text-2xl font-bold text-green-800">CARDORA</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {t.nav.map((item, index) => (
                <a key={index} href="#" className="text-gray-700 hover:text-green-700 transition-colors font-medium">
                  {item}
                </a>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <Languages className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">
                  {language === 'en' ? 'മലയാളം' : 'English'}
                </span>
              </button>
              <button
                onClick={startVoiceRecognition}
                className={`relative p-3 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Mic className="w-5 h-5 text-white" />
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-4 h-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-green-700" /> : <Menu className="w-6 h-6 text-green-700" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 py-4 border-t border-gray-100"
            >
              {t.nav.map((item, index) => (
                <a key={index} href="#" className="block py-2 text-gray-700 hover:text-green-700 transition-colors">
                  {item}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <Languages className="w-4 h-4 text-green-700" />
                  <span className="text-sm font-medium text-green-700">
                    {language === 'en' ? 'മലയാളം' : 'English'}
                  </span>
                </button>
                <button
                  onClick={startVoiceRecognition}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  <Mic className="w-4 h-4" />
                  Voice Assistant
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background with Parallax */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-green-700/20"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1599619351208-3c6f4e9a5ec3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            }}
          ></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
            >
              {t.hero.title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white/90 mb-8 max-w-2xl drop-shadow"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                {t.hero.buttons[0]}
                <ChevronRight className="inline ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-semibold border border-white/30 transition-all duration-300">
                {t.hero.buttons[1]}
              </button>
              <button className="px-8 py-4 bg-green-500/30 backdrop-blur-sm hover:bg-green-500/40 text-white rounded-xl font-semibold border border-green-400/30 transition-all duration-300 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                {t.hero.buttons[2]}
              </button>
            </motion.div>

            {/* Floating Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">
              <FloatingCard
                icon={Leaf}
                title="Soil Health"
                value="78%"
                color="bg-green-600"
                index={0}
              />
              <FloatingCard
                icon={Cloud}
                title="Weather"
                value="Rain 60%"
                color="bg-blue-500"
                index={1}
              />
              <FloatingCard
                icon={Sparkles}
                title="Crop Health"
                value="92%"
                color="bg-yellow-500"
                index={2}
              />
              <FloatingCard
                icon={TrendingUp}
                title="Growth"
                value="Excellent"
                color="bg-purple-500"
                index={3}
              />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 105C1200 110 1320 110 1380 110L1440 110V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8F5E8"/>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-[#F8F5E8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              {t.about.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              {t.about.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Leaf, label: 'Plantation Management' },
                { icon: Cloud, label: 'Weather Intelligence' },
                { icon: Sparkles, label: 'AI Recommendations' },
                { icon: BarChart3, label: 'Smart Analytics' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
                    <item.icon className="w-10 h-10 text-green-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              {t.features.title}
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={[Leaf, Droplets, Cloud, MessageCircle, Users, BarChart3][index % 6]}
                title={feature.title}
                description={feature.desc}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-green-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              {t.howItWorks.title}
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12">
            {t.howItWorks.steps.map((step, index) => (
              <Step
                key={index}
                number={index + 1}
                title={step}
                description={`Step ${index + 1} in the Cardora journey`}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Voice Assistant Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
                {t.voice.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t.voice.description}
              </p>
              <div className="space-y-3">
                {t.voice.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative">
                <button
                  onClick={startVoiceRecognition}
                  className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening ? 'bg-red-500' : 'bg-green-600 hover:bg-green-700'
                  } shadow-2xl`}
                >
                  <Mic className="w-16 h-16 text-white" />
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></span>
                      <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse"></span>
                    </>
                  )}
                </button>
                {isListening && (
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-8 bg-green-600 rounded-full"
                        animate={{
                          height: [8, 32, 8],
                          scaleY: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 0.6,
                          delay: i * 0.1,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">Click the microphone to speak</p>
                <p className="text-xs text-gray-400 mt-1">Supports Malayalam & English</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-[#F8F5E8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Plantation Dashboard
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Leaf, label: t.dashboard.health, value: '85%', color: 'bg-green-500', progress: 85 },
              { icon: Droplets, label: t.dashboard.moisture, value: 'Optimal', color: 'bg-blue-500', progress: 70 },
              { icon: Cloud, label: t.dashboard.weather, value: 'Rain Expected', color: 'bg-gray-500', progress: 0 },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${item.color} bg-opacity-10`}>
                    <item.icon className={`w-6 h-6 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm text-gray-500">{item.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                {item.progress > 0 && (
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      viewport={{ once: true }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                )}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-full md:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-500">{t.dashboard.recommendation}</span>
              </div>
              <p className="text-gray-800">{dashboardData.recommendation}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">
                {t.whyChoose.title}
              </h2>
              <div className="space-y-4">
                {t.whyChoose.points.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-200 to-green-300 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-8 text-white shadow-2xl">
                  <Leaf className="w-16 h-16 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Cardora</h3>
                  <p className="text-green-100">Smart Digital Ecosystem for Cardamom</p>
                  <div className="mt-6 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span className="text-sm">Trusted by farmers</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-800 to-green-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599619351208-3c6f4e9a5ec3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-green-100 mb-8">
              {t.cta.description}
            </p>
            <button className="px-10 py-4 bg-white text-green-800 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-green-50">
              {t.cta.button}
              <ChevronRight className="inline ml-2 w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Leaf className="w-6 h-6 text-green-500" />
              <span className="text-xl font-bold text-white">CARDORA</span>
            </div>
            <p className="text-sm">
              © 2024 Cardora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}