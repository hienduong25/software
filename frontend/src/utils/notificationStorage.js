import { getStorageKey } from "./storageUtils";

const NOTIFICATIONS_STORAGE_KEY = "job-portal-ai-notifications";
const NOTIFICATION_STORAGE_EVENT = "notification-storage-updated";

function dispatchNotificationEvent(user, notifications) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_STORAGE_EVENT, { detail: { user, notifications } }),
  );
}

export function getSavedNotifications(user) {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(
    getStorageKey(NOTIFICATIONS_STORAGE_KEY, user),
  );
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications, user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getStorageKey(NOTIFICATIONS_STORAGE_KEY, user),
    JSON.stringify(notifications),
  );
  dispatchNotificationEvent(user, notifications);
}

export function addNotification(notification, user) {
  const current = getSavedNotifications(user);
  const newItem = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: notification.title || "Thông báo mới",
    message: notification.message || "Bạn có một thông báo mới.",
    type: notification.type || "info",
    createdAt: new Date().toISOString(),
    read: false,
  };
  const updated = [newItem, ...current];
  saveNotifications(updated, user);
  return updated;
}

export function markNotificationAsRead(notificationId, user) {
  const updated = getSavedNotifications(user).map((item) =>
    item.id === notificationId ? { ...item, read: true } : item,
  );
  saveNotifications(updated, user);
  return updated;
}

export function markAllNotificationsRead(user) {
  const updated = getSavedNotifications(user).map((item) => ({
    ...item,
    read: true,
  }));
  saveNotifications(updated, user);
  return updated;
}

export function clearNotifications(user) {
  saveNotifications([], user);
  return [];
}
