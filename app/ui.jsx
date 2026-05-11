// ui.jsx — shared atoms used by both apps.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

const fmtNaira = (n, opts = {}) => {
  if (n == null) return "—";
  const { decimals = 0, compact = false } = opts;
  if (compact && n >= 1000000) return `₦${(n/1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (compact && n >= 1000) return `₦${(n/1000).toFixed(0)}k`;
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: decimals })}`;
};

const fmtNairaRange = (min, max) => `${fmtNaira(min, { compact: true })}–${fmtNaira(max, { compact: true })}`;

const relTime = (iso) => {
  const d = new Date(iso);
  const now = new Date("2026-05-08T10:00:00");
  const diff = (now - d) / 1000 / 60;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 60 * 24) return `${Math.round(diff/60)}h ago`;
  if (diff < 60 * 24 * 7) return `${Math.round(diff/60/24)}d ago`;
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
};

// — Avatar with initials and color
function Avatar({ name, initials, color, size = 40, ring = false, photoLab }) {
  const fontSize = Math.round(size * 0.36);
  return (
    <div
      className="av"
      style={{
        width: size, height: size,
        background: color || "var(--clay)",
        fontSize,
        boxShadow: ring ? `0 0 0 3px var(--bone), 0 0 0 4px ${color || "var(--clay)"}` : undefined,
        position: "relative",
        overflow: "hidden",
      }}
      aria-label={name}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{initials}</span>
      {/* subtle adire diagonal */}
      <span style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(135deg, transparent 0 6px, rgba(255,255,255,0.07) 6px 7px)",
      }} />
    </div>
  );
}

// — Photo placeholder (adire-striped)
function Photo({ label, height = 160, color = "var(--linen)", radius = 20, children, accent }) {
  return (
    <div className="photo" style={{ height, background: color, borderRadius: radius, width: "100%" }}>
      {accent && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
        }}>
          {accent}
        </div>
      )}
      {label && <div className="lab">{label}</div>}
      {children}
    </div>
  );
}

// — Match score dial
function MatchDial({ score, size = 64, label = true }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const color = score >= 90 ? "var(--clay)" : score >= 80 ? "var(--clay)" : score >= 70 ? "var(--sun)" : "var(--ink-3)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} className="ring">
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="4" className="dial-track" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="4"
                stroke={color} strokeDasharray={c} strokeDashoffset={off}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1200ms cubic-bezier(0.2,0.8,0.2,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: size * 0.34, lineHeight: 1, color: "var(--ink)" }}>
          {score}
        </div>
        {label && <div style={{ fontSize: 8.5, letterSpacing: 0.06, color: "var(--ink-3)", marginTop: 1 }}>match</div>}
      </div>
    </div>
  );
}

