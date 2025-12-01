import { API_ORIGIN } from '../services/api';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const buildFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
};

const ActivityCard = ({ activity, actions }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-lg font-semibold text-slate-900">{activity.title}</p>
        <p className="text-sm text-slate-500 capitalize">{activity.category}</p>
      </div>
      <span
        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[activity.status]}`}
      >
        {activity.status}
      </span>
    </div>
    {activity.student?.name && (
      <p className="mt-1 text-xs text-slate-500">
        Submitted by {activity.student.name} ({activity.student.department || 'Dept'})
      </p>
    )}
    {activity.description && (
      <p className="mt-3 text-sm text-slate-600">{activity.description}</p>
    )}
    {activity.file && (
      <a
        href={buildFileUrl(activity.file)}
        className="mt-3 inline-flex text-sm font-semibold text-primary underline"
        target="_blank"
        rel="noreferrer"
      >
        View attachment
      </a>
    )}
    {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export default ActivityCard;

