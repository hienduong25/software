export default function StatsCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="card-surface rounded-3xl p-6 hover:shadow-lg transition group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-3 text-sm leading-6 text-slate-600 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 p-4 text-blue-600 group-hover:shadow-md transition">
            <Icon size={28} />
          </div>
        )}
      </div>
    </div>
  );
}
