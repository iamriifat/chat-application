import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const InputBox = () => {
    const [text, setText] = useState('');
    const { sendMessage, connected } = useChat();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || !connected) return;
        
        sendMessage(text.trim());
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={connected ? "Type an anonymous message..." : "Connecting..."}
                disabled={!connected}
                className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={!text.trim() || !connected}
                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
                Send
            </button>
        </form>
    );
};

export default InputBox;
