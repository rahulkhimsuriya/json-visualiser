import React, { useState, useEffect } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import { Header } from "./components/layout/Header";
import { CommandPalette } from "./components/layout/CommandPalette";
import { PrivacyModal } from "./components/layout/PrivacyModal";
import { AppLoader } from "./components/common/AppLoader";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <noscript>
          <style>{`#app-loader { display: none !important; }`}</style>
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var settings = JSON.parse(localStorage.getItem('json_vis_settings') || '{}');
                  var theme = settings.theme || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-[#080b12] text-slate-900 dark:text-slate-100 ambient-glow antialiased selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 transition-colors duration-200">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function MainShell() {
  const { isInitialized } = useWorkspace();
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading' || navigation.state === 'submitting';

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Route transition loading bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse shadow-xs shadow-emerald-500/50" />
      )}

      {/* App boot & workspace initialization loader */}
      <AppLoader isReady={isInitialized} />

      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <MainShell />
    </WorkspaceProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Page Not Found" : "Error";
    details =
      error.status === 404
        ? "The requested route could not be found."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-6 max-w-2xl mx-auto text-center space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{message}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{details}</p>
      <a
        href="/"
        className="inline-block px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
      >
        Return Home
      </a>
      {stack && (
        <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-left font-mono text-xs overflow-x-auto text-slate-700 dark:text-slate-300">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
