
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, Supplier, ItemCategory, Warehouse as WarehouseType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Upload, X, Loader2, FileText, LayoutGrid, Truck, Image as ImageIcon, Package, DollarSign, Barcode, AlignLeft, Lightbulb, Zap, Power, Ruler, Scaling, MapPin, Warehouse, AlertTriangle, CalendarClock, Building2, Percent, Layers, PowerOff, Lamp, Square, Palette, StretchHorizontal, User } from 'lucide-react';
import Image from 'next/image';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

interface ProductFormProps {
  product: Product | null;
  onSuccess: (productData: Omit<Product, 'id' | 'createdAt'> & {id?: string; imageFile?: File | null}) => void;
  onCancel: () => void;
}

const uomOptions = ["pcs", "box", "roll", "m", "kg", "pack"];
const ledQtyOptions = ["240", "180", "120", "72", "60"];
const voltageOptions = ["220", "24", "12"];
const powerSupplyVoltageOptions = ["48", "24", "12"];

const categoryIcons: { [key: string]: React.ReactElement } = {
    'STRIPLIGHT': <Layers className="h-4 w-4 text-blue-500" />,
    'POWER SUPPLY': <PowerOff className="h-4 w-4 text-green-500" />,
    'GENERAL LIGHTING': <Lamp className="h-4 w-4 text-yellow-500" />,
    'ALUMINIUM PROFILE': <Square className="h-4 w-4 text-gray-500" />,
};

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    // Form state
    const [productCode, setProductCode] = useState('');
    const [category, setCategory] = useState('');
    const [productName, setProductName] = useState('');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [supplierContact, setSupplierContact] = useState('');
    const [location, setLocation] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uom, setUom] = useState('');
    const [stock, setStock] = useState('');
    const [price, setPrice] = useState('');
    const [reOrderLevel, setReOrderLevel] = useState('');
    const [expiryDateTracking, setExpiryDateTracking] = useState(false);
    
    // Category specific fields
    const [ledQty, setLedQty] = useState('');
    const [voltage, setVoltage] = useState('');
    const [wattage, setWattage] = useState('');
    const [meters, setMeters] = useState('');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');


    useEffect(() => {
        const suppliersRef = collection(db, 'suppliers');
        const categoriesRef = collection(db, 'categories');
        const warehousesRef = collection(db, 'warehouses');

        const unsubscribeSuppliers = onSnapshot(suppliersRef, (snapshot) => {
            const loadedSuppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
            setSuppliers(loadedSuppliers);
        });

        const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
            const loadedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemCategory));
            setCategories(loadedCategories);
        });

        const fetchWarehouses = async () => {
            const snapshot = await getDocs(warehousesRef);
            const loadedWarehouses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WarehouseType));
            setWarehouses(loadedWarehouses);
        }
        fetchWarehouses();

        return () => {
            unsubscribeSuppliers();
            unsubscribeCategories();
        };
    }, []);

    const resetForm = (keepCategory = false) => {
        removeImage();
        setProductCode('');
        if (!keepCategory) setCategory('');
        setProductName('');
        setSku('');
        setDescription('');
        setLedQty('');
        setVoltage('');
        setWattage('');
        setMeters('');
        setSupplierName('');
        setSupplierContact('');
        setLocation('');
        setIsSaving(false);
        setUom('');
        setStock('');
        setPrice('');
        setReOrderLevel('');
        setExpiryDateTracking(false);
        setUploadProgress(null);
        setSize('');
        setColor('');
    };
    
    useEffect(() => {
        const generateProductCode = async () => {
            const productsRef = collection(db, 'products');
            const snapshot = await getDocs(productsRef);
            const productsCount = snapshot.size;
            const year = new Date().getFullYear();
            setProductCode(`PRO-${year}-${(productsCount + 1).toString().padStart(3, '0')}`);
        };

        if (product) {
            setProductCode(product.productCode || '');
            setCategory(product.category || '');
            setProductName(product.name || '');
            setSku(product.sku || '');
            setDescription(product.description || '');
            setLedQty(product.ledQty?.toString() || '');
            setVoltage(product.voltage?.toString() || '');
            setWattage(product.wattage?.toString() || '');
            setMeters(product.meters?.toString() || '');
            setSupplierName(product.supplier?.name || '');
            setSupplierContact(product.supplier?.contact || '');
            setLocation(product.location || '');
            setImagePreview(product.productImage || null); 
            setImageFile(null);
            setUom(product.uom || '');
            setStock(product.stock?.toString() || '');
            setPrice(product.price?.toString() || '0');
            setReOrderLevel(product.reOrderLevel?.toString() || '');
            setExpiryDateTracking(product.expiryDateTracking || false);
            setSize(product.size || '');
            setColor(product.color || '');
        } else {
            resetForm();
            generateProductCode();
        }
    }, [product]);

    useEffect(() => {
        // Reset non-common fields when category changes
        setLedQty('');
        setVoltage('');
        setWattage('');
        setMeters('');
        setSize('');
        setColor('');
    }, [category]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "File too large",
                    description: "Please upload an image smaller than 5MB.",
                    variant: "destructive",
                });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const validateForm = () => {
        // Validation removed as per user request
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
    
        setIsSaving(true);
        setUploadProgress(0);
    
        try {
            const stockNum = Number(stock) || 0;
            const reOrderLevelNum = Number(reOrderLevel) || 0;
            let stockStatus = product?.status || 'In Stock';
            if (product?.status !== 'Discontinued') {
                stockStatus = stockNum > 0
                    ? (stockNum <= reOrderLevelNum ? 'Low Stock' : 'In Stock')
                    : 'Out of Stock';
            }
    
            const productData: Omit<Product, 'id' | 'createdAt'> & { id?: string, imageFile?: File | null } = {
                id: product?.id,
                productCode,
                name: productName,
                sku,
                category,
                description,
                supplier: {
                    name: supplierName,
                    contact: supplierContact,
                },
                location,
                productImage: imagePreview,
                stock: stockNum,
                price: Number(price) || 0,
                reOrderLevel: reOrderLevelNum,
                uom,
                expiryDateTracking,
                status: stockStatus,
                imageFile,
                modifiedAt: new Date().toISOString(),
            };
    
            if (category === 'STRIPLIGHT') {
                if (ledQty) productData.ledQty = parseInt(ledQty);
                if (voltage) productData.voltage = parseInt(voltage);
                if (wattage) productData.wattage = Number(wattage);
                if (meters) productData.meters = Number(meters);
            }
    
            if (category === 'POWER SUPPLY') {
                if (voltage) productData.voltage = parseInt(voltage);
                if (wattage) productData.wattage = Number(wattage);
            }
    
            if (category === 'ALUMINIUM PROFILE') {
                if (size) productData.size = size;
                if (color) productData.color = color;
            }
    
            onSuccess(productData);
    
        } catch (error) {
            console.error("Failed to save product:", error);
            toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
        } finally {
            setIsSaving(false);
            setUploadProgress(null);
        }
    };
    
    const handleSupplierChange = (supplierId: string) => {
        const selected = suppliers.find(s => s.id === supplierId);
        if (selected) {
            setSupplierName(selected.name);
            setSupplierContact(selected.contact.name);
        }
    };


    const renderSharedFields = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="product-code" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Product Code</Label>
                    <Input id="product-code" value={productCode} disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-red-500" /> Product Category</Label>
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>
                                    <div className="flex items-center gap-2">
                                        {categoryIcons[cat.name.toUpperCase()] || <Package className="h-4 w-4" />}
                                        {cat.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="supplier" className="flex items-center gap-2"><Truck className="h-4 w-4 text-green-500" /> Supplier</Label>
                     <Select onValueChange={handleSupplierChange} value={suppliers.find(s => s.name === supplierName)?.id}>
                        <SelectTrigger id="supplier">
                            <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                           {suppliers.map(s => (
                               <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-purple-500" /> Product Profile Image</Label>
                {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="cover" data-ai-hint="product image" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeImage} disabled={isSaving}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg ${isSaving ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer bg-muted hover:bg-muted/80'}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-primary" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" disabled={isSaving}/>
                        </label>
                    </div> 
                )}
            </div>
            
            <div className="flex gap-4">
                <div className="space-y-2 w-1/2">
                    <Label htmlFor="product-name" className="flex items-center gap-2"><Package className="h-4 w-4 text-blue-500" /> Product Name</Label>
                    <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. High-Density LED Striplight" />
                </div>
                <div className="space-y-2 w-1/4">
                    <Label htmlFor="price" className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" /> Price</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 150.00" />
                </div>
                <div className="space-y-2 w-1/4">
                    <Label htmlFor="sku" className="flex items-center gap-2"><Barcode className="h-4 w-4 text-indigo-500" /> SKU Code</Label>
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. LED-HD-240-24" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2"><AlignLeft className="h-4 w-4 text-gray-500" /> Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description" />
            </div>
        </>
    )

    const renderStriplightFields = () => (
        <>
            {renderSharedFields()}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="led-qty" className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500" /> LED Qty</Label>
                    <Select onValueChange={setLedQty} value={ledQty}>
                        <SelectTrigger id="led-qty"><SelectValue placeholder="Qty" /></SelectTrigger>
                        <SelectContent>
                            {ledQtyOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}L</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="voltage" className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Voltage</Label>
                    <Select onValueChange={setVoltage} value={voltage}>
                        <SelectTrigger id="voltage"><SelectValue placeholder="Voltage" /></SelectTrigger>
                        <SelectContent>
                            {voltageOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}v</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wattage" className="flex items-center gap-2"><Power className="h-4 w-4 text-red-500" /> Wattage</Label>
                    <Input id="wattage" type="number" value={wattage} onChange={(e) => setWattage(e.target.value)} placeholder="e.g. 19.2" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="meters" className="flex items-center gap-2"><Ruler className="h-4 w-4 text-blue-500" /> Meters</Label>
                    <Input id="meters" type="number" value={meters} onChange={(e) => setMeters(e.target.value)} placeholder="e.g. 5" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="uom" className="flex items-center gap-2"><Scaling className="h-4 w-4 text-purple-500" /> UOM</Label>
                    <Select onValueChange={setUom} value={uom}>
                        <SelectTrigger id="uom"><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>
                            {uomOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock" className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-green-500" /> Stock Qty</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 100" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reorder-level" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Reorder Level</Label>
                    <Input id="reorder-level" type="number" value={reOrderLevel} onChange={(e) => setReOrderLevel(e.target.value)} placeholder="e.g. 20" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Location</Label>
                     <Select onValueChange={setLocation} value={location}>
                        <SelectTrigger id="location">
                            <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                           {warehouses.map(w => (
                               <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    )

    const renderPowerSupplyFields = () => (
        <>
            {renderSharedFields()}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="voltage-ps" className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Voltage</Label>
                    <Select onValueChange={setVoltage} value={voltage}>
                        <SelectTrigger id="voltage-ps"><SelectValue placeholder="Select Voltage" /></SelectTrigger>
                        <SelectContent>
                            {powerSupplyVoltageOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}v</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wattage-ps" className="flex items-center gap-2"><Power className="h-4 w-4 text-red-500" /> Wattage</Label>
                    <Input id="wattage-ps" type="number" value={wattage} onChange={(e) => setWattage(e.target.value)} placeholder="e.g. 100" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="uom-ps" className="flex items-center gap-2"><Scaling className="h-4 w-4 text-purple-500" /> UOM</Label>
                    <Select onValueChange={setUom} value={uom}>
                        <SelectTrigger id="uom-ps"><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>
                            {uomOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stock-ps" className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-green-500" /> Stock Qty</Label>
                    <Input id="stock-ps" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 50" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reorder-level-ps" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Reorder Level</Label>
                    <Input id="reorder-level-ps" type="number" value={reOrderLevel} onChange={(e) => setReOrderLevel(e.target.value)} placeholder="e.g. 10" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="location-ps" className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Location</Label>
                     <Select onValueChange={setLocation} value={location}>
                        <SelectTrigger id="location-ps"><SelectValue placeholder="Select a warehouse" /></SelectTrigger>
                        <SelectContent>
                           {warehouses.map(w => (<SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    )

    const renderGeneralLightingFields = () => (
        <>
            {renderSharedFields()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="uom-gl" className="flex items-center gap-2"><Scaling className="h-4 w-4 text-purple-500" /> UOM</Label>
                    <Select onValueChange={setUom} value={uom}>
                        <SelectTrigger id="uom-gl"><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>
                            {uomOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock-gl" className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-green-500" /> Stock Qty</Label>
                    <Input id="stock-gl" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reorder-level-gl" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Reorder Level</Label>
                    <Input id="reorder-level-gl" type="number" value={reOrderLevel} onChange={(e) => setReOrderLevel(e.target.value)} placeholder="e.g. 50" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location-gl" className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Location</Label>
                    <Select onValueChange={setLocation} value={location}>
                        <SelectTrigger id="location-gl"><SelectValue placeholder="Select a warehouse" /></SelectTrigger>
                        <SelectContent>
                           {warehouses.map(w => (<SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    )

    const renderAluminiumProfileFields = () => (
        <>
            {renderSharedFields()}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="size-ap" className="flex items-center gap-2"><StretchHorizontal className="h-4 w-4" /> Size</Label>
                    <Input id="size-ap" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 2m x 17mm x 8mm" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="color-ap" className="flex items-center gap-2"><Palette className="h-4 w-4" /> Color</Label>
                    <Input id="color-ap" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Silver, Black" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="uom-ap" className="flex items-center gap-2"><Scaling className="h-4 w-4 text-purple-500" /> UOM</Label>
                    <Select onValueChange={setUom} value={uom}>
                        <SelectTrigger id="uom-ap"><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>
                            {uomOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stock-ap" className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-green-500" /> Stock Qty</Label>
                    <Input id="stock-ap" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 100" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reorder-level-ap" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Reorder Level</Label>
                    <Input id="reorder-level-ap" type="number" value={reOrderLevel} onChange={(e) => setReOrderLevel(e.target.value)} placeholder="e.g. 20" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="location-ap" className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Location</Label>
                     <Select onValueChange={setLocation} value={location}>
                        <SelectTrigger id="location-ap">
                            <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                           {warehouses.map(w => (
                               <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    )

    const renderFormFields = () => {
        switch (category) {
            case 'STRIPLIGHT':
                return renderStriplightFields();
            case 'POWER SUPPLY':
                return renderPowerSupplyFields();
            case 'GENERAL LIGHTING':
                return renderGeneralLightingFields();
            case 'ALUMINIUM PROFILE':
                return renderAluminiumProfileFields();
            default:
                return (
                    <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-code" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Product Code</Label>
                                <Input id="product-code" value={productCode} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-red-500" /> Product Category</Label>
                                <Select onValueChange={setCategory} value={category}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category to begin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.name}>
                                                <div className="flex items-center gap-2">
                                                    {categoryIcons[cat.name.toUpperCase()] || <Package className="h-4 w-4" />}
                                                    {cat.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Please select a category to see relevant fields.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="grid gap-6 py-4">
           {renderFormFields()}
            {category && (
                 <div className="flex justify-end gap-2">
                    <Button variant="cancel" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : (product ? 'Save Changes' : 'Add Product')}
                    </Button>
                </div>
            )}
        </div>
    );
}
