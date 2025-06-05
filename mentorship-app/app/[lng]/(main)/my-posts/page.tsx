'use client';

import { useTranslation } from '@/app/i18n/client';
import { Post } from '@/app/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { data: session } = useSession();
  const lng = useParams().lng;
  const router = useRouter();
  const { t } = useTranslation(lng as string, 'posts');

  const fetchPosts = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await axiosInstance.get(`/posts/user/${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setPosts(response.data);
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
          description: 'Failed to fetch posts',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost || !session?.accessToken) return;

    try {
      await axiosInstance.delete(`/posts/${selectedPost.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      setPosts(posts.filter((post) => post.id !== selectedPost.id));
      setDeleteModalOpen(false);
      setSelectedPost(null);
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
          description: 'Failed to delete post',
          variant: 'destructive',
        });
      }
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('myposts.title')}</h1>
        <Button
          className="mt-4 bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold"
          onClick={() => router.push(`/${lng}/my-posts/create`)}>
          {t('createNewPost')}
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('myposts.noPosts')}</p>
          <Button
            className="mt-4 bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold"
            onClick={() => router.push(`/${lng}/my-posts/create`)}>
            {t('myposts.createPost')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription>
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3 mb-4">{post.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.title}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>
                      {post.number_of_views} {t('views')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{post.service_price}$</span>
                    <span className="ml-1">
                      {post.service_type === 'S' ? 'Per Session' : 'Per Lesson'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold"
                  size="sm"
                  onClick={() => router.push(`/${lng}/my-posts/${post.id}/edit`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('editPost')}
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-500/90 text-white font-semibold"
                  size="sm"
                  onClick={() => {
                    setSelectedPost(post);
                    setDeleteModalOpen(true);
                  }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('deletePost')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>{t('thisActionCannotBeUndone')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-500/90 text-white font-semibold"
              onClick={handleDelete}>
              {t('deletePost')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
