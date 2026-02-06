import { useState } from "react";
import { login, getLeads, updateStatus, addNote } from "./api";

function App() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("change_me_please");
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState([]);

  async function handleLogin() {
    const res = await login(email, password);
    setToken(res.token);

    const data = await getLeads(res.token);
    setLeads(data);
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Mini CRM Dashboard</h2>

      {!token && (
        <>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleLogin}>Login</button>
        </>
      )}

      {token && (
        <>
          <h3>Leads</h3>

          {leads.map((lead) => (
            <div
              key={lead._id}
              style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
            >
              <strong>{lead.name}</strong> ({lead.email})
              <br />
              Message: {lead.message}
              <br />
              Status:
              <select
                value={lead.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  await updateStatus(lead._id, newStatus, token);
                  const data = await getLeads(token);
                  setLeads(data);
                }}
              >
                <option value="new">new</option>
                <option value="contacted">contacted</option>
                <option value="converted">converted</option>
              </select>

              {/* NOTES INPUT */}
              <input
                placeholder="Add note and press Enter"
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await addNote(lead._id, e.target.value, token);
                    e.target.value = "";
                    const data = await getLeads(token);
                    setLeads(data);
                  }
                }}
              />

              <ul>
                {lead.notes?.map((note, i) => (
                  <li key={i}>{note.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
