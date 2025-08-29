
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Puzzle, Image as ImageIcon, TextQuote, CheckCircle, Brain } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const dailyGames = [
  {
    id: 'word-panda',
    title: 'Word Panda',
    description: 'Guess the secret word. A new challenge every day!',
    href: '/daily-activity/word-panda',
    icon: Puzzle,
  },
  {
    id: 'sentence-scramble',
    title: 'Sentence Scramble',
    description: 'Put the words in the correct order to form a sentence.',
    href: '/daily-activity/sentence-scramble',
    icon: TextQuote,
  },
  {
    id: 'blurry-image',
    title: 'Image Challenge',
    description: 'What do you see? Guess the word from a random image.',
    href: '/daily-activity/blurry-image',
    icon: ImageIcon,
  },
];

export default function DailyActivityPage() {
  const [completedStatus, setCompletedStatus] = useState<Record<string, boolean>>({});
  const { user } = useAuth(); // The user object will re-render the component on change

  // This effect will run whenever the component mounts or the user object changes.
  // It checks localStorage to see which games have been completed today.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCompletionStatus = () => {
      const today = new Date().toISOString().split('T')[0];
      const newStatus: Record<string, boolean> = {};
      dailyGames.forEach(game => {
        const storedDate = localStorage.getItem(`completed-${game.id}`);
        if (storedDate === today) {
          newStatus[game.id] = true;
        } else {
          newStatus[game.id] = false;
        }
      });
      setCompletedStatus(newStatus);
    };

    checkCompletionStatus();
    
    // Optional: Listen for storage changes from other tabs, although less critical for this app.
    const handleStorageChange = () => {
      checkCompletionStatus();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [user]); // Rerunning this on user change is fine, it's a cheap operation.

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Daily Activities</h1>
        <p className="text-white/90 drop-shadow-md">New challenges to test your skills every day!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        {dailyGames.map((game) => {
          const isCompleted = completedStatus[game.id];
          return (
            <Link 
              href={isCompleted ? '#' : game.href} 
              key={game.title} 
              className={cn("group", isCompleted && "pointer-events-none opacity-70")}
              // This onClick handler forces a re-check right after navigation, useful for quick back-and-forth.
              onClick={() => setTimeout(() => {
                  const today = new Date().toISOString().split('T')[0];
                  if(localStorage.getItem(`completed-${game.id}`) === today) {
                      setCompletedStatus(prev => ({...prev, [game.id]: true}));
                  }
              }, 500)}
            >
              <Card className={cn(
                  "h-full hover:shadow-xl hover:-translate-y-1.5 transition-transform duration-300 flex flex-col text-left bg-white/80 backdrop-blur-sm border-2 border-white/50",
                  isCompleted && "bg-green-500/20 border-green-500/30"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                      <div className="p-3 bg-secondary rounded-full">
                        <game.icon className="w-7 h-7 text-primary" />
                      </div>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                      )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <CardTitle className="mb-2">{game.title}</CardTitle>
                  <CardDescription className="flex-1">{isCompleted ? "Completed for today! Come back tomorrow." : game.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
