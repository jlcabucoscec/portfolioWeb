import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "portfolio.sqlite");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const adminEmail = "admin@email.com";
const adminPassword = "admin123";

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`).run();
  }
}

function normalizeJsonArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      tagline TEXT NOT NULL,
      summary TEXT NOT NULL,
      location TEXT NOT NULL,
      availability TEXT NOT NULL,
      focus_title TEXT NOT NULL,
      focus_summary TEXT NOT NULL,
      years_of_craft INTEGER NOT NULL,
      projects_shipped INTEGER NOT NULL,
      profile_image_url TEXT NOT NULL DEFAULT '',
      profile_image_alt TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      organization TEXT NOT NULL,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      emphasis TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      technologies TEXT NOT NULL,
      role TEXT NOT NULL,
      category TEXT NOT NULL,
      year_label TEXT NOT NULL,
      metric_label TEXT NOT NULL,
      metric_value TEXT NOT NULL,
      link_label TEXT,
      link_url TEXT,
      thumbnail_url TEXT NOT NULL DEFAULT '',
      use_thumbnail INTEGER NOT NULL DEFAULT 0,
      screenshots TEXT NOT NULL DEFAULT '[]',
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      icon TEXT NOT NULL,
      url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      file_name TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      width INTEGER NOT NULL DEFAULT 0,
      height INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL
    );
  `);
}

