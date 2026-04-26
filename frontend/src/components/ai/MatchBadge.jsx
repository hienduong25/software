const getBadgeConfig = (score) => {
  if (score >= 80) {
    return {
      label: "Rất phù hợp",
      barColor: "bg-emerald-500",
      ringColor: "ring-emerald-200",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      scoreColor: "text-emerald-600",
    };
  }

  if (score >= 60) {
    return {
      label: "Khá phù hợp",
      barColor: "bg-sky-500",
      ringColor: "ring-sky-200",
      textColor: "text-sky-700",
      bgColor: "bg-sky-50",
      scoreColor: "text-sky-600",
    };
  }

  if (score >= 40) {
    return {
      label: "Trung bình",
      barColor: "bg-amber-400",
      ringColor: "ring-amber-200",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      scoreColor: "text-amber-600",
    };
  }

  return {
    label: "Cần cải thiện",
    barColor: "bg-rose-400",
    ringColor: "ring-rose-200",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    scoreColor: "text-rose-600",
  };
};

export default function MatchBadge({ score = 0 }) {
  const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;
  const normalizedScore = Math.max(0, Math.min(100, safeScore));
  const config = getBadgeConfig(normalizedScore);

  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-2xl border px-5 py-3 ring-1 ${config.ringColor} ${config.bgColor} min-w-[120px]`}
    >
      {/* % tương thích nổi bật */}
      <div className="flex items-baseline gap-0.5">
        <span className={`text-3xl font-extrabold leading-none ${config.scoreColor}`}>
          {normalizedScore}
        </span>
        <span className={`text-base font-bold ${config.scoreColor}`}>%</span>
      </div>

      {/* Nhãn "Tương thích" */}
      <span className={`text-xs font-semibold uppercase tracking-wider ${config.textColor}`}>
        Tương thích
      </span>

      {/* Thanh progress */}
      <div className="w-full h-1.5 rounded-full bg-white/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${config.barColor}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>

      {/* Mức độ phù hợp */}
      <span className={`text-[11px] font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}
