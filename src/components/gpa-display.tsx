'use client';
import React, { useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useScoreStore } from '@/store/useScoreStore';
import { calculateGPA } from '@/common/services/gpa.service';
import { toast } from 'sonner';
import { GraduationCap, Award, TrendingUp, BookOpen, Layers } from 'lucide-react';

const getGpaLabel = (gpa: number): { label: string; color: string } => {
    if (gpa >= 3.6) return { label: 'Xuất sắc', color: 'text-emerald-600 dark:text-emerald-400' };
    if (gpa >= 3.2) return { label: 'Giỏi', color: 'text-blue-600 dark:text-blue-400' };
    if (gpa >= 2.5) return { label: 'Khá', color: 'text-amber-600 dark:text-amber-400' };
    if (gpa >= 2.0) return { label: 'Trung bình', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Yếu', color: 'text-red-600 dark:text-red-400' };
};

const GpaDisplay: React.FC = () => {
    const { scores } = useScoreStore();

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

    const gpaLabel = getGpaLabel(gpa);
    const gpaNewLabel = getGpaLabel(gpaNew);

    const stats = [
        {
            title: 'GPA Cũ',
            subtitle: 'Hệ 4',
            value: gpa.toFixed(2),
            precision: gpa.toFixed(6),
            badge: gpaLabel.label,
            badgeColor: gpaLabel.color,
            icon: <GraduationCap className="h-4 w-4" />,
            iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
            barColor: 'bg-emerald-500',
            barValue: (gpa / 4) * 100,
        },
        {
            title: 'GPA Mới',
            subtitle: 'Hệ 4',
            value: gpaNew.toFixed(2),
            precision: gpaNew.toFixed(6),
            badge: gpaNewLabel.label,
            badgeColor: gpaNewLabel.color,
            icon: <Award className="h-4 w-4" />,
            iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
            barColor: 'bg-blue-500',
            barValue: (gpaNew / 4) * 100,
        },
        {
            title: 'Chênh lệch',
            subtitle: 'GPA thay đổi',
            value: (difference >= 0 ? '+' : '') + difference.toFixed(3),
            precision: (difference >= 0 ? '+' : '') + difference.toFixed(6),
            badge: difference > 0 ? '↑ Tăng' : difference < 0 ? '↓ Giảm' : '— Không đổi',
            badgeColor: difference > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground',
            icon: <TrendingUp className="h-4 w-4" />,
            iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
            barColor: difference > 0 ? 'bg-indigo-500' : 'bg-muted-foreground/40',
            barValue: Math.min(Math.abs(difference / 4) * 100 * 5, 100),
        },
        {
            title: 'Điểm TB',
            subtitle: 'Hệ 10',
            value: gpa10.toFixed(2),
            precision: gpa10.toFixed(6),
            badge: gpa10 >= 8.5 ? 'Xuất sắc' : gpa10 >= 7.0 ? 'Giỏi' : gpa10 >= 5.5 ? 'Khá' : 'TB',
            badgeColor: 'text-amber-600 dark:text-amber-400',
            icon: <BookOpen className="h-4 w-4" />,
            iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
            barColor: 'bg-amber-500',
            barValue: (gpa10 / 10) * 100,
        },
        {
            title: 'Tín chỉ',
            subtitle: 'Đã tích lũy',
            value: allTinChi.toString(),
            precision: `${allTinChi} tín chỉ`,
            badge: allTinChi >= 120 ? 'Hoàn thành' : `${allTinChi}/120`,
            badgeColor: 'text-sky-600 dark:text-sky-400',
            icon: <Layers className="h-4 w-4" />,
            iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
            barColor: 'bg-sky-500',
            barValue: Math.min((allTinChi / 120) * 100, 100),
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((stat, idx) => (
                <Card
                    key={idx}
                    className="border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-card overflow-hidden"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground leading-none">
                                {stat.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.subtitle}</p>
                        </div>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.iconBg}`}>
                            {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-2">
                        <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                            {stat.value}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold ${stat.badgeColor}`}>
                                {stat.badge}
                            </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${stat.barColor}`}
                                style={{ width: `${Math.max(stat.barValue, 2)}%` }}
                            />
                        </div>
                        <div className="text-[9px] text-muted-foreground/50 font-mono truncate">
                            {stat.precision}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default GpaDisplay;
