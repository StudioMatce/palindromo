'use client';

import { buildPath, type ShapeParams } from '@/lib/shape';

interface XShapeProps extends ShapeParams {
  size?: number;
  color?: string;
  bg?: string;
  transition?: boolean;
  outline?: boolean;
  strokeWidth?: number;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export default function XShape({
  size = 260,
  color = '#eb0028',
  bg = 'transparent',
  transition = false,
  outline = false,
  strokeWidth = 8,
  style,
  ariaLabel = 'X',
  ...shapeParams
}: XShapeProps) {
  const d = buildPath(shapeParams);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      style={{ display: 'block', ...style }}
      role="img"
      aria-label={ariaLabel}
    >
      {bg && bg !== 'transparent' && (
        <rect x="0" y="0" width="400" height="400" fill={bg} />
      )}
      <path
        d={d}
        fill={outline ? 'none' : color}
        stroke={outline ? color : 'none'}
        strokeWidth={outline ? strokeWidth : 0}
        strokeLinejoin="miter"
        fillRule="evenodd"
        style={{
          transition: transition
            ? 'd 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none',
        }}
      />
    </svg>
  );
}
