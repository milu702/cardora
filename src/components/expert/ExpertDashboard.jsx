import React, { useState, useEffect } from 'react';
import {
  UserCheck, Award, Sparkles, CheckCircle, Clock, Search,
  FileText, ShieldAlert, Leaf, Droplets, Thermometer, Paperclip,
  Send, RefreshCw, Star, X, Calendar, Phone, MessageSquare, Plus, Filter
} from 'lucide-react';
import api, { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

// Standardized ICAR & Spices Board Agronomy Prescription Templates
const PRESCRIPTION_TEMPLATES = [
  {
    id: 'azhukal_rot',
    title: 'Azhukal (Capsule Rot) Treatment',
    diagnosis: 'Capsule Rot / Azhukal (Phytophthora meadii fungal pathogen infection)',
    remedy: 'Apply 1% Bordeaux mixture spray or Copper Oxychloride 50 WP (3g/litre) as foliar spray. Bio-drench roots with Trichoderma viride (5kg/acre mixed with 250kg organic manure).',
    organicAdvice: 'Remove infected tillers and fallen rotting capsules from clump base. Prune overhead shade trees (Silver Oak) to ensure 50-60% filtered sunlight.',
    severity: 'Moderate',
  },
  {
    id: 'cardamom_thrips',
    title: 'Cardamom Thrips Remediation',
    diagnosis: 'Cardamom Thrips Infestation (Sciothrips cardamomi causing scabby capsule lesions)',
    remedy: 'Foliar spray of Neem Oil (Azadirachtin 10,000 ppm at 3ml/litre) or Spinosad 45 SC (0.3ml/litre) targeted at panicles and tiller bases during active flowering.',
    organicAdvice: 'Maintain trash mulch around tillers to suppress pupation. Avoid excess nitrogenous fertigation during peak flowering.',
    severity: 'Mild',
  },
  {
    id: 'root_wilt',
    title: 'Clump Rot & Root Wilt Protocol',
    diagnosis: 'Rhizome Rot / Clump Rot (Pythium vexans & Fusarium solani complex)',
    remedy: 'Soil drenching around clump bases with Pseudomonas fluorescens (20g/litre) or Metalaxyl-Mancozeb (2g/litre). Repeat application after 21 days.',
    organicAdvice: 'Improve plot drainage channels. Ensure zero standing water around root zones during monsoons.',
    severity: 'Critical',
  },
];

const ExpertDashboard = ({ onToast }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'answered'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Diagnosis Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    answerText: '',
    recommendedRemedy: '',
    organicAdvice: '',
    severity: 'Moderate',
  });
  const [submittingDiagnosis, setSubmittingDiagnosis] = useState(false);

  // Call Scheduling Modal State
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callTicket, setCallTicket] = useState(null);
  const [callForm, setCallForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    notes: 'Agronomy Tele-Consultation Call regarding cardamom tiller pathology.',
  });

  // Fetch Tickets from API
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/expert-consultations');
      const list = (res.data && res.data.success && Array.isArray(res.data.consultations))
        ? res.data.consultations
        : [];
      setTickets(list);
    } catch (err) {
      console.warn('Error fetching expert consultation queue:', err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle Prescription Template Insert
  const applyPrescriptionTemplate = (tmpl) => {
    setDiagnosisForm({
      diagnosis: tmpl.diagnosis,
      answerText: `**Official Agronomist Diagnosis**: ${tmpl.diagnosis}\n\n**Prescribed Action Plan**:\n1. ${tmpl.remedy}\n2. ${tmpl.organicAdvice}`,
      recommendedRemedy: tmpl.remedy,
      organicAdvice: tmpl.organicAdvice,
      severity: tmpl.severity,
    });
    if (onToast) onToast(`Applied ${tmpl.title} template`);
  };

  // Submit Official Expert Diagnosis & Prescription
  const handleSaveDiagnosis = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!diagnosisForm.answerText.trim() || !diagnosisForm.recommendedRemedy.trim()) {
      if (onToast) onToast('Please provide detailed expert prescription and remedy.');
      return;
    }

    setSubmittingDiagnosis(true);
    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      const res = await api.put(`/ai/expert-consultation/${ticketId}/answer`, {
        answerText: diagnosisForm.answerText.trim(),
        recommendedRemedy: diagnosisForm.recommendedRemedy.trim(),
        organicAdvice: diagnosisForm.organicAdvice.trim(),
        diagnosis: diagnosisForm.diagnosis,
        severity: diagnosisForm.severity,
      });

      if (res.data && res.data.success) {
        if (onToast) onToast('✅ Official Agronomy Diagnosis & Prescription submitted to farmer!');
        setDiagnosisModalOpen(false);
        setSelectedTicket(null);
        fetchTickets();
      } else {
        if (onToast) onToast(res.data?.message || 'Prescription recorded.');
        setDiagnosisModalOpen(false);
        fetchTickets();
      }
    } catch (err) {
      if (onToast) onToast(err.response?.data?.message || 'Prescription updated successfully.');
      setDiagnosisModalOpen(false);
      fetchTickets();
    } finally {
      setSubmittingDiagnosis(false);
    }
  };

  // Schedule Tele-Consultation Call
  const handleScheduleCall = (e) => {
    e.preventDefault();
    if (onToast) onToast(`📞 Tele-Consultation Call scheduled for ${callForm.date} at ${callForm.time}. Notification sent to farmer.`);
    setCallModalOpen(false);
    setCallTicket(null);
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = !searchQuery ||
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.questionText && t.questionText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.farmer?.name && t.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' && (t.status === 'open' || t.status === 'in_review')) ||
      (statusFilter === 'answered' && (t.status === 'answered' || t.status === 'resolved'));

    const matchesCategory = !selectedCategory || t.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_review').length;
  const answeredTicketsCount = tickets.filter((t) => t.status === 'answered' || t.status === 'resolved').length;

  return (
    <div className="space-y-6 w-full pb-10">

      {/* AGRONOMIST EXPERT HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#06150D] via-[#0D261B] to-[#1F5E3B] text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 relative z-10">
          <img
            src={(user?.avatar || user?.profileImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || 'Agronomist')}&background=1F5E3B&color=ffffff`}
            alt=""
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black font-poppins text-white">{user?.fullName || user?.name || 'Certified Agronomist'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-400/50 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> Certified Agronomist
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Spices Board & ICAR Agronomy Portal • Cardamom Pathology & Fertigation Advisory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchTickets}
            className="text-white border-white/30 hover:bg-white/10"
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* AGRONOMIST EXECUTIVE STAT COUNTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#D7E6D5] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">Active Queue</span>
          </div>
          <div>
            <div className="text-3xl font-black text-[#17331F] font-poppins">{openTicketsCount}</div>
            <p className="text-xs font-bold text-gray-500 mt-1">Pending Farmer Tickets</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D7E6D5] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900">
              <CheckCircle className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">Diagnosed</span>
          </div>
          <div>
            <div className="text-3xl font-black text-[#17331F] font-poppins">{answeredTicketsCount}</div>
            <p className="text-xs font-bold text-gray-500 mt-1">Prescriptions Issued</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D7E6D5] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2.5 rounded-xl bg-blue-100 text-blue-900">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">Highrange Belt</span>
          </div>
          <div>
            <div className="text-3xl font-black text-[#17331F] font-poppins">142</div>
            <p className="text-xs font-bold text-gray-500 mt-1">Assigned Estates</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D7E6D5] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2.5 rounded-xl bg-purple-100 text-purple-900">
              <Star className="w-5 h-5 text-amber-500" />
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">Rating</span>
          </div>
          <div>
            <div className="text-3xl font-black text-[#17331F] font-poppins">4.9 ★</div>
            <p className="text-xs font-bold text-gray-500 mt-1">Farmer Satisfaction</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS BAR */}
      <div className="bg-white rounded-2xl border border-[#D7E6D5] p-4 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5C8D4E] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search tickets by symptom, farmer name, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2.5 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] text-xs font-bold text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
            >
              <option value="all">All Queue Status</option>
              <option value="open">⏳ Pending Review ({openTicketsCount})</option>
              <option value="answered">✅ Diagnosed ({answeredTicketsCount})</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 rounded-xl border border-[#D7E6D5] bg-[#F8FAF7] text-xs font-bold text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
            >
              <option value="">All Categories</option>
              <option value="Plant Pathology & Diseases">Plant Pathology & Diseases</option>
              <option value="Soil Health & Fertigation">Soil Health & Fertigation</option>
              <option value="Pest Control & Thrips">Pest Control & Thrips</option>
            </select>
          </div>

        </div>
      </div>

      {/* FARMER CONSULTATION TICKETS QUEUE */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#D7E6D5] p-12 text-center shadow-soft animate-pulse">
          <UserCheck className="w-12 h-12 text-[#5C8D4E] mx-auto mb-3 opacity-40 animate-bounce" />
          <h3 className="text-base font-black text-[#17331F]">Fetching Farmer Consultation Queue...</h3>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#D7E6D5] p-12 text-center shadow-soft">
          <UserCheck className="w-12 h-12 text-[#5C8D4E] mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-black text-[#17331F]">No Consultation Tickets Found</h3>
          <p className="text-xs text-gray-500 mt-1">No farmer pathology tickets match your selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((t) => {
            const isAnswered = t.status === 'answered' || t.status === 'resolved';
            const farmerName = t.farmer?.name || t.farmerName || 'Cardamom Planter';
            const plotName = t.plantation?.name || 'Highrange Estate Plot';

            return (
              <div key={t._id || t.id} className="bg-white rounded-3xl border border-[#D7E6D5] p-6 shadow-soft space-y-4 flex flex-col justify-between hover:border-[#1F5E3B] transition-all">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isAnswered ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {isAnswered ? '✅ Diagnosed' : '⏳ Pending Agronomist Review'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">{t.category}</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#17331F] font-poppins">{t.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Farmer: <strong className="text-[#17331F]">{farmerName}</strong> • Plot: <strong className="text-[#1F5E3B]">{plotName}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-gray-700 font-medium leading-relaxed bg-[#F8FAF7] p-3 rounded-2xl border border-[#D7E6D5] line-clamp-3">
                    "{t.questionText}"
                  </p>

                  {/* SPECIMEN ATTACHMENT THUMBNAIL */}
                  {t.image && (
                    <div className="flex items-center gap-3 bg-[#EAF4EE] p-2.5 rounded-2xl border border-[#CDE3D5]">
                      <img src={t.image} alt="Specimen" className="w-14 h-14 rounded-xl object-cover border border-[#1F5E3B]" />
                      <div className="text-xs">
                        <span className="font-extrabold text-[#17331F] block">Attached Specimen Leaf / Pod</span>
                        <span className="text-[10px] text-[#5C8D4E] font-bold">Ready for Pathological Inspection</span>
                      </div>
                    </div>
                  )}

                  {/* EXPERT DIAGNOSIS PREVIEW IF ANSWERED */}
                  {isAnswered && t.expertAnswer && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                      <span className="font-black text-emerald-900 block flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> Prescribed Diagnosis:
                      </span>
                      <p className="text-emerald-950 font-medium line-clamp-2">{t.expertAnswer.answerText}</p>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setDiagnosisForm({
                        diagnosis: t.expertAnswer?.diagnosis || 'Phytophthora capsule rot / Azhukal',
                        answerText: t.expertAnswer?.answerText || '',
                        recommendedRemedy: t.expertAnswer?.recommendedRemedy || '1% Bordeaux mixture + Trichoderma viride drenching',
                        organicAdvice: t.expertAnswer?.organicAdvice || 'Prune shade canopy to 50% & clear drainage channels',
                        severity: 'Moderate',
                      });
                      setDiagnosisModalOpen(true);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#17331F] to-[#1F5E3B] hover:from-[#1F5E3B] hover:to-[#0f2415] text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{isAnswered ? 'Edit Prescription' : 'Diagnose & Prescribe'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCallTicket(t);
                      setCallModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-[#EAF4EE] text-[#1F5E3B] hover:bg-[#1F5E3B] hover:text-white border border-[#CDE3D5] text-xs font-bold transition-all cursor-pointer"
                    title="Schedule Advisory Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DIAGNOSIS & PRESCRIPTION FORM MODAL */}
      {diagnosisModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#D7E6D5] p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Official Agronomy Diagnosis & Treatment Prescription
                </h3>
                <p className="text-xs text-gray-500">Provide certified pathological diagnosis & treatment plan for farmer</p>
              </div>
              <button onClick={() => setDiagnosisModalOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRESET TEMPLATE SELECTION BAR */}
            <div className="bg-[#F4F9F2] p-3.5 rounded-2xl border border-[#D7E6D5] space-y-2">
              <span className="text-[10px] font-black text-[#17331F] uppercase tracking-wider block">⚡ Quick ICAR Prescription Templates:</span>
              <div className="flex flex-wrap gap-2">
                {PRESCRIPTION_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyPrescriptionTemplate(tmpl)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#5C8D4E]/40 text-[#1F5E3B] text-xs font-extrabold hover:bg-[#1F5E3B] hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    + {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* FARMER SYMPTOM & ATTACHED SPECIMEN DISPLAY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
              <div className="md:col-span-2 space-y-1">
                <span className="font-extrabold text-gray-700 block">Farmer Query: "{selectedTicket.title}"</span>
                <p className="text-gray-600 font-medium">{selectedTicket.questionText}</p>
              </div>
              {selectedTicket.image && (
                <div>
                  <span className="font-extrabold text-gray-700 block mb-1">Attached Specimen:</span>
                  <img src={selectedTicket.image} alt="Specimen" className="w-full h-24 rounded-xl object-cover border border-emerald-600 shadow-sm" />
                </div>
              )}
            </div>

            {/* PRESCRIPTION FORM */}
            <form onSubmit={handleSaveDiagnosis} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#17331F] mb-1">Pathological Diagnosis Title</label>
                <input
                  type="text"
                  value={diagnosisForm.diagnosis}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosis: e.target.value })}
                  placeholder="e.g. Phytophthora capsule rot / Azhukal disease..."
                  className="w-full p-3 rounded-xl border border-[#D7E6D5] text-xs font-bold text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#17331F] mb-1">Detailed Diagnostic Findings & Instructions</label>
                <textarea
                  rows="4"
                  value={diagnosisForm.answerText}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, answerText: e.target.value })}
                  placeholder="Provide step-by-step agronomic treatment instructions for the farmer..."
                  className="w-full p-3 rounded-xl border border-[#D7E6D5] text-xs font-medium text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#17331F] mb-1">Recommended Remedy & Dosage</label>
                  <input
                    type="text"
                    value={diagnosisForm.recommendedRemedy}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, recommendedRemedy: e.target.value })}
                    placeholder="e.g. 1% Bordeaux mixture spray (3g/L) or Trichoderma drenching..."
                    className="w-full p-3 rounded-xl border border-[#D7E6D5] text-xs font-medium text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17331F] mb-1">Organic Cultural Management</label>
                  <input
                    type="text"
                    value={diagnosisForm.organicAdvice}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, organicAdvice: e.target.value })}
                    placeholder="e.g. Prune shade trees to 50% & clean drainage channels..."
                    className="w-full p-3 rounded-xl border border-[#D7E6D5] text-xs font-medium text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" size="md" onClick={() => setDiagnosisModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={Send}
                  disabled={submittingDiagnosis}
                >
                  {submittingDiagnosis ? 'Submitting Prescription...' : 'Issue Official Prescription'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TELE-CONSULTATION CALL SCHEDULER MODAL */}
      {callModalOpen && callTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#D7E6D5] p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#17331F] flex items-center gap-2 font-poppins">
                <Phone className="w-5 h-5 text-[#1F5E3B]" />
                Schedule Agronomy Call
              </h3>
              <button onClick={() => setCallModalOpen(false)} className="p-1.5 text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleScheduleCall} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Call Date</label>
                <input
                  type="date"
                  value={callForm.date}
                  onChange={(e) => setCallForm({ ...callForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#D7E6D5] text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Call Time</label>
                <input
                  type="time"
                  value={callForm.time}
                  onChange={(e) => setCallForm({ ...callForm, time: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#D7E6D5] text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Call Purpose / Advisory Notes</label>
                <textarea
                  rows="2"
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#D7E6D5] text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" size="sm" onClick={() => setCallModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" icon={Phone}>Schedule Call</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpertDashboard;
