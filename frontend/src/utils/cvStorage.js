import { getStorageKey } from "./storageUtils";

const CV_STORAGE_KEY = "job-portal-ai-cv-library";
const LEGACY_CV_STORAGE_KEY = "job-portal-ai-cv";

function generateId() {
  return `cv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCv(cvData) {
  return {
    id: cvData.id || generateId(),
    name: cvData.name || cvData.fullName || "CV mới",
    fullName: cvData.fullName || "",
    email: cvData.email || "",
    phone: cvData.phone || "",
    title: cvData.title || "",
    skills: cvData.skills || "",
    experience: cvData.experience || "",
    cvUrl: cvData.cvUrl || cvData.cv_url || "",
    summary: cvData.summary || "",
    avatar: cvData.avatar || "",
    analysis: cvData.analysis || null,
    createdAt: cvData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function migrateLegacyCv(user) {
  if (typeof window === "undefined") return [];

  const rawLegacy = window.localStorage.getItem(
    getStorageKey(LEGACY_CV_STORAGE_KEY, user),
  );
  if (!rawLegacy) return [];

  try {
    const migrated = normalizeCv(JSON.parse(rawLegacy));
    window.localStorage.setItem(
      getStorageKey(CV_STORAGE_KEY, user),
      JSON.stringify([migrated]),
    );
    window.localStorage.removeItem(getStorageKey(LEGACY_CV_STORAGE_KEY, user));
    return [migrated];
  } catch {
    return [];
  }
}

export function getSavedCVs(user) {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(getStorageKey(CV_STORAGE_KEY, user));
  if (!raw) return migrateLegacyCv(user);

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCVs(cvs, user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getStorageKey(CV_STORAGE_KEY, user),
    JSON.stringify(cvs),
  );
}

export function saveCV(cvData, user) {
  const normalized = normalizeCv(cvData);
  const current = getSavedCVs(user);
  const existingIndex = current.findIndex((item) => item.id === normalized.id);

  if (existingIndex >= 0) {
    current[existingIndex] = normalized;
    saveCVs([...current], user);
  } else {
    saveCVs([normalized, ...current], user);
  }

  return normalized;
}

export function deleteCV(cvId, user) {
  const updated = getSavedCVs(user).filter((item) => item.id !== cvId);
  saveCVs(updated, user);
  return updated;
}

export function attachAnalysisToCV(cvId, analysis, user) {
  const updated = getSavedCVs(user).map((item) =>
    item.id === cvId
      ? { ...item, analysis, updatedAt: new Date().toISOString() }
      : item,
  );
  saveCVs(updated, user);
  return updated.find((item) => item.id === cvId) || null;
}

export function getSavedCV(user) {
  return getSavedCVs(user)[0] || null;
}

export function hasSavedCV(user) {
  return getSavedCVs(user).some(
    (cv) => cv.fullName?.trim() && cv.email?.trim() && cv.summary?.trim(),
  );
}

export function getCVProfileScore(user) {
  const cv = getSavedCV(user);
  if (!cv) return 0;

  return [
    cv.fullName?.trim() && 15,
    cv.email?.trim() && 10,
    cv.phone?.trim() && 10,
    cv.title?.trim() && 10,
    cv.skills?.trim() && 20,
    cv.experience?.trim() && 15,
    cv.summary?.trim() && 15,
    cv.avatar?.trim() && 5,
  ]
    .filter(Boolean)
    .reduce((sum, val) => sum + val, 0);
}

export function getAnalyzedCVs(user) {
  return getSavedCVs(user).filter((cv) => Boolean(cv.analysis));
}

export function clearAllCVs(user) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getStorageKey(CV_STORAGE_KEY, user));
}
