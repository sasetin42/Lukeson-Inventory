
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
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, onSnapshot } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
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
    const [allCategories, setAllCategories] = useState<ItemCategory[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) return;

        const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoriesData: ItemCategory[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as ItemCategory));
            setAllCategories(categoriesData);
        });

        return () => unsubscribe();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setName(category.name || '');
                setDescription(category.description || '');
                setParentId(category.parentId || '');
                setImagePreview(category.imageUrl || null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, category]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setParentId('');
        setImageFile(null);
        setImagePreview(null);
    }
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setIsSaving(true);
                toast({ title: 'Compressing...', description: 'Please wait while the image is being optimized.' });
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                    fileType: 'image/webp',
                };
                const compressedFile = await imageCompression(file, options);
                setImageFile(compressedFile);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                    setIsSaving(false);
                    toast({ title: 'Success', description: 'Image ready for upload.', variant: 'success' });
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Image compression failed:', error);
                toast({
                    title: "Compression Failed",
                    description: "Could not compress the image. Please try a different one.",
                    variant: "destructive",
                });
                setIsSaving(false);
            }
        }
    };
    
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        let imageUrl = category?.imageUrl || '';

        if (imageFile) {
            const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
            try {
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.error("Image upload failed", error);
                toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
                setIsSaving(false);
                return;
            }
        }
        
        const categoryData = {
            name,
            description,
            parentId: parentId === 'none' ? null : parentId,
            imageUrl,
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
            toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file-category" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-primary" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    </div>
                                    <Input id="dropzone-file-category" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
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
