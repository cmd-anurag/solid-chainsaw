const StatCard = ({ title, value, change, accent = 'primary' }) => {
  const accentClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      {change && (
        <span
          className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${accentClasses[accent]}`}
        >
          {change}
        </span>
      )}
    </div>
  );
};

export default StatCard;

