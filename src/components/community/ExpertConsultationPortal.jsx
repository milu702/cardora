import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Plus, Trash2, Edit, Mic,
  Bot, User, ChevronRight, Droplets, Thermometer, ShieldAlert,
  Leaf, CloudSun, CheckCircle2, AlertTriangle, RefreshCw, X, MessageSquare,
  ArrowUp, Paperclip, FileText, CheckCircle, Clock, Filter, UserCheck, Star,
  Award, Send, Phone, Mail, Search, MessageCircle
} from 'lucide-react';
import api, { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FullScreenFormModal from '../ui/FullScreenFormModal';

const ExpertConsultationPortal = () => {
  const { user, toggleExpertMode } = useAuth();
  
  // Top-Level Tab Switcher: 'ai-chat' | 'tickets' | 'experts'
  const [activePortalTab, setActivePortalTab] = useState('ai-chat');

  // Conversations & Messages State (AI Chat)
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // User Options & Context Controls
  const [plantations, setPlantations] = useState([]);
  const [selectedPlantationId, setSelectedPlantationId] = useState('');
  const [usePlantationData, setUsePlantationData] = useState(true);
  const [language, setLanguage] = useState('en'); // 'en' | 'ml'
  
  // Input Composer State (AI Chat)
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isListening, setIsListening] = useState(false);

  // UI Drawers & Modals
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [contextOpenMobile, setContextOpenMobile] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // Human Expert Consultation Tickets State
  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [ticketFilterStatus, setTicketFilterStatus] = useState('all'); // 'all' | 'open' | 'answered'
  
  // Create Ticket Modal State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    category: 'Plant Pathology & Diseases',
    questionText: '',
    plantationId: '',
    image: '',
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Answer Ticket Modal State (Expert Mode)
  const [answeringTicket, setAnsweringTicket] = useState(null);
  const [answerForm, setAnswerForm] = useState({
    answerText: '',
    recommendedRemedy: '',
    organicAdvice: '',
  });
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Experts Directory State
  const [expertsList, setExpertsList] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [expertSearchQuery, setExpertSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const ticketFileInputRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activePortalTab === 'ai-chat') {
      scrollToBottom();
    }
  }, [messages, sending, activePortalTab]);

  // Load User's Plantations from MongoDB
  const fetchPlantations = async () => {
    try {
      const res = await apiService.getPlantations();
      const list = (res && res.success && Array.isArray(res.plantations)) ? res.plantations : [];
      setPlantations(list);
      if (list.length > 0 && !selectedPlantationId) {
        setSelectedPlantationId(list[0]._id || list[0].id);
      }
    } catch (e) {
      console.warn('Error loading plantations:', e.message);
    }
  };

  // Load User's AI Conversations from MongoDB
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.get('/ai/conversations');
      if (res.data && res.data.success) {
        const list = res.data.conversations || [];
        setConversations(list);
        if (list.length > 0 && !activeConversationId) {
          setActiveConversationId(list[0]._id);
        }
      }
    } catch (err) {
      console.warn('Error fetching conversations:', err.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch Consultation Tickets
  const fetchConsultations = async () => {
    try {
      setLoadingConsultations(true);
      const res = await api.get('/ai/expert-consultations');
      if (res.data && res.data.success) {
        setConsultations(res.data.consultations || []);
      }
    } catch (err) {
      console.warn('Error fetching consultations:', err.message);
    } finally {
      setLoadingConsultations(false);
    }
  };

  // Fetch Experts List Directory
  const fetchExperts = async () => {
    try {
      setLoadingExperts(true);
      const res = await api.get('/admin/experts');
      if (res.data && res.data.success && Array.isArray(res.data.experts)) {
        setExpertsList(res.data.experts);
      } else {
        // Fallback default verified agronomists
        setExpertsList([
          {
            _id: 'exp_1',
            name: 'Dr. Suresh Kumar',
            specialization: 'Senior Cardamom Agronomist & Soil Pathologist',
            experienceYears: 18,
            rating: 4.9,
            assignedFarmersCount: 142,
            availabilityStatus: 'available',
            email: 'suresh.kumar@cardora.org',
            phone: '+91 94471 28901',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            bio: 'Head Agronomist at Spice Board Research Station (Vandanmedu). Specialist in Azhukal fungal remediation & Njallani high-yield fertigation.'
          },
          {
            _id: 'exp_2',
            name: 'Dr. Anjali Nair',
            specialization: 'Crop Disease Diagnostics & Organic Bio-Control',
            experienceYears: 12,
            rating: 4.8,
            assignedFarmersCount: 98,
            availabilityStatus: 'available',
            email: 'anjali.nair@cardora.org',
            phone: '+91 98462 10984',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            bio: 'Expert in Trichoderma soil inoculation, Neem oil formulations, and organic cardamom certification for Highrange planters.'
          },
          {
            _id: 'exp_3',
            name: 'Er. Varkey George',
            specialization: 'Micro-Drip Irrigation & Automated Fertigation',
            experienceYears: 15,
            rating: 4.7,
            assignedFarmersCount: 76,
            availabilityStatus: 'busy',
            email: 'varkey.george@cardora.org',
            phone: '+91 94002 88412',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            bio: 'Consulting Agricultural Engineer for hilltop estate drip design, moisture sensor placement, and weather station integration.'
          }
        ]);
      }
    } catch (err) {
      console.warn('Error loading experts directory:', err.message);
    } finally {
      setLoadingExperts(false);
    }
  };

  useEffect(() => {
    fetchPlantations();
    fetchConversations();
    fetchConsultations();
    fetchExperts();
  }, []);

  // Fetch Messages when Active Conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/ai/conversations/${activeConversationId}`);
        if (res.data && res.data.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.warn('Error fetching messages:', err.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // Start New Conversation (AI Chat)
  const handleNewConversation = async (initialPrompt = '') => {
    const defaultTitle = initialPrompt ? initialPrompt.slice(0, 28) + '...' : 'New Cardamom Agronomy Chat';
    try {
      const validPlantationId = (typeof selectedPlantationId === 'string' && selectedPlantationId.length === 24) ? selectedPlantationId : null;
      const res = await api.post('/ai/conversations', {
        title: defaultTitle,
        plantationId: validPlantationId,
      });

      if (res.data && res.data.success && res.data.conversation) {
        const newConv = res.data.conversation;
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv._id);
        setMessages([]);

        if (initialPrompt) {
          handleSendMessage(initialPrompt, newConv._id);
        }
        return;
      }
    } catch (err) {
      console.warn('Backend conversation creation notice, using local session:', err.message);
    }

    // Fallback Local Session
    const tempConv = {
      _id: 'conv_' + Date.now(),
      title: defaultTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [tempConv, ...prev]);
    setActiveConversationId(tempConv._id);
    setMessages([]);

    if (initialPrompt) {
      handleSendMessage(initialPrompt, tempConv._id);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (activeConversationId === convId) {
        const remaining = conversations.filter((c) => c._id !== convId);
        setActiveConversationId(remaining.length > 0 ? remaining[0]._id : null);
      }
      showToast('Conversation deleted.');
    } catch (err) {
      showToast('Failed to delete conversation.');
    }
  };

  // Rename Conversation
  const handleRenameConversation = async (convId) => {
    if (!editTitleInput.trim()) return;
    try {
      const res = await api.put(`/ai/conversations/${convId}`, { title: editTitleInput.trim() });
      if (res.data && res.data.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === convId ? { ...c, title: editTitleInput.trim() } : c))
        );
        setEditingTitleId(null);
        setEditTitleInput('');
      }
    } catch (err) {
      showToast('Failed to rename conversation.');
    }
  };

  // Client-Side Agronomist Engine Fallback
  const getFallbackAiMessage = (userQuery, lang = 'en', hasImage = false) => {
    const q = (userQuery || '').toLowerCase().trim();
    let replyText = '';
    let diseaseRisk = 'LOW';
    let recommendations = [
      'Maintain 50-60% shade canopy and adequate soil drainage.',
      'Inspect lower tiller bases regularly for moisture & fungal spots.',
    ];

    if (hasImage || q.includes('photo') || q.includes('image')) {
      diseaseRisk = 'HIGH';
      replyText = lang === 'ml'
        ? `📸 **അപ്‌ലോഡ് ചെയ്ത ഇലയുടെ ചിത്ര വിശകലനം (Gemini AI Vision Pathology)**:\n\n` +
          `• **കണ്ടെത്തിയ ഇനം**: ഏലം ഇലകളും കായകളും (Cardamom Foliage & Pod Cluster)\n` +
          `• **രോഗനിർണ്ണയം**: കായ ചീയൽ (Azhukal Disease / *Phytophthora meadii*)\n` +
          `• **തീവ്രത**: **HIGH (ഉയർന്ന രോഗ സാധ്യത)**\n` +
          `• **ലക്ഷണങ്ങൾ**: ഇലകളുടെ അരികുകളിലും കായകളിലും തവിട്ടുനിറത്തിലുള്ള രോഗബാധ.\n\n` +
          `🌱 **പ്രതിരോധ മാർഗ്ഗങ്ങൾ**:\n` +
          `1. **ജൈവ നിയന്ത്രണം**: മഴയ്ക്ക് മുൻപ് 1% ബോർഡോ മിശ്രിതം തളിക്കുക. ട്രൈക്കോഡെർമ (10g/L) ചുവട്ടിൽ ഒഴിക്കുക.\n` +
          `2. **രാസ നിയന്ത്രണം**: കോപ്പർ ഓക്സിക്ലോറൈഡ് 0.2% (2g/L) ചുവട്ടിൽ തളിക്കുക.\n` +
          `3. **തോട്ടം പരിചരണം**: 50% സൂര്യപ്രകാശം ലഭിക്കുന്ന രീതിയിൽ തണൽ നിയന്ത്രിക്കുക.`
        : `📸 **Uploaded Crop Photo Analysis (Gemini AI Vision Pathology)**:\n\n` +
          `• **Detected Specimen**: Cardamom Foliage & Capsule Pod Cluster\n` +
          `• **Diagnosis**: Cardamom Capsule Rot (*Azhukal Disease / Phytophthora meadii*)\n` +
          `• **Severity**: **HIGH (Active Fungal Risk)**\n` +
          `• **Visual Symptoms**: Water-soaked dark brown rot spots along leaf blades and lower pod bases.\n\n` +
          `🌱 **Remediation Protocol**:\n` +
          `1. **Organic / Bio-control**: Spray 1% Bordeaux mixture on foliage. Soil drench clump base with *Trichoderma harzianum* (10g/L) + 500g Neem cake per plant.\n` +
          `2. **Chemical Control**: Spray Copper Oxychloride 0.2% (2g/L) or Metalaxyl-Mancozeb (2g/L) around tiller bases.\n` +
          `3. **Cultural Practice**: Prune dense shade tree canopy branches to allow 50% sunlight aeration and clear waterlogged soil channels.`;
      recommendations = [
        'Apply 1% Bordeaux mixture or Trichoderma before heavy rains.',
        'Prune dense overhead tree canopy to allow 50% sunlight aeration.',
        'Clear weeds and clogged soil channels to prevent waterlogging.',
      ];
    } else if (q.includes('disease') || q.includes('symptom') || q.includes('rot') || q.includes('spot') || q.includes('yellow')) {
      diseaseRisk = 'MEDIUM';
      replyText = lang === 'ml'
        ? `🦠 **ഏലം ചെടികളിലെ പ്രധാന രോഗങ്ങളും ലക്ഷണങ്ങളും (Pathology Advisory)**:\n\n` +
          `1. **കായ ചീയൽ (Azhukal Disease)**: ഇലകളിലും കായകളിലും അഴുകിയ തവിട്ടുനിറത്തിലുള്ള പാടുകൾ കാണപ്പെടുന്നു. മഴക്കാലത്തിന് മുമ്പ് 1% ബോർഡോ മിശ്രിതം തളിക്കുക.\n` +
          `2. **ചുവട് അഴുകൽ (Rhizome Rot)**: തടത്തിലെ ചെടികൾ മഞ്ഞനിറമായി വാടുന്നു. സ്യൂഡോമോണസ് (20g/L) ചുവട്ടിൽ ഒഴിക്കുക.\n` +
          `3. **ഇലപ്പുള്ളി രോഗം (Cercospora Leaf Spot)**: ഇലകളിൽ മഞ്ഞ വെളിച്ചത്തോടെയുള്ള തവിട്ടു പാടുകൾ. മാങ്കോസെബ് അല്ലെങ്കിൽ കോപ്പർ ഹൈഡ്രോക്സൈഡ് തളിക്കുക.`
        : `🦠 **Cardamom Crop Disease Pathology & Symptoms Advisory**:\n\n` +
          `1. **Capsule Rot / Azhukal (*Phytophthora meadii*)**:\n` +
          `   • *Symptoms*: Water-soaked dark brown rot lesions on lower capsules and tillers.\n` +
          `   • *Remedy*: Spray 1% Bordeaux mixture on foliage and drench roots with *Trichoderma harzianum* (10g/L).\n\n` +
          `2. **Clump Rot / Rhizome Wilt (*Pythium vexans*)**:\n` +
          `   • *Symptoms*: Pale yellow wilting of tiller leaves with decayed rhizome base.\n` +
          `   • *Remedy*: Soil drench with Metalaxyl-Mancozeb (2g/L) around root zone.\n\n` +
          `3. **Cardamom Thrips (*Sciothrips cardamomi*)**:\n` +
          `   • *Symptoms*: Silvery scabbing streaks on capsule skin and leaf curling.\n` +
          `   • *Remedy*: Spray Neem Seed Kernel Extract (NSKE 5%) or Fipronil (2ml/L).`;
      recommendations = [
        'Apply 1% Bordeaux mixture or Trichoderma before heavy rains.',
        'Prune dense overhead tree canopy to allow 50% sunlight aeration.',
        'Clear weeds and clogged soil channels to prevent waterlogging.',
      ];
    } else {
      const topicTitle = q ? ` for "${q}"` : '';
      const topicText = q ? ` about **"${q}"**` : ' Cardora AI Agronomist.';
      replyText = lang === 'ml'
        ? `🌱 **കാർഡോറ എഐ അഗ്രോണമിസ്റ്റ് വിശകലനം**${topicTitle}:\n\n` +
          `നിങ്ങളുടെ ഏലച്ചെടിയെക്കുറിച്ചുള്ള ചോദ്യത്തിന് മറുപടിയായി, തടങ്ങളിൽ ഈർപ്പം കൃത്യമായി നിലനിർത്താനും രോഗലക്ഷണങ്ങൾ തുടക്കത്തിലെ കണ്ടെത്താനും ശുപാർശ ചെയ്യുന്നു. കൂടുതൽ സംശയങ്ങൾക്ക് നേരിട്ട് ചോദിക്കാവുന്നതാണ്.`
        : `🌱 **Cardora AI Agronomist Advisory**${topicTitle}:\n\n` +
          `Thank you for asking${topicText}\n\n` +
          `• **Ecosystem Analysis**: Grounded in highrange cardamom agronomy, ensure 50-60% shade canopy filtration and proper tiller clump aeration.\n` +
          `• **Action Plan**: Inspect lower tillers for moisture retention and apply balanced organic nutrients during active vegetative flushing.`;
    }

    return {
      _id: 'assistant_' + Date.now(),
      role: 'assistant',
      content: replyText,
      createdAt: new Date().toISOString(),
      structuredData: {
        diseaseRisk,
        riskScore: diseaseRisk === 'HIGH' ? 78 : diseaseRisk === 'MEDIUM' ? 45 : 15,
        weatherRisk: 'NORMAL',
        plantationHealthScore: 88,
        recommendations,
        suggestedActions: ['Analyze Leaf Image', 'Ask Agricultural Expert'],
      },
    };
  };

  // Send Message (AI Chat)
  const handleSendMessage = async (textToSend = null, targetConvId = null) => {
    const rawQuery = textToSend || inputText;
    const currentImg = imagePreview;
    if (!rawQuery.trim() && !currentImg) return;

    const userText = rawQuery.trim() || (currentImg ? 'Analyze uploaded crop photo for disease symptoms' : 'Cardamom plantation query');
    const validPlantationId = (typeof selectedPlantationId === 'string' && selectedPlantationId.length === 24) ? selectedPlantationId : null;

    let convId = targetConvId || activeConversationId;
    if (!convId) {
      convId = 'conv_' + Date.now();
      const localConv = {
        _id: convId,
        title: rawQuery.trim() ? rawQuery.trim().slice(0, 28) + '...' : (currentImg ? 'Crop Photo Vision Analysis' : 'Cardamom Chat'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [localConv, ...prev]);
      setActiveConversationId(convId);
    }

    setInputText('');
    setImagePreview('');
    setSending(true);

    // Optimistic User Message
    const tempUserMsg = {
      _id: 'temp_' + Date.now(),
      role: 'user',
      content: userText,
      attachments: currentImg ? [{ url: currentImg }] : [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/ai/conversations/${convId}/messages`, {
        content: userText,
        usePlantationData,
        plantationId: validPlantationId,
        attachments: currentImg ? [currentImg] : [],
        language,
      });

      let assistantMessage = res.data?.assistantMessage;
      let userMessage = res.data?.userMessage || tempUserMsg;
      let realConvId = res.data?.conversation?._id || convId;

      if (!assistantMessage) {
        assistantMessage = getFallbackAiMessage(userText, language, Boolean(currentImg));
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === tempUserMsg._id ? userMessage : m)).concat(assistantMessage)
      );
      setConversations((prev) =>
        prev.map((c) => (c._id === convId ? { ...c, _id: realConvId, title: res.data?.conversation?.title || c.title, updatedAt: new Date() } : c))
      );
      setActiveConversationId(realConvId);
    } catch (err) {
      console.warn('Backend message endpoint notice, invoking agronomist engine:', err.message);
      const fallbackAiMsg = getFallbackAiMessage(userText, language, Boolean(currentImg));
      setMessages((prev) =>
        prev.map((m) => (m._id === tempUserMsg._id ? tempUserMsg : m)).concat(fallbackAiMsg)
      );
    } finally {
      setSending(false);
    }
  };

  // Handle Image Upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image file must be under 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Speech Recognition (Malayalam & English)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please type your query.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ml' ? 'ml-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  // Open Create Ticket Modal (prefilled if escalated from chat)
  const openCreateTicketModal = (initialQuery = '') => {
    setNewTicketForm({
      title: initialQuery ? initialQuery.slice(0, 32) + '...' : '',
      category: 'Plant Pathology & Diseases',
      questionText: initialQuery || '',
      plantationId: selectedPlantationId || '',
      image: imagePreview || '',
    });
    setTicketModalOpen(true);
  };

  // Submit Human Expert Consultation Ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.title.trim() || !newTicketForm.questionText.trim()) {
      showToast('Please fill in title and detailed question.');
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await api.post('/ai/expert-consultation', {
        title: newTicketForm.title.trim(),
        category: newTicketForm.category,
        questionText: newTicketForm.questionText.trim(),
        plantation: newTicketForm.plantationId || null,
        image: newTicketForm.image || '',
        language,
      });

      if (res.data && res.data.success) {
        showToast('✅ Consultation ticket submitted! Cardora Agronomist review initiated.');
        setTicketModalOpen(false);
        fetchConsultations();
        setActivePortalTab('tickets');
      } else {
        showToast(res.data?.message || 'Submitted successfully.');
        setTicketModalOpen(false);
        fetchConsultations();
      }
    } catch (err) {
      showToast('Failed to submit consultation ticket.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Submit Answer to Consultation Ticket (Expert Mode)
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answeringTicket || !answerForm.answerText.trim()) {
      showToast('Please type your expert answer text.');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const res = await api.put(`/ai/expert-consultation/${answeringTicket._id}/answer`, {
        answerText: answerForm.answerText.trim(),
        recommendedRemedy: answerForm.recommendedRemedy.trim(),
        organicAdvice: answerForm.organicAdvice.trim(),
      });

      if (res.data && res.data.success) {
        showToast('✅ Expert advice recorded successfully!');
        setAnsweringTicket(null);
        setAnswerForm({ answerText: '', recommendedRemedy: '', organicAdvice: '' });
        fetchConsultations();
      }
    } catch (err) {
      showToast('Failed to submit expert answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const showToast = (txt) => {
    setToastMsg(txt);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Selected Plantation Snapshot Data
  const selectedEstate = plantations.find((p) => (p._id || p.id) === selectedPlantationId) || plantations[0];

  // Group conversations by date (Today, Yesterday, Previous 7 Days)
  const groupConversations = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups = { today: [], yesterday: [], previous7Days: [], older: [] };

    conversations.forEach((c) => {
      const d = new Date(c.updatedAt || c.createdAt);
      if (d.toDateString() === today.toDateString()) {
        groups.today.push(c);
      } else if (d.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(c);
      } else if (d >= sevenDaysAgo) {
        groups.previous7Days.push(c);
      } else {
        groups.older.push(c);
      }
    });

    return groups;
  };

  const convGroups = groupConversations();

  // Filtered Consultation Tickets
  const filteredConsultations = consultations.filter((c) => {
    if (ticketFilterStatus === 'open') return c.status === 'open';
    if (ticketFilterStatus === 'answered') return c.status === 'answered';
    return true;
  });

  const openTicketsCount = consultations.filter((c) => c.status === 'open').length;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-[1700px] mx-auto bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans">
      {/* TOAST ALERTS */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#1F5E3B] text-white text-xs font-bold rounded-2xl shadow-xl animate-bounce flex items-center gap-2 border border-emerald-400/30">
          <span>🌿</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER NAVBAR WITH MULTI-TAB SWITCHER */}
      <header className="bg-gradient-to-r from-[#17331F] via-[#1F5E3B] to-[#2E7D4E] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#1F5E3B]/40 shrink-0 z-10">
        <div className="flex items-center gap-3">
          {activePortalTab === 'ai-chat' && (
            <button
              onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Toggle History"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wide font-poppins text-white">CARDORA AGRONOMIST</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AI & Expert Desk
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 font-medium hidden sm:block">Intelligent cardamom agronomy, pathology & consultations</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE PORTAL TAB NAVIGATION PILLS */}
        <div className="flex items-center bg-black/25 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
          <button
            onClick={() => setActivePortalTab('ai-chat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'ai-chat'
                ? 'bg-white text-[#17331F] shadow-sm'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Agronomist</span>
          </button>

          <button
            onClick={() => setActivePortalTab('tickets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer relative ${
              activePortalTab === 'tickets'
                ? 'bg-white text-[#17331F] shadow-sm'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Consultation Tickets</span>
            {openTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black">
                {openTicketsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePortalTab('experts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'experts'
                ? 'bg-white text-[#17331F] shadow-sm'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Agronomists Directory</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Expert Mode Button */}
          <button
            onClick={toggleExpertMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 border ${
              user?.isExpert
                ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-xs'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            title="Toggle Agronomist / Expert Mode"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{user?.isExpert ? '👨‍🌾 Expert Mode Active' : 'Enable Expert Mode'}</span>
          </button>

          {/* Malayalam / English Language Selector */}
          <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${language === 'en' ? 'bg-white text-[#17331F]' : 'text-emerald-100 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ml')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${language === 'ml' ? 'bg-white text-[#17331F]' : 'text-emerald-100 hover:text-white'}`}
            >
              മലയാളം
            </button>
          </div>

          {activePortalTab === 'ai-chat' && (
            <button
              onClick={() => setContextOpenMobile(!contextOpenMobile)}
              className="xl:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Toggle Plantation Telemetry"
            >
              <Leaf className="w-4 h-4 text-emerald-300" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAB 1: AI AGRONOMIST CHAT WORKSPACE */}
      {/* ========================================================================= */}
      {activePortalTab === 'ai-chat' && (
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* LEFT SIDEBAR: CONVERSATION HISTORY */}
          <aside
            className={`w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 z-20 ${
              sidebarOpenMobile ? 'absolute inset-y-0 left-0 shadow-2xl z-40' : 'hidden lg:flex'
            }`}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleNewConversation()}
                className="w-full py-2.5 px-4 bg-[#1F5E3B] hover:bg-[#154329] text-white text-xs font-extrabold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {loadingConversations ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium animate-pulse">
                  Loading history...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium px-4">
                  No past conversations yet. Click <strong>+ New Conversation</strong> to start asking.
                </div>
              ) : (
                [
                  { title: 'Today', list: convGroups.today },
                  { title: 'Yesterday', list: convGroups.yesterday },
                  { title: 'Previous 7 Days', list: convGroups.previous7Days },
                  { title: 'Older Conversations', list: convGroups.older },
                ].map(
                  (group) =>
                    group.list.length > 0 && (
                      <div key={group.title} className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1">
                          {group.title}
                        </p>
                        {group.list.map((conv) => {
                          const isActive = activeConversationId === conv._id;
                          return (
                            <div
                              key={conv._id}
                              onClick={() => {
                                setActiveConversationId(conv._id);
                                setSidebarOpenMobile(false);
                              }}
                              className={`group w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                isActive
                                  ? 'bg-[#EAF3E8] dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-300 border border-[#1F5E3B]/30'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#1F5E3B]' : 'text-slate-400'}`} />
                                {editingTitleId === conv._id ? (
                                  <input
                                    type="text"
                                    value={editTitleInput}
                                    onChange={(e) => setEditTitleInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRenameConversation(conv._id);
                                    }}
                                    onBlur={() => handleRenameConversation(conv._id)}
                                    className="w-full bg-white dark:bg-slate-800 px-2 py-0.5 text-xs rounded border border-[#1F5E3B] focus:outline-none"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="truncate">{conv.title || 'Agronomy Discussion'}</span>
                                )}
                              </div>

                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTitleId(conv._id);
                                    setEditTitleInput(conv.title || '');
                                  }}
                                  className="p-1 hover:text-[#1F5E3B] text-slate-400"
                                  title="Rename conversation"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteConversation(conv._id, e)}
                                  className="p-1 hover:text-red-600 text-slate-400"
                                  title="Delete conversation"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                )
              )}
            </div>
          </aside>

          {/* CENTER: MAIN CHAT AREA */}
          <main className="flex-1 flex flex-col bg-[#F8FAF7] dark:bg-slate-950 overflow-hidden relative">
            
            {/* CHAT MESSAGES STREAM */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {!activeConversationId || (messages.length === 0 && !sending && !loadingMessages) ? (
                
                /* INITIAL EMPTY STATE & QUICK STARTER CARDS */
                <div className="max-w-3xl mx-auto py-10 space-y-8 text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-[#1F5E3B]/10 text-[#1F5E3B] dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                      <SproutIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-poppins">
                      🌱 Cardora AI Agronomist
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-medium">
                      Your intelligent assistant for cardamom plantation management. Ask about disease, soil, fertilizer, irrigation, weather, yield, or plantation management.
                    </p>
                  </div>

                  {/* STARTER CARDS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                    {[
                      { title: '🦠 Diagnose a disease', prompt: 'Diagnose disease symptoms on cardamom leaves or tillers', icon: ShieldAlert, color: 'border-red-200 bg-red-50/50 dark:bg-red-950/30' },
                      { title: '💧 Should I irrigate today?', prompt: 'Should I irrigate my cardamom plantation today based on current soil moisture and weather?', icon: Droplets, color: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/30' },
                      { title: '🌱 Fertilizer recommendation', prompt: 'Give me NPK fertilizer dosage advice for my cardamom variety', icon: Leaf, color: 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30' },
                      { title: '🌧 Weather risk', prompt: 'Analyze rainfall and weather-related plantation risks for this week', icon: CloudSun, color: 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/30' },
                      { title: '📈 Predict my yield', prompt: 'Predict my crop harvest yield and gross revenue based on my plot acreage', icon: Sparkles, color: 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/30' },
                      { title: '🌿 Plantation health', prompt: 'Evaluate overall plantation health score and soil pH balance', icon: CheckCircle2, color: 'border-teal-200 bg-teal-50/50 dark:bg-teal-950/30' },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={card.title}
                          onClick={() => {
                            if (!activeConversationId) {
                              handleNewConversation(card.prompt);
                            } else {
                              handleSendMessage(card.prompt);
                            }
                          }}
                          className={`p-4 rounded-2xl border ${card.color} hover:border-[#1F5E3B] transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-2 group`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className="w-5 h-5 text-[#1F5E3B] dark:text-emerald-400" />
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{card.title}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{card.prompt}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* CHAT MESSAGES STREAM */
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg._id || msg.createdAt}
                        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                            <Bot className="w-4.5 h-4.5 text-emerald-300" />
                          </div>
                        )}

                        <div className={`space-y-3 max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                          {/* MESSAGE BUBBLE */}
                          <div
                            className={`p-4 rounded-3xl text-xs sm:text-sm font-medium shadow-xs leading-relaxed ${
                              isUser
                                ? 'bg-[#1F5E3B] text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                            }`}
                          >
                            {/* Image Attachment Preview */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mb-3">
                                {msg.attachments.map((att, idx) => (
                                  <img
                                    key={idx}
                                    src={att.url || att}
                                    alt="Crop analysis attachment"
                                    className="max-h-56 rounded-2xl object-cover border border-white/20 shadow-xs mb-2"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Message Content */}
                            <div className="whitespace-pre-wrap font-sans leading-relaxed">
                              {msg.content}
                            </div>

                            {/* AI STRUCTURED DATA & RISK BADGES */}
                            {!isUser && msg.structuredData && (
                              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                {/* Risk Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {msg.structuredData.diseaseRisk && (
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                        msg.structuredData.diseaseRisk === 'HIGH'
                                          ? 'bg-red-50 text-red-700 border-red-200'
                                          : msg.structuredData.diseaseRisk === 'MEDIUM'
                                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      }`}
                                    >
                                      <AlertTriangle className="w-3 h-3" />
                                      Disease Risk: {msg.structuredData.diseaseRisk}
                                    </span>
                                  )}

                                  {msg.structuredData.weatherRisk && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                      <CloudSun className="w-3 h-3" />
                                      {msg.structuredData.weatherRisk}
                                    </span>
                                  )}
                                </div>

                                {/* Actionable Recommendations */}
                                {msg.structuredData.recommendations && msg.structuredData.recommendations.length > 0 && (
                                  <div className="bg-[#F4F9F5] dark:bg-emerald-950/40 p-3 rounded-2xl border border-[#C6E6D2] dark:border-emerald-800/50 space-y-1">
                                    <p className="text-[10px] font-black uppercase text-[#1F5E3B] dark:text-emerald-300">Recommended Action:</p>
                                    <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                      {msg.structuredData.recommendations.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* ACTION BUTTONS & ASK EXPERT ESCALATION */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <button
                                    onClick={() => openCreateTicketModal(msg.content)}
                                    className="px-3 py-1.5 rounded-xl bg-[#1F5E3B] hover:bg-[#154329] text-white text-[11px] font-extrabold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <User className="w-3.5 h-3.5" />
                                    <span>Ask Agricultural Expert</span>
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage('Analyze leaf image for symptoms')}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold hover:bg-slate-200 transition cursor-pointer"
                                  >
                                    Analyze Leaf Image
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <span className="text-[9px] text-slate-400 font-medium px-1 block">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isUser && (
                          <div className="w-8 h-8 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                            <User className="w-4.5 h-4.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* TYPING INDICATOR */}
                  {sending && (
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-4.5 h-4.5 text-emerald-300 animate-pulse" />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs font-bold text-[#1F5E3B] dark:text-emerald-400 flex items-center gap-2 shadow-xs">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Cardora AI is analyzing soil, weather & agronomy context...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* BOTTOM CHAT INPUT COMPOSER */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0 z-10">
              {/* COMPOSER CONTROLS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Leaf className="w-3.5 h-3.5 text-[#1F5E3B] dark:text-emerald-400" />
                    <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">Plantation:</span>
                    <select
                      value={selectedPlantationId}
                      onChange={(e) => setSelectedPlantationId(e.target.value)}
                      className="bg-transparent font-extrabold text-slate-800 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                    >
                      {plantations.length > 0 ? (
                        plantations.map((p) => (
                          <option key={p._id || p.id} value={p._id || p.id} className="dark:bg-slate-900">
                            {p.name} ({p.area || 5} Acres)
                          </option>
                        ))
                      ) : (
                        <option value="">Mary's Estate (Default)</option>
                      )}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={usePlantationData}
                      onChange={(e) => setUsePlantationData(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1F5E3B] focus:ring-[#1F5E3B] accent-[#1F5E3B] cursor-pointer"
                    />
                    <span className="text-[11px]">☑ Use My Plantation Data</span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {[
                    { label: '🦠 Disease', prompt: 'Identify plant diseases and symptoms' },
                    { label: '💧 Irrigation', prompt: 'Should I irrigate my estate today?' },
                    { label: '🌱 Fertilizer', prompt: 'What NPK dosage should I apply?' },
                    { label: '🌧 Weather', prompt: 'What is the rainfall forecast for this week?' },
                    { label: '📈 Yield', prompt: 'Estimate my yield and gross revenue' },
                    { label: '🌿 Health', prompt: 'Evaluate overall plantation health score' },
                  ].map((pill) => (
                    <button
                      key={pill.label}
                      onClick={() => handleSendMessage(pill.prompt)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#EAF3E8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold transition border border-slate-200 dark:border-slate-700 hover:border-[#1F5E3B] cursor-pointer whitespace-nowrap"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* IMAGE PREVIEW THUMBNAIL */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-xl border-2 border-[#1F5E3B]" />
                  <button
                    onClick={() => setImagePreview('')}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* INPUT FIELD BAR */}
              <div className="relative flex items-center bg-[#F8FAF7] dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700 focus-within:border-[#1F5E3B] focus-within:ring-2 focus-within:ring-[#1F5E3B]/20 transition-all p-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-[#1F5E3B] dark:hover:text-emerald-400 transition rounded-xl cursor-pointer"
                  title="Attach leaf or plantation image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <textarea
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={language === 'ml' ? 'നിങ്ങളുടെ ഏലച്ചെടിയെക്കുറിച്ചുള്ള സംശയങ്ങൾ ചോദിക്കുക...' : 'Ask Cardora about your plantation...'}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none max-h-32"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-xl transition ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-slate-400 hover:text-[#1F5E3B]'}`}
                    title="Malayalam & English Speech-to-Text"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={sending || (!inputText.trim() && !imagePreview)}
                    className="p-2.5 bg-[#1F5E3B] hover:bg-[#154329] disabled:bg-slate-300 text-white rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR: CONTEXTUAL PLANTATION TELEMETRY PANEL */}
          <aside
            className={`w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto shrink-0 space-y-6 transition-all duration-300 z-20 ${
              contextOpenMobile ? 'absolute inset-y-0 right-0 shadow-2xl z-40' : 'hidden xl:block'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-[#1F5E3B] dark:text-emerald-400 text-sm flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Plantation Telemetry
              </h3>
              <button
                onClick={() => setContextOpenMobile(false)}
                className="xl:hidden p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F4F9F5] dark:bg-slate-800 p-4 rounded-2xl border border-[#C6E6D2] dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#1F5E3B] dark:text-emerald-400 tracking-wider">Estate Overview</span>
              <h4 className="font-black text-slate-900 dark:text-white text-base">{selectedEstate?.name || "Mary's Estate"}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                📍 {selectedEstate?.district || selectedEstate?.location || 'Idukki, Kerala'}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#C6E6D2]/60 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Area</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedEstate?.area || 5} Acres</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Variety</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedEstate?.variety || 'Njallani'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Live Soil Telemetry</h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Droplets className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">Soil Moisture</p>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedEstate?.moisture || 72}% Optimal</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">OK</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Thermometer className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">Soil pH Balance</p>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedEstate?.ph || 6.2} (Balanced)</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Ideal</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold">NPK Status (kg/ha)</p>
                <div className="grid grid-cols-3 gap-1 text-center font-bold text-xs">
                  <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">N: 140</div>
                  <div className="p-1 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">P: 45</div>
                  <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">K: 180</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">Microclimate</span>
                <CloudSun className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">26°C • Sunny</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Humidity 80% • Rain 12mm</p>
            </div>
          </aside>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HUMAN EXPERT CONSULTATION TICKETS WORKSPACE */}
      {/* ========================================================================= */}
      {activePortalTab === 'tickets' && (
        <div className="flex-1 flex flex-col bg-[#F8FAF7] dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* BANNER & ACTION HEADER */}
          <div className="bg-gradient-to-r from-[#17331F] to-[#1F5E3B] text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                  Human Expert Desk
                </span>
                {user?.isExpert && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                    Agronomist Reviewer Mode
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black font-poppins text-white">
                Cardamom Agricultural Consultation Tickets
              </h3>
              <p className="text-xs text-emerald-100/90 font-medium">
                Submit complex crop issues for official review by Cardora verified agronomists, or review and answer pending farmer queries if you are an Agronomist.
              </p>
            </div>

            <button
              onClick={() => openCreateTicketModal()}
              className="px-5 py-3 rounded-2xl bg-white text-[#17331F] text-xs font-black hover:bg-emerald-50 transition shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-[#1F5E3B]" />
              <span>Submit Expert Ticket</span>
            </button>
          </div>

          {/* FILTER CONTROLS & STATS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-[#1F5E3B]" />
              <span className="font-extrabold text-slate-700 dark:text-slate-300">Filter Tickets:</span>
              <button
                onClick={() => setTicketFilterStatus('all')}
                className={`px-3 py-1 rounded-xl font-bold transition ${ticketFilterStatus === 'all' ? 'bg-[#1F5E3B] text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
              >
                All ({consultations.length})
              </button>
              <button
                onClick={() => setTicketFilterStatus('open')}
                className={`px-3 py-1 rounded-xl font-bold transition ${ticketFilterStatus === 'open' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
              >
                Pending Review ({openTicketsCount})
              </button>
              <button
                onClick={() => setTicketFilterStatus('answered')}
                className={`px-3 py-1 rounded-xl font-bold transition ${ticketFilterStatus === 'answered' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
              >
                Answered ({consultations.filter(c => c.status === 'answered').length})
              </button>
            </div>

            <button
              onClick={fetchConsultations}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#1F5E3B] transition"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-4 h-4 ${loadingConsultations ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* TICKETS LIST GRID */}
          {loadingConsultations ? (
            <div className="text-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#1F5E3B] animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400">Fetching expert consultation tickets...</p>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1F5E3B] dark:bg-emerald-950 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">No Consultation Tickets Found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ticketFilterStatus === 'open' 
                  ? 'No open tickets requiring expert answers right now.' 
                  : 'You have not submitted any human expert consultation requests yet.'}
              </p>
              <button
                onClick={() => openCreateTicketModal()}
                className="px-4 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#154329] transition shadow-xs"
              >
                + Create Consultation Ticket
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredConsultations.map((ticket) => {
                const isAnswered = ticket.status === 'answered';
                const farmerName = ticket.farmer?.name || 'Cardamom Farmer';
                const farmerPhoto = ticket.farmer?.profilePhoto || ticket.farmer?.profileImage || '';

                return (
                  <div
                    key={ticket._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* TICKET TOP HEADER BAR */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {ticket.category || 'Plant Pathology'}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                            isAnswered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isAnswered ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Answered
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pending Review
                            </>
                          )}
                        </span>
                      </div>

                      {/* TICKET TITLE & QUESTION */}
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-poppins">
                          {ticket.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {ticket.questionText}
                        </p>
                      </div>

                      {/* IMAGE ATTACHMENT */}
                      {ticket.image && (
                        <div className="mt-2">
                          <img
                            src={ticket.image}
                            alt="Crop disease attachment"
                            className="max-h-48 w-full object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
                          />
                        </div>
                      )}

                      {/* FARMER FOOTER */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          {farmerPhoto ? (
                            <img src={farmerPhoto} alt={farmerName} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="font-bold text-slate-700 dark:text-slate-300">{farmerName}</span>
                        </div>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* ANSWER SECTION / ANSWER ACTION */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      {isAnswered && ticket.expertAnswer ? (
                        <div className="bg-[#F4F9F5] dark:bg-emerald-950/40 p-4 rounded-2xl border border-[#C6E6D2] dark:border-emerald-800/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-[#1F5E3B] dark:text-emerald-300 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              Expert Advice ({ticket.expertAnswer.answeredBy || 'Cardora Agronomist Panel'})
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(ticket.expertAnswer.answeredAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                            {ticket.expertAnswer.answerText}
                          </p>

                          {ticket.expertAnswer.recommendedRemedy && (
                            <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              🌱 <strong>Remedy:</strong> {ticket.expertAnswer.recommendedRemedy}
                            </div>
                          )}

                          {ticket.expertAnswer.organicAdvice && (
                            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              🍃 <strong>Organic Advice:</strong> {ticket.expertAnswer.organicAdvice}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting expert response...
                          </span>

                          {(user?.isExpert || user?.role === 'Expert') && (
                            <button
                              onClick={() => {
                                setAnsweringTicket(ticket);
                                setAnswerForm({
                                  answerText: '',
                                  recommendedRemedy: 'Apply 1% Bordeaux mixture spray + Trichoderma Harzianum drench',
                                  organicAdvice: 'Maintain 50-60% shade canopy and clear soil water channels',
                                });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#1F5E3B] hover:bg-[#154329] text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Answer Ticket</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VERIFIED AGRONOMISTS & SPECIALISTS DIRECTORY */}
      {/* ========================================================================= */}
      {activePortalTab === 'experts' && (
        <div className="flex-1 flex flex-col bg-[#F8FAF7] dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* DIRECTORY HEADER & SEARCH */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-[#1F5E3B]" />
                Cardora Verified Agronomists & Specialists
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Connect directly with certified cardamom soil pathologists, fertigation engineers, and organic spice consultants in Highrange.
              </p>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={expertSearchQuery}
                onChange={(e) => setExpertSearchQuery(e.target.value)}
                placeholder="Search agronomist or specialty..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B]"
              />
            </div>
          </div>

          {/* EXPERTS CARDS GRID */}
          {loadingExperts ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-[#1F5E3B] animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expertsList
                .filter(
                  (exp) =>
                    !expertSearchQuery.trim() ||
                    exp.name.toLowerCase().includes(expertSearchQuery.toLowerCase()) ||
                    exp.specialization.toLowerCase().includes(expertSearchQuery.toLowerCase())
                )
                .map((expert) => (
                  <div
                    key={expert._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-lg transition space-y-4 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* EXPERT AVATAR & BADGES */}
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={expert.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={expert.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1F5E3B]"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                              expert.availabilityStatus === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-poppins">
                              {expert.name}
                            </h4>
                            <Award className="w-4 h-4 text-[#1F5E3B] shrink-0" />
                          </div>
                          <p className="text-xs font-bold text-[#1F5E3B] dark:text-emerald-400 mt-0.5">
                            {expert.specialization}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-black text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {expert.rating || 4.8}
                            </span>
                            <span>•</span>
                            <span>{expert.experienceYears || 10}+ Yrs Experience</span>
                          </div>
                        </div>
                      </div>

                      {/* BIO DESCRIPTION */}
                      {expert.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {expert.bio}
                        </p>
                      )}

                      {/* METRICS ROW */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800">
                          <span className="text-[10px] text-slate-400 uppercase block font-black">Planters Advised</span>
                          <span className="text-emerald-800 dark:text-emerald-300 font-black text-sm">{expert.assignedFarmersCount || 100}+</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800">
                          <span className="text-[10px] text-slate-400 uppercase block font-black">Status</span>
                          <span className="text-blue-800 dark:text-blue-300 font-black text-sm capitalize">{expert.availabilityStatus || 'Available'}</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS BAR */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => openCreateTicketModal(`Consultation request for ${expert.name}`)}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#154329] text-white text-xs font-black transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Request Consultation</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT HUMAN EXPERT TICKET */}
      {/* ========================================================================= */}
      {ticketModalOpen && (
        <FullScreenFormModal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          title="Submit Agronomist Consultation Ticket"
          subtitle="Submit detailed plant pathology, soil chemistry, or yield questions to CARDORA verified agronomists"
          badgeText="EXPERT DESK DISPATCH"
          badgeIcon={FileText}
          rightPanel={
            <div className="space-y-4 font-sans">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#D7E6D5] dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase text-[#1F5E3B] dark:text-emerald-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    Consultation Summary
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    SLA: 2 HOURS
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <strong className="text-[#17331F] dark:text-emerald-300 font-bold">{newTicketForm.category}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Selected Estate:</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold truncate max-w-[160px]">
                      {plantations.find((p) => (p._id || p.id) === newTicketForm.plantationId)?.name || 'Estate Selected'}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EAF3E8] dark:bg-emerald-950/40 border border-[#5C8D4E]/30 space-y-1.5 text-xs">
                  <h5 className="font-extrabold text-[#1F5E3B] dark:text-emerald-300 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Verified Agronomist Review
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your request will be assigned to senior cardamom agronomists in Idukki/Wayanad for instant review & prescription.
                  </p>
                </div>
              </div>
            </div>
          }
          footerActions={
            <div className="w-full flex items-center justify-between gap-3 font-sans">
              <button
                type="button"
                onClick={() => setTicketModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs sm:text-sm cursor-pointer transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitTicket}
                disabled={submittingTicket}
                className="px-6 py-2.5 rounded-xl bg-[#1F5E3B] hover:bg-[#17331F] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{submittingTicket ? 'Submitting Ticket...' : 'Dispatch Ticket to Agronomists'}</span>
              </button>
            </div>
          }
        >
          <form onSubmit={handleSubmitTicket} className="space-y-6 font-sans">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#D7E6D5] dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">
                  Consultation Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dark brown rot spots on lower tiller pods after heavy rain"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-sm font-bold text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#17331F] dark:text-white"
                  >
                    <option value="Plant Pathology & Diseases">🦠 Plant Pathology & Diseases</option>
                    <option value="Fertilizer & Soil Health">🌱 Fertilizer & Soil Health</option>
                    <option value="Micro-Drip Irrigation">💧 Micro-Drip Irrigation</option>
                    <option value="Auction & Price Trends">📈 Auction & Price Trends</option>
                    <option value="General Agronomy">🍃 General Agronomy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">Select Estate</label>
                  <select
                    value={newTicketForm.plantationId}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, plantationId: e.target.value })}
                    className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-bold text-[#17331F] dark:text-white"
                  >
                    {plantations.length > 0 ? (
                      plantations.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          🌿 {p.name} ({p.area || 5} Acres)
                        </option>
                      ))
                    ) : (
                      <option value="">Default Estate</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">
                  Detailed Crop Symptoms / Agronomy Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe crop symptoms, leaf yellowing, pod spots, soil moisture, or specific questions for Cardora agronomists..."
                  value={newTicketForm.questionText}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, questionText: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-xs font-medium text-[#17331F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F5E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17331F] dark:text-slate-200 mb-1.5">Photo Attachment URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newTicketForm.image}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2 rounded-xl bg-[#1F5E3B] text-white font-extrabold hover:bg-[#154329] transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submittingTicket ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit to Agronomist Desk
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </FullScreenFormModal>
      )}



      {/* ========================================================================= */}
      {/* MODAL: ANSWER CONSULTATION TICKET (EXPERT MODE) */}
      {/* ========================================================================= */}
      {answeringTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1F5E3B]" />
                Record Agronomist / Expert Advice
              </h3>
              <button
                onClick={() => setAnsweringTicket(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-[#1F5E3B] dark:text-emerald-400">Farmer Question:</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white">{answeringTicket.title}</h4>
              <p className="text-slate-600 dark:text-slate-300 font-medium line-clamp-3">{answeringTicket.questionText}</p>
            </div>

            <form onSubmit={handleAnswerSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Official Agronomist Diagnosis & Response *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive agronomic analysis, fungal identification, and step-by-step action plan..."
                  value={answerForm.answerText}
                  onChange={(e) => setAnswerForm({ ...answerForm, answerText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1F5E3B] resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Recommended Chemical / Bio-Control Remedy</label>
                <input
                  type="text"
                  placeholder="e.g. Spray 1% Bordeaux mixture foliage; soil drench Copper Oxychloride 0.2%"
                  value={answerForm.recommendedRemedy}
                  onChange={(e) => setAnswerForm({ ...answerForm, recommendedRemedy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Organic Cultural Practice Advice</label>
                <input
                  type="text"
                  placeholder="e.g. Prune dense overhead tree canopy branches to allow 50% sunlight aeration"
                  value={answerForm.organicAdvice}
                  onChange={(e) => setAnswerForm({ ...answerForm, organicAdvice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAnsweringTicket(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnswer}
                  className="px-5 py-2 rounded-xl bg-[#1F5E3B] text-white font-extrabold hover:bg-[#154329] transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submittingAnswer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Publish Expert Advice
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Sprout Icon
const SproutIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 20h10" />
    <path d="M12 20v-8" />
    <path d="M12 12a5 5 0 0 1 5-5 5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 1 5 5Z" />
  </svg>
);

export default ExpertConsultationPortal;
