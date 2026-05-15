// notifications.jsx — Shared notifications screen
// Used by both InvestorApp and BusinessApp via the bell icon.

// ─── Notification item ────────────────────────────────────
function NotifItem({ type, title, body, time, read, onPress }) {
  const config = {
    match:    { icon: "match",    bg: "var(--clay-tint)",   color: "var(--clay)"   },
    deal:     { icon: "doc",      bg: "var(--forest-tint)", color: "var(--forest)" },
    report:   { icon: "chart",    bg: "var(--sun-tint)",    color: "var(--sun)"    },
    payment:  { icon: "money",    bg: "var(--forest-tint)", color: "var(--forest)" },
    verified: { icon: "shield",   bg: "var(--forest-tint)", color: "var(--forest)" },
    alert:    { icon: "alert",    bg: "var(--clay-tint)",   color: "var(--clay)"   },
    signed:   { icon: "check",    bg: "var(--forest-tint)", color: "var(--forest)" },
    reminder: { icon: "calendar", bg: "var(--sun-tint)",    color: "var(--sun)"    },
  };
  const c = config[type] || config.match;

  return (
    <div onClick={onPress} style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "14px 0",
      borderBottom: "1px solid var(--line)",
      opacity: read ? 0.65 : 1,
      cursor: onPress ? "pointer" : "default",
    }}>
      {/* icon bubble */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: c.bg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={c.icon} size={18} color={c.color} />
      </div>

      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: read ? 500 : 600, color: "var(--ink)", margin: "0 0 3px", lineHeight: 1.35 }}>
          {title}
        </p>
        <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.4 }}>
          {body}
        </p>
      </div>

      {/* time + unread dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{time}</span>
        {!read && (
          <div style={{ width: 7, height: 7, borderRadius: 999, background: "var(--clay)" }} />
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────
function NotifEmpty() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 14, paddingTop: 80, paddingBottom: 40,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: "var(--sun-tint)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="bell" size={28} color="var(--sun)" />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 16, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 6px" }}>
          All quiet for now
        </p>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: 0, lineHeight: 1.5 }}>
          Notifications about matches,<br />deals, and reports appear here.
        </p>
      </div>
    </div>
  );
}

// ─── Investor notifications ───────────────────────────────
// Shared hook — loads real notifications from Supabase
function useNotifications(accentColor) {
  const [notifs, setNotifs] = React.useState(null); // null = loading
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await window.DB.getNotifications();
        if (data && data.length > 0) {
          // Transform DB rows to UI shape
          setNotifs(data.map(n => ({
            id:        n.id,
            type:      n.type || "match",
            title:     n.title,
            body:      n.body,
            time:      relTimeFromISO(n.created_at),
            read:      n.is_read,
            actionScreen: n.action_screen,
            actionId:  n.action_id,
          })));
        } else {
          setNotifs([]); // empty — show empty state
        }
      } catch (e) {
        console.warn("[MM] notifs load:", e);
        setNotifs([]); // don't show mock, show empty
      }
      setLoading(false);
    })();
  }, []);

  const markRead = async (id) => {
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    try { await window.DB.markNotificationRead(id); } catch (e) {}
  };

  const markAllRead = async () => {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    // Mark all in DB
    if (notifs) {
      for (const n of notifs.filter(n => !n.read)) {
        try { await window.DB.markNotificationRead(n.id); } catch (e) {}
      }
    }
  };

  return { notifs, loading, markRead, markAllRead };
}

function relTimeFromISO(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day:"numeric", month:"short" });
}

// Shared notification list renderer
function NotifList({ notifs, loading, markRead, markAllRead, accentColor }) {
  if (loading) {
    const S = window.MM_SKEL;
    return S ? <S.SkeletonNotifications light /> : null;
  }

  const unreadCount = (notifs || []).filter(n => !n.read).length;
  const today   = (notifs || []).filter(n => {
    const d = new Date(Date.now() - 24*60*60*1000);
    return new Date(n.createdAt || Date.now()) >= d;
  });
  // Simpler split: first 3 are "today", rest are "earlier"
  const firstThree = (notifs || []).slice(0, 3);
  const rest       = (notifs || []).slice(3);

  return (
    <>
      {unreadCount > 0 && (
        <button onClick={markAllRead} style={{
          appearance:"none", border:0, background:"none",
          fontSize:12, color:accentColor || "var(--clay)", fontWeight:600,
          cursor:"pointer", fontFamily:"inherit", padding:"4px 0",
        }}>
          Mark all read
        </button>
      )}
      <div className="scroll" style={{ flex:1 }}>
        {!notifs || notifs.length === 0 ? (
          <div className="pad"><NotifEmpty /></div>
        ) : (
          <div className="pad" style={{ paddingTop:8 }}>
            {firstThree.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginBottom:0 }}>Recent</div>
                {firstThree.map(n => (
                  <NotifItem key={n.id} {...n} onPress={() => markRead(n.id)} />
                ))}
              </>
            )}
            {rest.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginTop:20, marginBottom:0 }}>Earlier</div>
                {rest.map(n => (
                  <NotifItem key={n.id} {...n} onPress={() => markRead(n.id)} />
                ))}
              </>
            )}
          </div>
        )}
        <div style={{ height:40 }} />
      </div>
    </>
  );
}

function InvNotifications({ onBack, onNavigate }) {
  const { notifs, loading, markRead, markAllRead } = useNotifications("var(--clay)");

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader
        title="Notifications"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        trailing={
          <button onClick={markAllRead} style={{ appearance:"none", border:0, background:"none", fontSize:12, color:"var(--clay)", fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:"4px 0" }}>
            Mark all read
          </button>
        }
        sticky
      />
      <NotifList
        notifs={notifs} loading={loading}
        markRead={markRead} markAllRead={markAllRead}
        accentColor="var(--clay)"
      />
    </div>
  );
}

// ─── Business owner notifications ─────────────────────────
function BizNotifications({ onBack, onNavigate }) {
  const { notifs, loading, markRead, markAllRead } = useNotifications("var(--forest)");

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader
        title="Notifications"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        trailing={
          <button onClick={markAllRead} style={{ appearance:"none", border:0, background:"none", fontSize:12, color:"var(--forest)", fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:"4px 0" }}>
            Mark all read
          </button>
        }
        sticky
      />
      <NotifList
        notifs={notifs} loading={loading}
        markRead={markRead} markAllRead={markAllRead}
        accentColor="var(--forest)"
      />
    </div>
  );
}