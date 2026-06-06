import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  // Fetch users list from database
  const fetchUsers = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Exclude logged in user from the contact list
        setUsers(data.filter(u => u.id !== user?.id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch message history for selected contact
  const fetchMessages = async (contactId) => {
    if (!token || !contactId) return;
    try {
      const response = await fetch(`/api/messages/${contactId}?token=${encodeURIComponent(token)}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Load message history when active contact changes
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
    } else {
      setMessages([]);
    }
  }, [activeContact]);

  // Initial fetch
  useEffect(() => {
    if (token && user) {
      fetchUsers();
    } else {
      setUsers([]);
      setActiveContact(null);
      setMessages([]);
    }
  }, [token, user]);

  // WebSocket Connection management
  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/${user.id}?token=${encodeURIComponent(token)}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection opened');
      // Mark current user as online in the list
      fetchUsers();
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'user_status') {
        // Update user status in the contact list
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === data.user_id ? { ...u, status: data.status } : u
          )
        );
        // Update active contact status if it's the one who connected/disconnected
        setActiveContact((prev) =>
          prev && prev.id === data.user_id ? { ...prev, status: data.status } : prev
        );
      } else if (data.type === 'receive_message') {
        // Append message if it's part of the current active conversation
        const isFromActive = data.from_user_id === activeContact?.id;
        const isToActive = data.to_user_id === activeContact?.id;
        
        if (isFromActive || isToActive) {
          setMessages((prev) => {
            // Avoid duplicate messages
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, data];
          });
        }

        // Update latest message info on the users list for snippet previews
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === data.from_user_id || u.id === data.to_user_id) {
              return {
                ...u,
                last_message: data.text || (data.message_type === 4 ? '📷 Image' : '📎 File'),
                last_message_time: data.created_at,
              };
            }
            return u;
          })
        );
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [token, user, activeContact]);

  // Send message helper
  const sendMessage = (messageType, toUserId, text = '', fileId = null) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'send_message',
          message_type: messageType,
          to_user_id: toUserId,
          text: text,
          file_id: fileId,
        })
      );
    } else {
      console.error('WebSocket connection is not open');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        users,
        activeContact,
        setActiveContact,
        messages,
        setMessages,
        sendMessage,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
