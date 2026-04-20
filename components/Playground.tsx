'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { buildPath, toSVGString, clamp, type ShapeParams } from '@/lib/shape';

const COLORS = ['#eb0028', '#000000', '#f2f2f2', '#ffffff'];

const DEFAULT_SHAPE: Required<ShapeParams> = {
  innerSize: 80,
  offsetX: 0,
  offsetY: 0,
  wA: 60,
  wB: 60,
  wC: 60,
  wD: 60,
  clampCorners: false,
};

// Slider con etichetta e valore
function Slider({
  label, value, min, max, onChange, onRandom, clampedValue, showClamp,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onRandom?: () => void;
  clampedValue?: number;
  showClamp?: boolean;
}) {
  const isClamped = showClamp && clampedValue !== undefined && clampedValue !== value;
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="pg-slider-header">
        <span className="pg-slider-label">{label}</span>
        <span
          className="pg-slider-value"
          style={{
            color: isClamped ? '#eb8a28' : '#f2f2f2',
            textDecoration: isClamped ? 'line-through' : 'none',
          }}
        >
          {Math.round(value)}
          {isClamped && (
            <span style={{ marginLeft: 6, color: '#eb8a28', textDecoration: 'none' }}>
              → {Math.round(clampedValue!)}
            </span>
          )}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="pg-range"
          style={{ flex: 1 }}
        />
        {onRandom && (
          <button className="pg-iconbtn" onClick={onRandom} title="Random">↯</button>
        )}
      </div>
    </div>
  );
}

// Mappa 2D per la posizione
function PositionMap({
  offsetX, offsetY, innerSize, onChange,
}: {
  offsetX: number;
  offsetY: number;
  innerSize: number;
  onChange: (x: number, y: number) => void;
}) {
  const W = 232;
  const maxOff = 170 - innerSize;
  const ref = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const nx = maxOff > 0 ? offsetX / maxOff : 0;
  const ny = maxOff > 0 ? offsetY / maxOff : 0;

  const pad = 20;
  const inner = W - pad * 2;
  const px = pad + inner / 2 + (nx * inner) / 2;
  const py = pad + inner / 2 + (ny * inner) / 2;

  const handle = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pad) / inner;
      const y = (e.clientY - rect.top - pad) / inner;
      const nX = clamp((x - 0.5) * 2, -1, 1);
      const nY = clamp((y - 0.5) * 2, -1, 1);
      onChange(nX * maxOff, nY * maxOff);
    },
    [onChange, maxOff, inner],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => handle(e);
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, handle]);

  const ghosts = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [0, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1],
  ];

  return (
    <div style={{ marginBottom: 18 }}>
      <div className="pg-slider-label" style={{ marginBottom: 8 }}>Posizione</div>
      <svg
        ref={ref}
        width={W}
        height={W}
        viewBox={`0 0 ${W} ${W}`}
        style={{ display: 'block', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', maxWidth: '100%', height: 'auto' }}
        onMouseDown={(e) => { setDragging(true); handle(e); }}
      >
        <rect x={pad} y={pad} width={inner} height={inner} fill="none" stroke="rgba(100,200,255,0.4)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1={pad} y1={W / 2} x2={W - pad} y2={W / 2} stroke="#222" strokeWidth="1" />
        <line x1={W / 2} y1={pad} x2={W / 2} y2={W - pad} stroke="#222" strokeWidth="1" />
        {ghosts.map(([gx, gy], i) => (
          <circle key={i} cx={pad + inner / 2 + (gx * inner) / 2} cy={pad + inner / 2 + (gy * inner) / 2} r="2" fill="#333" />
        ))}
        <circle cx={px} cy={py} r="8" fill="#eb0028" opacity="0.2" />
        <circle cx={px} cy={py} r="4" fill="#eb0028" />
      </svg>
      <div className="pg-position-coords">
        <span>X {nx.toFixed(2)}</span>
        <span>Y {(-ny).toFixed(2)}</span>
      </div>
    </div>
  );
}

// Palette colori
function Palette({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="pg-slider-label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 28,
              height: 28,
              padding: 0,
              background: c,
              border: value === c ? '2px solid #eb0028' : '1px solid #333',
              cursor: 'pointer',
              outline: 'none',
            }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}

// Toggle switch
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="pg-toggle">
      <span style={{ color: '#aaa' }}>{label}</span>
      <span className="pg-toggle-track" style={{ background: value ? '#eb0028' : '#222' }}>
        <span className="pg-toggle-thumb" style={{ left: value ? 16 : 2 }} />
      </span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
    </label>
  );
}

