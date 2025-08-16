
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';
import { sales, suppliers } from '@/lib/data';
import { suggestActions, SuggestActionsOutput } from '@/ai/flows/suggested-actions';
import { useToast } from '@/hooks/use-toast';
import { getProducts } from '@/lib/firebase/product-service';
import type { Product } from '@/lib/types';

export default function SuggestedActionsCard() {
  const [suggestions, setSuggestions] = useState<SuggestActionsOutput>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = getProducts(
      (products) => {
        setProducts(products);
      },
      (error) => {
        console.error('Failed to fetch products for suggestions:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch product data for AI suggestions.',
        });
      }
    );
    return () => unsubscribe();
  }, [toast]);

  const handleSuggestActions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
        if (products.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No product data',
                description: 'Cannot generate suggestions without product data.',
            });
            return;
        }

      const stockLevels = products.reduce((acc, p) => {
        acc[p.id] = p.stock;
        return acc;
      }, {} as Record<string, number>);

      const salesData = sales.map(s => ({
        product: s.productName,
        quantitySold: s.quantity,
        date: new Date(s.date).toISOString().split('T')[0],
      }));

      const supplierInformation = suppliers.reduce((acc, s) => {
        acc[s.name] = {
          contactDetails: s.contact.email,
          leadTime: parseInt(s.contractTerms.split(' ')[1]) || 30, // Simplified
          minimumOrderQuantity: 10, // Mocked
        };
        return acc;
      }, {} as Record<string, { contactDetails: string, leadTime: number, minimumOrderQuantity: number }>);
      
      const result = await suggestActions({ stockLevels, salesData, supplierInformation });
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch AI suggestions. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>AI Suggested Actions</CardTitle>
          <CardDescription>Get smart recommendations for your inventory.</CardDescription>
        </div>
        <Button onClick={handleSuggestActions} disabled={isLoading || products.length === 0}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4 text-yellow-400" />}
          Get Suggestions
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && suggestions.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
                Click "Get Suggestions" to see AI-powered recommendations here.
            </div>
        )}
        {suggestions.map((suggestion, index) => (
          <Alert key={index}>
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            <AlertTitle>{suggestion.action}{suggestion.product && `: ${suggestion.product}`}</AlertTitle>
            <AlertDescription>{suggestion.reason}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
