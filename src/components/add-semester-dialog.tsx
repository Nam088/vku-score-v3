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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useScoreStore } from '@/store/useScoreStore';
import { CalendarPlus } from 'lucide-react';

const AddSemesterDialog: React.FC = () => {
    const { dialogs, toggleDialog, addVirtualSemester, scores } = useScoreStore();
    const [semesterName, setSemesterName] = useState<string>('');
    const [numCourses, setNumCourses] = useState<number>(5);
    const [error, setError] = useState<string>('');

    // Gợi ý tên học kỳ tiếp theo dựa trên các học kỳ hiện tại
    const suggestedSemester = useMemo(() => {
        if (scores.length === 0) return 'Học kỳ 1 năm học 2026-2027';
        
        // Trích xuất các năm học đã có
        const years = scores
            .map(s => s.semester || '')
            .map(sem => {
                const match = sem.match(/(\d{4})-(\d{4})/);
                return match ? { start: parseInt(match[1]), end: parseInt(match[2]) } : null;
            })
            .filter(y => y !== null) as { start: number; end: number }[];

        if (years.length === 0) return 'Học kỳ 1 năm học 2026-2027';

        // Lấy năm học lớn nhất
        const maxYear = years.reduce((max, curr) => (curr.start > max.start ? curr : max), years[0]);
        
        // Kiểm tra xem đã có học kỳ 2 chưa
        const hasSem2 = scores.some(s => (s.semester || '').includes('Học kỳ 2') && (s.semester || '').includes(`${maxYear.start}-${maxYear.end}`));
        
        if (hasSem2) {
            // Đề xuất học kỳ 1 của năm học tiếp theo
            return `Học kỳ 1 năm học ${maxYear.start + 1}-${maxYear.end + 1}`;
        } else {
            // Đề xuất học kỳ 2 của năm học hiện tại
            return `Học kỳ 2 năm học ${maxYear.start}-${maxYear.end}`;
        }
    }, [scores]);

    // Đặt tên học kỳ đề xuất khi mở dialog
    React.useEffect(() => {
        if (dialogs.addSemester) {
            setSemesterName(suggestedSemester);
            setNumCourses(5);
            setError('');
        }
    }, [dialogs.addSemester, suggestedSemester]);

    const handleClose = () => {
        toggleDialog('addSemester');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedName = semesterName.trim();
        if (!trimmedName) {
            setError('Vui lòng nhập tên học kỳ');
            return;
        }

        if (numCourses < 1 || numCourses > 12) {
            setError('Số lượng môn học phải từ 1 đến 12');
            return;
        }

        addVirtualSemester(trimmedName, numCourses);
        handleClose();
    };

    return (
        <Dialog open={dialogs.addSemester} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CalendarPlus className="h-5 w-5 text-emerald-500" />
                        Giả Lập Học Kỳ Mới
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {error && (
                        <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="semester-name">Tên học kỳ giả lập</Label>
                        <Input
                            id="semester-name"
                            value={semesterName}
                            onChange={(e) => setSemesterName(e.target.value)}
                            placeholder="Ví dụ: Học kỳ 1 năm học 2026-2027"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            Đặt tên học kỳ ảo để hệ thống gom nhóm điểm độc lập.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="num-courses">Số lượng môn học giả lập</Label>
                        <Input
                            id="num-courses"
                            type="number"
                            min="1"
                            max="12"
                            value={numCourses}
                            onChange={(e) => setNumCourses(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            Mỗi môn học giả lập mặc định có 3 tín chỉ và đạt điểm chữ A.
                        </p>
                    </div>

                    <DialogFooter className="pt-4 flex gap-2 justify-end border-t">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                            Bắt đầu giả lập
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddSemesterDialog;