interface PlaygroundShape {
  innerSize: number;
  offsetX: number;
  offsetY: number;
  wA: number;
  wB: number;
  wC: number;
  wD: number;
  clampCorners?: boolean;
}

interface PlaygroundProps {
  initialShape?: PlaygroundShape | null;
}

export default function Playground({ initialShape }: PlaygroundProps) {
  const [shape, setShape] = useState<PlaygroundShape>(() => initialShape || { ...DEFAULT_SHAPE });
  const [color, setColor] = useState('#eb0028');
  const [bg, setBg] = useState('#000000');
  const [showInner, setShowInner] = useState(false);
  const [showOuter, setShowOuter] = useState(false);
  const [clampCorners, setClampCorners] = useState(false);
  const [transition, setTransition] = useState(true);
  const [playing, setPlaying] = useState(false);
  const originalShape = useRef(initialShape || null);

  const set = (k: keyof PlaygroundShape, v: number) => setShape((s) => ({ ...s, [k]: v }));
  const sMany = (patch: Partial<PlaygroundShape>) => setShape((s) => ({ ...s, ...patch }));

  // Loop di animazione automatica
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const r = () => 30 + Math.floor(Math.random() * 60);
      const innerSize = 40 + Math.floor(Math.random() * 55);
      const maxOff = 170 - innerSize;
      sMany({
        innerSize,
        offsetX: (Math.random() * 2 - 1) * maxOff,
        offsetY: (Math.random() * 2 - 1) * maxOff,
        wA: r(), wB: r(), wC: r(), wD: r(),
      });
    }, 1200);
    return () => clearInterval(t);
  }, [playing]);

  // Calcolo valori clamped per preview
  const cx = 200 + shape.offsetX;
  const cy = 200 + shape.offsetY;
  const horizLimit = 2 * Math.min(cx - 30, 370 - cx);
  const vertLimit = 2 * Math.min(cy - 30, 370 - cy);
  const wAc = clamp(shape.wA, 0, Math.max(0, horizLimit));
  const wBc = clamp(shape.wB, 0, Math.max(0, vertLimit));
  const wCc = clamp(shape.wC, 0, Math.max(0, horizLimit));
  const wDc = clamp(shape.wD, 0, Math.max(0, vertLimit));

  const randomAll = () => {
    const r = () => 30 + Math.floor(Math.random() * 60);
    const innerSize = 40 + Math.floor(Math.random() * 55);
    const maxOff = 170 - innerSize;
    sMany({
      innerSize,
      offsetX: (Math.random() * 2 - 1) * maxOff,
      offsetY: (Math.random() * 2 - 1) * maxOff,
      wA: r(), wB: r(), wC: r(), wD: r(),
    });
  };

  // Drag del quadrato interno sul canvas
  const [draggingInner, setDraggingInner] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);
  const canvasDrag = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 400;
      const my = ((e.clientY - rect.top) / rect.height) * 400;
      const maxOff = 170 - shape.innerSize;
      setShape((s) => ({
        ...s,
        offsetX: clamp(mx - 200, -maxOff, maxOff),
        offsetY: clamp(my - 200, -maxOff, maxOff),
      }));
    },
    [shape.innerSize],
  );

  useEffect(() => {
    if (!draggingInner) return;
    const onMove = (e: MouseEvent) => canvasDrag(e);
    const onUp = () => setDraggingInner(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingInner, canvasDrag]);

  const resetToOriginal = () => {
    if (originalShape.current) {
      setShape({ ...originalShape.current });
    }
  };

  const downloadPNG = async () => {
    const svg = toSVGString({
      size: 1200,
      color,
      bg,
      innerSize: shape.innerSize,
      offsetX: shape.offsetX,
      offsetY: shape.offsetY,
      wA: shape.wA, wB: shape.wB, wC: shape.wC, wD: shape.wD,
      clampCorners,
    });
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); });
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 1200;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1200, 1200);
    ctx.drawImage(img, 0, 0, 1200, 1200);
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'palindromo-x.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  return (
    <div className="pg-screen" style={{ background: bg }}>
      {/* Area canvas */}
      <div className="pg-canvas-area">
        <div className="pg-canvas-wrapper">
          <svg
            ref={canvasRef}
            width="100%"
            height="100%"
            viewBox="0 0 400 400"
            style={{ display: 'block', cursor: draggingInner ? 'grabbing' : 'default' }}
          >
            {showOuter && (
              <rect x="0" y="0" width="400" height="400" fill="none" stroke="rgba(100,200,255,0.4)" strokeWidth="1" strokeDasharray="4 4" />
            )}
            <path
              d={buildPath({ ...shape, clampCorners })}
              fill={color}
              fillRule="evenodd"
              style={{ transition: transition ? 'd 0.6s cubic-bezier(0.22,1,0.36,1)' : 'none' }}
            />
            {/* Area draggabile del quadrato interno */}
            {showInner && (
              <rect
                x={200 + shape.offsetX - shape.innerSize}
                y={200 + shape.offsetY - shape.innerSize}
                width={shape.innerSize * 2}
                height={shape.innerSize * 2}
                fill="rgba(100,200,255,0.05)"
                stroke="rgba(100,200,255,0.4)"
                strokeWidth="1"
                strokeDasharray="3 3"
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => { setDraggingInner(true); canvasDrag(e); }}
              />
            )}
            {!showInner && (
              <rect
                x={200 + shape.offsetX - shape.innerSize}
                y={200 + shape.offsetY - shape.innerSize}
                width={shape.innerSize * 2}
                height={shape.innerSize * 2}
                fill="transparent"
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => { setDraggingInner(true); canvasDrag(e); }}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Pannello laterale */}
      <aside className="pg-panel">
        {originalShape.current && (
          <button onClick={resetToOriginal} className="pg-reset">
            &larr; torna alla tua X
          </button>
        )}

        <div className="pg-panel-title">Playground</div>

        <Slider
          label="Dimensione"
          value={shape.innerSize}
          min={30}
          max={100}
          onChange={(v) => set('innerSize', v)}
          onRandom={() => set('innerSize', 30 + Math.floor(Math.random() * 70))}
        />

        <PositionMap
          offsetX={shape.offsetX}
          offsetY={shape.offsetY}
          innerSize={shape.innerSize}
          onChange={(x, y) => sMany({ offsetX: x, offsetY: y })}
        />

        <Slider label="A" value={shape.wA} min={20} max={100}
          onChange={(v) => set('wA', v)}
          onRandom={() => set('wA', 20 + Math.floor(Math.random() * 80))}
          clampedValue={wAc} showClamp={clampCorners}
        />
        <Slider label="B" value={shape.wB} min={20} max={100}
          onChange={(v) => set('wB', v)}
          onRandom={() => set('wB', 20 + Math.floor(Math.random() * 80))}
          clampedValue={wBc} showClamp={clampCorners}
        />
        <Slider label="C" value={shape.wC} min={20} max={100}
          onChange={(v) => set('wC', v)}
          onRandom={() => set('wC', 20 + Math.floor(Math.random() * 80))}
          clampedValue={wCc} showClamp={clampCorners}
        />
        <Slider label="D" value={shape.wD} min={20} max={100}
          onChange={(v) => set('wD', v)}
          onRandom={() => set('wD', 20 + Math.floor(Math.random() * 80))}
          clampedValue={wDc} showClamp={clampCorners}
        />

        <Palette label="Colore figura" value={color} onChange={setColor} />
        <Palette label="Colore sfondo" value={bg} onChange={setBg} />

        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 12, marginTop: 8 }}>
          <Toggle label="Quadrato interno" value={showInner} onChange={setShowInner} />
          <Toggle label="Quadrato esterno" value={showOuter} onChange={setShowOuter} />
          <Toggle label="Limita tacche angoli" value={clampCorners} onChange={setClampCorners} />
          <Toggle label="Transizione fluida" value={transition} onChange={setTransition} />
        </div>

        {/* Download */}
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="pg-bigbtn" onClick={downloadPNG}>Scarica PNG</button>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 6 }}>
          <button className="pg-bigbtn" onClick={() => setPlaying((p) => !p)} style={{ flex: 1 }}>
            {playing ? '\u25FC stop' : '\u25B6 play'}
          </button>
          <button className="pg-bigbtn" onClick={randomAll} title="Random all">↯</button>
        </div>
      </aside>
    </div>
  );
}
