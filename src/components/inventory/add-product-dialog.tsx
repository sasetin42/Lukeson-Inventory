'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { extractProductTags } from '@/ai/flows/extract-product-tags';
import { useToast } from '@/hooks/use-toast';

export default function AddProductDialog() {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateTags = async () => {
    if (!description) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a product description first.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await extractProductTags({ productDescription: description });
      setTags(result.tags);
    } catch (error) {
      console.error('Failed to generate tags:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate tags. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details for the new product. Use the AI tag generator for quick categorization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" placeholder="e.g. Smart T-Shirt" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">
              SKU
            </Label>
            <Input id="sku" placeholder="e.g. SKU-TS-001" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input id="stock" type="number" placeholder="e.g. 150" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input id="price" type="number" placeholder="e.g. 25.00" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the product..."
              className="col-span-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <div className="text-right pt-2">
                <Label htmlFor="tags">Tags</Label>
                <Button variant="ghost" size="sm" onClick={handleGenerateTags} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
            </div>
            <div className="col-span-3">
              <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 min-h-[40px]">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
                {!tags.length && <span className="text-sm text-muted-foreground px-1">AI-generated tags will appear here.</span>}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
