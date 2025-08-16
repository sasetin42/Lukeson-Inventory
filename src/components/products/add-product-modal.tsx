
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, Supplier } from '@/lib/types';
import { categoryMap } from '@/lib/category-map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, onSnapshot } from 'firebase/firestore';
import { Switch } from '../ui/switch';

interface AddProductModalProps {
  children: React.ReactNode;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status'>) => void;
  totalProducts: number;
}

const uomOptions = ["pcs", "box", "roll", "m", "kg", "pack"];
const ledQtyOptions = ["240L", "180L", "120L", "72L", "60L"];
const voltageOptions = ["220v", "24v", "12v"];

export default function AddProductModal({ children, onAddProduct, totalProducts }: AddProductModalProps) {
    const [open, setOpen] = useState(false);
    const [productCode, setProductCode] = useState('');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    
    // Form state
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
    const [isUploading, setIsUploading] = useState(false);
    const [uom, setUom] = useState('');
    const [stock, setStock] = useState('');
    const [reOrderLevel, setReOrderLevel] = useState('');
    const [expiryDateTracking, setExpiryDateTracking] = useState(false);
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (open) {
            const year = new Date().getFullYear();
            const nextId = (totalProducts + 1).toString().padStart(3, '0');
            setProductCode(`PRO-${year}-${nextId}`);
            
            const suppliersUnsub = onSnapshot(collection(db, "suppliers"), (snapshot) => {
                const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
                setSuppliers(suppliersData);
            });

            return () => suppliersUnsub();

        } else {
            // Reset form on close
            resetForm();
        }
    }, [open, totalProducts]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadstart = () => {
                setIsUploading(true);
            }
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };
    
    const resetForm = () => {
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
        setImageFile(null);
        setImagePreview(null);
        setIsUploading(false);
        setUom('');
        setStock('');
        setReOrderLevel('');
        setExpiryDateTracking(false);
        setPrice('');
    };

    const handleSubmit = async () => {
        let imageUrl = 'https://placehold.co/48x48.png';
        if (imageFile) {
            setIsUploading(true);
            const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(storageRef);
            setIsUploading(false);
        }
        
        const newProduct: Omit<Product, 'id' | 'createdAt' | 'status'> = {
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
            imageUrl: imageUrl,
            stock: Number(stock) || 0, 
            cost: 0,
            price: Number(price) || 0,
            reOrderLevel: Number(reOrderLevel) || 0,
            uom,
            expiryDateTracking,
        };
        onAddProduct(newProduct);
        setOpen(false);
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="product-code">Product Code</Label>
                    <Input id="product-code" value={productCode} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Product Category</Label>
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(categoryMap).filter((v, i, a) => a.indexOf(v) === i).map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
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
                <Label>Product Image</Label>
                {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="cover" />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={removeImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : isUploading ? (
                     <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-muted">
                        <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" />
                        <p className="text-sm text-muted-foreground">Optimizing and converting image to WebP...</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-primary" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">All images uploaded to the entire system will be optimized and automatically converted into WebP.</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div> 
                )}
            </div>

            <div className="flex gap-4">
                 <div className="space-y-2" style={{width: '50%'}}>
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. High-Density LED Striplight" />
                </div>
                <div className="space-y-2" style={{width: '25%'}}>
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 150.00" />
                </div>
                <div className="space-y-2" style={{width: '20%'}}>
                    <Label htmlFor="sku">SKU Code</Label>
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. LED-HD-240-24" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="led-qty">LED Qty</Label>
                    <Select onValueChange={setLedQty} value={ledQty}>
                        <SelectTrigger id="led-qty">
                            <SelectValue placeholder="Select LED Qty" />
                        </SelectTrigger>
                        <SelectContent>
                            {ledQtyOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="voltage">Voltage</Label>
                    <Select onValueChange={setVoltage} value={voltage}>
                        <SelectTrigger id="voltage">
                            <SelectValue placeholder="Select Voltage" />
                        </SelectTrigger>
                        <SelectContent>
                            {voltageOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="wattage">Wattage</Label>
                    <Input id="wattage" type="number" value={wattage} onChange={(e) => setWattage(e.target.value)} placeholder="e.g. 19.2" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="meters">Meters</Label>
                    <Input id="meters" type="number" value={meters} onChange={(e) => setMeters(e.target.value)} placeholder="e.g. 5" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="uom">UOM</Label>
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
                 <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Warehouse A, Shelf 3" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 100" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reorder-level">Reorder Level</Label>
                    <Input id="reorder-level" type="number" value={reOrderLevel} onChange={(e) => setReOrderLevel(e.target.value)} placeholder="e.g. 20" />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="expiry-tracking" checked={expiryDateTracking} onCheckedChange={setExpiryDateTracking} />
                <Label htmlFor="expiry-tracking">Enable Expiry Date Tracking</Label>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Product
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
