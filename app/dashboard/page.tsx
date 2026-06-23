"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ChildProfile } from "@/lib/child-profile";

function timeAgo(iso: string) {
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "yesterday";
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}
function fullTime(iso: string) { return new Date(iso).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }); }
function stripMarkdown(text: string): string {
  return text.replace(/\*{1,3}([^*]+?)\*{1,3}/g, "$1").replace(/^#{1,6}\s+/gm, "").replace(/^[-*+]\s+/gm, "").replace(/`([^`]+?)`/g, "$1").trim();
}

function ProfileAvatar({ profile, size = 40 }: { profile: ChildProfile; size?: number }) {
  if (profile.photo) return <img src={profile.photo} alt={profile.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #E5E1DA", flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#C05A3C,#E8885A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>{profile.name.charAt(0).toUpperCase()}</div>;
}

interface ChatMsg { role: "user" | "ai"; text: string; }
const SUGGESTIONS = [
  "How can I better understand their communication?",
  "What triggers anxiety for them?",
  "How do I support them during meltdowns?",
  "What sensory accommodations might help?",
];

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/profiles").then(r => r.json()).then(d => {
      const p: ChildProfile[] = d.profiles ?? [];
      setProfiles(p);
      if (p.length > 0) setActiveId(p[0].id);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  useEffect(() => { if (chatOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatOpen]);

  if (!loaded) return <div style={{ minHeight: "100vh", background: "#F5F2EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Loading...</div>;

  const current = profiles.find(p => p.id === activeId);
  const history = current ? [...current.selections].reverse() : [];
  const topNeeds = Object.entries(current?.frequent ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const replay = (sentence: string) => { try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(sentence); u.lang = "en-US"; u.rate = 0.9; window.speechSynthesis.speak(u); } catch {} };
  const openChat = () => { setMessages([]); setInput(""); setChatOpen(true); };

  const sendMessage = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading || !current) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }, { role: "ai", text: "" }]);
    setLoading(true);
    try {
      const res = await fetch("/api/caregiver", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, childName: current.name, topNeeds, recentHistory: history.slice(0, 10) }),
      });
      if (!res.ok || !res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setLoading(false);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(m => { const last = m[m.length - 1]; return [...m.slice(0, -1), { ...last, text: last.text + chunk }]; });
      }
      setMessages(m => { const last = m[m.length - 1]; return [...m.slice(0, -1), { ...last, text: stripMarkdown(last.text) }]; });
    } catch {
      setMessages(m => { const last = m[m.length - 1]; if (last.role === "ai" && last.text === "") return [...m.slice(0, -1), { role: "ai", text: "Something went wrong, please try again." }]; return m; });
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EB", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: "rgba(245,242,235,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E5E1DA", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#C05A3C,#E8885A)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontWeight: 900, fontSize: 14, letterSpacing: "-0.04em" }}>N</span></div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#1A1A1A", letterSpacing: "-0.02em" }}>NeuroBridge</span>
          <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>/ Dashboard</span>
        </div>
        <button onClick={() => router.push("/app")} style={{ background: "linear-gradient(135deg,#C05A3C,#E8885A)", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", minHeight: 40 }}>Open app</button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #E5E1DA", background: "#fff", position: "sticky", top: 60, height: "calc(100vh - 60px)", overflowY: "auto", padding: "16px 10px" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, padding: "0 8px" }}>People</p>
          {profiles.length === 0 && (
            <div style={{ padding: "24px 8px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#ccc", marginBottom: 12 }}>No profiles yet.</p>
              <button onClick={() => router.push("/app")} style={{ background: "none", border: "1.5px solid #E5E1DA", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#888", cursor: "pointer" }}>Add profiles</button>
            </div>
          )}
          {profiles.map(p => {
            const isActive = p.id === activeId;
            return (
              <button key={p.id} onClick={() => setActiveId(p.id)} style={{ width: "100%", textAlign: "left", padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", marginBottom: 2, background: isActive ? "#FDE8E3" : "none", display: "flex", alignItems: "center", gap: 10, minHeight: 56 }}>
                <ProfileAvatar profile={p} size={36} />
                <span style={{ fontWeight: 700, fontSize: 14, color: isActive ? "#C05A3C" : "#1A1A1A" }}>{p.name}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: "32px 36px", minWidth: 0 }}>
          {!current ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}><p style={{ fontSize: 15, color: "#bbb" }}>Select a person to see their history.</p></div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <ProfileAvatar profile={current} size={60} />
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.04em", marginBottom: 2 }}>{current.name}</h1>
                  <p style={{ fontSize: 13, color: "#aaa" }}>{current.age ? `${current.age} years old  .  ` : ""}{history.length} communication{history.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={openChat} style={{ background: "linear-gradient(135deg,#C05A3C,#E8885A)", border: "none", borderRadius: 14, padding: "14px 24px", fontWeight: 800, fontSize: 15, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, minHeight: 56, boxShadow: "0 4px 14px rgba(192,90,60,0.30)", letterSpacing: "-0.01em" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Ask AI
                </button>
              </div>

              {topNeeds.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Expresses most often</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {topNeeds.map(([label, count]) => (
                      <span key={label} style={{ background: "#fff", border: "1.5px solid #E5E1DA", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#333", display: "flex", alignItems: "center", gap: 6 }}>{label}<span style={{ fontSize: 11, color: "#C05A3C", fontWeight: 800 }}>{count}x</span></span>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 12, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Communication history</p>
              {history.length === 0 && (<div style={{ background: "#fff", border: "1px solid #E5E1DA", borderRadius: 16, padding: "40px 24px", textAlign: "center" }}><p style={{ fontSize: 14, color: "#bbb" }}>No communications yet.</p></div>)}

              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16 }}>
                {history.map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #E5E1DA", borderRadius: 16, padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 52, flexShrink: 0, paddingTop: 2 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{fullTime(s.at)}</div>
                      <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>{timeAgo(s.at)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                        {s.pictos.map((p, j) => (<span key={j} style={{ background: "#F5F2EB", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#888" }}>{p}</span>))}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.55 }}>{s.sentence}</p>
                    </div>
                    <button onClick={() => replay(s.sentence)} aria-label="Replay this sentence" style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 12, background: "#FDE8E3", border: "2px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s, border-color .15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#C05A3C"; const svg = e.currentTarget.querySelector("svg"); if (svg) (svg as SVGElement).style.stroke = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FDE8E3"; const svg = e.currentTarget.querySelector("svg"); if (svg) (svg as SVGElement).style.stroke = "#C05A3C"; }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C05A3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#b5b0a6", marginTop: 24, paddingBottom: 32 }}>This history supports caregivers. NeuroBridge is a communication aid, not a medical diagnosis.</p>
            </>
          )}
        </div>
      </div>

      {chatOpen && current && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#F5F2EB", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <div style={{ borderBottom: "1px solid #E5E1DA", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 14, flexShrink: 0, background: "rgba(245,242,235,0.97)", backdropFilter: "blur(16px)" }}>
            <button onClick={() => setChatOpen(false)} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: "1.5px solid #E5E1DA", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
            <div><p style={{ fontWeight: 800, fontSize: 15, color: "#1A1A1A", lineHeight: 1 }}>AI Caregiver Assistant</p><p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>About {current.name}</p></div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              {messages.length === 0 && (
                <div>
                  <p style={{ fontSize: 14, color: "#aaa", textAlign: "center", marginBottom: 24 }}>Ask anything about {current.name}'s communication patterns and needs.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => sendMessage(s)} style={{ background: "#fff", border: "1.5px solid #E5E1DA", borderRadius: 14, padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#333", cursor: "pointer", textAlign: "left", minHeight: 52, transition: "border-color .15s, background .15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C05A3C"; (e.currentTarget as HTMLElement).style.background = "#FDE8E3"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E1DA"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
                  <div style={{ maxWidth: "75%", padding: "14px 18px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "linear-gradient(135deg,#C05A3C,#E8885A)" : "#fff", color: m.role === "user" ? "#fff" : "#1A1A1A", fontSize: 14, fontWeight: 500, lineHeight: 1.6, border: m.role === "ai" ? "1px solid #E5E1DA" : "none", boxShadow: m.role === "ai" ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>{m.text}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 6, padding: "12px 0", marginLeft: 4 }}>
                  {[0, 1, 2].map(i => (<div key={i} className="nb-bounce" style={{ width: 8, height: 8, borderRadius: "50%", background: "#C05A3C", opacity: 0.6, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}/>))}
                  <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} } @media (prefers-reduced-motion: reduce){ .nb-bounce{ animation:none !important; } }`}</style>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #E5E1DA", padding: "16px", background: "rgba(245,242,235,0.97)", backdropFilter: "blur(16px)", flexShrink: 0 }}>
            <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="Ask a question..." aria-label="Ask a question" style={{ flex: 1, padding: "14px 18px", borderRadius: 14, border: "1.5px solid #E5E1DA", outline: "none", fontSize: 15, fontWeight: 500, background: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1A1A1A", minHeight: 52 }} />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label="Send" style={{ background: input.trim() && !loading ? "linear-gradient(135deg,#C05A3C,#E8885A)" : "#E5E1DA", border: "none", borderRadius: 14, width: 52, height: 52, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .2s" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? "#fff" : "#aaa"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
