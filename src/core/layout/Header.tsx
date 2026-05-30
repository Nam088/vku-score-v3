'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
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
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        VKU Score
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    {mounted ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                            aria-label="Toggle theme"
                            className="rounded-full hover:bg-muted/80"
                        >
                            {resolvedTheme === 'dark' ? (
                                <Moon className="h-[1.2rem] w-[1.2rem] text-sky-400" />
                            ) : (
                                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
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
