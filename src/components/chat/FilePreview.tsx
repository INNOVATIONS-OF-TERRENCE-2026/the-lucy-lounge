import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
}

interface FilePreviewProps {
  attachments: Attachment[];
}

export function FilePreview({ attachments }: FilePreviewProps) {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getPublicUrl = (filePath: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/attachments/${filePath}`;
  };

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => {
        const isImage = attachment.file_type.startsWith('image/');
        const isVideo = attachment.file_type.startsWith('video/');
        const isAudio = attachment.file_type.startsWith('audio/');
        const publicUrl = getPublicUrl(attachment.file_path);

        if (isImage) {
          return (
            <div key={attachment.id} className="group relative">
              <img
                src={publicUrl}
                alt={attachment.file_name}
                className="max-w-md rounded-lg border border-border"
              />
              <a
                href={publicUrl}
                download={attachment.file_name}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Button size="sm" variant="secondary">
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            </div>
          );
        }

        if (isVideo) {
          return (
            <div key={attachment.id} className="group relative max-w-md">
              <video
                src={publicUrl}
                controls
                className="w-full rounded-lg border border-border"
              />
              <a
                href={publicUrl}
                download={attachment.file_name}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Button size="sm" variant="secondary">
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            </div>
          );
        }

        if (isAudio) {
          return (
            <div key={attachment.id} className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-lg border border-border">
              <div className="flex-1">
                <audio src={publicUrl} controls className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">{attachment.file_name} - {formatFileSize(attachment.file_size)}</p>
              </div>
              <a href={publicUrl} download={attachment.file_name}>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            </div>
          );
        }

        return (
          <a
            key={attachment.id}
            href={publicUrl}
            download={attachment.file_name}
            className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <FileText className="w-5 h-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.file_name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
            </div>
            <Download className="w-4 h-4 text-muted-foreground" />
          </a>
        );
      })}
    </div>
  );
}