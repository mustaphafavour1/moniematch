// biz-profile.jsx — Business owner profile screen

function BizProfile({ user }) {
  const aisha = window.MM_DATA.businesses.find(b => b.id === "aisha");
  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14, textAlign: "center" }}>
        <Avatar name={user.name} initials="AB" color="var(--clay)" size={80} />
        <div className="h1" style={{ fontSize: 26, marginTop: 14 }}>{user.bizName || "Layi Bakehouse"}</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{user.name} · Yaba, Lagos</div>
        <div className="row gap-6" style={{ justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          <span className="chip forest"><Icon name="check" size={11} /> Verified</span>
          <span className="chip clay">78% complete</span>
        </div>
      </div>

      <div className="pad" style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Your raise</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="money" label="Raising" value={fmtNairaRange(aisha.askMin, aisha.askMax)} />
          <DetailRow icon="trend-up" label="Offer" value={aisha.returnHeadline} />
          <DetailRow icon="bell" label="Reporting" value="Monthly" />
          <DetailRow icon="shop" label="What for" value={aisha.use} last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Business</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="calendar" label="Years running" value="3 years" />
          <DetailRow icon="user" label="Team" value="4 people" />
          <DetailRow icon="chart" label="Monthly revenue" value="₦850k–₦1.4M" />
          <DetailRow icon="doc" label="CAC registered" value="✓" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Add-ons</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="sparkle" label="Pitch deck builder" value="₦8,000" />
          <DetailRow icon="shop" label="Product photography" value="From ₦25,000" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <button className="btn btn-soft btn-block">Sign out</button>
      </div>
    </div>
  );
}


Object.assign(window, { BizProfile });
