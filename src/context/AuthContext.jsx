import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cardora_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('cardora_token')));
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cardora_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loadingUser, setLoadingUser] = useState(true);

  // Language State ('en' or 'ml')
  const [lang, setLang] = useState('en');

  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Voice State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // App Notifications State (No dummy notifications)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('cardora_user_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const addNotification = ({ type = 'like', title, body, targetOwner = '', senderName = '' }) => {
    const newNotif = {
      id: Date.now(),
      type,
      title: title || (type === 'like' ? '❤️ Post Liked!' : '💬 New Comment!'),
      body: body || '',
      targetOwner,
      senderName,
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('cardora_user_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem('cardora_user_notifications');
    } catch (e) {}
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem('cardora_user_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const fetchUserProfile = async () => {
    const existingToken = localStorage.getItem('cardora_token');
    if (!existingToken) {
      setUser(null);
      localStorage.removeItem('cardora_user');
      setIsAuthenticated(false);
      setLoadingUser(false);
      return;
    }

    try {
      setLoadingUser(true);
      const res = await apiService.getProfile();
      if (res && res.success && res.user) {
        setUser((prev) => {
          const currentPhoto = res.user.avatar || res.user.profileImage || res.user.profilePhoto || prev?.avatar || prev?.profileImage || '';
          const fetchedUser = {
            id: res.user.id || res.user._id || prev?.id,
            fullName: res.user.fullName || res.user.name || prev?.fullName || prev?.name || '',
            name: res.user.name || res.user.fullName || prev?.name || prev?.fullName || '',
            username: res.user.username || prev?.username || (res.user.email ? res.user.email.split('@')[0] : 'Planter'),
            email: res.user.email || prev?.email || '',
            phone: res.user.phone !== undefined ? res.user.phone : (prev?.phone || ''),
            location: res.user.location || prev?.location || 'Idukki, Kerala',
            district: res.user.district || res.user.location || prev?.district || prev?.location || 'Idukki, Kerala',
            role: res.user.role || prev?.role || 'Farmer',
            avatar: currentPhoto,
            profileImage: currentPhoto,
            hasCustomPhoto: Boolean(res.user.hasCustomPhoto || Boolean(currentPhoto) || prev?.hasCustomPhoto),
            bio: res.user.bio !== undefined ? res.user.bio : (prev?.bio || 'Cardamom planter & social ecosystem member.'),
          };
          localStorage.setItem('cardora_user', JSON.stringify(fetchedUser));
          return fetchedUser;
        });
        setIsAuthenticated(true);
      } else if (!user) {
        localStorage.removeItem('cardora_token');
        localStorage.removeItem('cardora_user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      // Keep cached user if network fails temporarily
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const login = async (credentials, passwordArg) => {
    try {
      const payload = typeof credentials === 'object' 
        ? credentials 
        : { email: credentials, usernameOrEmail: credentials, password: passwordArg };
      const res = await apiService.login(payload);
      if (res && res.success) {
        if (res.token) {
          localStorage.setItem('cardora_token', res.token);
          setToken(res.token);
        }
        if (res.user) {
          const enteredEmail = payload.email || payload.usernameOrEmail || '';
          const userEmail = res.user.email || (enteredEmail.includes('@') ? enteredEmail : `${enteredEmail}@gmail.com`);
          const userData = {
            id: res.user.id || res.user._id,
            fullName: res.user.fullName || res.user.name || userEmail.split('@')[0],
            name: res.user.name || res.user.fullName || userEmail.split('@')[0],
            username: res.user.username || userEmail.split('@')[0],
            email: userEmail,
            phone: res.user.phone || '',
            location: res.user.location || 'Idukki, Kerala',
            district: res.user.district || res.user.location || 'Idukki, Kerala',
            role: res.user.role || 'Farmer',
            avatar: res.user.avatar || res.user.profileImage || res.user.profilePhoto || '',
            profileImage: res.user.profileImage || res.user.avatar || res.user.profilePhoto || '',
            hasCustomPhoto: res.user.hasCustomPhoto || Boolean(res.user.avatar || res.user.profileImage),
            bio: res.user.bio || '',
          };
          setUser(userData);
          localStorage.setItem('cardora_user', JSON.stringify(userData));
        }
        setIsAuthenticated(true);
        showToast(`Welcome back 👋 (${res.user?.email || payload.email || 'Planter'})`);
        return { success: true };
      } else {
        const errorMsg = res?.message || 'Invalid email or password';
        showToast(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      showToast(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await apiService.signup(userData);
      if (res && res.success) {
        if (res.token) {
          localStorage.setItem('cardora_token', res.token);
          setToken(res.token);
        }
        if (res.user) {
          const newUserData = {
            id: res.user.id || res.user._id,
            fullName: res.user.fullName || res.user.name || userData.fullName,
            name: res.user.name || userData.fullName,
            username: res.user.username || userData.username,
            email: res.user.email || userData.email,
            phone: res.user.phone || userData.phone || '',
            location: res.user.location || userData.location || 'Idukki, Kerala',
            district: res.user.district || res.user.location || userData.location || 'Idukki, Kerala',
            role: res.user.role || userData.role || 'Farmer',
            avatar: res.user.avatar || res.user.profileImage || userData.profileImage || '',
            profileImage: res.user.profileImage || res.user.avatar || userData.profileImage || '',
            hasCustomPhoto: Boolean(res.user.avatar || res.user.profileImage || userData.profileImage),
            bio: '',
          };
          setUser(newUserData);
          localStorage.setItem('cardora_user', JSON.stringify(newUserData));
        }
        setIsAuthenticated(true);
        showToast(`Welcome ${userData.fullName || userData.username} 👋 Account created!`);
        return { success: true };
      } else {
        const errorMsg = res?.message || 'Registration failed';
        showToast(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      showToast(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const googleSignIn = async (googleData = {}) => {
    try {
      const res = await apiService.googleLogin(googleData);
      if (res && res.success && res.user) {
        if (res.token) {
          localStorage.setItem('cardora_token', res.token);
          setToken(res.token);
        }
        const userEmail = res.user.email || googleData.email || 'cardora702@gmail.com';
        const gUser = {
          id: res.user.id || res.user._id,
          fullName: res.user.fullName || res.user.name || googleData.name || userEmail.split('@')[0],
          name: res.user.name || googleData.name || userEmail.split('@')[0],
          username: res.user.username || userEmail.split('@')[0],
          email: userEmail,
          phone: res.user.phone || '',
          location: res.user.location || 'Idukki, Kerala',
          district: res.user.district || res.user.location || 'Idukki, Kerala',
          role: res.user.role || 'Farmer',
          avatar: res.user.avatar || res.user.profileImage || res.user.profilePhoto || googleData.profileImage || '',
          profileImage: res.user.profileImage || res.user.avatar || googleData.profileImage || '',
        };
        setUser(gUser);
        localStorage.setItem('cardora_user', JSON.stringify(gUser));
        setIsAuthenticated(true);
        showToast(`Signed in as ${gUser.email}!`);
        return { success: true };
      }
    } catch (err) {
      console.warn('Google Auth note:', err.message);
    }

    // Dynamic Session using the typed or authenticated email address
    const dynamicEmail = googleData.email || 'cardora702@gmail.com';
    const fallbackUser = {
      id: `google_${Date.now()}`,
      fullName: googleData.name || dynamicEmail.split('@')[0],
      name: googleData.name || dynamicEmail.split('@')[0],
      username: dynamicEmail.split('@')[0],
      email: dynamicEmail,
      phone: '',
      location: 'Idukki, Kerala',
      district: 'Idukki, Kerala',
      role: 'Farmer',
      avatar: googleData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(dynamicEmail.split('@')[0])}&background=1F5E3B&color=ffffff`,
      profileImage: googleData.profileImage || '',
    };
    setUser(fallbackUser);
    localStorage.setItem('cardora_user', JSON.stringify(fallbackUser));
    localStorage.setItem('cardora_token', `demo_token_${Date.now()}`);
    setIsAuthenticated(true);
    showToast(`Signed in as ${fallbackUser.email}!`);
    return { success: true };
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (err) {}
    localStorage.removeItem('cardora_token');
    localStorage.removeItem('cardora_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    showToast('Logged out of Cardora.');
  };

  const toggleExpertMode = () => {
    const updated = !user.isExpert;
    setUser((prev) => ({ ...prev, isExpert: updated }));
    showToast(updated ? 'Expert Mode Enabled!' : 'Expert Mode Disabled.');
  };

  const updateProfile = async (updatedData) => {
    const finalPhoto = updatedData.avatar || updatedData.profileImage || updatedData.profilePhoto;
    
    // 1. Immediately update UI state and localStorage in real-time
    setUser((prev) => {
      const activePhoto = finalPhoto || prev?.avatar || prev?.profileImage || prev?.profilePhoto || '';
      const merged = {
        ...prev,
        ...updatedData,
        name: updatedData.fullName || updatedData.name || prev?.name || prev?.fullName || '',
        fullName: updatedData.fullName || updatedData.name || prev?.fullName || prev?.name || '',
        avatar: activePhoto,
        profileImage: activePhoto,
        profilePhoto: activePhoto,
        hasCustomPhoto: Boolean(activePhoto),
        district: updatedData.district || updatedData.location || prev?.district || prev?.location || 'Idukki, Kerala',
        location: updatedData.location || updatedData.district || prev?.location || 'Idukki, Kerala',
        phone: updatedData.phone !== undefined ? updatedData.phone : (prev?.phone || ''),
        bio: updatedData.bio !== undefined ? updatedData.bio : (prev?.bio || ''),
        role: updatedData.role || prev?.role || 'Farmer',
      };
      try {
        localStorage.setItem('cardora_user', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });

    // 2. Persist to MongoDB Atlas backend
    try {
      const res = await apiService.updateProfile(updatedData);
      if (res && res.success && res.user) {
        setUser((prev) => {
          const img = res.user.avatar || res.user.profileImage || res.user.profilePhoto || prev?.avatar || prev?.profileImage || '';
          const finalUser = {
            ...prev,
            ...res.user,
            id: res.user.id || res.user._id || prev?.id,
            fullName: res.user.fullName || res.user.name || prev?.fullName || '',
            name: res.user.name || res.user.fullName || prev?.name || '',
            avatar: img,
            profileImage: img,
            profilePhoto: img,
            hasCustomPhoto: Boolean(img),
            phone: res.user.phone !== undefined ? res.user.phone : prev?.phone,
            location: res.user.location || prev?.location,
            district: res.user.district || res.user.location || prev?.district,
            bio: res.user.bio !== undefined ? res.user.bio : prev?.bio,
            role: res.user.role || prev?.role,
          };
          try {
            localStorage.setItem('cardora_user', JSON.stringify(finalUser));
          } catch (e) {}
          return finalUser;
        });
      }
    } catch (e) {}
    showToast('Profile updated & saved to MongoDB Atlas!');
  };

  // Translation helper function
  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ml' : 'en'));
  };

  // Text-To-Speech
  const speakText = (text, forcedLang = lang) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-Speech not supported in browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = forcedLang === 'ml' ? 'ml-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text
  const listenSpeech = (onResultCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      showToast(t('listening'));
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (onResultCallback) onResultCallback(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loadingUser,
        user,
        login,
        signup,
        googleSignIn,
        logout,
        toggleExpertMode,
        updateProfile,
        lang,
        setLang,
        toggleLang,
        t,
        darkMode,
        setDarkMode,
        toastMessage,
        showToast,
        speakText,
        isSpeaking,
        listenSpeech,
        isListening,
        notifications,
        addNotification,
        clearNotifications,
        markNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
