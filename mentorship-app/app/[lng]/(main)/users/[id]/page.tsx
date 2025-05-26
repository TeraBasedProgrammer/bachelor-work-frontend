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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          {/* Header Section */}
          <div className="flex items-start gap-8 mb-8">
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
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                {user.verification_status === 'VR' && (
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    Verified Mentor
                  </span>
                )}
              </div>
              <p className="text-gray-500 mt-1">{user.email}</p>
              <p className="text-gray-500 mt-1">Phone: {user.phone_number || 'Not provided'}</p>
            </div>
          </div>

          {/* General Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Details</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span>{' '}
                    {user.phone_number || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Member since:</span>{' '}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Last updated:</span>{' '}
                    {new Date(user.updated_at).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span>{' '}
                    {user.verification_status === 'VR'
                      ? 'Verified'
                      : user.verification_status === 'PD'
                      ? 'Pending Verification'
                      : 'Unverified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mentor Information Section */}
          {user.verification_status === 'VR' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mentor Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About Me</h3>
                  <p className="text-gray-600">{user.about_me_text || 'No description provided'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Service Details</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Price:</span> ${user.service_price}{' '}
                      {user.service_price_type === 'PH' ? 'per hour' : 'per lesson'}
                    </p>
                    {user.activity_categories.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.activity_categories.map((category) => (
                            <span
                              key={category.id}
                              className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                              {category.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents & Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.cv_link && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(user.cv_link as unknown as URL, '_blank')}>
                          View CV
                        </Button>
                      </div>
                    )}
                    {user.about_me_video_link && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            window.open(user.about_me_video_link as unknown as URL, '_blank')
                          }>
                          Watch Introduction Video
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
