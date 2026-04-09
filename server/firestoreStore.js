import { initializeDatabase, getAdminDashboard as getLocalAdminDashboard } from "./db.js";
import { getFirebaseAuth, getFirebaseDb } from "./firebaseAdmin.js";

const DEFAULT_ADMIN_UID =
  process.env.FIREBASE_ADMIN_UID || "WXkn3EKkdJg4hWVr0prXN2YoGzg1";
const DEFAULT_ADMIN_ROLE = "admin";

function nowIso() {
  return new Date().toISOString();
}

function stripId(item) {
  if (!item || typeof item !== "object") {
    return item;
  }

  const { id, ...rest } = item;
  return rest;
}

async function listCollection(collectionName, field = "sort_order", direction = "asc") {
  const snapshot = await getFirebaseDb()
    .collection(collectionName)
    .orderBy(field, direction)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getNextSortOrder(collectionName) {
  const snapshot = await getFirebaseDb()
    .collection(collectionName)
    .orderBy("sort_order", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return 1;
  }

  return Number(snapshot.docs[0].data().sort_order || 0) + 1;
}

async function seedCollectionIfEmpty(collectionName, items, buildDocId) {
  const collection = getFirebaseDb().collection(collectionName);
  const existing = await collection.limit(1).get();
  if (!existing.empty || !items.length) {
    return;
  }

  const batch = getFirebaseDb().batch();
  items.forEach((item, index) => {
    const docRef = buildDocId
      ? collection.doc(buildDocId(item, index))
      : collection.doc();
    batch.set(docRef, stripId(item));
  });
  await batch.commit();
}

async function ensureProfileSeed(profile) {
  const ref = getFirebaseDb().doc("settings/profile");
  const snapshot = await ref.get();
  if (snapshot.exists) {
    return;
  }

  await ref.set({
    ...profile,
    updatedAt: nowIso(),
  });
}

async function ensureAdminDoc() {
  if (!DEFAULT_ADMIN_UID) {
    return;
  }

  const ref = getFirebaseDb().collection("admins").doc(DEFAULT_ADMIN_UID);
  const snapshot = await ref.get();
  if (snapshot.exists) {
    return;
  }

  let email = "";
  let displayName = "Portfolio Admin";

  try {
    const user = await getFirebaseAuth().getUser(DEFAULT_ADMIN_UID);
    email = user.email || "";
    displayName = user.displayName || displayName;
  } catch {
    email = process.env.FIREBASE_ADMIN_EMAIL || "";
  }

  await ref.set({
    email,
    displayName,
    role: DEFAULT_ADMIN_ROLE,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
}

export async function initializeFirebaseStore() {
  initializeDatabase();
  const local = getLocalAdminDashboard();

  await ensureProfileSeed(local.profile);
  await seedCollectionIfEmpty("experiences", local.experiences, (item) => `experience-${item.id}`);
  await seedCollectionIfEmpty(
    "certifications",
    local.certifications,
    (item) => `certification-${item.id}`,
  );
  await seedCollectionIfEmpty("skills", local.skills, (item) => `skill-${item.id}`);
  await seedCollectionIfEmpty("projects", local.projects, (item) => item.slug || `project-${item.id}`);
  await seedCollectionIfEmpty("contacts", local.contacts, (_item, index) => `contact-${index + 1}`);
  await seedCollectionIfEmpty(
    "socialLinks",
    local.socialLinks,
    (_item, index) => `social-${index + 1}`,
  );
  await seedCollectionIfEmpty("messages", local.messages || [], (item) => `message-${item.id}`);
  await seedCollectionIfEmpty("mediaAssets", local.mediaAssets || [], (item) => `asset-${item.id}`);
  await ensureAdminDoc();
}

export async function verifyAdminIdToken(idToken) {
  if (!idToken) {
    return null;
  }

  const decoded = await getFirebaseAuth().verifyIdToken(idToken);
  const ref = getFirebaseDb().collection("admins").doc(decoded.uid);
  const snapshot = await ref.get();
  const adminData = snapshot.exists ? snapshot.data() : null;

  const isDefaultAdmin = decoded.uid === DEFAULT_ADMIN_UID;
  const isAllowedAdmin =
    isDefaultAdmin ||
    (adminData && adminData.active !== false && adminData.role === DEFAULT_ADMIN_ROLE);

  if (!isAllowedAdmin) {
    return null;
  }

  return {
    uid: decoded.uid,
    email: decoded.email || adminData?.email || "",
    displayName: decoded.name || adminData?.displayName || "Portfolio Admin",
  };
}

export async function getPortfolioData() {
  const [
    profileSnapshot,
    experiences,
    certifications,
    skills,
    projects,
    contacts,
    socialLinks,
  ] = await Promise.all([
    getFirebaseDb().doc("settings/profile").get(),
    listCollection("experiences"),
    listCollection("certifications"),
    listCollection("skills"),
    listCollection("projects"),
    listCollection("contacts"),
    listCollection("socialLinks"),
  ]);

  return {
    profile: profileSnapshot.data() || {},
    experiences,
    certifications,
    skills,
    projects,
    contacts,
    socialLinks,
  };
}

export async function getAdminDashboard() {
  const [portfolio, messages, mediaAssets] = await Promise.all([
    getPortfolioData(),
    listCollection("messages", "created_at", "desc"),
    listCollection("mediaAssets", "createdAt", "desc"),
  ]);

  return {
    ...portfolio,
    messages,
    mediaAssets,
  };
}

export async function updateProfile(updates) {
  const ref = getFirebaseDb().doc("settings/profile");
  const current = (await ref.get()).data() || {};
  const next = {
    ...current,
    ...updates,
    yearsOfCraft: Number(updates.yearsOfCraft ?? current.yearsOfCraft ?? 0),
    projectsShipped: Number(updates.projectsShipped ?? current.projectsShipped ?? 0),
    updatedAt: nowIso(),
  };

  await ref.set(next, { merge: true });
  return next;
}

export async function addSkill({ name, category, level }) {
  const sort_order = await getNextSortOrder("skills");
  const ref = await getFirebaseDb().collection("skills").add({
    name,
    category,
    level,
    sort_order,
  });

  return {
    id: ref.id,
    name,
    category,
    level,
    sort_order,
  };
}

export async function deleteSkill(id) {
  await getFirebaseDb().collection("skills").doc(String(id)).delete();
}

export async function saveExperience(experience) {
  const payload = {
    title: String(experience.title || "").trim(),
    organization: String(experience.organization || "").trim(),
    period: String(experience.period || "").trim(),
    description: String(experience.description || "").trim(),
    emphasis: String(experience.emphasis || "").trim(),
  };

  if (experience.id) {
    const ref = getFirebaseDb().collection("experiences").doc(String(experience.id));
    const current = (await ref.get()).data() || {};
    const next = { ...current, ...payload };
    await ref.set(next, { merge: true });
    return { id: ref.id, ...next };
  }

  const sort_order = await getNextSortOrder("experiences");
  const ref = await getFirebaseDb().collection("experiences").add({
    ...payload,
    sort_order,
  });

  return { id: ref.id, ...payload, sort_order };
}

export async function deleteExperience(id) {
  await getFirebaseDb().collection("experiences").doc(String(id)).delete();
}

export async function saveCertification(certification) {
  const payload = {
    title: String(certification.title || "").trim(),
    issuer: String(certification.issuer || "").trim(),
    period: String(certification.period || "").trim(),
    description: String(certification.description || "").trim(),
  };

  if (certification.id) {
    const ref = getFirebaseDb().collection("certifications").doc(String(certification.id));
    const current = (await ref.get()).data() || {};
    const next = { ...current, ...payload };
    await ref.set(next, { merge: true });
    return { id: ref.id, ...next };
  }

  const sort_order = await getNextSortOrder("certifications");
  const ref = await getFirebaseDb().collection("certifications").add({
    ...payload,
    sort_order,
  });

  return { id: ref.id, ...payload, sort_order };
}

export async function deleteCertification(id) {
  await getFirebaseDb().collection("certifications").doc(String(id)).delete();
}

export async function replaceContacts(items) {
  const sanitized = (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      label: String(item.label || "").trim(),
      value: String(item.value || "").trim(),
      icon: String(item.icon || "").trim() || "link",
      url: String(item.url || "").trim(),
      sort_order: index + 1,
    }))
    .filter((item) => item.label && item.value);

  const existing = await getFirebaseDb().collection("contacts").get();
  const batch = getFirebaseDb().batch();
  existing.docs.forEach((doc) => batch.delete(doc.ref));

  sanitized.forEach((item, index) => {
    batch.set(getFirebaseDb().collection("contacts").doc(`contact-${index + 1}`), item);
  });

  await batch.commit();
  return listCollection("contacts");
}

export async function saveProject(project) {
  const payload = {
    slug: String(project.slug || "").trim(),
    title: String(project.title || "").trim(),
    summary: String(project.summary || "").trim(),
    description: String(project.description || "").trim(),
    technologies: Array.isArray(project.technologies)
      ? project.technologies.filter(Boolean)
      : String(project.technologies || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    role: String(project.role || "").trim(),
    category: String(project.category || "").trim(),
    yearLabel: String(project.yearLabel || "").trim(),
    metricLabel: String(project.metricLabel || "").trim(),
    metricValue: String(project.metricValue || "").trim(),
    linkLabel: String(project.linkLabel || "").trim(),
    linkUrl: String(project.linkUrl || "").trim(),
    thumbnailUrl: String(project.thumbnailUrl || "").trim(),
    useThumbnail: Boolean(project.useThumbnail),
    screenshots: Array.isArray(project.screenshots) ? project.screenshots.filter(Boolean) : [],
    featured: Boolean(project.featured),
  };

  if (project.id) {
    const ref = getFirebaseDb().collection("projects").doc(String(project.id));
    const current = (await ref.get()).data() || {};
    const next = { ...current, ...payload };
    await ref.set(next, { merge: true });
    return { id: ref.id, ...next };
  }

  const sort_order = await getNextSortOrder("projects");
  const ref = await getFirebaseDb().collection("projects").add({
    ...payload,
    sort_order,
  });

  return { id: ref.id, ...payload, sort_order };
}

export async function deleteProject(id) {
  await getFirebaseDb().collection("projects").doc(String(id)).delete();
}

export async function createMessage({ name, email, subject, message }) {
  const payload = {
    name,
    email,
    subject,
    message,
    created_at: nowIso(),
    read: false,
  };

  const ref = await getFirebaseDb().collection("messages").add(payload);
  return {
    id: ref.id,
    ...payload,
  };
}

export async function createMediaAsset(asset) {
  const payload = {
    kind: String(asset.kind || "general").trim(),
    fileName: String(asset.fileName || "").trim(),
    storagePath: String(asset.storagePath || "").trim(),
    publicUrl: String(asset.publicUrl || "").trim(),
    mimeType: String(asset.mimeType || "").trim(),
    sizeBytes: Number(asset.sizeBytes || 0),
    width: Number(asset.width || 0),
    height: Number(asset.height || 0),
    createdAt: nowIso(),
  };

  const ref = await getFirebaseDb().collection("mediaAssets").add(payload);
  return {
    id: ref.id,
    ...payload,
  };
}
