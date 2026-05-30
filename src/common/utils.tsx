import React from 'react';
import { IScore, ScoreCh } from '@/common/interfaces/score';

export const isScoreArray = (data: any): data is IScore[] => {
    if (!Array.isArray(data)) {
        return false;
    }

    return data.every(item => {
        if (typeof item !== 'object' || item === null) {
            return false;
        }

        const {
            value,
            key,
            id,
            name,
            countTC,
            countLH,
            scoreCC,
            scoreBT,
            scoreGK,
            scoreCK,
            scoreT10,
            scoreCh,
            scoreChChange,
            semester,
        } = item;

        const isValidScoreCh = (score: any): score is ScoreCh | null => {
            const validScores: ScoreCh[] = ["A", "B", "C", "D", "F"];
            return score === null || validScores.includes(score);
        };

        return (
            typeof value === 'string' &&
            (typeof key === 'number' || key === null || key === undefined) &&
            typeof id === 'number' &&
            typeof name === 'string' &&
            (typeof countTC === 'number' || countTC === null || countTC === undefined) &&
            (typeof countLH === 'number' || countLH === null || countLH === undefined) &&
            (typeof scoreCC === 'number' || scoreCC === null || scoreCC === undefined) &&
            (typeof scoreBT === 'number' || scoreBT === null || scoreBT === undefined) &&
            (typeof scoreGK === 'number' || scoreGK === null || scoreGK === undefined) &&
            (typeof scoreCK === 'number' || scoreCK === null || scoreCK === undefined) &&
            (typeof scoreT10 === 'number' || scoreT10 === null || scoreT10 === undefined) &&
            isValidScoreCh(scoreCh) &&
            isValidScoreCh(scoreChChange) &&
            (typeof semester === 'string' || semester === null || semester === undefined)
        );
    });
};

export const removeVietnameseTones = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
};

export const fuzzyMatch = (text: string, query: string): boolean => {
    const cleanText = removeVietnameseTones(text);
    const cleanQuery = removeVietnameseTones(query);
    
    if (cleanText.includes(cleanQuery)) return true;
    
    let queryIdx = 0;
    for (let i = 0; i < cleanText.length; i++) {
        if (cleanText[i] === cleanQuery[queryIdx]) {
            queryIdx++;
        }
        if (queryIdx === cleanQuery.length) {
            return true;
        }
    }
    return false;
};

export const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
    if (!query) return <>{text}</>;

    const cleanText = removeVietnameseTones(text);
    const cleanQuery = removeVietnameseTones(query);

    // 1. Direct substring match (simple case)
    const directIdx = cleanText.indexOf(cleanQuery);
    if (directIdx !== -1) {
        const start = text.substring(0, directIdx);
        const match = text.substring(directIdx, directIdx + query.length);
        const end = text.substring(directIdx + query.length);
        return (
            <>
                {start}
                <mark className="bg-yellow-500/30 text-yellow-900 dark:text-yellow-100 rounded-[2px] px-0.5 font-semibold">
                    {match}
                </mark>
                {end}
            </>
        );
    }

    // 2. Loose subsequence matching (highlighting individual characters)
    const result: React.ReactNode[] = [];
    let queryIdx = 0;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const cleanChar = removeVietnameseTones(char);
        
        if (queryIdx < cleanQuery.length && cleanChar === cleanQuery[queryIdx]) {
            result.push(
                <mark key={i} className="bg-yellow-500/30 text-yellow-900 dark:text-yellow-100 rounded-[2px] px-0.5 font-semibold">
                    {char}
                </mark>
            );
            queryIdx++;
        } else {
            result.push(char);
        }
    }
    
    // Fallback if not subsequence matching for some reason
    if (queryIdx < cleanQuery.length) {
        return <>{text}</>;
    }

    return <>{result}</>;
};
