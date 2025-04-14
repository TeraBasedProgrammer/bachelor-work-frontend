'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function ProfileForm({ session }: Readonly<{ session: any }>) {
  const { lng } = useParams();

  if (!session) return <p>You must be logged in.</p>;

  return (
    <div>
      <p>Welcome {session.user?.email}</p>
      <p>Your access token: {session.accessToken}</p>

      <Button
        className="bg-blue-brand"
        onClick={() =>
          signOut({
            callbackUrl: `/${lng}/login`,
          })
        }>
        Sign out
      </Button>
    </div>
  );
}
