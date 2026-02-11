import { useMemo, useState } from "react";
import { login, getLeads, updateStatus, addNote } from "./api";

const APP_NAME = "ContactFlow";
const STATUSES = ["all", "new", "contacted", "converted"];

function StatusBadge({ status }) {
  const cls =
    status === "new"
      ? "bg-blue-50 text-blue-700 ring-blue-100"
      : status === "contacted"
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-emerald-50 text-emerald-700 ring-emerald-100";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {status}
    </span>
  );
}

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

export default function App() {
  // Keep default admin email
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [leads, setLeads] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshLeads(activeToken = token) {
    const data = await getLeads(activeToken);
    setLeads(Array.isArray(data) ? data : []);
  }

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res?.token) throw new Error(res?.error || "Login failed");
      setToken(res.token);
      await refreshLeads(res.token);
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken("");
    setLeads([]);
    setStatusFilter("all");
    setSearch("");
    setError("");
  }

  async function handleChangeStatus(leadId, nextStatus) {
    setError("");
    try {
      const res = await updateStatus(leadId, nextStatus, token);
      if (res?.error) throw new Error(res.error);
      await refreshLeads();
    } catch (e) {
      setError(e.message || "Failed to update status");
    }
  }

  async function handleAddNote(leadId, text, clear) {
    const clean = text.trim();
    if (!clean) return;
    setError("");
    try {
      const res = await addNote(leadId, clean, token);
      if (res?.error) throw new Error(res.error);
      clear();
      await refreshLeads();
    } catch (e) {
      setError(e.message || "Failed to add note");
    }
  }

  const filteredLeads = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads
      .filter((l) => (statusFilter === "all" ? true : l.status === statusFilter))
      .filter((l) => {
        if (!s) return true;
        return (
          (l.name || "").toLowerCase().includes(s) ||
          (l.email || "").toLowerCase().includes(s) ||
          (l.message || "").toLowerCase().includes(s)
        );
      });
  }, [leads, statusFilter, search]);

  const stats = useMemo(() => {
    const total = leads.length;
    const nNew = leads.filter((l) => l.status === "new").length;
    const nContacted = leads.filter((l) => l.status === "contacted").length;
    const nConverted = leads.filter((l) => l.status === "converted").length;
    return { total, nNew, nContacted, nConverted };
  }, [leads]);

  /* ------------------------ LOGIN PAGE ONLY (no sidebar/topbar) ------------------------ */
  if (!token) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.10)] ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <img src="/contactflow.png" alt="ContactFlow" className="h-11 w-11 rounded-2xl bg-white" />
            <div>
              <div className="text-lg font-extrabold text-slate-900">{APP_NAME}</div>
              <div className="text-xs text-slate-500">Admin Login</div>
            </div>
          </div>

          <h2 className="mt-7 text-2xl font-extrabold text-slate-900">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage leads and inquiries.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center text-xs text-slate-500">
              Admin-only access • Secure token login
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------ DASHBOARD (sidebar + topbar) ------------------------ */
  return (
    <div className="min-h-screen bg-[#eef2ff]">
      {/* Full screen dashboard — no purple frame */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200 md:flex md:flex-col">
          <div className="flex items-center gap-3 px-7 py-7">
            <img src="/contactflow.png" alt="ContactFlow" className="h-10 w-10 rounded-2xl bg-white" />
            <div>
              <div className="text-sm font-extrabold text-slate-900">{APP_NAME}</div>
              <div className="text-xs text-slate-500">CRM Dashboard</div>
            </div>
          </div>

          <nav className="px-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Menu
            </div>

            <div className="mt-3 space-y-2">
              <button className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold bg-indigo-600 text-white shadow-sm">
                Overview
              </button>
              <button className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Reports
              </button>
              <button className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Contacts
              </button>
              <button className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Feedback
              </button>
            </div>

            <div className="mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Lead Filters
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    statusFilter === s
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </nav>

          <div className="mt-auto px-5 py-6">
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Topbar */}
          <div className="flex items-center justify-between gap-4 px-6 py-6">
            <div>
              <div className="text-xs text-slate-500">CRM / Overview</div>
              <div className="text-2xl font-extrabold text-slate-900">
                Lead Management
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                className="w-72 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="h-11 w-11 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
              <div className="h-11 w-11 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-10">
            {error && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            {/* Stats row */}
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard title="Total Leads" value={stats.total} hint="All website inquiries." />
              <StatCard title="New" value={stats.nNew} hint="Not contacted yet." />
              <StatCard title="Contacted" value={stats.nContacted} hint="Follow-up in progress." />
              <StatCard title="Converted" value={stats.nConverted} hint="Became customers." />
            </div>

            {/* Leads grid */}
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-extrabold text-slate-900">
                        {lead.name}
                      </div>
                      <div className="truncate text-sm text-slate-500">{lead.email}</div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <div className="text-xs font-bold text-slate-500">Message</div>
                    <div className="mt-2 text-sm text-slate-700">{lead.message || "-"}</div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-500 mb-2">Status</div>
                    <select
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      value={lead.status}
                      onChange={(e) => handleChangeStatus(lead._id, e.target.value)}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="converted">converted</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-500 mb-2">Notes</div>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Add note and press Enter..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = e.currentTarget.value;
                          handleAddNote(lead._id, value, () => {
                            e.currentTarget.value = "";
                          });
                        }
                      }}
                    />

                    <ul className="mt-3 max-h-28 overflow-auto space-y-2 pr-1">
                      {lead.notes?.length ? (
                        lead.notes.map((n, i) => (
                          <li
                            key={i}
                            className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100"
                          >
                            {n.text}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-500">No notes yet</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}

              {filteredLeads.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                  No leads match your filters.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
