import React from 'react';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const ChatRoom = () => {
    const { user } = useAuth();
    const { userCount, connected } = useChat();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                Generating anonymous identity...
            </div>
        );
    }

    return (
        <div className="chat-room-container flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-teal-400">NexChat Anonymous</h1>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                        Online: <span className="text-white font-mono">{userCount}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                        <span className="text-sm text-gray-300">You are:</span>
                        <span className="text-sm font-bold text-teal-300">{user.nickname}</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative">
                <ChatBox />
            </div>
        </div>
    );
};

export default ChatRoom;
