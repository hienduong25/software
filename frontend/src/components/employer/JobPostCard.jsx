import { Users, Calendar, MoreVertical, Edit2, Trash2, Eye } from "lucide-react";

export default function JobPostCard({ job, onEdit, onDelete, onViewApplicants }) {
  return (
    <div className="card-surface group relative overflow-hidden rounded-[4xl] p-6 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          {/* Trạng thái bài đăng */}
          <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
            job.status === 'Active' 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {job.status === 'Active' ? ' đang hiển thị' : ' Đã đóng'}
          </span>
          <h3 className="mt-3 text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-slate-500">{job.department || "Phòng kỹ thuật"}</p>
        </div>

        {/* Menu thao tác nhanh */}
        <div className="flex gap-1">
          <button 
            onClick={onEdit}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-all"
            title="Chỉnh sửa bài đăng"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
            title="Xóa bài đăng"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {/* Chỉ số ứng viên */}
        <div 
          onClick={onViewApplicants}
          className="cursor-pointer rounded-2xl bg-sky-50 p-4 transition-all hover:bg-sky-100 border border-sky-100/50"
        >
          <div className="flex items-center gap-2 text-sky-600">
            <Users size={18} />
            <span className="text-xl font-bold">{job.applicantCount || 0}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-sky-700/60 uppercase">Ứng viên</p>
        </div>

        {/* Ngày đăng */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={18} />
            <span className="text-sm font-bold">
              {new Date(job.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500/60 uppercase">Ngày đăng</p>
        </div>
      </div>

      {/* Nút xem chi tiết ứng viên */}
      <button 
        onClick={onViewApplicants}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-200"
      >
        <Eye size={18} />
        Xem danh sách ứng tuyển
      </button>
    </div>
  );
}