import React from 'react';
import { useAuth } from '../context/AuthContext';

const Message = ({ data }) => {
    const { user } = useAuth();
    
    // Fallback if data is malformed
    if (!data || !data.user_id) return null;

    const isMe = data.user_id === user?.user_id;

    // Simple time formatting
    const time = data.timestamp 
        ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-gray-400">
                        {isMe ? 'You' : data.nickname}
                    </span>
                    <span className="text-[10px] text-gray-500">{time}</span>
                </div>
                
                <div className={`px-4 py-2 rounded-2xl ${
                    isMe 
                    ? 'bg-teal-600 text-white rounded-br-sm' 
                    : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'
                }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{data.message}</p>
                </div>
            </div>
        </div>
    );
};

export default Message;
