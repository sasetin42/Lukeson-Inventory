
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
import { Loader2, LayoutGrid } from 'lucide-react';
import type { ItemCategory } from '@/lib/types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: Omit<ItemCategory, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateCategory: (categoryId: string, category: Partial<ItemCategory>) => Promise<void>;
  category: ItemCategory | null;
}

export default function CategoryFormModal({ 
    isOpen, 
    onClose, 
    onAddCategory, 
    onUpdateCategory,
    category,
}: CategoryFormModalProps) {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setName(category.name || '');
            } else {
                setName('');
            }
        }
    }, [isOpen, category]);

    const handleSubmit = async () => {
        setIsSaving(true);
        const categoryData = {
            name,
        };

        try {
            if (category) {
                await onUpdateCategory(category.id, categoryData);
            } else {
                await onAddCategory(categoryData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save category", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update the details of this category.' : 'Enter the name for the new category.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="category-name" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-red-500" /> Category Name</Label>
                        <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LED Striplights" />
                    </div>
                    {/* Add parent category selector here if needed */}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {category ? 'Save Changes' : 'Add Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
