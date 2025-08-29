
'use client';
import * as React from 'react';
import { useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Loader2, Sparkles, Check, X, RefreshCw, Wand2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { completeActivity, generateNewChallenge, speakText } from '@/app/actions';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import type { ChallengeGeneratorInput } from '@/ai/flows/challenge-generator-flow';

type GameState = 'idle' | 'loading' | 'playing' | 'correct' | 'lost';
type Difficulty = ChallengeGeneratorInput['difficulty'];

const ACTIVITY_ID = 'blurry-image';

export default function ChallengeGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [correctWord, setCorrectWord] = useState<string>('');
  const [userGuess, setUserGuess] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isSoundPending, setIsSoundPending] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [attempts, setAttempts] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);

  const blurLevel = useMemo(() => Math.max(0, 24 - attempts * 8), [attempts]);

  const loadNewChallenge = useCallback(async (selectedDifficulty: Difficulty) => {
    if (!selectedDifficulty) return;
    setDifficulty(selectedDifficulty);
    setGameState('loading');
    setUserGuess('');
    setAttempts(0);
    setRevealedIndices(new Set());
    setHintsUsed(0);
    try {
      const challenge = await generateNewChallenge({ difficulty: selectedDifficulty });
      setImageUrl(challenge.imageUrl);
      setCorrectWord(challenge.word);
      setGameState('playing');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to load challenge', description: error.message });
      setGameState('idle');
    }
  }, [toast]);

  const handlePlaySound = useCallback(async (text: string) => {
    if (!text || isSoundPending) return;
    setIsSoundPending(true);
    try {
      const { audioData, error } = await speakText(text);
      if (error) {
        toast({ variant: 'destructive', title: 'Audio Error', description: error });
      } else if (audioData && audioRef.current) {
        audioRef.current.src = audioData;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
    } finally {
      setIsSoundPending(false);
    }
  }, [toast, isSoundPending]);

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim()) return;

    const isCorrect = userGuess.trim().toLowerCase() === correctWord.toLowerCase();

    if (isCorrect) {
      setGameState('correct');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      let basePoints = 10;
      if (difficulty === 'Medium') basePoints = 20;
      if (difficulty === 'Hard') basePoints = 30;

      const pointsLost = hintsUsed * 5; // Each hint costs 5 points from the final reward
      const points = Math.max(5, basePoints - pointsLost);

      if (user) {
        const result = await completeActivity(user.uid, points, ACTIVITY_ID);
        toast({ title: 'Correct! 🎉', description: `You earned ${points} Panda Points!` });
        if (result.newAchievement) {
          toast({ title: 'Achievement Unlocked! 🏆', description: result.newAchievement });
        }
        // Mark as completed for today
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`completed-${ACTIVITY_ID}`, today);
      }
      handlePlaySound('Correct, great job!');
    } else {
      setAttempts(prev => prev + 1);
      toast({ variant: 'destructive', title: "Not quite!", description: "The image is a bit clearer now."});
      if (attempts >= 2) { // 3 total attempts (0, 1, 2)
        setGameState('lost');
        handlePlaySound('Not quite, try another one!');
        toast({ variant: 'destructive', title: "Tough one!", description: `The correct word was: "${correctWord}"` });
      }
    }
  };

  const handleHint = async () => {
      const unrevealed = Array.from(Array(correctWord.length).keys())
                              .filter(i => !revealedIndices.has(i) && correctWord[i] !== ' ');
      
      if(unrevealed.length === 0) return;

      setHintsUsed(prev => prev + 1);
      
      // Reveal ~25% of the remaining letters
      const revealCount = Math.max(1, Math.floor(unrevealed.length * 0.25));
      
      const indicesToReveal = new Set(revealedIndices);
      for(let i = 0; i < revealCount; i++) {
          if(unrevealed.length === 0) break;
          const randomIndex = Math.floor(Math.random() * unrevealed.length);
          const selectedIndex = unrevealed.splice(randomIndex, 1)[0];
          indicesToReveal.add(selectedIndex);
      }
      setRevealedIndices(indicesToReveal);
      toast({ title: 'Hint Unlocked!', description: `A few letters have been revealed.`});
  }

  const renderInitialState = () => (
    <div className="text-center space-y-6 animate-in fade-in-50">
        <div className="flex justify-center">
            <Wand2 className="w-16 h-16 text-primary" />
        </div>
      <CardTitle>Image Challenge</CardTitle>
      <CardDescription>Choose a difficulty to start a new challenge!</CardDescription>
      <div className='p-4 flex flex-col sm:flex-row gap-4 justify-center'>
        <Button onClick={() => loadNewChallenge('Easy')} size="lg">Easy</Button>
        <Button onClick={() => loadNewChallenge('Medium')} size="lg" variant="outline">Medium</Button>
        <Button onClick={() => loadNewChallenge('Hard')} size="lg" variant="destructive">Hard</Button>
      </div>
    </div>
  );

  const renderGameTerminalState = () => (
     <div className={cn(
        "text-center space-y-4 p-4 rounded-lg w-full animate-in fade-in-50",
        gameState === 'correct' ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"
      )}>
        <h2 className={cn(
          "text-2xl font-bold",
          gameState === 'correct' ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
        )}>
          {gameState === 'correct' ? <Check className="mx-auto w-12 h-12" /> : <X className="mx-auto w-12 h-12" />}
          {gameState === 'correct' ? "You got it!" : "Nice try!"}
        </h2>
        <p className="text-lg">The word was <strong className="capitalize">{correctWord}</strong>.</p>
        <Button onClick={() => setGameState('idle')} size="lg" variant="outline" className="bg-white/50">
           <RefreshCw className="mr-2"/>
           Play Again
        </Button>
      </div>
  )

  const renderPlayingState = () => (
    <>
        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
        {imageUrl && (
            <Image 
                src={imageUrl} 
                alt="AI generated image for guessing game" 
                width={500} 
                height={500} 
                className="transition-all duration-500 ease-in-out object-cover w-full h-full"
                style={{ filter: `blur(${blurLevel}px)`}}
            />
        )}
        </div>
        <div className="flex items-center justify-center flex-wrap gap-1.5 h-10">
            {correctWord.split('').map((char, index) => (
                <div key={index} className="flex items-center justify-center size-8 bg-muted rounded">
                    <span className="text-xl font-bold">
                      {char === ' ' ? '\u00A0' : revealedIndices.has(index) ? char.toUpperCase() : '_'}
                    </span>
                </div>
            ))}
        </div>
        <form onSubmit={handleGuessSubmit} className="w-full flex flex-col items-center gap-4">
        <Input
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="What is this?"
            className="text-center text-lg h-12"
            disabled={gameState !== 'playing'}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
        />
        <div className="flex gap-2">
            <Button type="submit" size="lg" disabled={!userGuess}>
                <Check className="mr-2"/>
                Submit Guess
            </Button>
             <Button type="button" size="lg" variant="outline" onClick={handleHint} disabled={revealedIndices.size >= correctWord.replace(/ /g, '').length}>
                <Lightbulb className="mr-2"/>
                Hint
            </Button>
        </div>
        </form>
    </>
  )

  const renderContent = () => {
    switch(gameState) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
      case 'playing':
        return renderPlayingState();
      case 'correct':
      case 'lost':
        return renderGameTerminalState();
      case 'idle':
      default:
        return renderInitialState();
    }
  }

  return (
    <div className="py-8 flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Image Challenge</h1>
        <p className="text-white/90 drop-shadow-md">Guess the word from the blurry image!</p>
      </div>

      <Card className="w-full max-w-lg min-h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-sm border-2 border-white/50">
        <CardContent className="flex flex-col items-center gap-6 w-full p-6">
          {renderContent()}
        </CardContent>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
