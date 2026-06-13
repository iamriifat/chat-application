import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ChatRoom />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
