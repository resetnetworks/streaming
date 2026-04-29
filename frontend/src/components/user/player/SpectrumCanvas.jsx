import React, { useRef, useEffect, useCallback } from "react";

const SpectrumCanvas = ({ frequencyData, isPlaying, beatPulse = 0 }) => {
  const canvasRef = useRef(null);
  const smoothedRef = useRef(null);
  const animRef = useRef(null);

  // Bars ko 10 kar diya hai taaki center bhara hua lage
  const BAR_COUNT = 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    if (!smoothedRef.current || smoothedRef.current.length !== BAR_COUNT) {
      smoothedRef.current = new Float32Array(BAR_COUNT).fill(0);
    }

    const srcLen = frequencyData?.length || 46;
    const decay = isPlaying ? 0.25 : 0.06; // Thoda fast response rakha hai taaki real lage

    // Fake look hatane ke liye: Sirf starting ki 75% frequencies use kar rahe hain
    // Kyuki end ki frequencies aksar 0 rehti hain (jisse side ke bars dead lagte the)
    const usableLen = Math.floor(srcLen * 0.75); 

    for (let i = 0; i < BAR_COUNT; i++) {
      const srcIdx = Math.floor((i / (BAR_COUNT - 1)) * (usableLen - 1));
      const target = isPlaying && frequencyData ? frequencyData[srcIdx] / 255 : 0;
      smoothedRef.current[i] += (target - smoothedRef.current[i]) * decay;
    }

    ctx.clearRect(0, 0, W, H);

    const midY = H / 2;
    const barW = 2; // Thoda patla lekin distinct
    const gap = 3;    // Bars ke beech perfect gap
    const totalW = BAR_COUNT * barW + (BAR_COUNT - 1) * gap;
    const startX = (W - totalW) / 2;
    const maxHalf = midY * 0.84;
    const pulse = beatPulse || 0;

    // ─── FULL CENTER LINE ───
    // Ye line ab pure canvas (0 se W) tak draw hogi
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.strokeStyle = isPlaying
      ? `rgba(99,120,220,${0.25 + pulse * 0.25})`
      : "rgba(99,120,220,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // ─── BARS DRAWING ───
    for (let i = 0; i < BAR_COUNT; i++) {
      const v = smoothedRef.current[i];
      const half = v * maxHalf * (1 + pulse * 0.18);
      const x = startX + i * (barW + gap);

      // Agar awaz bahot kam hai, toh chhote dots dikhayega
      if (half < 0.8) {
        ctx.beginPath();
        ctx.arc(x + barW / 2, midY, 1, 0, Math.PI * 2); // Thoda visible dot
        ctx.fillStyle = "rgba(99,120,220,0.25)";
        ctx.fill();
        continue;
      }

      const alpha = Math.min(0.92, 0.48 + v * 0.48);
      const f = i / (BAR_COUNT - 1);
      const r = Math.round(80 + f * 40);
      const g = Math.round(100 + f * 20);
      const b = 220;

      // Top bar
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, midY - half, barW, half, [2, 2, 0, 0]);
      } else {
        ctx.rect(x, midY - half, barW, half);
      }
      ctx.fill();

      // Bottom mirror (dimmer)
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.45})`;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, midY, barW, half, [0, 0, 2, 2]);
      } else {
        ctx.rect(x, midY, barW, half);
      }
      ctx.fill();
    }

    animRef.current = requestAnimationFrame(drawFrame);
  }, [frequencyData, isPlaying, beatPulse]);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "48px",
        display: "block",
        borderRadius: "6px",
      }}
    />
  );
};

export default SpectrumCanvas;