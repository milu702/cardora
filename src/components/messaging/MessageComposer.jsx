import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Mic, X } from 'lucide-react';

const EMOJIS = ['🌿', '❤️', '👍', '👏', '🌧️', '🌾', '📍', '🤝', '☕', '💡', '🔥', '✅', ' Cardora '];

const MessageComposer = ({ onSendMessage, sending, darkMode }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          onSendMessage({ text: '🎵 Voice Message', audioUrl: base64Audio });
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is required to record voice messages.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onSendMessage({ text: text.trim() });
    setText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  return (
    <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0 relative transition-colors">
      
      {/* EMOJI PICKER POPUP */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-2 flex-wrap max-w-xs z-30 animate-in fade-in slide-in-from-bottom-2">
          {EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-lg p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 ml-auto"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* VOICE RECORDING OVERLAY */}
      {isRecording ? (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2 px-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-black font-poppins">Recording Voice Message... ({recordingTime}s)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelRecording}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStopRecording}
              className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 flex items-center gap-1 shadow-xs"
            >
              <Send size={13} />
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD COMPOSER FORM */
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl text-slate-500 hover:text-[#1F5E3B] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ${
              showEmojiPicker ? 'text-[#1F5E3B] dark:text-emerald-400 bg-emerald-50 dark:bg-slate-800' : ''
            }`}
            title="Quick Emojis"
          >
            <Smile size={18} />
          </button>

          <button
            type="button"
            onClick={handleStartRecording}
            className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Record Voice Message"
          >
            <Mic size={18} />
          </button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Press Enter to send)"
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1F5E3B] resize-none max-h-24 scrollbar-none"
          />

          <button
            type="submit"
            disabled={!text.trim() || sending}
            className={`p-3 rounded-2xl font-bold transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer ${
              text.trim() && !sending
                ? 'bg-[#1F5E3B] hover:bg-[#16442b] text-white active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send size={16} className={sending ? 'animate-pulse' : ''} />
          </button>

        </form>
      )}

    </div>
  );
};

export default MessageComposer;
