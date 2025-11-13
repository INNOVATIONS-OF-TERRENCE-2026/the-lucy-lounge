import { useState } from "react";
import { Download, FileText, FileJson, FileCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  conversationTitle: string;
}

export function ExportDialog({ open, onOpenChange, conversationId, conversationTitle }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'txt' | 'md' | 'json') => {
    setIsExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-conversation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            format,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lucy-ai-${conversationTitle.replace(/[^a-z0-9]/gi, '-')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Conversation exported as ${format.toUpperCase()}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export conversation",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isExporting}
            onClick={() => handleExport('txt')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as Plain Text (.txt)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isExporting}
            onClick={() => handleExport('md')}
          >
            <FileCode className="w-4 h-4 mr-2" />
            Export as Markdown (.md)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isExporting}
            onClick={() => handleExport('json')}
          >
            <FileJson className="w-4 h-4 mr-2" />
            Export as JSON (.json)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}