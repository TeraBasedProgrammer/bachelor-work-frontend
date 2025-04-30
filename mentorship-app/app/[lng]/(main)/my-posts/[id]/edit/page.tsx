'use client';

import { ActivityCategory, Post } from '@/app/types';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostForm from '../../components/PostForm';

export default function EditPostPage() {
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const params = useParams();
  const lng = useParams().lng;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;

      try {
        const [categoriesResponse, postResponse] = await Promise.all([
          axiosInstance.get('/activity-categories', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }),
          axiosInstance.get(`/posts/${params.id}`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }),
        ]);

        setActivityCategories(categoriesResponse.data);
        setPost(postResponse.data);
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
            description: 'Failed to fetch data',
            variant: 'destructive',
          });
        }
        router.push(`/${lng}/my-posts`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken, params.id, lng, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-brand" />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
        <PostForm activityCategories={activityCategories} post={post} />
      </div>
    </div>
  );
}
