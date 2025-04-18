'use client';

import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {AuthProvider, useAuth} from '@/components/AuthProvider';
import Link from 'next/link';
import {metadata} from './metadata';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export {metadata};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        
          <Header/>
            {children}
        
      </body>
    </html>
  );
}

function Header() {
  const { user, loading, error } = useAuth();

  return (
    <nav className="bg-white py-4 shadow-md">
      
        <Link href="/" className="text-lg font-bold">
          Finance Clarity
        </Link>
        <div>
          {user ? (
            <Link href="/login" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2">
              Log Out
            </Link>
          ) : (
            <>
              <Link href="/login" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                Login
              </Link>
              <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>
      
    </nav>
  );
}

