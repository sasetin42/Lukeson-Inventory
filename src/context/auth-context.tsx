
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { User } from '@/lib/types';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

interface UserProfile {
    name: string;
    avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  profile: UserProfile;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  userRole: User['role'] | null;
  updateUserProfile: (name: string, avatarFile: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<User['role'] | null>(null);
    const [profile, setProfile] = useState<UserProfile>({ name: 'User', avatar: 'https://placehold.co/128x128.png'});
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUserData = async (fbUser: FirebaseUser) => {
        try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = { ...userDocSnap.data(), id: fbUser.uid } as User & { avatar?: string };
                setUser(userData);
                setUserRole(userData.role);
                setProfile({ name: userData.name, avatar: userData.avatar || 'https://placehold.co/128x128.png' });
            } else {
                console.log(`Creating Firestore document for new user ${fbUser.uid}`);
                const newUser: Omit<User, 'id'> & {avatar?: string} = {
                    name: fbUser.displayName || 'New User',
                    email: fbUser.email || '',
                    role: 'Viewer',
                    status: 'active',
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                    avatar: 'https://placehold.co/128x128.png',
                };
                await setDoc(userDocRef, newUser);
                const fullUser = { ...newUser, id: fbUser.uid } as User & {avatar?: string};
                setUser(fullUser as User);
                setUserRole(fullUser.role);
                setProfile({ name: fullUser.name, avatar: fullUser.avatar || 'https://placehold.co/128x128.png' });
            }
        } catch (error) {
            console.error("Error fetching or creating user data from Firestore:", error);
            setUser(null);
            setUserRole(null);
            setProfile({ name: 'Error', avatar: 'https://placehold.co/128x128.png' });
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
            setIsLoading(true);
            if (currentFirebaseUser) {
                setFirebaseUser(currentFirebaseUser);
                await fetchUserData(currentFirebaseUser);
            } else {
                setFirebaseUser(null);
                setUser(null);
                setUserRole(null);
                setProfile({ name: 'User', avatar: 'https://placehold.co/128x128.png' });
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isLoading) return;
        
        const isAuthPage = pathname === '/login';

        if (!firebaseUser && !isAuthPage) {
            router.push('/login');
        } else if (firebaseUser && isAuthPage) {
            router.push('/');
        }
    }, [isLoading, firebaseUser, pathname, router]);

    const login = async (email: string, pass: string): Promise<void> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        // Update last login timestamp
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        await fetchUserData(userCredential.user);
    };

    const logout = async () => {
        await signOut(auth);
    };
    
    const updateUserProfile = async (name: string, avatarFile: File | null): Promise<void> => {
        if (!firebaseUser) throw new Error("No user is logged in.");

        const userDocRef = doc(db, "users", firebaseUser.uid);
        let newAvatarUrl = profile.avatar; // Keep current avatar by default

        if (avatarFile) {
            const storageRef = ref(storage, `avatars/${firebaseUser.uid}`);
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(avatarFile);
            });
            await uploadString(storageRef, dataUrl, 'data_url');
            newAvatarUrl = await getDownloadURL(storageRef);
        }

        await updateDoc(userDocRef, {
            name: name,
            avatar: newAvatarUrl,
        });

        // Update the state locally to reflect changes immediately
        setProfile({ name, avatar: newAvatarUrl });
        if(user) {
            setUser({ ...user, name: name, avatar: newAvatarUrl } as User);
        }
    };

    const value = { 
        isAuthenticated: !isLoading && !!firebaseUser, 
        user,
        firebaseUser,
        profile,
        login, 
        logout, 
        isLoading,
        userRole,
        updateUserProfile,
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
