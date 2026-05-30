'use client';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useScoreStore } from '@/store/useScoreStore';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { readme2 } from '@/common/data';
import { HelpCircle } from 'lucide-react';

const TutorialDialog: React.FC = () => {
    const { dialogs, toggleDialog } = useScoreStore();

    const handleClose = () => {
        toggleDialog('tutorial');
    };

    return (
        <Dialog open={dialogs.tutorial} onOpenChange={handleClose}>
            <DialogContent className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="pr-6">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-amber-500" />
                        Hướng dẫn sử dụng VKU Score
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto border rounded-lg p-4 bg-muted/10 my-2">
                    <MarkdownPreview
                        wrapperElement={{
                            'data-color-mode': 'light',
                        }}
                        source={readme2}
                        className="bg-transparent text-sm dark:text-zinc-300"
                    />
                </div>

                <DialogFooter className="pt-2 flex justify-end">
                    <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Đóng hướng dẫn
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TutorialDialog;
