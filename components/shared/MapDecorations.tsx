/**
 * MapDecorations — shared SVG decoration elements for editorial city maps.
 *
 * Renders inside an existing <svg viewBox="0 0 100 100"> element.
 * Both RemoteWorkZonesGuide and CityFieldMap import this so that
 * map backgrounds (water, parks, transit lines) are defined once.
 *
 * To add a city: supply its own MapDecoration[] in the city data file.
 * No code changes needed here.
 */

import type { MapDecoration, CityTheme } from "@/lib/types";

interface Props {
  decorations: MapDecoration[];
  theme: Pick<CityTheme, "waterColor" | "parkColor">;
  /** Opacity override for water / park fills. Defaults to 0.55. */
  opacity?: number;
}

export function MapDecorations({ decorations, theme, opacity = 0.55 }: Props) {
  return (
    <>
      {decorations.map((deco, i) => {
        if (deco.type === "water" && deco.path) {
          return (
            <path
              key={i}
              d={deco.path}
              fill={deco.fill ?? theme.waterColor}
              opacity={opacity}
            />
          );
        }

        if (deco.type === "park" && deco.path) {
          return (
            <path
              key={i}
              d={deco.path}
              fill={deco.fill ?? theme.parkColor}
              opacity={opacity}
            />
          );
        }

        if (deco.type === "line" && deco.points) {
          const pts = deco.points.map(([x, y]) => `${x},${y}`).join(" ");
          const mid = deco.points[Math.floor(deco.points.length / 2)];
          return (
            <g key={i}>
              <polyline
                points={pts}
                fill="none"
                stroke={deco.stroke ?? "#b0a090"}
                strokeWidth="0.7"
                strokeDasharray="1.8,1.4"
                opacity={0.7}
              />
              {deco.label && (
                <text
                  x={mid[0] + 2}
                  y={mid[1] - 1.5}
                  fontSize="2.3"
                  fill="#a09080"
                  letterSpacing="0.25"
                  fontWeight="600"
                >
                  {deco.label}
                </text>
              )}
            </g>
          );
        }

        return null;
      })}
    </>
  );
}
