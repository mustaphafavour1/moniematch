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
function InvNotifications({ onBack }) {
  const [notifs, setNotifs] = React.useState([
    { id: 1, type: "match",    title: "New match found",             body: "Aisha's Bakehouse matches your investment preferences.",      time: "2h ago",  read: false },
    { id: 2, type: "report",   title: "Report received",             body: "Layi Bakehouse submitted their April revenue report.",        time: "14h ago", read: false },
    { id: 3, type: "deal",     title: "Counter-offer received",      body: "Zara's Fashion has responded to your proposed terms.",        time: "1d ago",  read: false },
    { id: 4, type: "signed",   title: "Deal signed",                 body: "Your investment in Mama's Kitchen is now active. ₦500,000 held in escrow.", time: "2d ago", read: true },
    { id: 5, type: "payment",  title: "Revenue share received",      body: "₦24,000 from Layi Bakehouse — April revenue share.",         time: "3d ago",  read: true },
    { id: 6, type: "verified", title: "Profile verified",            body: "Your investor profile has been verified. You can now invest.", time: "5d ago", read: true },
    { id: 7, type: "reminder", title: "Portfolio check-in",          body: "Zara's Fashion report is 2 days overdue. Consider following up.", time: "6d ago", read: true },
  ]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  const today = notifs.filter((_, i) => i < 3);
  const earlier = notifs.filter((_, i) => i >= 3);

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Notifications"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        trailing={
          unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              appearance: "none", border: 0, background: "none",
              fontSize: 12, color: "var(--clay)", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", padding: "4px 0",
            }}>
              Mark all read
            </button>
          )
        }
        sticky
      />

      <div className="scroll" style={{ flex: 1 }}>
        {notifs.length === 0 ? (
          <div className="pad"><NotifEmpty /></div>
        ) : (
          <div className="pad" style={{ paddingTop: 8 }}>
            {/* Today */}
            {today.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginBottom: 0, paddingBottom: 0 }}>Today</div>
                {today.map(n => (
                  <NotifItem key={n.id} {...n} onPress={() => markRead(n.id)} />
                ))}
              </>
            )}
            {/* Earlier */}
            {earlier.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginTop: 20, marginBottom: 0, paddingBottom: 0 }}>Earlier</div>
                {earlier.map(n => (
                  <NotifItem key={n.id} {...n} onPress={() => markRead(n.id)} />
                ))}
              </>
            )}
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

// ─── Business owner notifications ─────────────────────────
function BizNotifications({ onBack }) {
  const [notifs, setNotifs] = React.useState([
    { id: 1, type: "match",    title: "New investor interested",     body: "Femi Adesanya (Software Engineer, Lagos) wants to invest ₦800k in your business.", time: "2h ago",  read: false },
    { id: 2, type: "reminder", title: "Report due in 2 days",        body: "Your April revenue report is due on May 10. Tap to start.",  time: "14h ago", read: false },
    { id: 3, type: "match",    title: "Another investor interested",  body: "Ngozi Okeke (Doctor, Abuja) is considering a ₦500k investment.", time: "1d ago", read: false },
    { id: 4, type: "signed",   title: "Deal signed — funded!",        body: "₦500,000 from Ngozi Okeke is now held in escrow. Funds release in 24hrs.", time: "3d ago", read: true },
    { id: 5, type: "verified", title: "Business profile verified",    body: "Your business is now visible to all verified investors on MonieMatch.", time: "4d ago", read: true },
    { id: 6, type: "alert",    title: "Complete your profile",        body: "Add your monthly revenue range to improve match quality.",    time: "5d ago",  read: true },
  ]);

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  const today = notifs.filter((_, i) => i < 3);
  const earlier = notifs.filter((_, i) => i >= 3);

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Notifications"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        trailing={
          unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              appearance: "none", border: 0, background: "none",
              fontSize: 12, color: "var(--forest)", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", padding: "4px 0",
            }}>
              Mark all read
            </button>
          )
        }
        sticky
      />
      <div className="scroll" style={{ flex: 1 }}>
        {notifs.length === 0 ? (
          <div className="pad"><NotifEmpty /></div>
        ) : (
          <div className="pad" style={{ paddingTop: 8 }}>
            {today.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginBottom: 0 }}>Today</div>
                {today.map(n => <NotifItem key={n.id} {...n} onPress={() => markRead(n.id)} />)}
              </>
            )}
            {earlier.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginTop: 20, marginBottom: 0 }}>Earlier</div>
                {earlier.map(n => <NotifItem key={n.id} {...n} onPress={() => markRead(n.id)} />)}
              </>
            )}
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}