import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Calculator, Image, Code, Globe, Database, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const InternalTools = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callLucyRouter = async (tool: string, userPrompt: string) => {
    setLoading(true);
    setResult('');

    try {
      const { data, error } = await supabase.functions.invoke('lucy-router', {
        body: {
          userId: 'anonymous',
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        }
      });

      if (error) throw error;

      if (data?.plan?.finalAnswer) {
        setResult(data.plan.finalAnswer);
      } else if (data?.plan?.steps && data.plan.steps.length > 0) {
        const stepResults = data.plan.steps.map((step: any) => 
          `Step ${step.stepNumber} (${step.tool}):\n${JSON.stringify(step.result, null, 2)}`
        ).join('\n\n');
        setResult(stepResults);
      } else {
        setResult('Tool executed but no result returned.');
      }

      toast({
        title: 'Success',
        description: 'Tool executed successfully'
      });
    } catch (error: any) {
      console.error('[InternalTools] Error:', error);
      toast({
        title: 'Tool execution failed',
        description: error.message || 'Unknown error',
        variant: 'destructive'
      });
      setResult(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateExpression = () => {
    callLucyRouter('code_exec', `Calculate this expression: ${input}`);
  };

  const analyzeData = () => {
    callLucyRouter('memory_search', `Analyze this CSV data: ${input}`);
  };

  const cleanHTML = () => {
    callLucyRouter('browser_fetch', `Extract text from this HTML: ${input}`);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Code className="w-6 h-6" />
        Lucy Tools (Internal)
      </h2>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="calculator">
            <Calculator className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Calc</span>
          </TabsTrigger>
          <TabsTrigger value="pdf">
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="html">
            <Globe className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">HTML</span>
          </TabsTrigger>
          <TabsTrigger value="image">
            <Image className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Image</span>
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Textarea
            placeholder="Enter math expression (e.g., 2 + 2 * 3)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            disabled={loading}
          />
          <Button onClick={calculateExpression} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Calculate
          </Button>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            PDF analysis is integrated directly in the chat. Upload PDFs in conversation for AI analysis using lucy-router.
          </p>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Textarea
            placeholder="Paste CSV data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            disabled={loading}
          />
          <Button onClick={analyzeData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Analyze Data
          </Button>
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <Textarea
            placeholder="Paste HTML to extract text..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            disabled={loading}
          />
          <Button onClick={cleanHTML} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Clean HTML
          </Button>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Image analysis is integrated directly in the chat. Upload images in conversation for AI analysis.
          </p>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Code execution is available through the Code Executor tool in conversations.
          </p>
        </TabsContent>
      </Tabs>

      {result && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </Card>
  );
};
