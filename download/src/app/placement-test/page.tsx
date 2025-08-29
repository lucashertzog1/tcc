
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Question } from './questions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitPlacementTest, getPlacementTestQuestions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ClickableText } from '@/components/clickable-text';

type TestState = 'loading' | 'ongoing' | 'submitting' | 'finished';
type Answer = { questionId: string; question: string; level: string; isCorrect: boolean; selectedOption: string; };

export default function PlacementTestPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [testState, setTestState] = useState<TestState>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [finalResult, setFinalResult] = useState<{ finalLevel: string; analysis: string } | null>(null);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const fetchedQuestions = await getPlacementTestQuestions();
        if (fetchedQuestions.length === 0) {
            toast({ variant: 'destructive', title: "No Questions", description: "The placement test questions could not be loaded. Please contact support."});
            setTestState('ongoing'); // Or an error state
            return;
        }
        setQuestions(fetchedQuestions);
        setTestState('ongoing');
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        toast({ variant: 'destructive', title: "Error Loading Test", description: "There was a problem loading the test. Please try again later." });
      }
    };
    fetchQuestions();
  }, [toast]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelection = (optionId: string) => {
    setSelectedOption(optionId);
  };
  
  const handleNextQuestion = () => {
      if (!currentQuestion || !selectedOption) return;

      const isCorrect = selectedOption === currentQuestion.correctOption;
      
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        level: currentQuestion.level,
        isCorrect,
        selectedOption: selectedOption,
      };
      
      const updatedAnswers = [...userAnswers, newAnswer];
      setUserAnswers(updatedAnswers);
      setSelectedOption(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Last question answered, now submit
        handleTestSubmit(updatedAnswers);
      }
  };

  const handleTestSubmit = async (finalAnswers: Answer[]) => {
    if (!user) return;
    setTestState('submitting');
    
    const result = await submitPlacementTest({ userId: user.uid, answers: finalAnswers });

    if (result.success && result.finalLevel && result.analysis) {
        setFinalResult({ finalLevel: result.finalLevel, analysis: result.analysis });
        setTestState('finished');
    } else {
        toast({
            variant: 'destructive',
            title: "Submission Failed",
            description: result.error || "Could not process your test results. Please try again."
        });
        setTestState('ongoing'); 
    }
  }

  const progressValue = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isTestFinished = currentQuestionIndex === questions.length - 1;

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (testState === 'loading') {
      return (
         <div className="flex flex-col gap-4 justify-center items-center h-[calc(100vh-10rem)]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading test questions...</p>
        </div>
      )
  }
  
  if (testState === 'finished' && finalResult) {
    return (
        <div className="flex flex-col gap-8 py-12 items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="w-full max-w-2xl text-center p-8 animate-in fade-in duration-500 bg-white/80 backdrop-blur-sm border-2 border-white/50">
                <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold font-headline">Test Complete!</CardTitle>
                <CardDescription className="mt-2 mb-6">Here is your result:</CardDescription>
                
                <div className="bg-primary/10 rounded-lg p-6 my-6">
                    <p className="text-muted-foreground text-sm">Your Estimated Level</p>
                    <p className="text-5xl font-extrabold text-primary my-2">{finalResult.finalLevel}</p>
                    <p className="text-sm text-muted-foreground">{finalResult.analysis}</p>
                </div>

                <Button size="lg" onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </Card>
        </div>
    )
  }

  return (
    <div className="py-8 flex flex-col items-center gap-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Placement Test</h1>
          <p className="text-white/90 drop-shadow-md">Answer {questions.length} questions to find your English level.</p>
        </div>
        <Progress value={progressValue} />
        <p className="text-sm text-white/90 drop-shadow-md text-center mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <Card className="w-full max-w-3xl min-h-[28rem] bg-white/80 backdrop-blur-sm border-2 border-white/50">
        <CardHeader>
           {currentQuestion?.skill && (
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-primary" />
                 <CardDescription>Skill: {currentQuestion.skill}</CardDescription>
              </div>
            )}
            <CardTitle className="text-2xl h-16">
                {currentQuestion ? (
                  <ClickableText text={currentQuestion.question} className="text-2xl" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                     <Loader2 className="w-8 h-8 animate-spin"/>
                  </div>
                )}
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div className="space-y-3">
              {currentQuestion?.options.map((option) => (
                  <Button
                      key={option.id}
                      variant="outline"
                      size="lg"
                      className={cn(
                          "w-full justify-start h-auto py-4 text-left",
                          selectedOption === option.id && "bg-primary/10 border-primary"
                      )}
                      onClick={() => handleAnswerSelection(option.id)}
                      disabled={!currentQuestion || testState === 'submitting'}
                  >
                      <div className="flex items-center">
                          <div className="mr-4 rounded-md border size-6 flex items-center justify-center font-bold text-primary">
                            {option.id.toUpperCase()}
                          </div>
                          <span className="flex-1">{option.text}</span>
                      </div>
                  </Button>
              ))}
            </div>
             <Button
                size="lg"
                onClick={handleNextQuestion}
                disabled={!selectedOption || testState === 'submitting'}
                className="mt-4"
              >
                {testState === 'submitting' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : isTestFinished ? (
                  'Finish & See Results'
                ) : (
                  'Next Question'
                )}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
