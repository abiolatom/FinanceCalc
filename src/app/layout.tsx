'use client';
 

 import type {Metadata} from 'next';
 import {Geist, Geist_Mono} from 'next/font/google';
 import './globals.css';
 import {AuthProvider, useAuth} from '@/components/AuthProvider';
 import Link from 'next/link';
 import { useRouter } from 'next/navigation';
 

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
+
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   return (
   <html lang="en">
   <body>
-  <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
   <AuthProvider>
   <Header/>
   {children}
   </AuthProvider>
   </body>
   </html>
   );
  
 
  function Header() {
+  const router = useRouter();
   const { user, loading, error } = useAuth();
 

   return (
   <nav className="bg-white py-4 shadow-md">
-
-  <Link href="/" className="text-lg font-bold">
+  <Link href="/"  className="text-lg font-bold">
   Finance Clarity
-  </Link>
   <div>
   {user ? (
   <Link href="/" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2">
@@ -48,7 +47,6 @@
   </>
   )}
   </div>
-
   </nav>
   );
 }
