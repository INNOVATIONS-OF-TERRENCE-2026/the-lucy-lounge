import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToBottomProps {
  visible: boolean;
  onClick: () => void;
  newMessageCount?: number;
}

export const ScrollToBottom = ({ visible, onClick, newMessageCount }: ScrollToBottomProps) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-8 z-40 animate-scale-in">
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          'h-12 rounded-full glass-card-enhanced shadow-glow-violet',
          'border-2 border-primary/40 hover:border-primary/60',
          'hover:scale-110 transition-all duration-300',
          'flex items-center gap-2'
        )}
      >
        <ArrowDown className="w-5 h-5" />
        {newMessageCount && newMessageCount > 0 ? (
          <span className="text-sm font-semibold">
            {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-sm font-semibold">Latest</span>
        )}
      </Button>
    </div>
  );
};