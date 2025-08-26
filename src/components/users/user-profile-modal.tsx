
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Shield, Activity, Key } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/auth-context';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    const { toast } = useToast();
    const { user, profile, updateUserProfile, firebaseUser } = useAuth();
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && profile) {
            setName(profile.name || '');
        }
    }, [isOpen, profile]);

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        if (!firebaseUser) {
            toast({ title: 'Error', description: 'You are not logged in.', variant: 'destructive' });
            setIsSaving(false);
            return;
        }
        try {
            await updateUserProfile(name, null);
            toast({ title: 'Success', description: 'Your profile has been updated.', variant: 'success' });
            onClose();
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>Update your personal information.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500" />Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500" />Email</Label>
                        <Input id="email" type="email" value={firebaseUser?.email || ''} disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" />Role</Label>
                            <Badge variant="secondary">{user?.role}</Badge>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Activity className="h-4 w-4 text-yellow-500" />Status</Label>
                            <Badge variant="success">{user?.status}</Badge>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <h3 className="font-semibold">Password Settings</h3>
                        <p className="text-sm text-muted-foreground">Password changes must be done via the "Forgot Password" link on the login page for security reasons.</p>
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleProfileUpdate} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Profile
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
