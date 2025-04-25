'use client';

 import type {Metadata} from 'next';
 import {Geist, Geist_Mono} from 'next/font/google';
 import './globals.css';
 import {AuthProvider} from '@/components/AuthProvider';
 import Link from 'next/link';
 import { useRouter } from 'next/navigation';
+import React, { useEffect, useState } from 'react';
 

 const geistSans = Geist({
  variable: '--font-geist-sans',
@@ -25,7 +25,7 @@
   return (
   <html lang="en">
   <body>
-  <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
+  <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
   <AuthProvider>
   <Header />
   {children}
@@ -102,6 +102,7 @@
 
 
 
+
 

 