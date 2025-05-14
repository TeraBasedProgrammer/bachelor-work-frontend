'use client';

import { Chatbox, Session } from '@talkjs/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ChatPage() {
  const [conversationData, setConversationData] = useState<unknown | null>(null);
  const { data: session } = useSession();
  const { id } = useParams();

  useEffect(() => {
    const fetchConversationData = async () => {
      const response = await axios.get(
        `https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/conversations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TALKJS_SECRET_KEY}`,
          },
        },
      );
      setConversationData(response.data);
    };
    fetchConversationData();
  }, [id]);

  if (!session || !conversationData) {
    return <p className="text-2xl font-bold text-center mt-10">Loading...</p>;
  }

  console.log(conversationData);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1>Create an invoice</h1>
      </div>
      <Session appId="tzS4xfii" userId={session.user.id}>
        <Chatbox className="w-full h-[600px] mt-20" conversationId={id as string}></Chatbox>
      </Session>
    </div>
  );
}
