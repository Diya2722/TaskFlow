const Loader = ({ size = 'md', fullScreen = false }) => {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };
  const spin = <div className={`${s[size]} rounded-full border-purple-200 border-t-purple-600 animate-spin`} />;
  if (fullScreen) return (
    <div className="fixed inset-0 flex items-center justify-center bg-purple-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        {spin}
        <p className="text-purple-600 dark:text-purple-400 font-medium text-sm">Loading…</p>
      </div>
    </div>
  );
  return spin;
};

export default Loader;