function ensureSchema() {
  ensureColumn("profile", "profile_image_url", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("profile", "profile_image_alt", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("projects", "thumbnail_url", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("projects", "use_thumbnail", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("projects", "screenshots", "TEXT NOT NULL DEFAULT '[]'");
}

function seedProfile() {
  const exists = db.prepare("SELECT id FROM profile WHERE id = 1").get();
  if (exists) {
    return;
  }

  db.prepare(`
    INSERT INTO profile (
      id, name, title, tagline, summary, location, availability,
      focus_title, focus_summary, years_of_craft, projects_shipped,
      profile_image_url, profile_image_alt
    )
    VALUES (
      1, @name, @title, @tagline, @summary, @location, @availability,
      @focusTitle, @focusSummary, @yearsOfCraft, @projectsShipped,
      @profileImageUrl, @profileImageAlt
    )
  `).run({
    name: "JLPortfolioDev",
    title: "IT Instructor • Full-Stack Developer",
    tagline: "Teaching practical software engineering while building systems that solve real institutional problems.",
    summary:
      "A passionate Information Technology instructor specializing in front-end development, programming fundamentals, and system development. Dedicated to helping students build practical technical skills through hands-on projects and real-world applications.",
    location: "Cebu City, Philippines",
    availability: "Available for collaboration, curriculum work, and system development projects.",
    focusTitle: "Academic systems, frontend development, and operational tooling.",
    focusSummary:
      "Experienced in building classroom management platforms, online proctoring tools, attendance systems, and automation workflows using modern web technologies, Node.js, Google Apps Script, and SQLite-backed applications.",
    yearsOfCraft: 5,
    projectsShipped: 4,
    profileImageUrl: "",
    profileImageAlt: "",
  });
}

function seedList(tableName, rows) {
  const count = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
  if (count > 0) {
    return;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map((column) => `@${column}`).join(", ");
  const statement = db.prepare(
    `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`,
  );

  const insertMany = db.transaction((items) => {
    items.forEach((item) => statement.run(item));
  });

  insertMany(rows);
}

function seedAdmin() {
  const existingUsers = db.prepare("SELECT id FROM admin_users ORDER BY id").all();
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  if (existingUsers.length) {
    db.prepare(
      "UPDATE admin_users SET email = ?, password_hash = ?, display_name = ? WHERE id = ?",
    ).run(adminEmail, passwordHash, "Portfolio Admin", existingUsers[0].id);

    if (existingUsers.length > 1) {
      db.prepare("DELETE FROM admin_users WHERE id <> ?").run(existingUsers[0].id);
    }

    return;
  }

  db.prepare(
    "INSERT INTO admin_users (email, password_hash, display_name) VALUES (?, ?, ?)",
  ).run(adminEmail, passwordHash, "Portfolio Admin");
}

function refreshLegacyContacts() {
  const rows = db.prepare("SELECT id, label FROM contacts ORDER BY sort_order, id").all();
  const labels = rows.map((row) => row.label);
  const isLegacySet =
    rows.length === 3 &&
    labels.includes("Location") &&
    labels.includes("Availability") &&
    labels.includes("Project Demo");

  if (!isLegacySet) {
    return;
  }

  const statement = db.prepare(`
    UPDATE contacts
    SET label = @label, value = @value, icon = @icon, url = @url, sort_order = @sortOrder
    WHERE id = @id
  `);

  const nextContacts = [
    {
      id: rows[0].id,
      label: "Email",
      value: "your.email@example.com",
      icon: "mail",
      url: "mailto:your.email@example.com",
      sortOrder: 1,
    },
    {
      id: rows[1].id,
      label: "Contact Number",
      value: "+63 900 000 0000",
      icon: "call",
      url: "tel:+639000000000",
      sortOrder: 2,
    },
    {
      id: rows[2].id,
      label: "Work Address",
      value: "Cebu Eastern College, Cebu City, Philippines",
      icon: "location_on",
      url: "",
      sortOrder: 3,
    },
  ];

  const updateMany = db.transaction((items) => {
    items.forEach((item) => statement.run(item));
  });

  updateMany(nextContacts);
}

export function initializeDatabase() {
  createTables();
  ensureSchema();
  seedProfile();
  seedList("experiences", [
    {
      title: "IT Instructor",
      organization: "Cebu Eastern College, Inc.",
      period: "School Year 2025-2026",
      description:
        "Leads front-end development, programming fundamentals, and system development sessions with a strong focus on hands-on output and industry-relevant workflows.",
      emphasis: "Teaching and curriculum delivery",
      sort_order: 1,
    },
    {
      title: "BPO Employee",
      organization: "Customer / Technical / Chat Support",
      period: "During studies • 1 non-consecutive year",
      description:
        "Worked across customer, technical, and chat support functions, strengthening communication, troubleshooting, and service-oriented problem solving.",
      emphasis: "Support operations and technical communication",
      sort_order: 2,
    },
  ]);

  seedList("certifications", [
    {
      title: "In-Service Training and Teaching Seminars",
      issuer: "Cebu Eastern College, Inc.",
      period: "School Year 2025-2026",
      description: "Professional development focused on teaching practice, delivery, and classroom leadership.",
      sort_order: 1,
    },
    {
      title: "Leadership Training",
      issuer: "Cebu Eastern College, Inc.",
      period: "October 2023",
      description: "Leadership-focused training designed to support guidance, initiative, and team coordination.",
      sort_order: 2,
    },
    {
      title: "Data Analytics Training",
      issuer: "Cebu Eastern College, Inc.",
      period: "December 5, 2023",
      description: "Training centered on data handling, interpretation, and applied analytics workflows.",
      sort_order: 3,
    },
    {
      title: "PSITE ICT Congress",
      issuer: "Cebu Eastern College, Inc.",
      period: "April 2023 and March 2024",
      description: "ICT congress participation to stay aligned with current tools, practices, and academic technology trends.",
      sort_order: 4,
    },
  ]);

  seedList("skills", [
    { name: "Frontend Development", category: "Core", level: "Advanced", sort_order: 1 },
    { name: "Programming Fundamentals", category: "Core", level: "Advanced", sort_order: 2 },
    { name: "System Development", category: "Core", level: "Advanced", sort_order: 3 },
    { name: "React", category: "Web", level: "Advanced", sort_order: 4 },
    { name: "Node.js", category: "Web", level: "Advanced", sort_order: 5 },
    { name: "JavaScript", category: "Web", level: "Advanced", sort_order: 6 },
    { name: "HTML & CSS", category: "Web", level: "Advanced", sort_order: 7 },
    { name: "SQLite", category: "Data", level: "Intermediate", sort_order: 8 },
    { name: "Google Apps Script", category: "Automation", level: "Advanced", sort_order: 9 },
    { name: "Google Sheets Integration", category: "Automation", level: "Advanced", sort_order: 10 },
  ]);

  seedList("projects", [
    {
      slug: "class-schedule-management-attendance",
      title: "Class Schedule Management and Attendance Recording System",
      summary:
        "A Node.js-based academic operations system for schedule reminders, classroom coordination, and attendance recording.",
      description:
        "Designed to manage classroom activities, provide schedule reminders, and implement a more reliable attendance recording workflow for academic environments.",
      technologies: JSON.stringify(["Node.js", "JSON", "HTML", "CSS", "JavaScript"]),
      role: "Full-Stack Developer",
      category: "Education Systems",
      year_label: "2025",
      metric_label: "Stack",
      metric_value: "Node.js + JSON",
      link_label: "",
      link_url: "",
      thumbnail_url: "",
      use_thumbnail: 0,
      screenshots: JSON.stringify([]),
      featured: 1,
      sort_order: 1,
    },
    {
      slug: "anti-cheat-online-proctor",
      title: "Anti-Cheat Online Proctor Web Page System",
      summary:
        "A browser-based assessment monitoring experience that records responses and activity into Google Sheets.",
      description:
        "Built as an online proctoring tool for monitoring student activity during assessments while automating collection and review workflows through Google Apps Script and Google Sheets.",
      technologies: JSON.stringify(["HTML", "CSS", "JavaScript", "Google Apps Script", "Google Sheets"]),
      role: "Developer",
      category: "Assessment Tools",
      year_label: "2024",
      metric_label: "Public Demo",
      metric_value: "Online",
      link_label: "Open demo",
      link_url: "https://itcec.github.io/online",
      thumbnail_url: "",
      use_thumbnail: 0,
      screenshots: JSON.stringify([]),
      featured: 1,
      sort_order: 2,
    },
    {
      slug: "policy-violations-agreement-system",
      title: "IT Class Policies, Violations and Agreement System",
      summary:
        "A digital record platform for policies, agreements, and violation tracking that improves documentation transparency.",
      description:
        "Developed to centralize student agreements, class policies, and violation records into a clearer digital process for IT classes.",
      technologies: JSON.stringify(["HTML", "CSS", "JavaScript", "Google Apps Script", "Google Sheets"]),
      role: "Developer",
      category: "Academic Administration",
      year_label: "2024",
      metric_label: "Public Demo",
      metric_value: "Policy Site",
      link_label: "Open site",
      link_url: "https://itcec.github.io/policy",
      thumbnail_url: "",
      use_thumbnail: 0,
      screenshots: JSON.stringify([]),
      featured: 0,
      sort_order: 3,
    },
    {
      slug: "senior-citizen-information-system",
      title: "Senior Citizen Information System",
      summary:
        "A capstone web application for organizing resident records, reporting, and secure data management.",
      description:
        "Built as a web-based information management system for maintaining senior citizen records with user data management, reporting, and secure database storage.",
      technologies: JSON.stringify(["PHP", "SQLite", "HTML", "CSS", "JavaScript", "Python"]),
      role: "Lead Developer",
      category: "Community Systems",
      year_label: "Capstone",
      metric_label: "Database",
      metric_value: "SQLite",
      link_label: "",
      link_url: "",
      thumbnail_url: "",
      use_thumbnail: 0,
      screenshots: JSON.stringify([]),
      featured: 1,
      sort_order: 4,
    },
  ]);

  seedList("contacts", [
    {
      label: "Email",
      value: "your.email@example.com",
      icon: "mail",
      url: "mailto:your.email@example.com",
      sort_order: 1,
    },
    {
      label: "Contact Number",
      value: "+63 900 000 0000",
      icon: "call",
      url: "tel:+639000000000",
      sort_order: 2,
    },
    {
      label: "Work Address",
      value: "Cebu Eastern College, Cebu City, Philippines",
      icon: "location_on",
      url: "",
      sort_order: 3,
    },
  ]);
  refreshLegacyContacts();

  seedList("social_links", [
    {
      label: "Online Proctor",
      url: "https://itcec.github.io/online",
      sort_order: 1,
    },
    {
      label: "Policy System",
      url: "https://itcec.github.io/policy",
      sort_order: 2,
    },
  ]);

  seedAdmin();
}

function parseProject(row) {
  return {
    ...row,
    featured: Boolean(row.featured),
    technologies: normalizeJsonArray(row.technologies),
    linkLabel: row.link_label,
    linkUrl: row.link_url,
    yearLabel: row.year_label,
    metricLabel: row.metric_label,
    metricValue: row.metric_value,
    thumbnailUrl: row.thumbnail_url || "",
    useThumbnail: Boolean(row.use_thumbnail),
    screenshots: normalizeJsonArray(row.screenshots),
  };
}

function mapPortfolioProfile(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    tagline: row.tagline,
    summary: row.summary,
    location: row.location,
    availability: row.availability,
    focusTitle: row.focus_title,
    focusSummary: row.focus_summary,
    yearsOfCraft: row.years_of_craft,
    projectsShipped: row.projects_shipped,
    profileImageUrl: row.profile_image_url || "",
    profileImageAlt: row.profile_image_alt || "",
  };
}

function mapMediaAsset(row) {
  return {
    id: row.id,
    kind: row.kind,
    fileName: row.file_name,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  };
}

export function getPortfolioData() {
  const profileRow = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const experiences = db.prepare("SELECT * FROM experiences ORDER BY sort_order, id").all();
  const certifications = db.prepare("SELECT * FROM certifications ORDER BY sort_order, id").all();
  const skills = db.prepare("SELECT * FROM skills ORDER BY sort_order, id").all();
  const projects = db.prepare("SELECT * FROM projects ORDER BY sort_order, id").all().map(parseProject);
  const contacts = db.prepare("SELECT * FROM contacts ORDER BY sort_order, id").all();
  const socialLinks = db.prepare("SELECT * FROM social_links ORDER BY sort_order, id").all();

  return {
    profile: mapPortfolioProfile(profileRow),
    experiences,
    certifications,
    skills,
    projects,
    contacts,
    socialLinks,
  };
}

export function createMessage({ name, email, subject, message }) {
  const result = db
    .prepare(
      "INSERT INTO messages (name, email, subject, message) VALUES (@name, @email, @subject, @message)",
    )
    .run({ name, email, subject, message });

  return db.prepare("SELECT * FROM messages WHERE id = ?").get(result.lastInsertRowid);
}

function getAdminUserByEmail(email) {
  return db
    .prepare("SELECT id, email, password_hash, display_name FROM admin_users WHERE email = ?")
    .get(email);
}

function buildToken(user) {
  return Buffer.from(`${user.id}:${user.email}:${user.password_hash}`).toString("base64url");
}

export function authenticateAdmin(email, password) {
  const user = getAdminUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  return {
    token: buildToken(user),
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
    },
  };
}

export function getAdminFromToken(token) {
  if (!token) {
    return null;
  }

  const users = db.prepare("SELECT id, email, password_hash, display_name FROM admin_users").all();
  const matched = users.find((user) => buildToken(user) === token);
  if (!matched) {
    return null;
  }

  return {
    id: matched.id,
    email: matched.email,
    displayName: matched.display_name,
  };
}

export function getAdminDashboard() {
  const portfolio = getPortfolioData();
  const messages = db.prepare("SELECT * FROM messages ORDER BY datetime(created_at) DESC, id DESC").all();
  const mediaAssets = db
    .prepare("SELECT * FROM media_assets ORDER BY datetime(created_at) DESC, id DESC")
    .all()
    .map(mapMediaAsset);

  return {
    ...portfolio,
    messages,
    mediaAssets,
  };
}

export function updateProfile(updates) {
  const current = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const next = {
    ...current,
    name: updates.name ?? current.name,
    title: updates.title ?? current.title,
    tagline: updates.tagline ?? current.tagline,
    summary: updates.summary ?? current.summary,
    location: updates.location ?? current.location,
    availability: updates.availability ?? current.availability,
    focus_title: updates.focusTitle ?? current.focus_title,
    focus_summary: updates.focusSummary ?? current.focus_summary,
    years_of_craft: Number(updates.yearsOfCraft ?? current.years_of_craft),
    projects_shipped: Number(updates.projectsShipped ?? current.projects_shipped),
    profile_image_url: updates.profileImageUrl ?? current.profile_image_url,
    profile_image_alt: updates.profileImageAlt ?? current.profile_image_alt,
  };

  db.prepare(`
    UPDATE profile
    SET
      name = @name,
      title = @title,
      tagline = @tagline,
      summary = @summary,
      location = @location,
      availability = @availability,
      focus_title = @focus_title,
      focus_summary = @focus_summary,
      years_of_craft = @years_of_craft,
      projects_shipped = @projects_shipped,
      profile_image_url = @profile_image_url,
      profile_image_alt = @profile_image_alt
    WHERE id = 1
  `).run(next);

  return getPortfolioData().profile;
}

export function addSkill({ name, category, level }) {
  const max = db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM skills").get().maxOrder;
  const result = db
    .prepare(
      "INSERT INTO skills (name, category, level, sort_order) VALUES (@name, @category, @level, @sortOrder)",
    )
    .run({
      name,
      category,
      level,
      sortOrder: max + 1,
    });

  return db.prepare("SELECT * FROM skills WHERE id = ?").get(result.lastInsertRowid);
}

export function deleteSkill(id) {
  db.prepare("DELETE FROM skills WHERE id = ?").run(id);
}

function getNextSortOrder(tableName) {
  return db.prepare(`SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM ${tableName}`).get().maxOrder + 1;
}

export function saveExperience(experience) {
  const payload = {
    title: String(experience.title || "").trim(),
    organization: String(experience.organization || "").trim(),
    period: String(experience.period || "").trim(),
    description: String(experience.description || "").trim(),
    emphasis: String(experience.emphasis || "").trim(),
  };

  if (experience.id) {
    db.prepare(`
      UPDATE experiences
      SET
        title = @title,
        organization = @organization,
        period = @period,
        description = @description,
        emphasis = @emphasis
      WHERE id = @id
    `).run({
      ...payload,
      id: Number(experience.id),
    });

    return db.prepare("SELECT * FROM experiences WHERE id = ?").get(Number(experience.id));
  }

  const result = db.prepare(`
    INSERT INTO experiences (title, organization, period, description, emphasis, sort_order)
    VALUES (@title, @organization, @period, @description, @emphasis, @sort_order)
  `).run({
    ...payload,
    sort_order: getNextSortOrder("experiences"),
  });

  return db.prepare("SELECT * FROM experiences WHERE id = ?").get(result.lastInsertRowid);
}

export function deleteExperience(id) {
  db.prepare("DELETE FROM experiences WHERE id = ?").run(Number(id));
}

export function saveCertification(certification) {
  const payload = {
    title: String(certification.title || "").trim(),
    issuer: String(certification.issuer || "").trim(),
    period: String(certification.period || "").trim(),
    description: String(certification.description || "").trim(),
  };

  if (certification.id) {
    db.prepare(`
      UPDATE certifications
      SET
        title = @title,
        issuer = @issuer,
        period = @period,
        description = @description
      WHERE id = @id
    `).run({
      ...payload,
      id: Number(certification.id),
    });

    return db.prepare("SELECT * FROM certifications WHERE id = ?").get(Number(certification.id));
  }

  const result = db.prepare(`
    INSERT INTO certifications (title, issuer, period, description, sort_order)
    VALUES (@title, @issuer, @period, @description, @sort_order)
  `).run({
    ...payload,
    sort_order: getNextSortOrder("certifications"),
  });

  return db.prepare("SELECT * FROM certifications WHERE id = ?").get(result.lastInsertRowid);
}

export function deleteCertification(id) {
  db.prepare("DELETE FROM certifications WHERE id = ?").run(Number(id));
}

export function replaceContacts(items) {
  const sanitized = (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      label: String(item.label || "").trim(),
      value: String(item.value || "").trim(),
      icon: String(item.icon || "").trim() || "link",
      url: String(item.url || "").trim(),
      sort_order: index + 1,
    }))
    .filter((item) => item.label && item.value);

  const replaceAll = db.transaction((rows) => {
    db.prepare("DELETE FROM contacts").run();

    const statement = db.prepare(
      "INSERT INTO contacts (label, value, icon, url, sort_order) VALUES (@label, @value, @icon, @url, @sort_order)",
    );

    rows.forEach((row) => statement.run(row));
  });

  replaceAll(sanitized);

  return db.prepare("SELECT * FROM contacts ORDER BY sort_order, id").all();
}

export function saveProject(project) {
  const payload = {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.description,
    technologies: JSON.stringify(
      (Array.isArray(project.technologies) ? project.technologies : String(project.technologies).split(","))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
    role: project.role,
    category: project.category,
    year_label: project.yearLabel,
    metric_label: project.metricLabel,
    metric_value: project.metricValue,
    link_label: project.linkLabel || "",
    link_url: project.linkUrl || "",
    thumbnail_url: project.thumbnailUrl || "",
    use_thumbnail: project.useThumbnail ? 1 : 0,
    screenshots: JSON.stringify(normalizeJsonArray(project.screenshots)),
    featured: project.featured ? 1 : 0,
  };

  if (project.id) {
    db.prepare(`
      UPDATE projects
      SET
        slug = @slug,
        title = @title,
        summary = @summary,
        description = @description,
        technologies = @technologies,
        role = @role,
        category = @category,
        year_label = @year_label,
        metric_label = @metric_label,
        metric_value = @metric_value,
        link_label = @link_label,
        link_url = @link_url,
        thumbnail_url = @thumbnail_url,
        use_thumbnail = @use_thumbnail,
        screenshots = @screenshots,
        featured = @featured
      WHERE id = @id
    `).run({
      ...payload,
      id: project.id,
    });

    return parseProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(project.id));
  }

  const max = db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM projects").get().maxOrder;
  const result = db
    .prepare(`
      INSERT INTO projects (
        slug, title, summary, description, technologies, role, category,
        year_label, metric_label, metric_value, link_label, link_url,
        thumbnail_url, use_thumbnail, screenshots, featured, sort_order
      )
      VALUES (
        @slug, @title, @summary, @description, @technologies, @role, @category,
        @year_label, @metric_label, @metric_value, @link_label, @link_url,
        @thumbnail_url, @use_thumbnail, @screenshots, @featured, @sort_order
      )
    `)
    .run({
      ...payload,
      sort_order: max + 1,
    });

  return parseProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(result.lastInsertRowid));
}

export function deleteProject(id) {
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
}

export function createMediaAsset(asset) {
  const result = db.prepare(`
    INSERT INTO media_assets (
      kind, file_name, storage_path, public_url, mime_type, size_bytes, width, height
    )
    VALUES (
      @kind, @file_name, @storage_path, @public_url, @mime_type, @size_bytes, @width, @height
    )
  `).run({
    kind: String(asset.kind || "general").trim(),
    file_name: String(asset.fileName || "").trim(),
    storage_path: String(asset.storagePath || "").trim(),
    public_url: String(asset.publicUrl || "").trim(),
    mime_type: String(asset.mimeType || "application/octet-stream").trim(),
    size_bytes: Number(asset.sizeBytes || 0),
    width: Number(asset.width || 0),
    height: Number(asset.height || 0),
  });

  return mapMediaAsset(
    db.prepare("SELECT * FROM media_assets WHERE id = ?").get(Number(result.lastInsertRowid)),
  );
}
