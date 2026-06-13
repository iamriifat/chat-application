import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Use Vite proxy for /ws, or absolute URL in prod
        const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//localhost:8000/ws`;
        const roomId = "global";

        const ws = new WebSocket(`${wsUrl}/chat/${roomId}?user_id=${user.user_id}&nickname=${user.nickname}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === "system" && data.action === "user_count") {
                    setUserCount(data.count);
                } else if (data.type === "chat") {
                    setMessages(prev => [...prev, data]);
                }
            } catch (err) {
                console.error("Failed to parse message", err);
            }
        };

        ws.onclose = () => {
            setConnected(false);
        };

        return () => {
            ws.close();
        };
    }, [user]);

    const sendMessage = (text) => {
        if (wsRef.current && connected) {
            wsRef.current.send(JSON.stringify({ message: text }));
        }
    };

    const value = {
        messages,
        userCount,
        connected,
        sendMessage
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
