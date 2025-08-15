
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Camera, Sparkles, Wand, Image as ImageIcon } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useState, useRef } from 'react';
import Image from 'next/image';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  sku: z.string().min(1, 'SKU is required.'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required.'),
  supplier: z.string().min(1, 'Supplier is required.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
  unit: z.string().min(1, 'Unit is required.'),
  barcode: z.string().optional(),
  minStock: z.coerce.number().min(0, 'Min stock cannot be negative.'),
  maxStock: z.coerce.number().min(0, 'Max stock cannot be negative.'),
  initialStock: z.coerce.number().min(0, 'Initial stock cannot be negative.'),
  image: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductFormProps {
  onSuccess: (newProduct: Omit<Product, 'id' | 'status' | 'tags' | 'stock'> & { initialStock: number }) => void;
  onCancel: () => void;
  categories: string[];
  suppliers: string[];
}

export function AddProductForm({ onSuccess, onCancel, categories, suppliers }: AddProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      supplier: '',
      price: 0,
      unit: 'Pieces',
      description: '',
      barcode: '',
      minStock: 0,
      maxStock: 0,
      initialStock: 0,
    },
  });

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          setImagePreview(dataUrl);
          form.setValue('image', dataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileChange(file);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0] ?? null;
      handleFileChange(file);
  };

  function onSubmit(data: ProductFormValues) {
    onSuccess(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-grow p-6 space-y-6">
          <div>
            <FormLabel>Product Image</FormLabel>
            <p className="text-sm text-muted-foreground mb-2">Upload a high-quality image of your product. Will be optimized to 800x800px.</p>
            <div 
              className={`flex items-center justify-center w-full relative ${isDragging ? 'bg-muted/80' : ''}`}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="contain" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => {
                      setImagePreview(null);
                      form.setValue('image', null);
                      if(fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80"
                  onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF (MAX. 10MB)</p>
                    </div>
                    <Input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      Auto compression
                  </div>
                  <div className="flex items-center gap-1">
                      <Wand className="h-3 w-3 text-purple-500" />
                      WebP conversion
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <FormControl>
                    <Input placeholder="Product SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Product description..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Unit Price ($) *</FormLabel>
                      <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      >
                      <FormControl>
                          <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="Pieces">Pieces</SelectItem>
                          <SelectItem value="Box">Box</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Pair">Pair</SelectItem>
                      </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                      <Input placeholder="Barcode number" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Min Stock</FormLabel>
                      <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Max Stock</FormLabel>
                      <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="initialStock"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Initial Stock</FormLabel>
                      <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
          </div>
        </div>
        
        <div className="flex justify-end gap-4 sticky bottom-0 bg-background/95 backdrop-blur-sm p-6 -mx-0">
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Add Product
            </Button>
        </div>
      </form>
    </Form>
  );
}

    