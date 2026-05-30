'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useScoreStore } from '@/store/useScoreStore';
import { IScore, ScoreCh } from '@/common/interfaces/score';
import { Sparkles, Loader2, Search, RotateCcw } from 'lucide-react';
import DebouncedInput from './debounced-input';
import { CustomSelect } from '@/components/ui/custom-select';
import { cn } from '@/lib/utils';
import { getRecommendationsLocal } from '@/common/services/recommend.service';

interface IScoreWithAction extends IScore {
    difference: number;
    scorePredict: number;
}

const getBadgeColorClass = (scoreCh: ScoreCh | null | undefined) => {
    if (!scoreCh) return 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300';
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
            return 'bg-slate-100 text-slate-800';
    }
};

const scoreOptionsMap: { [key in Exclude<ScoreCh, null>]: ScoreCh[] } = {
    'F': ['A', 'B', 'C', 'D', 'F'],
    'D': ['A', 'B', 'C', 'D'],
    'C': ['A', 'B', 'C'],
    'B': ['A', 'B'],
    'A': ['A'],
};

const RecommendDialog: React.FC = () => {
    const { dialogs, toggleDialog, scores, changeScoreCh } = useScoreStore();
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<IScoreWithAction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isShowExtraColumn, setIsShowExtraColumn] = useState(false);

    // Lấy đề xuất từ API, tự động fallback tính client-side nếu API không hoạt động (ví dụ GitHub Pages)
    const fetchRecommendations = async () => {
        if (scores.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch('/vku-score-v3/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ scores }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.recommendations) {
                    setRecommendations(data.recommendations);
                    return;
                }
            }
            // Nếu API trả về lỗi (như 404 trên GitHub Pages), fallback tính local
            console.warn('API recommend failed. Falling back to local calculations.');
            const localData = getRecommendationsLocal(scores);
            setRecommendations(localData);
        } catch (error) {
            console.warn('Failed to call API recommend, using local calculation fallback:', error);
            const localData = getRecommendationsLocal(scores);
            setRecommendations(localData);
        } finally {
            setLoading(false);
        }
    };

    const scoresHash = useMemo(() => {
        return scores.map(s => `${s.id}-${s.scoreCh}-${s.scoreChChange || ''}`).join(',');
    }, [scores]);

    // Gọi API mỗi khi mở dialog hoặc thay đổi scores
    useEffect(() => {
        if (dialogs.recommend) {
            fetchRecommendations();
        }
    }, [dialogs.recommend, scoresHash]);

    const handleClose = () => {
        toggleDialog('recommend');
    };

    const handleScoreChange = useCallback((row: IScore, newValue: ScoreCh) => {
        changeScoreCh(row, newValue);
    }, [changeScoreCh]);

    const filteredScores = useMemo(() => {
        if (!searchQuery) return recommendations;
        const query = searchQuery.toLowerCase();
        return recommendations.filter((score) =>
            score.name.toLowerCase().includes(query) ||
            score.scoreCh?.toLowerCase().includes(query)
        );
    }, [recommendations, searchQuery]);

    const getRowBgColor = (row: IScore) => {
        const isT10Edited = row.scoreT10Original != null;
        const isChEdited = row.scoreChChange != null && row.scoreCh !== row.scoreChChange;
        if (isT10Edited || isChEdited) {
            return 'border-l-4 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/8 hover:bg-emerald-500/10';
        }
        return 'border-l-4 border-l-transparent hover:bg-muted/40';
    };

    const renderMobileCard = (row: IScoreWithAction) => {
        const originalScoreCh = row.scoreCh || 'F';
        const currentValue = row.scoreChChange || originalScoreCh;
        const options = scoreOptionsMap[originalScoreCh] || ['A', 'B', 'C', 'D', 'F'];

        return (
            <div 
                key={row.id} 
                className={cn(
                    "p-4 rounded-xl border flex flex-col gap-3 transition-all duration-200 text-left bg-card/40", 
                    getRowBgColor(row)
                )}
            >
                {/* Header: ID & Credits */}
                <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded font-bold">
                        ID: {row.id}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                        {row.countTC} tín chỉ
                    </span>
                </div>
                
                {/* Course Name */}
                <h4 className="text-sm font-bold text-foreground leading-snug">
                    {row.name}
                </h4>

                {/* Extra columns (CC, BT, GK, CK, countLH) if enabled */}
                {isShowExtraColumn && (
                    <div className="grid grid-cols-5 gap-1 text-center bg-muted/30 p-2 rounded-lg text-xs mt-0.5">
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Lần học</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{row.countLH ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">C.Cần</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{row.scoreCC ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Bài tập</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{row.scoreBT ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Giữa kỳ</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{row.scoreGK ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Cuối kỳ</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{row.scoreCK ?? '-'}</div>
                        </div>
                    </div>
                )}

                {/* Inputs and actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1 pt-3 border-t border-dashed border-border/80">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Điểm hệ 10 */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">Hệ 10</span>
                            <span className="font-semibold text-xs h-8 flex items-center justify-center bg-background border px-2.5 rounded-md">
                                {row.scoreT10 ?? '-'}
                            </span>
                        </div>

                        {/* Điểm chữ gốc */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">Gốc</span>
                            <span className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-xs font-bold ring-1 ring-inset ${getBadgeColorClass(row.scoreCh)}`}>
                                {row.scoreCh || ''}
                            </span>
                        </div>

                        {/* Thay đổi */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">Thay đổi</span>
                            <CustomSelect
                                disabled={originalScoreCh === 'A'}
                                value={currentValue}
                                onChange={(val) => handleScoreChange(row, val as ScoreCh)}
                                options={options}
                            />
                        </div>

                        {/* Dự đoán mới */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider font-bold">Dự đoán mới</span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 h-8 flex items-center justify-center px-1">
                                {row.scorePredict.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 self-end">
                        {(row.scoreChChange || row.scoreT10Original != null) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeScoreCh(row, null)}
                                className="h-8 px-2 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 border-blue-200 dark:border-blue-800 gap-1 font-bold"
                                title="Hủy thay đổi"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Hủy
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={dialogs.recommend} onOpenChange={handleClose}>
            <DialogContent className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pr-6">
                    <div>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                            Gợi ý cải thiện học phần
                            {loading && recommendations.length > 0 && (
                                <Loader2 className="h-4 w-4 text-indigo-500 animate-spin ml-1" />
                            )}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Các môn học có tiềm năng tăng điểm GPA của bạn cao nhất khi học cải thiện.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <Checkbox
                            id="toggle-extra-rec"
                            checked={isShowExtraColumn}
                            onCheckedChange={(checked) => setIsShowExtraColumn(!!checked)}
                        />
                        <Label htmlFor="toggle-extra-rec" className="cursor-pointer select-none">
                            Cột bổ sung
                        </Label>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex items-center justify-end w-full max-w-xs ml-auto border rounded-lg px-2 bg-background focus-within:ring-1 focus-within:ring-ring">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <DebouncedInput
                            value={searchQuery}
                            onChange={(value) => setSearchQuery(value as string)}
                            placeholder="Tìm môn đề xuất..."
                            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-1 text-sm bg-transparent w-full"
                        />
                    </div>

                    <div className="rounded-xl border bg-background/50 overflow-hidden">
                        {loading && recommendations.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                <span className="text-sm text-muted-foreground">Đang tính toán đề xuất điểm...</span>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px] min-w-[50px] text-center font-bold">ID</TableHead>
                                                <TableHead className="whitespace-normal text-left min-w-[200px] max-w-[350px] font-bold">Tên học phần</TableHead>
                                                <TableHead className="w-[80px] min-w-[80px] text-center font-bold">Số tín chỉ</TableHead>
                                                {isShowExtraColumn && (
                                                    <>
                                                        <TableHead className="w-[85px] min-w-[85px] text-center font-bold">Lần học</TableHead>
                                                        <TableHead className="w-[85px] min-w-[85px] text-center font-bold">Chuyên cần</TableHead>
                                                        <TableHead className="w-[85px] min-w-[85px] text-center font-bold">Bài tập</TableHead>
                                                        <TableHead className="w-[85px] min-w-[85px] text-center font-bold">Giữa kỳ</TableHead>
                                                        <TableHead className="w-[85px] min-w-[85px] text-center font-bold">Cuối kỳ</TableHead>
                                                    </>
                                                )}
                                                <TableHead className="w-[100px] min-w-[100px] text-center font-bold">Điểm hệ 10</TableHead>
                                                <TableHead className="w-[90px] min-w-[90px] text-center font-bold">Điểm chữ</TableHead>
                                                <TableHead className="w-[110px] min-w-[110px] text-center font-bold">Thay đổi</TableHead>
                                                <TableHead className="w-[100px] min-w-[100px] text-center font-bold">Dự đoán mới</TableHead>
                                                <TableHead className="w-[90px] min-w-[90px] text-center font-bold">Hành động</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredScores.length > 0 ? (
                                                filteredScores.map((row) => {
                                                    const originalScoreCh = row.scoreCh || 'F';
                                                    const currentValue = row.scoreChChange || originalScoreCh;
                                                    const options = scoreOptionsMap[originalScoreCh] || ['A', 'B', 'C', 'D', 'F'];

                                                    return (
                                                        <TableRow key={row.id} className={`text-center ${getRowBgColor(row)}`}>
                                                            <TableCell className="w-[50px] min-w-[50px] text-center p-2 align-middle font-semibold">
                                                                {row.id}
                                                            </TableCell>
                                                            <TableCell className="whitespace-normal text-left min-w-[200px] max-w-[350px] p-2 align-middle font-medium">
                                                                <div className="line-clamp-2 break-words text-left">
                                                                    {row.name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="w-[80px] min-w-[80px] text-center p-2 align-middle">
                                                                {row.countTC}
                                                            </TableCell>
                                                            {isShowExtraColumn && (
                                                                <>
                                                                    <TableCell className="w-[85px] min-w-[85px] text-center p-2 align-middle">{row.countLH}</TableCell>
                                                                    <TableCell className="w-[85px] min-w-[85px] text-center p-2 align-middle">{row.scoreCC}</TableCell>
                                                                    <TableCell className="w-[85px] min-w-[85px] text-center p-2 align-middle">{row.scoreBT}</TableCell>
                                                                    <TableCell className="w-[85px] min-w-[85px] text-center p-2 align-middle">{row.scoreGK}</TableCell>
                                                                    <TableCell className="w-[85px] min-w-[85px] text-center p-2 align-middle">{row.scoreCK}</TableCell>
                                                                </>
                                                            )}
                                                            <TableCell className="w-[100px] min-w-[100px] text-center p-2 align-middle">
                                                                {row.scoreT10}
                                                            </TableCell>
                                                            <TableCell className="w-[90px] min-w-[90px] text-center p-2 align-middle">
                                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${getBadgeColorClass(row.scoreCh)}`}>
                                                                    {row.scoreCh || ''}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="w-[110px] min-w-[110px] text-center p-2 align-middle">
                                                                 <CustomSelect
                                                                     disabled={originalScoreCh === 'A'}
                                                                     value={currentValue}
                                                                     onChange={(val) => handleScoreChange(row, val as ScoreCh)}
                                                                     options={options}
                                                                 />
                                                            </TableCell>
                                                            <TableCell className="w-[100px] min-w-[100px] text-center p-2 align-middle font-bold text-indigo-600 dark:text-indigo-400">
                                                                {row.scorePredict.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell className="w-[90px] min-w-[90px] text-center p-2 align-middle">
                                                                {(row.scoreChChange || row.scoreT10Original != null) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => changeScoreCh(row, null)}
                                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
                                                                        title="Hủy thay đổi"
                                                                    >
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={isShowExtraColumn ? 13 : 8} className="h-24 text-center text-muted-foreground">
                                                        {scores.length === 0 ? 'Hãy tải tệp điểm lên trước.' : 'Không có gợi ý cải thiện (tất cả môn học đã tối ưu).'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile View */}
                                <div className="block md:hidden space-y-3 p-3 bg-muted/10 border-t">
                                    {filteredScores.length > 0 ? (
                                        filteredScores.map((row) => renderMobileCard(row))
                                    ) : (
                                        <div className="h-24 flex items-center justify-center text-center text-muted-foreground text-sm">
                                            {scores.length === 0 ? 'Hãy tải tệp điểm lên trước.' : 'Không có gợi ý cải thiện.'}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter className="pt-4 flex justify-end">
                    <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RecommendDialog;
