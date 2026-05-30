'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                        <GraduationCap className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                        VKU Score
                    </span>
                    <span className="hidden sm:inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400">
                        v3
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {mounted ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                            aria-label="Toggle theme"
                            className="rounded-full hover:bg-muted/80 transition-colors"
                        >
                            {resolvedTheme === 'dark' ? (
                                <Moon className="h-[1.1rem] w-[1.1rem] text-sky-400" />
                            ) : (
                                <Sun className="h-[1.1rem] w-[1.1rem] text-amber-500" />
                            )}
                        </Button>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-muted/40 animate-pulse" />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
