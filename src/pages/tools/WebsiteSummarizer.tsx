import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Globe, Loader2, Copy, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ToolAccessGuard, useToolAccess } from "@/components/monetization/ToolAccessGuard";
import { ToolErrorBoundary } from "@/components/platform/ErrorBoundary";

const WebsiteSummarizerContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { executeWithAccessCheck } = useToolAccess({ toolId: 'web_fetch' });
  
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (str: string): boolean => {
    try {
      const parsed = new URL(str);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const summarizeWebsite = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) {
      targetUrl = "https://" + targetUrl;
    }

    if (!isValidUrl(targetUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError(null);
    setSummary("");
    setRawContent("");

    try {
      const result = await executeWithAccessCheck(
        async () => {
          // First, fetch the website content
          const { data: fetchData, error: fetchError } = await supabase.functions.invoke("browser-fetch", {
            body: { url: targetUrl }
          });

          if (fetchError) throw fetchError;

          if (!fetchData?.text) {
            throw new Error("Could not fetch website content");
          }

          // Then, summarize using lucy-router
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke("lucy-router", {
            body: {
              userId: "anonymous",
              messages: [
                {
                  role: "user",
                  content: `Summarize this website content in a clear, concise way. Include the main topic, key points, and any important details:\n\nTitle: ${fetchData.title || "Unknown"}\n\nContent:\n${fetchData.text.slice(0, 8000)}`
                }
              ]
            }
          });

          if (summaryError) throw summaryError;

          return { fetchData, summaryData };
        },
        (reason) => {
          setError(reason);
        }
      );

      if (!result) {
        setLoading(false);
        return;
      }

      setRawContent(result.fetchData.text);

      const summaryText = result.summaryData?.plan?.finalAnswer || 
        result.summaryData?.plan?.steps?.[0]?.result || 
        "Summary could not be generated.";

      setSummary(summaryText);
      toast({ title: "Success", description: "Website summarized successfully" });
    } catch (err: any) {
      console.error("[WebsiteSummarizer] Error:", err);
      setError(err.message || "Failed to summarize website");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard" });
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
              Website Summarizer
            </h1>
            <p className="text-sm text-muted-foreground">Get AI-powered summaries of any webpage</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Website URL</CardTitle>
            <CardDescription>
              Paste a URL to fetch and summarize its content using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && summarizeWebsite()}
              />
              <Button onClick={summarizeWebsite} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Summarize
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

        {summary && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Summary</CardTitle>
                <CardDescription>AI-generated summary of the webpage</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(summary)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{summary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {rawContent && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Raw Content</CardTitle>
                <CardDescription>Extracted text from the webpage</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(rawContent)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rawContent}
                readOnly
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

const WebsiteSummarizer = () => {
  return (
    <ToolErrorBoundary toolName="Website Summarizer">
      <ToolAccessGuard
        toolId="web_fetch"
        toolName="Website Summarizer"
        toolDescription="Get AI-powered summaries of any webpage"
      >
        <WebsiteSummarizerContent />
      </ToolAccessGuard>
    </ToolErrorBoundary>
  );
};

export default WebsiteSummarizer;
