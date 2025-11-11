'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, CalendarCheck, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const activities = [
  { title: 'Atividades Diárias', href: '/daily-activity', icon: CalendarCheck, description: 'Novos desafios todos os dias!' },
  { title: 'Prática de Leitura', href: '/reading', icon: Book, description: 'Leia histórias e traduza palavras.' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ login: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      router.push('/login'); // se não estiver logado
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex flex-col gap-12 md:gap-16 pb-24 pt-8 min-h-screen relative">
      {/* Cabeçalho */}
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">
          {user ? `Olá, ${user.login}!` : 'Olá!'}
        </h1>
        <p className="text-white/90 drop-shadow-md">
          Pronto para aprender e se divertir hoje?
        </p>
      </section>

      {/* Atividades */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-headline text-white drop-shadow-md">Nossas Atividades</h2>
          <p className="text-white/90 drop-shadow-sm">Escolha uma atividade para começar.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {activities.map((activity) => (
            <Link key={activity.title} href={activity.href} className="text-left">
              <Card className="h-full hover:shadow-xl hover:-translate-y-1.5 transition-transform duration-300 flex flex-col bg-white/80 backdrop-blur-sm border-2 border-white/50">
                <CardHeader className="flex-row items-center gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <activity.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{activity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Botão de sair */}
      <button
        onClick={handleLogout}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition"
      >
        <LogOut className="w-5 h-5" />
        Sair
      </button>
    </div>
  );
}
