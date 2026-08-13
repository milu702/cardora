import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Mic, MicOff, CheckCheck, 
  Trash2, ShieldOff, Smile, Play, Pause, 
  Sparkles
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const QUICK_EMOJIS = ['🌿', '❤️', '👍', '👏', '🌧️', '🌾', '📍', '🤝', '☕', '💡'];

const extractUserId = (u) => {
  if (!u) return null;
  if (typeof u === 'string') return u;
  if (u._id) return u._id.toString();
  if (u.id) return u.id.toString();
  if (u.user) return extractUserId(u.user);
  return null;
};

const ChatDrawerModal = ({ targetUser, isOpen, onClose, onToast }) => {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(targetUser || null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Voice Message Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRefMap = useRef({});

  useEffect(() => {
    if (isOpen && targetUser) {
      const pId = extractUserId(targetUser);
      if (typeof targetUser === 'object' && targetUser !== null) {
        const pName = targetUser.companyName || targetUser.fullName || targetUser.name || targetUser.user?.name || 'Planter Partner';
        const pAvatar = targetUser.avatar || targetUser.photo || targetUser.user?.avatar || targetUser.profilePhoto || '';
        const pRole = targetUser.role || (targetUser.companyName ? 'Labor Contractor' : targetUser.fullName ? 'Worker' : 'Farmer');
        const pUsername = targetUser.username || targetUser.user?.username || 'planter';
        setActivePartner({
          _id: pId,
          id: pId,
          name: pName,
          avatar: pAvatar,
          role: pRole,
          username: pUsername,
        });
      } else {
        setActivePartner({ _id: pId, id: pId, name: 'Planter Partner', username: 'planter', role: 'Farmer' });
      }
    }
  }, [isOpen, targetUser]);

  const fetchConversations = async () => {
    try {
      const res = await apiService.getConversations();
      if (res && res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
      }
    } catch (err) {}
  };

  const fetchChatMessages = async (partnerId) => {
    if (!partnerId) return;
    setLoading(true);
    try {
      const res = await apiService.getChatMessages(partnerId);
      if (res && res.success) {
        setMessages(res.messages || []);
        if (res.partner && res.partner.name) {
          setActivePartner(res.partner);
        }
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const currentPartnerId = extractUserId(activePartner);

  useEffect(() => {
    let interval;
    if (isOpen && currentPartnerId) {
      fetchConversations();
      fetchChatMessages(currentPartnerId);
      interval = setInterval(() => {
        apiService.getChatMessages(currentPartnerId).then((res) => {
          if (res && res.success && Array.isArray(res.messages)) {
            setMessages(res.messages);
          }
        });
      }, 3500);
    } else if (isOpen) {
      fetchConversations();
      setLoading(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentPartnerId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (payload = {}) => {
    const textToSend = payload.text !== undefined ? payload.text : messageText;
    const pId = extractUserId(activePartner) || extractUserId(targetUser);
    if (!pId || (!textToSend.trim() && !payload.audioUrl && (!payload.attachments || payload.attachments.length === 0))) return;

    setSending(true);
    try {
      const res = await apiService.sendMessage(pId, {
        text: textToSend.trim(),
        attachments: payload.attachments || [],
        audioUrl: payload.audioUrl || '',
      });

      if (res && res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setMessageText('');
        setShowEmojiPicker(false);
        scrollToBottom();
        fetchConversations();
      } else {
        if (onToast) onToast(res?.message || 'Failed to send message');
      }
    } catch (err) {
      if (onToast) onToast(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ===== VOICE RECORDING HANDLERS =====
  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onToast) onToast('Microphone recording not supported in browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await handleSendMessage({ audioUrl: base64Audio, text: '🎵 Voice Message' });
        };
        // Stop audio tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      if (onToast) onToast('Microphone access denied or unavailable.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const toggleAudioPlay = (msgId, audioUrl) => {
    if (playingAudioId === msgId) {
      if (audioRefMap.current[msgId]) {
        audioRefMap.current[msgId].pause();
      }
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioRefMap.current[playingAudioId]) {
        audioRefMap.current[playingAudioId].pause();
      }
      if (!audioRefMap.current[msgId]) {
        audioRefMap.current[msgId] = new Audio(audioUrl);
        audioRefMap.current[msgId].onended = () => setPlayingAudioId(null);
      }
      audioRefMap.current[msgId].play();
      setPlayingAudioId(msgId);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await apiService.deleteMessage(msgId);
      setMessages(messages.filter((m) => m.id !== msgId && m._id !== msgId));
      if (onToast) onToast('Message deleted.');
    } catch (err) {}
  };

  const handleBlockUser = async () => {
    const partnerId = activePartner?._id || activePartner?.id;
    if (!partnerId) return;
    try {
      const res = await apiService.blockUser(partnerId);
      if (onToast) onToast(res?.message || 'Block action updated.');
    } catch (err) {}
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-[28px] border border-[#D7E6D5] dark:border-slate-800 shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden relative"
        >
          {/* ===== LEFT CONVERSATIONS LIST (Hidden on small screens when chatting) ===== */}
          <div className="w-full sm:w-80 border-r border-[#D7E6D5] dark:border-slate-800 flex flex-col bg-[#F8FAF7]/60 dark:bg-slate-900/60">
            
            <div className="p-4 border-b border-[#D7E6D5] dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-[#17331F] dark:text-white font-poppins flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1F5E3B]" />
                <span>Messages</span>
              </h3>
              <button onClick={onClose} className="sm:hidden text-[#4A5568] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length > 0 ? (
                conversations.map((conv) => {
                  const isActive = (conv.user._id || conv.user.id) === (activePartner?._id || activePartner?.id);
                  return (
                    <button
                      key={conv.user.id || conv.user._id}
                      onClick={() => {
                        setActivePartner(conv.user);
                        fetchChatMessages(conv.user.id || conv.user._id);
                      }}
                      className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1F5E3B] text-white shadow-md'
                          : 'hover:bg-white dark:hover:bg-slate-800 text-[#17331F] dark:text-slate-200'
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={conv.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user.name)}&background=1F5E3B&color=ffffff`} 
                          alt="" 
                          className="w-11 h-11 rounded-full object-cover border border-white/20"
                        />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-[#17331F] dark:text-white'}`}>
                            {conv.user.name}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] truncate font-medium ${isActive ? 'text-white/80' : 'text-[#4A5568] dark:text-slate-400'}`}>
                          {conv.lastMessage?.text}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4 text-xs font-bold text-[#4A5568]">
                  🌿 No active conversations. Start chatting with planters!
                </div>
              )}
            </div>

          </div>

          {/* ===== RIGHT CHAT WINDOW ===== */}
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 relative">
            
            {/* Target Partner Header */}
            {activePartner ? (
              <div className="p-4 border-b border-[#D7E6D5] dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3">
                  <img 
                    src={activePartner.avatar || activePartner.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.name || 'User')}&background=1F5E3B&color=ffffff`} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#1F5E3B]"
                  />
                  <div>
                    <h4 className="text-sm font-black text-[#17331F] dark:text-white font-poppins">{activePartner.name}</h4>
                    <p className="text-[10px] text-[#5C8D4E] font-bold">@{activePartner.username || 'planter'} • {activePartner.role || 'Farmer'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={handleBlockUser} className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors" title="Block User">
                    <ShieldOff className="w-4 h-4" />
                  </button>
                  <button onClick={onClose} className="p-2 rounded-xl text-[#4A5568] hover:bg-[#F8FAF7]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-[#D7E6D5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A5568]">Select a conversation to message</span>
                <button onClick={onClose}><X className="w-5 h-5" /></button>
              </div>
            )}

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAF7]/30 dark:bg-slate-900/30">
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-[#1F5E3B] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-xs font-bold text-[#17331F]">Loading message history...</span>
                </div>
              ) : messages.length > 0 ? (
                messages.map((m) => {
                  const isMine = m.isMine || m.senderId === (currentUser?.id || currentUser?._id)?.toString();
                  return (
                    <div 
                      key={m.id || m._id} 
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[78%] p-3.5 rounded-2xl space-y-2 relative group shadow-sm ${
                        isMine 
                          ? 'bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-slate-100 rounded-bl-none'
                      }`}>
                        
                        {/* Text */}
                        {m.text && <p className="text-xs font-medium leading-relaxed">{m.text}</p>}

                        {/* Image Attachments */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="space-y-1">
                            {m.attachments.map((img, iIdx) => (
                              <img key={iIdx} src={img} alt="" className="max-h-48 rounded-xl object-cover" />
                            ))}
                          </div>
                        )}

                        {/* Voice Audio Player */}
                        {m.audioUrl && (
                          <div className="flex items-center gap-2.5 bg-black/10 p-2 rounded-xl">
                            <button 
                              type="button" 
                              onClick={() => toggleAudioPlay(m.id || m._id, m.audioUrl)}
                              className="p-2 rounded-full bg-white text-[#1F5E3B] shadow-sm cursor-pointer"
                            >
                              {playingAudioId === (m.id || m._id) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-[#1F5E3B]" />}
                            </button>
                            <span className="text-[11px] font-bold">Voice Clip</span>
                          </div>
                        )}

                        {/* Timestamp & Read Receipt */}
                        <div className={`flex items-center justify-end gap-1 text-[9px] font-bold ${isMine ? 'text-white/80' : 'text-[#4A5568]'}`}>
                          <span>{m.time}</span>
                          {isMine && (
                            <CheckCheck className={`w-3.5 h-3.5 ${m.read ? 'text-cyan-300' : 'text-white/60'}`} />
                          )}
                        </div>

                        {/* Delete Action */}
                        <button
                          onClick={() => handleDeleteMessage(m.id || m._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-7 top-2 text-red-500 hover:text-red-700 p-1"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-xs text-[#4A5568] font-bold">
                  💬 No messages yet. Say hello to @{activePartner?.username || 'planter'}!
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="p-2.5 bg-[#F8FAF7] border-t border-[#D7E6D5] flex items-center gap-2 overflow-x-auto">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMessageText((prev) => prev + emoji)}
                    className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Controls Bar */}
            {activePartner && (
              <div className="p-3 border-t border-[#D7E6D5] dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-[#4A5568] hover:text-[#1F5E3B] transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Voice Message Recorder Button */}
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`p-2 rounded-full transition-all ${
                    isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-[#4A5568] hover:text-[#1F5E3B]'
                  }`}
                  title={isRecording ? `Recording... (${recordingTime}s)` : 'Record Voice Message'}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isRecording ? `Recording audio... (${recordingTime}s)` : 'Type a message...'}
                  className="flex-1 px-4 py-2.5 rounded-full text-xs font-medium bg-[#F8FAF7] dark:bg-slate-800 border border-[#D7E6D5] dark:border-slate-700 text-[#17331F] dark:text-white focus:outline-none focus:border-[#1F5E3B]"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={sending || !messageText.trim()}
                  className="p-2.5 rounded-full bg-[#1F5E3B] hover:bg-[#5C8D4E] text-white disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                </motion.button>

              </div>
            )}

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};

export default ChatDrawerModal;
