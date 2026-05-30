'use client';
import React, { useMemo } from 'react';
import { useScoreStore } from '@/store/useScoreStore';
import { IScore, ScoreCh } from '@/common/interfaces/score';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

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

const GpaTrendChart: React.FC = () => {
    const { scores } = useScoreStore();

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

    // Kích thước biểu đồ SVG (viewBox)
    const viewWidth = 600;
    const viewHeight = 220;
    const padding = { top: 20, right: 30, bottom: 45, left: 45 };

    const plotWidth = viewWidth - padding.left - padding.right;
    const plotHeight = viewHeight - padding.top - padding.bottom;

    // Giới hạn Y: từ 0.0 đến 4.0
    const getX = (index: number) => {
        if (chartData.length <= 1) return padding.left + plotWidth / 2;
        return padding.left + (index * plotWidth) / (chartData.length - 1);
    };

    const getY = (val: number) => {
        // Tỷ lệ tuyến tính giữa 0 và 4.0
        return padding.top + plotHeight - (val / 4.0) * plotHeight;
    };

    // Tạo chuỗi đường path cho SVG
    let originalPath = '';
    let simulatedPath = '';

    chartData.forEach((pt, idx) => {
        const x = getX(idx);
        const yOrig = getY(pt.gpaOriginal);
        const ySim = getY(pt.gpaSimulated);

        if (idx === 0) {
            originalPath = `M ${x} ${yOrig}`;
            simulatedPath = `M ${x} ${ySim}`;
        } else {
            originalPath += ` L ${x} ${yOrig}`;
            simulatedPath += ` L ${x} ${ySim}`;
        }
    });

    const isGpaImproved = chartData.some(pt => pt.gpaSimulated > pt.gpaOriginal);

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
                <div className="w-full overflow-x-auto select-none">
                    <div className="min-w-[500px]">
                        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto">
                            {/* Grid Lines & Y Axis Labels */}
                            {[0.0, 1.0, 2.0, 3.0, 4.0].map((level) => {
                                const y = getY(level);
                                return (
                                    <g key={level} className="opacity-40">
                                        <line
                                            x1={padding.left}
                                            y1={y}
                                            x2={viewWidth - padding.right}
                                            y2={y}
                                            stroke="currentColor"
                                            strokeWidth="0.5"
                                            strokeDasharray="4 4"
                                            className="text-border"
                                        />
                                        <text
                                            x={padding.left - 8}
                                            y={y + 4}
                                            textAnchor="end"
                                            className="text-[10px] font-bold fill-muted-foreground font-mono"
                                        >
                                            {level.toFixed(1)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* X Axis Labels (Semesters) */}
                            {chartData.map((pt, idx) => {
                                const x = getX(idx);
                                return (
                                    <text
                                        key={idx}
                                        x={x}
                                        y={viewHeight - padding.bottom + 16}
                                        textAnchor="middle"
                                        className="text-[9px] font-bold fill-muted-foreground"
                                    >
                                        {pt.semester}
                                    </text>
                                );
                            })}

                            {/* Paths */}
                            <path
                                d={originalPath}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                                className="text-slate-400 dark:text-zinc-500"
                            />
                            
                            {isGpaImproved && (
                                <path
                                    d={simulatedPath}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-blue-600 dark:text-blue-400 stroke-linecap-round stroke-linejoin-round"
                                />
                            )}

                            {/* Data points for Original GPA */}
                            {chartData.map((pt, idx) => (
                                <circle
                                    key={`orig-${idx}`}
                                    cx={getX(idx)}
                                    cy={getY(pt.gpaOriginal)}
                                    r="3"
                                    className="fill-background stroke-slate-400 dark:stroke-zinc-500 stroke-[1.5]"
                                />
                            ))}

                            {/* Data points for Simulated GPA */}
                            {chartData.map((pt, idx) => {
                                const isTargetBetter = pt.gpaSimulated > pt.gpaOriginal;
                                return (
                                    <circle
                                        key={`sim-${idx}`}
                                        cx={getX(idx)}
                                        cy={getY(pt.gpaSimulated)}
                                        r="4"
                                        className={
                                            isTargetBetter 
                                                ? "fill-blue-600 dark:fill-blue-400 stroke-background stroke-2" 
                                                : "fill-background stroke-slate-400 dark:stroke-zinc-500 stroke-[1.5]"
                                        }
                                    />
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GpaTrendChart;
