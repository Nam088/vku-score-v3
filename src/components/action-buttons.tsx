'use client';
import React from 'react';
import { useScoreStore } from '@/store/useScoreStore';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle, Sparkles, Target, CalendarPlus, Download } from 'lucide-react';
import { exportReportCardPNG } from '@/common/services/export-report-card';

const ActionButtons: React.FC = () => {
    const { scores, toggleDialog } = useScoreStore();

    const handleOpenAdd = () => toggleDialog('addScore');
    const handleOpenTutorial = () => toggleDialog('tutorial');
    const handleOpenRecommend = () => toggleDialog('recommend');
    const handleOpenTarget = () => toggleDialog('targetGpa');
    const handleOpenSemester = () => toggleDialog('addSemester');

    const handleExportReport = () => {
        exportReportCardPNG(scores);
    };

    return (
        <>
            {/* Cụm nút chức năng bên trái */}
            <div className="fixed bottom-6 left-6 flex items-center gap-3 z-40">
                <Button
                    onClick={handleOpenAdd}
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg ring-2 ring-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white hover:scale-110 hover:ring-4 active:scale-95 transition-all duration-200"
                    title="Thêm học phần"
                >
                    <Plus className="h-5 w-5" />
                </Button>

                <Button
                    onClick={handleOpenTutorial}
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 rounded-full shadow-md bg-background hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
                    title="Xem hướng dẫn"
                >
                    <HelpCircle className="h-5 w-5" />
                </Button>
            </div>

            {/* Cụm nút gợi ý bên phải */}
            {scores.length > 0 && (
                <div className="fixed bottom-6 right-6 flex items-center justify-end gap-2 md:gap-3 z-40">
                    <Button
                        onClick={handleExportReport}
                        className="size-10 md:size-auto md:h-11 md:px-4 rounded-full shadow-lg ring-2 ring-slate-500/20 bg-slate-700 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 hover:scale-105 hover:ring-4 active:scale-95 transition-all duration-200 group"
                        title="Xuất báo cáo"
                    >
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                        <span className="hidden md:inline">Xuất báo cáo</span>
                    </Button>

                    <Button
                        onClick={handleOpenSemester}
                        className="size-10 md:size-auto md:h-11 md:px-4 rounded-full shadow-lg ring-2 ring-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 hover:scale-105 hover:ring-4 active:scale-95 transition-all duration-200 group"
                        title="Giả lập học kỳ"
                    >
                        <CalendarPlus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="hidden md:inline">Giả lập học kỳ</span>
                    </Button>

                    <Button
                        onClick={handleOpenTarget}
                        className="size-10 md:size-auto md:h-11 md:px-4 rounded-full shadow-lg ring-2 ring-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 hover:scale-105 hover:ring-4 active:scale-95 transition-all duration-200 group"
                        title="Mục tiêu GPA"
                    >
                        <Target className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="hidden md:inline">Mục tiêu GPA</span>
                    </Button>

                    <Button
                        onClick={handleOpenRecommend}
                        className="size-10 md:size-auto md:h-11 md:px-4 rounded-full shadow-lg ring-2 ring-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 hover:scale-105 hover:ring-4 active:scale-95 transition-all duration-200 group"
                        title="Gợi ý cải thiện"
                    >
                        <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="hidden md:inline">Gợi ý cải thiện</span>
                    </Button>
                </div>
            )}
        </>
    );
};

export default ActionButtons;
