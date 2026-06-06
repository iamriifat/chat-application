import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LogOut, Search, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { users, activeContact, setActiveContact } = useSocket();
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getAvatarInfo = (username, gender) => {
    const initials = username.substring(0, 2).toUpperCase();
    let gradient = 'linear-gradient(135deg, #1e3c72, #2a5298)';
    if (gender === 'Female') gradient = 'linear-gradient(135deg, #ec008c, #fc6767)';
    else if (gender === 'Other') gradient = 'linear-gradient(135deg, #f59e0b, #ef4444)';
    else if (gender === 'Male') gradient = 'linear-gradient(135deg, #00d4aa, #0ea5e9)';
    return { initials, gradient };
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const myAvatar = getAvatarInfo(user?.username || '', user?.gender || '');

  return (
    <div className="sidebar-container">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-small">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className="brand-label">NexChat</span>
        <button onClick={logout} className="btn-logout" title="Log Out">
          <LogOut size={16} />
        </button>
      </div>

      {/* Profile Row */}
      <div className="profile-row">
        <div
          className="avatar-circle"
          style={{ background: myAvatar.gradient }}
        >
          {myAvatar.initials}
        </div>
        <div className="profile-info">
          <h3>{user?.username}</h3>
          <span className="online-badge">
            <span className="online-dot" />
            Online
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contacts Label */}
      <div className="contacts-label">
        <span>Contacts</span>
        <span className="contacts-count">{filteredUsers.length}</span>
      </div>

      {/* Contacts List */}
      <div className="contacts-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-contacts">
            <MessageSquare size={28} />
            <p>No contacts found</p>
          </div>
        ) : (
          filteredUsers.map((u) => {
            const avatar = getAvatarInfo(u.username, u.gender);
            const isActive = activeContact?.id === u.id;

            return (
              <div
                key={u.id}
                className={`contact-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveContact(u)}
              >
                <div className="avatar-wrapper">
                  <div className="avatar-circle" style={{ background: avatar.gradient }}>
                    {avatar.initials}
                  </div>
                  <span className={`status-dot ${u.status ? 'online' : 'offline'}`} />
                </div>

                <div className="contact-details">
                  <div className="contact-meta">
                    <h4>{u.username}</h4>
                    <span className="last-msg-time">{formatTime(u.last_message_time)}</span>
                  </div>
                  <p className="last-msg-text">
                    {u.last_message || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .sidebar-container {
          width: 300px;
          height: 100%;
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          background: rgba(0, 0, 0, 0.2);
        }

        /* Brand header */
        .sidebar-brand {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-glass);
        }

        .brand-logo-small {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00d4aa, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          color: #060a14;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.25);
        }

        .brand-label {
          font-size: 1.1rem;
          font-weight: 800;
          background: linear-gradient(135deg, #00d4aa, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          flex: 1;
          letter-spacing: -0.3px;
        }

        .btn-logout {
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          border-radius: 9px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-glass);
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          color: #f87171;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
        }

        /* Profile row */
        .profile-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-glass);
        }

        .profile-info h3 {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 3px;
        }

        .online-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: var(--accent-primary);
          font-weight: 500;
        }

        .online-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 6px var(--success-glow);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--success-glow); }
          50%       { opacity: 0.7; box-shadow: 0 0 12px var(--success-glow); }
        }

        /* Avatar */
        .avatar-circle {
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          flex-shrink: 0;
        }

        /* Search */
        .search-bar {
          padding: 14px 16px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 30px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-bar input {
          padding-left: 40px;
          font-size: 0.85rem;
          height: 38px;
          border-radius: 12px;
        }

        /* Label row */
        .contacts-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 20px 10px;
        }

        .contacts-label span:first-child {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
        }

        .contacts-count {
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(0, 212, 170, 0.12);
          color: var(--accent-primary);
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid rgba(0, 212, 170, 0.2);
        }

        /* Contacts */
        .contacts-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 10px 16px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 14px;
          gap: 12px;
          cursor: pointer;
          transition: all 0.18s ease;
          border: 1px solid transparent;
          margin-bottom: 2px;
        }

        .contact-item:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-glass);
        }

        .contact-item.active {
          background: var(--bg-surface-active);
          border-color: rgba(0, 212, 170, 0.2);
        }

        .avatar-wrapper { position: relative; }

        .status-dot {
          position: absolute;
          bottom: 0; right: 0;
          width: 11px; height: 11px;
          border-radius: 50%;
          border: 2px solid #0c101b;
        }

        .status-dot.online {
          background: var(--success-color);
          box-shadow: 0 0 6px var(--success-glow);
        }

        .status-dot.offline { background: #2d3748; }

        .contact-details { flex: 1; min-width: 0; }

        .contact-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 3px;
        }

        .contact-meta h4 {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .last-msg-time {
          font-size: 0.7rem;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .last-msg-text {
          font-size: 0.78rem;
          color: var(--text-secondary);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .empty-contacts {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 20px;
          color: var(--text-muted);
          gap: 10px; text-align: center;
        }

        .empty-contacts p { font-size: 0.83rem; }
      `}</style>
    </div>
  );
};

export default Sidebar;
