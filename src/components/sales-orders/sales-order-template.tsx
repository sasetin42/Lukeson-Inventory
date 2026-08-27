

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

const TEMPLATE_DOC_ID = 'salesOrder';

export default function SalesOrderTemplate() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [accentColor, setAccentColor] = useState('#0A3BA3');
    const [showDueDate, setShowDueDate] = useState(true);
    const [showNotes, setShowNotes] = useState(true);
    const [showVat, setShowVat] = useState(true);

    const [companyName, setCompanyName] = useState('LUKESON LIGHTING AND ELECTRICAL SERVICES COMPANY');
    const [address, setAddress] = useState('20 Genoveva St. Brgy. Gulod Novaliches, 1114 Quezon City, Philippines.');
    const [phone, setPhone] = useState('Phone: 09176018881 | 09178162341');
    const [email, setEmail] = useState('contact@lukesonlighting.com.ph');
    const [website, setWebsite] = useState('https://www.lukesonlighting.com.ph');
    const [logo, setLogo] = useState('https://placehold.co/100x50.png');
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [verifiedBy, setVerifiedBy] = useState('HIROYOSHI KANAZAWA - VP\nCustomer signature over printed name');


    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
                const docSnap = await getDoc(templateRef);

                if (docSnap.exists()) {
                    const settings = docSnap.data() || {};
                    setAccentColor(settings.accentColor || '#0A3BA3');
                    setShowDueDate(settings.showDueDate !== false);
                    setShowNotes(settings.showNotes !== false);
                    setShowVat(settings.showVat !== false);
                    const cName = settings.companyName === 'YAMASHITA MOLD PHILIPPINES CORPORATION' || settings.companyName === 'LUKESON COMPANY' || !settings.companyName
                        ? 'LUKESON LIGHTING AND ELECTRICAL SERVICES COMPANY' 
                        : settings.companyName;
                    const cAddr = settings.address?.includes('Daichi') || settings.address === '20 Genoveva, Novaliches, Quezon City, Metro Manila' || !settings.address
                        ? '20 Genoveva St. Brgy. Gulod Novaliches, 1114 Quezon City, Philippines.' 
                        : settings.address;
                    const cPhone = settings.phone?.includes('972-1848') || settings.phone?.includes('912 378 5841') || !settings.phone
                        ? 'Phone: 09176018881 | 09178162341' 
                        : settings.phone;
                    const cWeb = settings.website?.includes('yamashitamold') || settings.website === 'https://lukesonlighting.com.ph/' || !settings.website
                        ? 'https://www.lukesonlighting.com.ph' 
                        : settings.website;

                    setCompanyName(cName);
                    setAddress(cAddr);
                    setPhone(cPhone);
                    setEmail(settings.email || 'contact@lukesonlighting.com.ph');
                    setWebsite(cWeb);
                    setLogo(settings.logo || 'https://placehold.co/100x50.png');
                    setVerifiedBy(settings.verifiedBy || 'HIROYOSHI KANAZAWA - VP\nCustomer signature over printed name');
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
    }, []);

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
                description: 'Your sales order template has been updated.',
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
                <h1 className="text-2xl font-bold">Sales Order Template Customizer</h1>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Template'}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
                Changes made here will be reflected on all generated sales orders. Click Save to apply.
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
                                <Label>Sales Order LOGO</Label>
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
                    <Card className="p-6">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <Image src={logo} width={56} height={56} style={{ width: 'auto', height: 'auto' }} className="max-h-12 max-w-16 object-contain shrink-0" alt="Company Logo" data-ai-hint="logo"/>
                                <div>
                                    <p className="font-bold text-[15px] leading-tight" style={{ color: accentColor }}>{companyName}</p>
                                    <div className="text-[11px] leading-snug text-neutral-600 mt-0.5 space-y-0.5">
                                        <p>{address}</p>
                                        <p>{phone}</p>
                                        <p>{website}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-[16px] leading-tight" style={{ color: accentColor }}>SALES ORDER</h2>
                                <div className="text-[11px] leading-snug text-neutral-700 mt-0.5 space-y-0.5">
                                    <p><strong>SO:</strong> SO-2025-001</p>
                                    <p>
                                        <span><strong>Date:</strong> Jan 15, 2024</span>
                                        {showDueDate && (
                                            <>
                                                <span className="mx-1.5 text-neutral-400">|</span>
                                                <span><strong>Due Date:</strong> Feb 14, 2024</span>
                                            </>
                                        )}
                                    </p>
                                    <p><strong>Delivery Receipt:</strong> SO-2025-002</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-xs">
                            <p className="text-[11px] font-bold text-neutral-900 mb-0.5">BILL TO:</p>
                            <div className="text-[11px] leading-tight text-neutral-700 space-y-0.5">
                                <p className="font-medium text-neutral-900">Metro Construction Inc.</p>
                                <p>123 Main Street, Makati City</p>
                            </div>
                        </div>
                        
                        <table className="w-full mt-3 border-collapse text-xs">
                            <thead>
                                <tr>
                                    <th className="p-1.5 text-left text-white font-semibold" style={{backgroundColor: accentColor}}>Description</th>
                                    <th className="p-1.5 text-right text-white font-semibold w-16" style={{backgroundColor: accentColor}}>Qty</th>
                                    <th className="p-1.5 text-right text-white font-semibold w-24" style={{backgroundColor: accentColor}}>Unit Price</th>
                                    <th className="p-1.5 text-right text-white font-semibold w-24" style={{backgroundColor: accentColor}}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-1.5">Product A</td>
                                    <td className="p-1.5 text-right font-medium">2</td>
                                    <td className="p-1.5 text-right">₱5,000.00</td>
                                    <td className="p-1.5 text-right font-medium">₱10,000.00</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-1.5">Service B</td>
                                    <td className="p-1.5 text-right font-medium">1</td>
                                    <td className="p-1.5 text-right">₱1,500.00</td>
                                    <td className="p-1.5 text-right font-medium">₱1,500.00</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div className="flex justify-end mt-3">
                            <div className="w-1/2 md:w-5/12 text-xs space-y-0.5">
                                {showVat && (
                                    <>
                                        <div className="flex justify-between text-[11px] py-0.5"><span>Vatable Sales:</span> <span>₱0.00</span></div>
                                        <div className="flex justify-between text-[11px] py-0.5"><span>VAT-Exempt Sales:</span> <span>₱0.00</span></div>
                                        <div className="flex justify-between text-[11px] py-0.5"><span>Zero-Rated Sales:</span> <span>₱0.00</span></div>
                                    </>
                                )}
                                <div className="flex justify-between font-semibold text-[11px] py-0.5"><span>Total Sales:</span> <span>₱11,500.00</span></div>
                                <div className="flex justify-between text-[11px] py-0.5"><span>Subtotal:</span> <span>₱11,500.00</span></div>
                                {showVat && <div className="flex justify-between text-[11px] py-0.5"><span>VAT (12%):</span> <span>₱1,380.00</span></div>}
                                <div className="flex justify-between font-bold text-sm mt-1.5 pt-1.5 border-t-2" style={{borderColor: accentColor}}>
                                    <span>Total:</span>
                                    <span>₱12,880.00</span>
                                </div>
                            </div>
                        </div>

                         {showNotes && (
                            <div className="mt-4 text-xs">
                                <h4 className="font-bold text-[11px]">Notes:</h4>
                                <p className="text-[11px] text-muted-foreground">Sample notes for the sales order...</p>
                            </div>
                        )}

                        <div className="flex justify-end mt-10 text-center text-xs">
                            {renderSignature(verifiedBy)}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
