import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, CheckCheck, Trash2 } from 'lucide-react';

const formatTime = (timeStr, createdAt) => {
  if (timeStr) return timeStr;
  if (createdAt) {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return '';
};

const MessageBubble = ({ message, isMine, partnerName, onDeleteMessage, darkMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formattedTime = formatTime(message.time, message.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col max-w-[85%] sm:max-w-[70%] font-sans my-1.5 ${
        isMine ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      {/* MESSAGE BUBBLE CONTAINER */}
      <div
        className={`p-3.5 rounded-2xl shadow-xs leading-relaxed text-xs sm:text-sm font-medium transition-all ${
          isMine
            ? 'bg-[#1F5E3B] text-white rounded-br-xs'
            : darkMode
            ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-xs'
            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs'
        }`}
      >
        {/* VOICE AUDIO MESSAGE */}
        {message.audioUrl && (
          <div className="flex items-center gap-3 py-1 px-1">
            <button
              onClick={toggleAudio}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer ${
                isMine ? 'bg-white text-[#1F5E3B]' : 'bg-[#1F5E3B] text-white'
              }`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              <span className={`text-[11px] font-extrabold block ${isMine ? 'text-emerald-100' : 'text-slate-600 dark:text-slate-300'}`}>
                🎵 Voice Recording
              </span>
              <div className={`h-1.5 rounded-full overflow-hidden ${isMine ? 'bg-emerald-900/50' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`h-full ${isPlaying ? 'animate-pulse bg-emerald-400' : 'bg-emerald-500'} w-3/4`} />
              </div>
            </div>

            <audio
              ref={audioRef}
              src={message.audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </div>
        )}

        {/* IMAGE ATTACHMENTS */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.attachments.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Attachment"
                className="max-w-full max-h-60 rounded-xl object-cover border border-black/10"
              />
            ))}
          </div>
        )}

        {/* TEXT CONTENT */}
        {message.text && (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}
      </div>

      {/* TIMESTAMP, READ STATUS & DELETE ACTION */}
      <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${
        isMine ? 'text-slate-400' : 'text-slate-400'
      }`}>
        <span>{formattedTime}</span>
        {isMine && (
          <CheckCheck className={`w-3.5 h-3.5 ${message.read ? 'text-[#1F5E3B] dark:text-emerald-400' : 'text-slate-400'}`} />
        )}
        {onDeleteMessage && (
          <button
            type="button"
            onClick={() => onDeleteMessage(message._id || message.id)}
            className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
            title="Delete Message"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

    </motion.div>
  );
};

export default MessageBubble;
