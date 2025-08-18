
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '../ui/skeleton';
import type { ItemCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface CategoryListProps {
    categories: ItemCategory[];
    onEdit: (category: ItemCategory) => void;
    onDelete: (category: ItemCategory) => void;
    loading: boolean;
}

export default function CategoryList({ categories, onEdit, onDelete, loading }: CategoryListProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<ItemCategory | null>(null);

    const openDeleteAlert = (category: ItemCategory) => {
        setCategoryToDelete(category);
        setIsDeleteAlertOpen(true);
    }

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        onDelete(categoryToDelete);
        setIsDeleteAlertOpen(false);
        setCategoryToDelete(null);
    };
  
    const getParentCategoryName = (parentId: string | undefined) => {
        if (!parentId) return 'N/A';
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : 'N/A';
    }

    return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Category List</CardTitle>
                <CardDescription>A list of all your product categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Image</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Parent Category</TableHead>
                            <TableHead>Date Created</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                                </TableRow>
                            ))
                        ) : categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>
                                <Image 
                                    src={category.imageUploadUrl || 'https://placehold.co/40x40.png'} 
                                    alt={category.name} 
                                    width={40} 
                                    height={40} 
                                    className="rounded-md"
                                    data-ai-hint="category image"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{getParentCategoryName(category.parentId)}</TableCell>
                            <TableCell>{new Date(category.createdAt as any).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(category)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(category)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {!loading && categories.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No categories found.
                    </div>
                )}
            </CardContent>
        </Card>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the category.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
