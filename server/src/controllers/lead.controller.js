import Lead from "../models/Lead.js";

export async function createLead(req, res) {
  const { name, email, message, source } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const lead = await Lead.create({
    name,
    email: email.toLowerCase(),
    message: message || "",
    source: source || "website",
    status: "new"
  });

  res.status(201).json(lead);
}

export async function listLeads(req, res) {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const leads = await Lead.find(filter).sort({ createdAt: -1 });
  res.json(leads);
}

export async function updateStatus(req, res) {
  const { status } = req.body;
  if (!["new", "contacted", "converted"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(lead);
}

export async function addNote(req, res) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Note text required" });

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  lead.notes.unshift({ text });
  await lead.save();

  res.json(lead);
}
