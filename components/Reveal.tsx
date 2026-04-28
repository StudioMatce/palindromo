'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ComputedShape, toSVGString, personalizeShape } from '@/lib/shape';
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

  // La shape viene personalizzata in base al nome: piccole variazioni deterministiche
  const personalizedShape = useMemo(
    () => personalizeShape(shape, name),
    [shape, name],
  );

  const poetic = useMemo(() => poeticLabel(shape.rawX, shape.rawY), [shape.rawX, shape.rawY]);

  // SVG della X senza sfondo (per il badge, lo sfondo è già sul canvas)
  const shapeSVGForBadge = useMemo(
    () =>
      toSVGString({
        size: 400,
        color: '#eb0028',
        bg: 'transparent',
        innerSize: personalizedShape.innerSize,
        offsetX: personalizedShape.offsetX,
        offsetY: personalizedShape.offsetY,
        wA: personalizedShape.wA,
        wB: personalizedShape.wB,
        wC: personalizedShape.wC,
        wD: personalizedShape.wD,
      }),
    [personalizedShape],
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
      'DTSTART:20260627T170000',
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

  // Badge PNG — coordinate esatte dal file SVG di riferimento (1080×1920)
  const downloadPNG = useCallback(async () => {
    const W = 1080;
    const H = 1920;
    const RED = '#e1152d';
    const BLACK = '#000000';
    const BG = '#f5f5f5';
    const MONO = '"DM Mono", ui-monospace, monospace';
    const LINE_W = 2.27;

    // Coordinate esatte dall'SVG di riferimento
    const L = 87.8;        // margine sinistro
    const FULL_W = 904.4;  // larghezza totale (L→992.2)
    const HALF_W = 452.2;  // metà larghezza
    const MID = 540;       // punto medio (87.8 + 452.2)
    const ROW_H = 125.1;   // altezza riga griglia

    // Box X
    const boxTop = 223.96;
    const boxH = 906.74;
    const boxBottom = boxTop + boxH; // 1130.7

    // Griglia superiore (bordi rossi)
    const ugR1Top = boxBottom;           // 1130.7  — "Palindromo" (solo sinistra)
    const ugR1Bottom = ugR1Top + ROW_H;  // 1255.8
    const ugR2Top = ugR1Bottom;          // 1255.8  — payoff + luogo
    const ugR2Bottom = ugR2Top + ROW_H;  // 1380.9
    const ugR3Top = ugR2Bottom;          // 1380.9  — data (solo destra)
    // Griglia inferiore (bordi neri)
    const lgR1Top = 1590.2;              // nome + titolo poetico
    const lgR1Bottom = lgR1Top + ROW_H;  // 1715.31
    const lgR2Top = lgR1Bottom;          // 1715.31 — descrizione poetica
    const canvas = document.createElement('canvas');
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    // Sfondo
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // --- Logo TEDxConegliano ---
    const logoImg = await loadImage('/tedx-logo-dark.svg');
    const logoH = 70;
    const logoW = logoImg.naturalWidth
      ? (logoImg.naturalWidth / logoImg.naturalHeight) * logoH
      : logoH * 6.8;
    ctx.drawImage(logoImg, L, 110, logoW, logoH);

    // --- Box X con padding ---
    const xImg = await loadImage(
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(shapeSVGForBadge)))
    );
    const xPad = FULL_W * 0.06;
    ctx.drawImage(xImg, L + xPad, boxTop + xPad, FULL_W - xPad * 2, boxH - xPad * 2);

    // Bordo rosso del box X
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(L, boxTop, FULL_W, boxH);

    // === GRIGLIA SUPERIORE (bordi rossi) ===
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;

    // Riga 1: "Palindromo" — solo cella sinistra
    ctx.strokeRect(L, ugR1Top, HALF_W, ROW_H);

    // Riga 2: due celle (payoff | luogo)
    ctx.strokeRect(L, ugR2Top, HALF_W, ROW_H);
    ctx.strokeRect(MID, ugR2Top, HALF_W, ROW_H);

    // Riga 3: solo cella destra (data)
    ctx.strokeRect(MID, ugR3Top, HALF_W, ROW_H);

    // --- Testi griglia superiore (rossi) ---
    ctx.fillStyle = RED;
    ctx.textAlign = 'left';

    // "Palindromo"
    ctx.font = `400 50px ${MONO}`;
    ctx.fillText('Palindromo', L + 24, ugR1Bottom - 38);

    // Payoff (sinistra riga 2)
    ctx.font = `400 32px ${MONO}`;
    const payoffLines = wrap('Apparente uguale, reale diverso', 21);
    payoffLines.forEach((ln, i) => {
      ctx.fillText(ln, L + 24, ugR2Top + 50 + i * 38);
    });

    // Luogo (destra riga 2)
    ctx.font = `400 32px ${MONO}`;
    const locationLines = wrap('Scuola Enologica Cerletti Conegliano', 21);
    locationLines.forEach((ln, i) => {
      ctx.fillText(ln, MID + 24, ugR2Top + 50 + i * 38);
    });

    // Data (destra riga 3)
    ctx.font = `400 32px ${MONO}`;
    ctx.fillText('27 Giugno 2026', MID + 24, ugR3Top + 52);

    // === LABEL CODICE (tra le due griglie, senza bordo) ===
    ctx.font = `400 32px ${MONO}`;
    ctx.fillStyle = BLACK;
    ctx.fillText(shape.code, L + 8, 1568);

    // === GRIGLIA INFERIORE (bordi neri) ===
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = LINE_W;

    // Riga 1: nome (sinistra) | titolo poetico (destra)
    ctx.strokeRect(L, lgR1Top, HALF_W, ROW_H);
    ctx.strokeRect(MID, lgR1Top, HALF_W, ROW_H);

    // Riga 2: descrizione poetica (full width)
    ctx.strokeRect(L, lgR2Top, FULL_W, ROW_H);

    // --- Testi griglia inferiore (neri) ---
    ctx.fillStyle = BLACK;

    // Nome (sinistra)
    ctx.font = `400 32px ${MONO}`;
    const userName = name || 'Nome\nCognome';
    const nameLines = userName.includes(' ')
      ? [userName.split(' ').slice(0, -1).join(' '), userName.split(' ').slice(-1)[0]]
      : userName.split('\n');
    nameLines.forEach((ln, i) => {
      ctx.fillText(ln, L + 24, lgR1Top + 50 + i * 38);
    });

    // Titolo poetico (destra)
    ctx.font = `400 32px ${MONO}`;
    const titleLines = wrap(poetic.title, 21);
    titleLines.forEach((ln, i) => {
      ctx.fillText(ln, MID + 24, lgR1Top + 50 + i * 38);
    });

    // Descrizione poetica (full width)
    ctx.font = `400 32px ${MONO}`;
    const descLines = wrap(poetic.desc, 45);
    descLines.forEach((ln, i) => {
      ctx.fillText(ln, L + 24, lgR2Top + 48 + i * 38);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shape.code}-badge.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }, [shapeSVGForBadge, name, poetic, personalizedShape.code]);

  return (
    <div className="reveal-screen">
      <div className="reveal-content">
        {/* Eyebrow */}
        <div className="reveal-eyebrow">la tua X</div>

        {/* La X personale — si adatta in tempo reale al nome */}
        <div className="reveal-shape">
          <XShape
            size={260}
            color="#eb0028"
            transition
            innerSize={personalizedShape.innerSize}
            offsetX={personalizedShape.offsetX}
            offsetY={personalizedShape.offsetY}
            wA={personalizedShape.wA}
            wB={personalizedShape.wB}
            wC={personalizedShape.wC}
            wD={personalizedShape.wD}
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
        <div className="reveal-code">{personalizedShape.code}</div>

        {/* Quadrato semiotico */}
        <div style={{ marginTop: 80 }}>
          <SemioticSquare X={shape.rawX} Y={shape.rawY} />
        </div>

        {/* Titolo poetico */}
        <div className="reveal-poetic-title">{poetic.title}</div>
        <div className="reveal-poetic-desc">{poetic.desc}</div>

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
