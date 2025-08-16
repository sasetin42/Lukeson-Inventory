
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
import { Product } from '@/lib/types';
import { categoryMap } from '@/lib/category-map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Upload, X, Loader2 } from 'lucide-react';
import { suppliers } from '@/lib/data';
import Image from 'next/image';

interface AddProductModalProps {
  children: React.ReactNode;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status'>) => void;
  totalProducts: number;
}

export default function AddProductModal({ children, onAddProduct, totalProducts }: AddProductModalProps) {
    const [open, setOpen] = useState(false);
    const [productCode, setProductCode] = useState('');
    
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

    useEffect(() => {
        if (open) {
            const year = new Date().getFullYear();
            const nextId = (totalProducts + 1).toString().padStart(3, '0');
            setProductCode(`PRO-${year}-${nextId}`);
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
    };

    const handleSubmit = () => {
        const newProduct: Omit<Product, 'id' | 'createdAt' | 'status'> = {
            productCode,
            name: productName,
            sku,
            category,
            description,
            ledQty: Number(ledQty) || 0,
            voltage: Number(voltage) || 0,
            wattage: Number(wattage) || 0,
            meters: Number(meters) || 0,
            supplier,
            location,
            imageUrl: imagePreview || 'https://placehold.co/48x48.png',
            stock: 0, 
            cost: 0,
            reOrderLevel: 0,
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
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">All images uploaded to the entire system will be optimized and automatically converted into WebP.</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div> 
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. High-Density LED Striplight" />
                </div>
                <div className="space-y-2">
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
                    <Input id="led-qty" value={ledQty} onChange={(e) => setLedQty(e.target.value)} placeholder="e.g. 240" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="voltage">Voltage</Label>
                    <Input id="voltage" value={voltage} onChange={(e) => setVoltage(e.target.value)} placeholder="e.g. 24v" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="wattage">Wattage</Label>
                    <Input id="wattage" value={wattage} onChange={(e) => setWattage(e.target.value)} placeholder="e.g. 19.2w" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="meters">Meters</Label>
                    <Input id="meters" value={meters} onChange={(e) => setMeters(e.target.value)} placeholder="e.g. 5" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Warehouse A, Shelf 3" />
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
