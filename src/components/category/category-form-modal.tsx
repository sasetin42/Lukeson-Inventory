
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
import { Loader2, LayoutGrid, FileText, Image as ImageIcon, Trash2, Edit, Layers, PowerOff, Lamp, Square, Package } from 'lucide-react';
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

const categoryIcons: { [key: string]: React.ReactElement } = {
    'STRIPLIGHT': <Layers className="h-4 w-4 text-blue-500" />,
    'POWER SUPPLY': <PowerOff className="h-4 w-4 text-green-500" />,
    'GENERAL LIGHTING': <Lamp className="h-4 w-4 text-yellow-500" />,
    'ALUMINIUM PROFILE': <Square className="h-4 w-4 text-gray-500" />,
};


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
    const [currentPage, setCurrentPage] = useState(1);
    const categoriesPerPage = 5;
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

    // Pagination logic
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(categories.length / categoriesPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                        <ScrollArea className="h-[380px] pr-4">
                           <div className="space-y-2">
                                {currentCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            {categoryIcons[cat.name.toUpperCase()] || <Package className="h-4 w-4" />}
                                            <h4 className="font-semibold text-sm">{cat.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-1">
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
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
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
