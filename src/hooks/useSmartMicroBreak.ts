import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, PrivacyStorageService } from '../services/privacyStorage';

interface UseSmartMicroBreakOptions {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  inactivityThresholdSeconds?: number; // default: 180s (3 minutes of active browsing without workout)
  cooldownSeconds?: number; // default: 300s (5 minutes between prompts)
}

export function useSmartMicroBreak({
  appState,
  onUpdateState,
  inactivityThresholdSeconds = 180,
  cooldownSeconds = 300
}: UseSmartMicroBreakOptions) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const activeTimeRef = useRef<number>(0);
  const lastPromptTimeRef = useRef<number>(Date.now());
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Check initial notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        return perm;
      } catch (err) {
        console.warn('Error requesting notification permission:', err);
      }
    }
    return 'default';
  }, []);

  // Send browser PWA system notification
  const sendBrowserNotification = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('🔔 Czas na 30-sekundową Mikro-Przerwę Szyi!', {
          body: 'Wykryto dłuższą aktywność w aplikacji bez sesji treningowej. Cofnij brodę (Chin Tuck), aby natychmiast odciążyć krążki C5-C7!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'micro-break-reminder'
        });

        notification.onclick = () => {
          window.focus();
          setIsModalOpen(true);
          notification.close();
        };
      } catch (e) {
        console.warn('Could not dispatch browser notification:', e);
      }
    }
  }, []);

  // Trigger microbreak modal and notify
  const triggerMicroBreak = useCallback(() => {
    setIsModalOpen(true);
    sendBrowserNotification();
    lastPromptTimeRef.current = Date.now();
    activeTimeRef.current = 0;
  }, [sendBrowserNotification]);

  // Track user activity events
  useEffect(() => {
    const handleUserActivity = () => {
      lastInteractionTimeRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(ev => window.addEventListener(ev, handleUserActivity, { passive: true }));

    // Heartbeat check every 5 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastInteraction = (now - lastInteractionTimeRef.current) / 1000;
      const timeSinceLastPrompt = (now - lastPromptTimeRef.current) / 1000;

      // User was active in the last 15 seconds
      if (timeSinceLastInteraction < 15) {
        activeTimeRef.current += 5;
      }

      // If active browsing time reached threshold AND cooldown passed AND modal not already open
      if (
        activeTimeRef.current >= inactivityThresholdSeconds &&
        timeSinceLastPrompt >= cooldownSeconds &&
        !isModalOpen
      ) {
        triggerMicroBreak();
      }
    }, 5000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleUserActivity));
      clearInterval(interval);
    };
  }, [inactivityThresholdSeconds, cooldownSeconds, isModalOpen, triggerMicroBreak]);

  // Completion handler
  const handleCompleteMicroBreak = useCallback(() => {
    const currentCount = appState.profile.completedMicroBreaksCount || 0;
    const updatedCount = currentCount + 1;

    // Check if "tech-neck-slayer" challenge should be marked unlocked (e.g. 10 breaks)
    const existingBadges = appState.profile.weeklyChallengesCompleted || [];
    const newBadges = [...existingBadges];
    if (updatedCount >= 10 && !newBadges.includes('tech-neck-slayer')) {
      newBadges.push('tech-neck-slayer');
    }

    const updatedState: AppState = {
      ...appState,
      profile: {
        ...appState.profile,
        completedMicroBreaksCount: updatedCount,
        weeklyChallengesCompleted: newBadges
      },
      reminders: {
        ...appState.reminders,
        totalMicroBreaksCompleted: updatedCount,
        lastMicroBreakCompletedAt: new Date().toISOString()
      }
    };

    onUpdateState(updatedState);
    PrivacyStorageService.saveState(updatedState);
  }, [appState, onUpdateState]);

  return {
    isMicroBreakModalOpen: isModalOpen,
    openMicroBreakModal: () => setIsModalOpen(true),
    closeMicroBreakModal: () => setIsModalOpen(false),
    completeMicroBreak: handleCompleteMicroBreak,
    notificationPermission,
    requestPermission,
    triggerManualMicroBreak: triggerMicroBreak
  };
}
