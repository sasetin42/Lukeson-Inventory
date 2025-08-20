
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PageHeader from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
            setEmail(user.email || '');
            
            const fetchUserFromFirestore = async () => {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setName(userData.name);
                }
            }
            // We are using a users collection, let's try to get the name from there
            // as displayName might not be set during initial signup.
            fetchUserFromFirestore();

        }
    }, [user]);

    const handleProfileUpdate = async () => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in to update your profile.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            // Update Firebase Auth profile
            await updateProfile(user, { displayName: name });

            // Update Firestore user document
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await updateDoc(userDocRef, { name: name });
            } else {
                // This case is unlikely if user management is robust, but good to have.
                console.warn(`User document not found for UID: ${user.uid}. Cannot update Firestore name.`);
            }

            toast({ title: 'Success', description: 'Your profile has been updated.', variant: 'success' });
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Settings"
        description="Manage your account and application settings."
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <Button onClick={handleProfileUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <Button>Change Password</Button>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>
                Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive">Delete My Account</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
