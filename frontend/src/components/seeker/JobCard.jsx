import { MapPin, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <div className="card-surface flex flex-col justify-between rounded-[32px] p-6 transition-all hover:-translate-y-1">
      <div>
        <div className="flex items-start justify-between">
          <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
            <Briefcase size={24} />
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
            AI chấm khi nộp CV
          </span>
        </div>
        
        <h3 className="mt-5 text-xl font-bold text-slate-900">{job.title}</h3>
        <p className="text-sm font-semibold text-sky-600">{job.company}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills?.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
          <MapPin size={14} />
          {job.location}
        </div>
        <Link 
          to={`/seeker/jobs/${job.id}`}
          className="text-sm font-bold text-sky-600 hover:text-sky-700"
        >
          Chi tiết →
        </Link>
      </div>
    </div>
  );
}
