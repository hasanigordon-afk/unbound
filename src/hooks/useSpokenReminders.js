import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  EVENT_TYPES,
  fetchNotificationPref,
  isSpeechSupported,
  isSpeaking,
  speakCelebration,
  speakText,
} from '@/lib/spokenReminders';

export function useSpokenReminders(userEmail) {
  const { data: pref, isLoading } = useQuery({
    queryKey: ['notification-pref', userEmail],
    queryFn: () => fetchNotificationPref(userEmail),
    enabled: !!userEmail,
    staleTime: 60_000,
  });

  const [supported] = useState(() => isSpeechSupported());
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSpeaking(isSpeaking()), 300);
    return () => clearInterval(timer);
  }, []);

  const speakEvent = useCallback(async ({ eventType, eventKey, text, force = false }) => {
    if (!supported) return { ok: false, reason: 'unsupported' };
    setSpeaking(true);
    const result = await speakCelebration({
      userEmail,
      pref,
      eventType,
      eventKey,
      text,
      force,
    });
    setSpeaking(false);
    return result;
  }, [pref, supported, userEmail]);

  const previewVoice = useCallback(async (text, gender) => {
    if (!supported) return { ok: false, reason: 'unsupported' };
    setSpeaking(true);
    const result = await speakText(text, { gender: gender || pref?.voice_gender || 'female' });
    setSpeaking(false);
    return result;
  }, [pref?.voice_gender, supported]);

  return {
    pref,
    isLoading,
    supported,
    speaking,
    speakEvent,
    previewVoice,
    EVENT_TYPES,
  };
}

export default useSpokenReminders;
