'use client';
import React from 'react';
import { useScoreStore } from '@/store/useScoreStore';
import FileUpload from './upload-file';
import GpaDisplay from './gpa-display';
import ScoreTable from './score-table';
import ActionButtons from './action-buttons';
import AddScoreDialog from './add-score-dialog';
import RecommendDialog from './recommend-dialog';
import TutorialDialog from './tutorial-dialog';
import TargetGpaDialog from './target-gpa-dialog';
import AddSemesterDialog from './add-semester-dialog';
import GpaTrendChart from './gpa-trend-chart';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { readme2 } from '@/common/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const MainView: React.FC = () => {
    const { scores } = useScoreStore();

    return (
        <div className="space-y-6">
            {/* Form tải lên file */}
            <FileUpload />

            {scores.length > 0 ? (
                <>
                    {/* Bảng điều khiển GPA */}
                    <GpaDisplay />

                    {/* Biểu đồ xu hướng GPA */}
                    <GpaTrendChart />

                    {/* Bảng điểm chính */}
                    <ScoreTable />
                </>
            ) : (
                /* Hướng dẫn sử dụng khi chưa có điểm */
                <Card className="border border-border bg-card/40 backdrop-blur-sm shadow-md">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-amber-500" />
                            Chào mừng đến với VKU Score
                        </CardTitle>
                        <CardDescription>
                            Làm theo hướng dẫn dưới đây để tải điểm từ cổng đào tạo của trường lên hệ thống.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-hidden rounded-lg p-2 bg-background/50">
                            <MarkdownPreview
                                wrapperElement={{
                                    'data-color-mode': 'light',
                                }}
                                source={readme2}
                                className="bg-transparent text-sm dark:text-zinc-300"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Các Dialogs ẩn và FABs điều khiển */}
            <ActionButtons />
            <AddScoreDialog />
            <RecommendDialog />
            <TutorialDialog />
            <TargetGpaDialog />
            <AddSemesterDialog />
        </div>
    );
};

export default MainView;
