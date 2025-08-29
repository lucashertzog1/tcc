
'use client';

import { useState, useEffect } from 'react';
import { PandaLogo } from './panda-logo';
import { Button } from './ui/button';
import { AuthModal } from './auth-modal';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, ChevronDown, BarChart3, User, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { StatsModal } from './stats-modal';
import { AiAssistantSheet } from './ai-assistant-sheet';

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isAssistantSheetOpen, setIsAssistantSheetOpen] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }
  
  const noBackButtonPaths = ['/', '/dashboard'];
  const showBackButton = isMounted && !noBackButtonPaths.includes(pathname);

  const isDarkBg = ['/', '/dashboard'].includes(pathname);

  const buttonClass = cn(
    "transition-colors duration-300",
    isDarkBg ? "text-white hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-200/80 hover:text-slate-800"
  );
  
  const primaryButtonClass = cn(
      "transition-colors duration-300",
      isDarkBg ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
  );

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      {user && <StatsModal isOpen={isStatsModalOpen} onOpenChange={setIsStatsModalOpen} user={user} />}
      <AiAssistantSheet open={isAssistantSheetOpen} onOpenChange={setIsAssistantSheetOpen} />
      
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-20 items-center">
          <div className="flex items-center gap-4">
             {showBackButton && (
                <Button variant="ghost" size="icon" onClick={() => router.back()} className={buttonClass}>
                    <ArrowLeft />
                    <span className="sr-only">Voltar</span>
                </Button>
            )}
            <PandaLogo />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {isMounted && user ? (
              <>
                <Button variant="outline" onClick={() => setIsAssistantSheetOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Assistente
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={buttonClass}>
                       <User className="mr-2 h-4 w-4" />
                       {user.displayName || user.email}
                       <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsStatsModalOpen(true)}>
                      Meu Progresso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : isMounted && (
              <>
                <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)} className={buttonClass}>
                  Log In
                </Button>
                <Button onClick={() => setIsAuthModalOpen(true)} className={primaryButtonClass}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
