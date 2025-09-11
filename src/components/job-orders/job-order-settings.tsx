

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { processImage } from '@/lib/image-utils';

const TEMPLATE_DOC_ID = 'jobOrder';

export default function JobOrderSettings() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [accentColor, setAccentColor] = useState('#F97316');
    const [showDueDate, setShowDueDate] = useState(true);
    const [showNotes, setShowNotes] = useState(true);
    const [showVat, setShowVat] = useState(true);

    const [companyName, setCompanyName] = useState('LUKESON LIGHTING COMPANY');
    const [address, setAddress] = useState('20 Genoveva, Novaliches, Quezon City, Metro Manila');
    const [phone, setPhone] = useState('Phone: +63 912 378 5841');
    const [email, setEmail] = useState('sales@lukesonlighting.com.ph');
    const [website, setWebsite] = useState('https://lukesonlighting.com.ph/');
    const [logo, setLogo] = useState('https://firebasestorage.googleapis.com/v0/b/lukeson-inventory.appspot.com/o/e903a953-ab33-4f9e-953e-5390916e6373.png?alt=media');
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [verifiedBy, setVerifiedBy] = useState('_________________________\nCustomer signature over printed name');

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
                const docSnap = await getDoc(templateRef);

                if (docSnap.exists()) {
                    const settings = docSnap.data();
                    setAccentColor(settings.accentColor || '#F97316');
                    setShowDueDate(settings.showDueDate !== false);
                    setShowNotes(settings.showNotes !== false);
                    setShowVat(settings.showVat !== false);
                    setCompanyName(settings.companyName || 'LUKESON LIGHTING COMPANY');
                    setAddress(settings.address || '20 Genoveva, Novaliches, Quezon City, Metro Manila');
                    setPhone(settings.phone || 'Phone: +63 912 378 5841');
                    setEmail(settings.email || 'sales@lukesonlighting.com.ph');
                    setWebsite(settings.website || 'https://lukesonlighting.com.ph/');
                    setLogo(settings.logo || 'https://firebasestorage.googleapis.com/v0/b/lukeson-inventory.appspot.com/o/e903a953-ab33-4f9e-953e-5390916e6373.png?alt=media');
                    setVerifiedBy(settings.verifiedBy || '_________________________\nCustomer signature over printed name');
                }
            } catch (error) {
                console.error("Error fetching template settings:", error);
                toast({
                    title: "Error Loading Template",
                    description: "Could not load saved template settings. Reverting to default.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [toast]);

    const handleSave = async () => {
        setIsSaving(true);
        let finalLogo = logo;
        if (logoFile) {
            try {
                finalLogo = await processImage(logoFile);
            } catch (error: any) {
                toast({ title: "Error Processing Image", description: error.message, variant: "destructive" });
                setIsSaving(false);
                return;
            }
        }
        
        const settings = {
            accentColor, showDueDate, showNotes, showVat, companyName, address, phone, email, website, logo: finalLogo,
            verifiedBy,
        };

        try {
            const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
            await setDoc(templateRef, settings, { merge: true });
            toast({
                title: 'Template Saved',
                description: 'Your job order template has been updated.',
                variant: 'success',
            });
        } catch (error) {
            console.error("Error saving template settings:", error);
            toast({
                title: "Error Saving Template",
                description: "Could not save your template settings.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setLogoFile(file);
            try {
                const compressedDataUrl = await processImage(file);
                setLogo(compressedDataUrl);
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
    
    const renderSignature = (text: string) => {
        const [name, ...labelParts] = text.split('\n');
        const label = labelParts.join('\n');
        return (
            <div>
                <p className="font-bold">{name}</p>
                <p className="text-sm border-t border-black pt-1 mt-1">{label}</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Job Order Settings</h1>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
                Changes made here will be reflected on all generated job orders. Click Save to apply.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="accent-color">Accent Color</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="accent-color"
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="p-1 h-10 w-14"
                                />
                                <Input
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-due-date">Show Due Date</Label>
                                <Switch id="show-due-date" checked={showDueDate} onCheckedChange={setShowDueDate} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-notes">Show Notes Section</Label>
                                <Switch id="show-notes" checked={showNotes} onCheckedChange={setShowNotes} />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="show-vat">Show VAT Breakdown</Label>
                                <Switch id="show-vat" checked={showVat} onCheckedChange={setShowVat} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Job Order Logo</Label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload}/>
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="company-name">Company Name</Label>
                                <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Footer Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="verified-by">Customer signature over printed name</Label>
                                <Textarea id="verified-by" value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} placeholder="Line 1: Name&#10;Line 2: Title" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-2">
                    <Card className="p-8">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-4">
                                <Image src={logo} width={100} height={50} alt="Company Logo" data-ai-hint="logo"/>
                                <div className="text-xs">
                                    <p className="font-bold text-lg" style={{ color: accentColor }}>{companyName}</p>
                                    <p>{address}</p>
                                    <p>{phone}</p>
                                    <p>{website}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold" style={{ color: accentColor }}>JOB ORDER</h2>
                                <p className="text-sm"><strong>Job Order ID:</strong> JO-2025-001</p>
                                <p className="text-sm"><strong>Date:</strong> Jan 15, 2024</p>
                                {showDueDate && <p className="text-sm"><strong>Due Date:</strong> Feb 14, 2024</p>}
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className="font-bold">CLIENT:</p>
                            <p>Metro Construction Inc.</p>
                            <p>123 Main Street, Makati City</p>
                        </div>
                        
                        <table className="w-full mt-4 border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left text-white" style={{backgroundColor: accentColor}}>Description</th>
                                    <th className="p-2 text-left text-white" style={{backgroundColor: accentColor}}>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2">Custom Fabrication - Item A</td>
                                    <td className="p-2">2</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">Installation Service B</td>
                                    <td className="p-2">1</td>
                                </tr>
                            </tbody>
                        </table>
                        

                         {showNotes && (
                            <div className="mt-8">
                                <h4 className="font-bold">Notes:</h4>
                                <p className="text-sm text-muted-foreground">Sample notes for the job order...</p>
                            </div>
                        )}

                        <div className="flex justify-end mt-24 text-center">
                            {renderSignature(verifiedBy)}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
