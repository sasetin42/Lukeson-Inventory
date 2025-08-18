
'use client';

import { useEffect, useState } from 'react';
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
import { Product, Supplier, ItemCategory } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Upload, X, Loader2, FileText, LayoutGrid, Truck, Image as ImageIcon, Package, DollarSign, Barcode, AlignLeft, Lightbulb, Zap, Power, Ruler, Scaling, MapPin, Warehouse, AlertTriangle, CalendarClock } from 'lucide-react';
import Image from 'next/image';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
  totalProducts: number;
}

const uomOptions = ["pcs", "box", "roll", "m", "kg", "pack"];
const ledQtyOptions = ["240", "180", "120", "72", "60"];
const voltageOptions = ["220", "24", "12"];

export default function ProductFormModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    product, 
    totalProducts 
}: ProductFormModalProps) {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    
    // Form state
    const [isSaving, setIsSaving] = useState(false);
    const [productCode, setProductCode] = useState('');
    const [category, setCategory] = useState('');
    const [productName, setProductName] = useState('');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [ledQty, setLedQty] = useState('');
    const [voltage, setVoltage] = useState('');
    const [wattage, setWattage] = useState('');
    const [meters, setMeters] = useState('');
    const [supplier, setSupplier] = useState('');
    const [location, setLocation] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uom, setUom] = useState('');
    const [stock, setStock] = useState('');
    const [cost, setCost] = useState('');
    const [price, setPrice] = useState('');
    const [reOrderLevel, setReOrderLevel] = useState('');
    const [expiryDateTracking, setExpiryDateTracking] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const suppliersUnsub = onSnapshot(collection(db, "suppliers"), (snapshot) => {
            const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
            setSuppliers(suppliersData);
        });
        
        const categoriesUnsub = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemCategory));
            setCategories(categoriesData);
        });

        return () => {
            suppliersUnsub();
            categoriesUnsub();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (product) {
                // Editing existing product
                setProductCode(product.productCode || '');
                setCategory(product.category || '');
                setProductName(product.name || '');
                setSku(product.sku || '');
                setDescription(product.description || '');
                setLedQty(product.ledQty?.toString() || '');
                setVoltage(product.voltage?.toString() || '');
                setWattage(product.wattage?.toString() || '');
                setMeters(product.meters?.toString() || '');
                setSupplier(product.supplier || '');
                setLocation(product.location || '');
                setImagePreview(product.imageUrl || null);
                setImageFile(null);
                setUom(product.uom || '');
                setStock(product.stock?.toString() || '');
                setCost(product.cost?.toString() || '');
                setPrice(product.price?.toString() || '0');
                setReOrderLevel(product.reOrderLevel?.toString() || '');
                setExpiryDateTracking(product.expiryDateTracking || false);
            } else {
                // Adding new product
                resetForm();
                const year = new Date().getFullYear();
                const nextId = (totalProducts + 1).toString().padStart(3, '0');
                setProductCode(`PRO-${year}-${nextId}`);
            }
        }
    }, [isOpen, product, totalProducts]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
    };
    
    const resetForm = () => {
        removeImage();
        setProductCode('');
        setCategory('');
        setProductName('');
        setSku('');
        setDescription('');
        setLedQty('');
        setVoltage('');
        setWattage('');
        setMeters('');
        setSupplier('');
        setLocation('');
        setIsSaving(false);
        setUom('');
        setStock('');
        setCost('');
        setPrice('');
        setReOrderLevel('');
        setExpiryDateTracking(false);
    };

    const handleSubmit = async () => {
        if (!productName) {
            toast({ title: "Validation Error", description: "Product name is required.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        let finalImageUrl = product?.imageUrl || '';

        try {
            if (imageFile) {
                toast({ title: 'Uploading Image...', description: 'Please wait...' });
                 try {
                    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
                    const uploadTask = await uploadBytes(storageRef, imageFile);
                    finalImageUrl = await getDownloadURL(uploadTask.ref);
                    toast({ title: 'Upload Successful', description: 'Image has been saved.', variant: 'success' });
                } catch (error) {
                    console.error("Image upload failed", error);
                    toast({ title: 'Image Upload Failed', description: 'Could not upload the image. Please try again.', variant: 'destructive' });
                    setIsSaving(false);
                    return;
                }
            } else if (!imagePreview && product?.imageUrl) {
                 finalImageUrl = '';
            }

            const stockNum = Number(stock) || 0;
            const reOrderLevelNum = Number(reOrderLevel) || 0;
            const stockStatus = stockNum > 0
                ? (stockNum <= reOrderLevelNum ? 'Low Stock' : 'In Stock')
                : 'Out of Stock';

            const productData = {
                productCode,
                name: productName,
                sku,
                category,
                description,
                ledQty: parseInt(ledQty) || 0,
                voltage: parseInt(voltage) || 0,
                wattage: Number(wattage) || 0,
                meters: Number(meters) || 0,
                supplier,
                location,
                imageUrl: finalImageUrl,
                stock: stockNum,
                cost: Number(cost) || 0,
                price: Number(price) || 0,
                reOrderLevel: reOrderLevelNum,
                uom,
                expiryDateTracking,
                status: product?.status === 'Discontinued' ? product.status : stockStatus,
            };
            
            if (product) {
                const productRef = doc(db, 'products', product.id);
                await updateDoc(productRef, productData);
                toast({ title: "Success", description: "Product updated successfully.", variant: "success" });
            } else {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Success", description: "Product added successfully.", variant: "success" });
            }
            onSuccess();
        } catch (error: any) {
            console.error("Operation failed", error);
            const errorMessage = error.message || 'Please try again.';
            toast({
                title: "Error Saving Product",
                description: `Failed to save product data to the database. ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update the details of this product.' : 'Fill in the details below to add a new product.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="product-code" className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-500" /> Product Code</Label>
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
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="supplier" className="flex items-center gap-2"><Truck className="h-4 w-4 text-green-500" /> Supplier</Label>
                     <Select onValueChange={setSupplier} value={supplier}>
                        <SelectTrigger id="supplier">
                            <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                           {suppliers.map(s => (
                               <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-purple-500" /> Product Image</Label>
                {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="cover" data-ai-hint="product image" />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={removeImage}
                            disabled={isSaving}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg ${isSaving ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer bg-muted hover:bg-muted/80'}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isSaving ? (
                                    <Loader2 className="w-8 h-8 mb-4 text-primary animate-spin" />
                                ) : (
                                    <Upload className="w-8 h-8 mb-4 text-primary" />
                                )}
                                <p className="mb-2 text-sm text-muted-foreground">
                                    {isSaving ? 'Processing...' : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                                </p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" disabled={isSaving}/>
                        </label>
                    </div> 
                )}
            </div>
            
            <div className="flex gap-4 items-end">
                <div className="space-y-2" style={{width: '50%'}}>
                    <Label htmlFor="product-name" className="flex items-center gap-2"><Package className="h-4 w-4 text-blue-500" /> Product Name</Label>
                    <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. High-Density LED Striplight" />
                </div>
                <div className="space-y-2" style={{width: '25%'}}>
                    <Label htmlFor="cost" className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-orange-500" /> Cost</Label>
                    <Input id="cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="e.g. 100.00" />
                </div>
                <div className="space-y-2" style={{width: '25%'}}>
                    <Label htmlFor="sku" className="flex items-center gap-2"><Barcode className="h-4 w-4 text-indigo-500" /> SKU Code</Label>
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. LED-HD-240-24" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" /> Price</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 150.00" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2"><AlignLeft className="h-4 w-4 text-gray-500" /> Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="led-qty" className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500" /> LED Qty</Label>
                    <Select onValueChange={setLedQty} value={ledQty}>
                        <SelectTrigger id="led-qty">
                            <SelectValue placeholder="Select LED Qty" />
                        </SelectTrigger>
                        <SelectContent>
                            {ledQtyOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}L</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="voltage" className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Voltage</Label>
                    <Select onValueChange={setVoltage} value={voltage}>
                        <SelectTrigger id="voltage">
                            <SelectValue placeholder="Select Voltage" />
                        </SelectTrigger>
                        <SelectContent>
                            {voltageOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}v</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="wattage" className="flex items-center gap-2"><Power className="h-4 w-4 text-red-500" /> Wattage</Label>
                    <Input id="wattage" type="number" value={wattage} onChange={(e) => setWattage(e.target.value)} placeholder="e.g. 19.2" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="meters" className="flex items-center gap-2"><Ruler className="h-4 w-4 text-blue-500" /> Meters</Label>
                    <Input id="meters" type="number" value={meters} onChange={(e) => setMeters(e.target.value)} placeholder="e.g. 5" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="uom" className="flex items-center gap-2"><Scaling className="h-4 w-4 text-purple-500" /> UOM</Label>
                    <Select onValueChange={setUom} value={uom}>
                        <SelectTrigger id="uom">
                            <SelectValue placeholder="Select a UOM" />
                        </SelectTrigger>
                        <SelectContent>
                            {uomOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Warehouse A, Shelf 3" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock" className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-green-500" /> Stock Quantity</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 100" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reorder-level" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Reorder Level</Label>
                    <Input id="reorder-level" type="number" value={reOrderLevel} onChange={(e) => setReOrderLevel(e.target.value)} placeholder="e.g. 20" />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="expiry-tracking" checked={expiryDateTracking} onCheckedChange={setExpiryDateTracking} />
                <Label htmlFor="expiry-tracking" className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-cyan-500" /> Enable Expiry Date Tracking</Label>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : (product ? 'Save Changes' : 'Add Product')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

