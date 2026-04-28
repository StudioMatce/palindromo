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

  // Genera file .ics per salvare l'evento nel calendario
  const saveToCalendar = useCallback(() => {
    // L'evento è il 27 Giugno 2026 — usiamo un orario indicativo (18:00-22:00)
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TEDxConegliano//Palindromo//IT',
      'BEGIN:VEVENT',
      'DTSTART:20260627T180000',
      'DTEND:20260627T220000',
      'SUMMARY:TEDxConegliano — Palindromo',
      'LOCATION:Scuola Enologica Cerletti\\, Conegliano (TV)',
      'DESCRIPTION:Apparente uguale\\, reale diverso. Il tuo codice: ' + shape.code,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tedx-palindromo.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [shape.code]);

  // Badge PNG nello stile del visual TEDxConegliano:
  // sfondo chiaro, griglia rossa, logo in alto, X grande, info in basso
  const downloadPNG = useCallback(async () => {
    // Formato 9:16 verticale (standard Instagram/TikTok story)
    const W = 1080;
    const H = 1920;
    const RED = '#eb0028';
    const BG = '#f0efed';
    const MONO = '"DM Mono", ui-monospace, monospace';
    const SIDE_PAD = 56;
    const LINE_W = 1.5;

    // Dimensioni dei blocchi
    const logoAreaH = 120; // spazio per il logo sopra il box
    const boxW = W - SIDE_PAD * 2;
    const boxH = boxW; // box quadrato, la X è quadrata
    const ROW_H = 90;
    const gridH = ROW_H * 4; // 4 righe: titolo, payoff+nome, poetica+codice, data+luogo

    // Altezza totale della composizione
    const totalH = logoAreaH + boxH + gridH;
    // Centrata verticalmente nel canvas
    const topOffset = (H - totalH) / 2;

    const boxLeft = SIDE_PAD;
    const boxRight = W - SIDE_PAD;
    const boxTop = topOffset + logoAreaH;
    const boxBottom = boxTop + boxH;

    const gridTop = boxBottom;
    const row1Bottom = gridTop + ROW_H;
    const row2Bottom = row1Bottom + ROW_H;
    const row3Bottom = row2Bottom + ROW_H;
    const row4Bottom = row3Bottom + ROW_H;
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
    // Logo centrato verticalmente nell'area logo, allineato a sinistra
    ctx.drawImage(logoImg, SIDE_PAD, topOffset + (logoAreaH - logoH) / 2, logoW, logoH);

    // --- Box principale con la X (con padding interno) ---
    const xImg = await loadImage(
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(shapeSVGForBadge)))
    );
    // Padding interno per non far toccare la X ai bordi del box
    const xPad = boxW * 0.12;
    ctx.drawImage(xImg, boxLeft + xPad, boxTop + xPad, boxW - xPad * 2, boxH - xPad * 2);

    // Bordo rosso del box (disegnato DOPO la X, così copre eventuali sbavature)
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(boxLeft, boxTop, boxW, boxH);

    // --- Griglia info ---
    // Bordo esterno della griglia
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(boxLeft, gridTop, boxW, row4Bottom - gridTop);

    // Linea verticale centrale (righe 2-4)
    ctx.beginPath();
    ctx.moveTo(midX, row1Bottom);
    ctx.lineTo(midX, row4Bottom);
    ctx.stroke();

    // Separatori orizzontali tra le righe
    [row1Bottom, row2Bottom, row3Bottom].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(boxLeft, y);
      ctx.lineTo(boxRight, y);
      ctx.stroke();
    });

    // --- Testi ---
    ctx.fillStyle = RED;
    ctx.textAlign = 'left';

    // Riga 1: "Palindromo"
    ctx.font = `400 42px ${MONO}`;
    ctx.fillText('Palindromo', boxLeft + 24, row1Bottom - 28);

    // Riga 2 sinistra: payoff
    ctx.font = `400 18px ${MONO}`;
    const payoffLines = wrap('Apparente uguale, reale diverso', 24);
    payoffLines.forEach((ln, i) => {
      ctx.fillText(ln, boxLeft + 24, row1Bottom + 34 + i * 24);
    });

    // Riga 2 destra: nome
    ctx.font = `400 18px ${MONO}`;
    const userName = name || 'Anonimo';
    ctx.fillText(userName, midX + 24, row1Bottom + 34);

    // Riga 3 sinistra: titolo poetico
    ctx.font = `400 16px ${MONO}`;
    const poeticLines = wrap(poetic.title, 28);
    poeticLines.forEach((ln, i) => {
      ctx.fillText(ln, boxLeft + 24, row2Bottom + 32 + i * 22);
    });

    // Riga 3 destra: codice
    ctx.font = `400 16px ${MONO}`;
    ctx.fillText(shape.code, midX + 24, row2Bottom + 32);

    // Riga 4 sinistra: data evento
    ctx.font = `400 18px ${MONO}`;
    ctx.fillText('Sabato 27 Giugno 2026', boxLeft + 24, row3Bottom + 34);

    // Riga 4 destra: luogo evento
    ctx.font = `400 15px ${MONO}`;
    ctx.fillText('Scuola Enologica Cerletti', midX + 24, row3Bottom + 28);
    ctx.fillText('Conegliano', midX + 24, row3Bottom + 50);

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

        {/* Info evento */}
        <div className="reveal-event-info">
          <p className="reveal-event-date">Sabato 27 Giugno 2026</p>
          <p className="reveal-event-location">Scuola Enologica Cerletti, Conegliano</p>
        </div>

        {/* Bottoni azione */}
        <div className="reveal-buttons">
          <button onClick={downloadPNG} className="dl-btn">
            Scarica badge PNG
          </button>
          <button onClick={saveToCalendar} className="dl-btn dl-btn--secondary">
            Salva nel calendario
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
