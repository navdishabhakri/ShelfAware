// Line drawings for each item type, on a 48×48 grid, tinted with the variant colour `c`.
const INK = '#141414';
const line = { stroke: INK, strokeWidth: 1.6 };

export const ITEM_ICONS = {
  tote: (c) => (
    <>
      <path d="M14 18h20l2 22H12z" fill={c} {...line} strokeLinejoin="round" />
      <path d="M18 18v-3a6 6 0 0 1 12 0v3" fill="none" {...line} />
    </>
  ),
  pen: (c) => (
    <g transform="rotate(-40 24 24)">
      <rect x="21" y="6" width="6" height="30" rx="2" fill={c} {...line} />
      <path d="M21 36l3 7 3-7" fill="#fff" {...line} strokeLinejoin="round" />
      <rect x="21" y="6" width="6" height="6" fill={INK} />
    </g>
  ),
  bottle: (c) => (
    <>
      <rect x="20" y="5" width="8" height="5" rx="1" fill={INK} />
      <path
        d="M19 10h10v4l3 4v23a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V18l3-4z"
        fill={c}
        {...line}
        strokeLinejoin="round"
      />
      <path d="M16 24h16" stroke={INK} strokeWidth="1.2" opacity=".4" />
    </>
  ),
  notebook: (c) => (
    <>
      <rect x="13" y="8" width="24" height="32" rx="2" fill={c} {...line} />
      <path d="M11 13h5M11 19h5M11 25h5M11 31h5M11 37h5" {...line} strokeLinecap="round" />
      <rect x="20" y="14" width="12" height="5" rx="1" fill="#fff" opacity=".8" />
    </>
  ),
  sanitizer: (c) => (
    <>
      <path d="M20 9h9v4h-4v4" fill="none" {...line} strokeLinejoin="round" />
      <rect x="21" y="17" width="7" height="4" fill={INK} />
      <rect x="16" y="21" width="17" height="21" rx="4" fill={c} {...line} />
      <path d="M24.5 27v8M20.5 31h8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  lanyard: (c) => (
    <>
      <path
        d="M14 6c0 16 4 22 10 26M34 6c0 16-4 22-10 26"
        fill="none"
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="17" y="30" width="14" height="13" rx="2" fill="#fff" {...line} />
      <path d="M20 35h8M20 38h5" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  banner: (c) => (
    <>
      <path d="M5 12c12 5 26 5 38 0" fill="none" {...line} />
      <path
        d="M9 14l4 13 4-12zM21 16l3 13 3-13zM31 15l4 12 4-13z"
        fill={c}
        stroke={INK}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </>
  ),
  table: (c) => (
    <>
      <rect x="5" y="16" width="38" height="6" rx="1.5" fill={c} {...line} />
      <path d="M10 22l-3 18M38 22l3 18M14 22l3 12M34 22l-3 12" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  box: (c) => (
    <>
      <path d="M8 16l16-8 16 8v18l-16 8-16-8z" fill={c} {...line} strokeLinejoin="round" />
      <path d="M8 16l16 8 16-8M24 24v18" fill="none" {...line} />
    </>
  ),
};
