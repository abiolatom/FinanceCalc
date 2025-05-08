'use client';

import { Button } from '@/components/ui/button';
import { auth, googleAuthProvider } from '@/config/firebase';
import { signInWithPopup, updateProfile } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, error, firebaseReady } = useAuth(); // Get user, loading, error from context

  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check if '?signup=true' is in the URL
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  const signInWithGoogle = async () => {
    if (!auth || !googleAuthProvider) {
      console.error("Firebase auth or GoogleAuthProvider not initialized.");
      alert("Authentication service is not ready. Please try again later.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;

      if (result.additionalUserInfo?.isNewUser && firebaseUser.displayName) {
        await updateProfile(firebaseUser, {
          displayName: firebaseUser.displayName,
        });
      }
      // AuthProvider's useEffect will handle redirection
    } catch (e: any) {
      console.error('Error signing in with Google', e);
      alert(`Error signing in with Google: ${e.message}`);
    }
  };
  
  // Effect to redirect if user is already logged in, handled by AuthProvider now
  // useEffect(() => {
  //   if (user) {
  //     router.push('/calculator');
  //   }
  // }, [user, router]);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    // Update URL query parameter without full page reload
    const newPath = isSignUp ? '/login' : '/login?signup=true';
    router.replace(newPath, { scroll: false });
  };

  if (!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p>Initializing Authentication...</p>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-red-500">Error: {error.message}</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }


  // If user is already logged in, AuthProvider should redirect.
  // This page content might briefly flash, or you can return null/loading here too.
  if (user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <p>Redirecting...</p>
        </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold text-center text-card-foreground">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        
        <Button 
          onClick={signInWithGoogle} 
          className="w-full text-lg py-3"
          disabled={!firebaseReady} // Disable button if Firebase isn't ready
        >
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M21.4286 12.2456C21.4286 11.4773 21.3636 10.7091 21.2364 10H12V14.2182H17.6C17.3909 15.6091 16.6727 16.8182 15.4545 17.6L15.4364 17.7182L18.6273 20.0364L18.7455 20.0455C20.4545 18.4273 21.4286 15.6727 21.4286 12.2456Z" fill="#4285F4"/><path fillRule="evenodd" clipRule="evenodd" d="M12 21.9991C14.9182 21.9991 17.3818 21.0173 18.7455 19.4727L15.4545 17.0273C14.4909 17.6727 13.3182 18.0636 12 18.0636C9.44545 18.0636 7.25455 16.4091 6.43636 14.0818L6.32727 14.0909L2.96364 16.5273L2.90909 16.6364C4.25455 19.8182 7.8 21.9991 12 21.9991Z" fill="#34A853"/><path fillRule="evenodd" clipRule="evenodd" d="M6.43636 13.5364C6.22727 12.9182 6.10909 12.2545 6.10909 11.5636C6.10909 10.8727 6.22727 10.2091 6.43636 9.59091L6.42727 9.47273L2.90909 7C2.33636 8.20909 2 9.53636 2 11.5636C2 13.5909 2.33636 14.9182 2.90909 16.1273L6.43636 13.5364Z" fill="#FBBC05"/><path fillRule="evenodd" clipRule="evenodd" d="M12 6.06364C13.3636 6.06364 14.5364 6.51818 15.4909 7.4L18.8091 4.09091C17.3727 2.74545 14.9182 2 12 2C7.8 2 4.25455 4.18182 2.90909 7L6.43636 9.59091C7.25455 7.25455 9.44545 6.06364 12 6.06364Z" fill="#EA4335"/></svg>
          {isSignUp ? 'Sign Up with Google' : 'Sign In with Google'}
        </Button>

        <div className="text-center">
          <Button variant="link" onClick={toggleMode} className="text-sm">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </div>
    </div>
  );
}
