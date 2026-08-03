const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get Chat Conversations list for logged-in user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
      deletedFor: { $ne: currentUserId },
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username avatar profilePhoto role location')
      .populate('recipient', 'name username avatar profilePhoto role location');

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.toString() === currentUserId.toString();
      const partner = isSender ? msg.recipient : msg.sender;
      if (!partner || !partner._id) return;

      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          user: {
            id: partner._id,
            _id: partner._id,
            name: partner.name,
            username: partner.username,
            avatar: partner.avatar || partner.profilePhoto || '',
            role: partner.role || 'Farmer',
            location: partner.location || 'Idukki, Kerala',
          },
          lastMessage: {
            text: msg.text || (msg.audioUrl ? '🎵 Voice Message' : '📷 Image Attachment'),
            createdAt: msg.createdAt,
            senderId: msg.sender._id,
            read: msg.read,
          },
          unreadCount: 0,
        });
      }

      if (!msg.read && msg.recipient._id.toString() === currentUserId.toString()) {
        const conv = conversationMap.get(partnerId);
        conv.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Message thread with specific target user
// @route   GET /api/messages/:userId
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const targetUserId = req.params.userId;

    const targetUser = await User.findById(targetUserId).select('name username avatar profilePhoto role location privacy');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mark messages from targetUser to currentUserId as read
    await Message.updateMany(
      { sender: targetUserId, recipient: currentUserId, read: false },
      { read: true }
    );

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
      deletedFor: { $ne: currentUserId },
    }).sort({ createdAt: 1 });

    const formattedMessages = messages.map((m) => ({
      id: m._id,
      _id: m._id,
      senderId: m.sender.toString(),
      recipientId: m.recipient.toString(),
      isMine: m.sender.toString() === currentUserId.toString(),
      text: m.text,
      attachments: m.attachments || [],
      audioUrl: m.audioUrl || '',
      read: m.read,
      createdAt: m.createdAt,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    res.status(200).json({
      success: true,
      partner: {
        id: targetUser._id,
        _id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
        avatar: targetUser.avatar || targetUser.profilePhoto || '',
        role: targetUser.role || 'Farmer',
        location: targetUser.location || 'Idukki, Kerala',
      },
      messages: formattedMessages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a 1-to-1 message (text, images, voice recording)
// @route   POST /api/messages/:userId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const targetUserId = req.params.userId;
    const { text, attachments, audioUrl } = req.body;

    if (!text && (!attachments || attachments.length === 0) && !audioUrl) {
      return res.status(400).json({ success: false, message: 'Cannot send empty message' });
    }

    const [recipient, sender] = await Promise.all([
      User.findById(targetUserId),
      User.findById(currentUserId),
    ]);

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    // Check if recipient has blocked sender
    if (recipient.blockedUsers && recipient.blockedUsers.some((id) => id.toString() === currentUserId.toString())) {
      return res.status(403).json({ success: false, message: 'Unable to send message to this user.' });
    }

    const newMsg = await Message.create({
      sender: currentUserId,
      recipient: targetUserId,
      text: text || '',
      attachments: attachments || [],
      audioUrl: audioUrl || '',
      read: false,
    });

    // Generate Notification
    await Notification.create({
      user: targetUserId,
      sender: currentUserId,
      type: 'message',
      title: '💬 New Message',
      message: `${sender.name} sent you a message: "${(text || 'Attachment').slice(0, 45)}"`,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: {
        id: newMsg._id,
        _id: newMsg._id,
        senderId: currentUserId.toString(),
        recipientId: targetUserId.toString(),
        isMine: true,
        text: newMsg.text,
        attachments: newMsg.attachments,
        audioUrl: newMsg.audioUrl,
        read: false,
        createdAt: newMsg.createdAt,
        time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete message for current user
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { messageId } = req.params;

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (!msg.deletedFor.includes(currentUserId)) {
      msg.deletedFor.push(currentUserId);
      await msg.save();
    }

    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block or Unblock user
// @route   POST /api/messages/block/:userId
// @access  Private
exports.blockUser = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (!currentUser.blockedUsers) currentUser.blockedUsers = [];

    const isBlocked = currentUser.blockedUsers.some((id) => id.toString() === userId.toString());

    if (isBlocked) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter((id) => id.toString() !== userId.toString());
      await currentUser.save({ validateBeforeSave: false });
      return res.status(200).json({ success: true, isBlocked: false, message: 'User unblocked' });
    } else {
      currentUser.blockedUsers.push(userId);
      await currentUser.save({ validateBeforeSave: false });
      return res.status(200).json({ success: true, isBlocked: true, message: 'User blocked' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
