
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const target = e.target as typeof e.target & {
      name: { value: string };
      'email-signup': { value: string };
      'password-signup': { value: string };
    };

    const name = target.name.value;
    const email = target['email-signup'].value;
    const password = target['password-signup'].value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });
      
      // Create a user document in Firestore with all necessary fields
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email,
        createdAt: new Date(),
        pandaPoints: 0,
        cefrLevel: 'A1', // Start users at A1 by default
        placementTestCompleted: false, // Default value
        activitiesCompleted: 0,
        achievements: [],
        currentStreak: 0,
        lastLoginDate: null,
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Error!',
        description: error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Your name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input id="email-signup" name="email-signup" type="email" placeholder="you@email.com" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-signup">Password</Label>
        <Input id="password-signup" name="password-signup" type="password" required />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
