"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildChildContext } from "@/lib/child-profile";
import type { ChildProfile } from "@/lib/child-profile";

const CATEGORIES = [
  { id: "need", label: "Need", color: "#4A7C59", bg: "#E8F0E8", border: "rgba(74,124,89,0.25)",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>),
    pictos: [ { id: 4962, label: "Hungry" }, { id: 4963, label: "Thirsty" }, { id: 6456, label: "Want food" }, { id: 6479, label: "Sleepy" }, { id: 32648, label: "Help" }, { id: 5508, label: "More" } ] },
  { id: "pain", label: "Pain", color: "#C05A3C", bg: "#FDE8E3", border: "rgba(192,90,60,0.25)",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
    pictos: [ { id: 5484, label: "Hurt" }, { id: 28651, label: "Headache" }, { id: 39664, label: "Stomach ache" }, { id: 38403, label: "Nausea" }, { id: 32530, label: "Fever" }, { id: 16703, label: "Sneezing" } ] },
  { id: "feelings", label: "Feelings", color: "#D97706", bg: "#FEF3C7", border: "rgba(217,119,6,0.25)",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>),
    pictos: [ { id: 35533, label: "Happy" }, { id: 35545, label: "Sad" }, { id: 35881, label: "Crying" }, { id: 35539, label: "Angry" }, { id: 35535, label: "Scared" }, { id: 30484, label: "Anxious" }, { id: 13354, label: "Laughing" }, { id: 37721, label: "Love" } ] },
  { id: "sensory", label: "Sensory", color: "#6366F1", bg: "#EEF2FF", border: "rgba(99,102,241,0.25)",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>),
    pictos: [ { id: 2647, label: "Too loud" }, { id: 38050, label: "Quiet" }, { id: 2300, label: "Too hot" }, { id: 4652, label: "Too cold" } ] },
];
const ALL_PICTOS = CATEGORIES.flatMap(cat => cat.pictos.map(p => ({ ...p, catId: cat.id })));

function speakText(text: string) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 1.1;
    window.speechSynthesis.speak(u);
  } catch { /* TTS unavailable */ }
}

