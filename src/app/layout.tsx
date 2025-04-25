'use client';
 
 import type {Metadata} from 'next';
 import {Geist, Geist_Mono} from 'next/font/google';
 import './globals.css';
 import {AuthProvider, useAuth} from '@/components/AuthProvider';
 import Link from 'next/link';
 import {useRouter} from 'next/navigation';
 

 const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
 });
 

 const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
 });
 

 export default function RootLayout({
  children,
 }: Readonly<{
  children: React.ReactNode;
 }>) {
  return (
  <html lang="en">
  <body>
  <AuthProvider>
  <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <Header />
  {children}
  </div>
  </AuthProvider>
  </body>
  </html>
  );
 }
 

 function Header() {
  const {user, loading, error} = useAuth();
  const router = useRouter();
 

  return (
  <nav className="bg-white py-4 shadow-md">
  <div className="container mx-auto flex items-center justify-between">
  <Link href="/" className="text-2xl font-bold">
  Finance Clarity
  </Link>
  {user ? (
  <div className="space-x-4">
  <Link href="/calculator" className="px-4 py-2 rounded-md text-blue-600 hover:text-blue-800">
  Calculator
  </Link>
  <Link href="/report" className="px-4 py-2 rounded-md text-blue-600 hover:text-blue-800">
  Reports
  </Link>
  <button
  onClick={() => {auth.signOut(); router.push('/login')}}
  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
  >
  Sign Out
  </button>
  </div>
  ) : (
  <Link
  href="/login"
  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
  >
  Sign In
  </Link>
  )}
  </div>
  </nav>
  );
 }
 

