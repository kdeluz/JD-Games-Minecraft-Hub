"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* ── Constants ── */
const RULES = [
  "No griefing, stealing, or destroying other players' builds.",
  "Be respectful in chat — no harassment, slurs, or toxicity.",
  "No hacking, exploiting, or using unfair mods/clients.",
  "PvP is consensual only unless in designated PvP zones.",
  "Keep builds a reasonable distance from others unless agreed upon.",
  "Report bugs or issues to Kyle — don't exploit them.",
  "AFK farms must not cause server lag. If asked to modify, do it.",
  "Have fun. This is a chill server for friends.",
];

const TAG_COLORS = {
  launch:    { bg: "#4ade8033", text: "#4ade80", label: "Launch" },
  update:    { bg: "#60a5fa33", text: "#60a5fa", label: "Update" },
  event:     { bg: "#f59e0b33", text: "#f59e0b", label: "Event" },
  alert:     { bg: "#ef444433", text: "#ef4444", label: "Alert" },
  season:    { bg: "#4ade8033", text: "#4ade80", label: "Season" },
  milestone: { bg: "#a78bfa33", text: "#a78bfa", label: "Milestone" },
  info:      { bg: "#94a3b833", text: "#94a3b8", label: "Info" },
};

const fmtDate = (d) => {
  const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ── Admin API helper ── */
async function adminFetch(password, action, table, data = {}, id = null) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, action, table, data, id }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

/* ── Shared components ── */
function Toast({ message, type }) {
  if (!message) return null;
  return <div className={`toast toast-${type}`}>{message}</div>;
}

function TagBadge({ tag }) {
  const c = TAG_COLORS[tag] || TAG_COLORS.info;
  return <span className="tag" style={{ background: c.bg, color: c.text }}>{c.label}</span>;
}

