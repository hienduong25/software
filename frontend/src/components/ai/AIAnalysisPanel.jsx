import MatchBadge from "./MatchBadge";

function SectionList({ title, items, emptyText }) {
  const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>

      {normalizedItems.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          {normalizedItems.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

export default function AIAnalysisPanel({
  summary,
  strengths = [],
  missingSkills = [],
  score,
  actionLabel,
  onAnalyze,
  loading = false,
  helperText,
  emptyState = "Chưa có tóm tắt AI cho hồ sơ này.",
}) {
  const canTriggerAnalysis = typeof onAnalyze === "function";

  return (
    <div className="panel-surface rounded-[34px] p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            AI Analysis
          </p>
          <h3 className="text-2xl font-semibold text-slate-900">
            Tóm tắt phân tích AI
          </h3>
          {helperText ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {helperText}
            </p>
          ) : null}
        </div>

        {Number.isFinite(Number(score)) ? <MatchBadge score={score} /> : null}
      </div>

      {canTriggerAnalysis ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading}
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang phân tích..." : actionLabel || "Phân tích AI"}
          </button>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl bg-sky-50 px-4 py-4 text-sm leading-6 text-slate-700">
        {summary || emptyState}
      </div>

      <div className="mt-4 grid gap-4">
        <SectionList
          title="Điểm mạnh"
          items={strengths}
          emptyText="Chưa có điểm mạnh nào được ghi nhận."
        />
        <SectionList
          title="Thiếu hụt"
          items={missingSkills}
          emptyText="Chưa có kỹ năng thiếu hụt nào được ghi nhận."
        />
      </div>
    </div>
  );
}
