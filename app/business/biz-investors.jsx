// biz-investors.jsx — Business owner's list of interested investors

function BizInvestors({ onPickInvestor }) {
  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">{window.MM_DATA.interested.length} interested</div>
        <div className="h1" style={{ fontSize: 36, marginTop: 6 }}>Investors</div>
      </div>
      <div className="pad col gap-10" style={{ marginTop: 18 }}>
        {window.MM_DATA.interested.map((it, i) => {
          const inv = window.MM_DATA.investors.find(v => v.id === it.investorId);
          return (
            <div key={it.investorId} className="fadein" style={{ animationDelay: `${i * 80}ms` }}>
              <OfferCard item={it} inv={inv} onClick={() => onPickInvestor(it.investorId)} highlight={it.status === "new" && i === 0} />
            </div>
          );
        })}
      </div>

      <div className="pad" style={{ marginTop: 18 }}>
        <div className="card linen" style={{ textAlign: "center", padding: "28px 18px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)", lineHeight: 1.2 }}>
            More investors see your profile <span style={{ fontStyle: "italic", color: "var(--forest)" }}>when it's complete.</span>
          </div>
          <button className="btn btn-forest" style={{ marginTop: 14 }}>Polish profile</button>
        </div>
      </div>
    </div>
  );
}


Object.assign(window, { BizInvestors });
