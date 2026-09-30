// components/chatbot/AiOrbVisualizer.tsx
import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioLevel } from './useAudioLevel';

export type VoiceState = 'listening' | 'thinking' | 'speaking' | 'idle' | 'paused';

interface AiOrbVisualizerProps {
  size?: number;
  text?: string;
  voiceState?: VoiceState;
  onMicPress?: () => void;
  sublabel?: string;
}

const SOUNDBAR_HEIGHTS = [8, 16, 26, 12, 30, 20, 10, 32, 18, 24, 10, 28, 14, 8, 22, 12];

// GLSL Shaders for WebGL Iridescent Fluid Orb
const VERTEX_SHADER_SRC = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uAmplitude;
uniform float uSpeed;
varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv * 2.0 - 1.0) * uResolution.xy / mr;
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x * (1.0 + uAmplitude * 0.5));
    d += sin(uv.y * i + a);
  }
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  
  // Vignette circular mask
  float dist = length(vUv - vec2(0.5));
  float alpha = smoothstep(0.5, 0.48, dist);
  
  gl_FragColor = vec4(col, alpha);
}
`;

// WebGL Iridescence Canvas Component for Web
const WebGLIridescenceCanvas: React.FC<{
  size: number;
  amplitude: number;
  speed: number;
  color?: [number, number, number];
}> = ({ size, amplitude, speed, color = [0.25, 0.65, 1.0] }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const uniformsRef = useRef({ amplitude, speed, color });

  useEffect(() => {
    uniformsRef.current = { amplitude, speed, color };
  }, [amplitude, speed, color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl', { alpha: true, antialias: true }) ||
      canvas.getContext('experimental-webgl', { alpha: true, antialias: true })) as WebGLRenderingContext | null;

    if (!gl) return;

    // Compile shaders
    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    // Full screen quad (-1 to 1)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uColorLoc = gl.getUniformLocation(program, 'uColor');
    const uResLoc = gl.getUniformLocation(program, 'uResolution');
    const uAmpLoc = gl.getUniformLocation(program, 'uAmplitude');
    const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform3f(uColorLoc, uniformsRef.current.color[0], uniformsRef.current.color[1], uniformsRef.current.color[2]);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uAmpLoc, uniformsRef.current.amplitude);
      gl.uniform1f(uSpeedLoc, uniformsRef.current.speed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
};

export const AiOrbVisualizer: React.FC<AiOrbVisualizerProps> = ({
  size = 170,
  text,
  voiceState = 'listening',
  onMicPress,
  sublabel,
}) => {
  const isSpeaking = voiceState === 'speaking';
  const isListening = voiceState === 'listening';
  const isThinking = voiceState === 'thinking';
  const isActive = isSpeaking || isListening || isThinking;

  // Real-time audio reactivity
  const { level, start: startAudio, stop: stopAudio } = useAudioLevel(isActive);

  useEffect(() => {
    if (isActive) {
      startAudio();
    } else {
      stopAudio();
    }
  }, [isActive, startAudio, stopAudio]);

  const displayText = useMemo(() => {
    if (text) return text;
    switch (voiceState) {
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Ready...';
    }
  }, [text, voiceState]);

  const letters = displayText.split('');

  const displaySublabel = useMemo(() => {
    if (sublabel) return sublabel;
    switch (voiceState) {
      case 'speaking':
        return 'Swasthya AI is explaining health insights...';
      case 'listening':
        return 'Listening & transcribing your inquiry...';
      case 'thinking':
        return 'Analyzing symptoms & medical database...';
      default:
        return 'Tap orb or microphone to start speaking';
    }
  }, [sublabel, voiceState]);

  // Dynamic Audio-Reactive Parameters
  const amplitude = 0.18 + level * 1.8;
  const speed = 0.8 + level * 0.6;
  const orbScale = 1 + level * 0.28;
  const glowOpacity = Math.min(0.95, 0.35 + level * 1.8);

  // React Native Native Animation values (for mobile Expo)
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const counterRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseCoreAnim = useRef(new Animated.Value(1)).current;
  const letterAnims = useRef<Animated.Value[]>([]).current;
  const barAnims = useRef<Animated.Value[]>(SOUNDBAR_HEIGHTS.map(() => new Animated.Value(4))).current;

  // Staggered letters initialization
  if (letterAnims.length !== letters.length) {
    letterAnims.length = 0;
    letters.forEach(() => {
      letterAnims.push(new Animated.Value(0));
    });
  }

  // Native 60fps Rotation loop
  useEffect(() => {
    rotateAnim.setValue(0);
    counterRotateAnim.setValue(0);
    const duration = isActive ? 1600 : 4500;
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const counterLoop = Animated.loop(
      Animated.timing(counterRotateAnim, {
        toValue: 1,
        duration: duration * 1.5,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();
    counterLoop.start();
    return () => {
      rotateLoop.stop();
      counterLoop.stop();
    };
  }, [isActive]);

  // Native Breathing Core loop
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseCoreAnim, {
          toValue: 0.92,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseCoreAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // Native Staggered Letter Wave loop
  useEffect(() => {
    const anims = letterAnims.map((anim, index) => {
      const delay = index * 75;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: isActive ? 220 : 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: isActive ? 280 : 460,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((letters.length - index) * 75 + (isActive ? 180 : 350)),
        ])
      );
    });

    Animated.parallel(anims).start();
    return () => anims.forEach((a) => a.stop());
  }, [displayText, isActive]);

  // Native Equalizer Soundbar loops driven by live audio level
  useEffect(() => {
    if (isActive) {
      const animations = barAnims.map((bar, i) => {
        const factor = 0.5 + level * 2.2;
        const targetH = Math.max(6, Math.min(34, SOUNDBAR_HEIGHTS[i] * factor));
        return Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: targetH,
              duration: 160 + (i % 5) * 35,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 4,
              duration: 160 + (i % 5) * 35,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        );
      });
      Animated.parallel(animations).start();
      return () => animations.forEach((a) => a.stop());
    } else {
      barAnims.forEach((bar) => bar.setValue(4));
    }
  }, [isActive, level]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterSpin = counterRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // On Web / Expo Web: Render Real-time Iridescent WebGL Shader + White Glowing Letters
  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          userSelect: 'none',
          padding: '12px 0',
        }}
      >
        <style>{`
          @keyframes loaderCircle {
            0% {
              transform: rotate(0deg);
              box-shadow:
                0 6px 16px 0 #00B9F1 inset,
                0 14px 22px 0 #005dff inset,
                0 36px 40px 0 #1e40af inset,
                0 0 8px 2px rgba(0, 185, 241, 0.45),
                0 0 16px 3px rgba(0, 93, 255, 0.35);
            }
            50% {
              transform: rotate(180deg);
              box-shadow:
                0 6px 16px 0 #38D4FF inset,
                0 14px 10px 0 #0284c7 inset,
                0 28px 40px 0 #00B9F1 inset,
                0 0 10px 3px rgba(56, 212, 255, 0.6),
                0 0 20px 4px rgba(0, 185, 241, 0.45);
            }
            100% {
              transform: rotate(360deg);
              box-shadow:
                0 6px 16px 0 #00B9F1 inset,
                0 14px 22px 0 #005dff inset,
                0 36px 40px 0 #1e40af inset,
                0 0 8px 2px rgba(0, 185, 241, 0.45),
                0 0 16px 3px rgba(0, 93, 255, 0.35);
            }
          }
          @keyframes loaderLetterWave {
            0%, 100% {
              opacity: 0.5;
              transform: translateY(0) scale(1);
            }
            20% {
              opacity: 1;
              transform: translateY(-4px) scale(1.22);
            }
            40% {
              opacity: 0.8;
              transform: translateY(0) scale(1.05);
            }
          }
        `}</style>

        {/* Orb Stage */}
        <div
          onClick={onMicPress}
          style={{
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: `scale(${orbScale})`,
            transition: 'transform 0.12s ease-out',
          }}
        >
          {/* Audio-Reactive Ambient Blur Bloom */}
          <div
            style={{
              position: 'absolute',
              width: `${size * 1.4}px`,
              height: `${size * 1.4}px`,
              backgroundColor: '#00B9F1',
              borderRadius: '50%',
              filter: 'blur(38px)',
              opacity: glowOpacity,
              pointerEvents: 'none',
              transition: 'opacity 0.15s ease-out',
            }}
          />

          {/* WebGL Iridescent Shader Sphere */}
          <div
            style={{
              position: 'relative',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 0 35px rgba(0, 185, 241, 0.6), inset 0 0 25px rgba(0, 93, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WebGLIridescenceCanvas
              size={size}
              amplitude={amplitude}
              speed={speed}
              color={[0.2, 0.68, 1.0]}
            />
          </div>

          {/* Kinetic Glowing Outer Accent Ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
              animation: `loaderCircle ${isActive ? '2s' : '5s'} linear infinite`,
            }}
          />

          {/* Centered Luminous White Letters */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 15,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 900,
              fontSize: '16px',
              letterSpacing: '1px',
              pointerEvents: 'none',
            }}
          >
            {letters.map((letter, index) => (
              <span
                key={`${displayText}-${index}`}
                style={{
                  display: 'inline-block',
                  color: '#FFFFFF',
                  textShadow:
                    '0 0 10px rgba(255, 255, 255, 1), 0 0 22px rgba(255, 255, 255, 0.8), 0 0 35px rgba(0, 185, 241, 0.9)',
                  animation: 'loaderLetterWave 2s infinite',
                  animationDelay: `${index * 0.08}s`,
                  marginRight: letter === ' ' ? '4px' : '0px',
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </div>
        </div>

        {/* 16-Bar Sound Wave Equalizer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4.5px',
            height: '32px',
            marginTop: '20px',
          }}
        >
          {SOUNDBAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              style={{
                width: '3.5px',
                height: `${isActive ? Math.max(6, Math.min(32, h * (0.5 + level * 2.2))) : 4}px`,
                backgroundColor: isActive ? '#00B9F1' : '#525252',
                borderRadius: '9999px',
                transition: 'height 0.1s ease-out, background-color 0.2s ease',
                boxShadow: isActive ? '0 0 10px rgba(0, 185, 241, 0.7)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Sublabel */}
        <p
          style={{
            color: '#9CA3AF',
            fontSize: '12.5px',
            fontWeight: 500,
            marginTop: '12px',
            textAlign: 'center',
          }}
        >
          {displaySublabel}
        </p>
      </div>
    );
  }

  // On Mobile Expo (iOS & Android): Render Hardware-Accelerated 60fps Native Iridescent Fluid Orb
  return (
    <View style={styles.nativeContainer}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onMicPress}
        style={[
          styles.orbStage,
          {
            width: size,
            height: size,
            transform: [{ scale: orbScale }],
          },
        ]}
      >
        {/* Audio-Reactive Ambient Bloom */}
        <View
          style={[
            styles.ambientGlow,
            {
              width: size * 1.35,
              height: size * 1.35,
              borderRadius: (size * 1.35) / 2,
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Outer Rotating Fluid Gradient Layer 1 */}
        <Animated.View
          style={[
            styles.nativeFluidOrb,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={['#00B9F1', '#38D4FF', '#005DFF', '#6366F1', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.nativeGradientFill, { borderRadius: size / 2 }]}
          />
        </Animated.View>

        {/* Counter-Rotating Fluid Gradient Layer 2 (Iridescent Sheen) */}
        <Animated.View
          style={[
            styles.nativeFluidOrbSecondary,
            {
              width: size * 0.92,
              height: size * 0.92,
              borderRadius: (size * 0.92) / 2,
              transform: [{ rotate: counterSpin }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(56, 212, 255, 0.8)', 'rgba(0, 93, 255, 0.4)', 'rgba(147, 51, 234, 0.6)']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.nativeGradientFill, { borderRadius: (size * 0.92) / 2 }]}
          />
        </Animated.View>

        {/* Breathing Inner Core */}
        <Animated.View
          style={[
            styles.nativeInnerCore,
            {
              width: size * 0.68,
              height: size * 0.68,
              borderRadius: (size * 0.68) / 2,
              transform: [{ scale: pulseCoreAnim }],
            },
          ]}
        />

        {/* Center Animated Luminous White Letters */}
        <View style={styles.lettersRow}>
          {letters.map((letter, index) => {
            const anim = letterAnims[index] || new Animated.Value(0);
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -5],
            });
            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.65, 1],
            });

            return (
              <Animated.Text
                key={`${displayText}-${index}`}
                style={[
                  styles.nativeLetterText,
                  {
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </Animated.Text>
            );
          })}
        </View>
      </TouchableOpacity>

      {/* 16-Bar Sound Wave Equalizer */}
      <View style={styles.soundBarsContainer}>
        {SOUNDBAR_HEIGHTS.map((h, i) => (
          <Animated.View
            key={i}
            style={[
              styles.nativeSoundBar,
              {
                height: barAnims[i],
                backgroundColor: isActive ? '#00B9F1' : '#525252',
                shadowColor: isActive ? '#00B9F1' : 'transparent',
                shadowOpacity: isActive ? 0.8 : 0,
                shadowRadius: 6,
              },
            ]}
          />
        ))}
      </View>

      {/* Sublabel */}
      <Text style={styles.sublabelText}>{displaySublabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  orbStage: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    backgroundColor: '#00B9F1',
    shadowColor: '#00B9F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 35,
    elevation: 12,
  },
  nativeFluidOrb: {
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#00B9F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 212, 255, 0.6)',
  },
  nativeFluidOrbSecondary: {
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.85,
  },
  nativeGradientFill: {
    width: '100%',
    height: '100%',
  },
  nativeInnerCore: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 212, 255, 0.5)',
    shadowColor: '#00B9F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 6,
  },
  lettersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  nativeLetterText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textShadowColor: '#FFFFFF',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  soundBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4.5,
    height: 34,
    marginTop: 20,
  },
  nativeSoundBar: {
    width: 3.5,
    borderRadius: 4,
  },
  sublabelText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
