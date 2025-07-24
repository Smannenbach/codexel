import { useCallback, useRef } from 'react';
import { audioManager } from '@/services/AudioManager';

export function useAudioFeedback() {
  const lastClickTime = useRef(0);
  const clickThrottleMs = 100; // Prevent rapid-fire button clicks from creating audio chaos

  const playButtonClick = useCallback((element?: HTMLElement) => {
    const now = Date.now();
    if (now - lastClickTime.current > clickThrottleMs) {
      audioManager.playButtonClick(element);
      lastClickTime.current = now;
    }
  }, []);

  const playPanelResize = useCallback((panelIndex: number) => {
    audioManager.playPanelResize(panelIndex);
  }, []);

  const playSnapToGrid = useCallback((position: { x: number; y: number }) => {
    audioManager.playSnapToGrid(position);
  }, []);

  const playSuccess = useCallback(() => {
    audioManager.playSuccess();
  }, []);

  const playError = useCallback(() => {
    audioManager.playError();
  }, []);

  const playNotification = useCallback(() => {
    audioManager.playNotification();
  }, []);

  const playMessageSend = useCallback(() => {
    audioManager.playMessageSend();
  }, []);

  const playMessageReceive = useCallback(() => {
    audioManager.playMessageReceive();
  }, []);

  const playAgentActivated = useCallback((agentType: string) => {
    audioManager.playAgentActivated(agentType);
  }, []);

  const playAgentCompleted = useCallback((agentType: string) => {
    audioManager.playAgentCompleted(agentType);
  }, []);

  return {
    playButtonClick,
    playPanelResize,
    playSnapToGrid,
    playSuccess,
    playError,
    playNotification,
    playMessageSend,
    playMessageReceive,
    playAgentActivated,
    playAgentCompleted,
  };
}