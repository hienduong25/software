import { useContext, useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import {
  getSavedNotifications,
  markAllNotificationsRead,
  markNotificationAsRead,
  clearNotifications,
} from "../../utils/notificationStorage";

export default function NotificationsPage() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getSavedNotifications(user));
  }, [user]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const refreshNotifications = () => {
    setNotifications(getSavedNotifications(user));
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    markAllNotificationsRead(user);
    refreshNotifications();
  };

  const handleMarkRead = (notificationId) => {
    if (!user) return;
    markNotificationAsRead(notificationId, user);
    refreshNotifications();
  };

  const handleClear = () => {
    if (!user) return;
    clearNotifications(user);
    setNotifications([]);
  };

  return (
    <div className="space-y-6">
      <div className="panel-surface rounded-3xl px-6 py-7 hover:shadow-lg transition">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Thông báo
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Bảng Thông Báo</h1>
            <p className="mt-2 text-sm text-slate-500">
              Xem các cập nhật mới nhất khi ứng viên ứng tuyển vào tin đăng của bạn.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Đánh dấu đã đọc
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Thông báo chưa đọc</p>
            <p className="text-3xl font-bold text-slate-900">{unreadCount}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={refreshNotifications}
          className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Làm mới
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-500">
          Chưa có thông báo nào.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-[28px] border p-5 shadow-sm transition ${
                notification.read
                  ? "border-slate-200 bg-white"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-slate-500">{notification.title}</p>
                  <p className="mt-2 text-slate-900">{notification.message}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {new Date(notification.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification.id)}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Đã đọc
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 size={16} />
                      Đã đọc
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
