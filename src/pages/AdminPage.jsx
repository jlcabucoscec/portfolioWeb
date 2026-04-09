import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminJSON, uploadAdminAsset } from "../api/client";
import ThemeToggle from "../components/ThemeToggle";
import { signOutAdmin } from "../lib/firebaseAuth";
import { compressImageFile } from "../utils/imageUpload";

const emptyProject = {
  id: null,
  slug: "",
  title: "",
  summary: "",
  description: "",
  technologies: "",
  role: "",
  category: "",
  yearLabel: "",
  metricLabel: "",
  metricValue: "",
  linkLabel: "",
  linkUrl: "",
  thumbnailUrl: "",
  useThumbnail: false,
  screenshots: [],
  featured: false,
};

const emptyExperience = {
  id: null,
  title: "",
  organization: "",
  period: "",
  description: "",
  emphasis: "",
};

const emptyCertification = {
  id: null,
  title: "",
  issuer: "",
  period: "",
  description: "",
};

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "experiences", label: "Experience" },
  { id: "training", label: "Training" },
  { id: "contacts", label: "Contact" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "messages", label: "Messages" },
];

function toProjectForm(project) {
  if (!project) {
    return emptyProject;
  }

  const screenshots = [...new Set([project.thumbnailUrl, ...(project.screenshots || [])].filter(Boolean))];

  return {
    ...project,
    technologies: project.technologies.join(", "),
    screenshots,
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminModal({ children, onClose, title }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="admin-modal-backdrop"
      role="dialog"
      onClick={onClose}
    >
      <div className="admin-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <p className="eyebrow">Editor</p>
            <h2>{title}</h2>
          </div>
          <button className="admin-toast-close" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [experienceForm, setExperienceForm] = useState(emptyExperience);
  const [certificationForm, setCertificationForm] = useState(emptyCertification);
  const [contactForms, setContactForms] = useState([]);
  const [skillForm, setSkillForm] = useState({ name: "", category: "Core", level: "Advanced" });
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [screenshotUrlInput, setScreenshotUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState("");
  const [uploadingAsset, setUploadingAsset] = useState("");
  const [error, setError] = useState("");

  function removeToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast(type, message) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  }

  function showSuccess(message) {
    pushToast("success", message);
  }

  function showError(message) {
    pushToast("error", message);
  }

  function openExperienceModal(entry = null) {
    setExperienceForm(entry ? { ...entry } : emptyExperience);
    setActiveModal("experience");
  }

  function openCertificationModal(entry = null) {
    setCertificationForm(entry ? { ...entry } : emptyCertification);
    setActiveModal("training");
  }

  function openProjectModal(entry = null) {
    setProjectForm(entry ? toProjectForm(entry) : emptyProject);
    setScreenshotUrlInput("");
    setActiveModal("project");
  }

  function closeModal() {
    setScreenshotUrlInput("");
    setActiveModal("");
  }

  async function loadDashboard(options = {}) {
    const { notify = false } = options;
    try {
      const response = await fetchAdminJSON("/api/admin/dashboard");
      setDashboard(response);
      setProfileForm(response.profile);
      setContactForms(response.contacts);
      setExperienceForm(emptyExperience);
      setCertificationForm(emptyCertification);
      setError("");
      if (notify) {
        showSuccess("Dashboard refreshed.");
      }
    } catch (loadError) {
      await signOutAdmin();
      setError(loadError.message);
      navigate("/login");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const sortedMessages = useMemo(() => dashboard?.messages || [], [dashboard]);

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const updated = await fetchAdminJSON("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      setDashboard((current) => ({ ...current, profile: updated }));
      showSuccess("Profile updated.");
    } catch (saveError) {
      showError(saveError.message);
    }
  }

  async function uploadImage(file, kind) {
    if (!file) {
      return null;
    }

    setUploadingAsset(kind);
    try {
      const compressed = await compressImageFile(file);
      return await uploadAdminAsset({
        kind,
        fileName: compressed.fileName,
        dataUrl: compressed.dataUrl,
        width: compressed.width,
        height: compressed.height,
      });
    } finally {
      setUploadingAsset("");
    }
  }

  async function handleProfileImageUpload(event) {
    const [file] = Array.from(event.target.files || []);
    if (!file) {
      return;
    }

    try {
      const asset = await uploadImage(file, "profile");
      if (!asset) {
        return;
      }

      setProfileForm((current) => ({
        ...current,
        profileImageUrl: asset.publicUrl,
        profileImageAlt: current.profileImageAlt || current.name,
      }));
      showSuccess("Profile image uploaded. Save profile to apply it.");
    } catch (uploadError) {
      showError(uploadError.message);
    } finally {
      event.target.value = "";
    }
  }

  async function handleProjectScreenshotUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      const uploaded = [];
      for (const file of files) {
        const asset = await uploadImage(file, "project");
        if (asset) {
          uploaded.push(asset.publicUrl);
        }
      }

      if (!uploaded.length) {
        return;
      }

      setProjectForm((current) => {
        const screenshots = [...current.screenshots, ...uploaded].filter(Boolean);
        const uniqueScreenshots = [...new Set(screenshots)];
        return {
          ...current,
          screenshots: uniqueScreenshots,
          thumbnailUrl: current.thumbnailUrl || uniqueScreenshots[0] || "",
          useThumbnail: current.useThumbnail || Boolean(uniqueScreenshots[0]),
        };
      });
      showSuccess("Project screenshots uploaded. Save project to keep them.");
    } catch (uploadError) {
      showError(uploadError.message);
    } finally {
      event.target.value = "";
    }
  }

  function addProjectScreenshotUrl(url) {
    const value = String(url || "").trim();
    if (!value) {
      return;
    }

    setProjectForm((current) => {
      const screenshots = [...new Set([...current.screenshots, value])];
      return {
        ...current,
        screenshots,
        thumbnailUrl: current.thumbnailUrl || screenshots[0] || "",
      };
    });
  }

  function removeProjectScreenshot(url) {
    setProjectForm((current) => {
      const screenshots = current.screenshots.filter((item) => item !== url);
      const isSelectedThumbnail = current.thumbnailUrl === url;
      return {
        ...current,
        screenshots,
        thumbnailUrl: isSelectedThumbnail ? screenshots[0] || "" : current.thumbnailUrl,
        useThumbnail: isSelectedThumbnail ? Boolean(screenshots[0]) : current.useThumbnail,
      };
    });
  }

  async function saveExperience(event) {
    event.preventDefault();

    try {
      const saved = await fetchAdminJSON(
        experienceForm.id
          ? `/api/admin/experiences/${experienceForm.id}`
          : "/api/admin/experiences",
        {
          method: experienceForm.id ? "PUT" : "POST",
          body: JSON.stringify(experienceForm),
        },
      );

      setDashboard((current) => {
        const existing = current.experiences.filter((entry) => entry.id !== saved.id);
        return {
          ...current,
          experiences: [...existing, saved].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
        };
      });
      setExperienceForm(emptyExperience);
      closeModal();
      showSuccess(experienceForm.id ? "Experience updated." : "Experience added.");
    } catch (saveError) {
      showError(saveError.message);
    }
  }

  async function removeExperience(id) {
    try {
      await fetchAdminJSON(`/api/admin/experiences/${id}`, {
        method: "DELETE",
      });
      setDashboard((current) => ({
        ...current,
        experiences: current.experiences.filter((entry) => entry.id !== id),
      }));
      if (experienceForm.id === id) {
        setExperienceForm(emptyExperience);
      }
      showSuccess("Experience removed.");
    } catch (saveError) {
      showError(saveError.message);
    }
  }

  async function saveCertification(event) {
    event.preventDefault();

    try {
      const saved = await fetchAdminJSON(
        certificationForm.id
          ? `/api/admin/certifications/${certificationForm.id}`
          : "/api/admin/certifications",
        {
          method: certificationForm.id ? "PUT" : "POST",
          body: JSON.stringify(certificationForm),
        },
      );

      setDashboard((current) => {
        const existing = current.certifications.filter((entry) => entry.id !== saved.id);
        return {
          ...current,
          certifications: [...existing, saved].sort(
            (a, b) => a.sort_order - b.sort_order || a.id - b.id,
          ),
        };
      });
      setCertificationForm(emptyCertification);
      closeModal();
      showSuccess(certificationForm.id ? "Training entry updated." : "Training entry added.");
    } catch (saveError) {
      showError(saveError.message);
    }
  }

  async function removeCertification(id) {
    try {
      await fetchAdminJSON(`/api/admin/certifications/${id}`, {
        method: "DELETE",
      });
      setDashboard((current) => ({
        ...current,
        certifications: current.certifications.filter((entry) => entry.id !== id),
      }));
      if (certificationForm.id === id) {
        setCertificationForm(emptyCertification);
      }
      showSuccess("Training entry removed.");
    } catch (saveError) {
      showError(saveError.message);
    }
  }

  async function addSkill(event) {
    event.preventDefault();
    try {
      const created = await fetchAdminJSON("/api/admin/skills", {
        method: "POST",
        body: JSON.stringify(skillForm),
      });
      setDashboard((current) => ({ ...current, skills: [...current.skills, created] }));
      setSkillForm({ name: "", category: "Core", level: "Advanced" });
      showSuccess("Skill added.");
    } catch (skillError) {
      showError(skillError.message);
    }
  }

  async function saveContacts(event) {
    event.preventDefault();
    try {
      const updated = await fetchAdminJSON("/api/admin/contacts", {
        method: "PUT",
        body: JSON.stringify(contactForms),
      });

      setDashboard((current) => ({ ...current, contacts: updated }));
      setContactForms(updated);
      showSuccess("Contact details updated.");
    } catch (contactError) {
      showError(contactError.message);
    }
  }

  async function removeSkill(id) {
    try {
      await fetchAdminJSON(`/api/admin/skills/${id}`, {
        method: "DELETE",
      });
      setDashboard((current) => ({
        ...current,
        skills: current.skills.filter((skill) => skill.id !== id),
      }));
      showSuccess("Skill removed.");
    } catch (skillError) {
      showError(skillError.message);
    }
  }

  async function saveProject(event) {
    event.preventDefault();
    const payload = {
      ...projectForm,
      slug: projectForm.slug || slugify(projectForm.title),
      screenshots: projectForm.screenshots,
    };

    try {
      const saved = await fetchAdminJSON(
        projectForm.id ? `/api/admin/projects/${projectForm.id}` : "/api/admin/projects",
        {
          method: projectForm.id ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setDashboard((current) => {
        const existing = current.projects.filter((project) => project.id !== saved.id);
        return {
          ...current,
          projects: [...existing, saved].sort((a, b) => a.id - b.id),
        };
      });
      setProjectForm(emptyProject);
      closeModal();
      showSuccess(projectForm.id ? "Project updated." : "Project created.");
    } catch (projectError) {
      showError(projectError.message);
    }
  }

  async function removeProject(id) {
    try {
      await fetchAdminJSON(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      setDashboard((current) => ({
        ...current,
        projects: current.projects.filter((project) => project.id !== id),
      }));
      if (projectForm.id === id) {
        setProjectForm(emptyProject);
      }
      showSuccess("Project removed.");
    } catch (projectError) {
      showError(projectError.message);
    }
  }

  async function logout() {
    await signOutAdmin();
    navigate("/login");
  }

  if (!dashboard || !profileForm) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow">Loading</p>
          <h1 className="section-heading">{error || "Preparing admin dashboard..."}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell container py-4">
      <div className="admin-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`admin-toast ${toast.type}`}>
            <div className="admin-toast-copy">
              <strong>{toast.type === "success" ? "Updated" : "Action failed"}</strong>
              <span>{toast.message}</span>
            </div>
            <button
              aria-label="Dismiss notification"
              className="admin-toast-close"
              onClick={() => removeToast(toast.id)}
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>

      <header className="admin-header admin-header-shell">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1 className="section-heading">Manage portfolio content in categorized tabs.</h1>
        </div>
        <div className="admin-toolbar">
          <div className="admin-toolbar-icon" aria-label="Theme switch">
            <ThemeToggle />
          </div>
          <button
            className="button-secondary gap-2 px-5 text-[10px] uppercase tracking-[0.18em]"
            onClick={() => loadDashboard({ notify: true })}
            type="button"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh
          </button>
          <button
            className="button-primary gap-2 px-5 text-[10px] uppercase tracking-[0.18em]"
            onClick={logout}
            type="button"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Logout
          </button>
        </div>
      </header>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-3">
          <aside className="content-panel admin-sidebar">
            <p className="eyebrow">Categories</p>
            <div className="admin-tab-list" role="tablist" aria-label="Admin sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`admin-tab-button${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>
        </div>

        <div className="col-12 col-lg-9">
          {activeTab === "profile" ? (
            <form className="content-panel" onSubmit={saveProfile}>
              <p className="eyebrow">Profile</p>
              <h2>Public identity</h2>

              <div className="row g-4">
                <div className="col-12">
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={profileForm.name}
                      onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Title</span>
                    <input
                      value={profileForm.title}
                      onChange={(event) => setProfileForm((current) => ({ ...current, title: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Location</span>
                    <input
                      value={profileForm.location}
                      onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Availability</span>
                    <input
                      value={profileForm.availability}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, availability: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Profile Image URL</span>
                    <input
                      placeholder="https://example.com/profile.jpg"
                      value={profileForm.profileImageUrl || ""}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, profileImageUrl: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Upload Profile Image</span>
                    <input
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      type="file"
                    />
                  </label>
                  <p className="section-copy mt-2 mb-0">
                    {uploadingAsset === "profile"
                      ? "Compressing and uploading profile image..."
                      : "Uploads are compressed first and stored with reusable asset metadata for future Firebase migration."}
                  </p>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Profile Image Alt Text</span>
                    <input
                      placeholder="Portrait of the portfolio owner"
                      value={profileForm.profileImageAlt || ""}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, profileImageAlt: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Tagline</span>
                    <textarea
                      rows="3"
                      value={profileForm.tagline}
                      onChange={(event) => setProfileForm((current) => ({ ...current, tagline: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Focus Title</span>
                    <input
                      value={profileForm.focusTitle || ""}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, focusTitle: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Focus Summary</span>
                    <textarea
                      rows="4"
                      value={profileForm.focusSummary || ""}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, focusSummary: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Years of Craft</span>
                    <input
                      min="0"
                      type="number"
                      value={profileForm.yearsOfCraft || 0}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, yearsOfCraft: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Projects Shipped</span>
                    <input
                      min="0"
                      type="number"
                      value={profileForm.projectsShipped || 0}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, projectsShipped: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label className="field">
                    <span>Summary</span>
                    <textarea
                      rows="6"
                      value={profileForm.summary}
                      onChange={(event) => setProfileForm((current) => ({ ...current, summary: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="col-12">
                  <div className="admin-image-preview">
                    {profileForm.profileImageUrl ? (
                      <img
                        alt={profileForm.profileImageAlt || profileForm.name}
                        src={profileForm.profileImageUrl}
                      />
                    ) : (
                      <div className="admin-image-fallback">
                        <span className="material-symbols-outlined">person</span>
                        <strong>No profile image selected</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="button-row">
                <button className="button-primary" type="submit">
                  Save Profile
                </button>
              </div>
            </form>
          ) : null}

          {activeTab === "experiences" ? (
            <section className="content-panel">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">Experience</p>
                  <h2>Manage job experience timeline</h2>
                  <p className="section-copy">
                    Add, revise, or remove the teaching and professional experience entries shown on
                    the About page.
                  </p>
                </div>
                <button className="button-primary" onClick={() => openExperienceModal()} type="button">
                  Add Experience
                </button>
              </div>

              <div className="admin-list">
                {dashboard.experiences.length ? (
                  dashboard.experiences.map((experience) => (
                    <article key={experience.id} className="admin-list-item admin-list-item-stack">
                      <div className="min-w-0">
                        <strong>{experience.title}</strong>
                        <span className="mt-2">
                          {experience.organization} | {experience.period}
                        </span>
                        <p className="section-copy mt-3 mb-0">{experience.description}</p>
                        {experience.emphasis ? (
                          <p className="eyebrow mt-4 !text-[10px] !tracking-[0.18em]">{experience.emphasis}</p>
                        ) : null}
                      </div>
                      <div className="button-row mt-0 w-full md:w-auto md:justify-end">
                        <button
                          className="button-secondary gap-2 px-4 text-[10px] uppercase tracking-[0.18em]"
                          onClick={() => openExperienceModal(experience)}
                          type="button"
                        >
                          
                          Edit
                        </button>
                        <button
                          className="button-secondary danger gap-2 px-4 text-[10px] uppercase tracking-[0.18em]"
                          onClick={() => removeExperience(experience.id)}
                          type="button"
                        >
                          
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="section-copy">No experience entries yet.</p>
                )}
              </div>
            </section>
          ) : null}

          {activeTab === "training" ? (
            <section className="content-panel">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">Training</p>
                  <h2>Manage training and certifications</h2>
                  <p className="section-copy">
                    Keep certifications, seminars, and professional development entries current from
                    one place.
                  </p>
                </div>
                <button className="button-primary" onClick={() => openCertificationModal()} type="button">
                  Add Training
                </button>
              </div>

              <div className="admin-list">
                {dashboard.certifications.length ? (
                  dashboard.certifications.map((certification) => (
                    <article key={certification.id} className="admin-list-item admin-list-item-stack">
                      <div className="min-w-0">
                        <strong>{certification.title}</strong>
                        <span className="mt-2">
                          {certification.issuer} | {certification.period}
                        </span>
                        <p className="section-copy mt-3 mb-0">{certification.description}</p>
                      </div>
                      <div className="button-row mt-0 w-full md:w-auto md:justify-end">
                        <button
                          className="button-secondary gap-2 px-4 text-[10px] uppercase tracking-[0.18em]"
                          onClick={() => openCertificationModal(certification)}
                          type="button"
                        >
                          
                          Edit
                        </button>
                        <button
                          className="button-secondary danger gap-2 px-4 text-[10px] uppercase tracking-[0.18em]"
                          onClick={() => removeCertification(certification.id)}
                          type="button"
                        >
                          
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="section-copy">No training or certification entries yet.</p>
                )}
              </div>
            </section>
          ) : null}

          {activeTab === "contacts" ? (
            <form className="content-panel" onSubmit={saveContacts}>
              <p className="eyebrow">Contact</p>
              <h2>Direct contact details</h2>
              <p className="section-copy">
                These values appear on the contact page in the direct note area and the contact cards.
              </p>

              <div className="row g-4 mt-1">
                {contactForms.map((contact, index) => (
                  <div key={`${contact.label}-${index}`} className="col-12">
                    <div className="admin-contact-card">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="field">
                            <span>Label</span>
                            <input
                              value={contact.label}
                              onChange={(event) =>
                                setContactForms((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, label: event.target.value } : item,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="col-12">
                          <label className="field">
                            <span>Value</span>
                            <input
                              value={contact.value}
                              onChange={(event) =>
                                setContactForms((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, value: event.target.value } : item,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="col-12">
                          <label className="field">
                            <span>Icon</span>
                            <input
                              value={contact.icon}
                              onChange={(event) =>
                                setContactForms((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, icon: event.target.value } : item,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="col-12">
                          <label className="field">
                            <span>URL</span>
                            <input
                              placeholder="mailto:, tel:, or map link"
                              value={contact.url || ""}
                              onChange={(event) =>
                                setContactForms((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, url: event.target.value } : item,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="button-row">
                <button className="button-primary" type="submit">
                  Save Contact Details
                </button>
              </div>
            </form>
          ) : null}

          {activeTab === "skills" ? (
            <section className="content-panel">
              <p className="eyebrow">Skills</p>
              <h2>Simple skill list</h2>

              <form className="admin-skills-form" onSubmit={addSkill}>
                <div>
                  <input
                    className="admin-inline-input"
                    placeholder="Skill name"
                    value={skillForm.name}
                    onChange={(event) => setSkillForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>
                <div>
                  <input
                    className="admin-inline-input"
                    placeholder="Category"
                    value={skillForm.category}
                    onChange={(event) => setSkillForm((current) => ({ ...current, category: event.target.value }))}
                  />
                </div>
                <div>
                  <select
                    className="admin-inline-input"
                    value={skillForm.level}
                    onChange={(event) => setSkillForm((current) => ({ ...current, level: event.target.value }))}
                  >
                    <option>Advanced</option>
                    <option>Intermediate</option>
                    <option>Foundational</option>
                  </select>
                </div>
                <div>
                  <button className="button-primary" type="submit">
                    Add Skill
                  </button>
                </div>
              </form>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.skills.map((skill) => (
                      <tr key={skill.id}>
                        <td>{skill.name}</td>
                        <td>{skill.category}</td>
                        <td>{skill.level}</td>
                        <td>
                          <button
                            className="button-secondary danger gap-2 px-4 text-[10px] uppercase tracking-[0.18em]"
                            onClick={() => removeSkill(skill.id)}
                            type="button"
                          >
                            
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeTab === "projects" ? (
            <section className="content-panel">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">Projects</p>
                  <h2>Manage project entries</h2>
                  <p className="section-copy">
                    Each item opens in a modal editor so long content and image tools stay contained
                    instead of overflowing in the page.
                  </p>
                </div>
                <button className="button-primary" onClick={() => openProjectModal()} type="button">
                  Add Project
                </button>
              </div>

              <div className="admin-list">
                {dashboard.projects.map((project) => (
                  <article key={project.id} className="admin-list-item admin-list-item-stack">
                    <div className="min-w-0">
                      <strong>{project.title}</strong>
                      <span className="mt-2">
                        {project.category} | {project.yearLabel}
                      </span>
                      <p className="section-copy mt-3 mb-0">{project.summary}</p>
                      <div className="admin-chip-row">
                        <span className="admin-mini-chip">
                          {project.screenshots?.length || 0} screenshots
                        </span>
                        <span className="admin-mini-chip">
                          {project.useThumbnail && project.thumbnailUrl ? "Thumbnail selected" : "Gradient thumbnail"}
                        </span>
                        {project.featured ? <span className="admin-mini-chip">Featured</span> : null}
                      </div>
                    </div>
                    <div className="button-row mt-0 w-full md:w-auto md:justify-end">
                      <button
                        className="button-secondary gap-2 px-4 text-[10px] uppercase tracking-[0.18em]"
                        onClick={() => openProjectModal(project)}
                        type="button"
                      >
                        
                        Edit
                      </button>
                      <button
                        className="button-secondary danger gap-2 px-4 text-[10px] uppercase tracking-[0.18em]"
                        onClick={() => removeProject(project.id)}
                        type="button"
                      >
                        
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "messages" ? (
            <section className="content-panel">
              <p className="eyebrow">Messages</p>
              <h2>Saved contact submissions</h2>
              <div className="message-list mt-6">
                {sortedMessages.length ? (
                  sortedMessages.map((message) => (
                    <article
                      key={message.id}
                      className="message-card rounded-[20px] border border-[rgba(68,71,78,0.12)] bg-[var(--glass-card-bg)] p-6"
                    >
                      <div className="message-header">
                        <div className="flex flex-col gap-1">
                          <strong>{message.name}</strong>
                          <span>{message.email}</span>
                        </div>
                        <time className="whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-[var(--text-soft)] [font-family:var(--font-label)]">
                          {message.created_at}
                        </time>
                      </div>
                      <p className="message-subject">{message.subject}</p>
                      <p className="text-sm leading-7 text-[var(--text-soft)]">{message.message}</p>
                    </article>
                  ))
                ) : (
                  <p className="section-copy">No contact messages have been saved yet.</p>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {activeModal === "experience" ? (
        <AdminModal
          onClose={closeModal}
          title={experienceForm.id ? "Update experience" : "Add new experience"}
        >
          <form className="admin-field-stack" onSubmit={saveExperience}>
            <label className="field">
              <span>Job Title</span>
              <input
                value={experienceForm.title}
                onChange={(event) =>
                  setExperienceForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Organization</span>
              <input
                value={experienceForm.organization}
                onChange={(event) =>
                  setExperienceForm((current) => ({ ...current, organization: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Period</span>
              <input
                placeholder="School Year 2025-2026"
                value={experienceForm.period}
                onChange={(event) =>
                  setExperienceForm((current) => ({ ...current, period: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Emphasis</span>
              <input
                placeholder="Teaching and curriculum delivery"
                value={experienceForm.emphasis}
                onChange={(event) =>
                  setExperienceForm((current) => ({ ...current, emphasis: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows="6"
                value={experienceForm.description}
                onChange={(event) =>
                  setExperienceForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <div className="button-row">
              <button className="button-primary" type="submit">
                {experienceForm.id ? "Update Experience" : "Add Experience"}
              </button>
              <button className="button-secondary" onClick={closeModal} type="button">
                Cancel
              </button>
            </div>
          </form>
        </AdminModal>
      ) : null}

      {activeModal === "training" ? (
        <AdminModal
          onClose={closeModal}
          title={certificationForm.id ? "Update training item" : "Add training item"}
        >
          <form className="admin-field-stack" onSubmit={saveCertification}>
            <label className="field">
              <span>Title</span>
              <input
                value={certificationForm.title}
                onChange={(event) =>
                  setCertificationForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Issuer</span>
              <input
                value={certificationForm.issuer}
                onChange={(event) =>
                  setCertificationForm((current) => ({ ...current, issuer: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Period</span>
              <input
                placeholder="December 5, 2023"
                value={certificationForm.period}
                onChange={(event) =>
                  setCertificationForm((current) => ({ ...current, period: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows="6"
                value={certificationForm.description}
                onChange={(event) =>
                  setCertificationForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <div className="button-row">
              <button className="button-primary" type="submit">
                {certificationForm.id ? "Update Training" : "Add Training"}
              </button>
              <button className="button-secondary" onClick={closeModal} type="button">
                Cancel
              </button>
            </div>
          </form>
        </AdminModal>
      ) : null}

      {activeModal === "project" ? (
        <AdminModal onClose={closeModal} title={projectForm.id ? "Update project" : "Create project"}>
          <form className="admin-field-stack" onSubmit={saveProject}>
            <label className="field">
              <span>Title</span>
              <input
                value={projectForm.title}
                onChange={(event) =>
                  setProjectForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: current.slug || slugify(event.target.value),
                  }))
                }
              />
            </label>
            <label className="field">
              <span>Slug</span>
              <input
                value={projectForm.slug}
                onChange={(event) => setProjectForm((current) => ({ ...current, slug: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Category</span>
              <input
                value={projectForm.category}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, category: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Role</span>
              <input
                value={projectForm.role}
                onChange={(event) => setProjectForm((current) => ({ ...current, role: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Year Label</span>
              <input
                value={projectForm.yearLabel}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, yearLabel: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Metric Label</span>
              <input
                value={projectForm.metricLabel}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, metricLabel: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Metric Value</span>
              <input
                value={projectForm.metricValue}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, metricValue: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Link Label</span>
              <input
                value={projectForm.linkLabel}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, linkLabel: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Link URL</span>
              <input
                value={projectForm.linkUrl}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, linkUrl: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Summary</span>
              <textarea
                rows="4"
                value={projectForm.summary}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, summary: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows="6"
                value={projectForm.description}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Technologies (comma separated)</span>
              <input
                value={projectForm.technologies}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, technologies: event.target.value }))
                }
              />
            </label>

            <div className="admin-media-box">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">Screenshots</p>
                  <h3>Upload or add project images</h3>
                  <p className="section-copy">
                    Uploaded images are compressed first. The thumbnail is selected from these same
                    screenshots so the data maps cleanly to future cloud storage.
                  </p>
                </div>
              </div>

              <label className="field">
                <span>Upload Screenshot Images</span>
                <input
                  accept="image/*"
                  multiple
                  onChange={handleProjectScreenshotUpload}
                  type="file"
                />
              </label>
              <div className="admin-inline-upload">
                <input
                  className="admin-inline-input"
                  placeholder="https://example.com/screenshot.jpg"
                  value={screenshotUrlInput}
                  onChange={(event) => setScreenshotUrlInput(event.target.value)}
                />
                <button
                  className="button-secondary"
                  onClick={() => {
                    addProjectScreenshotUrl(screenshotUrlInput);
                    setScreenshotUrlInput("");
                  }}
                  type="button"
                >
                  Add Image URL
                </button>
              </div>
              <p className="section-copy mb-0">
                {uploadingAsset === "project"
                  ? "Compressing and uploading screenshot..."
                  : "You can upload files now and later swap the same structure to Firebase Storage."}
              </p>

              <div className="admin-screenshot-grid">
                {projectForm.screenshots.length ? (
                  projectForm.screenshots.map((image) => {
                    const isThumbnail = projectForm.thumbnailUrl === image && projectForm.useThumbnail;
                    return (
                      <article key={image} className="admin-screenshot-card">
                        <div className="admin-screenshot-thumb">
                          <img alt="" src={image} />
                        </div>
                        <div className="admin-screenshot-actions">
                          <button
                            className={`button-secondary${isThumbnail ? " active" : ""}`}
                            onClick={() =>
                              setProjectForm((current) => ({
                                ...current,
                                thumbnailUrl: image,
                                useThumbnail: true,
                              }))
                            }
                            type="button"
                          >
                            {isThumbnail ? "Thumbnail Selected" : "Set as Thumbnail"}
                          </button>
                          <button
                            className="button-secondary danger"
                            onClick={() => removeProjectScreenshot(image)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="admin-image-fallback admin-image-fallback-gradient">
                    <span className="material-symbols-outlined">imagesmode</span>
                    <strong>No screenshots added yet</strong>
                  </div>
                )}
              </div>

              <div className="button-row mt-0">
                <button
                  className="button-secondary"
                  onClick={() =>
                    setProjectForm((current) => ({
                      ...current,
                      useThumbnail: false,
                    }))
                  }
                  type="button"
                >
                  Use Gradient Thumbnail
                </button>
              </div>
            </div>

            <label className="toggle-field">
              <input
                checked={projectForm.featured}
                type="checkbox"
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, featured: event.target.checked }))
                }
              />
              <span>Feature this project on the home page</span>
            </label>

            <div className="admin-image-preview project-preview">
              {projectForm.useThumbnail && projectForm.thumbnailUrl ? (
                <img alt={projectForm.title || "Project thumbnail preview"} src={projectForm.thumbnailUrl} />
              ) : (
                <div className="admin-image-fallback admin-image-fallback-gradient">
                  <span className="material-symbols-outlined">image</span>
                  <strong>Gradient card preview will be used</strong>
                </div>
              )}
            </div>

            <div className="button-row">
              <button className="button-primary" type="submit">
                {projectForm.id ? "Update Project" : "Create Project"}
              </button>
              <button className="button-secondary" onClick={closeModal} type="button">
                Cancel
              </button>
            </div>
          </form>
        </AdminModal>
      ) : null}
    </div>
  );
}
