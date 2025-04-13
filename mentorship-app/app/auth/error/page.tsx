'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      toast({
        title: 'Authentication Failed',
        description: error,
        variant: 'destructive',
      });
      console.error('Authentication error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="space-y-6 border-2 border-gray-200 rounded-md py-8 px-14 mx-auto backdrop-blur-sm">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Authentication Error
          </h2>

          <p className="text-center">
            {error || 'An unexpected error occurred during authentication.'}
          </p>

          <div className="flex justify-center">
            <Link href="/login">
              <Button variant="outline" className="mt-4">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
