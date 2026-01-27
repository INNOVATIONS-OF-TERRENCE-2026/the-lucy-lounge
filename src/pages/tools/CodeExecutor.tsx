/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — CODE EXECUTOR TOOL                                       │
 * │                                                                             │
 * │ Secure JavaScript/TypeScript execution in isolated sandbox                 │
 * │                                                                             │
 * │ Lucy runs your code safely.                                                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Play, 
  Loader2, 
  Copy, 
  Terminal,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolLayout } from '@/components/tools/ToolLayout';

// =============================================================================
// COMPONENT
// =============================================================================

const CodeExecutor = () => {
  return (
    <ToolLayout
      toolId="code-executor"
      toolName="Code Executor"
      toolDescription="Run JavaScript/TypeScript in a secure sandbox"
      toolIcon={<Code className="w-5 h-5 text-primary" />}
      defaultModel="gpt-4o-mini"
      showModelSelector={false}
      showHistory={true}
      enableStreaming={false}
    >
      {(props) => <ExecutorContent {...props} />}
    </ToolLayout>
  );
};

interface ExecutorContentProps {
  execute: <T>(input: Record<string, unknown>, processor?: (data: unknown) => T) => Promise<T | null>;
  isExecuting: boolean;
  result: any;
  error: string | null;
  copyToClipboard: (text: string) => void;
}

const CODE_EXAMPLES = [
  {
    name: 'Hello World',
    code: `console.log("Hello, Lucy!");
return "Hello from the sandbox!";`,
  },
  {
    name: 'Fibonacci',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}
console.log("Fibonacci sequence:", results);
return results;`,
  },
  {
    name: 'Array Operations',
    code: `const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);

const filtered = numbers.filter(n => n > 2);
console.log("Filtered (>2):", filtered);

return { doubled, sum, filtered };`,
  },
  {
    name: 'Object Manipulation',
    code: `const user = {
  name: "Lucy",
  age: 25,
  skills: ["AI", "Chat", "Music"]
};

const enhanced = {
  ...user,
  level: "Expert",
  greeting: \`Hello, I'm \${user.name}!\`
};

console.log("Enhanced user:", enhanced);
return enhanced;`,
  },
];

function ExecutorContent({ 
  execute, 
  isExecuting, 
  result, 
  error,
  copyToClipboard 
}: ExecutorContentProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'typescript'>('javascript');
  const [timeout, setTimeout] = useState(5000);

  const handleExecute = async () => {
    if (!code.trim()) return;
    await execute({ code, language, timeout });
  };

  const loadExample = (example: typeof CODE_EXAMPLES[0]) => {
    setCode(example.code);
  };

  const output = result?.outputJson?.output || result?.output;
  const logs = result?.outputJson?.logs || [];
  const execError = result?.outputJson?.error;
  const executionTime = result?.outputJson?.executionTime;

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          Code runs in an isolated sandbox with no access to DOM, network, or storage.
          Maximum execution time: {timeout / 1000} seconds.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Code Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={(v) => setLanguage(v as 'javascript' | 'typescript')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription>
              Write your code below and click Run to execute
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your code here..."
              className="font-mono text-sm min-h-[300px] resize-none"
              spellCheck={false}
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  onClick={handleExecute} 
                  disabled={isExecuting || !code.trim()}
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCode('')}
                  disabled={isExecuting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
              {executionTime !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(executionTime)}ms
                </Badge>
              )}
            </div>

            {/* Examples */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Examples</h4>
              <div className="flex flex-wrap gap-2">
                {CODE_EXAMPLES.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample(example)}
                    disabled={isExecuting}
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="console">
              <TabsList>
                <TabsTrigger value="console">Console</TabsTrigger>
                <TabsTrigger value="result">Return Value</TabsTrigger>
              </TabsList>

              <TabsContent value="console" className="mt-4">
                <div className="bg-[#1e1e1e] rounded-lg p-4 min-h-[300px] font-mono text-sm">
                  {logs.length === 0 && !execError ? (
                    <span className="text-gray-500">// Console output will appear here...</span>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log: string, i: number) => (
                        <div 
                          key={i} 
                          className={`${
                            log.startsWith('[ERROR]') ? 'text-red-400' :
                            log.startsWith('[WARN]') ? 'text-yellow-400' :
                            log.startsWith('[INFO]') ? 'text-blue-400' :
                            'text-gray-300'
                          }`}
                        >
                          {log}
                        </div>
                      ))}
                      {execError && (
                        <div className="text-red-400 mt-2">
                          Error: {execError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="result" className="mt-4">
                <div className="bg-[#1e1e1e] rounded-lg p-4 min-h-[300px] font-mono text-sm">
                  {output ? (
                    <div className="text-green-400">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-gray-400">Return value:</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-gray-300">
                        {typeof output === 'object' ? JSON.stringify(output, null, 2) : output}
                      </pre>
                    </div>
                  ) : execError ? (
                    <div className="text-red-400">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      {execError}
                    </div>
                  ) : (
                    <span className="text-gray-500">// Return value will appear here...</span>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {(output || logs.length > 0) && (
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(logs.join('\n'))}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Logs
                </Button>
                {output && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(typeof output === 'object' ? JSON.stringify(output, null, 2) : output)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      {!output && logs.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Code className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">JS/TS Support</h3>
              <p className="text-sm text-muted-foreground">
                Run JavaScript or TypeScript code
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <AlertTriangle className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Sandboxed</h3>
              <p className="text-sm text-muted-foreground">
                Isolated execution with no external access
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Terminal className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Console Output</h3>
              <p className="text-sm text-muted-foreground">
                See logs and return values in real-time
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CodeExecutor;
