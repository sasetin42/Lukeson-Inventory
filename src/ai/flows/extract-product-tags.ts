'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting product tags from a product description.
 *
 * The flow uses a language model to analyze the description and suggest relevant tags.
 * - extractProductTags - A function that handles the tag extraction process.
 * - ExtractProductTagsInput - The input type for the extractProductTags function.
 * - ExtractProductTagsOutput - The return type for the extractProductTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractProductTagsInputSchema = z.object({
  productDescription: z
    .string()
    .describe('The description of the product for which tags need to be extracted.'),
});
export type ExtractProductTagsInput = z.infer<typeof ExtractProductTagsInputSchema>;

const ExtractProductTagsOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of suggested tags for the product.'),
});
export type ExtractProductTagsOutput = z.infer<typeof ExtractProductTagsOutputSchema>;

export async function extractProductTags(input: ExtractProductTagsInput): Promise<ExtractProductTagsOutput> {
  return extractProductTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProductTagsPrompt',
  input: {schema: ExtractProductTagsInputSchema},
  output: {schema: ExtractProductTagsOutputSchema},
  prompt: `You are an expert in product categorization and tagging.
  Given the following product description, suggest a list of relevant tags that can be used to categorize and search for the product.
  The tags should be concise and descriptive.

  Product Description: {{{productDescription}}}

  Tags:`,
});

const extractProductTagsFlow = ai.defineFlow(
  {
    name: 'extractProductTagsFlow',
    inputSchema: ExtractProductTagsInputSchema,
    outputSchema: ExtractProductTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