/* ═══════════════════════════ NAV ═══════════════════════════ */
function Nav({ page, setPage }) {
  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => setPage("home")}>
          <div className="logo-icon"><span>JD</span></div>
          JD GAMES
        </div>
        <div className="nav-links">
          {[["home","Home"],["timeline","Timeline"],["rules","Rules"],["whitelist","Join"],["admin","Admin"]].map(([k,l]) => (
            <button key={k} className={page === k ? "active" : ""} onClick={() => setPage(k)}>{l}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════ SERVER BAR ═══════════════════════════ */
function ServerBar({ info }) {
  const isOnline = info.status?.toLowerCase() === "online";
  return (
    <div className="server-bar">
      <div className="server-bar-inner">
        <div className="server-stat">
          <span className={`status-dot ${isOnline ? "" : "offline"}`} />
          <span className="label">Status</span>
          <span className={`value ${isOnline ? "online" : ""}`}>{info.status}</span>
        </div>
        <div className="server-stat"><span className="label">Version</span><span className="value">{info.version}</span></div>
        <div className="server-stat"><span className="label">Modpack</span><span className="value">{info.modpack}</span></div>
        <div className="server-stat"><span className="label">Season</span><span className="value">{info.season}</span></div>
        <div className="server-stat"><span className="label">Last Wipe</span><span className="value">{info.last_wipe}</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ HOME ═══════════════════════════ */
function HomePage({ announcements, setPage }) {
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date > a.date ? 1 : b.date < a.date ? -1 : 0;
  });

  return (
    <div className="fade-in">
      <div className="hero">
        <div className="hero-bg" />
        <h1>JD GAMES</h1>
        <p>A private Minecraft server for friends. Modded survival, community builds, and good times. No randos.</p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => setPage("whitelist")}>Apply to Join</button>
          <button className="btn btn-outline" onClick={() => setPage("rules")}>Server Rules</button>
        </div>
      </div>
      <div className="page">
        <div className="section-header">
          <h2>{"// ANNOUNCEMENTS"}</h2>
          <p>Latest news and updates from the server</p>
        </div>
        {sorted.map((a) => (
          <div key={a.id} className={`card ${a.pinned ? "card-pinned" : ""}`}>
            <h3>{a.pinned && <span style={{ color: "var(--accent)", fontSize: 13 }}>📌</span>}{a.title}</h3>
            <p>{a.body}</p>
            <div className="card-meta">
              <TagBadge tag={a.tag} />
              <span>{fmtDate(a.date)}</span>
            </div>
          </div>
        ))}
        <div className="join-box">
          <h3>WANT THE IP?</h3>
          <p>The server IP is private. Message Kyle on Discord or ask a friend for access.</p>
          <div className="discord-tag">💬 Message Kyle on Discord</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ TIMELINE ═══════════════════════════ */
function TimelinePage({ timeline }) {
  const sorted = [...timeline].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2>{"// SERVER TIMELINE"}</h2>
        <p>The history of JD Games from day one</p>
      </div>
      <div className="timeline">
        {sorted.map((t) => (
          <div key={t.id} className={`timeline-item ${t.tag === "milestone" ? "milestone" : ""}`}>
            <div className="timeline-date">{t.date_label}</div>
            <div className="timeline-title">{t.title}</div>
            <div className="timeline-desc">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ RULES ═══════════════════════════ */
function RulesPage() {
  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2>{"// SERVER RULES"}</h2>
        <p>Follow these or get the boot. Pretty simple.</p>
      </div>
      <div className="rules-list">
        {RULES.map((r, i) => <div key={i} className="rule-item">{r}</div>)}
      </div>
    </div>
  );
}

/* ═══════════════════════════ WHITELIST ═══════════════════════════ */
function WhitelistPage({ showToast }) {
  const [mc, setMc] = useState("");
  const [name, setName] = useState("");
  const [disc, setDisc] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!mc.trim() || !name.trim()) {
      showToast("Please fill in your Minecraft username and name.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("whitelist_applications").insert({
        mc_username: mc.trim(),
        real_name: name.trim(),
        discord: disc.trim() || "",
        note: note.trim() || "",
        status: "pending",
      });
      if (error) throw error;
      setSent(true);
      showToast("Application submitted! Kyle will review it soon.", "success");
    } catch (err) {
      showToast("Something went wrong: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="page fade-in" style={{ textAlign: "center", paddingTop: 80 }}>
        <h2 style={{ fontFamily: "var(--pixel-font)", fontSize: 16, color: "var(--accent)", marginBottom: 16 }}>APPLICATION SENT</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 420, margin: "0 auto" }}>
          Your whitelist application has been submitted. Kyle will review it and add you if approved. Message him on Discord if you haven{"'"}t heard back.
        </p>
        <div className="discord-tag" style={{ marginTop: 20 }}>💬 Message Kyle on Discord</div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2>{"// JOIN THE SERVER"}</h2>
        <p>Submit your info below and Kyle will review your application</p>
      </div>
      <div style={{ maxWidth: 520 }}>
        <div className="card">
          <div className="form-group">
            <label>Minecraft Username *</label>
            <input className="form-input" placeholder="e.g. Steve" value={mc} onChange={(e) => setMc(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Your Name *</label>
            <input className="form-input" placeholder="So Kyle knows who you are" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Discord Username</label>
            <input className="form-input" placeholder="Optional but helpful" value={disc} onChange={(e) => setDisc(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Anything else?</label>
            <textarea className="form-input" placeholder="How'd you hear about us, etc." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
      <div className="join-box" style={{ marginTop: 32 }}>
        <h3>ALREADY WHITELISTED?</h3>
        <p>Message Kyle on Discord for the server IP.</p>
        <div className="discord-tag">💬 Message Kyle on Discord</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ ADMIN ═══════════════════════════ */
function AdminPage({ announcements, timeline, serverInfo, reload, showToast }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState("apps");
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Admin helper bound with password
  const api = useCallback((action, table, data, id) => {
    return adminFetch(pass, action, table, data, id);
  }, [pass]);

  const login = async () => {
    try {
      // Test the password by listing whitelist apps
      const res = await adminFetch(pass, "list", "whitelist_applications");
      setApps(res.data || []);
      setAuthed(true);
    } catch {
      showToast("Wrong password.", "error");
    }
  };

  const loadApps = useCallback(async () => {
    if (!authed) return;
    setLoadingApps(true);
    try {
      const res = await api("list", "whitelist_applications");
      setApps(res.data || []);
    } catch {}
    setLoadingApps(false);
  }, [authed, api]);

  useEffect(() => { if (authed) loadApps(); }, [authed, loadApps]);

  if (!authed) {
    return (
      <div className="admin-login fade-in">
        <h2 style={{ fontFamily: "var(--pixel-font)", fontSize: 14, color: "var(--accent)", marginBottom: 24 }}>ADMIN LOGIN</h2>
        <div className="form-group">
          <input
            className="form-input" type="password" placeholder="Enter admin password"
            value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={login}>Log In</button>
        <p style={{ color: "var(--text-muted)", marginTop: 16, fontSize: 12 }}>Admin access only.</p>
      </div>
    );
  }

  const pendingCount = apps.filter((a) => a.status === "pending").length;

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2>{"// ADMIN PANEL"}</h2>
        <p>Manage applications, announcements, timeline, and server info</p>
      </div>
      <div className="admin-tabs">
        {[
          ["apps", `Applications (${pendingCount})`],
          ["announce", "Announcements"],
          ["tl", "Timeline"],
          ["server", "Server Info"],
        ].map(([k, l]) => (
          <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "apps" && <AdminApps apps={apps} api={api} reload={loadApps} showToast={showToast} />}
      {tab === "announce" && <AdminAnnouncements announcements={announcements} api={api} reload={reload} showToast={showToast} />}
      {tab === "tl" && <AdminTimeline timeline={timeline} api={api} reload={reload} showToast={showToast} />}
      {tab === "server" && <AdminServerInfo serverInfo={serverInfo} api={api} reload={reload} showToast={showToast} />}
    </div>
  );
}

/* ── Admin: Applications ── */
function AdminApps({ apps, api, reload, showToast }) {
  const updateStatus = async (id, status) => {
    try {
      await api("update", "whitelist_applications", { status }, id);
      showToast(`Application ${status}.`, "success");
      reload();
    } catch (err) { showToast(err.message, "error"); }
  };
  const deleteApp = async (id) => {
    try {
      await api("delete", "whitelist_applications", {}, id);
      showToast("Application removed.", "success");
      reload();
    } catch (err) { showToast(err.message, "error"); }
  };

  const pending = apps.filter((a) => a.status === "pending");
  const rest = apps.filter((a) => a.status !== "pending");

  return (
    <div>
      {apps.length === 0 && <p style={{ color: "var(--text-muted)", padding: 24 }}>No applications yet.</p>}
      {pending.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, color: "var(--warning)", marginBottom: 12 }}>Pending ({pending.length})</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="wl-table">
              <thead><tr><th>MC Username</th><th>Name</th><th>Discord</th><th>Note</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {pending.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "var(--mono-font)", color: "var(--text-primary)" }}>{a.mc_username}</td>
                    <td>{a.real_name}</td>
                    <td>{a.discord || "—"}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.note || "—"}</td>
                    <td>{a.created_at?.slice(0, 10)}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a.id, "approved")}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a.id, "denied")}>Deny</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {rest.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, color: "var(--text-muted)", margin: "24px 0 12px" }}>History</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="wl-table">
              <thead><tr><th>MC Username</th><th>Name</th><th>Discord</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {rest.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "var(--mono-font)", color: "var(--text-primary)" }}>{a.mc_username}</td>
                    <td>{a.real_name}</td>
                    <td>{a.discord || "—"}</td>
                    <td><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                    <td>{a.created_at?.slice(0, 10)}</td>
                    <td><button className="btn-ghost" onClick={() => deleteApp(a.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Admin: Announcements ── */
function AdminAnnouncements({ announcements, api, reload, showToast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", tag: "update", pinned: false });
  const [saving, setSaving] = useState(false);

  const startNew = () => { setForm({ title: "", body: "", tag: "update", pinned: false }); setEditing("new"); };
  const startEdit = (a) => { setForm({ title: a.title, body: a.body, tag: a.tag, pinned: a.pinned }); setEditing(a.id); };

  const saveItem = async () => {
    if (!form.title.trim() || !form.body.trim()) { showToast("Title and body required.", "error"); return; }
    setSaving(true);
    try {
      if (editing === "new") {
        await api("create", "announcements", { ...form, date: new Date().toISOString().slice(0, 10) });
      } else {
        await api("update", "announcements", form, editing);
      }
      setEditing(null);
      showToast("Announcement saved.", "success");
      reload();
    } catch (err) { showToast(err.message, "error"); }
    setSaving(false);
  };

  const deleteItem = async (id) => {
    try {
      await api("delete", "announcements", {}, id);
      showToast("Announcement deleted.", "success");
      reload();
    } catch (err) { showToast(err.message, "error"); }
  };

  if (editing) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>{editing === "new" ? "New Announcement" : "Edit Announcement"}</h3>
        <div className="form-group">
          <label>Title</label>
          <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Body</label>
          <textarea className="form-input" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Tag</label>
            <select className="form-input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
              {["launch","update","event","alert","info"].map((k) => (
                <option key={k} value={k}>{TAG_COLORS[k].label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
              Pinned
            </label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={saveItem} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-primary btn-sm" style={{ marginBottom: 16 }} onClick={startNew}>+ New Announcement</button>
      {announcements.map((a) => (
        <div key={a.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ fontSize: 15 }}>{a.pinned && "📌 "}{a.title}<TagBadge tag={a.tag} /></h3>
            <p style={{ marginTop: 4 }}>{a.body}</p>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(a.date)}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-outline btn-sm" onClick={() => startEdit(a)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => deleteItem(a.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Admin: Timeline ── */
function AdminTimeline({ timeline, api, reload, showToast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date_label: "", title: "", description: "", tag: "milestone", sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setForm({ date_label: "", title: "", description: "", tag: "milestone", sort_order: (timeline.length + 1) * 10 });
    setEditing("new");
  };
  const startEdit = (t) => {
    setForm({ date_label: t.date_label, title: t.title, description: t.description, tag: t.tag, sort_order: t.sort_order });
    setEditing(t.id);
  };

  const saveItem = async () => {
    if (!form.date_label.trim() || !form.title.trim()) { showToast("Date and title required.", "error"); return; }
    setSaving(true);
    try {
      if (editing === "new") {
        await api("create", "timeline_entries", form);
      } else {
        await api("update", "timeline_entries", form, editing);
      }
      setEditing(null);
      showToast("Timeline updated.", "success");
      reload();
    } catch (err) { showToast(err.message, "error"); }
    setSaving(false);
  };

  const deleteItem = async (id) => {
    try {
      await api("delete", "timeline_entries", {}, id);
      showToast("Entry removed.", "success");
      reload();
    } catch (err) { showToast(err.message, "error"); }
  };

  if (editing) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>{editing === "new" ? "New Entry" : "Edit Entry"}</h3>
        <div className="form-group">
          <label>Date Label (e.g. &quot;Apr 2026&quot;)</label>
          <input className="form-input" value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Title</label>
          <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Tag</label>
            <select className="form-input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
              <option value="season">Season</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Sort Order</label>
            <input className="form-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={saveItem} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  const sorted = [...timeline].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <button className="btn btn-primary btn-sm" style={{ marginBottom: 16 }} onClick={startNew}>+ New Entry</button>
      {sorted.map((t) => (
        <div key={t.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <span style={{ fontFamily: "var(--mono-font)", fontSize: 12, color: "var(--accent)" }}>{t.date_label}</span>
            <h3 style={{ fontSize: 15, marginTop: 2 }}>{t.title} <TagBadge tag={t.tag} /></h3>
            <p style={{ marginTop: 4 }}>{t.description}</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-outline btn-sm" onClick={() => startEdit(t)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => deleteItem(t.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Admin: Server Info ── */
function AdminServerInfo({ serverInfo, api, reload, showToast }) {
  const [form, setForm] = useState({ ...serverInfo });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api("update", "server_info", {
        version: form.version,
        modpack: form.modpack,
        status: form.status,
        season: form.season,
        last_wipe: form.last_wipe,
      }, 1);
      showToast("Server info updated.", "success");
      reload();
    } catch (err) { showToast(err.message, "error"); }
    setSaving(false);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Server Info (shown in header bar)</h3>
      {[
        ["version", "Version"],
        ["modpack", "Modpack"],
        ["status", "Status"],
        ["season", "Season"],
        ["last_wipe", "Last Wipe"],
      ].map(([k, label]) => (
        <div className="form-group" key={k}>
          <label>{label}</label>
          <input className="form-input" value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        </div>
      ))}
      <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
    </div>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */
export default function JDGamesApp() {
  const [page, setPage] = useState("home");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Public data — fetched client-side with anon key
  const [announcements, setAnnouncements] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [serverInfo, setServerInfo] = useState({
    version: "", modpack: "", status: "", season: "", last_wipe: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const changePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load all public data
  const loadPublicData = useCallback(async () => {
    try {
      const [annRes, tlRes, siRes] = await Promise.all([
        supabase.from("announcements").select("*").order("date", { ascending: false }),
        supabase.from("timeline_entries").select("*").order("sort_order", { ascending: true }),
        supabase.from("server_info").select("*").eq("id", 1).single(),
      ]);
      if (annRes.data) setAnnouncements(annRes.data);
      if (tlRes.data) setTimeline(tlRes.data);
      if (siRes.data) setServerInfo(siRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPublicData(); }, [loadPublicData]);

  if (loading) {
    return (
      <div className="loading-screen">
        Loading<span className="loader-dot">...</span>
      </div>
    );
  }

  return (
    <>
      <div className="pixel-grid" />
      <div className="app-wrap">
        <Nav page={page} setPage={changePage} />
        <ServerBar info={serverInfo} />

        {page === "home" && <HomePage announcements={announcements} setPage={changePage} />}
        {page === "timeline" && <TimelinePage timeline={timeline} />}
        {page === "rules" && <RulesPage />}
        {page === "whitelist" && <WhitelistPage showToast={showToast} />}
        {page === "admin" && (
          <AdminPage
            announcements={announcements}
            timeline={timeline}
            serverInfo={serverInfo}
            reload={loadPublicData}
            showToast={showToast}
          />
        )}

        <footer className="site-footer">
          <span>JD GAMES</span> — A private Minecraft community<br />
          <span style={{ fontFamily: "var(--body-font)", fontSize: 11, marginTop: 8, display: "inline-block" }}>
            © {new Date().getFullYear()} JD Games. Not affiliated with Mojang or Microsoft.
          </span>
        </footer>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
