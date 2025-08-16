
'use client';
import { useState } from 'react';
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

interface AddProductModalProps {
  children: React.ReactNode;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status'>) => void;
}

export default function AddProductModal({ children, onAddProduct }: AddProductModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [stock, setStock] = useState(0);
    const [cost, setCost] = useState(0);
    const [reOrderLevel, setReOrderLevel] = useState(0);
    const [imageUrl] = useState('https://placehold.co/48x48.png');

    const handleSubmit = () => {
        const newProduct = {
            name,
            sku,
            stock,
            cost,
            reOrderLevel,
            imageUrl,
        };
        onAddProduct(newProduct);
        setOpen(false);
        // Reset form
        setName('');
        setSku('');
        setStock(0);
        setCost(0);
        setReOrderLevel(0);
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">
              SKU
            </Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
                Category
            </Label>
            <Select onValueChange={(value) => {
                // In a real app, you'd likely set a categoryId
                console.log(value);
            }}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(categoryMap).filter((v, i, a) => a.indexOf(v) === i).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              Cost
            </Label>
            <Input id="cost" type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reorder-level" className="text-right">
              Re-order Level
            </Label>
            <Input id="reorder-level" type="number" value={reOrderLevel} onChange={(e) => setReOrderLevel(Number(e.target.value))} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
