'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';
import { products, sales, suppliers } from '@/lib/data';
import { suggestActions, SuggestActionsOutput } from '@/ai/flows/suggested-actions';
import { useToast } from '@/hooks/use-toast';

export default function SuggestedActionsCard() {
  const [suggestions, setSuggestions] = useState<SuggestActionsOutput>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestActions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
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
        <Button onClick={handleSuggestActions} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
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
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>{suggestion.action}{suggestion.product && `: ${suggestion.product}`}</AlertTitle>
            <AlertDescription>{suggestion.reason}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
