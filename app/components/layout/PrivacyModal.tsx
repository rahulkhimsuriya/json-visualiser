import React from 'react';
import { ShieldCheck, X, HardDrive, Lock, ServerOff, Check } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                100% Client-Side Privacy Guarantee
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Zero telemetry, zero server storage, complete local isolation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              Your data stays in your browser.
            </h3>
            <p className="text-sm text-emerald-800/90 dark:text-emerald-300 leading-relaxed">
              JSON files and datasets are processed locally and are never uploaded to our servers.
              No user accounts, remote databases, or cloud processing exist in this application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                <HardDrive className="w-4 h-4 text-emerald-500" />
                Local Storage Only
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Datasets are stored strictly within your browser's IndexedDB and localStorage sandbox on your device.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                <ServerOff className="w-4 h-4 text-emerald-500" />
                Zero Server Transmission
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                No JSON content, uploaded files, row data, SQL queries, or query history are ever transmitted over the network.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Local-Only Storage
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Your raw JSON, flattened tabular schemas, and SQL query history are stored directly in your browser's IndexedDB and localStorage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Offline-Ready & Airgapped
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  The application works completely offline. You can disconnect your network connection entirely and continue processing, exploring, and querying datasets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
