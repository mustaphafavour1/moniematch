// splash-error.jsx — Splash screen (session check) + Error screen
// SplashScreen: shown while we check if the user has an existing session.
// ErrorScreen: shown when something goes wrong (network, auth, etc).

// ─── SPLASH SCREEN ────────────────────────────────────────
function SplashScreen() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--cream)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 20,
    }}>
      {/* Logo mark */}
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: "var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 12px 32px rgba(31,26,20,0.18)",
      }}>
        <Icon name="trend-up" size={32} color="var(--sun)" stroke={2} />
      </div>

      {/* Wordmark */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: 28, fontWeight: 400,
        color: "var(--ink)", letterSpacing: -0.5,
      }}>
        MonieMatch
      </div>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 999,
            background: "var(--ink-4)",
            animation: `dotpulse 1.2s ${i * 0.2}s infinite ease-in-out`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes dotpulse {
          0%, 100% { transform: scale(0.7); opacity: 0.4; }
          50%       { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

// ─── ERROR SCREEN ─────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--cream)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px", gap: 16, textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: "var(--clay-tint)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="alert" size={28} color="var(--clay)" />
      </div>

      <div>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: 22,
          color: "var(--ink)", margin: "0 0 8px",
        }}>
          Something went wrong
        </p>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
          {message || "We couldn't connect. Check your internet and try again."}
        </p>
      </div>

      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary" style={{ marginTop: 8, padding: "12px 28px" }}>
          Try again <Icon name="fwd" size={15} color="currentColor" />
        </button>
      )}

      <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 4 }}>
        If this keeps happening, contact support@moniematch.com
      </p>
    </div>
  );
}

// ─── OFFLINE SCREEN ───────────────────────────────────────
function OfflineScreen({ onRetry }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--cream)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px", gap: 16, textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: "var(--sun-tint)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="alert" size={28} color="var(--sun)" />
      </div>

      <div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)", margin: "0 0 8px" }}>
          You're offline
        </p>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
          Some things may still work from cache.<br />
          Connect to the internet for the full experience.
        </p>
      </div>

      <button onClick={onRetry || (() => window.location.reload())}
        className="btn btn-primary" style={{ marginTop: 8, padding: "12px 28px" }}>
        Retry
      </button>
    </div>
  );
}

Object.assign(window, { SplashScreen, ErrorScreen, OfflineScreen });