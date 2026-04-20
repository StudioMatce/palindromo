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

  // SVG della X senza sfondo (per il badge, lo sfondo è già sul canvas)
  const shapeSVGForBadge = useMemo(
    () =>
      toSVGString({
        size: 400,
        color: '#eb0028',
        bg: 'transparent',
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
    // Formato 9:16 verticale (standard Instagram/TikTok story)
    const W = 1080;
    const H = 1920;
    const RED = '#eb0028';
    const BG = '#f0efed';
    const MONO = '"DM Mono", ui-monospace, monospace';
    const PAD = 56;
    const LINE_W = 1.5;
    const BOX_PAD = 32; // padding interno del box della X

    // Misure layout proporzionate al 9:16
    const logoAreaH = 140;
    const boxTop = PAD + logoAreaH;
    const boxLeft = PAD;
    const boxRight = W - PAD;
    const boxW = boxRight - boxLeft;

    // Griglia: 3 righe sotto il box
    const ROW_H = 110;
    const gridH = ROW_H * 3;
    // Il box della X occupa tutto lo spazio tra logo e griglia
    const boxBottom = H - PAD - gridH;
    const boxH = boxBottom - boxTop;

    const gridTop = boxBottom;
    const row1Bottom = gridTop + ROW_H;
    const row2Bottom = row1Bottom + ROW_H;
    const row3Bottom = row2Bottom + ROW_H;
    const midX = boxLeft + boxW * 0.55;

    const canvas = document.createElement('canvas');
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    // Sfondo chiaro
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // --- Logo TEDxConegliano in alto ---
    const logoImg = await loadImage('/tedx-logo-dark.svg');
    const logoH = 70;
    const logoW = logoImg.naturalWidth
      ? (logoImg.naturalWidth / logoImg.naturalHeight) * logoH
      : logoH * 6.8;
    ctx.drawImage(logoImg, PAD, PAD + 20, logoW, logoH);

    // --- Box principale con la X ---
    // Prima disegna la X (senza sfondo, solo la forma rossa)
    const xImg = await loadImage(
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(shapeSVGForBadge)))
    );
    // La X va dentro il box con padding
    const xAreaW = boxW - BOX_PAD * 2;
    const xAreaH = boxH - BOX_PAD * 2;
    const xSize = Math.min(xAreaW, xAreaH);
    const xLeft = boxLeft + BOX_PAD + (xAreaW - xSize) / 2;
    const xTop = boxTop + BOX_PAD + (xAreaH - xSize) / 2;
    ctx.drawImage(xImg, xLeft, xTop, xSize, xSize);

    // Bordo rosso del box (disegnato DOPO la X, così copre eventuali sbavature)
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(boxLeft, boxTop, boxW, boxH);

    // --- Griglia info ---
    // Bordo esterno della griglia
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(boxLeft, gridTop, boxW, row3Bottom - gridTop);

    // Linea verticale centrale (solo dentro la griglia)
    ctx.beginPath();
    ctx.moveTo(midX, gridTop);
    ctx.lineTo(midX, row3Bottom);
    ctx.stroke();

    // Riga 1: separatore in basso
    ctx.beginPath();
    ctx.moveTo(boxLeft, row1Bottom);
    ctx.lineTo(boxRight, row1Bottom);
    ctx.stroke();

    // Riga 2: separatore in basso
    ctx.beginPath();
    ctx.moveTo(boxLeft, row2Bottom);
    ctx.lineTo(boxRight, row2Bottom);
    ctx.stroke();

    // Separatore orizzontale nella colonna destra (riga 3: divide codice e data)
    const row3Mid = row2Bottom + ROW_H / 2;
    ctx.beginPath();
    ctx.moveTo(midX, row3Mid);
    ctx.lineTo(boxRight, row3Mid);
    ctx.stroke();

    // --- Testi ---
    ctx.fillStyle = RED;
    ctx.textAlign = 'left';

    // Riga 1: "Palindromo"
    ctx.font = `400 46px ${MONO}`;
    ctx.fillText('Palindromo', boxLeft + 24, row1Bottom - 32);

    // Riga 2 sinistra: payoff
    ctx.font = `400 20px ${MONO}`;
    const payoffLines = wrap('Apparente uguale, reale diverso', 22);
    payoffLines.forEach((ln, i) => {
      ctx.fillText(ln, boxLeft + 24, row1Bottom + 38 + i * 26);
    });

    // Riga 2 destra: nome
    ctx.font = `400 20px ${MONO}`;
    const userName = name || 'Anonimo';
    ctx.fillText(userName, midX + 24, row1Bottom + 38);

    // Riga 3 sinistra: titolo poetico
    ctx.font = `400 17px ${MONO}`;
    const poeticLines = wrap(poetic.title, 26);
    poeticLines.forEach((ln, i) => {
      ctx.fillText(ln, boxLeft + 24, row2Bottom + 34 + i * 22);
    });

    // Riga 3 destra sopra: codice
    ctx.font = `400 17px ${MONO}`;
    ctx.fillText(shape.code, midX + 24, row2Bottom + 34);

    // Riga 3 destra sotto: data
    ctx.font = `400 20px ${MONO}`;
    ctx.fillText('27 Giugno 2026', midX + 24, row3Mid + 34);

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
