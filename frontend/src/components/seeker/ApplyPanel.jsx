/**
 * Panel ứng tuyển — chọn CV, phân tích AI, xác nhận nộp đơn.
 * Hiển thị inline bên trong JobCard khi user bấm "Ứng Tuyển".
 */
export default function ApplyPanel({
  savedCvs,
  selectedCvId,
  onSelectCv,
  analysisResult,
  analysisLoading,
  applyLoading,
  onAnalyze,
  onApply,
  onCancel,
}) {
  return (
    <div className="mt-6 animate-fadeInUp rounded-2xl border-2 border-slate-200 bg-white/90 p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Chọn CV để nộp</p>
        <p className="mt-1 text-sm text-blue-500">
          Hệ thống sẽ gọi AI để tính trước độ phù hợp với công việc.
        </p>
      </div>

      {savedCvs.length === 0 ? (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chưa có CV nào. Hãy tạo CV trước ở mục Hồ Sơ / CV.
        </div>
      ) : (
        <select
          value={selectedCvId}
          onChange={(e) => onSelectCv(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
        >
          {savedCvs.map((cv) => (
            <option key={cv.id} value={String(cv.id)}>
              {cv.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analysisLoading || savedCvs.length === 0}
          className="rounded-2xl border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {analysisLoading ? "Đang phân tích..." : "Phân tích % thích hợp"}
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={applyLoading || savedCvs.length === 0}
          className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
          {applyLoading ? "Đang nộp..." : "Xác nhận nộp"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Hủy
        </button>
      </div>

      {!analysisResult && !analysisLoading && (
        <p className="text-sm text-slate-400 italic">
          Chọn CV rồi bấm Phân tích % thích hợp để xem AI đánh giá.
        </p>
      )}

      {analysisResult && <AnalysisResult result={analysisResult} />}
    </div>
  );
}

function AnalysisResult({ result }) {
  const scoreColor =
    result.score >= 70
      ? "bg-emerald-100 text-emerald-700"
      : result.score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Kết quả phân tích AI</p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${scoreColor}`}>
          {result.score}% phù hợp
        </span>
      </div>

      {result.summary && (
        <p className="text-sm text-slate-600">{result.summary}</p>
      )}

      {result.strengths?.length > 0 && (
        <ScoreList
          title="Điểm mạnh"
          items={result.strengths}
          icon="✓"
          iconColor="text-emerald-500"
          labelColor="text-emerald-600"
        />
      )}

      {result.weaknesses?.length > 0 && (
        <ScoreList
          title="Thiếu hụt"
          items={result.weaknesses}
          icon="✗"
          iconColor="text-rose-400"
          labelColor="text-rose-500"
        />
      )}
    </div>
  );
}

function ScoreList({ title, items, icon, iconColor, labelColor }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${labelColor}`}>
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600">
            <span className={`mt-0.5 ${iconColor}`}>{icon}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
