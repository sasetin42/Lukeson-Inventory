
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
import { Loader2, LayoutGrid, Upload, X, Image as ImageIcon, AlignLeft, ListTree } from 'lucide-react';
import type { ItemCategory } from '@/lib/types';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

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
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // Kept for UI state, though no real upload happens
    const [allCategories, setAllCategories] = useState<ItemCategory[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) return;
        
        try {
            const storedCategories = localStorage.getItem('categories');
            if(storedCategories) {
                setAllCategories(JSON.parse(storedCategories));
            }
        } catch(error) {
            console.error("Failed to load categories from local storage", error);
        }

    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setName(category.name || '');
                setDescription(category.description || '');
                setParentId(category.parentId || '');
                setImagePreview(category.productImage || null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, category]);

    const resetForm = () => {
        removeImage();
        setName('');
        setDescription('');
        setParentId('');
        setIsSaving(false);
        setIsUploading(false);
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
        setIsSaving(true);
        
        try {
            const categoryData = {
                name,
                description,
                parentId: parentId === 'none' ? '' : parentId,
                productImage: imagePreview || '',
            };

            if (category) {
                await onUpdateCategory(category.id, categoryData);
            } else {
                await onAddCategory(categoryData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save category", error);
            toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update the details of this category.' : 'Enter the details for the new category.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-purple-500" /> Category Image</Label>
                        {imagePreview ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                <Image src={imagePreview} alt="Category preview" layout="fill" objectFit="cover" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={removeImage}
                                    disabled={isSaving || isUploading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file-category" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg ${isUploading ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer bg-muted hover:bg-muted/80'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 mb-4 text-primary animate-spin" />
                                        ) : (
                                            <Upload className="w-8 h-8 mb-4 text-primary" />
                                        )}
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            {isUploading ? 'Processing...' : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                                        </p>
                                    </div>
                                    <Input id="dropzone-file-category" type="file" className="hidden" onChange={handleImageChange} accept="image/*" disabled={isUploading || isSaving}/>
                                </label>
                            </div> 
                        )}
                    </div>
                
                    <div className="space-y-2">
                        <Label htmlFor="category-name" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-red-500" /> Category Name</Label>
                        <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LED Striplights" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2"><AlignLeft className="h-4 w-4 text-gray-500" /> Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter category description" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="parent-category" className="flex items-center gap-2"><ListTree className="h-4 w-4 text-blue-500" /> Parent Category</Label>
                        <Select onValueChange={setParentId} value={parentId}>
                            <SelectTrigger id="parent-category">
                                <SelectValue placeholder="Select a parent category (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {allCategories.filter(c => c.id !== category?.id).map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving || isUploading}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving || isUploading}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : (category ? 'Save Changes' : 'Add Category')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
