
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem('isAuthenticated');
            if (authStatus === 'true') {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                if (window.location.pathname !== '/login') {
                    router.push('/login');
                }
            }
            setIsLoading(false);
        };
        checkAuth();
        
        // Listen for storage changes to sync across tabs
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);

    }, [router]);

    const login = async (email: string, pass: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'admin@example.com' && pass === 'password') {
                    localStorage.setItem('isAuthenticated', 'true');
                    setIsAuthenticated(true);
                    resolve();
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    };

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user_profile');
        setIsAuthenticated(false);
        router.push('/login');
    };

    const value = { isAuthenticated, login, logout, isLoading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
