import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/core/layout/Header';
import Footer from '@/core/layout/Footer';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['vietnamese', 'latin'] });

export const metadata: Metadata = {
    title: 'VKU Score',
    description: 'Hỗ trợ tính điểm GPA và gợi ý học cải thiện cho sinh viên VKU',
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang='vi' suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300`}>
                <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
                    <Header />
                    <main className='flex-grow container mx-auto p-4 md:p-6 max-w-7xl space-y-6'>
                        {children}
                    </main>
                    <Footer />
                    <Toaster position="top-right" richColors />
                </ThemeProvider>
            </body>
        </html>
    );
};

export default RootLayout;
