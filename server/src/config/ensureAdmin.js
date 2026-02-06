import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email: email.toLowerCase(), passwordHash });

  console.log("✅ Admin created:", email);
}
