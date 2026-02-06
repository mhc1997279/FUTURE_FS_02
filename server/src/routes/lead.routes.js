import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createLead,
  listLeads,
  updateStatus,
  addNote
} from "../controllers/lead.controller.js";

const router = Router();

// public: website contact form posts here
router.post("/", createLead);

// protected: admin dashboard uses these
router.get("/", requireAuth, listLeads);
router.patch("/:id/status", requireAuth, updateStatus);
router.post("/:id/notes", requireAuth, addNote);

export default router;
