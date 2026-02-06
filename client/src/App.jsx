import { useMemo, useState } from "react";
import { login, getLeads, updateStatus, addNote } from "./api";

const STATUSES = ["all", "new", "contacted", "converted"];

function StatusPill({ status }) {
  const styles = {
    new: "bg-slate-100 text-slate-700 ring-slate-200",
    contacted: "bg-amber-50 text-amber-700 ring-amber-200",
    converted: "bg-emerald-50 text-emerald-700 ring-emerald-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        styles[status] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function App() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("change_me_please");

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
      setError(e.message || "Something went wrong");
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
    return leads
      .filter((l) => (statusFilter === "all" ? true : l.status === statusFilter))
      .filter((l) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          (l.name || "").toLowerCase().includes(s) ||
          (l.email || "").toLowerCase().includes(s) ||
          (l.message || "").toLowerCase().includes(s)
        );
      });
  }, [leads, statusFilter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600" />
            <div>
              <div className="text-base font-bold text-slate-900">Mini CRM</div>
              <div className="text-sm text-slate-500">
                Lead Management Dashboard
              </div>
            </div>
          </div>

          {token ? (
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Logout
            </button>
          ) : (
            <span className="text-sm text-slate-500">Admin only</span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Login */}
        {!token && (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Admin Login</h2>
            <p className="mt-1 text-sm text-slate-500">
              Login to view and manage website inquiries.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Email
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {token && (
          <>
            {/* Controls */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
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

                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-sm"
                  placeholder="Search name / email / message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Leads */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-bold text-slate-900">
                        {lead.name}
                      </div>
                      <div className="truncate text-sm text-slate-600">
                        {lead.email}
                      </div>
                    </div>

                    <StatusPill status={lead.status} />
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-bold text-slate-500">
                      Message
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {lead.message || "-"}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">
                      Status
                    </span>
                    <select
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                  <div className="mt-5">
                    <div className="text-xs font-bold text-slate-500">Notes</div>

                    <input
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                    <ul className="mt-4 space-y-2">
                      {lead.notes?.length ? (
                        lead.notes.map((n, i) => (
                          <li
                            key={i}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
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
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 md:col-span-2">
                  No leads match your filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
