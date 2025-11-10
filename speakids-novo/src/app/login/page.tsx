
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular uma chamada de API
    setTimeout(() => {
      toast({
        title: 'Login bem-sucedido!',
        description: 'Bem-vindo de volta!',
      });
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-2 border-white/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-headline">Bem-vindo de Volta!</CardTitle>
          <CardDescription>Entre na sua conta para continuar aprendendo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Crie uma agora
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
