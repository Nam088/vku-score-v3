'use client';
import React from 'react';
import { useScoreStore } from '@/store/useScoreStore';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle, Sparkles } from 'lucide-react';

const ActionButtons: React.FC = () => {
    const { scores, toggleDialog } = useScoreStore();

    const handleOpenAdd = () => toggleDialog('addScore');
    const handleOpenTutorial = () => toggleDialog('tutorial');
    const handleOpenRecommend = () => toggleDialog('recommend');

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
                <div className="fixed bottom-6 right-6 z-40">
                    <Button
                        onClick={handleOpenRecommend}
                        className="h-12 px-5 rounded-full shadow-lg ring-2 ring-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 hover:scale-105 hover:ring-4 active:scale-95 transition-all duration-200 group"
                    >
                        <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                        Gợi ý cải thiện
                    </Button>
                </div>
            )}
        </>
    );
};

export default ActionButtons;
