'use client';

import { useState, useEffect } from 'react';

interface SemioticSquareProps {
  X: number;
  Y: number;
}

export default function SemioticSquare({ X, Y }: SemioticSquareProps) {
  const W = 440;
  const padX = 72;
  const padY = 72;
  const innerW = W - padX * 2;
  const innerH = W - padY * 2;
  // Posizione del punto nel quadrato
  const cx = padX + innerW / 2 + (X * innerW) / 2;
  const cy = padY + innerH / 2 - (Y * innerH) / 2;

  const [drop, setDrop] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrop(true), 400);
    return () => clearTimeout(t);
  }, []);

  const midX = padX + innerW / 2;
  const midY = padY + innerH / 2;

  return (
    <svg
      width={W}
      height={W}
      viewBox={`0 0 ${W} ${W}`}
      style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}
    >
      {/* Cornice */}
      <rect x={padX} y={padY} width={innerW} height={innerH} fill="none" stroke="#222" strokeWidth="1" />
      {/* Assi */}
      <line x1={padX} y1={midY} x2={W - padX} y2={midY} stroke="#222" strokeWidth="1" strokeDasharray="2 3" />
      <line x1={midX} y1={padY} x2={midX} y2={W - padY} stroke="#222" strokeWidth="1" strokeDasharray="2 3" />

      {/* Etichette assi */}
      <text x={midX} y={padY - 22} textAnchor="middle" fill="#888" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.8" style={{ textTransform: 'uppercase' }}>Riflessivo</text>
      <text x={midX} y={padY - 10} textAnchor="middle" fill="#444" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5">↑</text>

      <text x={midX} y={W - padY + 24} textAnchor="middle" fill="#888" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.8" style={{ textTransform: 'uppercase' }}>Pragmatico</text>
      <text x={midX} y={W - padY + 14} textAnchor="middle" fill="#444" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5">↓</text>

      <g transform={`translate(${padX - 18}, ${midY}) rotate(-90)`}>
        <text textAnchor="middle" fill="#888" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.8" style={{ textTransform: 'uppercase' }}>Tradizionale</text>
      </g>
      <text x={padX - 8} y={midY + 3} textAnchor="end" fill="#444" fontFamily="var(--font-mono)" fontSize="8">&larr;</text>

      <g transform={`translate(${W - padX + 18}, ${midY}) rotate(90)`}>
        <text textAnchor="middle" fill="#888" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.8" style={{ textTransform: 'uppercase' }}>Innovativo</text>
      </g>
      <text x={W - padX + 8} y={midY + 3} textAnchor="start" fill="#444" fontFamily="var(--font-mono)" fontSize="8">&rarr;</text>

      {/* Punto animato */}
      <g
        style={{
          transform: drop ? `translate(${cx}px, ${cy}px)` : `translate(${cx}px, ${padY - 40}px)`,
          opacity: drop ? 1 : 0,
          transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s',
        }}
      >
        <circle r="14" fill="#ffffff" opacity="0.08" />
        <circle r="8" fill="#ffffff" opacity="0.18" />
        <circle r="4" fill="#ffffff" />
      </g>
    </svg>
  );
}
