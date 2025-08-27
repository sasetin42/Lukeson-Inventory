
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Building2, Palette, LogIn, Save, Loader2, Upload, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

const COMPANY_SETTINGS_DOC_ID = 'companyProfile';
const LOGIN_SETTINGS_DOC_ID = 'loginScreen';
const LOADING_SETTINGS_DOC_ID = 'loadingScreen';

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
    const [companyLogo, setCompanyLogo] = useState('');
    const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);

    // Login Screen State
    const [loginTitle, setLoginTitle] = useState('IMIS Pro');
    const [loginDescription, setLoginDescription] = useState('Enter your credentials to access your workspace');
    const [loginBg, setLoginBg] = useState('');
    const [loginBgFile, setLoginBgFile] = useState<File | null>(null);
    const [loginLogo, setLoginLogo] = useState('');
    const [loginLogoFile, setLoginLogoFile] = useState<File | null>(null);
    const [loginFooterText, setLoginFooterText] = useState('');
    const [loginFooterLink, setLoginFooterLink] = useState('');
    
    // Loading Screen State
    const [loadingText, setLoadingText] = useState('Loading...');
    const [loadingBgColor, setLoadingBgColor] = useState('#FFFFFF');
    const [loadingLogo, setLoadingLogo] = useState('');
    const [loadingLogoFile, setLoadingLogoFile] = useState<File | null>(null);

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
                const loginRef = doc(db, 'settings', LOGIN_SETTINGS_DOC_ID);
                const loadingRef = doc(db, 'settings', LOADING_SETTINGS_DOC_ID);

                const [companySnap, loginSnap, loadingSnap] = await Promise.all([
                    getDoc(companyRef),
                    getDoc(loginRef),
                    getDoc(loadingRef),
                ]);

                if (companySnap.exists()) {
                    const data = companySnap.data();
                    setCompanyName(data.name || '');
                    setAddress(data.address || '');
                    setPhone(data.phone || '');
                    setEmail(data.email || '');
                    setWebsite(data.website || '');
                    setCompanyLogo(data.logo || '');
                }

                if (loginSnap.exists()) {
                    const data = loginSnap.data();
                    setLoginTitle(data.title || 'IMIS Pro');
                    setLoginDescription(data.description || 'Enter your credentials to access your workspace');
                    setLoginBg(data.background || '');
                    setLoginLogo(data.logo || '');
                    setLoginFooterText(data.footerText || '');
                    setLoginFooterLink(data.footerLink || '');
                }
                
                if (loadingSnap.exists()) {
                    const data = loadingSnap.data();
                    setLoadingText(data.text || 'Loading...');
                    setLoadingBgColor(data.backgroundColor || '#FFFFFF');
                    setLoadingLogo(data.logo || '');
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
            if (companyLogoFile) {
                companySettings.logo = await fileToDataUri(companyLogoFile);
            } else {
                companySettings.logo = companyLogo;
            }
            await setDoc(doc(db, 'settings', COMPANY_SETTINGS_DOC_ID), companySettings, { merge: true });

            // Login Screen
            const loginSettings: any = { 
                title: loginTitle, 
                description: loginDescription,
                footerText: loginFooterText,
                footerLink: loginFooterLink,
            };
            if (loginBgFile) {
                loginSettings.background = await fileToDataUri(loginBgFile);
            } else {
                loginSettings.background = loginBg;
            }
             if (loginLogoFile) {
                loginSettings.logo = await fileToDataUri(loginLogoFile);
            } else {
                loginSettings.logo = loginLogo;
            }
            await setDoc(doc(db, 'settings', LOGIN_SETTINGS_DOC_ID), loginSettings, { merge: true });
            
            // Loading Screen
            const loadingSettings: any = { text: loadingText, backgroundColor: loadingBgColor };
            if (loadingLogoFile) {
                loadingSettings.logo = await fileToDataUri(loadingLogoFile);
            } else {
                loadingSettings.logo = loadingLogo;
            }
            await setDoc(doc(db, 'settings', LOADING_SETTINGS_DOC_ID), loadingSettings, { merge: true });

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
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="company"><Building2 className="mr-2 h-4 w-4" />Company Profile</TabsTrigger>
                        <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" />Login Screen</TabsTrigger>
                        <TabsTrigger value="loading"><Palette className="mr-2 h-4 w-4" />Loading Screen</TabsTrigger>
                    </TabsList>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>
                <TabsContent value="company" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                            <CardDescription>This information will appear on your invoices, purchase orders, and other documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-start gap-6">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="company-name">Company Name</Label>
                                    <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Logo</Label>
                                    {companyLogo && <Image src={companyLogo} alt="Company Logo" width={100} height={50} className="border p-2 rounded-md" data-ai-hint="logo"/>}
                                    <Input type="file" onChange={(e) => setCompanyLogoFile(e.target.files?.[0] || null)} accept="image/*" />
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
                            <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <Label>Login Form Logo</Label>
                                    {loginLogo && <Image src={loginLogo} alt="Login Logo" width={80} height={80} className="border p-2 rounded-md object-contain" data-ai-hint="logo"/>}
                                    <Input type="file" onChange={(e) => setLoginLogoFile(e.target.files?.[0] || null)} accept="image/*" />
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
                            </div>
                             <div className="space-y-4 pt-4 border-t">
                                <Label className="text-base font-semibold">Footer Link</Label>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="login-footer-text">Footer Text</Label>
                                        <Input id="login-footer-text" value={loginFooterText} onChange={(e) => setLoginFooterText(e.target.value)} placeholder="e.g. Need help?"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-footer-link">Footer Link URL</Label>
                                        <Input id="login-footer-link" value={loginFooterLink} onChange={(e) => setLoginFooterLink(e.target.value)} placeholder="e.g. https://example.com/support"/>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="loading" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loading Screen</CardTitle>
                            <CardDescription>Customize the initial loading screen of the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="loading-text">Loading Text</Label>
                                    <Input id="loading-text" value={loadingText} onChange={(e) => setLoadingText(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loading-bg-color">Background Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="loading-bg-color"
                                            type="color"
                                            value={loadingBgColor}
                                            onChange={(e) => setLoadingBgColor(e.target.value)}
                                            className="p-1 h-10 w-14"
                                        />
                                        <Input
                                            value={loadingBgColor}
                                            onChange={(e) => setLoadingBgColor(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Loading Logo</Label>
                                <div className="flex items-center gap-4">
                                    {loadingLogo && <Image src={loadingLogo} alt="Loading Logo" width={80} height={80} className="border p-2 rounded-md object-contain" data-ai-hint="logo"/>}
                                    <Input type="file" onChange={(e) => setLoadingLogoFile(e.target.files?.[0] || null)} accept="image/*" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
