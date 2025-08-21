
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Since auth is removed, we can use placeholder data or load from local storage if needed.
        setName('Admin User');
        setEmail('admin@example.com');
    }, []);

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        try {
            // In a local storage setup, you might save this to a 'user_profile' key
            localStorage.setItem('user_profile', JSON.stringify({ name, email }));
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
