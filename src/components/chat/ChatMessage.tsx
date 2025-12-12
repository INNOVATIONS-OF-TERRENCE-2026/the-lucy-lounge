import { User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { FilePreview } from "./FilePreview";
import { MessageReactions } from "./MessageReactions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessageProps {
  message: {
    id?: string;
    role: string;
    content: string;
    created_at: string;
  };
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [attachments, setAttachments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });

    if (message.id) {
      loadAttachments();
    }
  }, [message.id]);

  const loadAttachments = async () => {
    if (!message.id) return;
    const { data } = await supabase
      .from('attachments')
      .select('*')
      .eq('message_id', message.id);
    if (data) setAttachments(data);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`} data-theme-area="chat">
      {!isUser && (
        <LucyLogo size="sm" showGlow className="flex-shrink-0" />
      )}
      
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div 
          className="rounded-2xl px-5 py-3 backdrop-blur-sm transition-all duration-200"
          style={{
            backgroundColor: isUser ? 'var(--theme-primary)' : 'var(--theme-bg-2)',
            color: 'var(--theme-text)',
            boxShadow: `0 0 12px color-mix(in srgb, var(--theme-primary) 25%, transparent)`,
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 text-inherit">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 leading-7 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-7">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mt-6 mb-3">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mt-6 mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold mt-5 mb-2">{children}</h3>
                  ),
                  // Render inline images (base64 or URLs)
                  img: ({ src, alt }) => (
                    <div className="my-4 rounded-lg overflow-hidden">
                      <img 
                        src={src} 
                        alt={alt || 'Generated image'} 
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '512px', objectFit: 'contain' }}
                        loading="lazy"
                      />
                      {alt && <p className="text-xs text-muted-foreground mt-2 italic">{alt}</p>}
                    </div>
                  ),
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const inline = !match;
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-4"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {attachments.length > 0 && (
            <FilePreview attachments={attachments} />
          )}
        </div>

        {/* Reactions - Only show for saved messages (not streaming) */}
        {!isStreaming && message.id && userId && (
          <MessageReactions 
            messageId={message.id} 
            userId={userId}
            className="mt-2 px-1"
          />
        )}

        {!isUser && !isStreaming && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            {new Date(message.created_at).toLocaleTimeString()}
          </p>
        )}
      </div>
      
      {isUser && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: 'var(--theme-bg-2)',
            borderColor: 'var(--theme-primary)',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          <User className="w-4 h-4" style={{ color: 'var(--theme-text)' }} />
        </div>
      )}
    </div>
  );
}