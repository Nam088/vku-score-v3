'use client';
import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useScoreStore } from '@/store/useScoreStore';
import { calculateTargetGpa } from '@/common/services/target-gpa.service';
import { Target, AlertTriangle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { ScoreCh } from '@/common/interfaces/score';

const getBadgeColorClass = (scoreCh: ScoreCh) => {
    switch (scoreCh) {
        case 'A':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
        case 'B':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
        case 'C':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        case 'D':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
        case 'F':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
};

const TargetGpaDialog: React.FC = () => {
    const { dialogs, toggleDialog, scores, changeScoreCh } = useScoreStore();
    const [targetInput, setTargetInput] = useState<string>('3.2');

    const handleClose = () => {
        toggleDialog('targetGpa');
    };

    const targetNum = useMemo(() => {
        const parsed = parseFloat(targetInput);
        return isNaN(parsed) ? 0 : parsed;
    }, [targetInput]);

    const result = useMemo(() => {
        if (targetNum <= 0 || scores.length === 0) return null;
        return calculateTargetGpa(scores, targetNum);
    }, [scores, targetNum]);

    const handleApplyAll = () => {
        if (!result || result.recommendations.length === 0) return;
        result.recommendations.forEach((rec) => {
            const matchedScore = scores.find(s => s.id === rec.id);
            if (matchedScore) {
                changeScoreCh(matchedScore, rec.toGrade);
            }
        });
        handleClose();
    };

    return (
        <Dialog open={dialogs.targetGpa} onOpenChange={handleClose}>
            <DialogContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col p-6">
                <DialogHeader className="pr-6">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Target className="h-5 w-5 text-blue-500" />
                        Đặt Mục Tiêu GPA
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Tính toán lộ trình tối ưu và số môn học cần nâng điểm để đạt mức GPA mong muốn.
                    </p>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto my-3 space-y-4 pr-1">
                    {/* Nhập GPA mục tiêu */}
                    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-muted/20">
                        <label htmlFor="target-input-field" className="text-sm font-semibold text-foreground">
                            GPA mong muốn của bạn (Hệ 4):
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                id="target-input-field"
                                type="number"
                                min="0"
                                max="4"
                                step="0.05"
                                value={targetInput}
                                onChange={(e) => setTargetInput(e.target.value)}
                                className="flex-grow h-10 px-3 rounded-lg border bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                placeholder="VD: 3.2, 3.6..."
                            />
                        </div>
                    </div>

                    {scores.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            Hãy tải lên tệp bảng điểm trước để sử dụng tính năng này.
                        </div>
                    ) : targetNum <= 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            Hãy nhập mức GPA mục tiêu hợp lệ lớn hơn 0.
                        </div>
                    ) : result ? (
                        <div className="space-y-4">
                            {/* 1. Đã đạt mục tiêu */}
                            {result.alreadyMet && (
                                <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 dark:border-emerald-900/50">
                                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <h4 className="font-bold text-sm">Tuyệt vời! Bạn đã đạt mục tiêu</h4>
                                        <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-400">
                                            GPA hiện tại của bạn đã là <strong>{result.projectedGpa.toFixed(2)}</strong>, đã đạt hoặc vượt mức mục tiêu <strong>{targetNum.toFixed(2)}</strong>. Không cần cải thiện thêm!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 2. Không khả thi */}
                            {!result.isPossible && (
                                <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-500/5 text-rose-800 dark:text-rose-300 dark:border-rose-900/50">
                                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                                    <div>
                                        <h4 className="font-bold text-sm">Mục tiêu không khả thi</h4>
                                        <p className="text-xs mt-1 text-rose-700 dark:text-rose-400">
                                            Ngay cả khi bạn cải thiện toàn bộ các môn học lên điểm <strong>A</strong>, GPA tối đa bạn có thể đạt được cũng chỉ là <strong>{result.maxPossibleGpa.toFixed(2)}</strong>. Hãy thử hạ mục tiêu xuống một chút.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 3. Khả thi và cần cải thiện */}
                            {result.isPossible && !result.alreadyMet && (
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-500/5 text-blue-800 dark:text-blue-300 dark:border-blue-900/50">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse shrink-0" />
                                            <span className="font-bold text-sm text-foreground">
                                                Lộ trình tối ưu cho mục tiêu GPA {targetNum.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-1.5 text-muted-foreground leading-relaxed">
                                            Bạn cần cải thiện tối thiểu <strong>{result.recommendations.length}</strong> môn học. Dự kiến GPA của bạn sau khi cải thiện sẽ đạt <strong>{result.projectedGpa.toFixed(2)}</strong>.
                                        </p>
                                    </div>

                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
                                        Danh sách học phần cần cải thiện:
                                    </h4>

                                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                                        {result.recommendations.map((rec) => (
                                            <div
                                                key={rec.id}
                                                className="p-3 border rounded-xl flex items-center justify-between gap-3 bg-card/40 hover:bg-card/70 transition-all duration-200"
                                            >
                                                <div className="flex-grow min-w-0">
                                                    <h5 className="text-sm font-bold truncate text-foreground">
                                                        {rec.name}
                                                    </h5>
                                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                                        Mã: {rec.id} • {rec.countTC} tín chỉ
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${getBadgeColorClass(rec.fromGrade)}`}>
                                                        {rec.fromGrade}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                    <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${getBadgeColorClass(rec.toGrade)}`}>
                                                        {rec.toGrade}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t">
                    <Button variant="outline" onClick={handleClose}>
                        Đóng
                    </Button>
                    {result && result.isPossible && !result.alreadyMet && result.recommendations.length > 0 && (
                        <Button
                            onClick={handleApplyAll}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <Sparkles className="h-4 w-4" />
                            Áp dụng vào Simulator
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TargetGpaDialog;
