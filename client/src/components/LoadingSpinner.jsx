const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-600">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export default LoadingSpinner;

