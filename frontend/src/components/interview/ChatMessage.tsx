import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: {
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.type === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} gap-3`}
    >
      {isBot && (
        <Avatar className="w-8 h-8 bg-primary">
          <AvatarFallback>
            <Bot className="w-4 h-4 text-primary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isBot ? 'order-2' : 'order-1'}`}>
        <div
          className={`p-3 rounded-lg ${
            isBot
              ? 'bg-muted text-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {!isBot && (
        <Avatar className="w-8 h-8 bg-secondary">
          <AvatarFallback>
            <User className="w-4 h-4 text-secondary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}