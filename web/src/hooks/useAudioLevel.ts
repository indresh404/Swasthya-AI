// src/hooks/useAudioLevel.ts
import { useState, useEffect, useRef, useCallback } from "react";

export function useAudioLevel() {
  const levelRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (ctxRef.current && ctxRef.current.state !== "closed") {
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
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        throw new Error("AudioContext is not supported by your browser.");
      }
      const ctx = new AudioCtxClass();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const norm = Math.min(1, Math.max(0, (avg - 16) / 90));
        levelRef.current += (norm - levelRef.current) * 0.15;
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setReady(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Microphone access denied");
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { levelRef, ready, error, start, stop };
}
