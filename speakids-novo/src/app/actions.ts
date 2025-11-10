
'use server';

import { translate, type TranslateInput, type TranslateOutput } from '@/ai/flows/translate-text';
import { textToSpeech, type TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { z } from 'zod';
import { getDailyWord, type DailyWordOutput } from '@/ai/flows/daily-word-flow';
import { getDailySentence, type DailySentenceInput, type DailySentenceOutput } from '@/ai/flows/daily-sentence-flow';
import { evaluatePlacementTest, type PlacementTestInput } from '@/ai/flows/placement-test-flow';

import { generateStory, type StoryGeneratorInput, type StoryGeneratorOutput } from '@/ai/flows/story-generator-flow';
import { evaluateTranslation } from '@/ai/flows/evaluate-translation-flow';
import { EvaluateTranslationInputSchema, type EvaluateTranslationOutput } from '@/ai/schemas/translation-schema';


type TranslateState = TranslateOutput & {
  error?: string | null;
}

export async function translateText(textToTranslate: string, context: string): Promise<TranslateState> {
  if (!textToTranslate || !context) {
    return { translation: '', explanation: '', synonyms: [], error: 'Texto ou contexto inválido.' };
  }
  try {
    const input: TranslateInput = { text: textToTranslate, context: context };
    const result = await translate(input);
    if (!result || !result.translation || !result.explanation || !result.synonyms) {
       throw new Error('A resposta da IA está incompleta.');
    }
    return { ...result, error: null };
  } catch (e) {
    console.error('Falha na tradução:', e);
    return { 
        translation: '', 
        explanation: '',
        synonyms: [], 
        error: 'Não foi possível traduzir a palavra. Por favor, tente novamente mais tarde.' 
    };
  }
}

type SpeakState = {
  audioData?: string | null;
  error?: string | null;
}

export async function speakText(textToSpeak: string): Promise<SpeakState> {
  const validatedFields = z.object({ textToSpeak: z.string().min(1) }).safeParse({ textToSpeak });

  if (!validatedFields.success) {
    return { error: 'O texto não pode estar vazio.' };
  }
  
  try {
    const input: TextToSpeechInput = { text: validatedFields.data.textToSpeak };
    const result = await textToSpeech(input);
    return { audioData: result.audioData, error: null };
  } catch (e) {
    console.error(e);
    return { audioData: null, error: 'Não foi possível gerar o áudio. Por favor, tente novamente.' };
  }
}

export async function completeActivity(): Promise<{ success: boolean }> {
    // This function no longer saves progress to the database.
    // It always returns a success state to avoid showing errors to the user.
    console.log(`Activity completed. Progress is not saved.`);
    return { success: true };
}

export async function fetchDailyWord(): Promise<DailyWordOutput> {
    try {
        const cacheBuster = new Date().toISOString() + Math.random();
        const result = await getDailyWord({ cacheBuster });
        if (!result || !result.word || !result.hint) {
            throw new Error('A resposta da IA para a palavra diária está incompleta.');
        }
        return result;
    } catch(e) {
        console.error('Falha ao buscar a palavra diária:', e);
        return { word: 'PANDA', hint: 'Um urso preto e branco da China.' };
    }
}

export async function fetchDailySentence(level: DailySentenceInput['level']): Promise<DailySentenceOutput> {
    try {
        const cacheBuster = new Date().toISOString() + Math.random();
        const result = await getDailySentence({ level, cacheBuster });
        if (!result || !result.sentence) {
            throw new Error('A resposta da IA para a frase diária está incompleta.');
        }
        return result;
    } catch(e) {
        console.error('Falha ao buscar a frase diária:', e);
        return { sentence: 'The cat is on the table.' };
    }
}



const placementTestSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    question: z.string(),
    level: z.string(),
    isCorrect: z.boolean(),
    selectedOption: z.string(),
  })).min(1, 'Pelo menos uma resposta deve ser fornecida.'),
});

export async function submitPlacementTest(
    submission: z.infer<typeof placementTestSubmissionSchema>
) {
    const validated = placementTestSubmissionSchema.safeParse(submission);
    if (!validated.success) {
        console.error("Falha na validação do envio do teste de nivelamento:", validated.error);
        return { success: false, error: 'Dados de envio inválidos.' };
    }

    const { answers } = validated.data;

    try {
        const evaluationResult = await evaluatePlacementTest({ answers });

        if (!evaluationResult || !evaluationResult.finalLevel || !evaluationResult.analysis) {
            throw new Error("A avaliação da IA falhou em retornar um resultado válido.");
        }
        
        // We no longer update the database, just return the result.
        
        return { 
            success: true, 
            finalLevel: evaluationResult.finalLevel,
            analysis: evaluationResult.analysis 
        };

    } catch (error) {
        console.error('Erro ao enviar o teste de nivelamento:', error);
        return { success: false, error: 'Não foi possível processar os resultados do seu teste.' };
    }
}



export async function fetchNewStory(input: StoryGeneratorInput): Promise<StoryGeneratorOutput> {
    try {
        const result = await generateStory({
            ...input,
            cacheBuster: new Date().toISOString() + Math.random(),
        });
        if (!result || !result.title || !result.content || !result.level) {
            throw new Error('A resposta da IA para a história está incompleta.');
        }
        return result;
    } catch(e) {
        console.error('Falha ao buscar nova história:', e);
        return { 
            title: 'O Dragão Amigável', 
            content: 'Once upon a time, there was a friendly dragon. He did not breathe fire. He breathed bubbles! All the children in the village loved to play in his bubbles.',
            level: 'A1',
            translation: 'Era uma vez um dragão amigável. Ele não cuspia fogo. Ele soprava bolhas! Todas as crianças da aldeia adoravam brincar em suas bolhas.'
        };
    }
}

export async function handleTranslationEvaluation(
    prevState: EvaluateTranslationOutput | null,
    formData: FormData
): Promise<EvaluateTranslationOutput | { error: string }> {
    const validatedFields = EvaluateTranslationInputSchema.safeParse({
        originalText: formData.get('originalText'),
        referenceTranslation: formData.get('referenceTranslation'),
        userTranslation: formData.get('userTranslation'),
    });

    if (!validatedFields.success) {
        return {
            error: 'Dados de entrada inválidos. Tente novamente.',
        };
    }

    try {
        const result = await evaluateTranslation(validatedFields.data);
        return result;
    } catch (e: any) {
        console.error('Falha na avaliação da tradução:', e);
        return { error: 'Ocorreu um erro ao avaliar sua tradução. Por favor, tente novamente.' };
    }
}

    