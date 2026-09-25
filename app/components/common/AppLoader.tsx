import React, { useState, useEffect, useRef } from 'react';
import { FileJson, ShieldCheck } from 'lucide-react';

interface AppLoaderProps {
  isReady: boolean;
  minDuration?: number;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  isReady,
  minDuration = 400,
}) => {
  const [isDone, setIsDone] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isReady) return;

    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = Math.max(0, minDuration - elapsed);

    const fadeTimeout = setTimeout(() => {
      setIsFading(true);
      const unmountTimeout = setTimeout(() => {
        setIsDone(true);
      }, 300);
      return () => clearTimeout(unmountTimeout);
    }, remaining);

    return () => clearTimeout(fadeTimeout);
  }, [isReady, minDuration]);

  if (isDone) {
    return null;
  }

  return (
    <div
      id="app-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading JSON Visualiser Studio"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/95 dark:bg-[#080b12]/95 backdrop-blur-md ambient-glow transition-opacity duration-300 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-xs text-center px-4">
        {/* Animated App Icon */}
        <div className="relative mb-5">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-2xl blur-lg animate-pulse" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 ring-1 ring-white/25">
            <FileJson className="w-7 h-7" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          JSON
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
            Visualiser
          </span>
        </h1>

        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          Initializing studio & local storage...
        </p>

        {/* Indeterminate Loading Bar */}
        <div className="mt-5 w-44 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full animate-indeterminate" />
        </div>

        {/* Privacy Pill */}
        <div className="mt-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-medium shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>100% Client-Side • In-Memory</span>
        </div>
      </div>
    </div>
  );
};
