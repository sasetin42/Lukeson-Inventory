
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  userRole: User['role'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<User['role'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
            setIsLoading(true);
            setFirebaseUser(currentFirebaseUser);

            if (currentFirebaseUser) {
                try {
                    const userDocRef = doc(db, 'users', currentFirebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data() as User;
                        setUser({ ...userData, id: currentFirebaseUser.uid });
                        setUserRole(userData.role);
                         if (pathname === '/login') {
                            router.push('/');
                        }
                    } else {
                        // Handle case where user exists in Auth but not Firestore
                        console.warn(`No Firestore document found for user ${currentFirebaseUser.uid}`);
                        setUser(null);
                        setUserRole(null);
                        if (pathname !== '/login') {
                            router.push('/login');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                    setUser(null);
                    setUserRole(null);
                    if (pathname !== '/login') {
                        router.push('/login');
                    }
                }
            } else {
                setUser(null);
                setUserRole(null);
                 if (pathname !== '/login') {
                    router.push('/login');
                }
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    const login = async (email: string, pass: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('user_profile');
        router.push('/login');
    };

    const value = { 
        isAuthenticated: !isLoading && !!firebaseUser, 
        user,
        firebaseUser,
        login, 
        logout, 
        isLoading,
        userRole,
    };

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
