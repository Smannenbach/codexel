import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@shared/schema';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  projectName: string;
}

export function ChatPanel({ messages, onSendMessage, isLoading, projectName }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const message = input.trim();
    setInput('');
    setIsSending(true);

    try {
      await onSendMessage(message);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">{projectName || 'Chat'}</h2>
        <p className="text-sm text-muted-foreground">
          Describe what you want to build and I'll help you create it
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Tell me about your app idea and I'll help bring it to life with the best AI models and development practices.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "justify-end" : ""
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${message.agentId || 'ai'}.png`} />
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.model && (
                    <p className="text-xs opacity-70 mt-1">
                      via {message.model}
                    </p>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          
          {isSending && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app idea..."
            className="min-h-[60px] resize-none"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}