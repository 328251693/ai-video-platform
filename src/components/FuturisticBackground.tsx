"use client";

import { useEffect, useRef } from "react";

export default function FuturisticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    // 粒子
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    // 连线节点
    const nodes: { x: number; y: number; vx: number; vy: number; pulse: number }[] = [];
    // 流光线条
    const beams: { x: number; y: number; angle: number; speed: number; length: number; alpha: number; color: string }[] = [];

    const colors = [
      "rgba(139, 92, 246,",  // violet
      "rgba(99, 102, 241,",  // indigo
      "rgba(14, 165, 233,",  // sky
      "rgba(6, 182, 212,",   // cyan
    ];

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function init() {
      resize();

      // 粒子
      particles.length = 0;
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // 网络节点
      nodes.length = 0;
      for (let i = 0; i < 15; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          pulse: Math.random() * Math.PI * 2,
        });
      }

      // 流光
      beams.length = 0;
      for (let i = 0; i < 6; i++) {
        beams.push({
          x: Math.random() * w,
          y: Math.random() * h,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 1 + 0.5,
          length: Math.random() * 200 + 100,
          alpha: Math.random() * 0.15 + 0.05,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    let time = 0;

    function draw() {
      time += 0.005;
      ctx!.clearRect(0, 0, w, h);

      // 背景渐变
      const grad = ctx!.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8);
      grad.addColorStop(0, "rgba(15, 10, 40, 0.6)");
      grad.addColorStop(0.5, "rgba(5, 5, 20, 0.4)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, w, h);

      // 透视网格
      drawGrid();

      // 流光线条
      drawBeams();

      // 网络节点连线
      drawNodeNetwork();

      // 粒子
      drawParticles();

      // 中心光晕
      drawGlow();

      animId = requestAnimationFrame(draw);
    }

    function drawGrid() {
      ctx!.save();
      ctx!.strokeStyle = "rgba(139, 92, 246, 0.04)";
      ctx!.lineWidth = 1;

      const gridSize = 60;
      const offsetX = (time * 20) % gridSize;

      // 横线
      for (let y = 0; y < h; y += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      // 竖线
      for (let x = -gridSize + offsetX; x < w + gridSize; x += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }

      ctx!.restore();
    }

    function drawBeams() {
      ctx!.save();
      for (const beam of beams) {
        beam.x += Math.cos(beam.angle) * beam.speed;
        beam.y += Math.sin(beam.angle) * beam.speed;

        // 循环
        if (beam.x < -beam.length) beam.x = w + beam.length;
        if (beam.x > w + beam.length) beam.x = -beam.length;
        if (beam.y < -beam.length) beam.y = h + beam.length;
        if (beam.y > h + beam.length) beam.y = -beam.length;

        const endX = beam.x + Math.cos(beam.angle) * beam.length;
        const endY = beam.y + Math.sin(beam.angle) * beam.length;

        const grad = ctx!.createLinearGradient(beam.x, beam.y, endX, endY);
        grad.addColorStop(0, beam.color + "0)");
        grad.addColorStop(0.3, beam.color + beam.alpha + ")");
        grad.addColorStop(0.7, beam.color + beam.alpha + ")");
        grad.addColorStop(1, beam.color + "0)");

        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(beam.x, beam.y);
        ctx!.lineTo(endX, endY);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawNodeNetwork() {
      ctx!.save();
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        // 节点光圈
        const pulseSize = 3 + Math.sin(node.pulse) * 2;
        const grad = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize * 4);
        grad.addColorStop(0, "rgba(139, 92, 246, 0.3)");
        grad.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, pulseSize * 4, 0, Math.PI * 2);
        ctx!.fill();

        // 节点核心
        ctx!.fillStyle = "rgba(139, 92, 246, 0.8)";
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 连线
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const alpha = (1 - dist / 300) * 0.12;
            ctx!.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }
      ctx!.restore();
    }

    function drawParticles() {
      ctx!.save();
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx!.fillStyle = p.color + p.alpha + ")";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function drawGlow() {
      ctx!.save();

      // 中心大光晕
      const cx = w * 0.5;
      const cy = h * 0.35;
      const r = Math.min(w, h) * 0.4;
      const pulse = Math.sin(time * 2) * 0.02 + 0.08;

      const grad1 = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad1.addColorStop(0, `rgba(139, 92, 246, ${pulse})`);
      grad1.addColorStop(0.5, `rgba(99, 102, 241, ${pulse * 0.5})`);
      grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = grad1;
      ctx!.fillRect(0, 0, w, h);

      // 左下角光晕
      const grad2 = ctx!.createRadialGradient(w * 0.15, h * 0.8, 0, w * 0.15, h * 0.8, w * 0.3);
      grad2.addColorStop(0, `rgba(14, 165, 233, ${pulse * 0.6})`);
      grad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = grad2;
      ctx!.fillRect(0, 0, w, h);

      // 右上角光晕
      const grad3 = ctx!.createRadialGradient(w * 0.85, h * 0.15, 0, w * 0.85, h * 0.15, w * 0.25);
      grad3.addColorStop(0, `rgba(6, 182, 212, ${pulse * 0.5})`);
      grad3.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = grad3;
      ctx!.fillRect(0, 0, w, h);

      ctx!.restore();
    }

    init();
    draw();

    window.addEventListener("resize", () => {
      resize();
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
