
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
import { Loader2, Camera, User, Mail, Shield, Activity, Key } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: (profile: { name: string, avatar: string }) => void;
}

export default function UserProfileModal({ isOpen, onClose, onProfileUpdate }: UserProfileModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('https://placehold.co/128x128.png');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const storedProfile = localStorage.getItem('user_profile');
            if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                setName(profile.name || 'Admin User');
                setAvatar(profile.avatar || 'https://placehold.co/128x128.png');
            } else {
                setName('Admin User');
                setAvatar('https://placehold.co/128x128.png');
            }
            setEmail('admin@example.com'); // This is static
        }
    }, [isOpen]);

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const updatedProfile = { name, avatar };
            localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
            
            onProfileUpdate(updatedProfile);

            toast({ title: 'Success', description: 'Your profile has been updated.', variant: 'success' });
            onClose();
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>Update your personal information and profile picture.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={avatar} alt={name} data-ai-hint="user avatar" />
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="mr-2 h-4 w-4"/>
                            Upload Picture
                        </Button>
                        <Input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500" />Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500" />Email</Label>
                            <Input id="email" type="email" value={email} disabled />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" />Role</Label>
                                <Badge variant="secondary" className="text-base">Admin</Badge>
                             </div>
                             <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Activity className="h-4 w-4 text-yellow-500" />Status</Label>
                                <Badge variant="success" className="text-base">Active</Badge>
                             </div>
                        </div>
                    </div>
                </div>
                <Separator />
                 <div className="space-y-4">
                    <h3 className="font-semibold">Password Settings</h3>
                    <div className="space-y-2">
                        <Label htmlFor="current-password" className="flex items-center gap-2"><Key className="h-4 w-4 text-gray-500" />Current Password</Label>
                        <Input id="current-password" type="password" placeholder="Enter your current password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password" className="flex items-center gap-2"><Key className="h-4 w-4 text-gray-500" />New Password</Label>
                        <Input id="new-password" type="password" placeholder="Enter a new password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="flex items-center gap-2"><Key className="h-4 w-4 text-gray-500" />Confirm New Password</Label>
                        <Input id="confirm-password" type="password" placeholder="Confirm your new password" />
                    </div>
                </div>
                <DialogFooter>
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
