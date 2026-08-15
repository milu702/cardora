import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ConversationList from './ConversationList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import EmptyChatState from './EmptyChatState';
import NewChatModal from './NewChatModal';

const extractUserId = (u) => {
  if (!u) return null;
  if (typeof u === 'string') return u;
  if (u._id) return u._id.toString();
  if (u.id) return u.id.toString();
  if (u.user) return extractUserId(u.user);
  return null;
};

const MessagingModule = ({ initialTargetUser = null, onToast }) => {
  const { user: currentUser, darkMode } = useAuth();
  const currentUserId = extractUserId(currentUser);

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

  // Mobile View State: 'list' | 'chat'
  const [mobileView, setMobileView] = useState('list');

  // Fetch Conversations List
  const fetchConversations = async () => {
    try {
      const res = await apiService.getConversations();
      if (res && res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch Chat Messages with Active Partner
  const fetchMessagesForPartner = async (partnerId) => {
    if (!partnerId) return;
    setLoadingMessages(true);
    try {
      const res = await apiService.getChatMessages(partnerId);
      if (res && res.success) {
        setMessages(res.messages || []);
        if (res.partner && res.partner.name) {
          setActivePartner(res.partner);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle Initial Target User (e.g. passed from another page/modal)
  useEffect(() => {
    if (initialTargetUser) {
      const pId = extractUserId(initialTargetUser);
      if (pId) {
        if (typeof initialTargetUser === 'object') {
          setActivePartner(initialTargetUser);
        } else {
          setActivePartner({ id: pId, _id: pId, name: 'Cardora Planter', role: 'Farmer' });
        }
        setMobileView('chat');
        fetchMessagesForPartner(pId);
      }
    }
  }, [initialTargetUser]);

  // Polling Auto-Sync Every 6 Seconds
  useEffect(() => {
    const activePartnerId = extractUserId(activePartner);
    const interval = setInterval(() => {
      fetchConversations();
      if (activePartnerId) {
        apiService.getChatMessages(activePartnerId).then((res) => {
          if (res && res.success && Array.isArray(res.messages)) {
            setMessages(res.messages);
          }
        }).catch(() => {});
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activePartner]);

  // Select a conversation from Left Panel
  const handleSelectConversation = (conv) => {
    const partner = conv.user;
    const partnerId = extractUserId(partner);
    setActivePartner(partner);
    setMobileView('chat');
    fetchMessagesForPartner(partnerId);
  };

  // Select a user from NewChatModal
  const handleSelectUserFromModal = (userObj) => {
    const partnerId = extractUserId(userObj);
    setActivePartner(userObj);
    setMobileView('chat');
    fetchMessagesForPartner(partnerId);
    fetchConversations();
  };

  // Send Message
  const handleSendMessage = async (payload) => {
    const activePartnerId = extractUserId(activePartner);
    if (!activePartnerId) return;

    setSending(true);
    try {
      const res = await apiService.sendMessage(activePartnerId, payload);
      if (res && res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        fetchConversations();
      } else {
        if (onToast) onToast(res?.message || 'Failed to send message');
      }
    } catch (err) {
      if (onToast) onToast('Error sending message');
    } finally {
      setSending(false);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await apiService.deleteMessage(msgId);
      if (onToast) onToast('Message deleted');
    } catch (err) {
      if (onToast) onToast('Message deleted');
    }
    setMessages((prev) => prev.filter((m) => (m._id || m.id || '').toString() !== (msgId || '').toString()));
  };

  const activePartnerId = extractUserId(activePartner);

  return (
    <div className="w-full h-[calc(100vh-6rem)] min-h-[520px] max-h-[850px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden font-sans flex flex-col md:flex-row transition-colors">
      
      {/* ===== LEFT PANEL: CONVERSATIONS LIST (340px ON DESKTOP) ===== */}
      <div className={`w-full md:w-80 lg:w-96 h-full shrink-0 ${
        mobileView === 'chat' ? 'hidden md:flex' : 'flex'
      } flex-col`}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activePartnerId}
          onSelectConversation={handleSelectConversation}
          onOpenNewChatModal={() => setNewChatModalOpen(true)}
          loading={loadingConversations}
          darkMode={darkMode}
        />
      </div>

      {/* ===== RIGHT PANEL: CHAT AREA ===== */}
      <div className={`w-full md:flex-1 h-full ${
        mobileView === 'list' && !activePartnerId ? 'hidden md:flex' : 'flex'
      } flex-col bg-[#F8FAF7]/60 dark:bg-slate-950/60`}>
        
        {activePartner ? (
          <>
            {/* CHAT HEADER */}
            <ChatHeader
              partner={activePartner}
              onBack={() => setMobileView('list')}
              darkMode={darkMode}
            />

            {/* MESSAGES SCROLL AREA */}
            <MessageList
              messages={messages}
              loading={loadingMessages}
              partner={activePartner}
              currentUserId={currentUserId}
              onDeleteMessage={handleDeleteMessage}
              darkMode={darkMode}
            />

            {/* STICKY MESSAGE COMPOSER */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              sending={sending}
              darkMode={darkMode}
            />
          </>
        ) : (
          /* EMPTY CHAT SELECTION STATE */
          <EmptyChatState
            type={conversations.length === 0 ? 'noConversations' : 'noSelected'}
            onStartNewChat={() => setNewChatModalOpen(true)}
            darkMode={darkMode}
          />
        )}

      </div>

      {/* NEW CHAT USER DISCOVERY MODAL */}
      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onSelectUser={handleSelectUserFromModal}
        darkMode={darkMode}
      />

    </div>
  );
};

export default MessagingModule;
