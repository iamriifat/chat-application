import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Smile, Paperclip, Image as ImageIcon, FileText, Download, Loader2, ArrowLeft } from 'lucide-react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
  '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
  '🤗', '🤔', '🫣', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫨', '🫠', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠',
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

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!activeContact) {
    return (
      <div className="chat-empty-state">
        <div className="empty-graphic">
          <svg viewBox="0 0 24 24" width="72" height="72" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="empty-svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h2>Secure Chat Workspace</h2>
        <p>Select a contact from the sidebar list to retrieve your chat history and start messaging in real-time.</p>
      </div>
    );
  }

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    // Detect if input is entirely an emoji
    const emojiRegex = /^(\s*[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{2139}\u{24C2}\u{1F190}\u{1F192}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]\s*)+$/gu;
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
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const fileData = await response.json();
        // Determine message type (3: FILE, 4: IMAGE)
        const isImage = selectedFile.type.startsWith('image/') || type === 'image';
        sendMessage(isImage ? 4 : 3, activeContact.id, selectedFile.name, fileData.id);
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
      // Reset input value to allow uploading same file again
      e.target.value = '';
    }
  };

  // Get avatar styling and initials based on username & gender
  const getAvatarInfo = (username, gender) => {
    const initials = username.substring(0, 2).toUpperCase();
    let gradient = 'linear-gradient(135deg, #1e3c72, #2a5298)'; // Default
    
    if (gender === 'Female') {
      gradient = 'linear-gradient(135deg, #ec008c, #fc6767)';
    } else if (gender === 'Other') {
      gradient = 'linear-gradient(135deg, #f12711, #f5af19)';
    } else if (gender === 'Male') {
      gradient = 'linear-gradient(135deg, #4facfe, #00f2fe)';
    }

    return { initials, gradient };
  };

  const avatar = getAvatarInfo(activeContact.username, activeContact.gender);

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const formatMessageTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-area-container">
      {/* Header */}
      <div className="chat-header">
        <button type="button" onClick={() => setActiveContact(null)} className="btn-back-mobile" title="Back to chats">
          <ArrowLeft size={20} />
        </button>
        <div className="contact-profile">
          <div className="avatar-wrapper">
            <div className="avatar-circle" style={{ background: avatar.gradient }}>
              {avatar.initials}
            </div>
            <span className={`status-dot ${activeContact.status ? 'online' : 'offline'}`}></span>
          </div>
          <div className="chat-contact-details">
            <h3>{activeContact.username}</h3>
            <span>{activeContact.status ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div className="chat-messages">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date} className="date-group">
            <div className="date-header">
              <span>{date}</span>
            </div>
            <div className="date-messages">
              {groupedMessages[date].map((msg) => {
                const isSentByMe = msg.from_user_id === user.id;
                const isEmojiMsg = msg.message_type === 2;
                const isImageMsg = msg.message_type === 4;
                const isFileMsg = msg.message_type === 3;

                return (
                  <div
                    key={msg.id}
                    className={`message-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`}
                  >
                    <div className="message-meta-group">
                      <div
                        className={`message-bubble ${isEmojiMsg ? 'emoji-only' : ''} ${
                          isSentByMe ? 'sent-bubble' : 'received-bubble'
                        }`}
                      >
                        {/* Render standard text */}
                        {!isImageMsg && !isFileMsg && (
                          <p className={isEmojiMsg ? 'large-emoji' : 'msg-text'}>{msg.text}</p>
                        )}

                        {/* Render Image Message */}
                        {isImageMsg && msg.file_record && (
                          <div className="image-message-container">
                            <img
                              src={msg.file_record.file_path}
                              alt="Shared attachment"
                              style={{
                                backgroundImage: msg.file_record.blur_hash ? `url(${msg.file_record.blur_hash})` : 'none',
                                backgroundSize: 'cover'
                              }}
                              className="chat-shared-image"
                              onClick={() => window.open(msg.file_record.file_path, '_blank')}
                            />
                          </div>
                        )}

                        {/* Render File Message */}
                        {isFileMsg && msg.file_record && (
                          <div className="file-message-card">
                            <div className="file-icon-box">
                              <FileText size={24} />
                            </div>
                            <div className="file-card-details">
                              <span className="file-name">{msg.file_record.file_name}</span>
                              <span className="file-ext">{msg.file_record.file_extension.toUpperCase()} File</span>
                            </div>
                            <a
                              href={msg.file_record.file_path}
                              download={msg.file_record.file_name}
                              className="file-download-btn"
                              title="Download file"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        )}
                      </div>
                      <span className="message-timestamp">
                        {formatMessageTime(msg.created_at)}
                      </span>
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
        <div className="input-actions-wrapper">
          {/* Emojis Trigger */}
          <button
            type="button"
            className={`input-action-btn ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>
          
          {/* File input */}
          <button
            type="button"
            className="input-action-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip size={20} />
          </button>
          
          {/* Image input shortcut */}
          <button
            type="button"
            className="input-action-btn"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon size={20} />
          </button>

          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e, 'file')}
          />
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e, 'image')}
          />
        </div>

        {/* TextInput */}
        <div className="chat-input-wrapper">
          <input
            type="text"
            placeholder={uploading ? 'Uploading attachment...' : 'Type your message...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={uploading}
          />
        </div>

        {/* Send Trigger */}
        <button
          type="submit"
          className="btn-send"
          disabled={!inputText.trim() && !uploading}
        >
          {uploading ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
        </button>

        {/* Inline Emoji Picker Drawer */}
        {showEmojiPicker && (
          <div className="emoji-picker-container glass-panel">
            <div className="emoji-grid">
              {EMOJIS.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="emoji-btn"
                >
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
          background: rgba(0,0,0,0.15);
          position: relative;
        }

        .chat-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-graphic {
          width: 120px;
          height: 120px;
          border-radius: 40px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: var(--text-secondary);
        }

        .chat-empty-state h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .chat-empty-state p {
          font-size: 0.95rem;
          max-width: 460px;
          line-height: 1.6;
        }

        .chat-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
        }

        .btn-back-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .btn-back-mobile {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            color: var(--text-secondary);
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-glass);
            flex-shrink: 0;
          }
          .btn-back-mobile:hover {
            color: var(--text-primary);
            background: var(--bg-surface-hover);
          }
        }

        .contact-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-contact-details h3 {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .chat-contact-details span {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .date-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .date-header {
          text-align: center;
          margin: 10px 0;
          position: relative;
        }

        .date-header::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: var(--border-glass);
          z-index: 1;
        }

        .date-header span {
          position: relative;
          z-index: 2;
          background: #100f1c;
          padding: 4px 14px;
          border-radius: 12px;
          border: 1px solid var(--border-glass);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .date-messages {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message-bubble-wrapper {
          display: flex;
          width: 100%;
        }

        .message-bubble-wrapper.sent {
          justify-content: flex-end;
        }

        .message-bubble-wrapper.received {
          justify-content: flex-start;
        }

        .message-meta-group {
          display: flex;
          flex-direction: column;
          max-width: 65%;
          gap: 4px;
        }

        .message-bubble-wrapper.sent .message-meta-group {
          align-items: flex-end;
        }

        .message-bubble-wrapper.received .message-meta-group {
          align-items: flex-start;
        }

        .message-bubble {
          padding: 12px 18px;
          border-radius: 18px;
          font-size: 0.92rem;
          line-height: 1.5;
          word-break: break-word;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .sent-bubble {
          background: var(--accent-gradient);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .received-bubble {
          background: rgba(255, 255, 255, 0.04);
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

        .large-emoji {
          font-size: 2.2rem;
          line-height: 1;
        }

        .message-timestamp {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* Image Message Styling */
        .image-message-container {
          border-radius: 12px;
          overflow: hidden;
          max-width: 280px;
          max-height: 280px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }

        .chat-shared-image {
          width: 100%;
          height: auto;
          display: block;
          max-height: 280px;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .chat-shared-image:hover {
          transform: scale(1.02);
        }

        /* File Message Styling */
        .file-message-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          padding: 10px 14px;
          border-radius: 12px;
          min-width: 220px;
        }

        .file-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(121, 40, 202, 0.15);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .file-card-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-ext {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .file-download-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          transition: all 0.2s ease;
        }

        .file-download-btn:hover {
          background: var(--accent-primary);
          color: white;
          border-color: transparent;
        }

        /* Input area styling */
        .chat-input-panel {
          padding: 20px 24px;
          border-top: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .input-actions-wrapper {
          display: flex;
          gap: 6px;
        }

        .input-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
        }

        .input-action-btn:hover, .input-action-btn.active {
          color: var(--text-primary);
          background: var(--bg-surface-hover);
          border-color: rgba(255,255,255,0.15);
        }

        .chat-input-wrapper {
          flex: 1;
        }

        .chat-input-wrapper input {
          border-radius: 12px;
          height: 40px;
          padding: 0 16px;
        }

        .btn-send {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--accent-gradient);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(121, 40, 202, 0.25);
        }

        .btn-send:hover:not(:disabled) {
          background: var(--accent-gradient-hover);
          transform: translateY(-1px);
        }

        .btn-send:disabled {
          background: rgba(255,255,255,0.03);
          color: var(--text-muted);
          border: 1px solid var(--border-glass);
          box-shadow: none;
          cursor: not-allowed;
        }

        /* Emoji Drawer styling */
        .emoji-picker-container {
          position: absolute;
          bottom: 74px;
          left: 24px;
          width: 310px;
          height: 240px;
          overflow-y: auto;
          padding: 16px;
          z-index: 100;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }

        .emoji-btn {
          font-size: 1.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          transition: transform 0.1s ease;
        }

        .emoji-btn:hover {
          background: var(--bg-surface-hover);
          transform: scale(1.15);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatArea;
