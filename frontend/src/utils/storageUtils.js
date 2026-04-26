/**
 * Tạo suffix key cho localStorage theo từng user (tránh xung đột dữ liệu giữa các tài khoản).
 * Ưu tiên dùng user truyền vào, fallback về localStorage nếu không có.
 */
export function getUserStorageSuffix(user) {
  if (user?.id) {
    return `${user.role || "user"}-${user.id}`;
  }

  if (typeof window === "undefined") return "guest";

  try {
    const rawUser = window.localStorage.getItem("user");
    if (!rawUser) return "guest";
    const parsed = JSON.parse(rawUser);
    return `${parsed.role || "user"}-${parsed.id || "unknown"}`;
  } catch {
    return "guest";
  }
}

/**
 * Trả về key hoàn chỉnh cho localStorage, có gắn suffix user.
 */
export function getStorageKey(baseKey, user) {
  return `${baseKey}-${getUserStorageSuffix(user)}`;
}
