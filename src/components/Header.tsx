'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook
import { auth } from '@/config/firebase'; // auth instance for signOut

const Header: React.FC = () => {
  const { user, loading } = useAuth(); // Get user and loading state from context
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      if (auth) { // Ensure auth is initialized before calling signOut
        await auth.signOut();
        router.push('/login');
      } else {
        console.error("Firebase auth not initialized for sign out.");
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <header className="bg-background text-foreground py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Finance Clarity
          </Link>
          <div>Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background text-foreground py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Finance Clarity
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            {!user ? (
              <>
                <li>
                  <Button variant="ghost" onClick={() => router.push('/login')}>
                    Login
                  </Button>
                </li>
                <li>
                  <Button onClick={() => router.push('/login?signup=true')}>
                    Sign Up
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <span className="text-sm">Welcome, {user.displayName || user.email}</span>
                </li>
                <li>
                  <Button variant="ghost" onClick={() => router.push('/calculator')}>
                    Calculator
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" onClick={() => router.push('/report')}>
                    Reports
                  </Button>
                </li>
                <li>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
