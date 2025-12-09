import { useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InlineFileUploadProps {
  selectedFiles: File[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function InlineFileUpload({ selectedFiles, onFilesSelected, onRemoveFile }: InlineFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndAddFiles(files);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const maxFiles = 10;

    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="h-10 w-10 p-0 rounded-full hover:bg-primary/20 transition-colors flex-shrink-0"
        title="Upload files (images, audio, video, PDFs)"
      >
        <Plus className="w-5 h-5 text-primary" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.txt,.md,.docx,.js,.ts,.tsx,.jsx,.html,.css,.json,.csv"
      />
    </>
  );
}
