
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Building2, Palette, LogIn, Save, Loader2, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

const COMPANY_SETTINGS_DOC_ID = 'companyProfile';
const LOGIN_SETTINGS_DOC_ID = 'loginScreen';

export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Company Profile State
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [logo, setLogo] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Login Screen State
    const [loginTitle, setLoginTitle] = useState('IMIS Pro');
    const [loginDescription, setLoginDescription] = useState('Enter your credentials to access your workspace');
    const [loginBg, setLoginBg] = useState('');
    const [loginBgFile, setLoginBgFile] = useState<File | null>(null);

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const companyRef = doc(db, 'settings', COMPANY_SETTINGS_DOC_ID);
                const companySnap = await getDoc(companyRef);
                if (companySnap.exists()) {
                    const data = companySnap.data();
                    setCompanyName(data.name || '');
                    setAddress(data.address || '');
                    setPhone(data.phone || '');
                    setEmail(data.email || '');
                    setWebsite(data.website || '');
                    setLogo(data.logo || '');
                }

                const loginRef = doc(db, 'settings', LOGIN_SETTINGS_DOC_ID);
                const loginSnap = await getDoc(loginRef);
                if (loginSnap.exists()) {
                    const data = loginSnap.data();
                    setLoginTitle(data.title || 'IMIS Pro');
                    setLoginDescription(data.description || 'Enter your credentials to access your workspace');
                    setLoginBg(data.background || '');
                }

            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({ title: "Error", description: "Could not load system settings.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Company Profile
            const companySettings: any = { name: companyName, address, phone, email, website };
            if (logoFile) {
                companySettings.logo = await fileToDataUri(logoFile);
            } else {
                companySettings.logo = logo;
            }
            await setDoc(doc(db, 'settings', COMPANY_SETTINGS_DOC_ID), companySettings, { merge: true });

            // Login Screen
            const loginSettings: any = { title: loginTitle, description: loginDescription };
            if (loginBgFile) {
                loginSettings.background = await fileToDataUri(loginBgFile);
            } else {
                loginSettings.background = loginBg;
            }
            await setDoc(doc(db, 'settings', LOGIN_SETTINGS_DOC_ID), loginSettings, { merge: true });

            toast({ title: "Success", description: "Settings saved successfully.", variant: "success" });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="General Settings"
                description="Manage system-wide settings including company profile and appearance."
                icon={<Settings className="h-6 w-6 text-yellow-500" />}
            />
            <Tabs defaultValue="company">
                <TabsList>
                    <TabsTrigger value="company"><Building2 className="mr-2 h-4 w-4" />Company Profile</TabsTrigger>
                    <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" />Login Screen</TabsTrigger>
                </TabsList>
                <TabsContent value="company" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Company Details</CardTitle>
                                    <CardDescription>This information will appear on your invoices, purchase orders, and other documents.</CardDescription>
                                </div>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {isSaving ? 'Saving...' : 'Save All Settings'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-start gap-6">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="company-name">Company Name</Label>
                                    <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Logo</Label>
                                    {logo && <Image src={logo} alt="Company Logo" width={100} height={50} className="border p-2 rounded-md" data-ai-hint="logo"/>}
                                    <Input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} accept="image/*" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="login" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Login Screen Customization</CardTitle>
                            <CardDescription>Personalize the appearance of the application's login page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="login-title">Form Title</Label>
                                <Input id="login-title" value={loginTitle} onChange={(e) => setLoginTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-description">Form Description</Label>
                                <Textarea id="login-description" value={loginDescription} onChange={(e) => setLoginDescription(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label>Background Image</Label>
                                {loginBg && <Image src={loginBg} alt="Login Background" width={200} height={120} className="border p-2 rounded-md object-cover" data-ai-hint="background"/>}
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file-bg" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-primary" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        </div>
                                        <Input id="dropzone-file-bg" type="file" className="hidden" onChange={(e) => setLoginBgFile(e.target.files?.[0] || null)} accept="image/*"/>
                                    </label>
                                </div> 
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
