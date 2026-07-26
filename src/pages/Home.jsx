import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Cloud, 
  Droplets, 
  BarChart3,
  Sparkles, 
  Zap, 
  ChevronRight, 
  ArrowRight,
  Mic,
  Languages,
  CheckCircle2,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';
import AnimatedSection from '../components/animations/AnimatedSection';
import CardamomGrowthJourney from '../components/animations/CardamomGrowthJourney';
import NatureBackground from '../components/animations/NatureBackground';
import { useAuth } from '../context/AuthContext';

// Cardamom Image URLs
const CARDAMOM_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1599077614303-81a9f2cbe185?w=1200&q=80',
  plantation: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&q=80',
  farmer: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
  cardamomPods: 'https://images.unsplash.com/photo-1599077614303-81a9f2cbe185?w=600&q=80',
  greenCardamom: 'https://images.unsplash.com/photo-1599077614303-81a9f2cbe185?w=400&q=80',
};

// ===== TRANSLATIONS =====
const translations = {
  en: {
    heroBadge: '🌿 AI-Powered Agriculture',
    heroTitle: 'Empowering Cardamom Farmers with AI-Driven Smart Plantation',
    heroDesc: 'Monitor plantations, analyze soil and weather conditions, receive intelligent recommendations, and improve productivity through a smart digital ecosystem.',
    heroBtn1: 'Get Started',
    heroBtn2: 'Watch Demo',
    trusted: 'Trusted by 10,000+ farmers',
    
    featuresBadge: 'Features',
    featuresTitle: 'Powerful Features for Smart Farming',
    featuresSub: 'Everything you need to manage your cardamom plantation effectively and sustainably.',
    
    growthBadge: 'Growth Journey',
    growthTitle: 'From Seed to Harvest',
    growthSub: 'Watch your plantation grow with Cardora\'s AI-powered insights at every crucial stage.',
    
    testimonialBadge: 'Testimonials',
    testimonialTitle: 'What Farmers Say About Cardora',
    testimonialSub: 'Real stories from plantation owners transformed by digital intelligence.',
    
    showcaseBadge: 'Premium Quality',
    showcaseTitle: 'Premium Cardamom from Kerala',
    showcaseSub: 'Our platform supports the finest cardamom cultivation with precision AI analysis.',
    
    faqBadge: 'FAQ',
    faqTitle: 'Frequently Asked Questions',
    faqSub: 'Find quick answers to common questions about Cardora features and onboarding.',
    
    ctaTitle: 'Ready to Transform Your Cardamom Plantation?',
    ctaDesc: 'Join thousands of farmers who are already using Cardora to make smarter, data-driven farming decisions.',
    ctaBtn: 'Start Your Free Trial',
    
    stat1: 'Farmers Supported',
    stat2: 'Plantations',
    stat3: 'Accuracy',
    stat4: 'AI Assistance',
    
    planting: 'Planting',
    plantingDesc: 'Smart soil matching and planting density advice',
    growing: 'Growing',
    growingDesc: 'Real-time soil & irrigation health monitoring',
    thriving: 'Thriving',
    thrivingDesc: 'AI-powered pest risk alerts & organic care',
    harvest: 'Harvest',
    harvestDesc: 'Optimal pod size & peak harvest timing',
    
    faq1: 'What is Cardora?',
    faq1Ans: 'Cardora is an AI-powered platform that helps plantation owners manage their cardamom farms efficiently. It combines plantation records, soil analysis, weather information, and AI-based recommendations.',
    faq2: 'How does the AI recommendation system work?',
    faq2Ans: 'Our AI analyzes your plantation data, soil conditions, weather patterns, and historical records to provide personalized recommendations for planting, fertilization, and pest control.',
    faq3: 'Is Cardora available in Malayalam?',
    faq3Ans: 'Yes! Cardora fully supports Malayalam with voice assistance, making it accessible for local farmers.',
    faq4: 'How do I get started with Cardora?',
    faq4Ans: 'Simply create an account, add your plantation details, and start receiving AI-powered insights and recommendations.',
  },
  ml: {
    heroBadge: '🌿 എഐ-പവർ കാർഷികം',
    heroTitle: 'എഐ-ഡ്രിവൻ സ്മാർട്ട് പ്ലാന്റേഷൻ ഉപയോഗിച്ച് ഏലം കർഷകരെ ശാക്തീകരിക്കുന്നു',
    heroDesc: 'തോട്ടങ്ങൾ നിരീക്ഷിക്കുക, മണ്ണും കാലാവസ്ഥയും വിശകലനം ചെയ്യുക, ബുദ്ധിപരമായ ശുപാർശകൾ സ്വീകരിക്കുക, ഒരു സ്മാർട്ട് ഡിജിറ്റൽ ഇക്കോസിസ്റ്റം വഴി ഉൽപ്പാദനക്ഷമത മെച്ചപ്പെടുത്തുക.',
    heroBtn1: 'ആരംഭിക്കുക',
    heroBtn2: 'ഡെമോ കാണുക',
    trusted: '10,000+ കർഷകർ വിശ്വസിക്കുന്നു',
    
    featuresBadge: 'സവിശേഷതകൾ',
    featuresTitle: 'സ്മാർട്ട് കൃഷിക്ക് ശക്തമായ സവിശേഷതകൾ',
    featuresSub: 'നിങ്ങളുടെ ഏലം തോട്ടം ഫലപ്രദമായി കൈകാര്യം ചെയ്യാൻ ആവശ്യമായ എല്ലാം',
    
    growthBadge: 'വളർച്ചാ യാത്ര',
    growthTitle: 'വിത്തിൽ നിന്ന് വിളവെടുപ്പിലേക്ക്',
    growthSub: 'ഓരോ ഘട്ടത്തിലും കാർഡോറയുടെ എഐ-പവർ ഉൾക്കാഴ്ചകൾ ഉപയോഗിച്ച് നിങ്ങളുടെ തോട്ടം വളരുന്നത് കാണുക',
    
    testimonialBadge: 'സാക്ഷ്യപത്രങ്ങൾ',
    testimonialTitle: 'കർഷകർ കാർഡോറയെക്കുറിച്ച് പറയുന്നത്',
    testimonialSub: 'യഥാർത്ഥ കർഷകരിൽ നിന്നുള്ള യഥാർത്ഥ കഥകൾ',
    
    showcaseBadge: 'പ്രീമിയം ഗുണനിലവാരം',
    showcaseTitle: 'കേരളത്തിൽ നിന്നുള്ള പ്രീമിയം ഏലം',
    showcaseSub: 'എഐ-പവർ ഉൾക്കാഴ്ചകൾ ഉപയോഗിച്ച് മികച്ച ഏലം കൃഷിയെ ഞങ്ങളുടെ പ്ലാറ്റ്ഫോം പിന്തുണയ്ക്കുന്നു',
    
    faqBadge: 'പതിവ് ചോദ്യങ്ങൾ',
    faqTitle: 'പതിവ് ചോദ്യങ്ങൾ',
    faqSub: 'കാർഡോറയെക്കുറിച്ചുള്ള പൊതുവായ ചോദ്യങ്ങൾക്കുള്ള ഉത്തരങ്ങൾ കണ്ടെത്തുക',
    
    ctaTitle: 'നിങ്ങളുടെ ഏലം തോട്ടം പരിവർത്തനം ചെയ്യാൻ തയ്യാറാണോ?',
    ctaDesc: 'സ്മാർട്ട് കൃഷി തീരുമാനങ്ങൾ എടുക്കാൻ ഇതിനകം കാർഡോറ ഉപയോഗിക്കുന്ന ആയിരക്കണക്കിന് കർഷകരിൽ ചേരുക.',
    ctaBtn: 'നിങ്ങളുടെ സൗജന്യ ട്രയൽ ആരംഭിക്കുക',
    
    stat1: 'കർഷകർ പിന്തുണച്ചു',
    stat2: 'തോട്ടങ്ങൾ',
    stat3: 'കൃത്യത',
    stat4: 'എഐ സഹായം',
    
    planting: 'നടീൽ',
    plantingDesc: 'സ്മാർട്ട് നടീൽ ശുപാർശകൾ',
    growing: 'വളർച്ച',
    growingDesc: 'തത്സമയ വളർച്ചാ നിരീക്ഷണം',
    thriving: 'വളർച്ച',
    thrivingDesc: 'എഐ-പവർ പരിചരണ ഉൾക്കാഴ്ചകൾ',
    harvest: 'വിളവെടുപ്പ്',
    harvestDesc: 'ഒപ്റ്റിമൽ വിളവെടുപ്പ് സമയം',
    
    faq1: 'എന്താണ് കാർഡോറ?',
    faq1Ans: 'തോട്ടം ഉടമകളെ അവരുടെ ഏലം ഫാമുകൾ കാര്യക്ഷമമായി കൈകാര്യം ചെയ്യാൻ സഹായിക്കുന്ന ഒരു എഐ-പവർ പ്ലാറ്റ്ഫോമാണ് കാർഡോറ. ഇത് തോട്ടം രേഖകൾ, മണ്ണ് വിശകലനം, കാലാവസ്ഥ വിവരങ്ങൾ, എഐ അടിസ്ഥാനമാക്കിയുള്ള ശുപാർശകൾ എന്നിവ സംയോജിപ്പിക്കുന്നു.',
    faq2: 'എഐ ശുപാർശ സംവിധാനം എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
    faq2Ans: 'നടീൽ, വളപ്രയോഗം, കീട നിയന്ത്രണം എന്നിവയ്ക്കായി വ്യക്തിഗത ശുപാർശകൾ നൽകുന്നതിന് ഞങ്ങളുടെ എഐ നിങ്ങളുടെ തോട്ടം ഡാറ്റ, മണ്ണിന്റെ അവസ്ഥ, കാലാവസ്ഥാ രീതികൾ, ചരിത്ര രേഖകൾ എന്നിവ വിശകലനം ചെയ്യുന്നു.',
    faq3: 'കാർഡോറ മലയാളത്തിൽ ലഭ്യമാണോ?',
    faq3Ans: 'അതെ! പ്രാദേശിക കർഷകർക്ക് ഇത് ആക്സസ് ചെയ്യുന്നതിനായി കാർഡോറ വോയ്സ് അസിസ്റ്റൻസിനൊപ്പം മലയാളത്തെ പൂർണ്ണമായും പിന്തുണയ്ക്കുന്നു.',
    faq4: 'ഞാൻ എങ്ങനെ കാർഡോറ ഉപയോഗിക്കാൻ തുടങ്ങും?',
    faq4Ans: 'ഒരു അക്കൗണ്ട് സൃഷ്ടിക്കുക, നിങ്ങളുടെ തോട്ടം വിശദാംശങ്ങൾ ചേർക്കുക, എഐ-പവർ ഉൾക്കാഴ്ചകളും ശുപാർശകളും സ്വീകരിക്കാൻ ആരംഭിക്കുക.',
  }
};

