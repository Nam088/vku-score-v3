import type { Metadata } from 'next';
import { Roboto, Geist } from 'next/font/google';
import './globals.css';
import ThemeProviderWrapper from '@/core/ThemeProviderWrapper';
import Header from '@/core/layout/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import Footer from '@/core/layout/Footer';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const roboto = Roboto({
    weight: '400',
    subsets: ['vietnamese'],
});

export const metadata: Metadata = {
    title: 'VKU Score',
    description: 'Hỗ trợ tính điểm GPA và gợi ý học cải thiện cho sinh viên VKU',
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <html lang='en' className={cn("font-sans", geist.variable)}>
        <body className={`${roboto.className} bg-gray-100`}>
        <ThemeProviderWrapper>
            <Header />
            <main className='p-4'>
                {children}
                <ToastContainer />
            </main>
            <Footer />
        </ThemeProviderWrapper>
        </body>
        </html>
    );
};

export default RootLayout;
