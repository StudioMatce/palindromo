'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ComputedShape, toSVGString } from '@/lib/shape';
import XShape from './XShape';
import SemioticSquare from './SemioticSquare';

interface RevealProps {
  shape: ComputedShape;
  onPlayground: () => void;
}

// Etichetta del quadrante
function quadrantLabel(X: number, Y: number) {
  const vert = Y >= 0 ? 'Riflessivo' : 'Pragmatico';
  const horiz = X >= 0 ? 'Innovativo' : 'Tradizionale';
  return `${vert} × ${horiz}`;
}

// Copia poetica del quadrante
function poeticLabel(X: number, Y: number) {
  const isCenter = Math.abs(X) + Math.abs(Y) < 0.4;
  if (isCenter) {
    return {
      title: 'Il punto dove le direzioni si incontrano.',
      desc: 'Non stai né da una parte né dall\u2019altra. È lì che i palindromi si rivelano.',
    };
  }
  if (Y > 0 && X > 0) return {
    title: 'Il pensiero che apre strade.',
    desc: 'Pensi prima di agire, ma pensi per andare dove nessuno è ancora stato.',
  };
  if (Y > 0 && X < 0) return {
    title: 'Lo sguardo che misura il tempo.',
    desc: 'Osservi a lungo, e quando scegli lo fai dentro qualcosa che dura.',
  };
  if (Y < 0 && X > 0) return {
    title: 'L\u2019istinto che cambia le cose.',
    desc: 'Non aspetti di avere tutte le risposte: le scopri mentre costruisci.',
  };
  return {
    title: 'La mano che continua il mestiere.',
    desc: 'Fidati di ciò che funziona: lo fai tuo, lo tramandi, lo perfezioni.',
  };
}

export default function Reveal({ shape, onPlayground }: RevealProps) {
  const [name, setName] = useState('');

  const poetic = useMemo(() => poeticLabel(shape.rawX, shape.rawY), [shape.rawX, shape.rawY]);

  const shapeSVG = useMemo(
    () =>
      toSVGString({
        size: 400,
        color: '#eb0028',
        bg: '#000000',
        innerSize: shape.innerSize,
        offsetX: shape.offsetX,
        offsetY: shape.offsetY,
        wA: shape.wA,
        wB: shape.wB,
        wC: shape.wC,
        wD: shape.wD,
      }),
    [shape],
  );

  // Genera un badge PNG 600x800 con la X, il nome, e il quadrante
  const downloadPNG = useCallback(async () => {
    const W = 600, H = 800;
    const canvas = document.createElement('canvas');
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Disegna la X tramite immagine SVG
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const s = 320;
        ctx.drawImage(img, (W - s) / 2, 100, s, s);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(shapeSVG)));
    });

    // Nome
    ctx.fillStyle = '#ffffff';
    ctx.font = '400 40px "DM Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name || 'Anonimo', W / 2, 500);

    // Titolo poetico
    ctx.fillStyle = '#f2f2f2';
    ctx.font = '400 20px "DM Mono", ui-monospace, monospace';
    ctx.fillText(poetic.title, W / 2, 534);

    // Descrizione (va a capo ~52 caratteri)
    ctx.fillStyle = '#888';
    ctx.font = '400 11px "DM Mono", ui-monospace, monospace';
    const wrap = (text: string, maxCharsPerLine: number) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length > maxCharsPerLine) {
          lines.push(cur.trim());
          cur = w;
        } else {
          cur += ' ' + w;
        }
      }
      if (cur.trim()) lines.push(cur.trim());
      return lines;
    };
    const descLines = wrap(poetic.desc, 52);
    descLines.forEach((ln, i) => {
      ctx.fillText(ln, W / 2, 566 + i * 18);
    });

    // Codice
    ctx.fillStyle = '#555';
    ctx.font = '400 11px "DM Mono", ui-monospace, monospace';
    ctx.fillText(shape.code, W / 2, 566 + descLines.length * 18 + 24);

    // Payoff
    ctx.fillStyle = '#888';
    ctx.font = '400 11px "DM Mono", ui-monospace, monospace';
    ctx.fillText('APPARENTEMENTE UGUALE, MA NON PER FORZA IDENTICO.', W / 2, H - 100);

    // Wordmark
    ctx.fillStyle = '#f2f2f2';
    ctx.font = '400 12px "DM Mono", ui-monospace, monospace';
    ctx.fillText('CONEGLIANO \u00B7 PALINDROMO \u00B7 2026', W / 2, H - 60);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shape.code}-badge.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }, [shapeSVG, name, poetic, shape.code]);

  return (
    <div className="reveal-screen">
      <div className="reveal-content">
        {/* Eyebrow */}
        <div className="reveal-eyebrow">la tua X</div>

        {/* La X personale */}
        <div className="reveal-shape">
          <XShape
            size={260}
            color="#eb0028"
            innerSize={shape.innerSize}
            offsetX={shape.offsetX}
            offsetY={shape.offsetY}
            wA={shape.wA}
            wB={shape.wB}
            wC={shape.wC}
            wD={shape.wD}
          />
        </div>

        {/* Input nome */}
        <input
          type="text"
          placeholder="Il tuo nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="reveal-name-input"
        />

        {/* Codice identificativo */}
        <div className="reveal-code">{shape.code}</div>

        {/* Quadrato semiotico */}
        <div style={{ marginTop: 80 }}>
          <SemioticSquare X={shape.rawX} Y={shape.rawY} />
        </div>

        {/* Titolo poetico */}
        <div className="reveal-poetic-title">{poetic.title}</div>
        <div className="reveal-poetic-desc">{poetic.desc}</div>

        {/* Bottone download */}
        <div className="reveal-buttons">
          <button onClick={downloadPNG} className="dl-btn">
            Scarica badge PNG
          </button>
        </div>

        {/* Link al playground */}
        <button onClick={onPlayground} className="reveal-playground-link">
          Gioca con la tua X &rarr;
        </button>

        {/* Logo TEDxConegliano */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tedx-logo-white.svg"
          alt="TEDxConegliano"
          style={{ marginTop: 80, height: 28, width: 'auto', opacity: 0.5 }}
        />
      </div>
    </div>
  );
}
