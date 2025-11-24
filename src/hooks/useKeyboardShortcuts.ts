import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onSend?: () => void;
  onSearch?: () => void;
  onFocusInput?: () => void;
}

export const useKeyboardShortcuts = ({
  onSend,
  onSearch,
  onFocusInput
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // Ctrl/Cmd + / for focus input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onFocusInput?.();
        return;
      }

      // Enter to send (only if not in textarea with shift)
      if (e.key === 'Enter' && !e.shiftKey && document.activeElement?.tagName === 'TEXTAREA') {
        const textarea = document.activeElement as HTMLTextAreaElement;
        // Only prevent default and send if it's the chat input
        if (textarea.id === 'chat-input' || textarea.classList.contains('chat-input')) {
          e.preventDefault();
          onSend?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSend, onSearch, onFocusInput]);
};