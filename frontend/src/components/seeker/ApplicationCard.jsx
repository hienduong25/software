import { Clock, CheckCircle2, XCircle } from "lucide-react";

const statusStyles = {
  "Đã nộp": "bg-sky-50 text-sky-600 border-sky-100",
  "Đang xem xét": "bg-amber-50 text-amber-600 border-amber-100",
  "Phỏng vấn": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Từ chối": "bg-rose-50 text-rose-600 border-rose-100",
};

export default function ApplicationStatusCard({ app, onWithdraw }) {
  return (
    <div className="card-surface rounded-[28px] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">
            {app.company?.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{app.jobTitle}</h4>
            <p className="text-sm text-slate-500">{app.company}</p>
          </div>
        </div>
        <span className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${statusStyles[app.status]}`}>
          {app.status}
        </span>
      </div>
      
      <div className="mt-5 flex items-center justify-between text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          Nộp ngày: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
        </div>
        <button 
          onClick={() => onWithdraw(app.jobId)}
          className="text-rose-400 hover:text-rose-600 transition-colors"
        >
          Rút hồ sơ
        </button>
      </div>
    </div>
  );
}