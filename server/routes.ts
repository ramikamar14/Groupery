import express from "express";
import multer from "multer";
import { testSmtp } from "./email.js";
import { parseExcel } from "./excel.js";
import { parseMsgFile } from "./msg.js";
import { startSendJob, getJob } from "./jobs.js";
import type { SendJobRequest } from "../shared/types.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Test SMTP connection
router.post("/smtp/test", async (req, res) => {
  try {
    const result = await testSmtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Parse uploaded Excel file
router.post("/contacts/parse-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  try {
    const result = parseExcel(req.file.buffer);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// Parse uploaded .msg file
router.post("/email/parse-msg", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  try {
    const result = await parseMsgFile(req.file.buffer);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// Start a send job
router.post("/send", (req, res) => {
  try {
    const jobReq = req.body as SendJobRequest;
    if (!jobReq.smtp || !jobReq.contacts?.length || !jobReq.html) {
      res.status(400).json({ error: "Missing required fields: smtp, contacts, html" });
      return;
    }
    const jobId = startSendJob(jobReq);
    res.json({ jobId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Poll job status
router.get("/jobs/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

export { router };
