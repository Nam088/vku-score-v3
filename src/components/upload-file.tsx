'use client';
import React, { useCallback, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { isScoreArray } from '@/common/utils';
import { useScoreStore } from '@/store/useScoreStore';
import { Upload, X, FileJson } from 'lucide-react';

const FileUpload: React.FC = () => {
    const { toggleUploadFile, setScores, setToggleUploadFile } = useScoreStore();
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles[0] || null);
    }, []);

    const accept: Accept = {
        'application/json': ['.json'],
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize: 5000000,
        maxFiles: 1,
    });

    const handleFileRead = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            try {
                const jsonData = JSON.parse(content);
                if (isScoreArray(jsonData)) {
                    setScores(jsonData);
                    toast.success('Tải dữ liệu điểm thành công!');
                    setToggleUploadFile(false);
                } else {
                    toast.error('Định dạng tệp JSON không hợp lệ!');
                }
            } catch (e) {
                toast.error('Lỗi khi đọc nội dung tệp!');
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = () => {
        if (file) {
            handleFileRead(file);
            setFile(null);
        }
    };

    if (!toggleUploadFile) return null;

    return (
        <Card className="w-full border shadow-md bg-card/60 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="text-center">
                <CardTitle className="text-lg font-bold flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    Tải lên tệp dữ liệu điểm
                </CardTitle>
                <CardDescription>
                    Kéo thả hoặc chọn tệp chứa điểm của bạn (được cào bằng code)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        isDragActive
                            ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                            : 'border-muted hover:border-foreground/45 hover:bg-muted/10'
                    }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Upload className="h-10 w-10 stroke-1" />
                        <p className="text-sm">Kéo & thả tệp vào đây, hoặc click để chọn tệp</p>
                    </div>
                </div>

                {file && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFile(null)}
                            className="h-8 w-8 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setFile(null)} disabled={!file}>
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleSubmit} disabled={!file} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Gửi tệp
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default FileUpload;
