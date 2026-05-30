'use client';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    useReactTable,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useScoreStore } from '@/store/useScoreStore';
import { RotateCcw, Search, Trash, ChevronDown, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { IScore, ScoreCh } from '@/common/interfaces/score';
import DebouncedInput from './debounced-input';
import { cn } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/custom-select';

interface IScoreWithAction extends IScore {
    action?: string;
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

const columnHelper = createColumnHelper<IScoreWithAction>();

const columnStyleMap: { [key: string]: string } = {
    id: 'w-[60px] min-w-[60px] text-center',
    name: 'whitespace-normal text-left min-w-[200px] max-w-[450px]',
    countTC: 'w-[80px] min-w-[80px] text-center',
    countLH: 'w-[85px] min-w-[85px] text-center',
    scoreCC: 'w-[85px] min-w-[85px] text-center',
    scoreBT: 'w-[85px] min-w-[85px] text-center',
    scoreGK: 'w-[85px] min-w-[85px] text-center',
    scoreCK: 'w-[85px] min-w-[85px] text-center',
    scoreT10: 'w-[100px] min-w-[100px] text-center',
    scoreCh: 'w-[90px] min-w-[90px] text-center',
    scoreChChange: 'w-[110px] min-w-[110px] text-center',
    action: 'w-[100px] min-w-[100px] text-center',
};

const ScoreTable: React.FC = () => {
    const {
        scores,
        toggleUploadFile,
        setToggleUploadFile,
        deleteScore,
        changeScoreCh,
        changeScoreT10,
        resetScores,
    } = useScoreStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [isShowExtraColumn, setIsShowExtraColumn] = useState(true);
    const [collapsedSemesters, setCollapsedSemesters] = useState<Set<string>>(new Set());

    const toggleSemester = useCallback((semester: string) => {
        setCollapsedSemesters(prev => {
            const next = new Set(prev);
            if (next.has(semester)) next.delete(semester);
            else next.add(semester);
            return next;
        });
    }, []);

    const collapseAll = useCallback(() => {
        setCollapsedSemesters(new Set(Object.keys(groupedRowModel)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const expandAll = useCallback(() => {
        setCollapsedSemesters(new Set());
    }, []);

    const handleScoreChange = useCallback((row: IScore, newValue: ScoreCh | null) => {
        changeScoreCh(row, newValue);
    }, [changeScoreCh]);

    const handleDiem10Change = useCallback((row: IScore, newValue: number) => {
        changeScoreT10(row, newValue);
    }, [changeScoreT10]);

    const handleRemove = useCallback((id: number) => {
        deleteScore(id);
    }, [deleteScore]);

    // Lọc và sắp xếp scores
    const sortedScores = useMemo(() => {
        if (!searchQuery) return scores;

        const query = searchQuery.toLowerCase();
        const fieldsToCheck: (keyof IScore)[] = [
            'name', 'countTC', 'countLH', 'scoreCC', 'scoreBT', 'scoreGK', 'scoreCK', 'scoreT10', 'scoreCh'
        ];

        return scores.filter(score =>
            fieldsToCheck.some(field => score[field]?.toString().toLowerCase().includes(query))
        );
    }, [scores, searchQuery]);

    const columns = useMemo<ColumnDef<IScoreWithAction, any>[]>(
        () => [
            columnHelper.accessor('id', {
                header: 'ID',
                cell: (info) => <span className="font-semibold">{info.row.original.id}</span>,
            }),
            columnHelper.accessor('name', {
                header: 'Tên học phần',
                cell: (info) => <div className="font-medium text-left line-clamp-2 break-words">{info.row.original.name}</div>,
            }),
            columnHelper.accessor('countTC', {
                header: 'Tín chỉ',
            }),
            ...(isShowExtraColumn ? [
                columnHelper.accessor('countLH', {
                    header: 'Lần học',
                }),
                columnHelper.accessor('scoreCC', {
                    header: 'Chuyên cần',
                }),
                columnHelper.accessor('scoreBT', {
                    header: 'Bài tập',
                }),
                columnHelper.accessor('scoreGK', {
                    header: 'Giữa kỳ',
                }),
                columnHelper.accessor('scoreCK', {
                    header: 'Cuối kỳ',
                }),
            ] : []),
            columnHelper.accessor('scoreT10', {
                header: 'Điểm hệ 10',
                cell: (info) => (
                    <div className="flex justify-center">
                        <DebouncedInput
                            value={info.row.original.scoreT10?.toString() || ''}
                            onChange={(value) => handleDiem10Change(info.row.original, Number(value))}
                            debounce={500}
                            className="w-16 h-8 text-center p-1 border rounded"
                        />
                    </div>
                ),
            }),
            columnHelper.accessor('scoreCh', {
                header: 'Điểm chữ',
                cell: (info) => (
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${getBadgeColorClass(info.row.original.scoreCh)}`}>
                        {info.row.original.scoreCh || ''}
                    </span>
                ),
            }),
            columnHelper.accessor('scoreChChange', {
                header: 'Thay đổi',
                cell: (info) => {
                    const originalScoreCh = info.row.original.scoreCh || 'F';
                    const currentValue = info.row.original.scoreChChange || originalScoreCh;
                    const options = scoreOptionsMap[originalScoreCh] || ['A', 'B', 'C', 'D', 'F'];

                    return (
                            <CustomSelect
                                disabled={originalScoreCh === 'A'}
                                value={currentValue}
                                onChange={(val) => handleScoreChange(info.row.original, val)}
                                options={options}
                            />

                    );
                },
            }),
            columnHelper.accessor('action', {
                header: 'Hành động',
                cell: (info) => (
                    <div className="flex justify-center items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(info.row.original.id)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            title="Xóa môn"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                        {(info.row.original.scoreChChange || info.row.original.scoreT10Original != null) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleScoreChange(info.row.original, null)}
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                title="Hủy thay đổi"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ),
            }),
        ],
        [isShowExtraColumn, handleDiem10Change, handleScoreChange, handleRemove]
    );

    const table = useReactTable({
        data: sortedScores,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 100,
            },
        },
    });

    // Gom nhóm các dòng theo học kỳ (Đã tối ưu O(N))
    const groupedRowModel = useMemo(() => {
        const rows = table.getRowModel().rows;
        return rows.reduce((acc: { [key: string]: typeof rows }, row) => {
            const semester = row.original.semester || 'Không rõ';
            if (!acc[semester]) {
                acc[semester] = [];
            }
            acc[semester].push(row);
            return acc;
        }, {});
    }, [table.getRowModel().rows]);

    const getRowBgColor = (row: IScore) => {
        const isT10Edited = row.scoreT10Original != null;
        const isChEdited = row.scoreChChange != null && row.scoreCh !== row.scoreChChange;
        if (isT10Edited || isChEdited) {
            return 'border-l-4 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/8 hover:bg-emerald-500/10';
        }
        return 'border-l-4 border-l-transparent hover:bg-muted/40';
    };
    const renderMobileCard = (row: Row<IScore>) => {
        const item = row.original;
        const originalScoreCh = item.scoreCh || 'F';
        const currentValue = item.scoreChChange || originalScoreCh;
        const options = scoreOptionsMap[originalScoreCh] || ['A', 'B', 'C', 'D', 'F'];

        return (
            <div 
                key={item.id} 
                className={cn(
                    "p-4 rounded-xl border flex flex-col gap-3 transition-all duration-200 text-left bg-card/40", 
                    getRowBgColor(item)
                )}
            >
                {/* Header: ID & Credits */}
                <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded font-bold">
                        ID: {item.id}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                        {item.countTC} tín chỉ
                    </span>
                </div>
                
                {/* Course Name */}
                <h4 className="text-sm font-bold text-foreground leading-snug">
                    {item.name}
                </h4>

                {/* Extra columns (CC, BT, GK, CK) if enabled */}
                {isShowExtraColumn && (
                    <div className="grid grid-cols-5 gap-1 text-center bg-muted/30 p-2 rounded-lg text-xs mt-0.5">
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Lần học</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{item.countLH ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">C.Cần</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{item.scoreCC ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Bài tập</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{item.scoreBT ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Giữa kỳ</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{item.scoreGK ?? '-'}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground font-bold">Cuối kỳ</div>
                            <div className="font-bold mt-0.5 text-foreground/80">{item.scoreCK ?? '-'}</div>
                        </div>
                    </div>
                )}

                {/* Inputs and actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1 pt-3 border-t border-dashed border-border/80">
                    <div className="flex items-center gap-3">
                        {/* Điểm hệ 10 */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">Hệ 10</span>
                            <DebouncedInput
                                value={item.scoreT10?.toString() || ''}
                                onChange={(value) => handleDiem10Change(item, Number(value))}
                                debounce={500}
                                className="w-14 h-8 text-center p-1 text-xs border rounded bg-background font-semibold"
                            />
                        </div>

                        {/* Điểm gốc */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">Gốc</span>
                            <span className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-xs font-bold ring-1 ring-inset ${getBadgeColorClass(item.scoreCh)}`}>
                                {item.scoreCh || ''}
                            </span>
                        </div>

                        {/* Điểm chữ thay đổi */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">Thay đổi</span>
                            <CustomSelect
                                disabled={originalScoreCh === 'A'}
                                value={currentValue}
                                onChange={(val) => handleScoreChange(item, val)}
                                options={options}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 self-end">
                        {(item.scoreChChange || item.scoreT10Original != null) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScoreChange(item, null)}
                                className="h-8 px-2 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 border-blue-200 dark:border-blue-800 gap-1 font-bold"
                                title="Hủy thay đổi"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Hủy
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            title="Xóa môn"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="w-full shadow-md bg-card/60 backdrop-blur-sm border">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-xl font-bold">Bảng Điểm Học Tập</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    {/* Collapse / Expand all — chỉ hiện khi không search */}
                    {!searchQuery && Object.keys(groupedRowModel).length > 0 && (
                        <div className="flex items-center gap-1 border-r pr-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={expandAll}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                title="Mở rộng tất cả học kỳ"
                            >
                                <ChevronsUpDown className="h-3.5 w-3.5" />
                                Mở tất cả
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={collapseAll}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                title="Thu gọn tất cả học kỳ"
                            >
                                <ChevronsDownUp className="h-3.5 w-3.5" />
                                Thu tất cả
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="toggle-upload"
                            checked={toggleUploadFile}
                            onCheckedChange={(checked) => setToggleUploadFile(!!checked)}
                        />
                        <Label htmlFor="toggle-upload" className="cursor-pointer">Form tải lên</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="toggle-extra"
                            checked={isShowExtraColumn}
                            onCheckedChange={(checked) => setIsShowExtraColumn(!!checked)}
                        />
                        <Label htmlFor="toggle-extra" className="cursor-pointer">Cột bổ sung</Label>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={resetScores}
                        className="h-8 text-xs font-semibold"
                    >
                        Xóa toàn bộ
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-end w-full max-w-sm ml-auto border rounded-lg px-2 bg-background focus-within:ring-1 focus-within:ring-ring">
                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                    <DebouncedInput
                        value={searchQuery}
                        onChange={(value) => setSearchQuery(value as string)}
                        placeholder="Tìm kiếm môn học..."
                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-1 text-sm bg-transparent w-full"
                    />
                </div>

                <div className="rounded-xl border bg-background/50 overflow-hidden">
                    {Object.keys(groupedRowModel).length > 0 ? (
                        Object.keys(groupedRowModel).map((semester) => {
                            const isCollapsed = searchQuery ? false : collapsedSemesters.has(semester);
                            const rows = groupedRowModel[semester];
                            const changedCount = rows.filter(r =>
                                (r.original.scoreCh !== r.original.scoreChChange && r.original.scoreChChange != null)
                                || r.original.scoreT10Original != null
                            ).length;

                            return (
                                <div key={semester} className="last:mb-0">
                                    {/* Semester header — clickable */}
                                    <button
                                        type="button"
                                        onClick={() => toggleSemester(semester)}
                                        className="w-full bg-muted/40 hover:bg-muted/70 transition-colors px-4 py-2.5 border-b font-semibold text-sm tracking-wide text-muted-foreground flex justify-between items-center group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                                                    isCollapsed ? '-rotate-90' : 'rotate-0'
                                                )}
                                            />
                                            <span>{semester}</span>
                                            {changedCount > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                    {changedCount} đã sửa
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded-full font-semibold text-foreground/70">
                                            {rows.length} môn
                                        </span>
                                    </button>

                                    {/* Collapsible content */}
                                    <div className={cn(
                                        'overflow-hidden transition-all duration-300 ease-in-out',
                                        isCollapsed ? 'max-h-0' : 'max-h-[9999px]'
                                    )}>
                                        {/* Desktop View */}
                                        <div className="hidden md:block">
                                            <Table>
                                                <TableHeader>
                                                    {table.getHeaderGroups().map((headerGroup) => (
                                                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                                            {headerGroup.headers.map((header) => {
                                                                const styleClass = columnStyleMap[header.column.id] || '';
                                                                return (
                                                                    <TableHead key={header.id} className={cn('font-bold h-9', styleClass)}>
                                                                        {header.isPlaceholder
                                                                            ? null
                                                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                                                    </TableHead>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableHeader>
                                                <TableBody>
                                                    {rows.map((row) => (
                                                        <TableRow key={row.id} className={`text-center ${getRowBgColor(row.original)}`}>
                                                            {row.getVisibleCells().map((cell) => {
                                                                const styleClass = columnStyleMap[cell.column.id] || '';
                                                                return (
                                                                    <TableCell key={cell.id} className={cn('p-2 align-middle', styleClass)}>
                                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="block md:hidden space-y-3 p-3 bg-muted/10 rounded-b-lg border-t">
                                            {rows.map((row) => renderMobileCard(row))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-24 flex items-center justify-center text-center text-muted-foreground text-sm">
                            Không tìm thấy môn học.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ScoreTable;
