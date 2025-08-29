
'use server';

import {
  askAIStudyAssistant,
  type AIStudyAssistantInput,
} from '@/ai/flows/ai-study-assistant';
import { translate, type TranslateInput, type TranslateOutput } from '@/ai/flows/translate-text';
import { textToSpeech, type TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { z } from 'zod';
import { doc, updateDoc, increment, getDoc, collection, query, orderBy, limit, getDocs, setDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { getDailyWord, type DailyWordOutput } from '@/ai/flows/daily-word-flow';
import { getDailySentence, type DailySentenceInput, type DailySentenceOutput } from '@/ai/flows/daily-sentence-flow';
import { evaluatePlacementTest, type PlacementTestInput } from '@/ai/flows/placement-test-flow';
import type { Question } from '@/app/placement-test/questions';
import { generateChallenge, ChallengeGeneratorInput, ChallengeGeneratorOutput } from '@/ai/flows/challenge-generator-flow';
import { generateStory, type StoryGeneratorInput, type StoryGeneratorOutput } from '@/ai/flows/story-generator-flow';
import { evaluateTranslation } from '@/ai/flows/evaluate-translation-flow';
import { EvaluateTranslationInputSchema, EvaluateTranslationOutputSchema, type EvaluateTranslationOutput } from '@/ai/schemas/translation-schema';


const aiQuerySchema = z.object({
  query: z.string(),
});

type AIQueryState = {
  answer?: string;
  error?: string;
};

export async function handleAiQuery(prevState: AIQueryState, formData: FormData): Promise<AIQueryState> {
  const validatedFields = aiQuerySchema.safeParse({
    query: formData.get('query'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.query?.[0],
    };
  }

  try {
    const input: AIStudyAssistantInput = { query: validatedFields.data.query };
    const result = await askAIStudyAssistant(input);
    return { answer: result.answer };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}


type TranslateState = TranslateOutput & {
  error?: string | null;
}

export async function translateText(textToTranslate: string, context: string): Promise<TranslateState> {
  if (!textToTranslate || !context) {
    return { translation: '', explanation: '', synonyms: [], error: 'Invalid text or context.' };
  }
  try {
    const input: TranslateInput = { text: textToTranslate, context: context };
    const result = await translate(input);
    if (!result || !result.translation || !result.explanation || !result.synonyms) {
       throw new Error('The AI response is incomplete.');
    }
    return { ...result, error: null };
  } catch (e) {
    console.error('Translation failed:', e);
    return { 
        translation: '', 
        explanation: '',
        synonyms: [], 
        error: 'Could not translate the word. Please try again later.' 
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
    return { error: 'Text cannot be empty.' };
  }
  
  try {
    const input: TextToSpeechInput = { text: validatedFields.data.textToSpeak };
    const result = await textToSpeech(input);
    return { audioData: result.audioData, error: null };
  } catch (e) {
    console.error(e);
    return { audioData: null, error: 'Could not generate audio. Please try again.' };
  }
}

const activitySchema = z.object({
  userId: z.string(),
  points: z.number(),
  activityId: z.string(),
});

type ActivityState = {
  success?: boolean;
  newAchievement?: string;
  error?: string;
};

// A list of achievements based on activities completed
const achievementsByCount = [
    { count: 1, name: 'First Activity!', description: 'You completed your first activity!' },
    { count: 10, name: 'Getting Started', description: 'You completed 10 activities!' },
    { count: 25, name: 'Consistent Learner', description: 'You completed 25 activities!' },
    { count: 50, name: 'Panda Pro', description: 'You completed 50 activities!' },
    { count: 100, name: 'Centurion', description: 'Wow! 100 activities completed!' },
];

export async function completeActivity(userId: string, points: number, activityId: string): Promise<ActivityState> {
    const validatedFields = activitySchema.safeParse({ userId, points, activityId });
    if (!validatedFields.success) {
        return { error: 'Invalid data for completing activity.' };
    }

    const userDocRef = doc(db, 'users', userId);

    try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { error: 'User not found.' };
        }
        
        const userData = userDoc.data();
        const currentActivities = userData.activitiesCompleted || 0;
        const newActivitiesCount = currentActivities + 1;
        
        const updates: any = {
            pandaPoints: increment(points),
            activitiesCompleted: increment(1),
        };

        // Check for new achievements
        let newAchievement;
        const achievementToAward = achievementsByCount.find(ach => ach.count === newActivitiesCount);
        
        if (achievementToAward && !userData.achievements?.some((a: any) => a.name === achievementToAward.name)) {
            updates.achievements = arrayUnion({
                name: achievementToAward.name,
                description: achievementToAward.description,
                unlockedAt: new Date(),
            });
            newAchievement = achievementToAward.name;
        }

        await updateDoc(userDocRef, updates);

        return { success: true, newAchievement };
    } catch (error) {
        console.error('Error completing activity:', error);
        return { error: 'Could not update progress.' };
    }
}


export async function getRanking() {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('pandaPoints', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const ranking = querySnapshot.docs.map(doc => ({
            id: doc.id,
            displayName: doc.data().displayName,
            pandaPoints: doc.data().pandaPoints,
        }));
        return { ranking };
    } catch (error) {
        console.error("Error fetching ranking:", error);
        return { error: "Could not fetch ranking.", ranking: [] };
    }
}

export async function generateNewChallenge(input: ChallengeGeneratorInput): Promise<ChallengeGeneratorOutput> {
    try {
        const result = await generateChallenge({
            ...input,
            // Add a cache buster to ensure a new challenge is generated
            cacheBuster: new Date().toISOString() + Math.random(),
        });
        if (!result || !result.imageUrl || !result.word) {
            throw new Error('AI response for challenge is incomplete.');
        }
        return result;
    } catch (e) {
        console.error('Failed to start challenge:', e);
        throw new Error('Could not start a new challenge. Please try again later.');
    }
}


export async function fetchDailyWord(): Promise<DailyWordOutput> {
    try {
        // Add a cache buster to ensure a new word is fetched every time.
        const cacheBuster = new Date().toISOString() + Math.random();
        const result = await getDailyWord({ cacheBuster });
        if (!result || !result.word || !result.hint) {
            throw new Error('AI response for daily word is incomplete.');
        }
        return result;
    } catch(e) {
        console.error('Failed to fetch daily word:', e);
        return { word: 'PANDA', hint: 'A black and white bear from China.' };
    }
}

export async function fetchDailySentence(level: DailySentenceInput['level']): Promise<DailySentenceOutput> {
    try {
         // Add a cache buster to ensure a new sentence is fetched every time.
        const cacheBuster = new Date().toISOString() + Math.random();
        const result = await getDailySentence({ level, cacheBuster });
        if (!result || !result.sentence) {
            throw new Error('AI response for daily sentence is incomplete.');
        }
        return result;
    } catch(e) {
        console.error('Failed to fetch daily sentence:', e);
        return { sentence: 'The cat is on the table.' };
    }
}

export async function getPlacementTestQuestions(): Promise<Question[]> {
  try {
    const questionsRef = collection(db, 'placementTestQuestions');
    const q = query(questionsRef, orderBy('level')); // Simple ordering
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        // Automatically seed questions if the collection is empty.
        console.warn("Placement test questions collection is empty. Seeding now...");
        await seedPlacementTestQuestions();
        const seededQuerySnapshot = await getDocs(q);
        if (seededQuerySnapshot.empty) {
            throw new Error("Failed to seed and fetch questions.");
        }
        const questions = seededQuerySnapshot.docs.map(doc => doc.data() as Question);
        return questions;
    }

    const questions = querySnapshot.docs.map(doc => doc.data() as Question);
    return questions;
  } catch (error) {
    console.error("Error fetching placement test questions:", error);
    throw new Error("Could not fetch placement test questions.");
  }
}

const placementTestSubmissionSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  answers: z.array(z.object({
    questionId: z.string(),
    question: z.string(),
    level: z.string(),
    isCorrect: z.boolean(),
    selectedOption: z.string(),
  })).min(1, 'At least one answer must be provided.'),
});

