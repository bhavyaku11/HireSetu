import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * HexagonBackground Component
 * Animate UI Hexagon Background tuned for HireSetu's full landing page backdrop.
 *
 * Features:
 * - Full-viewport fixed grid layer behind the entire landing page.
 * - Dark mode: Muted dark ink-glass borders with glowing --scanline (#45E0D8) accents on hover.
 * - Light mode: Muted slate-300 outlines with gentle indigo (#7C6FEF) accents on hover.
 * - Respects prefers-reduced-motion: disables hover transitions for reduced motion preference.
 * - Non-blocking pointer events overall so all landing page buttons and links remain fully interactive.
 */
export function HexagonBackground({
  className = '',
  children,
  hexagonProps,
  hexagonSize = 54, // Refined, technical grid scale
  hexagonMargin = 2,
  ...props
}) {
  const containerRef = useRef(null);
  const hexagonWidth = hexagonSize;
  const hexagonHeight = hexagonSize * 1.1;
  const rowSpacing = hexagonSize * 0.8;
  const baseMarginTop = -36 - 0.275 * (hexagonSize - 100);
  const computedMarginTop = baseMarginTop + hexagonMargin;
  const oddRowMarginLeft = -(hexagonSize / 2);
  const evenRowMarginLeft = hexagonMargin / 2;

  const [gridDimensions, setGridDimensions] = useState({
    rows: 0,
    columns: 0,
  });

  const isReducedMotionRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e) => {
      isReducedMotionRef.current = e.matches;
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const updateGridDimensions = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const rows = Math.ceil(height / rowSpacing) + 2;
    const columns = Math.ceil(width / hexagonWidth) + 2;
    setGridDimensions({ rows, columns });
  }, [rowSpacing, hexagonWidth]);

  useEffect(() => {
    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);
    return () => window.removeEventListener('resize', updateGridDimensions);
  }, [updateGridDimensions]);

  return (
    <div
      ref={containerRef}
      data-slot="hexagon-background"
      className={`relative size-full overflow-hidden ${className}`}
      {...props}
    >
      <style>{`:root { --hexagon-margin: ${hexagonMargin}px; }`}</style>
      <div className="absolute top-0 -left-0 size-full overflow-hidden pointer-events-auto">
        {Array.from({ length: gridDimensions.rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            style={{
              marginTop: computedMarginTop,
              marginLeft:
                ((rowIndex + 1) % 2 === 0
                  ? evenRowMarginLeft
                  : oddRowMarginLeft) - 10,
            }}
            className="inline-flex"
          >
            {Array.from({ length: gridDimensions.columns }).map(
              (_, colIndex) => (
                <div
                  key={`hexagon-${rowIndex}-${colIndex}`}
                  {...hexagonProps}
                  style={{
                    width: hexagonWidth,
                    height: hexagonHeight,
                    marginLeft: hexagonMargin,
                    ...hexagonProps?.style,
                  }}
                  className={`
                    relative
                    [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]
                    before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full
                    before:bg-slate-300/40 dark:before:bg-white/[0.07]
                    before:opacity-100 before:transition-all before:duration-500
                    after:content-[''] after:absolute after:inset-[var(--hexagon-margin)]
                    after:bg-slate-50/70 dark:after:bg-[#0A0A12]/90
                    after:[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]
                    ${
                      isReducedMotionRef.current
                        ? ''
                        : `
                          hover:before:bg-indigo-500/80 dark:hover:before:bg-[var(--scanline)]
                          hover:before:opacity-100 hover:before:duration-0
                          hover:after:bg-indigo-50/90 dark:hover:after:bg-[#14151F]
                          hover:after:opacity-100 hover:after:duration-0
                        `
                    }
                    ${hexagonProps?.className || ''}
                  `}
                />
              )
            )}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

export default HexagonBackground;
