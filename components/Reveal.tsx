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

  // SVG della X con sfondo chiaro (per il badge)
  const shapeSVGForBadge = useMemo(
    () =>
      toSVGString({
        size: 400,
        color: '#eb0028',
        bg: '#f0efed',
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

  // Carica un'immagine da URL e la ritorna come HTMLImageElement
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });

  // Word-wrap helper
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

  // Badge PNG nello stile del visual TEDxConegliano:
  // sfondo chiaro, griglia rossa, logo in alto, X grande, info in basso
  const downloadPNG = useCallback(async () => {
    const W = 750, H = 1334;
    const canvas = document.createElement('canvas');
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    const RED = '#eb0028';
    const BG = '#f0efed';
    const MONO = '"DM Mono", ui-monospace, monospace';
    const PAD = 40; // padding laterale
    const LINE_W = 1; // spessore linee griglia

    // Sfondo chiaro
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // --- Logo TEDxConegliano in alto ---
    const logoImg = await loadImage('/tedx-logo-dark.svg');
    const logoH = 60;
    const logoW = logoImg.naturalWidth
      ? (logoImg.naturalWidth / logoImg.naturalHeight) * logoH
      : logoH * 6.8; // aspect ratio di fallback
    ctx.drawImage(logoImg, PAD, 40, logoW, logoH);

    // --- Box principale con la X ---
    const boxTop = 120;
    const boxBottom = 880;
    const boxLeft = PAD;
    const boxRight = W - PAD;

    // Bordo rosso del box
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBottom - boxTop);

    // Disegna la X dentro il box
    const xImg = await loadImage(
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(shapeSVGForBadge)))
    );
    const xSize = boxBottom - boxTop - 20;
    const xLeft = boxLeft + ((boxRight - boxLeft) - xSize) / 2;
    ctx.drawImage(xImg, xLeft, boxTop + 10, xSize, xSize);

    // --- Griglia info sotto il box ---
    const gridTop = boxBottom;
    const midX = boxLeft + (boxRight - boxLeft) * 0.55; // colonna divisa ~55/45

    // Linea verticale che divide le colonne
    ctx.beginPath();
    ctx.moveTo(midX, gridTop);
    ctx.lineTo(midX, H - PAD);
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.stroke();

    // Riga 1: "Palindromo" a sinistra
    const row1Top = gridTop;
    const row1Bottom = gridTop + 90;
    ctx.strokeRect(boxLeft, row1Top, boxRight - boxLeft, row1Bottom - row1Top);

    ctx.fillStyle = RED;
    ctx.font = `400 36px ${MONO}`;
    ctx.textAlign = 'left';
    ctx.fillText('Palindromo', boxLeft + 16, row1Bottom - 28);

    // Riga 2: payoff a sinistra | nome a destra
    const row2Top = row1Bottom;
    const row2Bottom = row2Top + 90;
    // Bordo orizzontale
    ctx.beginPath();
    ctx.moveTo(boxLeft, row2Bottom);
    ctx.lineTo(boxRight, row2Bottom);
    ctx.stroke();
    // Bordi laterali
    ctx.beginPath();
    ctx.moveTo(boxLeft, row2Top);
    ctx.lineTo(boxLeft, row2Bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(boxRight, row2Top);
    ctx.lineTo(boxRight, row2Bottom);
    ctx.stroke();

    // Payoff a sinistra
    ctx.fillStyle = RED;
    ctx.font = `400 16px ${MONO}`;
    ctx.textAlign = 'left';
    const payoffLines = wrap('Apparente uguale, reale diverso', 22);
    payoffLines.forEach((ln, i) => {
      ctx.fillText(ln, boxLeft + 16, row2Top + 34 + i * 22);
    });

    // Nome a destra
    ctx.fillStyle = RED;
    ctx.font = `400 16px ${MONO}`;
    const userName = name || 'Anonimo';
    const nameLines = wrap(userName, 18);
    nameLines.forEach((ln, i) => {
      ctx.fillText(ln, midX + 16, row2Top + 34 + i * 22);
    });

    // Riga 3: poetic a sinistra | codice + data a destra
    const row3Top = row2Bottom;
    const row3Bottom = row3Top + 90;
    // Bordi
    ctx.beginPath();
    ctx.moveTo(boxLeft, row3Bottom);
    ctx.lineTo(boxRight, row3Bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(boxLeft, row3Top);
    ctx.lineTo(boxLeft, row3Bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(boxRight, row3Top);
    ctx.lineTo(boxRight, row3Bottom);
    ctx.stroke();

    // Separatore orizzontale nella colonna destra (divide codice e data)
    const row3Mid = row3Top + 45;
    ctx.beginPath();
    ctx.moveTo(midX, row3Mid);
    ctx.lineTo(boxRight, row3Mid);
    ctx.stroke();

    // Poetic title a sinistra (multilinea)
    ctx.fillStyle = RED;
    ctx.font = `400 13px ${MONO}`;
    const poeticLines = wrap(poetic.title, 28);
    poeticLines.forEach((ln, i) => {
      ctx.fillText(ln, boxLeft + 16, row3Top + 28 + i * 18);
    });

    // Codice in alto a destra
    ctx.fillStyle = RED;
    ctx.font = `400 13px ${MONO}`;
    ctx.fillText(shape.code, midX + 16, row3Top + 28);

    // Data in basso a destra
    ctx.fillStyle = RED;
    ctx.font = `400 16px ${MONO}`;
    ctx.fillText('27 Giugno 2026', midX + 16, row3Mid + 30);

    // Bordo esterno della griglia
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(boxLeft, gridTop, boxRight - boxLeft, row3Bottom - gridTop);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shape.code}-badge.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }, [shapeSVGForBadge, name, poetic, shape.code]);

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
