'use server';

/**
 * @fileOverview Provides action suggestions based on stock levels, sales data, and supplier information.
 *
 * - suggestActions - A function that generates suggested actions for inventory management.
 * - SuggestActionsInput - The input type for the suggestActions function.
 * - SuggestActionsOutput - The return type for the suggestActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestActionsInputSchema = z.object({
  stockLevels: z.record(z.string(), z.number()).describe('Current stock levels for each product.'),
  salesData: z.array(z.object({
    product: z.string(),
    quantitySold: z.number(),
    date: z.string().describe('Date of sale in ISO format (YYYY-MM-DD).'),
  })).describe('Recent sales data.'),
  supplierInformation: z.record(z.string(), z.object({
    contactDetails: z.string(),
    leadTime: z.number().describe('Lead time in days.'),
    minimumOrderQuantity: z.number(),
  })).describe('Information about each supplier.'),
});
export type SuggestActionsInput = z.infer<typeof SuggestActionsInputSchema>;

const SuggestActionsOutputSchema = z.array(z.object({
  action: z.string().describe('Suggested action to take.'),
  product: z.string().optional().describe('The product the action pertains to.'),
  reason: z.string().describe('Reason for the suggested action.'),
})).describe('A list of suggested actions.');
export type SuggestActionsOutput = z.infer<typeof SuggestActionsOutputSchema>;

export async function suggestActions(input: SuggestActionsInput): Promise<SuggestActionsOutput> {
  return suggestActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestActionsPrompt',
  input: {schema: SuggestActionsInputSchema},
  output: {schema: SuggestActionsOutputSchema},
  prompt: `You are an AI assistant helping inventory managers optimize their stock.

Analyze the provided stock levels, sales data, and supplier information to suggest actions the inventory manager should take.
Possible actions include reordering products, adjusting prices, or contacting suppliers.

Stock Levels:
{{#each stockLevels}}
- {{@key}}: {{this}}
{{/each}}

Sales Data:
{{#each salesData}}
- Product: {{product}}, Quantity Sold: {{quantitySold}}, Date: {{date}}
{{/each}}

Supplier Information:
{{#each supplierInformation}}
- Supplier: {{@key}}, Contact Details: {{contactDetails}}, Lead Time: {{leadTime}} days, Minimum Order Quantity: {{minimumOrderQuantity}}
{{/each}}

Based on this information, provide a list of suggested actions, the product the action pertains to, and the reason for the suggestion.
Make sure the output is valid JSON.`,
});

const suggestActionsFlow = ai.defineFlow(
  {
    name: 'suggestActionsFlow',
    inputSchema: SuggestActionsInputSchema,
    outputSchema: SuggestActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
