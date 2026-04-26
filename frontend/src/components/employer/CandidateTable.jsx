import { Eye, CheckCircle, XCircle } from "lucide-react";

export default function CandidateTable({
  candidates,
  onViewDetail,
  onUpdateStatus,
}) {
  return (
    <div className="panel-surface overflow-hidden rounded-[4xl] bg-white/50">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Ứng viên
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((candidate) => {
              return (
                <tr
                  key={candidate.applicationId}
                  className="group hover:bg-sky-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-sky-400 font-bold text-white shadow-sm">
                        {(candidate.full_name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {candidate.full_name || "Chưa cập nhật"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        candidate.status === "Chấp nhận"
                          ? "bg-emerald-50 text-emerald-600"
                          : candidate.status === "Từ chối"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {candidate.status || "Chờ duyệt"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onViewDetail(candidate.applicationId)}
                        className="rounded-lg p-2 transition-all hover:bg-white hover:text-sky-600 hover:shadow-sm"
                        title="Xem hồ sơ"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(candidate.applicationId, "Chấp nhận")
                        }
                        className="rounded-lg p-2 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm"
                        title="Duyệt"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(candidate.applicationId, "Từ chối")
                        }
                        className="rounded-lg p-2 transition-all hover:bg-white hover:text-rose-600 hover:shadow-sm"
                        title="Loại"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
        <p className="text-xs font-medium text-slate-500">
          Hiển thị {candidates.length} ứng viên.
        </p>
      </div>
    </div>
  );
}
