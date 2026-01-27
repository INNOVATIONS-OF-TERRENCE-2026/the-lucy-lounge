import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Code, Play, Copy, Loader2, AlertTriangle, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ToolAccessGuard, useToolAccess } from "@/components/monetization/ToolAccessGuard";
import { ToolErrorBoundary } from "@/components/platform/ErrorBoundary";

type Language = "javascript" | "python";

const CodeExecutorContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { executeWithAccessCheck, dailyRemaining } = useToolAccess({ toolId: 'code' });
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [output, setOutput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const executeCode = async () => {
    if (!code.trim()) {
      toast({ title: "Error", description: "Please enter some code", variant: "destructive" });
      return;
    }

    setLoading(true);
    setOutput("");
    setAnalysis("");

    try {
      const result = await executeWithAccessCheck(
        async () => {
          const { data, error } = await supabase.functions.invoke("code-executor", {
            body: {
              code: code.trim(),
              language
            }
          });

          if (error) throw error;
          return data;
        },
        (reason) => {
          toast({ 
            title: "Access Denied", 
            description: reason, 
            variant: "destructive" 
          });
        }
      );

      if (!result) {
        setLoading(false);
        return;
      }

      if (result?.output) {
        setOutput(result.output);
      }
      if (result?.analysis) {
        setAnalysis(result.analysis);
      }
      if (result?.error) {
        setOutput(`Error: ${result.error}`);
      }

      toast({ title: "Success", description: "Code analyzed successfully" });
    } catch (err: any) {
      console.error("[CodeExecutor] Error:", err);
      setOutput(`Error: ${err.message || "Failed to execute code"}`);
      toast({ title: "Error", description: "Code execution failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard" });
  };

  const loadExample = (lang: Language) => {
    if (lang === "javascript") {
      setCode(`// Calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Test the function
const result = factorial(5);
console.log("Factorial of 5:", result);

// Fibonacci sequence
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i-1] + seq[i-2]);
  }
  return seq;
}

console.log("First 10 Fibonacci:", fibonacci(10));`);
    } else {
      setCode(`# Calculate factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# Test the function
result = factorial(5)
print(f"Factorial of 5: {result}")

# Fibonacci sequence
def fibonacci(n):
    seq = [0, 1]
    for i in range(2, n):
        seq.append(seq[i-1] + seq[i-2])
    return seq

print(f"First 10 Fibonacci: {fibonacci(10)}")`);
    }
    setLanguage(lang);
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
              Code Executor
            </h1>
            <p className="text-sm text-muted-foreground">AI-powered code analysis and execution simulation</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-500">Sandboxed Environment</p>
                <p className="text-muted-foreground">
                  Code is analyzed by AI and simulated, not executed in a real runtime. 
                  This is safe for learning and testing logic without security risks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Editor</CardTitle>
            <CardDescription>Write or paste your code below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={language === "javascript" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("javascript")}
              >
                JavaScript
              </Button>
              <Button
                variant={language === "python" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("python")}
              >
                Python
              </Button>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => loadExample(language)}>
                Load Example
              </Button>
            </div>

            <Textarea
              placeholder={language === "javascript" 
                ? "// Enter your JavaScript code here\nconsole.log('Hello, World!');" 
                : "# Enter your Python code here\nprint('Hello, World!')"
              }
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button onClick={executeCode} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setCode("")}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {output && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Output
                </CardTitle>
                <CardDescription>Simulated execution result</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(output)}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-64 font-mono text-sm whitespace-pre-wrap">
                {output}
              </pre>
            </CardContent>
          </Card>
        )}

        {analysis && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Code Analysis</CardTitle>
                <CardDescription>AI explanation of what the code does</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysis)}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{analysis}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

// Wrap with access guard and error boundary
const CodeExecutor = () => {
  return (
    <ToolErrorBoundary toolName="Code Executor">
      <ToolAccessGuard
        toolId="code"
        toolName="Code Executor"
        toolDescription="AI-powered code analysis and execution simulation"
      >
        <CodeExecutorContent />
      </ToolAccessGuard>
    </ToolErrorBoundary>
  );
};

export default CodeExecutor;
