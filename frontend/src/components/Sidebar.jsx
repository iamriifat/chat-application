import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LogOut, Search, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { users, activeContact, setActiveContact } = useSocket();
  const [search, setSearch] = useState('');

  // Filter users based on search query
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  // Get avatar styling and initials based on username & gender
  const getAvatarInfo = (username, gender) => {
    const initials = username.substring(0, 2).toUpperCase();
    let gradient = 'linear-gradient(135deg, #1e3c72, #2a5298)'; // Default blue
    
    if (gender === 'Female') {
      gradient = 'linear-gradient(135deg, #ec008c, #fc6767)'; // Pink/Red
    } else if (gender === 'Other') {
      gradient = 'linear-gradient(135deg, #f12711, #f5af19)'; // Orange/Yellow
    } else if (gender === 'Male') {
      gradient = 'linear-gradient(135deg, #4facfe, #00f2fe)'; // Neon Blue/Green
    }

    return { initials, gradient };
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="sidebar-container">
      {/* Logged in User Profile Header */}
      <div className="profile-header">
        <div className="user-info">
          <div 
            className="avatar-circle"
            style={{ background: getAvatarInfo(user?.username || '', user?.gender || '').gradient }}
          >
            {getAvatarInfo(user?.username || '', user?.gender || '').initials}
          </div>
          <div className="user-details">
            <h3>{user?.username}</h3>
            <span>{user?.gender || 'User'} • Online</span>
          </div>
        </div>
        <button onClick={logout} className="btn-logout" title="Log Out">
          <LogOut size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contacts List */}
      <div className="contacts-list">
        <h2>Active Chats</h2>
        {filteredUsers.length === 0 ? (
          <div className="empty-contacts">
            <MessageSquare size={32} />
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
                  <span className={`status-dot ${u.status ? 'online' : 'offline'}`}></span>
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
          width: 320px;
          height: 100%;
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .profile-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-glass);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .user-details h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-details span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .btn-logout {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
        }

        .btn-logout:hover {
          color: #ff5599;
          background: rgba(255, 0, 128, 0.05);
          border-color: rgba(255, 0, 128, 0.15);
        }

        .search-bar {
          padding: 16px 24px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 38px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-bar input {
          padding-left: 44px;
          font-size: 0.85rem;
        }

        .contacts-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 16px 20px 16px;
        }

        .contacts-list h2 {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin: 10px 12px 16px 12px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 16px;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          margin-bottom: 4px;
        }

        .contact-item:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-glass);
        }

        .contact-item.active {
          background: var(--bg-surface-active);
          border-color: var(--border-glass);
        }

        .avatar-wrapper {
          position: relative;
        }

        .status-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #141320;
        }

        .status-dot.online {
          background: var(--success-color);
          box-shadow: 0 0 8px var(--success-glow);
        }

        .status-dot.offline {
          background: #47475a;
        }

        .contact-details {
          flex: 1;
          min-width: 0;
        }

        .contact-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }

        .contact-meta h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .last-msg-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .last-msg-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .empty-contacts {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: var(--text-muted);
          gap: 12px;
          text-align: center;
        }

        .empty-contacts p {
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
