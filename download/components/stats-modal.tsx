
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserProfile } from '@/contexts/auth-context';
import { Trophy, CheckCircle, Star, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface StatsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
}

export function StatsModal({ isOpen, onOpenChange, user }: StatsModalProps) {
  const router = useRouter();
  const stats = [
    { name: 'Panda Points', value: user.pandaPoints || 0, icon: Star },
    { name: 'Activities Completed', value: user.activitiesCompleted || 0, icon: CheckCircle },
    { name: 'Achievements', value: user.achievements?.length || 0, icon: Trophy },
  ];
  
  const goToRanking = () => {
    onOpenChange(false); // Close the modal
    router.push('/ranking');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">My Progress</DialogTitle>
          <DialogDescription className="text-center">
            Check your achievements and keep learning!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-secondary">
              <stat.icon className="w-10 h-10 text-primary mb-2" />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </div>
          ))}
        </div>
         {user.achievements && user.achievements.length > 0 && (
          <div className="mt-4">
            <h3 className="text-center font-bold mb-2">Unlocked Achievements</h3>
            <TooltipProvider>
                <div className="flex flex-wrap justify-center gap-4">
                {user.achievements.map((ach, i) => (
                    <Tooltip key={i}>
                        <TooltipTrigger asChild>
                            <span className="text-2xl cursor-pointer">🏆</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-bold">{ach.name}</p>
                            <p className="text-sm text-muted-foreground">{ach.description}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                </div>
            </TooltipProvider>
          </div>
        )}
        <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={goToRanking}>
                <BarChart3 className="mr-2" />
                View Weekly Ranking
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
