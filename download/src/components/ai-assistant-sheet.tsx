
'use client';

import { useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PandaLogo } from './panda-logo';
import { handleAiQuery } from '@/app/actions';
import { Sparkles, Send } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ClickableText } from './clickable-text';

const initialState = {
  answer: '',
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Thinking...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Ask
        </>
      )}
    </Button>
  );
}

export function AiAssistantSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(handleAiQuery, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong.',
        description: state.error,
      });
    }
    if (state.answer) {
        formRef.current?.reset();
    }
  }, [state.error, state.answer, toast]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className='flex items-center gap-2'>
            <PandaLogo /> Study Assistant
          </SheetTitle>
          <SheetDescription>
            Have a question about English? Ask our assistant!
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4 min-h-0">
          <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/50">
            {state.answer ? (
              <ClickableText text={state.answer} className="text-sm" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Sparkles className="w-10 h-10 mb-2" />
                <p>The assistant's answer will appear here.</p>
              </div>
            )}
          </ScrollArea>
        </div>
        <SheetFooter>
          <form ref={formRef} action={formAction} className="w-full space-y-4">
            <Input name="query" placeholder="E.g. What's the difference between 'in' and 'on'?" />
            <SubmitButton />
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
