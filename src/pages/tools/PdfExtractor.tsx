import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Upload, Copy, Download, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PdfExtractor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size must be under 10MB");
        return;
      }
      setFile(selected);
      setError(null);
      setExtractedText("");
    }
  };

  const extractText = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Simple PDF text extraction (basic implementation)
      // For complex PDFs, this extracts visible text streams
      const bytes = new Uint8Array(arrayBuffer);
      const text = extractTextFromPdfBytes(bytes);
      
      if (text.trim()) {
        setExtractedText(text);
        toast({ title: "Success", description: "Text extracted successfully" });
      } else {
        setError("No text could be extracted. This PDF may be image-based or encrypted.");
      }
    } catch (err: any) {
      console.error("[PdfExtractor] Error:", err);
      setError(err.message || "Failed to extract text");
    } finally {
      setLoading(false);
    }
  };

  // Basic PDF text extraction without external libraries
  const extractTextFromPdfBytes = (bytes: Uint8Array): string => {
    const text = new TextDecoder("latin1").decode(bytes);
    const textParts: string[] = [];
    
    // Extract text between BT and ET markers (text objects)
    const btPattern = /BT\s*([\s\S]*?)\s*ET/g;
    let match;
    
    while ((match = btPattern.exec(text)) !== null) {
      const content = match[1];
      
      // Extract text from Tj and TJ operators
      const tjPattern = /\(((?:[^()\\]|\\.)*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjPattern.exec(content)) !== null) {
        textParts.push(decodeEscaped(tjMatch[1]));
      }
      
      // Extract from TJ arrays
      const tjArrayPattern = /\[((?:[^\[\]]|\[(?:[^\[\]])*\])*)\]\s*TJ/gi;
      let arrayMatch;
      while ((arrayMatch = tjArrayPattern.exec(content)) !== null) {
        const arrayContent = arrayMatch[1];
        const stringPattern = /\(((?:[^()\\]|\\.)*)\)/g;
        let strMatch;
        while ((strMatch = stringPattern.exec(arrayContent)) !== null) {
          textParts.push(decodeEscaped(strMatch[1]));
        }
      }
    }
    
    // Also try to find plain text streams
    const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
    while ((match = streamPattern.exec(text)) !== null) {
      const streamContent = match[1];
      // Extract readable ASCII text
      const readable = streamContent.replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (readable.length > 20 && !/^[\d\s.]+$/.test(readable)) {
        textParts.push(readable);
      }
    }
    
    return textParts.join("\n").replace(/\s+/g, " ").trim();
  };

  const decodeEscaped = (str: string): string => {
    return str
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(extractedText);
    toast({ title: "Copied", description: "Text copied to clipboard" });
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(".pdf", "")}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen-dvh bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              PDF Text Extractor
            </h1>
            <p className="text-sm text-muted-foreground">Extract text content from PDF files</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>
              Select a PDF file to extract its text content. Works best with text-based PDFs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <p className="text-lg font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-lg font-medium">Click to upload PDF</p>
                  <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button 
              onClick={extractText} 
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Extract Text
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {extractedText && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Extracted Text</CardTitle>
                <CardDescription>{extractedText.length} characters</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadText}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={extractedText}
                readOnly
                rows={15}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PdfExtractor;
