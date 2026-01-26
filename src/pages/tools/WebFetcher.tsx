import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Globe, Loader2, Copy, Download, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FetchResult {
  url: string;
  title: string;
  text: string;
  wordCount: number;
  fetchedAt: Date;
}

const WebFetcher = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<FetchResult[]>([]);

  const isValidUrl = (str: string): boolean => {
    try {
      const parsed = new URL(str);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const fetchWebsite = async () => {
    let targetUrl = url.trim();
    
    if (!targetUrl) {
      setError("Please enter a URL");
      return;
    }

    if (!targetUrl.startsWith("http")) {
      targetUrl = "https://" + targetUrl;
    }

    if (!isValidUrl(targetUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke("browser-fetch", {
        body: { url: targetUrl }
      });

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error("No response from server");
      }

      const fetchResult: FetchResult = {
        url: targetUrl,
        title: data.title || "Untitled",
        text: data.text || "",
        wordCount: (data.text || "").split(/\s+/).filter((w: string) => w).length,
        fetchedAt: new Date()
      };

      setResult(fetchResult);
      setHistory(prev => [fetchResult, ...prev.slice(0, 9)]); // Keep last 10
      toast({ title: "Success", description: "Website content fetched" });
    } catch (err: any) {
      console.error("[WebFetcher] Error:", err);
      setError(err.message || "Failed to fetch website");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard" });
  };

  const downloadText = () => {
    if (!result) return;
    
    const content = `URL: ${result.url}\nTitle: ${result.title}\nFetched: ${result.fetchedAt.toISOString()}\n\n---\n\n${result.text}`;
    const blob = new Blob([content], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${result.title.replace(/[^a-z0-9]/gi, "_").slice(0, 50)}.txt`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const loadFromHistory = (item: FetchResult) => {
    setResult(item);
    setUrl(item.url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Safe Web Fetcher
            </h1>
            <p className="text-sm text-muted-foreground">Extract content from any webpage safely</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fetch Website</CardTitle>
                <CardDescription>
                  Enter a URL to fetch its text content. JavaScript-rendered content may not be available.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && fetchWebsite()}
                  />
                  <Button onClick={fetchWebsite} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Fetch
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {result && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {result.title}
                      </CardTitle>
                      <CardDescription>
                        {result.wordCount.toLocaleString()} words • Fetched {result.fetchedAt.toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.text)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadText}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(result.url, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2 truncate">
                      {result.url}
                    </div>
                    <Textarea
                      value={result.text}
                      readOnly
                      rows={20}
                      className="text-sm"
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Fetches</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No fetch history yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => loadFromHistory(item)}
                        className="w-full p-2 text-left rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.wordCount.toLocaleString()} words
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Works best with static HTML pages</p>
                <p>• JavaScript-rendered content may be limited</p>
                <p>• Some sites may block automated access</p>
                <p>• Results are limited to ~20KB of text</p>
                <p>• Use for research and learning purposes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WebFetcher;
