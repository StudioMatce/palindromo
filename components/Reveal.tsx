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

  // Badge PNG — layout fedele al visual TEDxConegliano
  const downloadPNG = useCallback(async () => {
    const W = 1080;
    const H = 1920;
    const RED = '#eb0028';
    const BG = '#f0efed';
    const MONO = '"DM Mono", ui-monospace, monospace';
    const PAD = 56;
    const LINE_W = 1.5;

    // --- Misure layout ---
    const logoAreaH = 120;
    const boxW = W - PAD * 2;
    const boxH = boxW; // box quadrato per la X
    const ROW_H = 90;
    // Griglia superiore: 3 righe (Palindromo | payoff+luogo | vuoto+data)
    const upperGridH = ROW_H * 3;
    // Gap tra griglia superiore e sezione inferiore
    const GAP = 50;
    // Griglia inferiore: 2 righe (nome+poeticTitle | poeticDesc)
    const lowerRow1H = 90;
    const lowerRow2H = 80;
    const lowerGridH = lowerRow1H + lowerRow2H;
    // Label "codice" tra le due griglie
    const codeLabelH = 40;

    const totalH = logoAreaH + boxH + upperGridH + GAP + codeLabelH + lowerGridH;
    const topOffset = (H - totalH) / 2;

    const L = PAD; // left
    const R = W - PAD; // right
    const boxTop = topOffset + logoAreaH;
    const boxBottom = boxTop + boxH;

    // Griglia superiore
    const ugTop = boxBottom; // attaccata al box
    const ugR1 = ugTop + ROW_H;
    const ugR2 = ugR1 + ROW_H;
    const ugR3 = ugR2 + ROW_H;
    const midX = L + boxW * 0.5; // colonna centrale al 50%

    // Sezione inferiore
    const codeY = ugR3 + GAP;
    const lgTop = codeY + codeLabelH;
    const lgR1 = lgTop + lowerRow1H;
    const lgR2 = lgR1 + lowerRow2H;

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
    ctx.drawImage(logoImg, PAD, topOffset + (logoAreaH - logoH) / 2, logoW, logoH);

    // --- Box X con padding ---
    const xImg = await loadImage(
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(shapeSVGForBadge)))
    );
    const xPad = boxW * 0.08;
    ctx.drawImage(xImg, L + xPad, boxTop + xPad, boxW - xPad * 2, boxH - xPad * 2);

    // Bordo del box
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;
    ctx.strokeRect(L, boxTop, boxW, boxH);

    // === GRIGLIA SUPERIORE ===
    // Bordo esterno (include box + griglia come unico blocco continuo)
    ctx.strokeRect(L, ugTop, boxW, upperGridH);

    // Separatori orizzontali
    [ugR1, ugR2].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(L, y);
      ctx.lineTo(R, y);
      ctx.stroke();
    });

    // Linea verticale centrale (solo righe 2 e 3)
    ctx.beginPath();
    ctx.moveTo(midX, ugR1);
    ctx.lineTo(midX, ugR3);
    ctx.stroke();

    // --- Testi griglia superiore ---
    ctx.fillStyle = RED;
    ctx.textAlign = 'left';

    // Riga 1: "Palindromo"
    ctx.font = `400 42px ${MONO}`;
    ctx.fillText('Palindromo', L + 24, ugR1 - 28);

    // Riga 2 sinistra: payoff
    ctx.font = `400 18px ${MONO}`;
    const payoffLines = wrap('Apparente uguale, reale diverso', 20);
    payoffLines.forEach((ln, i) => {
      ctx.fillText(ln, L + 24, ugR1 + 34 + i * 24);
    });

    // Riga 2 destra: luogo
    ctx.font = `400 18px ${MONO}`;
    const locationLines = wrap('Scuola Enologica Cerletti Conegliano', 18);
    locationLines.forEach((ln, i) => {
      ctx.fillText(ln, midX + 24, ugR1 + 34 + i * 24);
    });

    // Riga 3 destra: data
    ctx.font = `400 20px ${MONO}`;
    ctx.fillText('27 Giugno 2026', midX + 24, ugR2 + 38);

    // === LABEL CODICE ===
    ctx.font = `400 16px ${MONO}`;
    ctx.fillStyle = RED;
    ctx.fillText(shape.code, L + 4, codeY + codeLabelH - 8);

    // === GRIGLIA INFERIORE ===
    ctx.strokeStyle = RED;
    ctx.lineWidth = LINE_W;

    // Riga 1: nome | titolo poetico
    ctx.strokeRect(L, lgTop, boxW, lowerRow1H);
    // Linea verticale
    ctx.beginPath();
    ctx.moveTo(midX, lgTop);
    ctx.lineTo(midX, lgR1);
    ctx.stroke();

    // Riga 2: descrizione poetica (full width, bordo solo laterale e sotto)
    ctx.strokeRect(L, lgR1, boxW, lowerRow2H);

    // --- Testi griglia inferiore ---
    ctx.fillStyle = RED;

    // Nome
    ctx.font = `400 18px ${MONO}`;
    const userName = name || 'Nome\nCognome';
    const nameLines = userName.includes(' ')
      ? [userName.split(' ').slice(0, -1).join(' '), userName.split(' ').slice(-1)[0]]
      : userName.split('\n');
    nameLines.forEach((ln, i) => {
      ctx.fillText(ln, L + 24, lgTop + 34 + i * 24);
    });

    // Titolo poetico
    ctx.font = `400 17px ${MONO}`;
    const titleLines = wrap(poetic.title, 20);
    titleLines.forEach((ln, i) => {
      ctx.fillText(ln, midX + 24, lgTop + 34 + i * 22);
    });

    // Descrizione poetica (full width)
    ctx.font = `400 16px ${MONO}`;
    const descLines = wrap(poetic.desc, 48);
    descLines.forEach((ln, i) => {
      ctx.fillText(ln, L + 24, lgR1 + 30 + i * 22);
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
