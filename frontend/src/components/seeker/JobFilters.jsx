/**
 * Bộ lọc tìm kiếm việc làm: địa điểm, trạng thái, ứng tuyển, sắp xếp.
 */
export default function JobFilters({
  locationFilter, setLocationFilter,
  statusFilter, setStatusFilter,
  applicationFilter, setApplicationFilter,
  sortBy, setSortBy,
  availableLocations,
  filteredCount,
  activeFilterCount,
  onReset,
}) {
  return (
    <div className="panel-surface rounded-3xl px-5 py-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bộ lọc tìm việc</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Tìm việc đúng nhu cầu nhanh hơn</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lọc theo địa điểm, trạng thái tuyển, tình trạng ứng tuyển và cách sắp xếp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            {filteredCount} việc hiển thị
          </span>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {activeFilterCount} bộ lọc đang dùng
          </span>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Đặt lại
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Địa điểm</span>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">Tất cả địa điểm</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Trạng thái</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang tuyển</option>
            <option value="closed">Đã đủ ứng viên</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Ứng tuyển</span>
          <select
            value={applicationFilter}
            onChange={(e) => setApplicationFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">Tất cả công việc</option>
            <option value="not_applied">Chưa ứng tuyển</option>
            <option value="applied">Đã ứng tuyển</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Sắp xếp</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="latest">Mới đăng gần đây</option>
            <option value="remaining_slots">Còn nhiều slot</option>
            <option value="title">Tên công việc A-Z</option>
            <option value="company">Tên công ty A-Z</option>
          </select>
        </label>
      </div>
    </div>
  );
}
