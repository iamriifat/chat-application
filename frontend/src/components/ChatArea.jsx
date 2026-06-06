import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Smile, Paperclip, Image as ImageIcon, FileText, Download, Loader2, ArrowLeft } from 'lucide-react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
  '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
  '🤗', '🤔', '🫣', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠',
  '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '👋', '👌', '✌️', '👍', '👎', '👏', '🙌',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💖', '💗', '💓', '🌟', '⭐', '✨', '⚡', '💥', '🔥', '🎉', '🎁'
];

const ChatArea = () => {
  const { user } = useAuth();
  const { activeContact, messages, sendMessage, setActiveContact } = useSocket();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  if (!activeContact) {
    return (
      <div className="chat-empty-state">
        <div className="empty-graphic">
          <div className="empty-icon-ring">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4aa" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="empty-ring empty-ring-1" />
          <div className="empty-ring empty-ring-2" />
        </div>
        <h2>Your secure workspace</h2>
        <p>Select a contact from the sidebar to start a real-time conversation.</p>
      </div>
    );
  }

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    const emojiRegex = /^(\s*[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]\s*)+$/gu;
    const isEmoji = emojiRegex.test(inputText.trim());
    sendMessage(isEmoji ? 2 : 1, activeContact.id, inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  const handleFileUpload = async (e, type) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('/api/files/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const fileData = await response.json();
        const isImage = selectedFile.type.startsWith('image/') || type === 'image';
        sendMessage(isImage ? 4 : 3, activeContact.id, selectedFile.name, fileData.id);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getAvatarInfo = (username, gender) => {
    const initials = username.substring(0, 2).toUpperCase();
    let gradient = 'linear-gradient(135deg, #1e3c72, #2a5298)';
    if (gender === 'Female') gradient = 'linear-gradient(135deg, #ec008c, #fc6767)';
    else if (gender === 'Other') gradient = 'linear-gradient(135deg, #f59e0b, #ef4444)';
    else if (gender === 'Male') gradient = 'linear-gradient(135deg, #00d4aa, #0ea5e9)';
    return { initials, gradient };
  };

  const avatar = getAvatarInfo(activeContact.username, activeContact.gender);

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const formatMessageTime = (isoString) =>
    new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-area-container">
      {/* Header */}
      <div className="chat-header">
        <button type="button" onClick={() => setActiveContact(null)} className="btn-back-mobile" title="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="contact-profile">
          <div className="avatar-wrapper">
            <div className="chat-avatar" style={{ background: avatar.gradient }}>
              {avatar.initials}
            </div>
            <span className={`status-dot ${activeContact.status ? 'online' : 'offline'}`} />
          </div>
          <div className="chat-contact-details">
            <h3>{activeContact.username}</h3>
            <span className={activeContact.status ? 'status-online' : 'status-offline'}>
              {activeContact.status ? '● Online' : '○ Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date} className="date-group">
            <div className="date-header"><span>{date}</span></div>
            <div className="date-messages">
              {groupedMessages[date].map((msg) => {
                const isSentByMe = msg.from_user_id === user.id;
                const isEmojiMsg = msg.message_type === 2;
                const isImageMsg = msg.message_type === 4;
                const isFileMsg = msg.message_type === 3;

                return (
                  <div key={msg.id} className={`message-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`}>
                    <div className="message-meta-group">
                      <div className={`message-bubble ${isEmojiMsg ? 'emoji-only' : ''} ${isSentByMe ? 'sent-bubble' : 'received-bubble'}`}>
                        {!isImageMsg && !isFileMsg && (
                          <p className={isEmojiMsg ? 'large-emoji' : 'msg-text'}>{msg.text}</p>
                        )}

                        {isImageMsg && msg.file_record && (
                          <div className="image-message-container">
                            <img
                              src={msg.file_record.file_path}
                              alt="Shared attachment"
                              className="chat-shared-image"
                              onClick={() => window.open(msg.file_record.file_path, '_blank')}
                            />
                          </div>
                        )}

                        {isFileMsg && msg.file_record && (
                          <div className="file-message-card">
                            <div className="file-icon-box"><FileText size={22} /></div>
                            <div className="file-card-details">
                              <span className="file-name">{msg.file_record.file_name}</span>
                              <span className="file-ext">{msg.file_record.file_extension.toUpperCase()} File</span>
                            </div>
                            <a href={msg.file_record.file_path} download={msg.file_record.file_name} className="file-download-btn">
                              <Download size={15} />
                            </a>
                          </div>
                        )}
                      </div>
                      <span className="message-timestamp">{formatMessageTime(msg.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Panel */}
      <form onSubmit={handleSend} className="chat-input-panel">
        <div className="input-pill">
          <div className="input-actions-wrapper">
            <button type="button" className={`input-action-btn ${showEmojiPicker ? 'active' : ''}`} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile size={18} />
            </button>
            <button type="button" className="input-action-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Paperclip size={18} />
            </button>
            <button type="button" className="input-action-btn" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
              <ImageIcon size={18} />
            </button>
          </div>

          <input
            type="text"
            placeholder={uploading ? 'Uploading...' : 'Type a message...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={uploading}
            className="chat-text-input"
          />

          <button type="submit" className="btn-send" disabled={!inputText.trim() && !uploading}>
            {uploading ? <Loader2 size={17} className="spinner" /> : <Send size={17} />}
          </button>
        </div>

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'file')} />
        <input type="file" ref={imageInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'image')} />

        {showEmojiPicker && (
          <div className="emoji-picker-container glass-panel">
            <div className="emoji-grid">
              {EMOJIS.map((emoji, idx) => (
                <button key={idx} type="button" onClick={() => handleEmojiClick(emoji)} className="emoji-btn">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      <style>{`
        .chat-area-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          background: rgba(0, 0, 0, 0.1);
        }

        /* Empty state */
        .chat-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          gap: 20px;
        }

        .empty-graphic {
          position: relative;
          width: 110px; height: 110px;
          display: flex; align-items: center; justify-content: center;
        }

        .empty-icon-ring {
          position: relative; z-index: 2;
          width: 80px; height: 80px;
          border-radius: 28px;
          background: rgba(0, 212, 170, 0.06);
          border: 1px solid rgba(0, 212, 170, 0.15);
          display: flex; align-items: center; justify-content: center;
        }

        .empty-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0, 212, 170, 0.1);
          animation: ringPulse 3s infinite;
        }

        .empty-ring-1 { width: 100px; height: 100px; animation-delay: 0s; }
        .empty-ring-2 { width: 130px; height: 130px; animation-delay: 0.8s; }

        @keyframes ringPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.1; transform: scale(1.05); }
        }

        .chat-empty-state h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: -6px;
        }

        .chat-empty-state p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 340px;
          line-height: 1.6;
        }

        /* Header */
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.1);
        }

        .btn-back-mobile { display: none; }

        @media (max-width: 768px) {
          .btn-back-mobile {
            display: flex; align-items: center; justify-content: center;
            margin-right: 10px;
            width: 34px; height: 34px;
            border-radius: 9px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-glass);
            color: var(--text-secondary);
          }
        }

        .contact-profile { display: flex; align-items: center; gap: 12px; }

        .avatar-wrapper { position: relative; }

        .chat-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.88rem;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .status-dot {
          position: absolute; bottom: 0; right: 0;
          width: 11px; height: 11px;
          border-radius: 50%;
          border: 2px solid #0c101b;
        }
        .status-dot.online { background: var(--success-color); box-shadow: 0 0 6px var(--success-glow); }
        .status-dot.offline { background: #2d3748; }

        .chat-contact-details h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 2px; }
        .status-online { font-size: 0.75rem; color: var(--accent-primary); font-weight: 500; }
        .status-offline { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }

        /* Messages area */
        .chat-messages {
          flex: 1; overflow-y: auto;
          padding: 24px; display: flex; flex-direction: column; gap: 20px;
        }

        .date-group { display: flex; flex-direction: column; gap: 14px; }

        .date-header { text-align: center; margin: 6px 0; position: relative; }
        .date-header::before {
          content: '';
          position: absolute; left: 0; right: 0; top: 50%;
          height: 1px; background: var(--border-glass); z-index: 1;
        }
        .date-header span {
          position: relative; z-index: 2;
          background: #0c101b;
          padding: 4px 14px; border-radius: 10px;
          border: 1px solid var(--border-glass);
          font-size: 0.72rem; font-weight: 600; color: var(--text-muted);
        }

        .date-messages { display: flex; flex-direction: column; gap: 10px; }

        .message-bubble-wrapper { display: flex; width: 100%; }
        .message-bubble-wrapper.sent  { justify-content: flex-end; }
        .message-bubble-wrapper.received { justify-content: flex-start; }

        .message-meta-group {
          display: flex; flex-direction: column; max-width: 65%; gap: 4px;
        }
        .message-bubble-wrapper.sent .message-meta-group   { align-items: flex-end; }
        .message-bubble-wrapper.received .message-meta-group { align-items: flex-start; }

        .message-bubble {
          padding: 11px 16px;
          border-radius: 18px;
          font-size: 0.92rem; line-height: 1.55;
          word-break: break-word;
        }

        .sent-bubble {
          background: var(--accent-gradient);
          color: #040810;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 14px rgba(0, 212, 170, 0.2);
          font-weight: 500;
        }

        .received-bubble {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }

        .message-bubble.emoji-only {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .large-emoji { font-size: 2.4rem; line-height: 1; }
        .msg-text { margin: 0; }

        .message-timestamp { font-size: 0.7rem; color: var(--text-muted); }

        /* Image message */
        .image-message-container {
          border-radius: 14px; overflow: hidden;
          max-width: 260px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .chat-shared-image {
          width: 100%; height: auto; display: block;
          max-height: 260px; object-fit: cover;
          transition: transform 0.2s ease;
        }
        .chat-shared-image:hover { transform: scale(1.02); }

        /* File message */
        .file-message-card {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-glass);
          padding: 10px 14px; border-radius: 14px; min-width: 220px;
        }
        .file-icon-box {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(0, 212, 170, 0.1);
          color: var(--accent-primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .file-card-details { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .file-name {
          font-size: 0.83rem; font-weight: 600; color: var(--text-primary);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .file-ext { font-size: 0.72rem; color: var(--text-muted); }
        .file-download-btn {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-glass);
          transition: all 0.2s ease;
        }
        .file-download-btn:hover {
          background: var(--accent-gradient);
          color: #040810; border-color: transparent;
        }

        /* Input */
        .chat-input-panel {
          padding: 16px 20px;
          border-top: 1px solid var(--border-glass);
          position: relative;
          background: rgba(0,0,0,0.1);
        }

        .input-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-glass);
          border-radius: 18px;
          padding: 6px 6px 6px 10px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input-pill:focus-within {
          border-color: rgba(0, 212, 170, 0.35);
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.08);
        }

        .input-actions-wrapper { display: flex; gap: 2px; }

        .input-action-btn {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted);
          transition: all 0.15s ease;
        }
        .input-action-btn:hover, .input-action-btn.active {
          color: var(--accent-primary);
          background: rgba(0, 212, 170, 0.08);
        }

        .chat-text-input {
          flex: 1;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 6px 8px;
          font-size: 0.92rem;
          color: var(--text-primary);
          border-radius: 0;
          height: auto;
        }
        .chat-text-input:focus { box-shadow: none !important; border: none !important; }

        .btn-send {
          width: 38px; height: 38px; border-radius: 12px;
          background: var(--accent-gradient);
          color: #040810;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.25);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .btn-send:hover:not(:disabled) {
          background: var(--accent-gradient-hover);
          transform: scale(1.06);
          box-shadow: 0 6px 18px rgba(0, 212, 170, 0.35);
        }
        .btn-send:disabled {
          background: rgba(255,255,255,0.03);
          color: var(--text-muted);
          border: 1px solid var(--border-glass);
          box-shadow: none; cursor: not-allowed;
        }

        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Emoji picker */
        .emoji-picker-container {
          position: absolute;
          bottom: 78px; left: 20px;
          width: 300px; height: 230px;
          overflow-y: auto;
          padding: 14px;
          z-index: 100;
          animation: fadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .emoji-btn {
          font-size: 1.3rem;
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          border-radius: 8px;
          transition: all 0.1s ease;
        }
        .emoji-btn:hover {
          background: rgba(0, 212, 170, 0.1);
          transform: scale(1.18);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .chat-area-container { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ChatArea;
