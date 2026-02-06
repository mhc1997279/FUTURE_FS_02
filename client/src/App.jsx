import { useMemo, useState } from "react";
import { login, getLeads, updateStatus, addNote } from "./api";


const APP_NAME = "ContactFlow";
const STATUSES = ["all", "new", "contacted", "converted"];

function StatusPill({ status }) {
  const styles = {
    new: "bg-slate-700/60 text-slate-200",
    contacted: "bg-amber-500/15 text-amber-300",
    converted: "bg-emerald-500/15 text-emerald-300"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || ""}`}>
      {status}
    </span>
  );
}

export default function App() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function refreshLeads(t = token) {
    const data = await getLeads(t);
    setLeads(Array.isArray(data) ? data : []);
  }

  async function handleLogin() {
    setError("");
    try {
      const res = await login(email, password);
      if (!res?.token) throw new Error("Login failed");
      setToken(res.token);
      await refreshLeads(res.token);
    } catch {
      setError("Invalid credentials");
    }
  }

  function handleLogout() {
    setToken("");
    setLeads([]);
    setStatusFilter("all");
    setSearch("");
    setError("");
  }

  async function handleAddNote(id, text, clear) {
    const clean = text.trim();
    if (!clean) return;
    await addNote(id, clean, token);
    clear();
    refreshLeads();
  }

  const filteredLeads = useMemo(() => {
    return leads
      .filter((l) => statusFilter === "all" || l.status === statusFilter)
      .filter((l) => {
        const s = search.toLowerCase().trim();
        if (!s) return true;
        return `${l.name || ""} ${l.email || ""} ${l.message || ""}`.toLowerCase().includes(s);
      });
  }, [leads, statusFilter, search]);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(700px_circle_at_80%_20%,rgba(99,102,241,0.20),transparent_55%)]" />

      {/* Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-72 border-r border-white/10 bg-black/35 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-3 px-6 py-5">
            <img src="/contactflow.png" alt="ContactFlow" className="h-10 w-10 rounded-xl" />
            <div>
              <div className="text-lg font-bold">{APP_NAME}</div>
              <div className="text-xs text-slate-400">Mini CRM Dashboard</div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-300">
              Tip: Add a few leads so your dashboard looks full for screenshots.
            </div>
          </div>

          <nav className="mt-2 px-4">
            <div className="text-xs font-semibold text-slate-400 px-3 mb-2">Views</div>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`w-full text-left rounded-xl px-3 py-2 text-sm font-semibold transition mb-2
                  ${
                    statusFilter === s
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                      : "bg-white/5 hover:bg-white/10 text-slate-200"
                  }`}
              >
                {s}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-4 py-4">
            {token ? (
              <button
                onClick={handleLogout}
                className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
              >
                Logout
              </button>
            ) : (
              <div className="text-xs text-slate-400 px-3">Admin only</div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar (mobile + main header) */}
          <header className="border-b border-white/10 bg-black/30 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 md:hidden">
                <img src="/contactflow.png" alt="ContactFlow" className="h-9 w-9 rounded-xl" />
                <div>
                  <div className="font-bold">{APP_NAME}</div>
                  <div className="text-xs text-slate-400">Mini CRM</div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="text-sm text-slate-400">Lead Pipeline</div>
                <div className="text-lg font-bold">
                  {statusFilter === "all" ? "All Leads" : `${statusFilter} Leads`}
                </div>
              </div>

              {token && (
                <input
                  className="w-60 rounded-xl bg-black/40 px-4 py-2 text-sm outline-none border border-white/10 focus:border-blue-500"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8">
            {/* Login */}
            {!token ? (
              <div className="mx-auto max-w-md rounded-2xl bg-white/5 p-8 shadow-xl border border-white/10">
                <h2 className="text-xl font-bold mb-1">Admin Login</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Sign in to manage website inquiries in {APP_NAME}.
                </p>

                <label className="text-xs font-semibold text-slate-400">Email</label>
                <input
                  className="mt-2 mb-4 w-full rounded-xl bg-black/40 px-4 py-3 outline-none border border-white/10 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label className="text-xs font-semibold text-slate-400">Password</label>
                <input
                  type="password"
                  className="mt-2 mb-5 w-full rounded-xl bg-black/40 px-4 py-3 outline-none border border-white/10 focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  onClick={handleLogin}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold shadow hover:opacity-95"
                >
                  Login
                </button>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              </div>
            ) : (
              <>
                {/* Error */}
                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {/* Mobile filters (since sidebar is hidden on small) */}
                <div className="mb-5 flex flex-wrap gap-2 md:hidden">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold
                        ${
                          statusFilter === s
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "bg-white/10 hover:bg-white/15"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Leads grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="rounded-2xl bg-white/5 p-5 shadow-lg border border-white/10 hover:bg-white/10 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-lg font-bold">{lead.name}</div>
                          <div className="truncate text-sm text-slate-400">{lead.email}</div>
                        </div>
                        <StatusPill status={lead.status} />
                      </div>

                      <div className="mt-4 rounded-xl bg-black/30 p-4 border border-white/5">
                        <div className="text-xs font-semibold text-slate-400">Message</div>
                        <div className="mt-2 text-sm text-slate-200">{lead.message || "-"}</div>
                      </div>

                      <select
                        className="mt-4 w-full rounded-xl bg-black/40 px-3 py-2 text-sm border border-white/10 focus:border-blue-500"
                        value={lead.status}
                        onChange={(e) =>
                          updateStatus(lead._id, e.target.value, token).then(() => refreshLeads())
                        }
                      >
                        <option value="new">new</option>
                        <option value="contacted">contacted</option>
                        <option value="converted">converted</option>
                      </select>

                      <input
                        className="mt-4 w-full rounded-xl bg-black/40 px-3 py-2 text-sm border border-white/10 focus:border-blue-500"
                        placeholder="Add note and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = e.currentTarget.value;
                            handleAddNote(lead._id, val, () => (e.currentTarget.value = ""));
                          }
                        }}
                      />

                      <ul className="mt-3 max-h-28 overflow-auto space-y-2 pr-1 text-sm">
                        {lead.notes?.length ? (
                          lead.notes.map((n, i) => (
                            <li key={i} className="rounded-xl bg-black/40 px-3 py-2 border border-white/5">
                              {n.text}
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">No notes yet</li>
                        )}
                      </ul>
                    </div>
                  ))}

                  {filteredLeads.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-400 md:col-span-2 lg:col-span-3">
                      No leads found.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
