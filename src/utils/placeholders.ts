export const PLACEHOLDER_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='60'>
      <rect width='260' height='60' fill='#ffffff'/>
      <text x='10' y='38' font-family='sans-serif' font-size='26' font-weight='bold' fill='#1464E7'>데일리 뉴스</text>
    </svg>`
  );

const PALETTE: [string, string][] = [
  ["#dbe7fb", "#1c3f73"],
  ["#fbe2db", "#7a3219"],
  ["#e3f3df", "#2c5a1d"],
  ["#f6e3f3", "#6b1f57"],
  ["#fdf1cf", "#7a5a0c"],
  ["#e0f3ef", "#0e5a4b"],
];

function imgPlaceholder(
  w: number,
  h: number,
  label: string,
  bg: string,
  fg: string
): string {
  const safe = String(label).slice(0, 18);
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
        <rect width='${w}' height='${h}' fill='${bg}'/>
        <text x='50%' y='50%' font-family='sans-serif' font-size='13' fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${safe}</text>
      </svg>`
    )
  );
}

export function ph(w: number, h: number, label: string, idx: number): string {
  const [bg, fg] = PALETTE[idx % PALETTE.length];
  return imgPlaceholder(w, h, label, bg, fg);
}
