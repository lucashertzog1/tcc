
'use server';

/**
 * @fileOverview A flow for generating a word for the Word Panda game.
 *
 * - getDailyWord - A function that returns a 5-letter word and a hint for it.
 * - DailyWordOutput - The return type for the getDailyWord function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DailyWordInputSchema = z.object({
  cacheBuster: z.string().optional().describe("A random string to bypass cache."),
});

const DailyWordOutputSchema = z.object({
  word: z.string().length(5, "The word must be exactly 5 letters long.").describe("A common, 5-letter English word."),
  hint: z.string().describe("A short, simple hint or clue for the word."),
});
export type DailyWordOutput = z.infer<typeof DailyWordOutputSchema>;

export async function getDailyWord(input: z.infer<typeof DailyWordInputSchema>): Promise<DailyWordOutput> {
  return dailyWordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyWordPrompt',
  input: { schema: DailyWordInputSchema },
  output: { schema: DailyWordOutputSchema },
  prompt: `Generate a common, 5-letter English word suitable for a language learner.
The word must be exactly 5 letters long. Do not generate words with repeated letters like 'hello' or 'bookk'.
Also provide a simple, one-sentence hint for the word.
Do not use proper nouns.
Ignore this cache-busting value: {{cacheBuster}}`,
});

const dailyWordFlow = ai.defineFlow(
  {
    name: 'dailyWordFlow',
    inputSchema: DailyWordInputSchema,
    outputSchema: DailyWordOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
