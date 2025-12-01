const EmptyState = ({ title, description, action }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;

