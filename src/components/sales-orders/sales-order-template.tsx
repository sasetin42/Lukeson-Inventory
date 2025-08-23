
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const TEMPLATE_STORAGE_KEY = 'salesOrderTemplateSettings';

export default function SalesOrderTemplate() {
    const { toast } = useToast();
    const [accentColor, setAccentColor] = useState('#0A3BA3');
    const [showDueDate, setShowDueDate] = useState(true);
    const [showNotes, setShowNotes] = useState(true);
    const [showVat, setShowVat] = useState(true);

    const [companyName, setCompanyName] = useState('YAMASHITA MOLD PHILIPPINES CORPORATION');
    const [address, setAddress] = useState('Lot 8, Block 1, Daichi Industrail Park-SEZ, Brgy. Maguyam, Silang, Cavite Philippines');
    const [phone, setPhone] = useState('Phone: (046) 972-1848; 430-0057; 430-0058; (02) 886-4463');
    const [email, setEmail] = useState('contact@yamashitamold.ph');
    const [website, setWebsite] = useState('www.yamashitamold.ph');
    const [logo, setLogo] = useState('https://placehold.co/100x50.png');

    const [preparedByLabel, setPreparedByLabel] = useState('Prepared by:');
    const [preparedByName, setPreparedByName] = useState('YMP / MCB / MJTS');
    const [receivedByLabel, setReceivedByLabel] = useState('Received by:');
    const [receivedByName, setReceivedByName] = useState('JUAN DELA CRUZ');
    const [verifiedByLabel, setVerifiedByLabel] = useState('Verified by:');
    const [verifiedByName, setVerifiedByName] = useState('HIROYOSHI KANAZAWA - VP');

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setAccentColor(settings.accentColor || '#0A3BA3');
            setShowDueDate(settings.showDueDate !== false);
            setShowNotes(settings.showNotes !== false);
            setShowVat(settings.showVat !== false);
            setCompanyName(settings.companyName || 'YAMASHITA MOLD PHILIPPINES CORPORATION');
            setAddress(settings.address || 'Lot 8, Block 1, Daichi Industrail Park-SEZ, Brgy. Maguyam, Silang, Cavite Philippines');
            setPhone(settings.phone || 'Phone: (046) 972-1848; 430-0057; 430-0058; (02) 886-4463');
            setEmail(settings.email || 'contact@yamashitamold.ph');
            setWebsite(settings.website || 'www.yamashitamold.ph');
            setLogo(settings.logo || 'https://placehold.co/100x50.png');
            setPreparedByLabel(settings.preparedByLabel || 'Prepared by:');
            setPreparedByName(settings.preparedByName || 'YMP / MCB / MJTS');
            setReceivedByLabel(settings.receivedByLabel || 'Received by:');
            setReceivedByName(settings.receivedByName || 'JUAN DELA CRUZ');
            setVerifiedByLabel(settings.verifiedByLabel || 'Verified by:');
            setVerifiedByName(settings.verifiedByName || 'HIROYOSHI KANAZAWA - VP');
        }
    }, []);

    const handleSave = () => {
        const settings = {
            accentColor, showDueDate, showNotes, showVat, companyName, address, phone, email, website, logo,
            preparedByLabel, preparedByName, receivedByLabel, receivedByName, verifiedByLabel, verifiedByName,
        };
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(settings));
        toast({
            title: 'Template Saved',
            description: 'Your sales order template has been updated.',
            variant: 'success',
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Sales Order Template Customizer</h1>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
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
                                <Label>Invoice & Purchase Order Logo</Label>
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
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
                                <Label htmlFor="prepared-by-label">"Prepared by" Label</Label>
                                <Input id="prepared-by-label" value={preparedByLabel} onChange={(e) => setPreparedByLabel(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="prepared-by-name">Name</Label>
                                <Input id="prepared-by-name" value={preparedByName} onChange={(e) => setPreparedByName(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="received-by-label">"Received by" Label</Label>
                                <Input id="received-by-label" value={receivedByLabel} onChange={(e) => setReceivedByLabel(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="received-by-name">Name</Label>
                                <Input id="received-by-name" value={receivedByName} onChange={(e) => setReceivedByName(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="verified-by-label">"Verified by" Label</Label>
                                <Input id="verified-by-label" value={verifiedByLabel} onChange={(e) => setVerifiedByLabel(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="verified-by-name">Name</Label>
                                <Input id="verified-by-name" value={verifiedByName} onChange={(e) => setVerifiedByName(e.target.value)} />
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
                                <h2 className="text-3xl font-bold" style={{ color: accentColor }}>SALES ORDER</h2>
                                <p className="text-sm"><strong>Invoice ID:</strong> SO-2025-001</p>
                                <p className="text-sm"><strong>Date:</strong> Jan 15, 2024</p>
                                {showDueDate && <p className="text-sm"><strong>Due Date:</strong> Feb 14, 2024</p>}
                                <p className="text-sm"><strong>Delivery Receipt Number:</strong> SO-2025-002</p>
                            </div>
                        </div>

                        <div className="mt-8">
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
                        
                        <div className="flex justify-end mt-4">
                            <div className="w-1/3 text-sm">
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
                                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t-2" style={{borderColor: accentColor}}>
                                    <span>Total:</span>
                                    <span>P12,880.00</span>
                                </div>
                            </div>
                        </div>

                         {showNotes && (
                            <div className="mt-8">
                                <h4 className="font-bold">Notes:</h4>
                                <p className="text-sm text-muted-foreground">Sample notes for the sales order...</p>
                            </div>
                        )}

                        <div className="flex justify-between mt-24 text-center">
                            <div>
                                <p className="font-bold">{preparedByName}</p>
                                <p className="text-sm border-t border-black pt-1 mt-1">{preparedByLabel}</p>
                            </div>
                             <div>
                                <p className="font-bold">{receivedByName}</p>
                                <p className="text-sm border-t border-black pt-1 mt-1">{receivedByLabel}</p>
                            </div>
                             <div>
                                <p className="font-bold">{verifiedByName}</p>
                                <p className="text-sm border-t border-black pt-1 mt-1">{verifiedByLabel}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
