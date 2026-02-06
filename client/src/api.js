const API_BASE = "http://localhost:5000";

export async function createLead(data) {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function getLeads(token) {
  const res = await fetch(`${API_BASE}/api/leads`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function updateStatus(id, status, token) {
  const res = await fetch(`http://localhost:5000/api/leads/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function addNote(id, text, token) {
  const res = await fetch(`http://localhost:5000/api/leads/${id}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });
  return res.json();
}
