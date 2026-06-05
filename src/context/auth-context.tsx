
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, Role, PermissionLevel, LoadingScreenSettings } from '@/lib/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    name: string;
    avatar: string;
}

interface CompanyProfile {
    name: string;
    logo: string;
    siteIcon?: string;
    siteTitle?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  profile: UserProfile;
  companyProfile: CompanyProfile;
  loadingScreenSettings: Partial<LoadingScreenSettings>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  userRole: User['role'] | null;
  rolePermissions: { [key: string]: PermissionLevel } | null;
  hasWriteAccess: (module: string) => boolean;
  updateUserProfile: (name: string, avatarFile: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<User['role'] | null>(null);
    const [rolePermissions, setRolePermissions] = useState<{ [key: string]: PermissionLevel } | null>(null);
    const [profile, setProfile] = useState<UserProfile>({ name: 'User', avatar: 'https://placehold.co/128x128.png'});
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({ name: 'IMIS Pro', logo: '', siteIcon: '', siteTitle: 'IMIS Pro' });
    const [loadingScreenSettings, setLoadingScreenSettings] = useState<Partial<LoadingScreenSettings>>({});
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const inactivityTimer = useRef<NodeJS.Timeout>();

    const logout = async () => {
        await signOut(auth);
    };

    const handleInactivity = () => {
        logout();
        toast({
            title: "Session Expired",
            description: "You have been logged out due to inactivity.",
            variant: "default"
        });
    };

    const resetInactivityTimer = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(handleInactivity, 3600000); // 1 hour
    };

    useEffect(() => {
        if (firebaseUser) {
            const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
            
            const reset = () => resetInactivityTimer();

            events.forEach(event => window.addEventListener(event, reset));
            resetInactivityTimer(); // Initial setup

            return () => {
                events.forEach(event => window.removeEventListener(event, reset));
                if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            };
        }
    }, [firebaseUser]);

    const fetchUserData = async (fbUser: FirebaseUser) => {
        try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const companyDocRef = doc(db, 'settings', 'companyProfile');
            const loadingScreenDocRef = doc(db, 'settings', 'loadingScreen');


            const [userDocSnap, companyDocSnap, loadingScreenSnap] = await Promise.all([
                getDoc(userDocRef),
                getDoc(companyDocRef),
                getDoc(loadingScreenDocRef),
            ]);
            
            let userData: User | null = null;
            if (userDocSnap.exists()) {
                userData = { ...userDocSnap.data(), id: fbUser.uid } as User;
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
                userData = { ...newUser, id: fbUser.uid } as User;
                setUser(userData);
                setUserRole(userData.role);
                setProfile({ name: userData.name, avatar: userData.avatar || 'https://placehold.co/128x128.png' });
            }
            
            if (companyDocSnap.exists()) {
                const companyData = companyDocSnap.data() || {};
                setCompanyProfile({ 
                    name: companyData.name || 'IMIS Pro', 
                    logo: companyData.logo || '', 
                    siteIcon: companyData.siteIcon || '',
                    siteTitle: companyData.siteTitle || 'IMIS Pro - All-in-One Business Management'
                });
            }

            if (loadingScreenSnap.exists()) {
                setLoadingScreenSettings(loadingScreenSnap.data() || {});
            }

            if (userData?.role) {
                const rolesRef = collection(db, 'roles');
                const q = query(rolesRef, where("name", "==", userData.role));
                const roleQuerySnapshot = await getDocs(q);

                if (!roleQuerySnapshot.empty) {
                    const roleDoc = roleQuerySnapshot.docs[0];
                    const roleData = roleDoc.data() as Role;
                    setRolePermissions(roleData.permissions);
                } else {
                    setRolePermissions(null);
                }
            }


        } catch (error) {
            console.error("Error fetching or creating user data from Firestore:", error);
            setUser(null);
            setUserRole(null);
            setRolePermissions(null);
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
                setRolePermissions(null);
                setProfile({ name: 'User', avatar: 'https://placehold.co/128x128.png' });
                setCompanyProfile({ name: 'IMIS Pro', logo: '', siteIcon: '', siteTitle: 'IMIS Pro' });
                setLoadingScreenSettings({});
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
    
    const updateUserProfile = async (name: string, avatarFile: File | null): Promise<void> => {
        if (!firebaseUser) throw new Error("No user is logged in.");

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const dataToUpdate: { name: string, avatar?: string } = { name };
        let newAvatarUrl = profile.avatar;

        if (avatarFile) {
            const storageRef = ref(storage, `avatars/${firebaseUser.uid}/${avatarFile.name}`);
            await uploadBytes(storageRef, avatarFile);
            newAvatarUrl = await getDownloadURL(storageRef);
            dataToUpdate.avatar = newAvatarUrl;
        }

        await updateDoc(userDocRef, dataToUpdate);

        // Update the state locally to reflect changes immediately
        const newProfile = { name, avatar: newAvatarUrl };
        setProfile(newProfile);
        if(user) {
            setUser({ ...user, name, avatar: newAvatarUrl });
        }
    };
    
    const hasWriteAccess = (module: string): boolean => {
        if (!rolePermissions) return false;
        return rolePermissions[module] === 'Full Access';
    };

    const value = { 
        isAuthenticated: !isLoading && !!firebaseUser, 
        user,
        firebaseUser,
        profile,
        companyProfile,
        loadingScreenSettings,
        login, 
        logout, 
        isLoading,
        userRole,
        rolePermissions,
        hasWriteAccess,
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
