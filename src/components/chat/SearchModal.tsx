import { useState, useEffect } from "react";
import { Search, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectConversation: (conversationId: string) => void;
}

interface SearchResult {
  id: string;
  conversation_id: string;
  conversation_title: string;
  content: string;
  role: string;
  created_at: string;
  rank: number;
}

export function SearchModal({ open, onOpenChange, onSelectConversation }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchDebounce = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_messages', {
        search_query: searchQuery,
      });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (conversationId: string) => {
    onSelectConversation(conversationId);
    onOpenChange(false);
    setQuery("");
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-foreground">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Conversations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-96">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result.conversation_id)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm">{result.conversation_title}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(result.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {highlightMatch(result.content, query)}
                    </p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {result.role === 'user' ? 'You' : 'Lucy AI'}
                    </span>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Start typing to search...
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}