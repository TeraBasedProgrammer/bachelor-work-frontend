'use client';

import { UserData } from '@/app/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UserPage() {
  const { id, lng } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id === id) {
      router.replace(`/${lng}/profile`);
      return;
    }

    const fetchUser = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await axiosInstance.get(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          toast({
            title: 'Error',
            description: error.response?.data.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch user data',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, lng, router, session?.accessToken, session?.user?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">User not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-start gap-8">
            <div className="flex-shrink-0">
              <Image
                src={user.profile_picture || 'https://github.com/shadcn.png'}
                alt={`${user.name}'s avatar`}
                width={120}
                height={120}
                className="rounded-full"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 mt-1">{user.email}</p>
              {user.verification_status === 'VR' && (
                <div className="mt-4">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    Verified Mentor
                  </span>
                </div>
              )}
            </div>
          </div>

          {user.verification_status === 'VR' && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mentor Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">About Me</h3>
                  <p className="mt-1 text-gray-600">{user.about_me_text}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Service Details</h3>
                  <p className="mt-1 text-gray-600">
                    Price: ${user.service_price}{' '}
                    {user.service_price_type === 'PH' ? 'per hour' : 'per lesson'}
                  </p>
                </div>

                {user.activity_categories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.activity_categories.map((category) => (
                        <span
                          key={category.id}
                          className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          {category.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.cv_link && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">CV</h3>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => window.open(user.cv_link as unknown as URL, '_blank')}>
                      View CV
                    </Button>
                  </div>
                )}

                {user.about_me_video_link && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Introduction Video</h3>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        window.open(user.about_me_video_link as unknown as URL, '_blank')
                      }>
                      Watch Video
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
