import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Code, Copy, Download, ArrowRightLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HtmlToText = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [htmlInput, setHtmlInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [preserveLinks, setPreserveLinks] = useState(true);
  const [preserveLineBreaks, setPreserveLineBreaks] = useState(true);

  const convertHtmlToText = () => {
    if (!htmlInput.trim()) {
      toast({ title: "Error", description: "Please enter HTML content", variant: "destructive" });
      return;
    }

    try {
      // Create a temporary DOM element
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlInput, "text/html");
      
      // Remove script and style elements
      const scriptsAndStyles = doc.querySelectorAll("script, style, noscript");
      scriptsAndStyles.forEach(el => el.remove());

      // Process links if preserving
      if (preserveLinks) {
        const links = doc.querySelectorAll("a[href]");
        links.forEach(link => {
          const href = link.getAttribute("href");
          const text = link.textContent;
          if (href && href !== text && !href.startsWith("#") && !href.startsWith("javascript:")) {
            link.textContent = `${text} (${href})`;
          }
        });
      }

      // Get text content
      let text = doc.body?.textContent || doc.documentElement?.textContent || "";

      // Handle line breaks
      if (preserveLineBreaks) {
        // Convert block elements to line breaks
        const blockElements = ["p", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr"];
        blockElements.forEach(tag => {
          const regex = new RegExp(`</${tag}>`, "gi");
          text = htmlInput.replace(regex, `</${tag}>\n`);
        });
        
        // Re-parse with line breaks
        const docWithBreaks = parser.parseFromString(text, "text/html");
        const scripts2 = docWithBreaks.querySelectorAll("script, style, noscript");
        scripts2.forEach(el => el.remove());
        text = docWithBreaks.body?.textContent || "";
      }

      // Clean up whitespace
      text = text
        .replace(/\t/g, " ")
        .replace(/ +/g, " ")
        .replace(/\n +/g, "\n")
        .replace(/ +\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      setTextOutput(text);
      toast({ title: "Success", description: "HTML converted to text" });
    } catch (err: any) {
      console.error("[HtmlToText] Error:", err);
      toast({ title: "Error", description: "Failed to convert HTML", variant: "destructive" });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(textOutput);
    toast({ title: "Copied", description: "Text copied to clipboard" });
  };

  const downloadText = () => {
    const blob = new Blob([textOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const swapContent = () => {
    setHtmlInput(textOutput);
    setTextOutput("");
  };

  const clearAll = () => {
    setHtmlInput("");
    setTextOutput("");
  };

  // Sample HTML for testing
  const loadSample = () => {
    setHtmlInput(`<!DOCTYPE html>
<html>
<head>
  <title>Sample Page</title>
  <style>body { font-family: sans-serif; }</style>
</head>
<body>
  <h1>Welcome to Lucy Lounge</h1>
  <p>This is a <strong>sample</strong> HTML page with various elements.</p>
  <ul>
    <li>Feature 1: AI-powered chat</li>
    <li>Feature 2: <a href="https://example.com">Music discovery</a></li>
    <li>Feature 3: Media streaming</li>
  </ul>
  <p>Visit our <a href="https://lucylounge.ai">website</a> for more info.</p>
  <script>console.log("This should be removed");</script>
</body>
</html>`);
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
              <Code className="h-6 w-6 text-primary" />
              HTML to Text Converter
            </h1>
            <p className="text-sm text-muted-foreground">Extract clean text from HTML content</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveLinks}
                  onChange={(e) => setPreserveLinks(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Preserve link URLs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveLineBreaks}
                  onChange={(e) => setPreserveLineBreaks(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Preserve line breaks</span>
              </label>
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                HTML Input
              </CardTitle>
              <CardDescription>Paste your HTML content here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="<html>...</html>"
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text Output
                </CardTitle>
                <CardDescription>
                  {textOutput ? `${textOutput.length} characters` : "Converted text will appear here"}
                </CardDescription>
              </div>
              {textOutput && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadText}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Textarea
                value={textOutput}
                readOnly
                rows={15}
                placeholder="Clean text will appear here..."
                className="text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={convertHtmlToText} size="lg">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Convert to Text
          </Button>
          {textOutput && (
            <Button variant="outline" onClick={swapContent}>
              Use Output as Input
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default HtmlToText;
