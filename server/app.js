import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  createMediaAsset,
  createMessage,
  deleteCertification,
  deleteExperience,
  deleteProject,
  deleteSkill,
  getAdminDashboard,
  getPortfolioData,
  initializeFirebaseStore,
  verifyAdminIdToken,
  addSkill,
  replaceContacts,
  saveCertification,
  saveExperience,
  saveProject,
  updateProfile,
} from "./firestoreStore.js";
import { getFirebaseBucket } from "./firebaseAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

let initializationPromise;
const appCache = new Map();

function ensureStoreInitialized() {
  if (!initializationPromise) {
    initializationPromise = initializeFirebaseStore();
  }

  return initializationPromise;
}

async function requireAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const admin = await verifyAdminIdToken(token);

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

function registerApiRoutes(app) {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/portfolio", async (_req, res, next) => {
    try {
      res.json(await getPortfolioData());
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/contact", async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !subject || !message) {
        res.status(400).json({ message: "All fields are required." });
        return;
      }

      const created = await createMessage({ name, email, subject, message });
      res.status(201).json({
        message: "Message saved successfully.",
        entry: created,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/dashboard", requireAdmin, async (_req, res, next) => {
    try {
      res.json(await getAdminDashboard());
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/profile", requireAdmin, async (req, res, next) => {
    try {
      res.json(await updateProfile(req.body || {}));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/assets", requireAdmin, async (req, res, next) => {
    try {
      const { kind, fileName, dataUrl, width, height } = req.body || {};
      const normalizedKind = String(kind || "general").trim() || "general";
      const baseName = String(fileName || "upload").trim() || "upload";
      const match = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl || ""));

      if (!match) {
        res.status(400).json({ message: "A valid base64 image payload is required." });
        return;
      }

      const mimeType = match[1];
      const extensionMap = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
      };
      const extension = extensionMap[mimeType] || path.extname(baseName) || ".jpg";
      const safeKind = normalizedKind.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
      const fileStem = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      const storagePath = path.posix.join(safeKind, `${fileStem}${extension}`);
      const buffer = Buffer.from(match[2], "base64");
      const downloadToken = crypto.randomUUID();
      const bucket = getFirebaseBucket();
      const file = bucket.file(storagePath);

      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
        resumable: false,
      });

      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });

      const asset = await createMediaAsset({
        kind: safeKind,
        fileName: baseName,
        storagePath,
        publicUrl: signedUrl,
        mimeType,
        sizeBytes: buffer.byteLength,
        width,
        height,
      });

      res.status(201).json(asset);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/experiences", requireAdmin, async (req, res, next) => {
    try {
      const { title, organization, period, description } = req.body || {};
      if (!title || !organization || !period || !description) {
        res.status(400).json({ message: "Title, organization, period, and description are required." });
        return;
      }

      res.status(201).json(await saveExperience(req.body || {}));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/experiences/:id", requireAdmin, async (req, res, next) => {
    try {
      res.json(await saveExperience({ ...req.body, id: req.params.id }));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/experiences/:id", requireAdmin, async (req, res, next) => {
    try {
      await deleteExperience(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/certifications", requireAdmin, async (req, res, next) => {
    try {
      const { title, issuer, period, description } = req.body || {};
      if (!title || !issuer || !period || !description) {
        res.status(400).json({ message: "Title, issuer, period, and description are required." });
        return;
      }

      res.status(201).json(await saveCertification(req.body || {}));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/certifications/:id", requireAdmin, async (req, res, next) => {
    try {
      res.json(await saveCertification({ ...req.body, id: req.params.id }));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/certifications/:id", requireAdmin, async (req, res, next) => {
    try {
      await deleteCertification(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/skills", requireAdmin, async (req, res, next) => {
    try {
      const { name, category, level } = req.body || {};
      if (!name || !category || !level) {
        res.status(400).json({ message: "Name, category, and level are required." });
        return;
      }

      res.status(201).json(await addSkill({ name, category, level }));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/contacts", requireAdmin, async (req, res, next) => {
    try {
      const contacts = Array.isArray(req.body) ? req.body : req.body?.contacts;
      if (!Array.isArray(contacts)) {
        res.status(400).json({ message: "A contacts array is required." });
        return;
      }

      res.json(await replaceContacts(contacts));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/skills/:id", requireAdmin, async (req, res, next) => {
    try {
      await deleteSkill(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/projects", requireAdmin, async (req, res, next) => {
    try {
      const { slug, title, summary } = req.body || {};
      if (!slug || !title || !summary) {
        res.status(400).json({ message: "Slug, title, and summary are required." });
        return;
      }

      res.status(201).json(await saveProject(req.body));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/projects/:id", requireAdmin, async (req, res, next) => {
    try {
      res.json(await saveProject({ ...req.body, id: req.params.id }));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/projects/:id", requireAdmin, async (req, res, next) => {
    try {
      await deleteProject(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
}

function registerStaticRoutes(app) {
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  if (!hasDist) {
    return;
  }

  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(distPath, "index.html"), (error) => {
      if (error) {
        next(error);
      }
    });
  });
}

export async function createApp({ serveStatic = false } = {}) {
  const cacheKey = serveStatic ? "static" : "api";
  if (appCache.has(cacheKey)) {
    return appCache.get(cacheKey);
  }

  await ensureStoreInitialized();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "20mb" }));

  registerApiRoutes(app);

  if (serveStatic) {
    registerStaticRoutes(app);
  }

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error." });
  });

  appCache.set(cacheKey, app);
  return app;
}
