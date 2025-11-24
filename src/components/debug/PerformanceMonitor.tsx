import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

export const PerformanceMonitor = () => {
  const [show, setShow] = useState(false);
  const { fps, isLowPerformance } = usePerformanceOptimization();

  useEffect(() => {
    // Show in development or when pressing Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShow(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-lg border border-white/20 rounded-lg p-3 text-xs font-mono">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-accent" />
        <span className="text-white font-bold">Performance</span>
      </div>
      <div className="space-y-1">
        <div className={`flex justify-between gap-4 ${isLowPerformance ? 'text-red-400' : 'text-green-400'}`}>
          <span>FPS:</span>
          <span className="font-bold">{fps}</span>
        </div>
        <div className="flex justify-between gap-4 text-white/70">
          <span>Status:</span>
          <span className={isLowPerformance ? 'text-yellow-400' : 'text-green-400'}>
            {isLowPerformance ? 'Optimized' : 'Normal'}
          </span>
        </div>
      </div>
      <div className="mt-2 text-white/50 text-[10px]">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};
