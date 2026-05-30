'use client';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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
import { Trash2, RotateCcw, Search, Trash } from 'lucide-react';
import { IScore, ScoreCh } from '@/common/interfaces/score';
import DebouncedInput from './debounced-input';
import { cn } from '@/lib/utils';

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

        return [...scores].sort((a, b) => {
            const aMatches = fieldsToCheck.some(field => a[field]?.toString().toLowerCase().includes(query));
            const bMatches = fieldsToCheck.some(field => b[field]?.toString().toLowerCase().includes(query));

            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;
            return 0;
        });
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
                        <div className="flex justify-center">
                            <select
                                disabled={originalScoreCh === 'A'}
                                value={currentValue}
                                onChange={(e) => handleScoreChange(info.row.original, e.target.value as ScoreCh)}
                                className="h-8 w-20 border rounded px-1 text-xs bg-background focus:ring-1 focus:ring-ring"
                            >
                                {options.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                        {(info.row.original.scoreChChange || info.row.original.scoreT10Original !== undefined) && (
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
        if ((row.scoreCh !== row.scoreChChange && row.scoreChChange !== null) || row.scoreT10Original !== undefined) {
            return 'border-l-4 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/8 hover:bg-emerald-500/10';
        }
        return 'border-l-4 border-l-transparent hover:bg-muted/40';
    };

    return (
        <Card className="w-full shadow-md bg-card/60 backdrop-blur-sm border">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-xl font-bold">Bảng Điểm Học Tập</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm">
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
                    {searchQuery ? (
                        // Hiển thị một bảng duy nhất khi tìm kiếm
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            const styleClass = columnStyleMap[header.column.id] || '';
                                            return (
                                                <TableHead key={header.id} className={cn("font-bold", styleClass)}>
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
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className={`text-center ${getRowBgColor(row.original)}`}>
                                            {row.getVisibleCells().map((cell) => {
                                                const styleClass = columnStyleMap[cell.column.id] || '';
                                                return (
                                                    <TableCell key={cell.id} className={cn("p-2 align-middle", styleClass)}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                            Không tìm thấy môn học.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        // Hiển thị các bảng gom nhóm theo học kỳ (Đã tối ưu O(N) hoàn toàn)
                        Object.keys(groupedRowModel).map((semester) => (
                            <div key={semester} className="mb-6 last:mb-0">
                                <div className="bg-muted/50 px-4 py-2 border-b font-bold text-sm tracking-wider text-muted-foreground flex justify-between items-center">
                                    <span>{semester}</span>
                                    <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded-full font-semibold text-foreground/75">
                                        {groupedRowModel[semester].length} môn
                                    </span>
                                </div>
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                                {headerGroup.headers.map((header) => {
                                                    const styleClass = columnStyleMap[header.column.id] || '';
                                                    return (
                                                        <TableHead key={header.id} className={cn("font-bold h-9", styleClass)}>
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
                                        {groupedRowModel[semester].map((row) => (
                                            <TableRow key={row.id} className={`text-center ${getRowBgColor(row.original)}`}>
                                                {row.getVisibleCells().map((cell) => {
                                                    const styleClass = columnStyleMap[cell.column.id] || '';
                                                    return (
                                                        <TableCell key={cell.id} className={cn("p-2 align-middle", styleClass)}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ScoreTable;
