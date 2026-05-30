import Link from 'next/link';
import React from 'react';

const Footer = () => (
    <footer className="w-full border-t bg-muted/40 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
            <p>
                © {new Date().getFullYear()} by{' '}
                <Link
                    href="https://github.com/Nam077"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                >
                    Nam077
                </Link>
            </p>
        </div>
    </footer>
);

export default Footer;
