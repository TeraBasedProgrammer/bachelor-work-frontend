'use client';

import { ActivityCategory } from '@/app/types';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostForm from '../components/PostForm';

export default function CreatePostPage() {
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const lng = useParams().lng;
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await axiosInstance.get('/activity-categories', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setActivityCategories(response.data);
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
            description: 'Failed to fetch activity categories',
            variant: 'destructive',
          });
        }
        router.push(`/${lng}/my-posts`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [session?.accessToken, lng, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-brand" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
        <PostForm activityCategories={activityCategories} />
      </div>
    </div>
  );
}
