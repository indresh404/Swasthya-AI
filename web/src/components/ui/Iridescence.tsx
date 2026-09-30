// src/components/ui/Iridescence.tsx
import React, { useEffect, useRef } from "react";

const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform float uAmplitude;
uniform float uSpeed;
varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv * 2.0 - 1.0) * uResolution.xy / mr;
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
}

export default function Iridescence({
  color = [0.3, 0.6, 1],
  speed = 0.1,
  amplitude = 0.1,
}: IridescenceProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uniformsRef = useRef({ color, speed, amplitude });

  useEffect(() => {
    uniformsRef.current = { color, speed, amplitude };
  }, [color, speed, amplitude]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvasRef.current = canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.width = 400;
    canvas.height = 400;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) return;

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

    const vert = createShader(gl.VERTEX_SHADER, vertexShader);
    const frag = createShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Quad geometry
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

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uColorLoc = gl.getUniformLocation(program, "uColor");
    const uResLoc = gl.getUniformLocation(program, "uResolution");
    const uAmpLoc = gl.getUniformLocation(program, "uAmplitude");
    const uSpeedLoc = gl.getUniformLocation(program, "uSpeed");

    let animId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform3f(uColorLoc, uniformsRef.current.color[0], uniformsRef.current.color[1], uniformsRef.current.color[2]);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uAmpLoc, uniformsRef.current.amplitude);
      gl.uniform1f(uSpeedLoc, uniformsRef.current.speed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(canvas);
    }

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(positionBuffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={container} className="w-full h-full" />;
}
