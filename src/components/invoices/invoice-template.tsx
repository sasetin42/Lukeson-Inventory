

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

const TEMPLATE_DOC_ID = 'invoice';

export default function InvoiceTemplate() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [accentColor, setAccentColor] = useState('#0A3BA3');
    const [showDueDate, setShowDueDate] = useState(true);
    const [showNotes, setShowNotes] = useState(true);
    const [showVat, setShowVat] = useState(true);

    const [companyName, setCompanyName] = useState('YAMASHITA MOLD PHILIPPINES CORPORATION');
    const [tin, setTin] = useState('');
    const [address, setAddress] = useState('Lot 8, Block 1, Daichi Industrail Park-SEZ, Brgy. Maguyam, Silang, Cavite Philippines');
    const [phone, setPhone] = useState('Phone: (046) 972-1848; 430-0057; 430-0058; (02) 886-4463');
    const [email, setEmail] = useState('contact@yamashitamold.ph');
    const [website, setWebsite] = useState('www.yamashitamold.ph');
    const [logo, setLogo] = useState('https://placehold.co/100x50.png');
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [verifiedBy, setVerifiedBy] = useState('_________________________\nCustomer signature over printed name');
    
    // BIR and Printer Details
    const [birDetails, setBirDetails] = useState({
        birAtpNo: 'OCN: 028AU20250000001901',
        dateOfAtp: 'February 3, 2025',
        looseleafPermitNo: 'LLAR-028-0324-00022',
        permitDateIssue: 'March 21, 2024',
        printersName: 'A. Depano Prtg. Press',
        printersAddress: '#14 Mabituan St., Masambong Q.C.',
        printersTin: '158-832-790-00000',
        printersAccreditationNo: '038MP20240000000020',
        printersAccreditationDate: '01-11-2024',
    });
    
    const handleBirDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setBirDetails(prev => ({ ...prev, [id]: value }));
    }


    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
                const docSnap = await getDoc(templateRef);

                if (docSnap.exists()) {
                    const settings = docSnap.data();
                    setAccentColor(settings.accentColor || '#0A3BA3');
                    setShowDueDate(settings.showDueDate !== false);
                    setShowNotes(settings.showNotes !== false);
                    setShowVat(settings.showVat !== false);
                    setCompanyName(settings.companyName || 'YAMASHITA MOLD PHILIPPINES CORPORATION');
                    setTin(settings.tin || '');
                    setAddress(settings.address || 'Lot 8, Block 1, Daichi Industrail Park-SEZ, Brgy. Maguyam, Silang, Cavite Philippines');
                    setPhone(settings.phone || 'Phone: (046) 972-1848; 430-0057; 430-0058; (02) 886-4463');
                    setEmail(settings.email || 'contact@yamashitamold.ph');
                    setWebsite(settings.website || 'www.yamashitamold.ph');
                    setLogo(settings.logo || 'https://placehold.co/100x50.png');
                    setVerifiedBy(settings.verifiedBy || '_________________________\nCustomer signature over printed name');
                    if (settings.birDetails) {
                        setBirDetails(settings.birDetails);
                    }
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
            accentColor, showDueDate, showNotes, showVat, companyName, tin, address, phone, email, website, logo: finalLogo,
            verifiedBy, birDetails,
        };

        try {
            const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
            await setDoc(templateRef, settings, { merge: true });
            toast({
                title: 'Template Saved',
                description: 'Your invoice template has been updated.',
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
                <p className="font-bold text-[10px] leading-[13px] border-t border-black pt-1 mt-4">{label}</p>
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
                <h1 className="text-2xl font-bold">Invoice Template Customizer</h1>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Template'}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
                Changes made here will be reflected on all generated invoices. Click Save to apply.
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
                                <Label>Invoice & Purchase Order Logo</Label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} />
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
                                <Label htmlFor="tin">VAT REG. TIN</Label>
                                <Input id="tin" value={tin} onChange={(e) => setTin(e.target.value)} />
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
                            <CardTitle>BIR & Printer's Accreditation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label htmlFor="birAtpNo">BIR ATP No.</Label><Input id="birAtpNo" value={birDetails.birAtpNo} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="dateOfAtp">Date of ATP</Label><Input id="dateOfAtp" value={birDetails.dateOfAtp} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="looseleafPermitNo">Looseleaf Permit No.</Label><Input id="looseleafPermitNo" value={birDetails.looseleafPermitNo} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="permitDateIssue">Permit Date Issue</Label><Input id="permitDateIssue" value={birDetails.permitDateIssue} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="printersName">Printer's Name</Label><Input id="printersName" value={birDetails.printersName} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="printersAddress">Printer's Address</Label><Input id="printersAddress" value={birDetails.printersAddress} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="printersTin">Printer's TIN</Label><Input id="printersTin" value={birDetails.printersTin} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="printersAccreditationNo">Printer's Accreditation No.</Label><Input id="printersAccreditationNo" value={birDetails.printersAccreditationNo} onChange={handleBirDetailsChange} /></div>
                            <div><Label htmlFor="printersAccreditationDate">Accreditation Date</Label><Input id="printersAccreditationDate" value={birDetails.printersAccreditationDate} onChange={handleBirDetailsChange} /></div>
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
                      <div className="flex flex-col justify-between min-h-[950px]">
                        <div>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <Image src={logo} width={100} height={50} alt="Company Logo" data-ai-hint="logo"/>
                                    <div className="text-xs">
                                        <p className="font-bold text-lg" style={{ color: accentColor }}>{companyName}</p>
                                        {tin && <p><strong>VAT REG. TIN: {tin}</strong></p>}
                                        <p>{address}</p>
                                        <p>{phone}</p>
                                        <p>{website}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-bold" style={{ color: accentColor }}>INVOICE</h2>
                                    <p style={{ fontSize: '12px', lineHeight: '16px' }}><strong>Invoice ID:</strong> INV-2025-001</p>
                                    <p style={{ fontSize: '12px', lineHeight: '16px' }}><strong>Date:</strong> Jan 15, 2024</p>
                                    {showDueDate && <p style={{ fontSize: '12px', lineHeight: '16px' }}><strong>Due Date:</strong> Feb 14, 2024</p>}
                                </div>
                            </div>

                            <div className="mt-8" style={{ fontSize: '12px', lineHeight: '16px' }}>
                                <p className="font-bold">BILL TO:</p>
                                <p>Metro Construction Inc.</p>
                                <p>123 Main Street, Makati City</p>
                            </div>
                            
                            <table className="w-full mt-4 border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-left text-white" style={{backgroundColor: accentColor}}>Description</th>
                                        <th className="p-2 text-left text-white" style={{backgroundColor: accentColor}}>Qty</th>
                                        <th className="p-2 text-left text-white" style={{backgroundColor: accentColor}}>Unit Price</th>
                                        <th className="p-2 text-left text-white" style={{backgroundColor: accentColor}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-2">Product A</td>
                                        <td className="p-2">2</td>
                                        <td className="p-2">P5,000.00</td>
                                        <td className="p-2">P10,000.00</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-2">Service B</td>
                                        <td className="p-2">1</td>
                                        <td className="p-2">P1,500.00</td>
                                        <td className="p-2">P1,500.00</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div className="flex justify-between mt-4">
                                <div className="w-1/2">
                                    {showNotes && (
                                        <div>
                                            <h4 className="font-bold text-xs">Notes:</h4>
                                            <p className="text-xs text-muted-foreground">Sample notes for the invoice...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="w-1/2 text-xs space-y-1">
                                    {showVat && (
                                        <>
                                            <div className="flex justify-between"><span>Vatable Sales:</span> <span>P0.00</span></div>
                                            <div className="flex justify-between"><span>VAT-Exempt Sales:</span> <span>P0.00</span></div>
                                            <div className="flex justify-between"><span>Zero-Rated Sales:</span> <span>P0.00</span></div>
                                        </>
                                    )}
                                    <div className="flex justify-between font-bold"><span>Total Sales:</span> <span>P11,500.00</span></div>
                                    <div className="flex justify-between"><span>Subtotal:</span> <span>P11,500.00</span></div>
                                    {showVat && <div className="flex justify-between"><span>VAT (12%):</span> <span>P1,380.00</span></div>}
                                    <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t-2" style={{borderColor: accentColor}}>
                                        <span>Total Amount Due:</span>
                                        <span>P12,880.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-8">
                            <div className="text-[8px] leading-[10px] space-y-1">
                                <p>BIR ATP No. {birDetails.birAtpNo} Date of ATP: {birDetails.dateOfAtp}</p>
                                <p>Looseleaf Permit: {birDetails.looseleafPermitNo} Date Issue: {birDetails.permitDateIssue}</p>
                                <p>{birDetails.printersName} {birDetails.printersAddress}</p>
                                <p>NonVAT Reg. TIN: {birDetails.printersTin}</p>
                                <p>Printer's Accreditation No. {birDetails.printersAccreditationNo} Date Issued: {birDetails.printersAccreditationDate}</p>
                            </div>
                            <div className="text-right text-[10px] leading-[13px]">
                                <p className="mb-2">Received the above goods in good order and condition.</p>
                                <div className="mt-8">
                                    {renderSignature(verifiedBy)}
                                </div>
                            </div>
                        </div>
                      </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
