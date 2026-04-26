import {
  Edit3,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

function getCVProfileScoreFromData(cvData) {
  if (!cvData) return 0;

  let score = 0;
  if (cvData.fullName?.trim()) score += 15;
  if (cvData.email?.trim()) score += 10;
  if (cvData.phone?.trim()) score += 10;
  if (cvData.title?.trim()) score += 10;
  if (cvData.skills?.trim()) score += 20;
  if (cvData.experience?.trim()) score += 15;
  if (cvData.summary?.trim()) score += 15;
  if (cvData.avatar?.trim()) score += 5;

  return score;
}

export default function CVProfileCard({ cvData, onEdit, onDelete }) {
  const score = getCVProfileScoreFromData(cvData);

  return (
    <div className="panel-surface relative overflow-hidden rounded-[32px] p-1">
      {/* Hiệu ứng đường kẻ phía trên trang trí */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400" />

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            {/* Avatar hoặc Icon CV */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-white shadow-sm border border-sky-100">
              {cvData?.avatar ? (
                <img
                  src={cvData.avatar}
                  className="h-full w-full rounded-2xl object-cover"
                  alt="Avatar"
                />
              ) : (
                <FileText size={32} className="text-sky-500" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {cvData?.fullName || "Chưa cập nhật tên"}
              </h3>
              <p className="text-sm font-medium text-slate-500">
                {cvData?.title || "Vị trí ứng tuyển mong muốn"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition-all shadow-sm"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={onDelete}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-rose-400 hover:border-rose-500 hover:text-rose-500 transition-all shadow-sm"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Thanh tiến trình hoàn thiện hồ sơ */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Độ hoàn thiện hồ sơ
            </span>
            <span
              className={`text-sm font-bold ${score === 100 ? "text-emerald-500" : "text-sky-500"}`}
            >
              {score}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Thông báo nhắc nhở */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          {score < 100 ? (
            <>
              <AlertCircle size={20} className="text-amber-500 shrink-0" />
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Hồ sơ của bạn còn thiếu thông tin. Hãy hoàn thiện 100% để được
                AI đề xuất nhiều công việc phù hợp hơn.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Tuyệt vời! Hồ sơ của bạn đã sẵn sàng để ứng tuyển vào các công
                ty hàng đầu.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
