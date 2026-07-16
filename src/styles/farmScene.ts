import { palette } from './theme.css'

/**
 * The sider's farm scene, drawn by hand rather than shipped as an asset.
 *
 * Design notes, since this is drawing code and the intent isn't readable from
 * the path data:
 *
 * - Etched line-art, no fills. It sits *behind* the nav, so it has to read as
 *   texture at a glance and never compete with the menu labels. Strokes only,
 *   all in `palette.tan`, with per-group opacity doing the depth sorting.
 * - One-point perspective. Every furrow converges on VP (112, 120), which sits
 *   on the horizon at the sider's horizontal centre. The furrows fan past both
 *   edges of the viewBox on purpose — the field should feel cropped by the
 *   sider, not contained by it.
 * - Depth ordering is opacity, not overlap: distant hills ~.3, horizon ~.55,
 *   buildings .8. Nothing occludes anything, which keeps the line-art honest.
 * - 224 wide to match the sider; 300 tall so the field has room to recede. The
 *   top ~third is faded out by a mask in global.css.ts, so the sky is empty by
 *   design — anything drawn above y≈76 would be thrown away.
 */
const VIEW_W = 224
const VIEW_H = 300

/** Horizon line. Everything above is sky, everything below is field. */
const HORIZON = 120

/** Vanishing point — all furrows radiate from here. */
const VP_X = 112

/**
 * Furrow fan: symmetric offsets from the vanishing point, measured at the
 * bottom edge. Spacing widens geometrically so the rows read as evenly spaced
 * ground receding away, rather than a flat starburst.
 */
const FURROW_SPREAD = [8, 25, 50, 85, 130, 190, 270]

const furrows = FURROW_SPREAD.flatMap((dx) => [
  `M${VP_X} ${HORIZON} L${VP_X - dx} ${VIEW_H}`,
  `M${VP_X} ${HORIZON} L${VP_X + dx} ${VIEW_H}`,
])
  .map((d) => `<path d="${d}"/>`)
  .join('')

const FARM_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" fill="none" stroke="${palette.tan}" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <!-- Furrows fade out as they approach the vanishing point. Without this the
         twelve lines converge into a solid ink blot and the field reads as a
         sunburst; fading them also mimics haze over distance. -->
    <linearGradient id="furrowFade" x1="0" y1="${HORIZON}" x2="0" y2="${VIEW_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${palette.tan}" stop-opacity="0"/>
      <stop offset=".35" stop-color="${palette.tan}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${palette.tan}" stop-opacity=".5"/>
    </linearGradient>
  </defs>

  <g stroke-width="1" opacity=".3">
    <path d="M0 98 Q28 82 56 94 Q78 103 100 95 Q128 84 152 94 Q186 107 224 90"/>
    <path d="M0 109 Q40 97 74 107 Q104 115 136 105 Q180 91 224 105"/>
  </g>

  <path d="M0 ${HORIZON} H${VIEW_W}" stroke-width="1.2" opacity=".55"/>

  <g stroke-width="1.3" opacity=".8">
    <path d="M30 120 V95 M84 120 V95"/>
    <path d="M26 95 L40 85 L57 77 L74 85 L88 95"/>
    <path d="M26 95 H88"/>
    <path d="M53 84 H61 V91 H53 Z"/>
    <path d="M51 120 V102 H63 V120"/>
    <path d="M51 102 L63 120 M63 102 L51 120"/>
    <path d="M94 120 V90 M108 120 V90"/>
    <path d="M94 90 Q101 79 108 90"/>
    <path d="M101 79 V75"/>
    <path d="M94 101 H108 M94 111 H108"/>
  </g>

  <g stroke-width="1.1" opacity=".55">
    <path d="M114 120 V110 M124 120 V110 M134 120 V110"/>
    <path d="M110 112 H138 M110 117 H138"/>
  </g>

  <g stroke-width="1.2" opacity=".7">
    <circle cx="166" cy="101" r="11"/>
    <path d="M166 112 V120"/>
    <circle cx="190" cy="107" r="7.5"/>
    <path d="M190 114.5 V120"/>
    <circle cx="147" cy="107" r="6"/>
    <path d="M147 113 V120"/>
  </g>

  <g stroke-width="1" stroke="url(#furrowFade)">${furrows}</g>

  <g stroke-width="1" opacity=".4">
    <path d="M0 140 Q112 132 224 140"/>
    <path d="M0 168 Q112 157 224 168"/>
    <path d="M0 205 Q112 191 224 205"/>
    <path d="M0 250 Q112 233 224 250"/>
  </g>
</svg>`

/**
 * Ready-to-use `background-image` value. Encoded at build time (this module is
 * imported by a .css.ts), so the SVG ships as a plain data URI in the stylesheet
 * — no runtime work, no extra request.
 *
 * Parens must be percent-encoded on top of encodeURIComponent, which leaves
 * them alone: the markup contains `url(#furrowFade)`, and the CSS minifier
 * strips the quotes from `url("…")`. An unescaped `)` would then terminate the
 * CSS url() early and silently kill the whole background.
 */
const encodeSvg = (svg: string) =>
  encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29')

export const farmSceneUrl = `url("data:image/svg+xml,${encodeSvg(FARM_SCENE)}")`

/** Intrinsic size, so the CSS can position the horizon precisely. */
export const farmSceneSize = { width: VIEW_W, height: VIEW_H }