// ===== VOICE RECOGNITION COMPONENT =====
const VoiceAssistant = ({ language, onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!isSupported) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ml' ? 'ml-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      if (onTranscript) {
        onTranscript(result);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-[#4A5568] text-xs">
        <span>Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={startListening}
        className={`relative p-3 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30' 
            : 'bg-[#1F5E3B] hover:bg-[#5C8D4E] shadow-md text-white'
        }`}
      >
        <Mic className="w-5 h-5 text-white" />
      </motion.button>
      <p className="mt-1 text-[10px] md:text-xs text-[#4A5568] font-bold">
        {isListening ? '🔴 ' + (language === 'ml' ? 'ശ്രദ്ധിക്കുന്നു...' : 'Listening...') : (language === 'ml' ? 'സംസാരിക്കാൻ ക്ലിക്ക് ചെയ്യുക' : 'Voice Command')}
      </p>
      {transcript && (
        <p className="mt-1 text-xs text-[#1F5E3B] font-bold max-w-[160px] text-center truncate">
          "{transcript}"
        </p>
      )}
    </div>
  );
};

// Stat Counter Component with scale transform
const StatCounter = ({ value, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1800;
          const increment = value / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= value) { 
              setCount(value); 
              clearInterval(timer); 
            } else { 
              setCount(Math.floor(start)); 
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center p-4">
      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1F5E3B] font-poppins">
        {count}{suffix}
      </div>
      <p className="mt-1.5 text-xs md:text-sm font-bold text-[#4A5568]">{label}</p>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay = 0, image }) => (
  <AnimatedSection direction="up" delay={delay}>
    <Card className="group relative overflow-hidden h-full flex flex-col justify-between transition-all duration-300">
      <div>
        {image && (
          <div className="relative h-48 -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-[20px]">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#17331F]/80 via-transparent to-transparent" />
          </div>
        )}
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#DDEFD9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-[#5C8D4E]/30">
            <Icon className="w-6 h-6 text-[#1F5E3B]" />
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-[#17331F] mb-2 group-hover:text-[#1F5E3B] transition-colors">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-[#4A5568] leading-relaxed mb-4 font-medium">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#D7E6D5] flex items-center text-[#1F5E3B] font-bold text-xs md:text-sm group-hover:gap-2 transition-all">
        <span>Learn More</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Card>
  </AnimatedSection>
);

// Testimonial Card Component
const TestimonialCard = ({ name, role, quote, delay = 0, image }) => (
  <AnimatedSection direction="up" delay={delay}>
    <Card className="relative h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#1F5E3B] to-[#5C8D4E] flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-[#17331F] text-sm md:text-base">{name}</h4>
              <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
            </div>
            <p className="text-xs text-[#5C8D4E] font-medium">{role}</p>
          </div>
        </div>
        <p className="text-xs md:text-sm text-[#4A5568] leading-relaxed italic mb-4 font-medium">
          "{quote}"
        </p>
      </div>
      <div className="flex gap-1 pt-3 border-t border-[#D7E6D5]">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-[#C9A227] text-sm">★</span>
        ))}
      </div>
    </Card>
  </AnimatedSection>
);

