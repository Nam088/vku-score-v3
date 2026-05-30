'use client';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useScoreStore } from '@/store/useScoreStore';
import { IScore } from '@/common/interfaces/score';

const schema = z.object({
    name: z.string().min(3, 'Tên học phần phải có ít nhất 3 ký tự'),
    countTC: z.number({ message: 'Số tín chỉ phải là số' }).min(1, 'Số tín chỉ phải lớn hơn 0'),
    countLH: z.number().nullable().optional(),
    scoreCC: z.number().nullable().optional(),
    scoreBT: z.number().nullable().optional(),
    scoreGK: z.number().nullable().optional(),
    scoreCK: z.number().nullable().optional(),
    scoreT10: z.number({ message: 'Điểm hệ 10 phải là số' }).min(0, 'Điểm hệ 10 phải từ 0 đến 10').max(10, 'Điểm hệ 10 phải từ 0 đến 10'),
    scoreCh: z.enum(['A', 'B', 'C', 'D', 'F'], { message: 'Điểm chữ không hợp lệ' }).nullable(),
    scoreChChange: z.string().nullable().optional(),
    semester: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

const getAllSemester = (scores: IScore[]): string[] => {
    const semesters: string[] = [];
    scores.forEach((score) => {
        if (score.semester && !semesters.includes(score.semester)) {
            semesters.push(score.semester);
        }
    });
    return semesters;
};

const AddScoreDialog: React.FC = () => {
    const dialogs = useScoreStore((state) => state.dialogs);
    const toggleDialog = useScoreStore((state) => state.toggleDialog);
    const addScore = useScoreStore((state) => state.addScore);
    const scores = useScoreStore((state) => state.scores);

    const [isShowExtra, setIsShowExtra] = useState(false);
    const [semesters, setSemesters] = useState<string[]>(getAllSemester(scores));

    useEffect(() => {
        setSemesters(getAllSemester(scores));
    }, [scores]);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            countTC: undefined,
            countLH: null,
            scoreCC: null,
            scoreBT: null,
            scoreGK: null,
            scoreCK: null,
            scoreT10: undefined,
            scoreCh: null,
            scoreChChange: null,
            semester: '',
        },
    });

    const handleClose = () => {
        reset();
        toggleDialog('addScore');
    };

    const onSubmit = (data: FormValues) => {
        const fullScore: IScore = {
            id: 0,
            value: data.name,
            name: data.name,
            countTC: data.countTC,
            countLH: data.countLH,
            scoreCC: data.scoreCC,
            scoreBT: data.scoreBT,
            scoreGK: data.scoreGK,
            scoreCK: data.scoreCK,
            scoreT10: data.scoreT10,
            scoreCh: data.scoreCh,
            scoreChChange: null,
            semester: data.semester || 'Học kỳ khác',
        };
        addScore(fullScore);
        handleClose();
    };

    return (
        <Dialog open={dialogs.addScore} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <div className="flex justify-between items-center pr-6">
                        <DialogTitle className="text-lg font-bold">Thêm học phần</DialogTitle>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="show-extra"
                                checked={isShowExtra}
                                onCheckedChange={(checked) => setIsShowExtra(!!checked)}
                            />
                            <Label htmlFor="show-extra" className="text-xs cursor-pointer select-none">
                                Thêm chi tiết
                            </Label>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="name">Tên học phần</Label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="name"
                                    placeholder="Ví dụ: Triết học Mác - Lênin"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                            )}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="countTC">Số tín chỉ</Label>
                        <Controller
                            name="countTC"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="countTC"
                                    type="number"
                                    placeholder="Ví dụ: 3"
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                    className={errors.countTC ? 'border-destructive' : ''}
                                />
                            )}
                        />
                        {errors.countTC && (
                            <p className="text-xs text-destructive">{errors.countTC.message}</p>
                        )}
                    </div>

                    {isShowExtra && (
                        <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-muted/20">
                            <div className="space-y-1">
                                <Label htmlFor="countLH">Số lần học</Label>
                                <Controller
                                    name="countLH"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="countLH"
                                            type="number"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="scoreCC">Điểm chuyên cần</Label>
                                <Controller
                                    name="scoreCC"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="scoreCC"
                                            type="number"
                                            step="0.1"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="scoreBT">Điểm bài tập</Label>
                                <Controller
                                    name="scoreBT"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="scoreBT"
                                            type="number"
                                            step="0.1"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="scoreGK">Điểm giữa kỳ</Label>
                                <Controller
                                    name="scoreGK"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="scoreGK"
                                            type="number"
                                            step="0.1"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label htmlFor="scoreCK">Điểm cuối kỳ</Label>
                                <Controller
                                    name="scoreCK"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="scoreCK"
                                            type="number"
                                            step="0.1"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="scoreT10">Điểm hệ 10</Label>
                        <Controller
                            name="scoreT10"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="scoreT10"
                                    type="number"
                                    step="0.1"
                                    placeholder="Ví dụ: 8.5"
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                    className={errors.scoreT10 ? 'border-destructive' : ''}
                                />
                            )}
                        />
                        {errors.scoreT10 && (
                            <p className="text-xs text-destructive">{errors.scoreT10.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="scoreCh">Điểm chữ</Label>
                        <Controller
                            name="scoreCh"
                            control={control}
                            render={({ field }) => (
                                <select
                                    id="scoreCh"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value || null)}
                                    className={`w-full border rounded-md h-9 px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring ${
                                        errors.scoreCh ? 'border-destructive' : ''
                                    }`}
                                >
                                    <option value="">Chọn điểm chữ...</option>
                                    {['A', 'B', 'C', 'D', 'F'].map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        {errors.scoreCh && (
                            <p className="text-xs text-destructive">{errors.scoreCh.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="semester">Học kỳ</Label>
                        <Controller
                            name="semester"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <Input
                                        {...field}
                                        id="semester"
                                        list="semesters-list"
                                        placeholder="Chọn hoặc nhập học kỳ, ví dụ: Học kỳ 1 năm học 2023-2024"
                                        value={field.value || ''}
                                    />
                                    <datalist id="semesters-list">
                                        {semesters.map((sem) => (
                                            <option key={sem} value={sem} />
                                        ))}
                                    </datalist>
                                </div>
                            )}
                        />
                    </div>

                    <DialogFooter className="pt-4 flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Thêm môn
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddScoreDialog;
