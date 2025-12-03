import { useRef } from 'react';
import { Plus, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CompactFileUploadProps {
  selectedFiles: File[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export const CompactFileUpload = ({
  selectedFiles,
  onFilesSelected,
  onRemoveFile
}: CompactFileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-3 h-3" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="w-3 h-3" />;
    return <File className="w-3 h-3" />;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Compact Upload Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(
          "h-9 w-9 rounded-full",
          "bg-primary/10 hover:bg-primary/20",
          "border border-primary/30 hover:border-primary/50",
          "transition-all duration-200"
        )}
      >
        <Plus className="h-4 w-4 text-primary" />
      </Button>

      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.md,.json,.csv"
      />

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full",
                "bg-primary/10 border border-primary/20",
                "text-xs text-foreground/80"
              )}
            >
              {getFileIcon(file)}
              <span className="truncate max-w-[60px]">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
