'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreCh } from '@/common/interfaces/score';

interface CustomSelectProps {
    value: ScoreCh;
    options: ScoreCh[];
    onChange: (value: ScoreCh) => void;
    disabled?: boolean;
    className?: string;
}

const getBadgeColorClass = (scoreCh: ScoreCh) => {
    switch (scoreCh) {
        case 'A':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        case 'B':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case 'C':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        case 'D':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800';
        case 'F':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800';
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 border-border';
    }
};

const getBadgeHoverColorClass = (scoreCh: ScoreCh) => {
    switch (scoreCh) {
        case 'A':
            return 'hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';
        case 'B':
            return 'hover:bg-blue-500/10 text-blue-800 dark:text-blue-300';
        case 'C':
            return 'hover:bg-amber-500/10 text-amber-800 dark:text-amber-300';
        case 'D':
            return 'hover:bg-orange-500/10 text-orange-800 dark:text-orange-300';
        case 'F':
            return 'hover:bg-red-500/10 text-red-800 dark:text-red-300';
        default:
            return 'hover:bg-accent';
    }
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    options,
    onChange,
    disabled = false,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const handleSelect = (val: ScoreCh) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn('relative inline-block w-20 text-left', className)}>
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={cn(
                    'flex items-center justify-between w-full h-8 px-2 py-1 text-xs font-bold border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ring select-none',
                    disabled
                        ? 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground'
                        : 'bg-background hover:bg-muted/50 cursor-pointer border-border',
                    value && getBadgeColorClass(value)
                )}
            >
                <span className="flex-1 text-center pr-1">{value}</span>
                <ChevronDown className={cn('h-3.5 w-3.5 opacity-70 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-1 w-20 rounded-md border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                        {options.map((opt) => {
                            const isSelected = opt === value;
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleSelect(opt)}
                                    className={cn(
                                        'relative flex items-center justify-center w-full h-7 text-xs font-bold rounded-sm px-1.5 transition-colors cursor-pointer select-none',
                                        isSelected
                                            ? getBadgeColorClass(opt) + ' ring-1 ring-inset ring-foreground/15'
                                            : cn('text-foreground/80 bg-transparent', getBadgeHoverColorClass(opt))
                                    )}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
