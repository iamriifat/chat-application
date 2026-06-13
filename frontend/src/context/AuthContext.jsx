import React, { createContext, useContext, useState, useEffect } from 'react';
import { anonymousLogin } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initUser = async () => {
            try {
                // Check localStorage
                const storedUser = localStorage.getItem('anon_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // Fetch new user
                    const newUser = await anonymousLogin();
                    localStorage.setItem('anon_user', JSON.stringify(newUser));
                    setUser(newUser);
                }
            } catch (error) {
                console.error("Auth init failed", error);
            } finally {
                setLoading(false);
            }
        };

        initUser();
    }, []);

    const value = {
        user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
