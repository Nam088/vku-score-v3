'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { useScoreStore } from '@/store/useScoreStore';
import { ScoreCh } from '@/common/interfaces/score';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

const gpaMap: Record<ScoreCh, number> = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0,
};

// Phân tích thứ tự học kỳ để sắp xếp theo dòng thời gian
const parseSemesterOrder = (sem: string): number => {
    const yearMatch = sem.match(/(\d{4})/);
    const yearVal = yearMatch ? parseInt(yearMatch[1]) : 0;
    
    let termVal = 0;
    if (sem.toLowerCase().includes('phụ') || sem.toLowerCase().includes('hè')) {
        termVal = 3;
    } else if (sem.toLowerCase().includes('kỳ 2')) {
        termVal = 2;
    } else if (sem.toLowerCase().includes('kỳ 1')) {
        termVal = 1;
    }
    
    return yearVal * 10 + termVal;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 border border-border px-3 py-2 rounded-lg shadow-lg backdrop-blur-md text-[11px] font-medium space-y-1">
                <p className="text-foreground font-semibold border-b border-border pb-1 mb-1">{label}</p>
                {payload.map((item: any, idx: number) => {
                    const isSim = item.dataKey === 'gpaSimulated';
                    const labelText = isSim ? 'GPA giả lập' : 'GPA gốc';
                    const strokeColor = item.stroke;
                    return (
                        <div key={idx} className="flex items-center justify-between gap-6">
                            <span className="text-muted-foreground">{labelText}:</span>
                            <span className="font-mono font-bold" style={{ color: strokeColor }}>
                                {item.value.toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

const GpaTrendChart: React.FC = () => {
    const { scores } = useScoreStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartData = useMemo(() => {
        if (scores.length === 0) return [];

        // Gom các môn có điểm hợp lệ
        const validScores = scores.filter(s => s.scoreCh !== null);
        if (validScores.length === 0) return [];

        // Lấy danh sách các học kỳ duy nhất
        const uniqueSemesters = Array.from(new Set(validScores.map(s => s.semester || 'Không rõ')));
        
        // Sắp xếp các học kỳ theo thời gian
        uniqueSemesters.sort((a, b) => parseSemesterOrder(a) - parseSemesterOrder(b));

        const cumulativePoints: { semester: string; gpaOriginal: number; gpaSimulated: number }[] = [];

        // Tính GPA tích lũy cho từng mốc học kỳ
        for (let i = 0; i < uniqueSemesters.length; i++) {
            const currentSemSet = uniqueSemesters.slice(0, i + 1);
            
            // Lấy tất cả môn học thuộc các học kỳ tính đến thời điểm hiện tại
            const semScores = validScores.filter(s => currentSemSet.includes(s.semester || 'Không rõ'));

            let totalCredits = 0;
            let originalPoints = 0;
            let simulatedPoints = 0;

            for (const s of semScores) {
                const credits = s.countTC || 0;
                totalCredits += credits;

                const origGrade = s.scoreCh as ScoreCh;
                originalPoints += gpaMap[origGrade] * credits;

                const simGrade = (s.scoreChChange || s.scoreCh) as ScoreCh;
                simulatedPoints += gpaMap[simGrade] * credits;
            }

            const gpaOriginal = totalCredits === 0 ? 0 : originalPoints / totalCredits;
            const gpaSimulated = totalCredits === 0 ? 0 : simulatedPoints / totalCredits;

            // Rút gọn nhãn học kỳ cho biểu đồ (Ví dụ: "Học kỳ 1 năm học 2023-2024" -> "HK1 (23-24)")
            const semLabel = uniqueSemesters[i]
                .replace(/Học kỳ\s*/gi, 'HK')
                .replace(/Năm học\s*/gi, '')
                .replace(/20(\d{2})-20(\d{2})/g, '$1-$2');

            cumulativePoints.push({
                semester: semLabel,
                gpaOriginal,
                gpaSimulated
            });
        }

        return cumulativePoints;
    }, [scores]);

    if (chartData.length === 0) return null;

    if (!isMounted) {
        return (
            <Card className="border border-border shadow-sm bg-card/60 backdrop-blur-sm">
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                        Biểu Đồ Tiến Trình GPA Tích Lũy
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[220px] flex items-center justify-center text-muted-foreground text-xs font-medium">
                    Đang tải biểu đồ...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-border shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader className="py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                    Biểu Đồ Tiến Trình GPA Tích Lũy
                </CardTitle>
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-zinc-500 inline-block" />
                        <span className="text-muted-foreground">GPA gốc</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-blue-600 dark:bg-blue-400 inline-block rounded" />
                        <span className="text-foreground">GPA giả lập</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
                <div className="w-full h-[220px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="semester"
                                tickLine={false}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                dy={8}
                            />
                            <YAxis
                                domain={[0, 4.0]}
                                tickLine={false}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                dx={-5}
                                ticks={[0, 1.0, 2.0, 3.0, 4.0]}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                wrapperStyle={{ zIndex: 1000 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="gpaOriginal"
                                stroke="hsl(var(--gpa-original))"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={{
                                    r: 3.5,
                                    strokeWidth: 1.5,
                                    stroke: 'hsl(var(--gpa-original))',
                                    fill: 'hsl(var(--background))'
                                }}
                                activeDot={{
                                    r: 5.5,
                                    strokeWidth: 1.5,
                                    stroke: 'hsl(var(--background))',
                                    fill: 'hsl(var(--gpa-original))'
                                }}
                                name="GPA Gốc"
                            />
                            <Line
                                type="monotone"
                                dataKey="gpaSimulated"
                                stroke="hsl(var(--gpa-simulated))"
                                strokeWidth={2.5}
                                dot={{
                                    r: 4.5,
                                    strokeWidth: 1.5,
                                    stroke: 'hsl(var(--gpa-simulated))',
                                    fill: 'hsl(var(--gpa-simulated))'
                                }}
                                activeDot={{
                                    r: 6.5,
                                    strokeWidth: 2,
                                    stroke: 'hsl(var(--background))',
                                    fill: 'hsl(var(--gpa-simulated))'
                                }}
                                name="GPA Giả Lập"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default GpaTrendChart;
