import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BackgroundVideoProps {
  theme: string;
  isPaused: boolean;
  isMuted: boolean;
}

const videoThemes = {
  nature: [
    'https://player.vimeo.com/external/370467553.sd.mp4?s=64f88d5b03dc9d0d13b4d01b1f1b7c6f8f5e8a4a',
    'https://player.vimeo.com/external/396880116.sd.mp4?s=c1d3e8b4e8a2f5d8c4a3b2f1e8d7c6b5a4f3e2d1',
  ],
  rain: [
    'https://player.vimeo.com/external/411380479.sd.mp4?s=7f8e9d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
    'https://player.vimeo.com/external/378434495.sd.mp4?s=8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
  ],
  ocean: [
    'https://player.vimeo.com/external/416562271.sd.mp4?s=9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d',
    'https://player.vimeo.com/external/415289838.sd.mp4?s=0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
  ],
  mountain: [
    'https://player.vimeo.com/external/395919172.sd.mp4?s=1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    'https://player.vimeo.com/external/371433846.sd.mp4?s=2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
  ],
  nightsky: [
    'https://player.vimeo.com/external/438465676.sd.mp4?s=3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    'https://player.vimeo.com/external/401802341.sd.mp4?s=4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  ],
  forest: [
    'https://player.vimeo.com/external/413945641.sd.mp4?s=5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    'https://player.vimeo.com/external/389992087.sd.mp4?s=6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
  ],
  sunset: [
    'https://player.vimeo.com/external/401802341.sd.mp4?s=7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    'https://player.vimeo.com/external/373919482.sd.mp4?s=8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
  ],
};

export function BackgroundVideo({ theme, isPaused, isMuted }: BackgroundVideoProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shuffledVideos, setShuffledVideos] = useState<string[]>([]);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);

  useEffect(() => {
    // Shuffle videos when theme changes
    const videos = videoThemes[theme as keyof typeof videoThemes] || videoThemes.nature;
    const shuffled = [...videos].sort(() => Math.random() - 0.5);
    setShuffledVideos(shuffled);
    setCurrentVideoIndex(0);
  }, [theme]);

  useEffect(() => {
    if (shuffledVideos.length === 0) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        transitionToNextVideo();
      }
    }, Math.random() * 30000 + 60000); // Random between 60-90 seconds

    return () => clearInterval(interval);
  }, [shuffledVideos, currentVideoIndex, isPaused]);

  const transitionToNextVideo = () => {
    setIsTransitioning(true);
    
    const nextIndex = (currentVideoIndex + 1) % shuffledVideos.length;
    const nextVideo = activeVideo === 1 ? videoRef2 : videoRef1;
    
    if (nextVideo.current) {
      nextVideo.current.src = shuffledVideos[nextIndex];
      nextVideo.current.load();
      nextVideo.current.play();
    }

    setTimeout(() => {
      setActiveVideo(activeVideo === 1 ? 2 : 1);
      setCurrentVideoIndex(nextIndex);
      setIsTransitioning(false);
    }, 2000);
  };

  useEffect(() => {
    if (videoRef1.current) {
      videoRef1.current.muted = isMuted;
    }
    if (videoRef2.current) {
      videoRef2.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (isPaused) {
      videoRef1.current?.pause();
      videoRef2.current?.pause();
    } else {
      if (activeVideo === 1) {
        videoRef1.current?.play();
      } else {
        videoRef2.current?.play();
      }
    }
  }, [isPaused, activeVideo]);

  if (shuffledVideos.length === 0) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video Layer 1 */}
      <video
        ref={videoRef1}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${
          activeVideo === 1 ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
      >
        <source src={shuffledVideos[currentVideoIndex]} type="video/mp4" />
      </video>

      {/* Video Layer 2 */}
      <video
        ref={videoRef2}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${
          activeVideo === 2 ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
      >
        <source src={shuffledVideos[(currentVideoIndex + 1) % shuffledVideos.length]} type="video/mp4" />
      </video>

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 backdrop-blur-[2px]" />
      
      {/* Additional dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}