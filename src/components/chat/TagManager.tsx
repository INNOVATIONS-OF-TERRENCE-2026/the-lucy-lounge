import { useState } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagManager({ tags, onTagsChange }: TagManagerProps) {
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    const tag = inputValue.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      setInputValue("");
      setIsAdding(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setInputValue("");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          <TagIcon className="w-3 h-3" />
          {tag}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveTag(tag)}
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!inputValue) setIsAdding(false);
            }}
            placeholder="Tag name..."
            className="h-7 w-32 text-sm"
            autoFocus
          />
          <Button size="sm" onClick={handleAddTag} className="h-7">
            Add
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-3 h-3" />
          Add tag
        </Button>
      )}
    </div>
  );
}