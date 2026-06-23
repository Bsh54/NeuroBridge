"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEMO = [
  { id: 35545, label: "Sad"      },
  { id: 5484,  label: "Hurt"     },
  { id: 30484, label: "Anxious"  },
  { id: 4962,  label: "Hungry"   },
  { id: 2647,  label: "Too loud" },
  { id: 6479,  label: "Sleepy"   },
];

const IGrid = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const IAI = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/>
  </svg>
);
const IVoice = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
  </svg>
);
const IDash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9h18M9 21V9"/>
  </svg>
);
const ILock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IAccess = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="5" r="2"/><path d="M12 7v8M8 10h8M9 21l3-6 3 6"/>
  </svg>
);

const IArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

const STATS = [
  { value: "25%",  label: "of autistic people are non-verbal or minimally verbal" },
  { value: "65%",  label: "experience chronic GI pain that they cannot express" },
  { value: "< 1s", label: "from pictogram tap to spoken sentence" },
];

export default function Landing() {
  const router = useRouter();
  const [lit, setLit] = useState(0);
  const [spoken, setSpoken] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setLit(x => (x + 1) % DEMO.length), 2600);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setSpoken(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* NAV */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(245,242,235,0.94)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-mark">
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: "-0.04em", lineHeight: 1 }}>N</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", color: "var(--text)" }}>NeuroBridge</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["How it works", "#how"], ["Why it matters", "#why"]].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: 14, fontWeight: 500, color: "var(--text-3)", textDecoration: "none", transition: "color .18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>{l}</a>
            ))}
          </nav>
          <button className="btn-primary" onClick={() => router.push("/app")} style={{ fontSize: 14, padding: "11px 22px" }}>
            Open app
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ minHeight: "100dvh", paddingTop: 64, display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 55% at 5% 20%, rgba(192,90,60,0.07), transparent 65%),
            radial-gradient(ellipse 45% 45% at 90% 75%, rgba(74,124,89,0.06), transparent 65%)
          `,
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 28px 88px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>

          {/* LEFT */}
          <div className="fade-up">
            <h1 style={{ fontSize: "clamp(42px,5.5vw,68px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.06, marginBottom: 24, color: "var(--text)" }}>
              Every need<br />
              <span className="grad-text">deserves<br />a voice.</span>
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.72, maxWidth: 430, marginBottom: 44 }}>
              NeuroBridge turns pictogram taps into spoken sentences, helping non-verbal autistic individuals reach the people who care for them.
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <button className="btn-primary" onClick={() => router.push("/app")} style={{ fontSize: 16, padding: "16px 36px", borderRadius: 14 }}>
                Open app
              </button>
              <a href="#how" style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 15, fontWeight: 700, color: "var(--primary)",
                textDecoration: "none",
                border: "2px solid var(--primary)",
                borderRadius: 14, padding: "14px 26px",
                transition: "all .18s",
                background: "transparent",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}>
                See how it works <IArrow />
              </a>
            </div>
          </div>

          {/* RIGHT - demo card */}
          <div className="fade-up d2" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -48, zIndex: 0, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(192,90,60,0.08), transparent 68%)", filter: "blur(24px)" }} />
            <div style={{ position: "relative", zIndex: 1, background: "var(--bg-card)", border: "1px solid var(--border-soft)", borderRadius: 24, boxShadow: "0 28px 80px rgba(192,90,60,0.10), 0 0 0 1px rgba(192,90,60,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 8, background: "var(--bg)" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#EF4444","#F59E0B","#22C55E"].map(col => (
                    <div key={col} style={{ width: 10, height: 10, borderRadius: "50%", background: col, opacity: 0.6 }} />
                  ))}
                </div>
                <span style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.04em" }}>NeuroBridge</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "var(--green)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />Mia
                </div>
              </div>
              <div style={{ padding: "16px 16px 12px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.07em", marginBottom: 12 }}>MIA IS SHARING...</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {DEMO.map(({ id, label }, i) => {
                    const active = i === lit;
                    return (
                      <div key={id} style={{
                        borderRadius: 12, padding: "10px 6px",
                        background: active ? "rgba(192,90,60,0.08)" : "var(--bg-subtle)",
                        border: `1.5px solid ${active ? "rgba(192,90,60,0.30)" : "var(--border-soft)"}`,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                        transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
                        transform: active ? "scale(1.05)" : "scale(1)",
                      }}>
                        <img src={`/arasaac/${id}.png`} alt={label} style={{ width: 56, height: 56, objectFit: "contain" }} />
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: active ? "var(--primary)" : "var(--text-3)", transition: "color 0.4s" }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-soft)", borderRadius: 13, padding: "13px 15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff" }}>N</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)" }}>NeuroBridge AI</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                    Mia is feeling <strong style={{ color: "var(--primary)" }}>emotional pain</strong> and may need immediate comfort and reassurance.
                  </p>
                  {spoken && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "var(--green-soft)", border: "1px solid rgba(74,124,89,0.25)", borderRadius: 8, padding: "6px 11px" }}>
                      <IVoice /><span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)" }}>Speaking aloud</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section id="why" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.1, color: "var(--text)", marginBottom: 20 }}>
              The communication gap is a health crisis.
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75, maxWidth: 400 }}>
              When a non-verbal person cannot express pain, hunger, or anxiety, caregivers are left guessing. NeuroBridge closes that gap in under one second.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 0", borderBottom: i < STATS.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                <span style={{ fontSize: "clamp(30px,3vw,42px)", fontWeight: 900, color: i % 2 === 0 ? "var(--primary)" : "var(--green)", letterSpacing: "-0.04em", minWidth: 80, lineHeight: 1 }}>{s.value}</span>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section style={{ padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, letterSpacing: "-0.045em", color: "var(--text)", marginBottom: 12 }}>A complete communication pipeline</h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 380, lineHeight: 1.7 }}>From the first tap to the caregiver's ear, everything is automated.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {/* Large: Pictograms */}
            <div style={{ gridColumn: "span 2", background: "rgba(192,90,60,0.05)", border: "1.5px solid rgba(192,90,60,0.14)", borderRadius: 20, padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 220 }}>
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 20, background: "rgba(192,90,60,0.09)", border: "1px solid rgba(192,90,60,0.18)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><IGrid /></div>
                <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 10 }}>ARASAAC pictograms</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>International AAC standard used by speech therapists worldwide. 24 pictograms covering pain, emotions, food, and sensory needs. One tap is all it takes.</p>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
                {[35545, 5484, 30484, 4962].map(id => (
                  <img key={id} src={`/arasaac/${id}.png`} alt="" style={{ width: 36, height: 36, objectFit: "contain", opacity: 0.85 }} />
                ))}
              </div>
            </div>
            {/* Large: AI */}
            <div style={{ gridColumn: "span 2", background: "rgba(74,124,89,0.05)", border: "1.5px solid rgba(74,124,89,0.14)", borderRadius: 20, padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 220 }}>
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 20, background: "rgba(74,124,89,0.09)", border: "1px solid rgba(74,124,89,0.18)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}><IAI /></div>
                <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 10 }}>Personalized AI agent</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>Every person gets their own AI agent that learns their patterns over time. The more they use it, the more precisely it interprets their signals.</p>
              </div>
              <div style={{ marginTop: 24, background: "rgba(74,124,89,0.07)", border: "1px solid rgba(74,124,89,0.16)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--green)", fontWeight: 600, lineHeight: 1.5 }}>
                "Mia is expressing physical discomfort with signs of anxiety. She may need reassurance."
              </div>
            </div>
            {/* Small tiles */}
            {[
              { icon: <IVoice />, title: "Voice output", desc: "Message spoken aloud automatically. No voice needed from the user.", col: "var(--primary)" },
              { icon: <IDash />, title: "Caregiver dashboard", desc: "Full history with timestamps. Track emotional patterns and frequent needs.", col: "var(--primary)" },
              { icon: <ILock />, title: "Privacy first", desc: "Everything stays on the device. No account required, no server uploads.", col: "var(--green)" },
              { icon: <IAccess />, title: "Accessible by design", desc: "56px touch targets, 7:1 contrast ratio, full screen-reader support.", col: "var(--green)" },
            ].map((f, i) => (
              <div key={i} style={{ gridColumn: "span 1", background: "var(--bg-card)", border: "1.5px solid var(--border-soft)", borderRadius: 18, padding: "24px" }}>
                <div style={{ color: f.col, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)", padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, letterSpacing: "-0.045em", color: "var(--text)", marginBottom: 56, maxWidth: 360 }}>Four steps. Fully automatic.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: 27, left: "12.5%", right: "12.5%", height: 1, background: "var(--border-soft)", zIndex: 0 }} />
            {[
              { n: "01", title: "Tap a pictogram", desc: "Select from 24 ARASAAC pictograms. No reading or typing required.", accent: "var(--primary)" },
              { n: "02", title: "AI interprets",   desc: "Your personal AI agent reads the combination and generates a clear sentence.", accent: "var(--green)" },
              { n: "03", title: "Device speaks",   desc: "The sentence is read aloud automatically by text-to-speech.", accent: "var(--primary)" },
              { n: "04", title: "Caregiver logs",  desc: "Every exchange is saved in the dashboard with a timestamp.", accent: "var(--green)" },
            ].map((s, i) => (
              <div key={i} style={{ position: "relative", zIndex: 1, padding: "0 28px 0 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-card)", border: `2px solid ${s.accent}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 13, fontWeight: 900, color: s.accent, letterSpacing: "0.05em" }}>{s.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ background: "var(--grad)", borderRadius: 24, padding: "80px 64px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.08, color: "#fff", marginBottom: 12 }}>
                Ready to open<br />the bridge?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>Free. No account needed.</p>
            </div>
            <button onClick={() => router.push("/app")} style={{ background: "#fff", color: "var(--primary)", border: "none", borderRadius: 16, padding: "18px 44px", fontSize: 17, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.02em", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", transition: "transform .18s, box-shadow .18s", flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)"; }}>
              Open app
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border-soft)", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-mark" style={{ width: 28, height: 28, borderRadius: 8 }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: "-0.04em" }}>N</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", color: "var(--text)" }}>NeuroBridge</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Helping non-verbal individuals communicate.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            2026 NeuroBridge. A communication aid, not a medical diagnosis. Data is stored to support caregivers and is never sold or shared.
          </p>
        </div>
      </footer>
    </div>
  );
}