// FAQ Item Component with Rotation animation (NO opacity fade)
const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-[#D7E6D5] last:border-0 py-4">
    <button 
      onClick={onToggle} 
      className="w-full flex items-center justify-between text-left font-bold text-[#17331F] hover:text-[#1F5E3B] transition-colors py-1"
    >
      <span className="text-sm md:text-base pr-4">{question}</span>
      <motion.span 
        animate={{ rotate: isOpen ? 180 : 0 }} 
        transition={{ duration: 0.3 }} 
        className="text-[#1F5E3B] flex-shrink-0 p-1 rounded-full bg-[#DDEFD9]"
      >
        <ChevronRight className="w-5 h-5" />
      </motion.span>
    </button>
    {isOpen && (
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ transformOrigin: 'top center' }}
        transition={{ duration: 0.3 }}
        className="pt-3 pb-1 text-xs md:text-sm text-[#4A5568] leading-relaxed font-medium"
      >
        {answer}
      </motion.div>
    )}
  </div>
);

// ===== MAIN HOME COMPONENT =====
const Home = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const { lang, toggleLang } = useAuth();
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);

  const t = translations[lang] || translations.en;

  const features = [
    { 
      icon: Leaf, 
      title: lang === 'en' ? 'Plantation Management' : 'തോട്ടം മാനേജ്മെന്റ്', 
      description: lang === 'en' 
        ? 'Track and manage all your plantation records, including planting dates, irrigation, and harvest schedules.'
        : 'നടീൽ തീയതികൾ, ജലസേചനം, വിളവെടുപ്പ് ഷെഡ്യൂളുകൾ എന്നിവയുൾപ്പെടെ നിങ്ങളുടെ എല്ലാ തോട്ടം രേഖകളും ട്രാക്ക് ചെയ്ത് കൈകാര്യം ചെയ്യുക.',
      image: CARDAMOM_IMAGES.plantation
    },
    { 
      icon: Droplets, 
      title: lang === 'en' ? 'Soil & Moisture Analysis' : 'മണ്ണും ഈർപ്പവും വിശകലനം', 
      description: lang === 'en'
        ? 'Get detailed soil analysis including pH, NPK levels, and moisture content for optimal crop growth.'
        : 'pH, NPK ലെവലുകൾ, ഈർപ്പം എന്നിവ ഉൾപ്പെടെ വിശദമായ മണ്ണ് വിശകലനം നേടുക.',
      image: CARDAMOM_IMAGES.cardamomPods
    },
    { 
      icon: Cloud, 
      title: lang === 'en' ? 'Real-Time Weather Updates' : 'തത്സമയ കാലാവസ്ഥ അപ്ഡേറ്റുകൾ', 
      description: lang === 'en'
        ? 'Stay informed with accurate weather forecasts and real-time weather conditions for your plantation.'
        : 'കൃത്യമായ കാലാവസ്ഥാ പ്രവചനങ്ങളും നിങ്ങളുടെ തോട്ടത്തിനുള്ള തത്സമയ കാലാവസ്ഥാ സാഹചര്യങ്ങളും അറിയുക.',
      image: CARDAMOM_IMAGES.plantation
    },
    { 
      icon: Sparkles, 
      title: lang === 'en' ? 'AI-Based Recommendations' : 'എഐ അടിസ്ഥാന ശുപാർശകൾ', 
      description: lang === 'en'
        ? 'Receive intelligent recommendations for planting, fertilization, and pest control based on AI analysis.'
        : 'എഐ വിശകലനത്തെ അടിസ്ഥാനമാക്കി നടീൽ, വളപ്രയോഗം, കീട നിയന്ത്രണം എന്നിവയ്ക്കുള്ള ബുദ്ധിപരമായ ശുപാർശകൾ സ്വീകരിക്കുക.',
      image: CARDAMOM_IMAGES.greenCardamom
    },
    { 
      icon: BarChart3, 
      title: lang === 'en' ? 'Plantation Health Score' : 'തോട്ടം ആരോഗ്യ സ്കോർ', 
      description: lang === 'en'
        ? 'Monitor the overall health of your plantation with an easy-to-understand health score indicator.'
        : 'എളുപ്പത്തിൽ മനസ്സിലാക്കാവുന്ന ആരോഗ്യ സ്കോർ സൂചകം ഉപയോഗിച്ച് നിങ്ങളുടെ തോട്ടത്തിന്റെ മൊത്തത്തിലുള്ള ആരോഗ്യം നിരീക്ഷിക്കുക.',
      image: CARDAMOM_IMAGES.farmer
    },
    { 
      icon: Zap, 
      title: lang === 'en' ? 'Smart Notifications' : 'സ്മാർട്ട് അറിയിപ്പുകൾ', 
      description: lang === 'en'
        ? 'Get timely alerts about weather changes, pest risks, and important plantation events.'
        : 'കാലാവസ്ഥാ മാറ്റങ്ങൾ, കീട അപകടങ്ങൾ, പ്രധാന തോട്ടം സംഭവങ്ങൾ എന്നിവയെക്കുറിച്ചുള്ള സമയബന്ധിതമായ അലേർട്ടുകൾ നേടുക.',
      image: CARDAMOM_IMAGES.cardamomPods
    },
  ];

  const testimonials = [
    { 
      name: lang === 'en' ? 'Rajesh Kumar' : 'രാജേഷ് കുമാർ', 
      role: lang === 'en' ? 'Cardamom Farmer, Kerala' : 'ഏലം കർഷകൻ, കേരളം', 
      quote: lang === 'en' 
        ? 'Cardora has transformed how I manage my plantation. The AI recommendations helped me increase my yield by 30%!'
        : 'എന്റെ തോട്ടം എങ്ങനെ കൈകാര്യം ചെയ്യണമെന്ന് കാർഡോറ മാറ്റിമറിച്ചു. എഐ ശുപാർശകൾ എന്റെ വിളവ് 30% വർദ്ധിപ്പിക്കാൻ സഹായിച്ചു!',
      image: CARDAMOM_IMAGES.farmer
    },
    { 
      name: lang === 'en' ? 'Sneha Nair' : 'സ്നേഹ നായർ', 
      role: lang === 'en' ? 'Plantation Owner, Tamil Nadu' : 'തോട്ടം ഉടമ, തമിഴ്നാട്', 
      quote: lang === 'en'
        ? 'The soil analysis feature is a game-changer. I can now make informed decisions about fertilizer application.'
        : 'മണ്ണ് വിശകലന സവിശേഷത ഒരു ഗെയിം ചേഞ്ചർ ആണ്. വളപ്രയോഗത്തെക്കുറിച്ച് അറിവുള്ള തീരുമാനങ്ങൾ എടുക്കാൻ എനിക്ക് ഇപ്പോൾ കഴിയും.',
      image: CARDAMOM_IMAGES.farmer
    },
    { 
      name: lang === 'en' ? 'Vikram Singh' : 'വിക്രം സിംഗ്', 
      role: lang === 'en' ? 'Organic Farmer, Karnataka' : 'ഓർഗാനിക് കർഷകൻ, കർണാടക', 
      quote: lang === 'en'
        ? 'Real-time weather alerts have saved my crop multiple times. This is exactly what farmers need!'
        : 'തത്സമയ കാലാവസ്ഥാ അലേർട്ടുകൾ എന്റെ വിള ഒന്നിലധികം തവണ രക്ഷിച്ചു. കർഷകർക്ക് ഇത് കൃത്യമായി ആവശ്യമുള്ളതാണ്!',
      image: CARDAMOM_IMAGES.farmer
    },
  ];

  const showcaseItems = [
    { 
      title: lang === 'en' ? 'Alleppey Green Pods (AGEB)' : 'ആലപ്പുഴ ഗ്രീൻ ഏലം',
      tag: lang === 'en' ? 'Grade A Superior' : 'ഗ്രേഡ് എ സുപ്പീരിയർ',
      location: 'Idukki, Kerala (1100m MSL)',
      image: CARDAMOM_IMAGES.cardamomPods
    },
    { 
      title: lang === 'en' ? 'Eco Shade Cultivated' : 'ഇക്കോ ഷേഡ് കൃഷി',
      tag: lang === 'en' ? '100% Organic' : '100% ജൈവം',
      location: 'Western Ghats Bio-Reserve',
      image: CARDAMOM_IMAGES.greenCardamom
    },
    { 
      title: lang === 'en' ? 'High Essential Oil Yield' : 'ഉയർന്ന എണ്ണ ലഭ്യത',
      tag: lang === 'en' ? 'Aroma Score 98%' : 'സുഗന്ധ സ്കോർ 98%',
      location: 'Vandanmedu Spice Belt',
      image: CARDAMOM_IMAGES.plantation
    },
    { 
      title: lang === 'en' ? 'Precision Harvested' : 'കൃത്യതയാർന്ന വിളവെടുപ്പ്',
      tag: lang === 'en' ? 'AI Harvest Timed' : 'എഐ വിളവെടുപ്പ്',
      location: 'Certified Organic Plantation',
      image: CARDAMOM_IMAGES.farmer
    },
  ];

  const faqs = [
    { question: t.faq1, answer: t.faq1Ans },
    { question: t.faq2, answer: t.faq2Ans },
    { question: t.faq3, answer: t.faq3Ans },
    { question: t.faq4, answer: t.faq4Ans },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#4A5568] relative overflow-x-hidden">
      <NatureBackground />
      <Navbar />

      {/* Floating Language & Voice Assistant Control Widget */}
      <div className="fixed top-24 right-4 z-40 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-[#D7E6D5] hover:border-[#1F5E3B] transition-all"
          >
            <Languages className="w-4 h-4 text-[#1F5E3B]" />
            <span className="text-xs font-extrabold text-[#17331F]">
              {lang === 'en' ? '🇬🇧 EN' : '🇮🇳 ML'}
            </span>
          </motion.button>

          <button 
            onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-[#D7E6D5] text-[#1F5E3B]"
            title="Toggle Voice Assistant"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {isWidgetExpanded && (
          <div className="bg-white/95 backdrop-blur-md rounded-[20px] shadow-xl border border-[#D7E6D5] p-3 mt-1">
            <VoiceAssistant 
              language={lang} 
              onTranscript={(text) => console.log('Voice prompt:', text)}
            />
          </div>
        )}
      </div>

      {/* HERO SECTION - Premium Nature Saas Layout */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-28 pb-16 md:pb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src={CARDAMOM_IMAGES.hero} 
            alt="Cardamom Plantation" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#17331F]/95 via-[#17331F]/85 to-[#1F5E3B]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAF7] via-transparent to-transparent opacity-95" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <AnimatedSection direction="left">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-6 text-xs md:text-sm font-extrabold text-[#17331F] bg-[#DDEFD9] backdrop-blur-md rounded-full border border-[#5C8D4E]/40 shadow-soft">
                {t.heroBadge}
              </span>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight font-poppins tracking-tight">
                {t.heroTitle}
              </h1>

              <p className="mt-6 text-sm md:text-lg text-[#DDEFD9]/90 max-w-lg leading-relaxed font-medium">
                {t.heroDesc}
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link to="/auth?mode=signup">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    {t.heroBtn1}
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="secondary" size="lg">
                    {t.heroBtn2}
                  </Button>
                </a>
              </div>

              <div className="mt-8 flex items-center gap-5 pt-6 border-t border-[#DDEFD9]/20">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-[#1F5E3B] to-[#5C8D4E] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#C9A227] text-sm md:text-base">★★★★★</span>
                    <span className="text-sm font-extrabold text-white">4.9/5</span>
                  </div>
                  <p className="text-xs text-[#DDEFD9]/80 font-medium">{t.trusted}</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Right Hero Glass Visual */}
            <AnimatedSection direction="right" className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#C9A227]/30 to-[#5C8D4E]/30 rounded-[30px] blur-2xl" />
                <div className="relative bg-white/10 backdrop-blur-2xl rounded-[30px] border border-white/20 p-6 shadow-2xl text-white">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#C9A227] animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider">Live Plantation Telemetry</span>
                    </div>
                    <span className="text-xs bg-[#1F5E3B] text-white px-2.5 py-0.5 rounded-full font-bold">Kerala</span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-[20px] bg-white/10 border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="text-[11px] text-[#DDEFD9]">Soil Moisture</p>
                        <p className="text-2xl font-black font-poppins">72% Optimal</p>
                      </div>
                      <Droplets className="w-8 h-8 text-[#DDEFD9]" />
                    </div>

                    <div className="p-4 rounded-[20px] bg-white/10 border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="text-[11px] text-[#DDEFD9]">AI Health Index</p>
                        <p className="text-2xl font-black font-poppins">96 / 100</p>
                      </div>
                      <Sparkles className="w-8 h-8 text-[#C9A227]" />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>

      {/* SIGNATURE ANIMATION SECTION: CARDAMOM GROWTH JOURNEY (DIRECTLY BELOW HERO) */}
      <CardamomGrowthJourney />

      {/* STATISTICS SECTION */}
      <section className="py-12 bg-[#F8FAF7] relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-[20px] shadow-soft border border-[#D7E6D5] p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between max-w-5xl mx-auto">
            <StatCounter value={10000} label={t.stat1} suffix="+" />
            <StatCounter value={500} label={t.stat2} suffix="+" />
            <StatCounter value={97} label={t.stat3} suffix="%" />
            <StatCounter value={24} label={t.stat4} suffix="/7" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Light Sage Background) */}
      <section className="py-16 md:py-24 bg-[#DDEFD9]/30 border-y border-[#D7E6D5]" id="features">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge={t.featuresBadge}
            title={t.featuresTitle}
            subtitle={t.featuresSub}
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                {...feature} 
                delay={index * 0.1} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* CARDAMOM QUALITY SHOWCASE SECTION (White Background) */}
      <section className="py-16 md:py-24 bg-white" id="showcase">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge={t.showcaseBadge}
            title={t.showcaseTitle}
            subtitle={t.showcaseSub}
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {showcaseItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.9, y: 20 }}
                whileInView={{ scale: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-[20px] bg-white shadow-soft border border-[#D7E6D5] hover:border-[#1F5E3B] transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17331F]/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-3 py-1 text-xs font-extrabold text-[#17331F] bg-[#DDEFD9] backdrop-blur-md rounded-full shadow-sm">
                    {item.tag}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-[#5C8D4E] font-bold mb-1">
                    <Award className="w-4 h-4 text-[#C9A227]" />
                    <span>{item.location}</span>
                  </div>
                  <h4 className="font-extrabold text-[#17331F] text-base group-hover:text-[#1F5E3B] transition-colors">
                    {item.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION (Light Sage Background) */}
      <section className="py-16 md:py-24 bg-[#DDEFD9]/30 border-y border-[#D7E6D5]" id="testimonials">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge={t.testimonialBadge}
            title={t.testimonialTitle}
            subtitle={t.testimonialSub}
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={index} 
                {...testimonial} 
                delay={index * 0.1} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (White Background) */}
      <section className="py-16 md:py-24 bg-white" id="faq">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge={t.faqBadge}
            title={t.faqTitle}
            subtitle={t.faqSub}
            align="center"
          />
          <div className="max-w-3xl mx-auto bg-white rounded-[20px] shadow-soft border border-[#D7E6D5] p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION SECTION (Dark Forest Green Background) */}
      <section className="py-16 md:py-24 bg-[#17331F] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-extrabold text-[#17331F] bg-[#DDEFD9] rounded-full shadow-sm">
            🌱 Join The Smart Agricultural Revolution
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight font-poppins">
            {t.ctaTitle}
          </h2>
          <p className="text-sm md:text-lg text-[#DDEFD9]/90 mb-8 leading-relaxed font-medium">
            {t.ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button 
                variant="gold" 
                size="lg" 
                icon={ArrowRight}
              >
                {t.ctaBtn}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;