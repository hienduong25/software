import { getStorageKey } from "./storageUtils";

const APPLICATIONS_STORAGE_KEY = "job-portal-ai-applications";

export function getSavedApplications(user) {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(
    getStorageKey(APPLICATIONS_STORAGE_KEY, user),
  );
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({ ...item, jobId: String(item.jobId) }));
  } catch {
    return [];
  }
}

export function saveApplications(applications, user) {
  if (typeof window === "undefined") return;
  const normalized = applications.map((item) => ({
    ...item,
    jobId: String(item.jobId),
    seekerId: user?.id ?? item.seekerId ?? null,
  }));
  window.localStorage.setItem(
    getStorageKey(APPLICATIONS_STORAGE_KEY, user),
    JSON.stringify(normalized),
  );
  window.dispatchEvent(new Event("applicationStorageUpdated"));
}

export function addApplication(application, user) {
  const current = getSavedApplications(user);
  const normalizedJobId = String(application.jobId);

  if (current.some((item) => item.jobId === normalizedJobId)) return current;

  const updated = [
    {
      ...application,
      jobId: normalizedJobId,
      seekerId: user?.id ?? null,
      status: "Pending",
      appliedAt: new Date().toISOString(),
    },
    ...current,
  ];
  saveApplications(updated, user);
  return updated;
}

export function updateApplicationStatus(jobId, status, user) {
  if (typeof window === "undefined") return [];

  const normalizedJobId = String(jobId);
  const updated = getSavedApplications(user).map((item) =>
    item.jobId === normalizedJobId ? { ...item, status } : item,
  );
  saveApplications(updated, user);
  return updated;
}

export function withdrawApplication(jobId, user) {
  if (typeof window === "undefined") return [];

  const updated = getSavedApplications(user).filter(
    (app) => app.jobId !== String(jobId),
  );
  saveApplications(updated, user);
  return updated;
}

export function clearAllApplications(user) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(
    getStorageKey(APPLICATIONS_STORAGE_KEY, user),
  );
  window.dispatchEvent(new Event("applicationStorageUpdated"));
}
