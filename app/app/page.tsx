"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ChildProfile } from "@/lib/child-profile";

function Avatar({ profile, size = 72 }: { profile: ChildProfile; size?: number }) {
  if (profile.photo) {
    return <img src={profile.photo} alt={profile.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block", border: "2.5px solid #E5E1DA" }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#C05A3C,#E8885A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.38, border: "2.5px solid #E5E1DA", flexShrink: 0 }}>
      {profile.name.charAt(0).toUpperCase()}
    </div>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 256;
        let w = img.width, h = img.height;
        if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
        else { if (h > max) { w = Math.round(w * max / h); h = max; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject();
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AppPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    } catch { /* keep current */ }
    finally { setLoaded(true); }
  };

  useEffect(() => { refresh(); }, []);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setPhotoPreview(await compressImage(file)); } catch { /* ignore */ }
  };

  const addProfile = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), age: newAge || null, photo: photoPreview || null }),
      });
      await refresh();
      setNewName(""); setNewAge(""); setPhotoPreview(""); setAdding(false);
    } finally { setSaving(false); }
  };

  const selectProfile = (id: string) => {
    localStorage.setItem("nb_active_id", id);
    router.push("/app/communicate");
  };

  const deleteProfile = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove " + name + "?")) return;
    await fetch("/api/profiles/" + id, { method: "DELETE" });
    refresh();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EB", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{
        background: "rgba(245,242,235,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #E5E1DA", padding: "0 28px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#C05A3C,#E8885A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, letterSpacing: "-0.04em" }}>N</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#1A1A1A", letterSpacing: "-0.03em" }}>NeuroBridge</span>
        </div>
        <button onClick={() => router.push("/dashboard")} style={{
          background: "none", border: "1.5px solid #E5E1DA", borderRadius: 8,
          padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.04em", marginBottom: 8 }}>Who is communicating today?</h1>
        <p style={{ fontSize: 15, color: "#888", marginBottom: 28 }}>Select a profile or add a new person.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {profiles.map(p => (
            <button key={p.id} onClick={() => selectProfile(p.id)} style={{
              background: "#fff", border: "2px solid #E5E1DA", borderRadius: 20,
              padding: "28px 16px 22px", textAlign: "center", cursor: "pointer", position: "relative",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.18s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C05A3C"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E1DA"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              <button onClick={e => deleteProfile(p.id, p.name, e)} aria-label={"Remove " + p.name} style={{
                position: "absolute", top: 10, right: 10, background: "none", border: "none",
                cursor: "pointer", color: "#ccc", fontSize: 16, lineHeight: 1, padding: 4,
              }}>x</button>
              <div style={{ marginBottom: 14 }}><Avatar profile={p} size={72} /></div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#1A1A1A" }}>{p.name}</div>
              {p.age ? <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600, marginTop: 3 }}>{p.age} years old</div> : null}
            </button>
          ))}

          {!adding && (
            <button onClick={() => setAdding(true)} style={{
              background: "none", border: "2.5px dashed #D1CCC4", borderRadius: 20,
              padding: "28px 16px", textAlign: "center", cursor: "pointer",
              color: "#aaa", transition: "all 0.18s", minHeight: 160,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C05A3C"; (e.currentTarget as HTMLElement).style.color = "#C05A3C"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#D1CCC4"; (e.currentTarget as HTMLElement).style.color = "#aaa"; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
              </svg>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Add person</div>
            </button>
          )}
        </div>

        {loaded && profiles.length === 0 && !adding && (
          <p style={{ fontSize: 13, color: "#bbb", marginBottom: 24 }}>No profiles yet. Add the first person to begin.</p>
        )}

        {adding && (
          <div onClick={e => { if (e.target === e.currentTarget) setAdding(false); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(26,26,26,0.45)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px", overflowY: "auto" }}>
          <div style={{ background: "#fff", border: "1.5px solid #E5E1DA", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: "#1A1A1A", marginBottom: 24 }}>New profile</p>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
              <div onClick={() => fileRef.current?.click()} style={{
                width: 84, height: 84, borderRadius: "50%", flexShrink: 0,
                background: photoPreview ? "none" : "#F5F2EB",
                border: "2.5px dashed " + (photoPreview ? "#C05A3C" : "#D1CCC4"),
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                }
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#1A1A1A", marginBottom: 4 }}>Profile photo</p>
                <p style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>Click the circle to upload</p>
                <button onClick={() => fileRef.current?.click()} style={{
                  background: "none", border: "1.5px solid #E5E1DA", borderRadius: 8,
                  padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer",
                }}>{photoPreview ? "Change photo" : "Upload photo"}</button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="nb-name" style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>First name</label>
              <input id="nb-name" autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addProfile(); if (e.key === "Escape") setAdding(false); }}
                placeholder="e.g. Lucas"
                style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "2px solid #E5E1DA",
                  fontSize: 16, fontFamily: "'DM Sans', system-ui, sans-serif", outline: "none", boxSizing: "border-box", color: "#1A1A1A" }}
                onFocus={e => e.target.style.borderColor = "#C05A3C"}
                onBlur={e => e.target.style.borderColor = "#E5E1DA"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label htmlFor="nb-age" style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>Age (optional)</label>
              <input id="nb-age" type="number" min="1" max="99" value={newAge} onChange={e => setNewAge(e.target.value)}
                placeholder="e.g. 8"
                style={{ width: 120, padding: "13px 16px", borderRadius: 12, border: "2px solid #E5E1DA",
                  fontSize: 16, fontFamily: "'DM Sans', system-ui, sans-serif", outline: "none", color: "#1A1A1A" }}
                onFocus={e => e.target.style.borderColor = "#C05A3C"}
                onBlur={e => e.target.style.borderColor = "#E5E1DA"}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setAdding(false); setNewName(""); setNewAge(""); setPhotoPreview(""); }} style={{
                flex: 1, padding: "14px", borderRadius: 12, border: "1.5px solid #E5E1DA",
                background: "none", fontWeight: 600, fontSize: 15, color: "#888", cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>Cancel</button>
              <button onClick={addProfile} disabled={!newName.trim() || saving} style={{
                flex: 2, padding: "14px", borderRadius: 12, border: "none",
                background: newName.trim() && !saving ? "linear-gradient(135deg,#C05A3C,#E8885A)" : "#EAE7DE",
                color: newName.trim() && !saving ? "#fff" : "#aaa",
                fontWeight: 700, fontSize: 15, cursor: newName.trim() && !saving ? "pointer" : "default",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>{saving ? "Saving..." : "Create profile"}</button>
            </div>
          </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: "#b5b0a6", marginTop: 32, lineHeight: 1.5 }}>
          Profiles and communication history are stored to help caregivers. This tool supports communication and is not a medical diagnosis.
        </p>
      </div>
    </div>
  );
}
