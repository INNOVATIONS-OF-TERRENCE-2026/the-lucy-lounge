import { useState, useEffect, RefObject } from 'react';

export const useScrollDetection = (scrollRef: RefObject<HTMLDivElement>) => {
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Consider "near bottom" if within 100px
      const nearBottom = distanceFromBottom < 100;
      setIsNearBottom(nearBottom);
      
      // Show scroll button if scrolled up more than 200px
      setShowScrollButton(distanceFromBottom > 200);
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollRef]);

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  return { isNearBottom, showScrollButton, scrollToBottom };
};