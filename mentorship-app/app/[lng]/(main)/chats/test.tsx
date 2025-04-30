'use client';

import { Chatbox, Session } from '@talkjs/react';
import { useCallback } from 'react';
import Talk from 'talkjs';

function Chat() {
  const syncUser = useCallback(
    () =>
      new Talk.User({
        id: '12345',
        name: 'Illia Dronov',
        email: 'ilyadronov2332@gmail.com',
        photoUrl: 'https://github.com/shadcn.png',
        welcomeMessage: 'Hello!',
      }),
    [],
  );

  const syncConversation = useCallback((session: Talk.Session) => {
    // JavaScript SDK code here
    const conversation = session.getOrCreateConversation('new_conversation');

    const other = new Talk.User({
      id: 'frank',
      name: 'Frank',
      email: 'frank@example.com',
      photoUrl: 'https://talkjs.com/new-web/avatar-8.jpg',
      welcomeMessage: 'Hey, how can I help?',
    });
    conversation.setParticipant(session.me);
    conversation.setParticipant(other);

    return conversation;
  }, []);

  return (
    <Session appId="tzS4xfii" userId="frank">
      <Chatbox className="w-full h-[600px] mt-20" conversationId={'new_conversation'}></Chatbox>
    </Session>
  );
}

export default Chat;
