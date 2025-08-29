'use server';

/**
 * @fileOverview An AI study assistant that answers questions about English grammar and vocabulary.
 *
 * - askAIStudyAssistant - A function that handles the interaction with the AI study assistant.
 * - AIStudyAssistantInput - The input type for the askAIStudyAssistant function.
 * - AIStudyAssistantOutput - The return type for the askAIStudyassistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIStudyAssistantInputSchema = z.object({
  query: z.string().describe('The question about English grammar or vocabulary.'),
});
export type AIStudyAssistantInput = z.infer<typeof AIStudyAssistantInputSchema>;

const AIStudyAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AIStudyAssistantOutput = z.infer<typeof AIStudyAssistantOutputSchema>;

export async function askAIStudyAssistant(input: AIStudyAssistantInput): Promise<AIStudyAssistantOutput> {
  return aiStudyAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStudyAssistantPrompt',
  input: {schema: AIStudyAssistantInputSchema},
  output: {schema: AIStudyAssistantOutputSchema},
  prompt: `You are Professor Panda, a friendly and patient AI study assistant for children learning English.
Your goal is to make learning fun and accessible.
- Always be encouraging and use simple, easy-to-understand language.
- Use emojis to make your explanations more engaging. 🐼
- Keep your answers concise and focused on the main point.

Answer the following question about English grammar or vocabulary:
{{query}}`,
});

const aiStudyAssistantFlow = ai.defineFlow(
  {
    name: 'aiStudyAssistantFlow',
    inputSchema: AIStudyAssistantInputSchema,
    outputSchema: AIStudyAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
