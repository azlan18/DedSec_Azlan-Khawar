// components/MessageBox.tsx
import { Card, CardContent, CardFooter } from './ui/card';
import Markdown from '@/components/ui/markdown';
import { Bot, User } from 'lucide-react';

interface MessageBoxProps {
  role: string;
  content: string;
}

const MessageBox = ({ role, content }: MessageBoxProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary' : 'bg-muted'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-foreground" />
        )}
      </div>
      
      <Card className={`flex-1 ${isUser ? 'bg-primary/10' : 'bg-background'}`}>
        <CardContent className="p-4 text-sm">
          <Markdown text={content} />
        </CardContent>
        {!isUser && (
          <CardFooter className="text-xs text-muted-foreground bg-muted/50 p-3 border-t">
            Disclaimer: This is AI-generated advice for information only. 
            Consult healthcare professionals for medical decisions.
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default MessageBox;