// — Progress bar
function Progress({ value, max = 100, color = "var(--clay)", height = 6, bg = "rgba(31,26,20,0.08)" }) {
  return (
    <div style={{ height, borderRadius: 999, background: bg, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${Math.min(100, (value / max) * 100)}%`,
        background: color,
        borderRadius: 999,
        transition: "width 800ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }} />
    </div>
  );
}

// — Progress ring
function ProgressRing({ value, size = 64, stroke = 5, color = "var(--clay)", trackColor = "rgba(31,26,20,0.08)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} className="ring">
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} stroke={trackColor} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
                stroke={color} strokeDasharray={c} strokeDashoffset={off}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.2,0.8,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// — Sparkline
function Spark({ values, height = 24, width = 70, color = "var(--ink)", fill = false }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [i * step, height - ((v - min) / range) * height]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const dFill = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {fill && <path d={dFill} fill={color} fillOpacity="0.12" />}
      <path d={d} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.length > 0 && (
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
      )}
    </svg>
  );
}

// — Tab bar
function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.id} data-on={active === t.id ? "1" : "0"} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={22} fill={active === t.id} />
          <span className="lab">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// — Header bar (in-app, non-large)
function AppHeader({ title, leading, trailing, sticky = false }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 16px 12px",
      position: sticky ? "sticky" : "static", top: 0, zIndex: 5,
      background: sticky ? "rgba(247,241,232,0.92)" : "transparent",
      backdropFilter: sticky ? "blur(16px)" : undefined,
    }}>
      <div style={{ width: 36 }}>{leading}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)" }}>{title}</div>
      <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>{trailing}</div>
    </div>
  );
}

// — Round icon button
function RoundBtn({ children, onClick, size = 36, bg = "rgba(31,26,20,0.06)" }) {
  return (
    <button onClick={onClick} style={{
      appearance: "none", border: 0, cursor: "pointer",
      width: size, height: size, borderRadius: 999,
      background: bg, color: "var(--ink)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>{children}</button>
  );
}

// — Tiny icon system (line icons, drawn carefully)
function Icon({ name, size = 20, stroke = 1.6, color = "currentColor", fill = false }) {
  const s = size, sw = stroke;
  const props = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z" fill={fill ? color : "none"} fillOpacity={fill ? 0.12 : 0} />
        </svg>
      );
    case "match":
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="4" fill={fill ? color : "none"} fillOpacity={fill ? 0.12 : 0} />
          <circle cx="15" cy="15" r="4" fill={fill ? color : "none"} fillOpacity={fill ? 0.12 : 0} />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="13" rx="3" fill={fill ? color : "none"} fillOpacity={fill ? 0.12 : 0} />
          <path d="M16 12.5h2" />
          <path d="M3 9h18" />
        </svg>
      );
    case "feed":
      return (
        <svg {...props}>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" fill={fill ? color : "none"} fillOpacity={fill ? 0.12 : 0} />
          <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
        </svg>
      );
    case "shop":
      return (
        <svg {...props}>
          <path d="M3 9l1.5-5h15L21 9" />
          <path d="M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9" />
          <path d="M9 13h6" />
        </svg>
      );
    case "money":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9h4.5a2 2 0 010 4H9m3-4v8m-2-2h6" />
        </svg>
      );
    case "doc":
      return (
        <svg {...props}>
          <path d="M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M14 3v4h4M9 13h6M9 17h4" />
        </svg>
      );
    case "back":
      return <svg {...props}><path d="M15 6l-6 6 6 6" /></svg>;
    case "fwd":
      return <svg {...props}><path d="M9 6l6 6-6 6" /></svg>;
    case "close":
      return <svg {...props}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "check":
      return <svg {...props}><path d="M5 12l5 5 9-11" /></svg>;
    case "bell":
      return (
        <svg {...props}>
          <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <path d="M10 19a2 2 0 004 0" />
        </svg>
      );
    case "filter":
      return <svg {...props}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="M16 16l4 4" /></svg>;
    case "plus":
      return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case "mic":
      return (
        <svg {...props}>
          <rect x="9" y="3" width="6" height="12" rx="3" fill={fill ? color : "none"} fillOpacity={fill ? 0.12 : 0} />
          <path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6" />
        </svg>
      );
    case "spark":
      return <svg {...props}><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /></svg>;
    case "shield":
      return <svg {...props}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" /></svg>;
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "chart":
      return <svg {...props}><path d="M4 4v16h16M8 16V11M12 16V8M16 16V13" /></svg>;
    case "alert":
      return <svg {...props}><path d="M12 3l10 17H2L12 3zM12 10v5M12 17v.5" /></svg>;
    case "phone":
      return <svg {...props}><path d="M5 4h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z" /></svg>;
    case "play":
      return <svg {...props}><path d="M7 4l13 8-13 8V4z" fill={color} /></svg>;
    case "pause":
      return <svg {...props}><path d="M8 4v16M16 4v16" /></svg>;
    case "send":
      return <svg {...props}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
    case "lock":
      return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>;
    case "sparkle":
      return <svg {...props}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill={fill ? color : "none"} fillOpacity={fill ? 0.18 : 0} /></svg>;
    case "trend-up":
      return <svg {...props}><path d="M3 17l6-6 4 4 8-8M14 7h7v7" /></svg>;
    case "trend-down":
      return <svg {...props}><path d="M3 7l6 6 4-4 8 8M14 17h7v-7" /></svg>;
    default:
      return null;
  }
}

// — Toast / banner
function Toast({ children, color = "var(--ink)", textColor = "var(--cream)" }) {
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 88, zIndex: 50,
      background: color, color: textColor,
      padding: "12px 16px", borderRadius: 14,
      fontSize: 13.5, fontWeight: 500,
      boxShadow: "var(--shadow-lg)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "fadein 360ms cubic-bezier(0.2,0.8,0.2,1) both",
    }}>
      {children}
    </div>
  );
}

// — Modal sheet (push-up)
function Sheet({ open, onClose, children, height = "auto", maxHeight = "80%" }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 100 }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(31,26,20,0.4)",
        animation: "fadein 240ms both",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: "var(--bone)",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: "12px 0 24px",
        height, maxHeight,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        animation: "sheetin 320ms cubic-bezier(0.2,0.8,0.2,1) both",
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 999, background: "var(--line-strong)",
          margin: "0 auto 8px",
        }} />
        <div style={{ overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
      <style>{`@keyframes sheetin { from { transform: translateY(100%); } to { transform: none; } }`}</style>
    </div>
  );
}

// — Verification badge
function VerifBadge({ size = 16 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: "var(--forest)", color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5 9-11" />
      </svg>
    </div>
  );
}

// — Animated counter
function AnimatedNaira({ value, duration = 900, prefix = "₦", style = {} }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="naira" style={style}>{prefix}{v.toLocaleString("en-NG")}</span>;
}

// — Top blended hero photo (real image, lightened, fades into bg)
function TopHero({ src, height = 320, position = "center", tone = 0.6 }) {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", top: 0, left: 0, right: 0, height,
      backgroundImage: `url(${src})`,
      backgroundSize: "cover", backgroundPosition: position,
      WebkitMaskImage: `linear-gradient(180deg, rgba(0,0,0,${tone}) 0%, rgba(0,0,0,${tone * 0.7}) 35%, rgba(0,0,0,${tone * 0.35}) 65%, rgba(0,0,0,0.04) 88%, rgba(0,0,0,0) 100%)`,
      maskImage: `linear-gradient(180deg, rgba(0,0,0,${tone}) 0%, rgba(0,0,0,${tone * 0.7}) 35%, rgba(0,0,0,${tone * 0.35}) 65%, rgba(0,0,0,0.04) 88%, rgba(0,0,0,0) 100%)`,
      filter: "saturate(0.78) contrast(0.95)",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

// real photos that map to small Nigerian businesses (Unsplash)
const HERO_IMG = {
  market: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=70",
  bakery: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=900&auto=format&fit=crop&q=70",
  fashion: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=70",
  storefront: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&auto=format&fit=crop&q=70",
  hands: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&auto=format&fit=crop&q=70",
  food: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop&q=70",
};

Object.assign(window, {
  fmtNaira, fmtNairaRange, relTime,
  Avatar, Photo, MatchDial, Progress, ProgressRing, Spark,
  TabBar, AppHeader, RoundBtn, Icon, Toast, Sheet, VerifBadge, AnimatedNaira,
  TopHero, HERO_IMG,
});
