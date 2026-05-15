// chat.jsx — Per-match conversation screen
// Named "Chat" in the UI but implemented as threaded messages per match.
// Uses Supabase real-time for new message delivery.

function MatchChat({ matchId, currentUser, otherParty, onBack }) {
  const [messages, setMessages] = React.useState(null); // null = loading
  const [text, setText]         = React.useState("");
  const [sending, setSending]   = React.useState(false);
  const bottomRef               = React.useRef();
  const inputRef                = React.useRef();
  const channelRef              = React.useRef(null);

  // ── Load messages + subscribe to real-time ────────────
  React.useEffect(() => {
    if (!matchId) return;
    loadMessages();

    // Subscribe to new messages in this match
    channelRef.current = window.sb
      .channel(`match-chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages(ms => ms ? [...ms, payload.new] : [payload.new]);
          // Mark incoming as read
          if (payload.new.sender_id !== currentUser?.id) {
            window.sb.from("messages")
              .update({ is_read: true })
              .eq("id", payload.new.id)
              .then(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        window.sb.removeChannel(channelRef.current);
      }
    };
  }, [matchId]);

  // ── Auto-scroll to bottom on new messages ─────────────
  React.useEffect(() => {
    if (messages !== null) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: messages.length > 0 ? "smooth" : "instant" });
      }, 50);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data } = await window.sb
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages(data || []);

      // Mark unread messages as read
      const unread = (data || []).filter(m => m.sender_id !== currentUser?.id && !m.is_read);
      if (unread.length > 0) {
        await window.sb
          .from("messages")
          .update({ is_read: true })
          .in("id", unread.map(m => m.id));
      }
    } catch (e) {
      console.warn("[MM] chat load:", e);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setText("");
    setSending(true);

    try {
      await window.sb.from("messages").insert({
        match_id:  matchId,
        sender_id: currentUser?.id,
        content,
      });
    } catch (e) {
      console.warn("[MM] send message:", e);
      setText(content); // restore on failure
    }
    setSending(false);
    inputRef.current?.focus();
  };

  // ── Format timestamp ───────────────────────────────────
  const fmtTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = new Date(now - 86400000).toDateString() === d.toDateString();

    const time = d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true });
    if (isToday)     return time;
    if (isYesterday) return `Yesterday ${time}`;
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" }) + " " + time;
  };

  // ── Date separator between messages ───────────────────
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    if (new Date(now - 86400000).toDateString() === d.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  };

  const showDateSep = (messages, i) => {
    if (i === 0) return true;
    const prev = new Date(messages[i-1].created_at).toDateString();
    const curr = new Date(messages[i].created_at).toDateString();
    return prev !== curr;
  };

  const isMine = (msg) => msg.sender_id === currentUser?.id;

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{
        padding:"52px 16px 12px",
        borderBottom:"1px solid var(--line)",
        background:"var(--cream)",
        display:"flex", alignItems:"center", gap:12,
        flexShrink:0,
      }}>
        <RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>
        <Avatar
          name={otherParty?.name || "Chat"}
          initials={otherParty?.initials || "?"}
          color={otherParty?.color || "var(--clay)"}
          size={38}
        />
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:600, color:"var(--ink)", margin:"0 0 1px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {otherParty?.name || "Conversation"}
          </p>
          <p style={{ fontSize:12, color:"var(--ink-3)", margin:0 }}>
            {otherParty?.role || otherParty?.category || "MonieMatch"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:2 }}>
        {messages === null ? (
          /* Loading */
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <p style={{ fontSize:13, color:"var(--ink-4)" }}>Loading conversation…</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, textAlign:"center", padding:"40px 20px" }}>
            <div style={{ width:56, height:56, borderRadius:999, background:"var(--sun-tint)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name="send" size={24} color="var(--sun)" />
            </div>
            <div>
              <p style={{ fontFamily:"var(--font-display)", fontSize:18, color:"var(--ink)", margin:"0 0 6px" }}>
                Start the conversation
              </p>
              <p style={{ fontSize:13.5, color:"var(--ink-3)", margin:0, lineHeight:1.5 }}>
                This is the beginning of your conversation with {otherParty?.name?.split(" ")[0] || "this person"}.
                <br />Keep things professional and honest.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const mine = isMine(msg);
            return (
              <React.Fragment key={msg.id}>
                {/* Date separator */}
                {showDateSep(messages, i) && (
                  <div style={{ textAlign:"center", margin:"12px 0 8px" }}>
                    <span style={{ fontSize:11, color:"var(--ink-4)", background:"var(--bone)", borderRadius:999, padding:"4px 10px", fontWeight:500 }}>
                      {fmtDate(msg.created_at)}
                    </span>
                  </div>
                )}

                {/* Message bubble */}
                <div style={{
                  display:"flex",
                  justifyContent: mine ? "flex-end" : "flex-start",
                  marginBottom: 2,
                  marginTop: i > 0 && isMine(messages[i-1]) === mine ? 2 : 8,
                }}>
                  <div style={{
                    maxWidth:"75%",
                    background: mine ? "var(--ink)" : "var(--bone)",
                    color: mine ? "var(--cream)" : "var(--ink)",
                    borderRadius: mine
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    padding:"10px 14px",
                    boxShadow: "0 1px 2px rgba(31,26,20,0.06)",
                    border: mine ? "none" : "1px solid var(--line)",
                  }}>
                    <p style={{ fontSize:14.5, margin:"0 0 4px", lineHeight:1.45, wordBreak:"break-word" }}>
                      {msg.content}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}>
                      <span style={{ fontSize:10.5, opacity:0.55 }}>
                        {fmtTime(msg.created_at)}
                      </span>
                      {mine && (
                        <span style={{ fontSize:10.5, opacity:0.55 }}>
                          {msg.is_read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={bottomRef} style={{ height:1 }} />
      </div>

      {/* Input bar */}
      <div style={{
        padding:"10px 16px 24px",
        borderTop:"1px solid var(--line)",
        background:"var(--cream)",
        display:"flex", alignItems:"flex-end", gap:10,
        flexShrink:0,
      }}>
        <div style={{
          flex:1, background:"var(--bone)",
          border:"1.5px solid var(--line-strong)",
          borderRadius:22, padding:"10px 16px",
          display:"flex", alignItems:"flex-end", gap:8,
          minHeight:44,
        }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message…"
            rows={1}
            style={{
              flex:1, border:0, background:"transparent", outline:"none",
              fontFamily:"inherit", fontSize:14.5, color:"var(--ink)",
              resize:"none", lineHeight:1.4, maxHeight:120,
              overflowY:"auto",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          style={{
            width:44, height:44, flexShrink:0, borderRadius:999,
            border:"none", cursor: text.trim() ? "pointer" : "default",
            background: text.trim() ? "var(--ink)" : "var(--line-strong)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 180ms",
          }}>
          <Icon name="send" size={18} color={ text.trim() ? "var(--cream)" : "var(--ink-3)" } />
        </button>
      </div>
    </div>
  );
}

// ── Unread badge for nav ────────────────────────────────────
function UnreadBadge({ count }) {
  if (!count || count < 1) return null;
  return (
    <div style={{
      position:"absolute", top:-4, right:-4,
      width:17, height:17, borderRadius:999,
      background:"var(--clay)", color:"#fff",
      fontSize:10, fontWeight:700,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      {count > 9 ? "9+" : count}
    </div>
  );
}

Object.assign(window, { MatchChat, UnreadBadge });