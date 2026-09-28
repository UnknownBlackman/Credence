"use client";

import React, { useEffect, useRef } from 'react';

interface MosaicTile {
  x: number;
  y: number;
  size: number;
  vertices: [number, number][];
  baseAlpha: number;
  alpha: number;
  targetAlpha: number;
  hue: number;
}

export const MosaicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initTiles();
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let tiles: MosaicTile[] = [];

    const initTiles = () => {
      tiles = [];
      const tileSize = width > 1024 ? 76 : 56;
      const cols = Math.ceil(width / (tileSize * 1.5)) + 2;
      const rows = Math.ceil(height / (tileSize * 0.866)) + 2;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const offsetX = (r % 2 === 0 ? 0 : tileSize * 0.75) + Math.sin(r * 1.5 + c) * 3;
          const offsetY = Math.cos(c * 1.2 + r) * 3;
          const cx = c * tileSize * 1.5 + offsetX;
          const cy = r * tileSize * 0.866 + offsetY;

          const sides = 6;
          const vertices: [number, number][] = [];
          const facetRadius = tileSize * 0.55;

          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const dist = facetRadius * (0.9 + 0.1 * Math.sin(c * 2 + r * 3 + i));
            vertices.push([cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist]);
          }

          // Luxurious Gold & Champagne palette (hue 40 - 48, warm golden amber tones)
          const hue = 40 + Math.floor(Math.random() * 9);
          // Very transparent and unobtrusive: 0.012 to 0.03
          const baseAlpha = 0.012 + Math.random() * 0.02;

          tiles.push({
            x: cx,
            y: cy,
            size: tileSize,
            vertices,
            baseAlpha,
            alpha: baseAlpha,
            targetAlpha: baseAlpha,
            hue,
          });
        }
      }
    };

    initTiles();

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Warm ivory & champagne ambient background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FCFAF6');
      bgGrad.addColorStop(0.5, '#F7F2E8');
      bgGrad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Warm gold radial glows
      const glowGrad1 = ctx.createRadialGradient(width * 0.25, height * 0.15, 20, width * 0.25, height * 0.15, width * 0.55);
      glowGrad1.addColorStop(0, 'rgba(243, 224, 175, 0.35)');
      glowGrad1.addColorStop(0.7, 'rgba(250, 240, 215, 0.12)');
      glowGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad1;
      ctx.fillRect(0, 0, width, height);

      const glowGrad2 = ctx.createRadialGradient(width * 0.82, height * 0.65, 20, width * 0.82, height * 0.65, width * 0.5);
      glowGrad2.addColorStop(0, 'rgba(238, 214, 155, 0.26)');
      glowGrad2.addColorStop(0.8, 'transparent');
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(0, 0, width, height);

      // Render ultra-transparent gold mosaic tiles
      const mouse = mouseRef.current;
      const mouseRange = 220;

      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];

        let hoverInfluence = 0;
        if (mouse.active) {
          const dx = tile.x - mouse.x;
          const dy = tile.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRange) {
            hoverInfluence = (1 - dist / mouseRange) * 0.12;
          }
        }

        const wave = Math.sin(time + (tile.x + tile.y) * 0.003) * 0.01;
        tile.targetAlpha = Math.max(0.008, tile.baseAlpha + hoverInfluence + wave);
        tile.alpha += (tile.targetAlpha - tile.alpha) * 0.08;

        if (tile.vertices.length < 3) continue;

        ctx.beginPath();
        ctx.moveTo(tile.vertices[0][0], tile.vertices[0][1]);
        for (let v = 1; v < tile.vertices.length; v++) {
          ctx.lineTo(tile.vertices[v][0], tile.vertices[v][1]);
        }
        ctx.closePath();

        const isHovered = hoverInfluence > 0.02;
        if (isHovered) {
          ctx.fillStyle = `hsla(${tile.hue}, 80%, 55%, ${tile.alpha * 1.6})`;
        } else {
          ctx.fillStyle = `hsla(${tile.hue}, 65%, 68%, ${tile.alpha * 0.9})`;
        }
        ctx.fill();

        ctx.lineWidth = isHovered ? 0.9 : 0.5;
        ctx.strokeStyle = isHovered
          ? `rgba(202, 160, 70, ${Math.min(0.28, tile.alpha * 3.8)})`
          : `rgba(225, 205, 160, ${Math.min(0.22, tile.alpha * 2.2)})`;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block opacity-80" />
    </div>
  );
};
