
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, FileText, Loader2, BookOpen, Gamepad2, Sparkles, Trophy, BrainCircuit, CheckCircle, BarChart3, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { AuthModal } from '@/components/auth-modal';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const features = [
    {
        title: 'Aprenda Brincando',
        description: 'Domine o inglês com jogos divertidos e interativos como Word Panda, Sentence Scramble e o Desafio de Imagem.',
        icon: Gamepad2,
        color: 'text-rose-500'
    },
    {
        title: 'Assistente de Estudos',
        description: "Ficou com dúvida? Nosso Panda Tutor está sempre pronto para ajudar com gramática, vocabulário e muito mais!",
        icon: BrainCircuit,
        color: 'text-blue-500'

    },
    {
        title: 'Acompanhe seu Progresso',
        description: 'Ganhe Panda Points, aumente sua sequência de dias (streak) e desbloqueie conquistas ao completar atividades.',
        icon: Trophy,
        color: 'text-amber-500'
    },
     {
        title: 'Histórias Infinitas',
        description: 'Leia histórias sempre novas no seu nível de dificuldade. Traduza qualquer palavra com apenas um clique!',
        icon: Wand2,
        color: 'text-violet-500'
    },
];

export default function LandingPage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading || user) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-sky-200 fixed inset-0 z-[200]">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      );
    }
    
    const primaryButtonClass = cn(
        "transition-transform duration-300 hover:scale-105",
        "bg-white text-primary hover:bg-white/90"
    );

    return (
        <div className="flex flex-col gap-20 md:gap-32 pb-12">
            <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />

            <section className="text-center flex flex-col items-center gap-6 pt-12 md:pt-20">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline text-white drop-shadow-lg animate-in fade-in-0 slide-in-from-top-4 duration-1000">
                    Aprender inglês nunca foi tão divertido.
                </h1>
                <p className="max-w-2xl text-lg text-white/90 drop-shadow-md animate-in fade-in-0 slide-in-from-top-4 duration-1000 delay-200">
                    Junte-se a milhares de crianças na jornada para a fluência com jogos interativos, histórias e um assistente de estudos!
                </p>
                <Button size="lg" className={cn("mt-4 text-base font-bold px-10 py-6", primaryButtonClass)} onClick={() => setIsAuthModalOpen(true)}>
                    Comece a Aprender (Grátis!)
                    <ArrowRight className="ml-2" />
                </Button>
            </section>

             <div className="bg-background pt-16 rounded-t-3xl md:rounded-t-[3rem] text-slate-800">
                 <section className="space-y-12 px-4 pb-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold font-headline">O Jeito Divertido de Dominar o Inglês</h2>
                        <p className="text-muted-foreground mt-2">O Speakids foi criado com recursos para que aprender se pareça com brincar.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {features.map((feature, i) => (
                           <div key={feature.title} className="flex gap-6 items-start animate-in fade-in-0 slide-in-from-bottom-5 duration-1000" style={{ animationDelay: `${i * 150}ms`}}>
                                <div className={cn("p-3 bg-secondary rounded-full", feature.color)}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{feature.title}</h3>
                                    <p className="text-muted-foreground mt-1">{feature.description}</p>
                                </div>
                           </div>
                        ))}
                    </div>
                </section>
                
                 <section className="bg-secondary/50 py-20 px-4">
                     <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold font-headline">Comece sua Aventura</h2>
                        <p className="text-muted-foreground mt-2">Sua jornada para a fluência é simples e divertida.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-5xl mx-auto mt-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white rounded-full text-primary shadow-md"><Gamepad2 className="w-8 h-8" /></div>
                            <h3 className="font-bold text-xl">1. Explore as Atividades</h3>
                            <p className="text-muted-foreground">Vá para a seção "Daily Activities" e escolha um dos nossos jogos interativos.</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white rounded-full text-primary shadow-md"><BookOpen className="w-8 h-8" /></div>
                            <h3 className="font-bold text-xl">2. Pratique Leitura</h3>
                            <p className="text-muted-foreground">Leia histórias geradas por IA no seu nível e traduza palavras com um clique.</p>
                        </div>
                    </div>
                </section>

                 <section className="text-center py-20 px-4">
                     <h2 className="text-3xl font-bold font-headline text-slate-800">Pronto para começar sua aventura?</h2>
                     <p className="max-w-2xl mx-auto mt-2 text-muted-foreground">
                        Crie sua conta gratuita e desbloqueie um novo mundo de aprendizado de inglês hoje.
                    </p>
                    <Button size="lg" className="mt-8 text-base font-bold px-10 py-6 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform" onClick={() => setIsAuthModalOpen(true)}>
                        Entrar no Speakids
                        <ArrowRight className="ml-2" />
                    </Button>
                </section>
             </div>
        </div>
    );

    

    

