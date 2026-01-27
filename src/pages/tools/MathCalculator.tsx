/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MATH CALCULATOR TOOL                                     │
 * │                                                                             │
 * │ Secure math expression evaluator with step-by-step solutions               │
 * │                                                                             │
 * │ Lucy does the math.                                                        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Loader2, 
  Copy, 
  History,
  Equal,
  Plus,
  Minus,
  X,
  Divide,
  Percent,
  Delete,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';

// =============================================================================
// COMPONENT
// =============================================================================

const MathCalculator = () => {
  return (
    <ToolLayout
      toolId="calculator"
      toolName="Math Calculator"
      toolDescription="Solve expressions with step-by-step solutions"
      toolIcon={<Calculator className="w-5 h-5 text-primary" />}
      defaultModel="gpt-4o-mini"
      showModelSelector={false}
      showHistory={true}
      enableStreaming={false}
    >
      {(props) => <CalculatorContent {...props} />}
    </ToolLayout>
  );
};

interface CalculatorContentProps {
  execute: <T>(input: Record<string, unknown>, processor?: (data: unknown) => T) => Promise<T | null>;
  isExecuting: boolean;
  result: any;
  error: string | null;
  copyToClipboard: (text: string) => void;
  history: any[];
}

function CalculatorContent({ 
  execute, 
  isExecuting, 
  result, 
  error,
  copyToClipboard,
  history
}: CalculatorContentProps) {
  const [expression, setExpression] = useState('');
  const [showSteps, setShowSteps] = useState(true);

  const handleCalculate = async () => {
    if (!expression.trim()) return;
    await execute({ expression, showSteps });
  };

  const appendToExpression = (value: string) => {
    setExpression(prev => prev + value);
  };

  const clearExpression = () => {
    setExpression('');
  };

  const backspace = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const calcResult = result?.outputJson?.result || result?.output;
  const steps = result?.outputJson?.steps || [];
  const isValid = result?.outputJson?.isValid !== false;
  const errorMessage = result?.outputJson?.errorMessage;

  const buttons = [
    { label: 'C', action: clearExpression, variant: 'destructive' as const },
    { label: '(', action: () => appendToExpression('(') },
    { label: ')', action: () => appendToExpression(')') },
    { label: '÷', action: () => appendToExpression('/') },
    { label: '7', action: () => appendToExpression('7') },
    { label: '8', action: () => appendToExpression('8') },
    { label: '9', action: () => appendToExpression('9') },
    { label: '×', action: () => appendToExpression('*') },
    { label: '4', action: () => appendToExpression('4') },
    { label: '5', action: () => appendToExpression('5') },
    { label: '6', action: () => appendToExpression('6') },
    { label: '-', action: () => appendToExpression('-') },
    { label: '1', action: () => appendToExpression('1') },
    { label: '2', action: () => appendToExpression('2') },
    { label: '3', action: () => appendToExpression('3') },
    { label: '+', action: () => appendToExpression('+') },
    { label: '0', action: () => appendToExpression('0'), span: true },
    { label: '.', action: () => appendToExpression('.') },
    { label: '=', action: handleCalculate, variant: 'default' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
            <CardDescription>
              Enter a mathematical expression to evaluate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display */}
            <div className="bg-muted rounded-lg p-4">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter expression..."
                className="text-2xl font-mono text-right bg-transparent border-none focus-visible:ring-0 h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
              {calcResult && isValid && (
                <div className="text-right text-3xl font-bold text-primary mt-2">
                  = {calcResult}
                </div>
              )}
              {errorMessage && (
                <div className="text-right text-sm text-destructive mt-2">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2">
              {buttons.map((btn, i) => (
                <Button
                  key={i}
                  variant={btn.variant || 'outline'}
                  className={`h-14 text-lg ${btn.span ? 'col-span-2' : ''}`}
                  onClick={btn.action}
                  disabled={isExecuting}
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {/* Advanced Operations */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => appendToExpression('^')}>
                x^y
              </Button>
              <Button variant="outline" size="sm" onClick={() => appendToExpression('%')}>
                %
              </Button>
              <Button variant="outline" size="sm" onClick={backspace}>
                <Delete className="w-4 h-4" />
              </Button>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-steps"
                  checked={showSteps}
                  onCheckedChange={setShowSteps}
                />
                <Label htmlFor="show-steps">Show steps</Label>
              </div>
              {calcResult && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(calcResult)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Result
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Steps & History */}
        <div className="space-y-6">
          {/* Steps */}
          {steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Equal className="w-5 h-5 text-primary" />
                    Solution Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {steps.map((step: { step: number; description: string; value: string }, i: number) => (
                      <div 
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <Badge variant="outline" className="mt-0.5">
                          {step.step}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">
                            {step.description}
                          </div>
                          <div className="font-mono font-medium">
                            {step.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Calculations */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.slice(0, 10).map((run, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => setExpression(run.inputData?.expression || '')}
                    >
                      <span className="font-mono text-sm">
                        {run.inputData?.expression}
                      </span>
                      <span className="font-mono text-sm text-primary">
                        = {run.output || run.outputJson?.result}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Features */}
      {!calcResult && history.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Calculator className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Basic Operations</h3>
              <p className="text-sm text-muted-foreground">
                Addition, subtraction, multiplication, division
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Equal className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Step-by-Step</h3>
              <p className="text-sm text-muted-foreground">
                See how each calculation is performed
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <History className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">History</h3>
              <p className="text-sm text-muted-foreground">
                All calculations saved for reference
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MathCalculator;
