
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
import { useAuth } from '@/context/auth-context';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    const { toast } = useToast();
    const { user, profile, updateUserProfile } = useAuth();
    const [name, setName] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && user) {
            setName(profile.name || '');
            setAvatarPreview(profile.avatar);
            setAvatarFile(null); // Reset file on open
        }
    }, [isOpen, user, profile]);

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile(name, avatarFile);
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
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>Update your personal information and profile picture.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={avatarPreview || undefined} alt={name} data-ai-hint="user avatar" />
                                <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
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
                        <div className="md:col-span-2 space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500" />Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500" />Email</Label>
                                <Input id="email" type="email" value={user?.email || ''} disabled />
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
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <h3 className="font-semibold">Password Settings</h3>
                        <p className="text-sm text-muted-foreground">Password changes must be done via the "Forgot Password" link on the login page for security reasons.</p>
                        <div className="space-y-2">
                            <Label htmlFor="current-password" className="flex items-center gap-2 text-muted-foreground"><Key className="h-4 w-4" />Current Password</Label>
                            <Input id="current-password" type="password" placeholder="Enter your current password" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="flex items-center gap-2 text-muted-foreground"><Key className="h-4 w-4" />New Password</Label>
                            <Input id="new-password" type="password" placeholder="Enter a new password" disabled />
                        </div>
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
