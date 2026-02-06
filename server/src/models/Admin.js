import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Admin", AdminSchema);
