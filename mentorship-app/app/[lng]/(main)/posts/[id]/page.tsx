'use client';

import { Post } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PostPage() {
  const { id, lng } = useParams();
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createNewConversation = async () => {
    if (!sessionData) return;

    try {
      // Create or update current user profile in TalkJS
      await axios.put(
        `https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/users/${sessionData.user.id}`,
        {
          name: sessionData.user.name,
          email: [sessionData.user.email],
          photoUrl: sessionData.user.profile_picture || 'https://github.com/shadcn.png',
          welcomeMessage: 'Hey there! 👋',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TALKJS_SECRET_KEY}`,
          },
        },
      );

      // Create or update other user profile in TalkJS
      await axios.put(
        `https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/users/${post?.user.id}`,
        {
          name: post?.user.name,
          email: [post?.user.email],
          photoUrl: post?.user.profile_picture || 'https://github.com/shadcn.png',
          welcomeMessage: 'Hey there! 👋',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TALKJS_SECRET_KEY}`,
          },
        },
      );

      // Create the conversation
      const conversationId = crypto.randomUUID();

      await axios.put(
        `https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/conversations/${conversationId}`,
        {
          participants: [sessionData.user.id, post?.user.id],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TALKJS_SECRET_KEY}`,
          },
        },
      );
      router.push(`/${lng}/chats/${conversationId}`);
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
          description: 'Failed to create chat',
          variant: 'destructive',
        });
      }
    }
  };

  const handleChatRoom = async () => {
    setIsLoading(true);
    if (!sessionData?.accessToken) return;

    try {
      const response = await axios.get(
        `https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/users/${sessionData.user.id}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TALKJS_SECRET_KEY}`,
          },
        },
      );

      const conversations = response.data.data;
      const conversationWithPostUser = conversations.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (conversation: any) =>
          conversation.participants[sessionData.user.id] &&
          post?.user.id &&
          conversation.participants[post.user.id],
      );

      if (conversationWithPostUser) {
        router.push(`/${lng}/chats/${conversationWithPostUser.id}`);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        console.log(error);
        toast({
          title: 'Error',
          description: 'Failed to fetch conversations',
          variant: 'destructive',
        });
      } else {
        await createNewConversation();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!sessionData?.accessToken) return;

      try {
        const response = await axiosInstance.get(`/posts/${id}?increment_views=true`, {
          headers: {
            Authorization: `Bearer ${sessionData.accessToken}`,
          },
        });
        setPost(response.data);
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
            description: 'Failed to fetch post',
            variant: 'destructive',
          });
        }
        router.push(`/${lng}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, lng, router, sessionData?.accessToken]);

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

  const isOwner = sessionData?.user?.id === post.user.id;

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src={post.user.profile_picture || 'https://github.com/shadcn.png'}
              alt={`${post.user.name}'s avatar`}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <Link href={`/${lng}/users/${post.user.id}`} className="hover:underline">
                <h3 className="font-semibold text-lg">{post.user.name}</h3>
              </Link>
              <p className="text-sm text-gray-500">
                {format(new Date(post.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-600 mb-6">{post.description}</p>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                ${post.service_price}{' '}
                <span className="text-gray-500">
                  {post.service_type === 'P' ? 'Offering' : 'Seeking'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{post.number_of_views} views</span>
            </div>
          </div>

          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                  {category.title}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4">
            {isOwner ? (
              <Button
                className="bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold"
                onClick={() => router.push(`/${lng}/my-posts/${post.id}/edit`)}>
                Edit Post
              </Button>
            ) : (
              <Button
                className="bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold"
                onClick={handleChatRoom}>
                Chat with User
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
