'use client';

 import type {Metadata} from 'next';
 import {Geist, Geist_Mono} from 'next/font/google';
 import './globals.css';
 import {AuthProvider, useAuth} from '@/components/AuthProvider';
 import Link from 'next/link';
 import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';


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
  <Header/>
  {children}
  </div>
  </AuthProvider>
  </body>
  </html>
  );
 }
 

 function Header() {
  const { user, loading, error } = useAuth();
  const router = useRouter();
 

  return (
  <nav className="bg-white py-4 shadow-md">
  <div className="container mx-auto flex items-center justify-between">
  <Link href="/" className="text-2xl font-bold">
  Finance Clarity
  </Link>
  <div className="space-x-4">
  <Link href="/calculator" className="text-blue-500 hover:text-blue-700">
  Calculator
  </Link>
  {user ? (
  <Link href="/report" className="text-blue-500 hover:text-blue-700">
  Reports
  </Link>
  ) : null}
  {!user ? (
  <Link href="/login" className="text-blue-500 hover:text-blue-700">
  Login
  </Link>
  ) : null}
  </div>
  </div>
  </nav>
  );
 }
 

 

