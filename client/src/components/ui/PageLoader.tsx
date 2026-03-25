const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Animated ring */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-20 animate-ping" />
        <span className="relative inline-flex rounded-full h-14 w-14 border-4 border-transparent border-t-blue-500 border-l-blue-400 animate-spin" />
      </div>

      {/* Label */}
      <p className="mt-6 text-sm tracking-widest text-gray-400 uppercase animate-pulse">
        Loading…
      </p>
    </div>
  );
};

export default PageLoader;
