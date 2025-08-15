
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (categoryName: string) => void;
  isSubmitting?: boolean;
}

export function AddCategoryDialog({ 
    open, 
    onOpenChange, 
    onConfirm,
    isSubmitting = false 
}: AddCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState('');

  const handleConfirm = () => {
    if (categoryName.trim()) {
      onConfirm(categoryName.trim());
      setCategoryName('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Category</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the name for the new product category.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 py-4">
            <Label htmlFor="category-name">Category Name</Label>
            <Input 
                id="category-name" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., LED Drivers"
                disabled={isSubmitting}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
                onClick={handleConfirm}
                disabled={isSubmitting || !categoryName.trim()}
            >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Category
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
