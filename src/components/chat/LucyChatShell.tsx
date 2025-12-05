import React from "react";
import { useChat } from "@/hooks/useChat";
import { Send, Loader2 } from "lucide-react";

export function LucyChatShell() {
  const { messages, input, setInput, isLoading, error, sendMessage } = useChat();

  return (
    <div className="lucy-chat-shell">
      <div className="lucy-chat-history">
        {messages.length === 0 && (
          <div className="lucy-empty-state">
            <p>Ask Lucy anything...</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`lucy-msg lucy-${m.role}`}>
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="lucy-msg lucy-assistant lucy-typing">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Lucy is thinking...</span>
          </div>
        )}
      </div>

      <form
        className="lucy-chat-bar"
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
      >
        <input
          className="lucy-input"
          placeholder="Ask Lucy..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button 
          className="lucy-send" 
          type="submit"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {error && <p className="lucy-error">{error}</p>}
    </div>
  );
}

export default LucyChatShell;
