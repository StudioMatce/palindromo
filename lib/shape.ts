// Motore della forma "X" — un quadrato 400x400 con 4 tacche triangolari
// ritagliate tramite fill-rule="evenodd".

const SIZE = 400;
const MARGIN = 30;

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export interface ShapeParams {
  innerSize?: number;
  offsetX?: number;
  offsetY?: number;
  wA?: number;
  wB?: number;
  wC?: number;
  wD?: number;
  clampCorners?: boolean;
}

export interface ComputedShape extends ShapeParams {
  innerSize: number;
  offsetX: number;
  offsetY: number;
  wA: number;
  wB: number;
  wC: number;
  wD: number;
  clampCorners: boolean;
  rawX: number;
  rawY: number;
  code: string;
}

// Costruisce il path SVG composto per la forma X
export function buildPath(params: ShapeParams): string {
  const {
    innerSize = 80,
    offsetX = 0,
    offsetY = 0,
    wA = 60,
    wB = 60,
    wC = 60,
    wD = 60,
    clampCorners = false,
  } = params;

  const maxOff = 170 - innerSize;
  const ox = clamp(offsetX, -maxOff, maxOff);
  const oy = clamp(offsetY, -maxOff, maxOff);

  // Centro del quadrato interno (il centro del canvas è 200,200)
  const cx = 200 + ox;
  const cy = 200 + oy;

  // Angoli del quadrato interno
  const iL = cx - innerSize;
  const iR = cx + innerSize;
  const iT = cy - innerSize;
  const iB = cy + innerSize;

  // Larghezze delle tacche
  let WA = wA, WB = wB, WC = wC, WD = wD;
  if (clampCorners) {
    const horizLimit = 2 * Math.min(cx - MARGIN, (SIZE - MARGIN) - cx);
    const vertLimit = 2 * Math.min(cy - MARGIN, (SIZE - MARGIN) - cy);
    WA = Math.min(wA, Math.max(0, horizLimit));
    WC = Math.min(wC, Math.max(0, horizLimit));
    WB = Math.min(wB, Math.max(0, vertLimit));
    WD = Math.min(wD, Math.max(0, vertLimit));
  }

  // Quadrato esterno (orario)
  const outer = `M 0 0 L ${SIZE} 0 L ${SIZE} ${SIZE} L 0 ${SIZE} Z`;

  // Ogni tacca è un triangolo con punta al bordo interno e base al bordo esterno
  const notchA = WA > 0
    ? `M ${cx - WA / 2} 0 L ${cx} ${iT} L ${cx + WA / 2} 0 Z`
    : '';
  const notchB = WB > 0
    ? `M ${SIZE} ${cy - WB / 2} L ${iR} ${cy} L ${SIZE} ${cy + WB / 2} Z`
    : '';
  const notchC = WC > 0
    ? `M ${cx + WC / 2} ${SIZE} L ${cx} ${iB} L ${cx - WC / 2} ${SIZE} Z`
    : '';
  const notchD = WD > 0
    ? `M 0 ${cy + WD / 2} L ${iL} ${cy} L 0 ${cy - WD / 2} Z`
    : '';

  return [outer, notchA, notchB, notchC, notchD].filter(Boolean).join(' ');
}

// Genera stringa SVG statica (per download)
export function toSVGString({
  size = 600,
  color = '#eb0028',
  bg = '#000000',
  ...rest
}: { size?: number; color?: string; bg?: string } & ShapeParams): string {
  const d = buildPath(rest);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><path d="${d}" fill="${color}" fill-rule="evenodd"/></svg>`;
}

export function maxOffset(innerSize: number) {
  return 170 - innerSize;
}

// Hash deterministico da stringa
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

// Generatore pseudo-random deterministico
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Calcola i parametri della forma dalle risposte del survey
export function computeShape(answers: (number | string)[]): ComputedShape {
  const [a, b, c, d, e, f, g] = answers;
  const rawY = ((a as number) + (b as number) + (c as number)) / 3;
  const rawX = ((d as number) + (e as number) + (f as number)) / 3;

  const seedStr = answers.map(String).join(',');
  const rng = mulberry32(hashSeed(seedStr));

  // Compressione non-lineare per evitare i bordi
  let Y = Math.tanh(rawY * 1.2) * 0.85;
  let X = Math.tanh(rawX * 1.2) * 0.85;

  X += (rng() - 0.5) * 0.3;
  Y += (rng() - 0.5) * 0.3;
  X = Math.max(-1, Math.min(1, X));
  Y = Math.max(-1, Math.min(1, Y));

  const big = g === 'grande' ? 35 : 0;
  const jitter = Math.round((rng() - 0.5) * 16);
  const innerSize = Math.max(60, Math.min(150, 100 + big + jitter));
  const maxOff = 170 - innerSize;

  const offsetX = X * maxOff;
  const offsetY = -Y * maxOff;

  const wA = 30 + Math.floor(rng() * 60);
  const wB = 30 + Math.floor(rng() * 60);
  const wC = 30 + Math.floor(rng() * 60);
  const wD = 30 + Math.floor(rng() * 60);

  // Codice identificativo tipo "X-R4T2-K8"
  const h = hashSeed(seedStr);
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const N = '0123456789';
  const pick = (pool: string, n: number) => {
    let s = '';
    let x = h;
    for (let i = 0; i < n; i++) {
      x = (x * 1103515245 + 12345) >>> 0;
      s += pool[x % pool.length];
    }
    return s;
  };
  const code = `X-${pick(A, 1)}${pick(N, 1)}${pick(A, 1)}${pick(N, 1)}-${pick(A, 1)}${pick(N, 1)}`;

  return {
    innerSize,
    offsetX,
    offsetY,
    wA,
    wB,
    wC,
    wD,
    clampCorners: false,
    rawX: X,
    rawY: Y,
    code,
  };
}

// Forma parziale durante il survey — le domande non risposte valgono 0
export function partialShape(partialAnswers: (number | string)[]): ComputedShape {
  const padded = [...partialAnswers];
  while (padded.length < 6) padded.push(0);
  if (padded.length < 7) padded.push('piccolo');
  return computeShape(padded);
}

// Genera varianti preview deterministiche per ogni domanda del survey
export function generatePreviewVariants() {
  const seeds = [11, 29, 47, 73, 101, 137, 181];
  return seeds.map((seed) => {
    const rng = mulberry32(seed);
    const innerSize = 60 + Math.floor(rng() * 90);
    const maxOff = 170 - innerSize;
    const ox = (rng() * 2 - 1) * maxOff * 0.7;
    const oy = (rng() * 2 - 1) * maxOff * 0.7;
    return {
      innerSize,
      offsetX: ox,
      offsetY: oy,
      wA: 25 + Math.floor(rng() * 55),
      wB: 25 + Math.floor(rng() * 55),
      wC: 25 + Math.floor(rng() * 55),
      wD: 25 + Math.floor(rng() * 55),
    };
  });
}
