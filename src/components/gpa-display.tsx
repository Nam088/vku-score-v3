'use client';
import React, { useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useScoreStore } from '@/store/useScoreStore';
import { calculateGPA } from '@/common/services/gpa.service';
import { toast } from 'sonner';
import { GraduationCap, Award, Percent, BookOpen, Layers } from 'lucide-react';

const GpaDisplay: React.FC = () => {
    const { scores } = useScoreStore();

    // Tính toán GPA bằng useMemo để tối ưu hiệu năng
    const gpaStats = useMemo(() => calculateGPA(scores), [scores]);
    const { gpa, gpaNew, difference, gpa10, allTinChi } = gpaStats;

    const prevGpaNewRef = useRef<number>(gpaNew);

    useEffect(() => {
        if (prevGpaNewRef.current !== gpaNew) {
            toast.success(`GPA đã được cập nhật thành ${gpaNew.toFixed(2)}`, {
                id: `update_gpa_${gpaNew}`,
            });
            prevGpaNewRef.current = gpaNew;
        }
    }, [gpaNew]);

    if (scores.length === 0) return null;

    const stats = [
        {
            title: 'GPA Cũ (Hệ 4)',
            value: gpa.toFixed(2),
            subValue: gpa.toFixed(8),
            icon: <GraduationCap className="h-5 w-5 text-emerald-500" />,
            colorClass: 'text-emerald-600 dark:text-emerald-400',
            bgClass: 'bg-emerald-500/10 border-emerald-500/20',
        },
        {
            title: 'GPA Mới (Hệ 4)',
            value: gpaNew.toFixed(2),
            subValue: gpaNew.toFixed(8),
            icon: <Award className="h-5 w-5 text-blue-500" />,
            colorClass: 'text-blue-600 dark:text-blue-400',
            bgClass: 'bg-blue-500/10 border-blue-500/20',
        },
        {
            title: 'Độ Chênh Lệch',
            value: (difference >= 0 ? '+' : '') + difference.toFixed(3),
            subValue: difference.toFixed(8),
            icon: <Percent className="h-5 w-5 text-indigo-500" />,
            colorClass: difference > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground',
            bgClass: 'bg-indigo-500/10 border-indigo-500/20',
        },
        {
            title: 'Điểm Hệ 10',
            value: gpa10.toFixed(2),
            subValue: gpa10.toFixed(8),
            icon: <BookOpen className="h-5 w-5 text-amber-500" />,
            colorClass: 'text-amber-600 dark:text-amber-400',
            bgClass: 'bg-amber-500/10 border-amber-500/20',
        },
        {
            title: 'Tổng Tín Chỉ',
            value: allTinChi.toString(),
            subValue: 'Số lượng tín chỉ tích lũy',
            icon: <Layers className="h-5 w-5 text-sky-500" />,
            colorClass: 'text-sky-600 dark:text-sky-400',
            bgClass: 'bg-sky-500/10 border-sky-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat, idx) => (
                <Card key={idx} className={`border border-border shadow-sm hover:shadow-md transition-all duration-300 ${stat.bgClass}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {stat.title}
                        </span>
                        {stat.icon}
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className={`text-2xl md:text-3xl font-extrabold tracking-tight ${stat.colorClass}`}>
                            {stat.value}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {stat.subValue}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default GpaDisplay;