export default function CommunicatePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState("need");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sentence, setSentence] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try { window.speechSynthesis.getVoices(); } catch {}
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("nb_active_id");
    if (!id) { router.push("/app"); return; }
    fetch("/api/profiles/" + id)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setProfile(d.profile))
      .catch(() => router.push("/app"));
  }, []);

  const toggle = (id: number) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    setSentence(""); setError("");
  };

  const speak = async () => {
    const sel = ALL_PICTOS.filter(p => selected.has(p.id));
    if (!sel.length || !profile) return;
    setLoading(true); setSentence(""); setError("");
    try {
      const childContext = buildChildContext(profile);
      const res = await fetch("/api/interpret", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, pictos: sel, childContext }),
      });
      const data = await res.json();
      const s: string = data.sentence || "Something went wrong. Please try again.";
      setSentence(s);
      speakText(s);
      const save = await fetch("/api/selections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, pictos: sel.map(p => p.label), sentence: s }),
      });
      if (save.ok) { const d = await save.json(); setProfile(d.profile); }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const activeCat = CATEGORIES.find(c => c.id === activeTab)!;
  const selCount = selected.size;

  if (!profile) {
    return <div style={{ height: "100dvh", background: "#F5F2EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Loading...</div>;
  }

  return (
    <div style={{ height: "100dvh", background: "#F5F2EB", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* TOP BAR */}
      <div style={{ background: "rgba(245,242,235,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E5E1DA", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => router.push("/app")} aria-label="Back to profiles" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#888", padding: "8px 0" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {profile.photo
            ? <img src={profile.photo} alt={profile.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #E5E1DA", flexShrink: 0 }} />
            : <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C05A3C,#E8885A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{profile.name.charAt(0).toUpperCase()}</div>}
          <span style={{ fontWeight: 800, fontSize: 16, color: "#1A1A1A" }}>{profile.name}</span>
        </div>
        <div style={{ width: 34 }} />
      </div>

      {/* CATEGORY TABS */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#F5F2EB", flexShrink: 0 }}>
        {CATEGORIES.map(cat => {
          const isActive = activeTab === cat.id;
          const selInCat = cat.pictos.filter(p => selected.has(p.id)).length;
          return (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)} aria-pressed={isActive} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "12px 4px", borderRadius: 14, border: "none", cursor: "pointer", minHeight: 64,
              background: isActive ? cat.bg : "#fff",
              outline: isActive ? `2px solid ${cat.color}` : "2px solid transparent",
              color: isActive ? cat.color : "#999", transition: "all .18s", position: "relative",
              boxShadow: isActive ? `0 4px 16px ${cat.border}` : "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              {selInCat > 0 && (<div style={{ position: "absolute", top: 6, right: 8, minWidth: 18, height: 18, padding: "0 4px", borderRadius: 9, background: cat.color, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{selInCat}</div>)}
              {cat.icon}
              <span style={{ fontSize: 12, fontWeight: 700 }}>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* PICTO GRID */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {activeCat.pictos.map(p => {
            const isSel = selected.has(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)} aria-pressed={isSel} aria-label={p.label} style={{
                background: isSel ? activeCat.bg : "#fff",
                border: `2.5px solid ${isSel ? activeCat.color : "#E5E1DA"}`,
                borderRadius: 16, padding: "10px 6px 8px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "pointer", position: "relative",
                boxShadow: isSel ? `0 6px 20px ${activeCat.border}` : "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.15s", transform: isSel ? "scale(0.97)" : "scale(1)",
              }}>
                {isSel && (<div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: activeCat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>)}
                <img src={`/arasaac/${p.id}.png`} alt="" style={{ width: 60, height: 60, objectFit: "contain" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: isSel ? activeCat.color : "#444", textAlign: "center", lineHeight: 1.2 }}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ background: "#fff", borderTop: "1px solid #E5E1DA", padding: "12px 16px 14px", flexShrink: 0, boxShadow: "0 -6px 24px rgba(0,0,0,0.06)" }}>
        {selCount > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button onClick={() => { setSelected(new Set()); setSentence(""); setError(""); }} style={{ background: "none", border: "none", color: "#999", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "6px 10px" }}>Clear all ({selCount})</button>
          </div>
        )}

        {error && (
          <div role="alert" style={{ background: "#FEECEC", border: "1.5px solid #E5A0A0", borderRadius: 12, padding: "10px 14px", marginBottom: 10, fontSize: 14, fontWeight: 600, color: "#A33" }}>{error}</div>
        )}

        <div role="status" aria-live="polite">
          {sentence && (
            <div style={{ background: "#FDE8E3", border: "1.5px solid rgba(192,90,60,0.3)", borderRadius: 14, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.5, flex: 1 }}>{sentence}</p>
              <button onClick={() => speakText(sentence)} aria-label="Play again" style={{ background: "#C05A3C", border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>
            </div>
          )}
        </div>

        <button onClick={speak} disabled={selCount === 0 || loading} style={{
          width: "100%", padding: "22px 18px", borderRadius: 20, border: "none",
          background: selCount > 0 && !loading ? "linear-gradient(135deg,#C05A3C,#E8885A)" : "#EAE7DE",
          color: selCount > 0 && !loading ? "#fff" : "#bbb",
          fontWeight: 800, fontSize: 22, cursor: selCount > 0 && !loading ? "pointer" : "default",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          boxShadow: selCount > 0 && !loading ? "0 8px 28px rgba(192,90,60,0.35)" : "none",
          transition: "all .18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, letterSpacing: "-0.02em",
        }}>
          {loading ? (
            <>
              <svg className="nb-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce){ .nb-spin{ animation: none !important; } }`}</style>
              Interpreting...
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selCount > 0 ? "white" : "#bbb"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              {selCount > 0 ? `Speak (${selCount})` : "Speak"}
            </>
          )}
        </button>
        <p style={{ fontSize: 11, color: "#b5b0a6", textAlign: "center", marginTop: 8 }}>Supports communication. Not a medical diagnosis.</p>
      </div>
    </div>
  );
}
