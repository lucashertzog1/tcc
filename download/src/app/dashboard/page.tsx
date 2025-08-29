
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Loader2, CalendarCheck, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { PandaPointsCard } from '@/components/panda-points-card';
import { StreakCard } from '@/components/streak-card';

const activities = [
    { title: 'Daily Activities', href: '/daily-activity', icon: CalendarCheck, description: 'New challenges every day!' },
    { title: 'Reading Practice', href: '/reading', icon: Book, description: 'Read stories and translate words.' },
];


export default function DashboardPage() {
    const { user, isLoading } = useAuth();

    if (isLoading || !user) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-12 md:gap-16 pb-12 pt-8">
             <section className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Hello, {user.displayName || 'student'}!</h1>
                <p className="text-white/90 drop-shadow-md">
                    Ready to learn and have fun today?
                </p>
             </section>

             <section className="grid grid-cols-2 max-w-sm mx-auto w-full gap-4">
                <PandaPointsCard points={user.pandaPoints || 0} />
                <StreakCard days={user.currentStreak || 0} />
             </section>

            <section className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline text-white drop-shadow-md">Our Activities</h2>
                    <p className="text-white/90 drop-shadow-sm">Choose an activity to start.</p>
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
        </div>
    );
}
