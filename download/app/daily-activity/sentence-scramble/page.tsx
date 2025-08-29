
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { completeActivity, fetchDailySentence } from '@/app/actions';
import confetti from 'canvas-confetti';
import { RefreshCw, Check, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/contexts/auth-context';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ACTIVITY_ID = 'sentence-scramble';

export default function SentenceScramblePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [solution, setSolution] = useState('');
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [constructedSentence, setConstructedSentence] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    setConstructedSentence([]);
    setIsCorrect(null);
    try {
        const level = user?.cefrLevel || 'A1';
        const { sentence } = await fetchDailySentence(level);
        setSolution(sentence);
        
        let words = sentence.split(' ');
        let shuffled = shuffleArray(words);
        // Ensure the shuffled version is not the same as the solution
        while(shuffled.join(' ') === sentence) {
            shuffled = shuffleArray(words);
        }
        
        setScrambledWords(shuffled);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load a new sentence.' });
        setSolution('The quick brown fox jumps over the lazy dog.'); // Fallback
        setScrambledWords(shuffleArray('The quick brown fox jumps over the lazy dog.'.split(' ')));
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleWordClick = (word: string, index: number) => {
    if (isCorrect !== null) return;
    setConstructedSentence(prev => [...prev, word]);
    setScrambledWords(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleConstructedClick = (word: string, index: number) => {
    if (isCorrect !== null) return;
    setScrambledWords(prev => [...prev, word]);
    setConstructedSentence(prev => prev.filter((_, i) => i !== index));
  };

  const checkSolution = async () => {
    const finalAnswer = constructedSentence.join(' ');
    if (finalAnswer.toLowerCase() === solution.toLowerCase()) {
      setIsCorrect(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (user) {
        const result = await completeActivity(user.uid, 15, ACTIVITY_ID);
        toast({ title: 'Correct! 🎉', description: 'You earned 15 Panda Points!' });
        if (result.newAchievement) {
          toast({ title: 'Achievement Unlocked! 🏆', description: result.newAchievement });
        }
        // Mark as completed for today
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`completed-${ACTIVITY_ID}`, today);
      }
    } else {
      setIsCorrect(false);
      toast({ variant: 'destructive', description: 'Not quite right. Try again!' });
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

   if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="py-8 flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Sentence Scramble</h1>
        <p className="text-white/90 drop-shadow-md">Unscramble the words to form a correct sentence.</p>
      </div>

      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-2 border-white/50">
        <CardHeader>
          <CardTitle>Build the Sentence</CardTitle>
          <CardDescription>Click the words in the correct order. The sentence is based on your level: {user?.cefrLevel || 'A1'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div 
            className={cn(
              "w-full min-h-[6rem] p-4 rounded-lg border-2 flex flex-wrap items-center justify-center gap-2",
              isCorrect === true ? 'border-green-500 bg-green-100 dark:bg-green-100/10' : 
              isCorrect === false ? 'border-red-500 bg-red-100 dark:bg-red-100/10' : 'border-dashed'
            )}
          >
            {constructedSentence.map((word, index) => (
                <Button key={index} variant="secondary" className="text-lg cursor-pointer" onClick={() => handleConstructedClick(word, index)}>
                    {word}
                </Button>
            ))}
             {constructedSentence.length === 0 && (
                <p className="text-muted-foreground">Your sentence will appear here</p>
             )}
          </div>

          <div className="w-full min-h-[6rem] p-4 flex flex-wrap items-center justify-center gap-2">
            {scrambledWords.map((word, index) => (
                <Button key={index} variant="outline" className="text-lg" onClick={() => handleWordClick(word, index)}>
                    {word}
                </Button>
            ))}
          </div>

          {isCorrect === null ? (
            <Button size="lg" disabled={scrambledWords.length > 0} onClick={checkSolution}>
                <Check className="mr-2"/>
                Check Answer
            </Button>
          ) : (
            <div className="text-center space-y-4">
                <p className={cn("text-2xl font-bold", isCorrect ? 'text-green-600' : 'text-red-600')}>
                    {isCorrect ? "Excellent!" : "Not quite!"}
                </p>
                 <Button onClick={startNewGame} size="lg">
                    <RefreshCw className="mr-2"/>
                    {isCorrect ? 'Play Next' : 'Try Again'}
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
