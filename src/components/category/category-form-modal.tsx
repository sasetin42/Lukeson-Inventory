
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
import { Loader2, LayoutGrid, FileText, Image as ImageIcon } from 'lucide-react';
import type { ItemCategory } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: ItemCategory) => void;
  category: ItemCategory | null;
}

export default function CategoryFormModal({ 
    isOpen, 
    onClose, 
    onSave,
    category,
}: CategoryFormModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setName(category.name || '');
                setDescription(category.description || '');
                setImagePreview(category.productImage || null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, category]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
    }
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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

    const handleSubmit = async () => {
        if (!name) {
            toast({ title: "Validation Error", description: "Category name is required.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        
        const categoryData: Omit<ItemCategory, 'id' | 'createdAt'> = {
            name,
            description,
            productImage: imagePreview || '',
        };

        try {
            const storedCategories = localStorage.getItem('categories') || '[]';
            const categories: ItemCategory[] = JSON.parse(storedCategories);

            let newCategory: ItemCategory;

            if (category) {
                // Update
                const categoryIndex = categories.findIndex(c => c.id === category.id);
                if (categoryIndex > -1) {
                    newCategory = { ...categories[categoryIndex], ...categoryData };
                    categories[categoryIndex] = newCategory;
                } else {
                    // This case should ideally not happen if UI is correct
                    throw new Error("Category not found for updating.");
                }
                 toast({ title: "Success", description: "Category updated successfully.", variant: "success" });
            } else {
                // Add
                newCategory = {
                    ...categoryData,
                    id: new Date().toISOString(),
                    createdAt: new Date(),
                }
                categories.push(newCategory);
                toast({ title: "Success", description: "Category added successfully.", variant: "success" });
            }

            localStorage.setItem('categories', JSON.stringify(categories));
            onSave(newCategory);
            onClose();

        } catch (error: any) {
            console.error("Failed to save category:", error);
            toast({
                title: "Error Saving Category",
                description: `Failed to save category. ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update the details of this category.' : 'Enter the details for the new category.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                
                    <div className="space-y-2">
                        <Label htmlFor="category-name" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-purple-500" /> Category Name</Label>
                        <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LED Striplights" />
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-500" /> Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter category description" />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-blue-500" /> Category Image</Label>
                        {imagePreview ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                <Image src={imagePreview} alt="Category preview" layout="fill" objectFit="cover" data-ai-hint="category image" />
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
                                <label htmlFor="dropzone-file-category" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg ${isSaving ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer bg-muted hover:bg-muted/80'}`}>
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
                                    <Input id="dropzone-file-category" type="file" className="hidden" onChange={handleImageChange} accept="image/*" disabled={isSaving}/>
                                </label>
                            </div> 
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {category ? 'Save Changes' : 'Add Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
