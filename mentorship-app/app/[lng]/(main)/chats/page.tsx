'use client';

import { toast } from '@/hooks/useToast';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Participant {
  access: 'ReadWrite';
  notify: boolean;
  isUnread: boolean;
  joinedAt: number;
}

interface Message {
  id: string;
  type: string;
  text: string;
  senderId: string;
  createdAt: number;
  readBy: string[];
}

interface Conversation {
  id: string;
  participants: Record<string, Participant>;
  lastMessage: Message;
  isUnread: boolean;
  unreadMessageCount: number;
  photoUrl: string | null;
  lastMessageAt: number;
}

export default function MyChats() {
  const router = useRouter();
  const lng = useParams().lng;
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await axios.get(
          `https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/users/${session.user.id}/conversations`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TALKJS_SECRET_KEY}`,
            },
          },
        );
        setConversations(response.data.data);
      } catch (error) {
        if (!(error instanceof AxiosError)) {
          toast({
            title: 'Error',
            description: 'Failed to fetch conversations',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [session?.accessToken]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">My Chats</h1>
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No chats yet</p>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = Object.entries(conversation.participants).find(
              ([id]) => id !== session?.user?.id,
            );

            if (!otherParticipant) return null;

            const [participantId, participantData] = otherParticipant;

            return (
              <div
                key={conversation.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/${lng}/chats/${conversation.id}`)}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={conversation.photoUrl || 'https://github.com/shadcn.png'}
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    {participantData.isUnread && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{participantId}</h3>
                      <span className="text-sm text-gray-500">
                        {format(conversation.lastMessageAt, 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {conversation.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.unreadMessageCount > 0 && (
                    <div className="flex-shrink-0 bg-blue-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadMessageCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
