import { useId } from "react";
import {
  authHeroArt,
  authHeroArtMark,
  authHeroArtSvg,
} from "../../styles/layout/public.styles";
import BrandMark from "../common/layout/BrandMark";

const VIEW_W = 480;
const VIEW_H = 240;
const SKEW = "skewY(-19)";
const PANE_RADIUS = 16;

const panes = [
  { x: 32, y: 116, width: 280, height: 220 },
  { x: 150, y: 212, width: 240, height: 150 },
  { x: 222, y: 221, width: 226, height: 150 },
] as const;

const screenRows = [176, 192, 208, 224] as const;

const AuthGlassStack = () => {
  const glassId = useId();

  return (
    <div className={authHeroArt} aria-hidden="true">
      <svg
        className={authHeroArtSvg}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        stroke="currentColor"
      >
        <defs>
          <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".3" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".06" />
          </linearGradient>
        </defs>

        <g transform={SKEW} strokeWidth="1.2" strokeOpacity=".5">
          {panes.map((pane) => (
            <rect
              key={pane.x}
              x={pane.x}
              y={pane.y}
              width={pane.width}
              height={pane.height}
              rx={PANE_RADIUS}
              fill={`url(#${glassId})`}
            />
          ))}

          <rect
            x={60}
            y={149}
            width={150}
            height={200}
            rx={10}
            fill="currentColor"
            fillOpacity=".06"
            strokeOpacity=".25"
          />

          <g stroke="none" fill="currentColor" fillOpacity=".22">
            {screenRows.map((rowY, index) => (
              <rect
                key={rowY}
                x={78}
                y={rowY}
                width={index % 2 === 0 ? 110 : 76}
                height={4}
                rx={2}
              />
            ))}
          </g>
        </g>
      </svg>

      <BrandMark className={authHeroArtMark} />
    </div>
  );
};

export default AuthGlassStack;
