// inv-profile.jsx — Investor profile screen

function InvProfile({ user }) {
  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14, textAlign: "center" }}>
        <Avatar name={user.name} initials="FA" color="var(--forest)" size={88} />
        <div className="h1" style={{ fontSize: 26, marginTop: 14 }}>{user.name}</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Investor · joined May 2026</div>
      </div>

      <div className="pad" style={{ marginTop: 22 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="money" label="Investment range" value="₦200k – ₦1.5M" />
          <DetailRow icon="trend-up" label="Preferred returns" value="Revenue share, Fixed" />
          <DetailRow icon="bell" label="Reporting cadence" value="Monthly + quarterly" />
          <DetailRow icon="shop" label="Industries of interest" value="Food, Fashion, Bakery, Barbing" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Verification</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="check" label="BVN verified" value="✓" />
          <DetailRow icon="phone" label="Phone verified" value="✓" />
          <DetailRow icon="doc" label="ID upload" value="Pending" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="card sand">
          <div className="row gap-10" style={{ alignItems: "flex-start" }}>
            <Icon name="sparkle" size={18} color="var(--clay)" fill />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Get the Premium tier</div>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, margin: "4px 0 10px" }}>
                Early deal access · sector analytics · priority matching. ₦7,500/month.
              </p>
              <button className="btn btn-clay" style={{ padding: "10px 16px", fontSize: 13 }}>Upgrade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


Object.assign(window, { InvProfile });
