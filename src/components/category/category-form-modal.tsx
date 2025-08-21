
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
import { Loader2, LayoutGrid, FileText, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import type { ItemCategory } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<ItemCategory, 'id' | 'createdAt'> & {id?: string}) => void;
  onDelete: (categoryId: string) => void;
  category: ItemCategory | null;
  categories: ItemCategory[];
}

export default function CategoryFormModal({ 
    isOpen, 
    onClose, 
    onSave,
    onDelete,
    category,
    categories,
}: CategoryFormModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (editingCategory) {
                setName(editingCategory.name || '');
                setDescription(editingCategory.description || '');
                setImagePreview(editingCategory.productImage || null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, editingCategory]);
    
    useEffect(() => {
        setEditingCategory(category);
    }, [category]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        setEditingCategory(null);
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
        
        try {
            // With local storage, we can store the image as a data URL.
            let imageUrl = editingCategory?.productImage || imagePreview || '';

            const categoryData: Omit<ItemCategory, 'id' | 'createdAt'> & {id?: string} = {
                id: editingCategory?.id,
                name,
                description,
                productImage: imageUrl,
            };

            onSave(categoryData);
            resetForm();

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
    
    const handleEditClick = (cat: ItemCategory) => {
        setEditingCategory(cat);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>
                        {editingCategory ? 'Update the details of this category.' : 'Enter the details for the new category.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 py-4">
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
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Existing Categories</h3>
                        <Separator />
                        <ScrollArea className="h-[450px] pr-4">
                           <div className="space-y-4">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-start gap-4 p-3 rounded-lg border">
                                        {cat.productImage && <Image src={cat.productImage} alt={cat.name} width={64} height={64} className="rounded-md" data-ai-hint="category image" />}
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{cat.name}</h4>
                                            <p className="text-sm text-muted-foreground">{cat.description}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(cat)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(cat.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                           </div>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingCategory ? 'Save Changes' : 'Add Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
