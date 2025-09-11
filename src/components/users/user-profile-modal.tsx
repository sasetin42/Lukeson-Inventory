

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
import { Loader2, User, Mail, Shield, Activity, Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { processImage } from '@/lib/image-utils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    const { toast } = useToast();
    const { user, profile, updateUserProfile, firebaseUser } = useAuth();
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && profile) {
            setName(profile.name || '');
            setAvatarPreview(profile.avatar || null);
            setAvatarFile(null); // Reset file on open
        }
    }, [isOpen, profile]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const { id, update } = toast({
                title: 'Processing Image',
                description: 'Compressing and converting your image...',
                variant: 'default',
                icon: <Loader2 className="animate-spin" />
            });

            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                update({
                    id,
                    title: "Invalid File Size",
                    description: "Image size must be less than 2MB.",
                    variant: "destructive",
                });
                return;
            }
            setAvatarFile(file);
            try {
                const compressedDataUrl = await processImage(file, 2);
                setAvatarPreview(compressedDataUrl);
                update({
                    id,
                    title: 'Success',
                    description: 'Image processed successfully.',
                    variant: 'success'
                });
            } catch (error: any) {
                 update({
                    id,
                    title: "Image Processing Error",
                    description: error.message || "Failed to process image.",
                    variant: "destructive",
                });
            }
        }
    };
    
    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAvatarFile(null);
        setAvatarPreview(profile.avatar);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        if (!firebaseUser) {
            toast({ title: 'Error', description: 'You are not logged in.', variant: 'destructive' });
            setIsSaving(false);
            return;
        }
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
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>Update your personal information.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="flex items-center gap-6">
                        <div className="space-y-2">
                             <Label>Profile Picture</Label>
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={avatarPreview || undefined} alt={name} data-ai-hint="user avatar" />
                                <AvatarFallback className="text-3xl">{name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file-avatar" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-primary" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                        <p className="text-xs text-muted-foreground">PNG or JPG (MAX. 2MB)</p>
                                    </div>
                                    <Input id="dropzone-file-avatar" type="file" className="hidden" onChange={handleAvatarChange} accept="image/*"/>
                                </label>
                            </div> 
                        </div>
                    </div>


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
