
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isSameDay, isYesterday, subDays } from 'date-fns';


interface Achievement {
    name: string;
    description: string;
    unlockedAt: Date;
}

export interface UserProfile extends User {
  pandaPoints?: number;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  placementTestCompleted?: boolean;
  activitiesCompleted?: number;
  achievements?: Achievement[];
  currentStreak?: number;
  lastLoginDate?: Timestamp;
}

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | undefined;

    const handleStreak = async (userAuth: User, userData: UserProfile) => {
        const userDocRef = doc(db, 'users', userAuth.uid);
        const today = new Date();
        const lastLogin = userData.lastLoginDate?.toDate();
        let newStreak = userData.currentStreak || 0;
        let shouldUpdate = false;

        if (!lastLogin || !isSameDay(today, lastLogin)) {
            // It's a new day
            if (lastLogin && isYesterday(lastLogin)) {
                // It was yesterday, increment streak
                newStreak++;
            } else {
                // It was not yesterday, reset to 1 (for today's login)
                newStreak = 1;
            }
            shouldUpdate = true;
        } else {
            // Already logged in today, if streak is 0, make it 1
            if (newStreak === 0) {
              newStreak = 1;
              shouldUpdate = true;
            }
        }
        
        if (shouldUpdate) {
            await updateDoc(userDocRef, {
                currentStreak: newStreak,
                lastLoginDate: today,
            });
        }
    }

    const unsubscribeAuthState = onAuthStateChanged(auth, async (userAuth) => {
      // First, cancel any existing snapshot listener
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      if (userAuth) {
        const userDocRef = doc(db, 'users', userAuth.uid);
        
        // Set up a new snapshot listener for the logged-in user
        unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                 const userData = doc.data() as UserProfile;
                 
                 // Handle streak logic async
                 handleStreak(userAuth, userData);

                 setUser({
                    ...userAuth,
                    pandaPoints: userData.pandaPoints,
                    cefrLevel: userData.cefrLevel,
                    placementTestCompleted: userData.placementTestCompleted,
                    displayName: userData.displayName || userAuth.displayName,
                    activitiesCompleted: userData.activitiesCompleted,
                    achievements: userData.achievements,
                    currentStreak: userData.currentStreak,
                    lastLoginDate: userData.lastLoginDate,
                });
            } else {
                // This might be a new user, set default state
                setUser(userAuth as UserProfile);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setUser(userAuth); 
            setIsLoading(false);
        });

      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
        unsubscribeAuthState();
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
