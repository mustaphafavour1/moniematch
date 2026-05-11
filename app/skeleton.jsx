// skeleton.jsx — Skeleton loading components for MonieMatch
// Used while data is fetching or network is slow.
// Two variants: dark (default, for dark screens) and light (for cream surfaces).

const { useState: _us } = React;

// ── Base skeleton block ────────────────────────────────────
function Skel({ w = '100%', h = 16, r = 8, light = false, style = {} }) {
  return (
    <div
      className={light ? 'skel-light' : 'skel'}
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  );
}

// ── Business / investor card skeleton ─────────────────────
function SkeletonCard({ light = false }) {
  return (
    <div style={{
      padding: 16, borderRadius: 18,
      background: light ? 'rgba(31,26,20,0.04)' : 'rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Header row: avatar + name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skel w={48} h={48} r={14} light={light} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Skel w="55%" h={14} light={light} />
          <Skel w="35%" h={11} light={light} />
        </div>
        <Skel w={60} h={26} r={20} light={light} />
      </div>
      {/* Description lines */}
      <Skel h={12} light={light} />
      <Skel w="78%" h={12} light={light} />
      {/* Tag row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <Skel w={68} h={24} r={20} light={light} />
        <Skel w={84} h={24} r={20} light={light} />
        <Skel w={56} h={24} r={20} light={light} />
      </div>
    </div>
  );
}

// ── Home screen skeleton ───────────────────────────────────
function SkeletonHome({ light = false }) {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Greeting + avatar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w={90}  h={13} light={light} />
          <Skel w={160} h={22} light={light} />
        </div>
        <Skel w={42} h={42} r={21} light={light} />
      </div>
      {/* Search bar */}
      <Skel h={46} r={14} light={light} />
      {/* Section label */}
      <Skel w={110} h={13} light={light} />
      {/* Cards */}
      {[0, 1, 2].map(i => <SkeletonCard key={i} light={light} />)}
    </div>
  );
}

// ── Matches screen skeleton ────────────────────────────────
function SkeletonMatches({ light = false }) {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Skel w={130} h={22} light={light} />
      {/* Hero / featured match */}
      <Skel h={160} r={20} light={light} />
      {/* Label */}
      <Skel w={100} h={13} light={light} />
      {/* List */}
      {[0, 1, 2, 3].map(i => <SkeletonCard key={i} light={light} />)}
    </div>
  );
}

// ── Portfolio / investors list skeleton ────────────────────
function SkeletonPortfolio({ light = false }) {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Skel w={100} h={22} light={light} />
      {/* Summary banner */}
      <Skel h={110} r={18} light={light} />
      {/* 2-col stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Skel h={72} r={14} light={light} />
        <Skel h={72} r={14} light={light} />
      </div>
      {/* Active deals */}
      <Skel w={110} h={13} light={light} />
      {[0, 1].map(i => <SkeletonCard key={i} light={light} />)}
    </div>
  );
}

// ── Profile screen skeleton ────────────────────────────────
function SkeletonProfile({ light = false }) {
  return (
    <div style={{ padding: '28px 16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Avatar + name block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Skel w={82} h={82} r={41} light={light} />
        <Skel w={140} h={18} light={light} />
        <Skel w={100} h={13} light={light} />
      </div>
      {/* Settings rows */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skel w={120} h={13} light={light} />
            <Skel w={80}  h={11} light={light} />
          </div>
          <Skel w={20} h={20} r={4} light={light} />
        </div>
      ))}
    </div>
  );
}

// ── Business detail / investor offer skeleton ──────────────
function SkeletonDetail({ light = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Hero image */}
      <Skel h={240} r={0} light={light} />
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Title + category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w="65%" h={24} light={light} />
          <Skel w="40%" h={14} light={light} />
        </div>
        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Skel h={56} r={12} light={light} />
          <Skel h={56} r={12} light={light} />
          <Skel h={56} r={12} light={light} />
        </div>
        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel h={13} light={light} />
          <Skel h={13} light={light} />
          <Skel w="60%" h={13} light={light} />
        </div>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Skel w={80} h={28} r={20} light={light} />
          <Skel w={96} h={28} r={20} light={light} />
        </div>
      </div>
    </div>
  );
}

// ── Report screen skeleton ─────────────────────────────────
function SkeletonReport({ light = false }) {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Skel w={150} h={22} light={light} />
      <Skel w="85%" h={14} light={light} />
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w="35%" h={13} light={light} />
          <Skel h={50} r={12} light={light} />
        </div>
      ))}
    </div>
  );
}

// ── Notification list skeleton ─────────────────────────────
function SkeletonNotifications({ light = false }) {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skel w={140} h={22} light={light} />
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Skel w={40} h={40} r={20} light={light} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skel w="70%" h={13} light={light} />
            <Skel w="90%" h={12} light={light} />
            <Skel w="30%" h={11} light={light} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Generic loading screen (used for first load) ───────────
function SkeletonAppLoad() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--cream)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--forest-tint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="skel-light" style={{ width: 32, height: 32, borderRadius: 8 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div className="skel-light" style={{ width: 120, height: 14, borderRadius: 7 }} />
        <div className="skel-light" style={{ width: 80, height: 12, borderRadius: 6 }} />
      </div>
    </div>
  );
}

// expose globally so all JSX files can use them
window.MM_SKEL = {
  Skel,
  SkeletonCard,
  SkeletonHome,
  SkeletonMatches,
  SkeletonPortfolio,
  SkeletonProfile,
  SkeletonDetail,
  SkeletonReport,
  SkeletonNotifications,
  SkeletonAppLoad,
};