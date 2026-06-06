import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { User, FileText, Image as ImageIcon, Download, ChevronDown, ChevronRight } from 'lucide-react';

const RightPanel = () => {
  const { activeContact, messages } = useSocket();
  const [showMedia, setShowMedia] = useState(true);
  const [showFiles, setShowFiles] = useState(true);

  if (!activeContact) return null;

  // Filter shared images and files from message history
  const sharedImages = messages.filter((m) => m.message_type === 4 && m.file_record);
  const sharedFiles = messages.filter((m) => m.message_type === 3 && m.file_record);

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

  return (
    <div className="right-panel-container">
      {/* Contact Profile Overview */}
      <div className="profile-overview">
        <div className="avatar-large" style={{ background: avatar.gradient }}>
          {avatar.initials}
        </div>
        <h2>{activeContact.username}</h2>
        <span className="gender-badge">{activeContact.gender || 'User'}</span>
        
        <div className={`status-badge ${activeContact.status ? 'online' : 'offline'}`}>
          <span className="badge-dot"></span>
          {activeContact.status ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="panel-sections">
        {/* Shared Media Section */}
        <div className="panel-section">
          <button onClick={() => setShowMedia(!showMedia)} className="section-header">
            <div className="section-title">
              <ImageIcon size={16} />
              <span>Shared Photos ({sharedImages.length})</span>
            </div>
            {showMedia ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {showMedia && (
            <div className="media-grid">
              {sharedImages.length === 0 ? (
                <p className="empty-section-text">No photos shared</p>
              ) : (
                sharedImages.map((imgMsg) => (
                  <div key={imgMsg.id} className="media-thumbnail">
                    <img
                      src={imgMsg.file_record.file_path}
                      alt="Shared attachment"
                      onClick={() => window.open(imgMsg.file_record.file_path, '_blank')}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Shared Files Section */}
        <div className="panel-section">
          <button onClick={() => setShowFiles(!showFiles)} className="section-header">
            <div className="section-title">
              <FileText size={16} />
              <span>Shared Files ({sharedFiles.length})</span>
            </div>
            {showFiles ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {showFiles && (
            <div className="files-list">
              {sharedFiles.length === 0 ? (
                <p className="empty-section-text">No files shared</p>
              ) : (
                sharedFiles.map((fileMsg) => (
                  <div key={fileMsg.id} className="shared-file-item">
                    <div className="shared-file-icon">
                      <FileText size={16} />
                    </div>
                    <div className="shared-file-info">
                      <span className="file-name">{fileMsg.file_record.file_name}</span>
                      <span className="file-size">{fileMsg.file_record.file_extension.toUpperCase()}</span>
                    </div>
                    <a
                      href={fileMsg.file_record.file_path}
                      download={fileMsg.file_record.file_name}
                      className="shared-file-download"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .right-panel-container {
          width: 280px;
          height: 100%;
          border-left: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
        }

        .profile-overview {
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          text-align: center;
        }

        .avatar-large {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          margin-bottom: 16px;
        }

        .profile-overview h2 {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .gender-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          margin-bottom: 14px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-badge.online .badge-dot {
          background: var(--success-color);
          box-shadow: 0 0 6px var(--success-glow);
        }

        .status-badge.offline .badge-dot {
          background: #47475a;
        }

        .panel-sections {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .panel-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-secondary);
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.02);
        }

        .section-header:hover {
          color: var(--text-primary);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .empty-section-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 10px 4px;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .media-thumbnail {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-glass);
          cursor: pointer;
        }

        .media-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .media-thumbnail img:hover {
          transform: scale(1.08);
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .shared-file-item {
          display: flex;
          align-items: center;
          padding: 8px;
          border-radius: 10px;
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--border-glass);
          gap: 10px;
        }

        .shared-file-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255,255,255,0.03);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .shared-file-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .shared-file-info .file-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .shared-file-info .file-size {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .shared-file-download {
          color: var(--text-muted);
          padding: 4px;
        }

        .shared-file-download:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default RightPanel;
