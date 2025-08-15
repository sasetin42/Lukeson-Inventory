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
import { Upload, X, Camera, Sparkles, Wand } from 'lucide-react';
import type { Product } from '@/lib/types';

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
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductFormProps {
  onSuccess: (newProduct: ProductFormValues) => void;
  onCancel: () => void;
  categories: string[];
  suppliers: string[];
}

export function AddProductForm({ onSuccess, onCancel, categories, suppliers }: AddProductFormProps) {
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

  function onSubmit(data: ProductFormValues) {
    onSuccess(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <FormLabel>Product Image</FormLabel>
          <p className="text-sm text-muted-foreground mb-2">Upload a high-quality image of your product. Will be optimized to 800x800px.</p>
          <div className="flex items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF (MAX. 10MB)</p>
                  </div>
              </div>
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
                  className="resize-none min-h-[60px]"
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
        
        <div className="flex justify-end gap-4 sticky bottom-0 bg-background py-4 px-6 -mx-6">
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
