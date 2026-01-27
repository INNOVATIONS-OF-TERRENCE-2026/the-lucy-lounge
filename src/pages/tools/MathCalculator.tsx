import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, Copy, History, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ToolAccessGuard, useToolAccess } from "@/components/monetization/ToolAccessGuard";
import { ToolErrorBoundary } from "@/components/platform/ErrorBoundary";

// Safe math evaluation without eval
const safeEvaluate = (expression: string): { result: string; steps?: string } => {
  try {
    // Clean and normalize the expression
    const cleaned = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\^/g, "**")
      .replace(/sqrt\(/gi, "Math.sqrt(")
      .replace(/sin\(/gi, "Math.sin(")
      .replace(/cos\(/gi, "Math.cos(")
      .replace(/tan\(/gi, "Math.tan(")
      .replace(/log\(/gi, "Math.log10(")
      .replace(/ln\(/gi, "Math.log(")
      .replace(/pi/gi, "Math.PI")
      .replace(/e(?![a-z])/gi, "Math.E")
      .replace(/abs\(/gi, "Math.abs(")
      .replace(/floor\(/gi, "Math.floor(")
      .replace(/ceil\(/gi, "Math.ceil(")
      .replace(/round\(/gi, "Math.round(")
      .replace(/[^0-9+\-*/.()Math\s,]/g, "");

    if (!cleaned.trim()) return { result: "0" };

    // Validate it only contains safe math operations
    if (/[a-z]/i.test(cleaned.replace(/Math\.(sqrt|sin|cos|tan|log10|log|PI|E|abs|floor|ceil|round)/g, ""))) {
      return { result: "Error: Invalid expression" };
    }

    // Use Function constructor (safer than eval, but still sandboxed)
    const fn = new Function("Math", `"use strict"; return (${cleaned})`);
    const result = fn(Math);

    if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
      return { result: "Error" };
    }

    // Format result
    const formatted = Number(result.toPrecision(12)).toString();
    return { result: formatted };
  } catch (err) {
    return { result: "Error: Invalid expression" };
  }
};

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: Date;
}

const MathCalculatorContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { executeWithAccessCheck } = useToolAccess({ toolId: 'calculator' });
  
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const calculate = useCallback(() => {
    if (!expression.trim()) return;
    
    const { result: calcResult } = safeEvaluate(expression);
    setResult(calcResult);
    
    if (!calcResult.startsWith("Error")) {
      setHistory(prev => [
        { expression, result: calcResult, timestamp: new Date() },
        ...prev.slice(0, 49) // Keep last 50 items
      ]);
    }
  }, [expression]);

  const getAiExplanation = async () => {
    if (!expression.trim()) return;
    
    setLoading(true);
    
    try {
      const explanation = await executeWithAccessCheck(
        async () => {
          const { data, error } = await supabase.functions.invoke("lucy-router", {
            body: {
              userId: "anonymous",
              messages: [
                {
                  role: "user",
                  content: `Solve this math problem step by step and explain each step clearly:\n\n${expression}\n\nProvide the final answer and show your work.`
                }
              ]
            }
          });

          if (error) throw error;

          return data?.plan?.finalAnswer || 
            data?.plan?.steps?.[0]?.result || 
            "Unable to generate explanation";
        },
        (reason) => {
          toast({ 
            title: "Access Denied", 
            description: reason,
            variant: "destructive"
          });
        }
      );

      if (explanation) {
        setAiExplanation(explanation);
        toast({ title: "Success", description: "Explanation generated" });
      }
    } catch (err: any) {
      console.error("[MathCalculator] AI Error:", err);
      toast({ 
        title: "Error", 
        description: "Could not generate AI explanation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const insertSymbol = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  const copyResult = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      toast({ title: "Copied", description: "Result copied to clipboard" });
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast({ title: "Cleared", description: "History cleared" });
  };

  const loadFromHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
    setShowHistory(false);
  };

  const scientificButtons = [
    ["sin(", "cos(", "tan(", "sqrt("],
    ["log(", "ln(", "^", "pi"],
    ["(", ")", "abs(", "e"],
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Math Calculator
            </h1>
            <p className="text-sm text-muted-foreground">Scientific calculator with AI step-by-step solutions</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowHistory(!showHistory)}>
            <History className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expression</CardTitle>
                <CardDescription>
                  Enter a math expression. Supports +, -, *, /, ^, sqrt, sin, cos, tan, log, ln, pi, e
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="e.g., sqrt(16) + sin(pi/2) * 2"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && calculate()}
                  className="text-lg font-mono"
                />

                {/* Scientific buttons */}
                <div className="space-y-2">
                  {scientificButtons.map((row, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2">
                      {row.map((btn) => (
                        <Button
                          key={btn}
                          variant="outline"
                          size="sm"
                          onClick={() => insertSymbol(btn)}
                          className="font-mono"
                        >
                          {btn}
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculate} className="flex-1">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate
                  </Button>
                  <Button variant="outline" onClick={() => setExpression("")}>
                    Clear
                  </Button>
                </div>

                {result !== null && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Result:</span>
                      <Button variant="ghost" size="sm" onClick={copyResult}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-3xl font-bold font-mono">{result}</p>
                  </div>
                )}

                <Button 
                  variant="secondary" 
                  onClick={getAiExplanation}
                  disabled={!expression.trim() || loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Get AI Step-by-Step Explanation
                </Button>
              </CardContent>
            </Card>

            {aiExplanation && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Explanation</CardTitle>
                  <CardDescription>Step-by-step solution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{aiExplanation}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History sidebar */}
          <div className={`${showHistory ? "block" : "hidden lg:block"}`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">History</CardTitle>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No calculations yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => loadFromHistory(item)}
                        className="w-full p-2 text-left rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="font-mono text-sm truncate">{item.expression}</p>
                        <p className="font-bold text-primary">{item.result}</p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const MathCalculator = () => {
  return (
    <ToolErrorBoundary toolName="Math Calculator">
      <ToolAccessGuard
        toolId="calculator"
        toolName="Math Calculator"
        toolDescription="Scientific calculator with AI step-by-step solutions"
      >
        <MathCalculatorContent />
      </ToolAccessGuard>
    </ToolErrorBoundary>
  );
};

export default MathCalculator;
