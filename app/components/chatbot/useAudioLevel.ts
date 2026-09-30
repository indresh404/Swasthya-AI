// components/chatbot/useAudioLevel.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

export function useAudioLevel(isActive: boolean = false) {
  const levelRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const [level, setLevel] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (typeof cancelAnimationFrame !== 'undefined' && rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      try {
        ctxRef.current.close();
      } catch (e) {
        // ignore
      }
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {
        // ignore
      }
    }
    ctxRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
      try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (!AudioContextClass) {
          throw new Error('AudioContext not supported');
        }
        const ctx = new AudioContextClass();
        ctxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            sum += data[i];
          }
          const avg = sum / data.length;
          const norm = Math.min(1, Math.max(0, (avg - 14) / 75));
          levelRef.current += (norm - levelRef.current) * 0.18;
          setLevel(levelRef.current);
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
        setReady(true);
      } catch (err: any) {
        setError(err.message || 'Microphone error');
      }
    } else {
      // Fallback for native or when mic stream is not directly accessed
      setReady(true);
    }
  }, [stop]);

  // Synthetic subtle breathing level when active (e.g. mobile or speaking state)
  useEffect(() => {
    if (!ready && isActive) {
      let animFrame = 0;
      let phase = 0;
      const simulateLevel = () => {
        phase += 0.06;
        const base = 0.2 + 0.25 * Math.sin(phase) + 0.1 * Math.sin(phase * 2.3);
        const norm = Math.max(0.05, Math.min(0.9, base));
        levelRef.current += (norm - levelRef.current) * 0.15;
        setLevel(levelRef.current);
        animFrame = requestAnimationFrame(simulateLevel);
      };
      animFrame = requestAnimationFrame(simulateLevel);
      return () => cancelAnimationFrame(animFrame);
    } else if (!isActive && !ready) {
      levelRef.current = 0.05;
      setLevel(0.05);
    }
  }, [isActive, ready]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { level, levelRef, ready, error, start, stop };
}
