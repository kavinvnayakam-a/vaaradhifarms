'use server';
/**
 * @fileOverview A menu extraction AI agent.
 *
 * - importMenu - A function that extracts menu items from an image.
 * - ImportMenuInput - The input type for the importMenu function.
 * - ImportMenuOutput - The return type for the importMenu function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImportMenuInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a restaurant menu, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type ImportMenuInput = z.infer<typeof ImportMenuInputSchema>;

const ExtractedMenuItemSchema = z.object({
  name: z.string().describe('The name of the food or beverage item.'),
  description: z.string().describe('A brief description of the item, if available.'),
  price: z.number().describe('The numerical price of the item in INR.'),
  category: z.string().describe('The menu category (e.g., Starters, Biryani, Beverages).'),
});

const ImportMenuOutputSchema = z.object({
  items: z.array(ExtractedMenuItemSchema).describe('List of items extracted from the menu photo.'),
});
export type ImportMenuOutput = z.infer<typeof ImportMenuOutputSchema>;

export async function importMenu(input: ImportMenuInput): Promise<ImportMenuOutput> {
  return importMenuFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importMenuPrompt',
  input: { schema: ImportMenuInputSchema },
  output: { schema: ImportMenuOutputSchema },
  prompt: `You are an expert digital menu digitizer. 
  
Look at this menu photo and extract every item listed. 
For each item, identify:
1. The Name
2. The Description (if provided)
3. The Price (convert currency symbols to a plain number)
4. The Category (e.g. if it's listed under 'Chef Specials', use that as the category)

Ensure all prices are numerical. If a range is given, use the lower price.

Photo: {{media url=photoDataUri}}`,
});

const importMenuFlow = ai.defineFlow(
  {
    name: 'importMenuFlow',
    inputSchema: ImportMenuInputSchema,
    outputSchema: ImportMenuOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
