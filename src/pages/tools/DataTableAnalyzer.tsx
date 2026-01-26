import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Database, Upload, Loader2, Copy, BarChart2, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ParsedData {
  headers: string[];
  rows: string[][];
  stats: {
    rowCount: number;
    columnCount: number;
    numericColumns: string[];
    textColumns: string[];
  };
}

const DataTableAnalyzer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [csvInput, setCsvInput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const parseCSV = () => {
    if (!csvInput.trim()) {
      toast({ title: "Error", description: "Please enter CSV data", variant: "destructive" });
      return;
    }

    try {
      const lines = csvInput.trim().split("\n");
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ""));
      
      const rows = lines.slice(1).map(line => {
        // Handle quoted values with commas
        const values: string[] = [];
        let current = "";
        let inQuotes = false;
        
        for (const char of line) {
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            values.push(current.trim().replace(/^["']|["']$/g, ""));
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^["']|["']$/g, ""));
        return values;
      }).filter(row => row.some(cell => cell.length > 0));

      // Analyze columns
      const numericColumns: string[] = [];
      const textColumns: string[] = [];

      headers.forEach((header, i) => {
        const values = rows.map(row => row[i] || "").filter(v => v);
        const numericCount = values.filter(v => !isNaN(parseFloat(v))).length;
        
        if (numericCount > values.length * 0.5) {
          numericColumns.push(header);
        } else {
          textColumns.push(header);
        }
      });

      setParsedData({
        headers,
        rows,
        stats: {
          rowCount: rows.length,
          columnCount: headers.length,
          numericColumns,
          textColumns
        }
      });

      toast({ title: "Success", description: `Parsed ${rows.length} rows and ${headers.length} columns` });
    } catch (err: any) {
      console.error("[DataTableAnalyzer] Parse error:", err);
      toast({ title: "Error", description: "Failed to parse data", variant: "destructive" });
    }
  };

  const getAiAnalysis = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    
    try {
      // Build a summary of the data
      const dataSummary = `
Headers: ${parsedData.headers.join(", ")}
Row count: ${parsedData.stats.rowCount}
Numeric columns: ${parsedData.stats.numericColumns.join(", ") || "None"}
Text columns: ${parsedData.stats.textColumns.join(", ") || "None"}

Sample data (first 5 rows):
${parsedData.rows.slice(0, 5).map(row => row.join(" | ")).join("\n")}
      `.trim();

      const { data, error } = await supabase.functions.invoke("lucy-router", {
        body: {
          userId: "anonymous",
          messages: [
            {
              role: "user",
              content: `Analyze this data table and provide insights:\n\n${dataSummary}\n\nProvide:\n1. Summary of what this data represents\n2. Key statistics for numeric columns\n3. Notable patterns or trends\n4. Recommendations for visualization\n5. Data quality observations`
            }
          ]
        }
      });

      if (error) throw error;

      const analysisText = data?.plan?.finalAnswer || 
        data?.plan?.steps?.[0]?.result || 
        "Unable to generate analysis";

      setAnalysis(analysisText);
      toast({ title: "Success", description: "Analysis complete" });
    } catch (err: any) {
      console.error("[DataTableAnalyzer] AI Error:", err);
      toast({ title: "Error", description: "Could not generate analysis", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const calculateColumnStats = (columnIndex: number): { min: number; max: number; avg: number; sum: number } | null => {
    if (!parsedData) return null;
    
    const values = parsedData.rows
      .map(row => parseFloat(row[columnIndex] || ""))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return null;
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      sum: values.reduce((a, b) => a + b, 0)
    };
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard" });
  };

  const loadSample = () => {
    setCsvInput(`Name,Age,City,Salary,Department
John Doe,32,New York,75000,Engineering
Jane Smith,28,San Francisco,82000,Marketing
Bob Johnson,45,Chicago,95000,Engineering
Alice Brown,35,Boston,78000,Sales
Charlie Wilson,29,Seattle,71000,Marketing
Diana Lee,41,Los Angeles,88000,Engineering
Eve Davis,33,Denver,73000,Sales
Frank Miller,38,Austin,91000,Engineering`);
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
              <Database className="h-6 w-6 text-primary" />
              Data Table Analyzer
            </h1>
            <p className="text-sm text-muted-foreground">Analyze CSV data with AI insights</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
            <CardDescription>Paste CSV or tab-delimited data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm">Delimiter:</label>
                <Input
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value || ",")}
                  className="w-16"
                  maxLength={1}
                />
              </div>
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample
              </Button>
            </div>
            
            <Textarea
              placeholder="Name,Age,City&#10;John,30,NYC&#10;Jane,25,LA"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />

            <Button onClick={parseCSV} className="w-full">
              <TableIcon className="h-4 w-4 mr-2" />
              Parse Data
            </Button>
          </CardContent>
        </Card>

        {parsedData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  {parsedData.stats.rowCount} rows × {parsedData.stats.columnCount} columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsedData.headers.map((header, i) => (
                          <TableHead key={i} className="font-bold">
                            {header}
                            {parsedData.stats.numericColumns.includes(header) && (
                              <span className="ml-1 text-xs text-muted-foreground">(#)</span>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.rows.slice(0, 20).map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => (
                            <TableCell key={j} className="font-mono text-sm">
                              {cell || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {parsedData.rows.length > 20 && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Showing first 20 of {parsedData.rows.length} rows
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {parsedData.stats.numericColumns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Column Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parsedData.stats.numericColumns.map((col) => {
                      const colIndex = parsedData.headers.indexOf(col);
                      const stats = calculateColumnStats(colIndex);
                      if (!stats) return null;
                      
                      return (
                        <div key={col} className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">{col}</h4>
                          <div className="space-y-1 text-sm">
                            <p>Min: <span className="font-mono">{stats.min.toFixed(2)}</span></p>
                            <p>Max: <span className="font-mono">{stats.max.toFixed(2)}</span></p>
                            <p>Avg: <span className="font-mono">{stats.avg.toFixed(2)}</span></p>
                            <p>Sum: <span className="font-mono">{stats.sum.toFixed(2)}</span></p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>AI Analysis</CardTitle>
                  <CardDescription>Get insights about your data</CardDescription>
                </div>
                {analysis && (
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysis)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{analysis}</pre>
                  </div>
                ) : (
                  <Button onClick={getAiAnalysis} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Generate AI Analysis
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default DataTableAnalyzer;
