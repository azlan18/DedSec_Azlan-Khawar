// components/Messages.tsx
import { Message } from 'ai';
import MessageBox from '@/components/MessageBox';

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const Messages = ({ messages, isLoading }: MessagesProps) => {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageBox 
          key={index}
          role={message.role}
          content={message.content}
        />
      ))}
    </div>
  );
};

export default Messages;