// src/components/ui/VoiceOrbIridescence.tsx
import { useState, useEffect } from "react";
import { useAudioLevel } from "../../hooks/useAudioLevel";
import Iridescence from "./Iridescence";

export default function VoiceOrbIridescencePage() {
  const { levelRef, ready, error, start, stop } = useAudioLevel();
  const [level, setLevel] = useState(0);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      setLevel((prev) => prev + (levelRef.current - prev) * 0.25);
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [levelRef]);

  const amplitude = 0.18 + level * 1.7;
  const speed = 0.75 + level * 0.5;
  const scale = 1 + level * 0.35;
  const glowOpacity = Math.min(1, 0.25 + level * 2.45);

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center transition-colors duration-500 ${
        isDark ? "bg-[#090D16] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="relative w-[220px] aspect-square flex items-center justify-center">
        {/* Dynamic Glowing Ambient Blur */}
        <div
          className="absolute inset-0 rounded-full bg-cyan-400 blur-[100px] pointer-events-none"
          style={{ opacity: glowOpacity, transition: "opacity 0.15s ease-out" }}
        />

        {/* Iridescent Shader Sphere */}
        <div
          className="relative h-full w-full rounded-full overflow-hidden shadow-[0_0_90px_rgba(58,108,255,0.45)] border border-cyan-400/30"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 0.12s ease-out",
          }}
        >
          <Iridescence amplitude={amplitude} speed={speed} color={[0.3, 0.65, 1]} />
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-3 text-sm">
        {!ready ? (
          <button
            onClick={start}
            className="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 transition-all"
          >
            Enable Microphone
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-4 py-2 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold transition-all"
          >
            Mute / Stop Mic
          </button>
        )}
        {error && <div className="text-red-400 font-medium">Audio error: {error}</div>}
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="text-xs text-gray-400 hover:text-gray-200 underline transition-colors"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}
