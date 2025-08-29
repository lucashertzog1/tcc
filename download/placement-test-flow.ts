
'use server';

/**
 * @fileOverview A flow for evaluating a user's placement test results to determine their CEFR level.
 *
 * - evaluatePlacementTest - A function that takes user answers and determines a CEFR level.
 * - PlacementTestInput - The input type for the evaluation function.
 * - PlacementTestOutput - The return type for the evaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnswerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  level: z.string(),
  isCorrect: z.boolean(),
  selectedOption: z.string(),
});

const PlacementTestInputSchema = z.object({
  answers: z.array(AnswerSchema).describe("An array of the user's answers to the placement test questions."),
});
export type PlacementTestInput = z.infer<typeof PlacementTestInputSchema>;

const PlacementTestOutputSchema = z.object({
  finalLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).describe('The calculated final CEFR level for the user.'),
  analysis: z.string().describe("A brief, encouraging analysis of the user's performance, highlighting strengths and areas for improvement."),
});
export type PlacementTestOutput = z.infer<typeof PlacementTestOutputSchema>;

export async function evaluatePlacementTest(input: PlacementTestInput): Promise<PlacementTestOutput> {
  return placementTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'placementTestEvaluationPrompt',
  input: { schema: PlacementTestInputSchema },
  output: { schema: PlacementTestOutputSchema },
  prompt: `You are an expert English language assessment AI. Your task is to analyze a user's placement test results and determine their CEFR level (A1, A2, B1, B2).

Analyze the provided JSON array of answers. The user's performance across different levels is key.
- Count the number of correct answers for each level (A1, A2, B1, B2, etc.).
- The user's final level is the highest level at which they answered at least 60% of the questions correctly.
- If the user answers less than 60% of A1 questions correctly, place them in A1.

Based on the analysis of the user's answers below, determine their final CEFR level. Also, provide a short, positive, and encouraging analysis (in simple Portuguese) of their performance.

User's Answers:
{{{json answers}}}

Your output must be a valid JSON object with the fields "finalLevel" and "analysis".
Example analysis: "Parabéns! Você tem uma base sólida em vocabulário e gramática. Seu nível é B1. Vamos focar em expandir sua fluidez em conversas mais complexas!"
`,
});

const placementTestFlow = ai.defineFlow(
  {
    name: 'placementTestFlow',
    inputSchema: PlacementTestInputSchema,
    outputSchema: PlacementTestOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error("AI response was null or undefined.");
      }
      // Re-validate the output to be extra sure it matches the schema
      const validatedOutput = PlacementTestOutputSchema.parse(output);
      return validatedOutput;
    } catch (error) {
       console.error("Error in placementTestFlow:", error);
       // Return a default/error state that still matches the output schema type
       return {
         finalLevel: 'A1',
         analysis: 'Ocorreu um erro ao processar seus resultados. Por favor, tente novamente. Por enquanto, seu nível foi definido como A1.',
       };
    }
  }
);

    