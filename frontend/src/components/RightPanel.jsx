import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { FileText, Image as ImageIcon, Download, ChevronDown, ChevronRight, Hash } from 'lucide-react';

const RightPanel = () => {
  const { activeContact, messages } = useSocket();
  const [showMedia, setShowMedia] = useState(true);
  const [showFiles, setShowFiles] = useState(true);

  if (!activeContact) return null;

  const sharedImages = messages.filter((m) => m.message_type === 4 && m.file_record);
  const sharedFiles = messages.filter((m) => m.message_type === 3 && m.file_record);
  const totalMessages = messages.length;

  const getAvatarInfo = (username, gender) => {
    const initials = username.substring(0, 2).toUpperCase();
    let gradient = 'linear-gradient(135deg, #1e3c72, #2a5298)';
    if (gender === 'Female') gradient = 'linear-gradient(135deg, #ec008c, #fc6767)';
    else if (gender === 'Other') gradient = 'linear-gradient(135deg, #f59e0b, #ef4444)';
    else if (gender === 'Male') gradient = 'linear-gradient(135deg, #00d4aa, #0ea5e9)';
    return { initials, gradient };
  };

  const avatar = getAvatarInfo(activeContact.username, activeContact.gender);

  return (
    <div className="right-panel-container">
      {/* Profile */}
      <div className="profile-overview">
        <div className="avatar-ring-wrap">
          <div
            className="avatar-large"
            style={{ background: avatar.gradient }}
          >
            {avatar.initials}
          </div>
          <div
            className="avatar-glow-ring"
            style={{ background: avatar.gradient }}
          />
        </div>
        <h2>{activeContact.username}</h2>
        <span className="gender-badge">{activeContact.gender || 'User'}</span>
        <div className={`status-badge ${activeContact.status ? 'online' : 'offline'}`}>
          <span className="badge-dot" />
          {activeContact.status ? 'Online now' : 'Offline'}
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-value">{totalMessages}</span>
          <span className="stat-label">Messages</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{sharedImages.length}</span>
          <span className="stat-label">Photos</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{sharedFiles.length}</span>
          <span className="stat-label">Files</span>
        </div>
      </div>

      <div className="panel-sections">
        {/* Shared Media */}
        <div className="panel-section">
          <button onClick={() => setShowMedia(!showMedia)} className="section-header">
            <div className="section-title">
              <ImageIcon size={14} />
              <span>Shared Photos</span>
              <span className="section-count">{sharedImages.length}</span>
            </div>
            {showMedia ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showMedia && (
            <div className="media-grid">
              {sharedImages.length === 0 ? (
                <p className="empty-section-text">No photos shared yet</p>
              ) : (
                sharedImages.map((imgMsg) => (
                  <div key={imgMsg.id} className="media-thumbnail" onClick={() => window.open(imgMsg.file_record.file_path, '_blank')}>
                    <img src={imgMsg.file_record.file_path} alt="Shared" />
                    <div className="media-overlay"><Download size={12} /></div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Shared Files */}
        <div className="panel-section">
          <button onClick={() => setShowFiles(!showFiles)} className="section-header">
            <div className="section-title">
              <FileText size={14} />
              <span>Shared Files</span>
              <span className="section-count">{sharedFiles.length}</span>
            </div>
            {showFiles ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showFiles && (
            <div className="files-list">
              {sharedFiles.length === 0 ? (
                <p className="empty-section-text">No files shared yet</p>
              ) : (
                sharedFiles.map((fileMsg) => (
                  <div key={fileMsg.id} className="shared-file-item">
                    <div className="shared-file-icon"><FileText size={14} /></div>
                    <div className="shared-file-info">
                      <span className="file-name">{fileMsg.file_record.file_name}</span>
                      <span className="file-size">{fileMsg.file_record.file_extension.toUpperCase()}</span>
                    </div>
                    <a href={fileMsg.file_record.file_path} download={fileMsg.file_record.file_name} className="shared-file-download">
                      <Download size={13} />
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
          width: 260px;
          height: 100%;
          border-left: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
          background: rgba(0,0,0,0.15);
        }

        /* Profile */
        .profile-overview {
          padding: 28px 20px 20px;
          display: flex; flex-direction: column; align-items: center;
          border-bottom: 1px solid var(--border-glass);
          text-align: center;
        }

        .avatar-ring-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .avatar-large {
          width: 78px; height: 78px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.7rem; font-weight: 700;
          color: white;
          position: relative; z-index: 1;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .avatar-glow-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          opacity: 0.3;
          filter: blur(8px);
          z-index: 0;
        }

        .profile-overview h2 {
          font-size: 1.05rem; font-weight: 700;
          color: var(--text-primary); margin-bottom: 6px;
        }

        .gender-badge {
          font-size: 0.72rem; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          margin-bottom: 12px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.78rem; font-weight: 500;
        }

        .badge-dot { width: 7px; height: 7px; border-radius: 50%; }
        .status-badge.online { color: var(--accent-primary); }
        .status-badge.online .badge-dot {
          background: var(--accent-primary);
          box-shadow: 0 0 6px var(--success-glow);
          animation: pulse 2s infinite;
        }
        .status-badge.offline { color: var(--text-muted); }
        .status-badge.offline .badge-dot { background: #2d3748; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }

        /* Stats */
        .stats-row {
          display: flex; align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-glass);
          gap: 0;
        }

        .stat-item {
          flex: 1; text-align: center;
          display: flex; flex-direction: column; gap: 2px;
        }

        .stat-value {
          font-size: 1.1rem; font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.68rem; font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px; height: 28px;
          background: var(--border-glass);
        }

        /* Sections */
        .panel-sections {
          padding: 16px; display: flex; flex-direction: column; gap: 20px;
          flex: 1;
        }

        .panel-section { display: flex; flex-direction: column; gap: 10px; }

        .section-header {
          display: flex; justify-content: space-between; align-items: center;
          color: var(--text-secondary);
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          width: 100%;
        }
        .section-header:hover { color: var(--text-primary); }

        .section-title {
          display: flex; align-items: center; gap: 7px;
          font-size: 0.8rem; font-weight: 600;
        }

        .section-count {
          background: rgba(0, 212, 170, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(0, 212, 170, 0.2);
          font-size: 0.68rem; font-weight: 700;
          padding: 1px 7px; border-radius: 10px;
        }

        .empty-section-text {
          font-size: 0.78rem; color: var(--text-muted); padding: 8px 2px;
        }

        /* Media grid */
        .media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }

        .media-thumbnail {
          aspect-ratio: 1; border-radius: 8px; overflow: hidden;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-glass);
          cursor: pointer; position: relative;
        }

        .media-thumbnail img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.2s ease;
        }

        .media-overlay {
          position: absolute; inset: 0;
          background: rgba(0, 212, 170, 0.5);
          display: flex; align-items: center; justify-content: center;
          color: white; opacity: 0;
          transition: opacity 0.2s ease;
        }

        .media-thumbnail:hover img { transform: scale(1.08); }
        .media-thumbnail:hover .media-overlay { opacity: 1; }

        /* Files list */
        .files-list { display: flex; flex-direction: column; gap: 5px; }

        .shared-file-item {
          display: flex; align-items: center;
          padding: 8px; border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-glass);
          gap: 8px; transition: background 0.15s ease;
        }
        .shared-file-item:hover { background: rgba(255,255,255,0.04); }

        .shared-file-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(0, 212, 170, 0.08);
          color: var(--accent-primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .shared-file-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }

        .shared-file-info .file-name {
          font-size: 0.77rem; font-weight: 500; color: var(--text-primary);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .shared-file-info .file-size { font-size: 0.68rem; color: var(--text-muted); }

        .shared-file-download { color: var(--text-muted); padding: 3px; transition: color 0.15s ease; }
        .shared-file-download:hover { color: var(--accent-primary); }
      `}</style>
    </div>
  );
};

export default RightPanel;
