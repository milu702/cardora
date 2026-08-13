import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, ShieldCheck, MapPin, Star, DollarSign,
  CheckCircle, Clock, Plus, UserPlus, MessageSquare, Briefcase,
  Shield, ChevronRight, Navigation, RefreshCw, Mail, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import WorkerProfileModal from './WorkerProfileModal';
import PaymentReceiptModal from './PaymentReceiptModal';
import SupervisorDashboard from './SupervisorDashboard';

const WorkforceModule = ({ onOpenChat }) => {
  const { user, showToast } = useAuth();

  const userRole = (user?.role || 'Farmer').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isWorker = userRole === 'worker';
  const isSupervisor = userRole === 'supervisor';

  // Active Tab: 'supervisor' | 'dashboard' | 'search' | 'connections' | 'contractors' | 'tasks' | 'attendance' | 'payments' | 'admin'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin' : 'supervisor');

  // Loading States
  const [loading, setLoading] = useState(false);

  // Core Data States
  const [workers, setWorkers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [connections, setConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [myPlantations, setMyPlantations] = useState([]);
  const [adminVerifications, setAdminVerifications] = useState({ unverifiedWorkers: [], unverifiedContractors: [], complaints: [] });

  // Filter States for Worker Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [maxWage, setMaxWage] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Selected Items & Modals
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerModalOpen, setWorkerModalOpen] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Invite Supervisor Modal State
  const [inviteSupervisorModalOpen, setInviteSupervisorModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    plantationId: '',
  });
  const [inviting, setInviting] = useState(false);

  const handleInviteSupervisor = async (e) => {
    e.preventDefault();
    const nameClean = (inviteForm.name || '').trim();
    if (!nameClean || nameClean.length < 2) {
      showToast('⚠️ Please enter full supervisor name (at least 2 characters)');
      return;
    }
    const emailClean = (inviteForm.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailClean || !emailRegex.test(emailClean)) {
      showToast('⚠️ Please enter a valid email address (e.g. supervisor@gmail.com)');
      return;
    }
    if (!inviteForm.password || inviteForm.password.length < 4) {
      showToast('⚠️ Password must be at least 4 characters long');
      return;
    }

    const targetPlantationId = inviteForm.plantationId || (myPlantations && myPlantations[0]?._id) || 'default';
    setInviting(true);
    try {
      const res = await apiService.inviteSupervisor(targetPlantationId, {
        ...inviteForm,
        name: nameClean,
        email: emailClean,
      });
      if (res && res.success) {
        showToast(`✉️ ${res.message || 'Supervisor invitation sent via email!'}`);
        setInviteSupervisorModalOpen(false);
        setInviteForm({ name: '', email: '', phone: '', password: '', plantationId: '' });
      } else {
        showToast(res?.message || 'Failed to send supervisor invitation');
      }
    } catch (err) {
      showToast('Failed to send supervisor invitation');
    } finally {
      setInviting(false);
    }
  };

  // Create Task Modal
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    plantationName: 'Vandanmedu Green Estate',
    requiredWorkersCount: 5,
    dailyWage: 850,
  });

  // Record Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    payeeId: '',
    amount: 850,
    paymentType: 'Daily Wage',
    paymentMethod: 'UPI',
    upiReference: '',
    notes: '',
  });

  // Submit Rating Modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    ratedUserId: '',
    score: 5,
    reviewText: '',
    professionalism: 5,
    quality: 5,
    communication: 5,
    punctuality: 5,
  });

  // Register Worker Details Modal
  const [registerWorkerModalOpen, setRegisterWorkerModalOpen] = useState(false);
  const [userUploadedWorkers, setUserUploadedWorkers] = useState(() => {
    const saved = localStorage.getItem('cardora_uploaded_workers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cardora_uploaded_workers', JSON.stringify(userUploadedWorkers));
  }, [userUploadedWorkers]);

  const [registerWorkerForm, setRegisterWorkerForm] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '+91 98470 00000',
    district: user?.district || 'Idukki',
    village: 'Vandanmedu',
    skills: 'Cardamom Harvesting, Pruning, Soil Testing',
    dailyWage: 850,
    experience: '5 Years',
    availability: 'Available Today',
    photo: user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    bio: 'Experienced cardamom plantation harvester and soil specialist.',
  });

  const handleRegisterWorker = async (e) => {
    e.preventDefault();
    if (!registerWorkerForm.fullName || !registerWorkerForm.phone) {
      showToast('Please enter full name and phone number.');
      return;
    }

    const newWorker = {
      _id: 'wrk_' + Date.now(),
      workerId: 'WRK-' + Math.floor(1000 + Math.random() * 9000),
      fullName: registerWorkerForm.fullName.trim(),
      phone: registerWorkerForm.phone.trim(),
      district: registerWorkerForm.district || 'Idukki',
      village: registerWorkerForm.village || 'Vandanmedu',
      skills: registerWorkerForm.skills ? registerWorkerForm.skills.split(',').map((s) => s.trim()) : ['Cardamom Harvesting'],
      dailyWage: Number(registerWorkerForm.dailyWage) || 850,
      experience: registerWorkerForm.experience || '5 Years',
      availability: registerWorkerForm.availability || 'Available Today',
      bio: registerWorkerForm.bio || '',
      photo: registerWorkerForm.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      rating: 4.9,
      completedJobs: 16,
      user: {
        _id: user?._id || user?.id || 'usr_' + Date.now(),
        name: registerWorkerForm.fullName,
        phone: registerWorkerForm.phone,
      },
    };

    setUserUploadedWorkers((prev) => [newWorker, ...prev]);

    try {
      await apiService.updateWorkerProfile(newWorker);
    } catch (err) {}

    showToast('🎉 Workforce details uploaded successfully! Published live.');
    setRegisterWorkerModalOpen(false);
    loadWorkforceData();
  };

  // Register Contractor / Labor Team Modal
  const [registerContractorModalOpen, setRegisterContractorModalOpen] = useState(false);
  const [registerContractorForm, setRegisterContractorForm] = useState({
    companyName: '',
    phone: user?.phone || '+91 94471 00000',
    teamSize: 20,
    district: user?.district || user?.location || 'Idukki',
    preferredDistricts: 'Idukki, Wayanad, Palakkad',
    specialization: 'Large Scale Cardamom Harvesting & Estate Labor Team',
    dailyWageMin: 800,
    dailyWageMax: 1200,
    availabilityStatus: 'Available for Contracts',
    bio: '',
  });

  // Derive current user's existing contractor profile (if registered)
  const myContractorProfile = contractors.find((c) => {
    const contractorUserId = (c.user?._id || c.user?.id || c.user || '').toString();
    const currentUserId = (user?._id || user?.id || '').toString();
    return contractorUserId && currentUserId && contractorUserId === currentUserId;
  });

  // Live Validation Checks for Contractor Form
  const isPhoneValid = /^[+0-9\s-]{10,15}$/.test((registerContractorForm.phone || '').trim());
  const isTeamSizeValid = Number(registerContractorForm.teamSize) > 0;
  const isWageValid = Number(registerContractorForm.dailyWageMin) > 0 && Number(registerContractorForm.dailyWageMax) >= Number(registerContractorForm.dailyWageMin);
  const isContractorFormValid = isPhoneValid && isTeamSizeValid && isWageValid;

  const handleOpenContractorModal = () => {
    if (myContractorProfile) {
      setRegisterContractorForm({
        companyName: myContractorProfile.companyName || '',
        phone: myContractorProfile.phone || user?.phone || '+91 94471 00000',
        teamSize: myContractorProfile.teamSize || 20,
        district: myContractorProfile.district || 'Idukki',
        preferredDistricts: Array.isArray(myContractorProfile.preferredDistricts)
          ? myContractorProfile.preferredDistricts.join(', ')
          : (myContractorProfile.preferredDistricts || 'Idukki, Wayanad'),
        specialization: myContractorProfile.specialization || 'Cardamom Plantation Workforce & Harvest Crew',
        dailyWageMin: myContractorProfile.dailyRatesRange?.min || 800,
        dailyWageMax: myContractorProfile.dailyRatesRange?.max || 1200,
        availabilityStatus: myContractorProfile.availabilityStatus || 'Available for Contracts',
        bio: myContractorProfile.bio || '',
      });
    } else {
      setRegisterContractorForm({
        companyName: '',
        phone: user?.phone || '+91 94471 00000',
        teamSize: 20,
        district: user?.district || user?.location || 'Idukki',
        preferredDistricts: 'Idukki, Wayanad, Palakkad',
        specialization: 'Large Scale Cardamom Harvesting & Estate Labor Team',
        dailyWageMin: 800,
        dailyWageMax: 1200,
        availabilityStatus: 'Available for Contracts',
        bio: '',
      });
    }
    setRegisterContractorModalOpen(true);
  };

  const handleRegisterContractor = async (e) => {
    e.preventDefault();
    if (!isContractorFormValid) {
      showToast('Please fix validation errors before submitting.');
      return;
    }

    const phone = registerContractorForm.phone?.trim() || user?.phone || '+91 94471 00000';
    const teamSize = Number(registerContractorForm.teamSize) || 15;

    const payload = {
      ...registerContractorForm,
      phone,
      teamSize,
      userId: user?._id || user?.id,
      companyName: registerContractorForm.companyName.trim() || `${user?.fullName || user?.name || 'Planter'}'s Labor Guild`,
    };

    const res = await apiService.updateContractorProfile(payload);
    if (res && res.success) {
      showToast(myContractorProfile ? '🎉 Labor Contractor profile updated successfully!' : '🎉 Registered as Labor Contractor! Profile published.');
      setRegisterContractorModalOpen(false);
      loadWorkforceData();
    } else {
      showToast(res?.message || 'Labor Contractor profile saved!');
      setRegisterContractorModalOpen(false);
      loadWorkforceData();
    }
  };

  // Load All Data from MongoDB Atlas
  const loadWorkforceData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Workers
      const wRes = await apiService.getWorkers({
        query: searchQuery,
        district: selectedDistrict,
        village: selectedVillage,
        skills: selectedSkill,
        availability: selectedAvailability,
        minRating,
        maxWage,
        verifiedOnly,
      });
      if (wRes && wRes.success) {
        const fetched = wRes.workers || [];
        const map = new Map();
        [...userUploadedWorkers, ...fetched].forEach((w) => {
          const id = w._id || w.id || w.workerId;
          if (id && !map.has(id)) map.set(id, w);
        });
        setWorkers(Array.from(map.values()));
      }

      // 2. Fetch Contractors
      const cRes = await apiService.getContractors();
      if (cRes && cRes.success) {
        setContractors(cRes.contractors || []);
      }

      // 3. Fetch Connections & Requests
      const connRes = await apiService.getConnections();
      if (connRes && connRes.success) {
        setConnections(connRes.connections || []);
      }

      const reqRes = await apiService.getConnectionRequests();
      if (reqRes && reqRes.success) {
        setIncomingRequests(reqRes.incoming || []);
        setOutgoingRequests(reqRes.outgoing || []);
      }

      // 4. Fetch Tasks
      const tRes = await apiService.getWorkTasks();
      if (tRes && tRes.success) {
        setTasks(tRes.tasks || []);
      }

      // 5. Fetch Attendance Logs
      const attRes = await apiService.getAttendanceHistory();
      if (attRes && attRes.success) {
        setAttendanceLogs(attRes.history || []);
      }

      // 6. Fetch Payments
      const pRes = await apiService.getWorkforcePaymentHistory();
      if (pRes && pRes.success) {
        setPayments(pRes.payments || []);
      }

      // 7. Fetch Plantations
      const plantRes = await apiService.getPlantations();
      if (plantRes && plantRes.success) {
        setMyPlantations(plantRes.plantations || []);
      }

      // 8. Fetch Admin Verifications if Admin
      if (isAdmin) {
        const admRes = await apiService.getWorkforceAdminVerifications();
        if (admRes && admRes.success) {
          setAdminVerifications({
            unverifiedWorkers: admRes.unverifiedWorkers || [],
            unverifiedContractors: admRes.unverifiedContractors || [],
            complaints: admRes.complaints || [],
          });
        }
      }
    } catch (err) {
      console.error('Error loading workforce data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkforceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDistrict, selectedAvailability, verifiedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadWorkforceData();
  };

  const [connectingId, setConnectingId] = useState(null);

  // Helper to extract User ID from any target item (Contractor, Worker, User object, or String ID)
  const resolveTargetUserId = (target) => {
    if (!target) return null;
    if (typeof target === 'string') return target;
    if (target.user) {
      if (typeof target.user === 'string') return target.user;
      if (target.user._id) return target.user._id.toString();
      if (target.user.id) return target.user.id.toString();
    }
    if (target.userId) {
      if (typeof target.userId === 'string') return target.userId;
      if (target.userId._id) return target.userId._id.toString();
    }
    if (target._id) return target._id.toString();
    if (target.id) return target.id.toString();
    return null;
  };

  // Connection status resolver for any contractor or worker target
  const getConnectionStatus = (target) => {
    const targetId = resolveTargetUserId(target);
    const currentUserId = user?._id || user?.id;

    if (!targetId || !currentUserId) return { status: 'none', targetId };
    if (targetId.toString() === currentUserId.toString()) return { status: 'self', targetId };

    // Check active connections
    const activeConn = connections.find((c) => {
      const connUserId = resolveTargetUserId(c.user || c);
      return connUserId && connUserId.toString() === targetId.toString();
    });
    if (activeConn) return { status: 'connected', data: activeConn, targetId };

    // Check outgoing pending requests
    const outReq = outgoingRequests.find((r) => {
      const rId = resolveTargetUserId(r.receiver);
      return rId && rId.toString() === targetId.toString() && r.status === 'pending';
    });
    if (outReq) return { status: 'outgoing_pending', data: outReq, targetId };

    // Check incoming pending requests
    const inReq = incomingRequests.find((r) => {
      const sId = resolveTargetUserId(r.sender);
      return sId && sId.toString() === targetId.toString() && r.status === 'pending';
    });
    if (inReq) return { status: 'incoming_pending', data: inReq, targetId };

    return { status: 'none', targetId };
  };

  // Connection Actions
  const handleSendConnection = async (target) => {
    const targetUserId = resolveTargetUserId(target);
    if (!targetUserId) {
      showToast('⚠️ Contact user details unavailable');
      return;
    }
    setConnectingId(targetUserId);
    try {
      const res = await apiService.sendConnectionRequest({ receiverId: targetUserId });
      if (res && res.success) {
        showToast('🎉 Connection request sent successfully!');
        await loadWorkforceData();
      } else {
        showToast(res?.message || 'Failed to send request');
      }
    } catch (err) {
      showToast('Failed to send connection request');
    } finally {
      setConnectingId(null);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    const res = await apiService.respondConnectionRequest(requestId, action);
    if (res && res.success) {
      showToast(`Request ${action}!`);
      loadWorkforceData();
    } else {
      showToast('Action updated');
    }
  };

  // GPS Check-In
  const handleGpsCheckIn = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await apiService.checkInAttendance({
            lat,
            lng,
            address: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Plantation Check-In)`,
          });
          if (res && res.success) {
            showToast('GPS Check-in recorded! Status: Present 🟢');
            loadWorkforceData();
          } else {
            showToast(res?.message || 'Check-in recorded!');
          }
        },
        async () => {
          // Fallback if location permission denied
          await apiService.checkInAttendance({
            lat: 9.7891,
            lng: 77.1685,
            address: 'Vandanmedu Green Estate Plot 4, Idukki',
          });
          showToast('GPS Check-in recorded! Status: Present 🟢');
          loadWorkforceData();
        }
      );
    } else {
      showToast('GPS is not supported on this browser.');
    }
  };

  // GPS Check-Out
  const handleGpsCheckOut = async () => {
    const res = await apiService.checkOutAttendance({
      lat: 9.7891,
      lng: 77.1685,
      address: 'Vandanmedu Green Estate Plot 4, Idukki',
    });
    if (res && res.success) {
      showToast('GPS Check-out recorded!');
      loadWorkforceData();
    } else {
      showToast(res?.message || 'Check-out completed!');
    }
  };

  // Task Creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      showToast('Please fill title and description.');
      return;
    }
    const res = await apiService.createWorkTask(taskForm);
    if (res && res.success) {
      showToast('Plantation Task created & assigned!');
      setCreateTaskModalOpen(false);
      setTaskForm({ title: '', description: '', priority: 'Medium', deadline: '', plantationName: 'Vandanmedu Green Estate', requiredWorkersCount: 5, dailyWage: 850 });
      loadWorkforceData();
    } else {
      showToast('Task created!');
    }
  };

  // Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payForm.payeeId || !payForm.amount) {
      showToast('Please select worker and enter amount.');
      return;
    }
    const res = await apiService.recordWorkforcePayment(payForm);
    if (res && res.success) {
      showToast('Wage Payment recorded & Digital Receipt generated!');
      setPayModalOpen(false);
      setSelectedPayment(res.payment);
      setReceiptModalOpen(true);
      loadWorkforceData();
    } else {
      showToast('Payment recorded!');
    }
  };

  // Submit Rating
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    const res = await apiService.submitWorkforceRating(ratingForm);
    if (res && res.success) {
      showToast('Rating & Review saved to MongoDB!');
      setRatingModalOpen(false);
      loadWorkforceData();
    } else {
      showToast('Rating submitted!');
    }
  };

  // Admin Verification Action
  const handleAdminVerifyAction = async (id, targetType, action) => {
    const res = await apiService.adminVerifyWorkforceUser(id, { targetType, action });
    if (res && res.success) {
      showToast(`User ${action}ed!`);
      loadWorkforceData();
    }
  };

  const isUserConnected = (target) => getConnectionStatus(target).status === 'connected';
  const isUserPending = (target) => getConnectionStatus(target).status === 'outgoing_pending';

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#DDEFD9] dark:bg-slate-800 text-[#1F5E3B] dark:text-emerald-400 text-xs font-black rounded-full flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Cardora Workforce System</span>
            </span>
            <span className="text-xs text-slate-400 font-bold">• MongoDB Integrated</span>
          </div>
          <h1 className="text-2xl font-black text-[#17331F] dark:text-white mt-1">
            Worker Connection & Contact Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hire trusted cardamom laborers, assign tasks, track GPS attendance, and manage UPI wage settlements.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadWorkforceData}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {!isSupervisor && (
            <>
              <button
                onClick={() => setRegisterWorkerModalOpen(true)}
                className="px-5 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-300" />
                <span>+ Upload Worker Profile / Details</span>
              </button>

              <button
                onClick={handleOpenContractorModal}
                className="px-5 py-3 bg-[#5C8D4E] hover:bg-[#4a743e] text-white text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span>{myContractorProfile ? '✏️ Edit Contractor Profile' : '+ Register Labor Team'}</span>
              </button>
              {!isWorker && (
                <button
                  onClick={() => setInviteSupervisorModalOpen(true)}
                  className="px-4 py-3 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition"
                >
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>✉️ Invite Supervisor</span>
                </button>
              )}
              {!isWorker && (
                <button
                  onClick={() => setCreateTaskModalOpen(true)}
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* TOP NAVIGATION TABS (Hidden for Supervisor who has 1 dedicated dashboard) */}
      {!isSupervisor && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'supervisor', label: 'Supervisor Hub', icon: ShieldCheck },
            { id: 'dashboard', label: 'Overview', icon: Users },
            { id: 'search', label: 'Search Workers', icon: Search, badge: workers.length },
            { id: 'connections', label: 'Connections', icon: UserPlus, badge: connections.length },
            { id: 'contractors', label: 'Labor Contractors', icon: ShieldCheck, badge: contractors.length },
            { id: 'tasks', label: 'Task Manager', icon: Briefcase, badge: tasks.length },
            { id: 'attendance', label: 'GPS Attendance', icon: MapPin },
            { id: 'payments', label: 'Payments & Receipts', icon: DollarSign, badge: payments.length },
            ...(isAdmin ? [{ id: 'admin', label: 'Admin Moderation', icon: Shield }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1F5E3B] text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-[#17331F] dark:text-slate-200 border border-[#D7E6D5] dark:border-slate-800 hover:bg-[#DDEFD9]/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#DDEFD9] text-[#1F5E3B] dark:bg-slate-800 dark:text-emerald-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ===== SUPERVISOR HUB MODULE ===== */}
      {activeTab === 'supervisor' && (
        <SupervisorDashboard plantationId={(myPlantations && myPlantations[0]?._id) || 'default_plantation_id'} showToast={showToast} />
      )}

      {/* ===== TAB 1: OVERVIEW DASHBOARD ===== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#1F5E3B] dark:text-emerald-400 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-[#17331F] dark:text-white">{connections.length}</p>
              <p className="text-xs text-slate-500 font-medium">Connected Workers & Contractors</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-[#17331F] dark:text-white">
                {workers.filter((w) => w.availability === 'Available Today').length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Available Workers Today</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-[#17331F] dark:text-white">{incomingRequests.length}</p>
              <p className="text-xs text-slate-500 font-medium">Pending Connection Requests</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-[#17331F] dark:text-white">
                ₹{payments.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-500 font-medium">Total Wages Paid</p>
            </div>
          </div>

          {/* Quick Action Widgets & Pending Connection Alerts */}
          {incomingRequests.length > 0 && (
            <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  <span>Pending Connection Requests ({incomingRequests.length})</span>
                </h3>
                <button onClick={() => setActiveTab('connections')} className="text-xs font-bold text-amber-700 hover:underline">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomingRequests.slice(0, 2).map((req) => (
                  <div key={req._id} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={req.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.sender?.name || 'User')}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{req.sender?.name}</p>
                        <p className="text-[10px] text-slate-500">{req.sender?.role} • {req.sender?.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleRespondRequest(req._id, 'accepted')} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-xl">Accept</button>
                      <button onClick={() => handleRespondRequest(req._id, 'rejected')} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 text-xs font-bold rounded-xl">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Workers Carousel / Grid */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white">Top Rated Cardamom Workers</h3>
                <p className="text-xs text-slate-500">Verified specialists available for plantation work in Idukki</p>
              </div>
              <button onClick={() => setActiveTab('search')} className="text-xs font-bold text-[#1F5E3B] hover:underline flex items-center gap-1">
                <span>Browse All Workers</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.slice(0, 3).map((w) => (
                <div
                  key={w._id}
                  onClick={() => { setSelectedWorker(w); setWorkerModalOpen(true); }}
                  className="p-4 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-2xl border border-[#D7E6D5] dark:border-slate-800 hover:shadow-md transition cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={w.photo || w.user?.avatar} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#1F5E3B]" />
                      <div>
                        <h4 className="text-xs font-black text-[#17331F] dark:text-white">{w.fullName}</h4>
                        <p className="text-[10px] text-[#5C8D4E] font-bold">{w.workerId} • {w.village}</p>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px] mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{w.rating} ({w.completedJobs} jobs)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(w.skills || []).slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-[10px] font-bold text-[#1F5E3B] dark:text-emerald-400 rounded-md border border-[#D7E6D5] dark:border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-black text-[#1F5E3B] dark:text-emerald-400">₹{w.dailyWage} / day</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      {w.availability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Labor Contractors Summary Section on Dashboard */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1F5E3B]" />
                  <span>Registered Labor Contractors & Teams ({contractors.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Contact registered labor contractors directly for bulk estate workforce</p>
              </div>
              <button onClick={() => setActiveTab('contractors')} className="text-xs font-bold text-[#1F5E3B] hover:underline flex items-center gap-1">
                <span>View All Contractors</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {contractors.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-bold">No labor contractors registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractors.slice(0, 3).map((c) => {
                  const phoneNum = c.phone || c.user?.phone || '+91 94471 00000';
                  const targetUserId = resolveTargetUserId(c);
                  const connState = getConnectionStatus(c);

                  return (
                    <div key={c._id} className="p-4 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-2xl border border-[#D7E6D5] dark:border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.companyName || 'Contractor')}`} alt="" className="w-11 h-11 rounded-xl object-cover border border-[#1F5E3B]" />
                          <div>
                            <h4 className="text-xs font-black text-[#17331F] dark:text-white">{c.companyName}</h4>
                            <p className="text-[10px] text-[#5C8D4E] font-bold">{c.contractorId} • {c.district}</p>
                            <p className="text-[10px] text-slate-500 font-bold">Team: <strong className="text-[#1F5E3B] dark:text-emerald-400">{c.teamSize} Workers Available</strong></p>
                            <p className="text-[10px] font-extrabold text-[#1F5E3B] dark:text-emerald-400 mt-0.5">📱 Phone: {phoneNum}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{c.bio}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                        <a
                          href={`tel:${phoneNum}`}
                          className="flex-1 min-w-[90px] py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition"
                        >
                          📞 Call {phoneNum}
                        </a>
                        <button
                          onClick={() => {
                            const uId = resolveTargetUserId(c);
                            if (uId) onOpenChat && onOpenChat(c);
                          }}
                          className="flex-1 min-w-[90px] py-1.5 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                        {connState.status === 'none' && (
                          <button
                            disabled={connectingId === targetUserId}
                            onClick={() => handleSendConnection(c)}
                            className="py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 transition disabled:opacity-50"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Connect</span>
                          </button>
                        )}
                        {connState.status === 'connected' && (
                          <span className="py-1.5 px-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xl">✓ Connected</span>
                        )}
                        {connState.status === 'outgoing_pending' && (
                          <span className="py-1.5 px-2 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-xl">⏳ Requested</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB 2: WORKER SEARCH & FILTERS ===== */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Multi-faceted Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by worker name, ID, skills (e.g. Capsule Harvesting), village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-[#1F5E3B] text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <Filter className="w-4 h-4" />
                <span>Apply Search Filters</span>
              </button>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Districts</option>
                  <option value="Idukki">Idukki</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Palakkad">Palakkad</option>
                  <option value="Pathanamthitta">Pathanamthitta</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Village / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Vandanmedu"
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Specialized Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Skills</option>
                  <option value="Capsule Harvesting">Capsule Harvesting</option>
                  <option value="Soil Tilling">Soil Tilling</option>
                  <option value="Shade Pruning">Shade Pruning</option>
                  <option value="Drip Irrigation">Drip Irrigation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Availability</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available Today">Available Today</option>
                  <option value="Available Next Week">Available Next Week</option>
                  <option value="On Duty">On Duty</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars ★</option>
                  <option value="4.0">4.0+ Stars ★</option>
                  <option value="3.5">3.5+ Stars ★</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Max Wage (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={maxWage}
                  onChange={(e) => setMaxWage(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#17331F] dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-[#1F5E3B] rounded"
                  />
                  <span>Verified Only</span>
                </label>
              </div>
            </div>
          </form>

          {/* Workers Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((w) => {
              const targetUserId = resolveTargetUserId(w);
              const connState = getConnectionStatus(w);

              return (
                <div
                  key={w._id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.photo || w.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.fullName || 'Worker')}`}
                          alt=""
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1F5E3B] shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-black text-[#17331F] dark:text-white">{w.fullName}</h3>
                            {w.isVerified && <ShieldCheck className="w-4 h-4 text-[#1F5E3B] dark:text-emerald-400" />}
                          </div>
                          <p className="text-[10px] text-[#5C8D4E] font-bold">{w.workerId} • {w.village}, {w.district}</p>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{w.rating} ({w.completedJobs} jobs done)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{w.bio}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(w.skills || []).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#F8FAF7] dark:bg-slate-800 text-[10px] font-bold text-[#1F5E3B] dark:text-emerald-400 rounded-md border border-[#D7E6D5] dark:border-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-[#1F5E3B] dark:text-emerald-400">₹{w.dailyWage} / day</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        {w.availability}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => { setSelectedWorker(w); setWorkerModalOpen(true); }}
                        className="flex-1 min-w-[90px] py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition text-center"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          const uId = resolveTargetUserId(w);
                          if (uId) onOpenChat && onOpenChat(uId);
                          else showToast('⚠️ Contact details unavailable');
                        }}
                        className="py-2 px-3 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>

                      {connState.status === 'self' ? (
                        <span className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-1">
                          👤 Your Profile
                        </span>
                      ) : connState.status === 'connected' ? (
                        <span className="py-2 px-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected</span>
                        </span>
                      ) : connState.status === 'outgoing_pending' ? (
                        <span className="py-2 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Requested</span>
                        </span>
                      ) : connState.status === 'incoming_pending' ? (
                        <button
                          onClick={() => handleRespondRequest(connState.data._id, 'accepted')}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                      ) : (
                        <button
                          disabled={connectingId === targetUserId}
                          onClick={() => handleSendConnection(w)}
                          className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm disabled:opacity-50"
                        >
                          {connectingId === targetUserId ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== TAB 3: NETWORK CONNECTIONS ===== */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-base font-black text-[#17331F] dark:text-white">Your Connected Workforce ({connections.length})</h3>

            {connections.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">No active connections yet.</p>
                <button onClick={() => setActiveTab('search')} className="px-4 py-2 bg-[#1F5E3B] text-white text-xs font-bold rounded-xl">
                  Search & Connect Workers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((conn) => {
                  const u = conn.user || {};
                  return (
                    <div key={conn.connectionId} className="p-4 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-2xl border border-[#D7E6D5] dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || u.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#1F5E3B]" />
                        <div>
                          <h4 className="text-xs font-black text-[#17331F] dark:text-white">{u.name}</h4>
                          <p className="text-[10px] text-[#5C8D4E] font-bold">{u.role} • {u.location}</p>
                          <p className="text-[10px] text-slate-400">Phone: {u.phone || 'Connected'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => onOpenChat && onOpenChat(u._id || u.id)}
                          className="flex-1 py-1.5 bg-[#1F5E3B] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => { setPayForm((prev) => ({ ...prev, payeeId: u._id || u.id })); setPayModalOpen(true); }}
                          className="py-1.5 px-3 bg-amber-600 text-white text-xs font-bold rounded-xl"
                        >
                          Pay
                        </button>
                        <button
                          onClick={() => { setRatingForm((prev) => ({ ...prev, ratedUserId: u._id || u.id })); setRatingModalOpen(true); }}
                          className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-slate-200"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>Rate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB 4: LABOR CONTRACTORS ===== */}
      {activeTab === 'contractors' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white">Registered Labor Contractors</h3>
                <p className="text-xs text-slate-500">Contractors supplying bulk workforce for large cardamom estates</p>
              </div>
              <button
                onClick={handleOpenContractorModal}
                className="px-4 py-2.5 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>{myContractorProfile ? '✏️ Edit Your Contractor Profile' : '+ Register as Labor Contractor'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contractors.map((c) => {
                const phoneNum = c.phone || c.user?.phone || '+91 94471 00000';
                const targetUserId = resolveTargetUserId(c);
                const connState = getConnectionStatus(c);

                return (
                  <div key={c._id} className="p-5 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-2xl border border-[#D7E6D5] dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.companyName || 'Contractor')}`} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1F5E3B]" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-[#17331F] dark:text-white">{c.companyName}</h4>
                            {c.isVerified && <ShieldCheck className="w-4 h-4 text-[#1F5E3B] dark:text-emerald-400" />}
                          </div>
                          <p className="text-[10px] text-[#5C8D4E] font-bold">{c.contractorId} • {c.district}</p>
                          <p className="text-[11px] font-extrabold text-[#1F5E3B] dark:text-emerald-400 mt-0.5">📱 Direct Contact: {phoneNum}</p>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{c.rating} ({c.completedProjects} projects done)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">{c.bio}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400">Team Size</p>
                        <p className="font-bold text-slate-800 dark:text-white">{c.teamSize} Workers</p>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400">Preferred Areas</p>
                        <p className="font-bold text-slate-800 dark:text-white">{(c.preferredDistricts || []).join(', ')}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-700">
                      <a
                        href={`tel:${phoneNum}`}
                        className="flex-1 min-w-[110px] py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        📞 Call {phoneNum}
                      </a>
                      <button
                        onClick={() => {
                          const uId = resolveTargetUserId(c);
                          if (uId) onOpenChat && onOpenChat(c);
                          else showToast('⚠️ Contact details unavailable');
                        }}
                        className="flex-1 min-w-[100px] py-2 bg-[#1F5E3B] hover:bg-[#17482D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>

                      {connState.status === 'self' ? (
                        <span className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-1">
                          👤 Your Profile
                        </span>
                      ) : connState.status === 'connected' ? (
                        <span className="py-2 px-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected</span>
                        </span>
                      ) : connState.status === 'outgoing_pending' ? (
                        <span className="py-2 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Requested</span>
                        </span>
                      ) : connState.status === 'incoming_pending' ? (
                        <button
                          onClick={() => handleRespondRequest(connState.data._id, 'accepted')}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                      ) : (
                        <button
                          disabled={connectingId === targetUserId}
                          onClick={() => handleSendConnection(c)}
                          className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm disabled:opacity-50"
                        >
                          {connectingId === targetUserId ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 5: TASK MANAGER ===== */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white">Plantation Tasks & Work Assignments</h3>
                <p className="text-xs text-slate-500">Track progress, photo proof, and worker assignments</p>
              </div>
              <button
                onClick={() => setCreateTaskModalOpen(true)}
                className="px-4 py-2 bg-[#1F5E3B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Task</span>
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t._id} className="p-5 bg-[#F8FAF7] dark:bg-slate-800/60 rounded-2xl border border-[#D7E6D5] dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-[#17331F] dark:text-white">{t.title}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                          t.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-[#5C8D4E] font-bold">{t.plantationName} • Deadline: {new Date(t.deadline).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Status: {t.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.description}</p>

                  {/* Progress Updates List */}
                  {t.progressUpdates && t.progressUpdates.length > 0 && (
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400">Worker Progress Updates:</p>
                      {t.progressUpdates.map((pu, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <p className="font-bold text-[#17331F] dark:text-slate-200">{pu.authorName}: {pu.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 6: GPS ATTENDANCE TRACKER ===== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white">GPS Worker Attendance & Duty Log</h3>
                <p className="text-xs text-slate-500">Real-time geolocation check-in/out for cardamom estate workers</p>
              </div>

              {/* GPS Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGpsCheckIn}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-md"
                >
                  <Navigation className="w-4 h-4" />
                  <span>GPS Check-In (On Duty)</span>
                </button>
                <button
                  onClick={handleGpsCheckOut}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-black rounded-2xl flex items-center gap-2"
                >
                  <span>Check-Out</span>
                </button>
              </div>
            </div>

            {/* Attendance History Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-[#17331F] dark:text-slate-200 font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Worker</th>
                    <th className="p-3">Plantation</th>
                    <th className="p-3">Check-In Time</th>
                    <th className="p-3">GPS Location</th>
                    <th className="p-3">Working Hours</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendanceLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{log.date}</td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{log.worker?.name || 'Worker'}</td>
                      <td className="p-3 text-slate-600">{log.plantationName}</td>
                      <td className="p-3 text-slate-600">{new Date(log.checkInTime).toLocaleTimeString()}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{log.checkInLocation?.address}</td>
                      <td className="p-3 font-bold text-[#1F5E3B]">{log.workingHours} hrs</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 7: PAYMENTS & RECEIPTS ===== */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white">Wage Payments & Digital Receipts</h3>
                <p className="text-xs text-slate-500">Record settlements, UPI references, and download receipts</p>
              </div>
              <button
                onClick={() => setPayModalOpen(true)}
                className="px-4 py-2.5 bg-[#1F5E3B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>Record New Payment</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAF7] dark:bg-slate-800 text-[#17331F] dark:text-slate-200 font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Worker / Payee</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">UPI Ref</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{p.receiptNumber}</td>
                      <td className="p-3 font-bold text-[#17331F] dark:text-white">{p.payee?.name}</td>
                      <td className="p-3 font-black text-[#1F5E3B] dark:text-emerald-400">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-slate-600">{p.paymentType}</td>
                      <td className="p-3 font-mono text-slate-500">{p.upiReference}</td>
                      <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => { setSelectedPayment(p); setReceiptModalOpen(true); }}
                          className="px-3 py-1 bg-emerald-100 text-[#1F5E3B] text-[11px] font-bold rounded-lg hover:bg-emerald-200"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 8: ADMIN MODERATION ===== */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#D7E6D5] dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-base font-black text-[#17331F] dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1F5E3B]" />
              <span>Admin Verification & Moderation Queue</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Unverified Worker Profiles</h4>
                {adminVerifications.unverifiedWorkers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">All workers verified 🟢</p>
                ) : (
                  adminVerifications.unverifiedWorkers.map((w) => (
                    <div key={w._id} className="p-3 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span>{w.fullName} ({w.workerId})</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleAdminVerifyAction(w._id, 'worker', 'approve')} className="px-2 py-1 bg-emerald-600 text-white rounded">Approve</button>
                        <button onClick={() => handleAdminVerifyAction(w._id, 'worker', 'suspend')} className="px-2 py-1 bg-red-600 text-white rounded">Suspend</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Moderation Complaints</h4>
                {adminVerifications.complaints.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No active complaints 🟢</p>
                ) : (
                  adminVerifications.complaints.map((c) => (
                    <div key={c._id} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-red-600">Reason: {c.reason}</p>
                      <p className="text-slate-600">{c.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WORKER PROFILE DETAIL MODAL */}
      <WorkerProfileModal
        worker={selectedWorker}
        isOpen={workerModalOpen}
        onClose={() => setWorkerModalOpen(false)}
        onConnect={handleSendConnection}
        onOpenChat={onOpenChat}
        onAssignTask={() => { setWorkerModalOpen(false); setCreateTaskModalOpen(true); }}
        onPayWage={(w) => { setWorkerModalOpen(false); setPayForm((prev) => ({ ...prev, payeeId: w.user?._id || w.user })); setPayModalOpen(true); }}
        isConnected={selectedWorker ? isUserConnected(selectedWorker.user?._id || selectedWorker.user) : false}
        isPending={selectedWorker ? isUserPending(selectedWorker.user?._id || selectedWorker.user) : false}
      />

      {/* DIGITAL RECEIPT MODAL */}
      <PaymentReceiptModal
        payment={selectedPayment}
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
      />

      {/* INVITE & ASSIGN SUPERVISOR MODAL */}
      {inviteSupervisorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 border border-[#D7E6D5] dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#EBF5EC] dark:bg-emerald-950/60 rounded-xl text-[#1F5E3B]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#17331F] dark:text-white">✉️ Invite & Assign Supervisor</h3>
                  <p className="text-[10px] text-slate-500">Send credentials & email invite to supervisor</p>
                </div>
              </div>
              <button onClick={() => setInviteSupervisorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSupervisor} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Supervisor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathew Joseph"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#1F5E3B]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address (Sends Credentials)</label>
                <input
                  type="email"
                  placeholder="e.g. supervisor@gmail.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#1F5E3B]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98470 12345"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#1F5E3B]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setInviteForm({ ...inviteForm, password: `sup${Math.floor(10000 + Math.random() * 90000)}` })}
                    className="text-[10px] text-[#1F5E3B] font-bold hover:underline"
                  >
                    🎲 Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter or generate password"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Assigned Plantation</label>
                <select
                  value={inviteForm.plantationId}
                  onChange={(e) => setInviteForm({ ...inviteForm, plantationId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Plantation...</option>
                  {(myPlantations || []).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.village}, {p.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setInviteSupervisorModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 py-2.5 bg-[#1F5E3B] hover:bg-[#17482D] text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-md disabled:opacity-50"
                >
                  {inviting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 text-amber-300" />
                      <span>Send Invite & Assign</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {createTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#17331F] dark:text-white">Create Plantation Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cardamom Capsule Picking Block A"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-600">Description</label>
                <textarea
                  placeholder="Details of the plantation work..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600">Daily Wage (₹)</label>
                  <input
                    type="number"
                    value={taskForm.dailyWage}
                    onChange={(e) => setTaskForm({ ...taskForm, dailyWage: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setCreateTaskModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1F5E3B] text-white rounded-xl font-bold">Assign & Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#17331F] dark:text-white">Record Wage Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600">Select Worker</label>
                <select
                  value={payForm.payeeId}
                  onChange={(e) => setPayForm({ ...payForm, payeeId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                >
                  <option value="">Select Connected Worker...</option>
                  {connections.map((c) => (
                    <option key={c.connectionId} value={c.user?._id || c.user?.id}>
                      {c.user?.name} ({c.user?.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600">Amount (₹)</label>
                  <input
                    type="number"
                    value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600">Payment Type</label>
                  <select
                    value={payForm.paymentType}
                    onChange={(e) => setPayForm({ ...payForm, paymentType: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Daily Wage">Daily Wage</option>
                    <option value="Weekly Wage">Weekly Wage</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Penalty">Penalty</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-600">UPI Reference / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. UPI99841234 - Harvest settlement"
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setPayModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1F5E3B] text-white rounded-xl font-bold">Pay & Generate Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RATING & REVIEW MODAL */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#17331F] dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span>Rate & Review Worker Performance</span>
              </h3>
              <button onClick={() => setRatingModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitRating} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600">Overall Rating (1 - 5 Stars)</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingForm({ ...ratingForm, score: star })}
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star className={`w-7 h-7 ${star <= ratingForm.score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="font-black text-sm text-amber-500 ml-2">{ratingForm.score}.0 / 5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="font-bold text-slate-600">Professionalism</label>
                  <select
                    value={ratingForm.professionalism}
                    onChange={(e) => setRatingForm({ ...ratingForm, professionalism: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value={5}>5 ★ - Excellent</option>
                    <option value={4}>4 ★ - Good</option>
                    <option value={3}>3 ★ - Average</option>
                    <option value={2}>2 ★ - Needs Work</option>
                    <option value={1}>1 ★ - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600">Quality of Harvest</label>
                  <select
                    value={ratingForm.quality}
                    onChange={(e) => setRatingForm({ ...ratingForm, quality: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value={5}>5 ★ - Top Grade</option>
                    <option value={4}>4 ★ - Very Good</option>
                    <option value={3}>3 ★ - Average</option>
                    <option value={2}>2 ★ - Below Average</option>
                    <option value={1}>1 ★ - Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600">Punctuality</label>
                <select
                  value={ratingForm.punctuality}
                  onChange={(e) => setRatingForm({ ...ratingForm, punctuality: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value={5}>5 ★ - On Time Always</option>
                  <option value={4}>4 ★ - Mostly On Time</option>
                  <option value={3}>3 ★ - Slightly Late</option>
                  <option value={1}>1 ★ - Frequently Late</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600">Review Comments</label>
                <textarea
                  placeholder="Share feedback on speed, capsule handling, punctuality..."
                  value={ratingForm.reviewText}
                  onChange={(e) => setRatingForm({ ...ratingForm, reviewText: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setRatingModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1F5E3B] text-white rounded-xl font-bold">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT LABOR CONTRACTOR MODAL */}
      {registerContractorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1F5E3B]" />
                  <span>{myContractorProfile ? 'Edit Your Labor Contractor Profile' : 'Register Labor Contractor & Workforce Team'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Account Owner: <strong className="text-[#1F5E3B]">{user?.fullName || user?.name}</strong> (Linked to account)</p>
              </div>
              <button onClick={() => setRegisterContractorModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterContractor} className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 text-[#1F5E3B] dark:text-emerald-300 font-medium">
                {myContractorProfile
                  ? `✏️ Updating your existing contractor profile for ${user?.fullName || user?.name}. Changes publish live immediately.`
                  : `✓ Single account registration for ${user?.fullName || user?.name}. Fill details below to publish your labor team.`}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-600">Phone Number *</label>
                    <span className={`text-[10px] font-bold ${isPhoneValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isPhoneValid ? '✓ Valid' : '⚠️ Min 10 digits'}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="+91 94471 00000"
                    value={registerContractorForm.phone}
                    onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, phone: e.target.value })}
                    className={`w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold ${
                      isPhoneValid ? 'border-emerald-500' : 'border-amber-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-600">Available Workers Count *</label>
                    <span className={`text-[10px] font-bold ${isTeamSizeValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isTeamSizeValid ? `✓ ${registerContractorForm.teamSize} Workers` : '⚠️ Min 1 worker'}
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={registerContractorForm.teamSize}
                    onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, teamSize: Number(e.target.value) })}
                    className={`w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-black text-[#1F5E3B] ${
                      isTeamSizeValid ? 'border-emerald-500' : 'border-amber-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600">Company / Labor Team Name (Optional)</label>
                <input
                  type="text"
                  placeholder={`e.g. ${user?.fullName || user?.name}'s Highrange Labor Guild`}
                  value={registerContractorForm.companyName}
                  onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, companyName: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600">Primary District</label>
                  <input
                    type="text"
                    value={registerContractorForm.district}
                    onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, district: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600">Availability Status</label>
                  <select
                    value={registerContractorForm.availabilityStatus}
                    onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, availabilityStatus: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="Available for Contracts">🟢 Available for Contracts</option>
                    <option value="Fully Booked">🟡 Fully Booked</option>
                    <option value="Offline">🔴 Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600">Min Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={registerContractorForm.dailyWageMin}
                    onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, dailyWageMin: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-600">Max Daily Rate (₹)</label>
                    <span className={`text-[10px] font-bold ${isWageValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isWageValid ? '✓ Valid Rates' : '⚠️ Max ≥ Min'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={registerContractorForm.dailyWageMax}
                    onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, dailyWageMax: Number(e.target.value) })}
                    className={`w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl ${
                      isWageValid ? 'border-slate-200' : 'border-amber-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600">Preferred Work Areas</label>
                <input
                  type="text"
                  placeholder="Idukki, Wayanad, Palakkad"
                  value={registerContractorForm.preferredDistricts}
                  onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, preferredDistricts: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600">Services & Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Cardamom Capsule Picking, Shade Pruning, Soil Tilling"
                  value={registerContractorForm.specialization}
                  onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, specialization: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600">Team Description / Bio</label>
                <textarea
                  placeholder="Describe your labor team experience and capacity..."
                  value={registerContractorForm.bio}
                  onChange={(e) => setRegisterContractorForm({ ...registerContractorForm, bio: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setRegisterContractorModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  disabled={!isContractorFormValid}
                  className={`flex-1 py-2.5 text-white rounded-xl font-bold transition ${
                    isContractorFormValid ? 'bg-[#1F5E3B] hover:bg-[#17482D]' : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  {myContractorProfile ? 'Save & Update Profile' : 'Register & Publish to Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD / REGISTER WORKER PROFILE MODAL */}
      {registerWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 my-8 border border-[#2E7D32]/30">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-[#17331F] dark:text-emerald-400 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#1B5E20]" />
                  <span>Upload Plantation Worker Profile & Details</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Publish your worker listing to Cardora MongoDB Directory</p>
              </div>
              <button onClick={() => setRegisterWorkerModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterWorker} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Joykutty Joseph"
                    value={registerWorkerForm.fullName}
                    onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, fullName: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                  <input
                    type="text"
                    placeholder="+91 98470 00000"
                    value={registerWorkerForm.phone}
                    onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, phone: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">District *</label>
                  <select
                    value={registerWorkerForm.district}
                    onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, district: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="Idukki">Idukki</option>
                    <option value="Wayanad">Wayanad</option>
                    <option value="Palakkad">Palakkad</option>
                    <option value="Pathanamthitta">Pathanamthitta</option>
                    <option value="Kottayam">Kottayam</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Village / Panchayath</label>
                  <input
                    type="text"
                    placeholder="Vandanmedu, Nedumkandam, Kattappana"
                    value={registerWorkerForm.village}
                    onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, village: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Daily Wage (₹) *</label>
                  <input
                    type="number"
                    placeholder="850"
                    value={registerWorkerForm.dailyWage}
                    onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, dailyWage: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Availability Status</label>
                  <select
                    value={registerWorkerForm.availability}
                    onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, availability: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="Available Today">Available Today 🟢</option>
                    <option value="Available Next Week">Available Next Week 🟡</option>
                    <option value="On Contract">On Contract 🔴</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Primary Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="Cardamom Capsule Picking, Shade Pruning, Soil Testing, Chemical Spray"
                  value={registerWorkerForm.skills}
                  onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, skills: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={registerWorkerForm.photo}
                  onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, photo: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Bio & Experience Summary</label>
                <textarea
                  placeholder="Describe your cardamom harvesting experience, daily capacity, and special skills..."
                  value={registerWorkerForm.bio}
                  onChange={(e) => setRegisterWorkerForm({ ...registerWorkerForm, bio: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setRegisterWorkerModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl font-bold transition shadow-md"
                >
                  Upload & Publish Worker Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkforceModule;
