import { useState } from 'react';
import { EnhancedBackgroundVideo } from './EnhancedBackgroundVideo';
import { EnvironmentalEffects } from './EnvironmentalEffects';
import { ChatActivityOverlay } from './ChatActivityOverlay';
import { ParallaxLayer } from './ParallaxLayer';
import { useChatActivitySync } from '@/hooks/useChatActivitySync';

interface UltraRealisticBackgroundManagerProps {
  theme: string;
  isPaused: boolean;
  isMuted: boolean;
  audioEnabled: boolean;
  audioVolume: number;
  performanceQuality: 'low' | 'medium' | 'high' | 'ultra';
  parallaxIntensity: number;
  effectsEnabled: boolean;
}

export const UltraRealisticBackgroundManager = ({
  theme,
  isPaused,
  isMuted,
  audioEnabled,
  audioVolume,
  performanceQuality,
  parallaxIntensity,
  effectsEnabled,
}: UltraRealisticBackgroundManagerProps) => {
  const { activity, triggerTyping, triggerNewMessage } = useChatActivitySync();

  // Expose activity triggers globally for chat integration
  if (typeof window !== 'undefined') {
    (window as any).lucyActivitySync = {
      triggerTyping,
      triggerNewMessage,
    };
  }

  return (
    <>
      <ParallaxLayer
        intensity={parallaxIntensity}
        activityLevel={activity.activityLevel}
      >
        <EnhancedBackgroundVideo
          theme={theme}
          isPaused={isPaused}
          isMuted={isMuted}
          quality={performanceQuality}
        />
      </ParallaxLayer>

      {effectsEnabled && (
        <EnvironmentalEffects
          theme={theme}
          intensity={performanceQuality === 'low' ? 0.5 : performanceQuality === 'medium' ? 0.75 : 1.0}
          enabled={!isPaused}
        />
      )}

      {/* Audio now handled by GlobalSpotifyAudioHost */}

      <ChatActivityOverlay
        isTyping={activity.isTyping}
        hasNewMessage={activity.hasNewMessage}
        intensity={0.5}
      />
    </>
  );
};
