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
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cls}`}
    >
      {status}
    </span>
  );
}

function StatCard({ title, value, hint, tone = "blue" }) {
  const tones = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    dark: "from-slate-800 to-slate-900"
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div
        className={`h-24 bg-gradient-to-r ${tones[tone]} px-5 py-4 text-white`}
      >
        <div className="text-xs/5 font-semibold opacity-90">{title}</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight">
          {value}
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="text-xs text-slate-500">{hint}</div>
      </div>
    </div>
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

  return (
    // FULL SCREEN, edge-to-edge
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-80 bg-[#111827] text-slate-200 md:flex md:flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            <img
              src="/contactflow.png"
              alt="ContactFlow"
              className="h-10 w-10 rounded-xl bg-white"
            />
            <div>
              <div className="text-sm font-extrabold tracking-wide">
                {APP_NAME}
              </div>
              <div className="text-xs text-slate-400">Mini CRM Dashboard</div>
            </div>
          </div>

          <div className="px-6">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-slate-300">Profile</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10" />
                <div>
                  <div className="text-sm font-semibold">Admin</div>
                  <div className="text-xs text-slate-400">{email}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 px-4">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Dashboard
            </div>

            <div className="mt-3 space-y-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition
                    ${
                      statusFilter === s
                        ? "bg-white/10 ring-1 ring-white/10"
                        : "hover:bg-white/5"
                    }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pages
            </div>

            <div className="mt-3 space-y-2">
              <div className="w-full rounded-xl px-4 py-3 text-sm text-slate-400 bg-white/5">
                Settings (demo)
              </div>
              <div className="w-full rounded-xl px-4 py-3 text-sm text-slate-400 bg-white/5">
                Reports (demo)
              </div>
            </div>
          </div>

          <div className="mt-auto px-6 py-6">
            {token ? (
              <button
                onClick={handleLogout}
                className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20"
              >
                Logout
              </button>
            ) : (
              <div className="text-xs text-slate-400">Admin only</div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
            <div className="md:hidden flex items-center gap-3">
              <img
                src="/contactflow.png"
                alt="ContactFlow"
                className="h-9 w-9 rounded-xl bg-white"
              />
              <div className="font-extrabold">{APP_NAME}</div>
            </div>

            <div className="hidden md:block">
              <div className="text-xs text-slate-500">Dashboard / CRM</div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                Leads Overview
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                className="w-72 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="Search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={!token}
              />
              <div className="h-9 w-9 rounded-xl bg-slate-100" />
              <div className="h-9 w-9 rounded-xl bg-slate-100" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            {!token ? (
              <div className="mx-auto max-w-md rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {APP_NAME} Login
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Login to manage website inquiries.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Email
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Password
                    </label>
                    <input
                      type="password"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                  <StatCard
                    title="Total Leads"
                    value={stats.total}
                    hint="All leads collected from your website."
                    tone="blue"
                  />
                  <StatCard
                    title="Contacted"
                    value={stats.nContacted}
                    hint="Leads you reached out to."
                    tone="green"
                  />
                  <StatCard
                    title="Converted"
                    value={stats.nConverted}
                    hint="Leads that became customers."
                    tone="dark"
                  />
                </div>

                {/* Leads section */}
                <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        Leads
                      </div>
                      <div className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold">
                          {filteredLeads.length}
                        </span>{" "}
                        results
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            statusFilter === s
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-extrabold text-slate-900">
                              {lead.name}
                            </div>
                            <div className="truncate text-sm text-slate-500">
                              {lead.email}
                            </div>
                          </div>
                          <StatusBadge status={lead.status} />
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                          <div className="text-xs font-bold text-slate-500">
                            Message
                          </div>
                          <div className="mt-2 text-sm text-slate-700">
                            {lead.message || "-"}
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs font-bold text-slate-500 mb-2">
                            Status
                          </div>
                          <select
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            value={lead.status}
                            onChange={(e) =>
                              handleChangeStatus(lead._id, e.target.value)
                            }
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="converted">converted</option>
                          </select>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs font-bold text-slate-500 mb-2">
                            Notes
                          </div>
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
                                  className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100"
                                >
                                  {n.text}
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-slate-500">
                                No notes yet
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ))}

                    {filteredLeads.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                        No leads match your filters.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
