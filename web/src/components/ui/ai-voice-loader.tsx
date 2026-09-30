import * as React from "react";
import { Mic, Volume2, Square, Sparkles, Radio } from "lucide-react";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceLoaderProps {
  size?: number;
  state?: VoiceState;
  text?: string;
  onMicClick?: () => void;
  onStopClick?: () => void;
  className?: string;
}

const SOUNDBAR_HEIGHTS = [8, 16, 26, 12, 30, 20, 10, 32, 18, 24, 10, 28, 14, 8, 22, 12];

export const AiVoiceLoader: React.FC<VoiceLoaderProps> = ({
  size = 140,
  state = "listening",
  text,
  onMicClick,
  onStopClick,
  className = "",
}) => {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isThinking = state === "thinking";
  const isActive = isSpeaking || isListening || isThinking;

  const getOrbDisplayText = () => {
    if (text) return text;
    switch (state) {
      case "listening":
        return "Listening...";
      case "thinking":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      default:
        return "Ready...";
    }
  };

  const displayText = getOrbDisplayText();
  const letters = displayText.split("");

  return (
    <div
      className={`my-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0a1931]/90 via-[#0a0f1d] to-black border-2 border-[#00B9F1]/40 text-center relative overflow-hidden flex flex-col items-center justify-center select-none shadow-xl ${className}`}
    >
      {/* Ambient Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00B9F1]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Status Bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-white text-xs font-mono mb-2 z-10">
        <span className="flex items-center gap-1.5 font-bold text-[#00B9F1]">
          <Sparkles className="w-4 h-4" />
          <span>Swasthya Voice AI Copilot</span>
        </span>

        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border transition-all flex items-center gap-1.5 ${
              isSpeaking
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse font-black"
                : isListening
                ? "bg-[#00B9F1]/20 text-[#00B9F1] border-[#00B9F1]/40 font-black"
                : "bg-white/10 text-neutral-300 border-white/20"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking
                  ? "bg-emerald-400 animate-ping"
                  : isListening
                  ? "bg-[#00B9F1] animate-pulse"
                  : "bg-neutral-400"
              }`}
            />
            {displayText}
          </span>

          {isSpeaking && onStopClick && (
            <button
              onClick={onStopClick}
              className="px-2 py-0.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <Square className="w-2.5 h-2.5 fill-red-400" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Circular Letter Loader Orb */}
      <div
        onClick={onMicClick}
        className="relative my-4 flex items-center justify-center select-none cursor-pointer group"
        style={{ width: size, height: size }}
      >
        {/* Animated Spelled Letters in Center */}
        <div className="flex items-center justify-center tracking-wider font-black text-sm sm:text-base z-10 font-mono">
          {letters.map((letter, index) => (
            <span
              key={`${displayText}-${index}`}
              className={`inline-block font-mono font-black text-white ${
                isActive ? "animate-loaderLetterFast" : "animate-loaderLetter"
              }`}
              style={{
                animationDelay: `${index * 0.08}s`,
                textShadow:
                  "0 0 10px rgba(255, 255, 255, 0.95), 0 0 20px rgba(255, 255, 255, 0.65), 0 0 30px rgba(255, 255, 255, 0.4)",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>

        {/* Glowing Rotating Inset Ring */}
        <div
          className={`absolute inset-0 rounded-full pointer-events-none ${
            isActive ? "animate-loaderCircleFast" : "animate-loaderCircle"
          }`}
        />

        {/* Inner Breathing Core */}
        <div className="absolute w-2/3 h-2/3 rounded-full bg-[#00B9F1]/10 border border-[#00B9F1]/30 animate-pulse pointer-events-none" />
      </div>

      {/* Dynamic Subtext */}
      <div className="text-center space-y-1 my-1 z-10">
        <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-2">
          <span>{displayText}</span>
          {isSpeaking && <Volume2 className="w-4 h-4 text-[#00B9F1] animate-bounce" />}
        </h3>
        <p className="text-xs text-neutral-300 font-medium max-w-md">
          {isSpeaking
            ? "Broadcasting clinical voice advice and health insights..."
            : isListening
            ? "Listening to symptoms and transcribing speech..."
            : "Tap the orb or mic button to begin voice inquiry"}
        </p>
      </div>

      {/* Sound Wave Bars Indicator */}
      <div className="flex items-center justify-center gap-1.5 h-6 my-2 z-10">
        {SOUNDBAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            style={{
              height: isActive ? `${Math.max(6, (h * 1.1) % 24)}px` : "4px",
            }}
            className={`w-1 rounded-full transition-all duration-150 ${
              isActive ? "bg-[#00B9F1]" : "bg-neutral-600"
            }`}
          />
        ))}
      </div>

      {/* Keyframe Styles */}
      <style>{`
        @keyframes loaderCircle {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 6px 14px 0 #00B9F1 inset,
              0 12px 20px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 4px 1.5px rgba(0, 185, 241, 0.4),
              0 0 8px 2px rgba(0, 93, 255, 0.3);
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 6px 14px 0 #38D4FF inset,
              0 12px 8px 0 #0284c7 inset,
              0 24px 36px 0 #00B9F1 inset,
              0 0 4px 1.5px rgba(56, 212, 255, 0.5),
              0 0 8px 2px rgba(0, 185, 241, 0.35);
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 6px 14px 0 #00B9F1 inset,
              0 12px 20px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 4px 1.5px rgba(0, 185, 241, 0.4),
              0 0 8px 2px rgba(0, 93, 255, 0.3);
          }
        }

        @keyframes loaderCircleFast {
          0% {
            transform: rotate(90deg) scale(1);
            box-shadow:
              0 8px 20px 0 #00B9F1 inset,
              0 16px 28px 0 #005dff inset,
              0 40px 48px 0 #1e40af inset,
              0 0 8px 3px rgba(0, 185, 241, 0.7),
              0 0 16px 4px rgba(0, 93, 255, 0.5);
          }
          50% {
            transform: rotate(270deg) scale(1.04);
            box-shadow:
              0 8px 20px 0 #38D4FF inset,
              0 16px 14px 0 #0284c7 inset,
              0 32px 48px 0 #00B9F1 inset,
              0 0 10px 4px rgba(56, 212, 255, 0.8),
              0 0 20px 6px rgba(0, 185, 241, 0.6);
          }
          100% {
            transform: rotate(450deg) scale(1);
            box-shadow:
              0 8px 20px 0 #00B9F1 inset,
              0 16px 28px 0 #005dff inset,
              0 40px 48px 0 #1e40af inset,
              0 0 8px 3px rgba(0, 185, 241, 0.7),
              0 0 16px 4px rgba(0, 93, 255, 0.5);
          }
        }

        @keyframes loaderLetter {
          0%, 100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.18);
          }
          40% {
            opacity: 0.7;
            transform: translateY(0);
          }
        }

        @keyframes loaderLetterFast {
          0%, 100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.22);
          }
          40% {
            opacity: 0.8;
            transform: translateY(0);
          }
        }

        .animate-loaderCircle {
          animation: loaderCircle 4s linear infinite;
        }

        .animate-loaderCircleFast {
          animation: loaderCircleFast 1.3s linear infinite;
        }

        .animate-loaderLetter {
          animation: loaderLetter 2.4s infinite;
        }

        .animate-loaderLetterFast {
          animation: loaderLetterFast 1.2s infinite;
        }
      `}</style>
    </div>
  );
};
