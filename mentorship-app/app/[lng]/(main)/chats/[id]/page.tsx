'use client';

import { Chatbox, Session } from '@talkjs/react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { data: session } = useSession();
  const { id } = useParams();

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <Session appId="tzS4xfii" userId={session.user.id}>
      <Chatbox className="w-full h-[600px] mt-20" conversationId={id as string}></Chatbox>
    </Session>
  );
}
