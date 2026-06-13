import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginRegister from './components/LoginRegister';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import RightPanel from './components/RightPanel';
import { Loader2 } from 'lucide-react';

import { useSocket } from './context/SocketContext';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { activeContact } = useSocket();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="glass-panel loading-card">
          <Loader2 size={40} className="spinner" />
          <p>Initialising secure channels...</p>
        </div>
        <style>{`
          .app-loading {
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .loading-card {
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
          }
          .spinner {
            animation: spin 1s linear infinite;
            color: var(--accent-primary);
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginRegister />;
  }

  return (
    <div className="app-workspace-wrapper">
      {/* Background ambient light effects */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Main Workspace Frame */}
      <div className={`glass-panel app-workspace ${activeContact ? 'contact-selected' : ''}`}>
        <Sidebar />
        <ChatArea />
        <RightPanel />
      </div>

      <style>{`
        .app-workspace-wrapper {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .app-workspace {
          width: 100%;
          max-width: 1280px;
          height: calc(100vh - 40px);
          max-height: 860px;
          display: flex;
          overflow: hidden;
          animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .app-workspace-wrapper {
            padding: 0 !important;
          }

          .app-workspace {
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }

          /* default mobile state: show sidebar, hide chat/profile */
          .app-workspace .sidebar-container {
            width: 100% !important;
            display: flex !important;
          }
          .app-workspace .chat-area-container {
            display: none !important;
          }
          .app-workspace .right-panel-container {
            display: none !important;
          }

          /* contact active mobile state: hide sidebar, show chat */
          .app-workspace.contact-selected .sidebar-container {
            display: none !important;
          }
          .app-workspace.contact-selected .chat-area-container {
            display: flex !important;
            width: 100% !important;
          }
          .app-workspace.contact-selected .right-panel-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
