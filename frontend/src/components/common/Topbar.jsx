import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, UserCircle2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import {
  getSavedNotifications,
  markAllNotificationsRead,
  markNotificationAsRead,
} from "../../utils/notificationStorage";

function formatNotificationTime(createdAt) {
  if (!createdAt) return "Vừa xong";

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return "Vừa xong";

  const diffMs = Date.now() - createdTime;
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Date(createdAt).toLocaleDateString("vi-VN");
}

export default function Topbar({ title, role }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  const displayName = user
    ? role === "seeker"
      ? user.full_name || "Người tìm việc"
      : user.companyName || "Nhà tuyển dụng"
    : role === "seeker"
    ? "Người tìm việc"
    : "Nhà tuyển dụng";

  const account = {
    avatar: user?.avatar || "",
    fullName: displayName,
    email: user?.email || "",
    companyName: displayName,
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setNotifications(getSavedNotifications(user));
  }, [user]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleNotificationChange = () => {
      if (user) {
        setNotifications(getSavedNotifications(user));
      }
    };

    window.addEventListener("storage", handleNotificationChange);
    window.addEventListener(
      "notification-storage-updated",
      handleNotificationChange,
    );

    return () => {
      window.removeEventListener("storage", handleNotificationChange);
      window.removeEventListener(
        "notification-storage-updated",
        handleNotificationChange,
      );
    };
  }, [user]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const handleNotificationClick = (notificationId, isRead) => {
    if (!user || isRead) return;

    const updated = markNotificationAsRead(notificationId, user);
    setNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    if (!user || unreadCount === 0) return;

    const updated = markAllNotificationsRead(user);
    setNotifications(updated);
  };

  return (
    <header className="panel-surface relative z-50 mx-4 mt-4 flex min-h-24 items-center justify-between overflow-visible rounded-3xl px-6 hover:shadow-lg">
      <div>
        <h2 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Hệ thống tuyển dụng và tìm việc trực tuyến
        </p>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              aria-label="Thông báo"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white shadow">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 top-14 z-120 w-96 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Thông báo
                    </h3>
                    <p className="text-xs text-slate-500">
                      {unreadCount > 0
                        ? `${unreadCount} thông báo chưa đọc`
                        : "Bạn đã xem hết thông báo"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <CheckCheck size={15} />
                    Đánh dấu đã đọc
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Bell size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Chưa có thông báo nào
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Các cập nhật trạng thái ứng tuyển sẽ hiển thị tại đây.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification.id,
                              notification.read,
                            )
                          }
                          className={`w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                            notification.read
                              ? "bg-white"
                              : "bg-blue-50/60"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                notification.read
                                  ? "bg-slate-300"
                                  : "bg-blue-500"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p
                                  className={`text-sm ${
                                    notification.read
                                      ? "font-medium text-slate-700"
                                      : "font-bold text-slate-900"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <span className="whitespace-nowrap text-[11px] text-slate-400">
                                  {formatNotificationTime(
                                    notification.createdAt,
                                  )}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50/80 to-cyan-50/80 px-4 py-3 text-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-md">
            {account.avatar ? (
              <img
                src={account.avatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle2 size={22} />
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              {role === "seeker" ? "Tài khoản" : "Doanh nghiệp"}
            </p>
            <span className="text-sm font-bold text-slate-900">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
