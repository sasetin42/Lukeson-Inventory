
'use client';

import { useForm, useWatch } from 'react-hook-form';
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
import { Upload, X, Sparkles, Wand, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const categories = ["STRIPLIGHT", "POWER SUPPLY", "GENERAL LIGHTING", "ALUMINIUM PROFILE"] as const;

// Base schema for common fields
const baseSchema = z.object({
  productCode: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  sku: z.string().optional(),
  description: z.string().optional(),
  supplier: z.string().optional(),
  location: z.string().min(1, 'Location is required.'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative.'),
  reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative.'),
  image: z.any().optional(),
});

// Category-specific schemas
const striplightSchema = baseSchema.extend({
  category: z.literal('STRIPLIGHT'),
  fields: z.object({
    ledQty: z.enum(["240L", "180L", "120L", "72L", "60L"], { required_error: "LED Qty is required." }),
    voltage: z.enum(["220v", "48v", "24v", "12v"], { required_error: "Voltage is required." }),
    wattage: z.coerce.number().min(0.1, 'Wattage is required.'),
    meters: z.coerce.number().min(0.1, 'Meters are required.'),
  })
});

const powerSupplySchema = baseSchema.extend({
  category: z.literal('POWER SUPPLY'),
  fields: z.object({
    voltage: z.enum(["220v", "48v", "24v", "12v"], { required_error: "Voltage is required." }),
    wattage: z.coerce.number().min(0.1, 'Wattage is required.'),
  })
});

const generalLightingSchema = baseSchema.extend({
  category: z.literal('GENERAL LIGHTING'),
  fields: z.object({}) // No specific fields
});

const aluminiumProfileSchema = baseSchema.extend({
  category: z.literal('ALUMINIUM PROFILE'),
  fields: z.object({
    size: z.string().min(1, "Size is required."),
    color: z.string().min(1, "Color is required."),
  })
});

const productSchema = z.discriminatedUnion("category", [
  striplightSchema,
  powerSupplySchema,
  generalLightingSchema,
  aluminiumProfileSchema,
]);

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess: (data: ProductFormValues) => void;
  onCancel: () => void;
  suppliers: string[];
  product?: Product | null;
  isSubmitting?: boolean;
}

const getInitialValues = (product: Product | null | undefined): Partial<ProductFormValues> => {
    const defaults: Partial<ProductFormValues> & { fields: any } = {
        productCode: product?.productCode ?? `PRO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        name: '',
        sku: '',
        description: '',
        supplier: '',
        location: '',
        stock: 0,
        reorderLevel: 0,
        image: null,
        fields: {
            ledQty: undefined,
            voltage: undefined,
            wattage: undefined,
            meters: undefined,
            size: '',
            color: '#000000',
        },
    };

    if (product) {
        return {
            ...defaults,
            ...product,
            stock: product.stock ?? 0,
            reorderLevel: product.reorderLevel ?? 0,
            fields: {
                ...defaults.fields,
                ...(product.fields as any),
            }
        };
    }
    return defaults;
}

const CategorySpecificFields = ({ category, control }: { category: string; control: any }) => {
  switch (category) {
    case 'STRIPLIGHT':
      return (
        <>
          <div className="col-span-1">
            <FormField control={control} name="fields.ledQty" render={({ field }) => (
              <FormItem>
                <FormLabel>LED Qty *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select LED Qty" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {["240L", "180L", "120L", "72L", "60L"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="col-span-1">
            <FormField control={control} name="fields.voltage" render={({ field }) => (
              <FormItem>
                <FormLabel>Voltage *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Voltage" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {["220v", "48v", "24v", "12v"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="col-span-1">
            <FormField control={control} name="fields.wattage" render={({ field }) => ( <FormItem><FormLabel>Wattage *</FormLabel><FormControl><Input type="number" placeholder="Enter wattage" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
          <div className="col-span-1">
            <FormField control={control} name="fields.meters" render={({ field }) => ( <FormItem><FormLabel>Meters *</FormLabel><FormControl><Input type="number" placeholder="Enter meters" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        </>
      );
    case 'POWER SUPPLY':
      return (
        <>
          <div className="col-span-2">
            <FormField control={control} name="fields.voltage" render={({ field }) => (
              <FormItem>
                <FormLabel>Voltage *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Voltage" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {["220v", "48v", "24v", "12v"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="col-span-2">
            <FormField control={control} name="fields.wattage" render={({ field }) => ( <FormItem><FormLabel>Wattage *</FormLabel><FormControl><Input type="number" placeholder="Enter wattage" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        </>
      );
    case 'ALUMINIUM PROFILE':
        return (
            <>
                <div className="col-span-1">
                    <FormField control={control} name="fields.size" render={({ field }) => (<FormItem><FormLabel>Size *</FormLabel><FormControl><Input placeholder="e.g., 2 meters" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="col-span-1">
                    <FormField control={control} name="fields.color" render={({ field }) => (<FormItem><FormLabel>Color *</FormLabel><FormControl><Input type="color" {...field} className="p-1 h-10" /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </>
        );
    default:
      return null;
  }
};

export function ProductForm({ 
    onSuccess, 
    onCancel, 
    suppliers, 
    product,
    isSubmitting = false 
}: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: getInitialValues(product),
  });

  const selectedCategory = useWatch({ control: form.control, name: 'category' });

  useEffect(() => {
      const initialValues = getInitialValues(product);
      form.reset(initialValues);
      setImagePreview(product?.imageUrl || null);
  }, [product, form.reset]);

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
        <div className="flex-grow p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="productCode" render={({ field }) => ( <FormItem><FormLabel>Product Code</FormLabel><FormControl><Input placeholder="PRO-2024-001" {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem> )} />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!product}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger></FormControl>
                            <SelectContent>
                            {categories.map((cat) => ( <SelectItem key={cat} value={cat}>{cat}</SelectItem> ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
          

          {selectedCategory && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="col-span-full">
                      <FormLabel>Product Image</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">Upload a high-quality image of your product. Will be optimized to 800x800px.</p>
                      <div 
                        className={`flex items-center justify-center w-full relative ${isDragging ? 'bg-muted/80' : ''}`}
                        onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)}
                        onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden">
                            <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="contain" />
                            <Button 
                              type="button" variant="destructive" size="icon" 
                              className="absolute top-2 right-2 h-7 w-7"
                              onClick={() => {
                                setImagePreview(null);
                                form.setValue('image', null);
                                if(fileInputRef.current) fileInputRef.current.value = '';
                              }}
                            ><X className="h-4 w-4" /></Button>
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
                              <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" />Auto compression</div>
                          <div className="flex items-center gap-1"><Wand className="h-3 w-3 text-purple-500" />WebP conversion</div>
                      </div>
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Product description..." className="resize-none" rows={5} {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Product Name *</FormLabel><FormControl><Input placeholder="Enter product name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="sku" render={({ field }) => ( <FormItem><FormLabel>SKU Code</FormLabel><FormControl><Input placeholder="Product SKU" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <CategorySpecificFields category={selectedCategory} control={form.control} />
                    </div>
                    
                    <FormField control={form.control} name="supplier" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {suppliers.map((supplier) => ( <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem> ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel>Location *</FormLabel><FormControl><Input placeholder="e.g. Aisle 5, Shelf 3" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem><FormLabel>Stock Qty *</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="reorderLevel" render={({ field }) => ( <FormItem><FormLabel>Reorder Level *</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                </div>
            </div>
          )}

        </div>
        
        {selectedCategory && (
            <div className="flex justify-end gap-4 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-0 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting || !form.formState.isValid}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {product ? 'Save Changes' : 'Add Product'}
                </Button>
            </div>
        )}
      </form>
    </Form>
  );
}

    