export async function submitPlacementTest(
    submission: z.infer<typeof placementTestSubmissionSchema>
) {
    const validated = placementTestSubmissionSchema.safeParse(submission);
    if (!validated.success) {
        console.error("Placement test submission validation failed:", validated.error);
        return { success: false, error: 'Invalid submission data.' };
    }

    const { userId, answers } = validated.data;

    try {
        // Call the AI flow to evaluate the answers
        const evaluationResult = await evaluatePlacementTest({ answers });

        if (!evaluationResult || !evaluationResult.finalLevel || !evaluationResult.analysis) {
            throw new Error("AI evaluation failed to return a valid result.");
        }
        
        // Update the user's document in Firestore with the new level
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            cefrLevel: evaluationResult.finalLevel,
            placementTestCompleted: true,
        });
        
        return { 
            success: true, 
            finalLevel: evaluationResult.finalLevel,
            analysis: evaluationResult.analysis 
        };

    } catch (error) {
        console.error('Error submitting placement test:', error);
        return { success: false, error: 'Could not process your test results.' };
    }
}

// This is a new action to seed the database.
// It's not meant to be called from the UI directly in production,
// but it's useful for setup.
import { placementTestQuestions } from '@/lib/placement-test-seed';

export async function seedPlacementTestQuestions() {
    console.log("Seeding placement test questions...");
    const batch = writeBatch(db);
    placementTestQuestions.forEach((question) => {
        const docRef = doc(db, 'placementTestQuestions', question.id);
        batch.set(docRef, question);
    });
    try {
        await batch.commit();
        console.log("Successfully seeded placement test questions.");
        return { success: true, message: "Questions seeded successfully." };
    } catch (error) {
        console.error("Error seeding questions:", error);
        return { success: false, error: "Failed to seed questions." };
    }
}

export async function fetchNewStory(input: StoryGeneratorInput): Promise<StoryGeneratorOutput> {
    try {
        const result = await generateStory({
            ...input,
            // Add a cache buster to ensure a new story is generated
            cacheBuster: new Date().toISOString() + Math.random(),
        });
        if (!result || !result.title || !result.content || !result.level) {
            throw new Error('AI response for story is incomplete.');
        }
        return result;
    } catch(e) {
        console.error('Failed to fetch new story:', e);
        // Fallback story
        return { 
            title: 'The Friendly Dragon', 
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
        console.error('Translation evaluation failed:', e);
        return { error: 'Ocorreu um erro ao avaliar sua tradução. Por favor, tente novamente.' };
    }
}
