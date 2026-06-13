import React, { useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import Message from './Message';
import InputBox from './InputBox';

const ChatBox = () => {
    const { messages } = useChat();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-gray-900/50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <Message key={idx} data={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-gray-800 border-t border-gray-700">
                <InputBox />
            </div>
        </div>
    );
};

export default ChatBox;
