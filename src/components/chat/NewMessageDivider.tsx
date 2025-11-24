import { Separator } from '@/components/ui/separator';

export const NewMessageDivider = () => {
  return (
    <div className="flex items-center gap-4 my-6">
      <Separator className="flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent h-0.5" />
      <div className="px-4 py-1 rounded-full glass-card-enhanced border border-primary/30 shadow-glow-violet">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          New Messages
        </span>
      </div>
      <Separator className="flex-1 bg-gradient-to-r from-primary/40 via-transparent to-transparent h-0.5" />
    </div>
  );
};