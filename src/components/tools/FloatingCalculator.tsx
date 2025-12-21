import { useState, useRef, useEffect, useCallback } from 'react';
import { Calculator, X, Minus, Copy, RotateCcw, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Safe math evaluation without eval
const safeEvaluate = (expression: string): string => {
  try {
    // Clean the expression
    const cleaned = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[^0-9+\-*/.() ]/g, '');

    if (!cleaned) return '0';

    // Tokenize
    const tokens: (number | string)[] = [];
    let num = '';

    for (const char of cleaned) {
      if (/[0-9.]/.test(char)) {
        num += char;
      } else if (char === '-' && (tokens.length === 0 || typeof tokens[tokens.length - 1] === 'string')) {
        num += char;
      } else {
        if (num) {
          tokens.push(parseFloat(num));
          num = '';
        }
        if (/[+\-*/]/.test(char)) {
          tokens.push(char);
        }
      }
    }
    if (num) tokens.push(parseFloat(num));

    // Shunting-yard algorithm for proper precedence
    const output: number[] = [];
    const operators: string[] = [];
    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

    const applyOp = () => {
      const op = operators.pop()!;
      const b = output.pop()!;
      const a = output.pop()!;
      switch (op) {
        case '+': output.push(a + b); break;
        case '-': output.push(a - b); break;
        case '*': output.push(a * b); break;
        case '/': output.push(b !== 0 ? a / b : NaN); break;
      }
    };

    for (const token of tokens) {
      if (typeof token === 'number') {
        output.push(token);
      } else {
        while (
          operators.length &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          applyOp();
        }
        operators.push(token);
      }
    }

    while (operators.length) applyOp();

    const result = output[0];
    if (isNaN(result) || !isFinite(result)) return 'Error';
    
    // Format result to avoid floating point display issues
    return Number(result.toPrecision(12)).toString();
  } catch {
    return 'Error';
  }
};

export const FloatingCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  const handleButton = useCallback((btn: string) => {
    switch (btn) {
      case 'C':
        setExpression('');
        setResult('0');
        break;
      case '±':
        if (expression.startsWith('-')) {
          setExpression(expression.slice(1));
        } else if (expression) {
          setExpression('-' + expression);
        }
        break;
      case '%':
        if (expression) {
          const val = safeEvaluate(expression);
          if (val !== 'Error') {
            setExpression((parseFloat(val) / 100).toString());
            setResult((parseFloat(val) / 100).toString());
          }
        }
        break;
      case '⌫':
        setExpression(expression.slice(0, -1));
        break;
      case '=':
        const res = safeEvaluate(expression);
        setResult(res);
        if (res !== 'Error') setExpression(res);
        break;
      default:
        const newExpr = expression + btn;
        setExpression(newExpr);
        // Live preview for simple expressions
        if (!/[+\-×÷]$/.test(newExpr)) {
          const preview = safeEvaluate(newExpr);
          if (preview !== 'Error') setResult(preview);
        }
    }
  }, [expression]);

  // Keyboard support
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleButton(e.key);
      } else if (e.key === '.') {
        handleButton('.');
      } else if (e.key === '+') {
        handleButton('+');
      } else if (e.key === '-') {
        handleButton('-');
      } else if (e.key === '*') {
        handleButton('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleButton('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleButton('=');
      } else if (e.key === 'Backspace') {
        handleButton('⌫');
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'c' || e.key === 'C') {
        handleButton('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, handleButton]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;
      
      // Position from bottom-right
      setPosition({
        x: Math.max(0, dragRef.current.startPosX - deltaX),
        y: Math.max(0, dragRef.current.startPosY - deltaY),
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[9999] w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Open Calculator"
      >
        <Calculator className="w-6 h-6" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={{ right: position.x, bottom: position.y }}
        className="fixed z-[9999] bg-card border border-border rounded-lg shadow-xl p-2 flex items-center gap-2"
      >
        <div
          className="cursor-move p-1"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-mono min-w-[60px]">{result}</span>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsMinimized(false)}>
          <Calculator className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ right: position.x, bottom: position.y }}
      className="fixed z-[9999] w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-muted/50 cursor-move select-none"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Calculator</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsMinimized(true)}>
            <Minus className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Display */}
      <div className="p-4 bg-muted/30">
        <div className="text-right text-sm text-muted-foreground h-5 overflow-hidden">
          {expression || ' '}
        </div>
        <div className="text-right text-3xl font-semibold font-mono truncate">
          {result}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 px-2 py-1 bg-muted/20">
        <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={copyResult}>
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={() => { setExpression(''); setResult('0'); }}>
          <RotateCcw className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Buttons */}
      <div className="p-2 grid gap-1">
        {buttons.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-1">
            {row.map((btn) => (
              <Button
                key={btn}
                variant={btn === '=' ? 'default' : ['÷', '×', '-', '+'].includes(btn) ? 'secondary' : 'outline'}
                className={`h-12 text-lg font-medium ${btn === '0' ? '' : ''}`}
                onClick={() => handleButton(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
