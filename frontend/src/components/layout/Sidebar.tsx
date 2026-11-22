
import { Link } from "@tanstack/react-router";

const linkClass =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200";

const activeClass =
  "bg-[#c6a66b] text-[#172f40] shadow-sm";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function BusinessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 7h15l-3-3M20 17H5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 7v4M5 17v-4" strokeLinecap="round" />
    </svg>
  );
}

function AssistantIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" strokeLinejoin="round" />
      <path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" strokeLinejoin="round" />
    </svg>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col bg-[#172f40] px-5 py-7 text-white md:flex">
        <div className="mb-12 px-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c6a66b] text-lg font-bold text-[#172f40]">
              B
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                BusinessFlow <span className="text-[#d6b978]">AI</span>
              </h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Business management
              </p>
            </div>
          </div>
        </div>

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Workspace
        </p>

        <nav className="flex flex-col gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: activeClass }}
            className={linkClass + " text-slate-300 hover:bg-white/10 hover:text-white"}
          >
            <DashboardIcon />
            Dashboard
          </Link>

          <Link
            to="/businesses"
            activeProps={{ className: activeClass }}
            className={linkClass + " text-slate-300 hover:bg-white/10 hover:text-white"}
          >
            <BusinessIcon />
            Businesses
          </Link>

          <Link
            to="/transactions"
            activeProps={{ className: activeClass }}
            className={linkClass + " text-slate-300 hover:bg-white/10 hover:text-white"}
          >
            <TransactionsIcon />
            Transactions
          </Link>

          <Link
            to="/ai-assistant"
            activeProps={{ className: activeClass }}
            className={linkClass + " text-slate-300 hover:bg-white/10 hover:text-white"}
          >
            <AssistantIcon />
            AI Assistant
          </Link>
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#c6a66b]/15 text-[#d6b978]">
            <AssistantIcon />
          </div>
          <p className="text-sm font-semibold text-white">
            Work smarter with AI
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Manage your business and understand your numbers in one place.
          </p>
        </div>

        <p className="mt-6 px-3 text-[10px] text-slate-500">
          © 2026 BusinessFlow AI
        </p>
      </aside>

      {/* Mobile Navigation */}
      <div className="shrink-0 border-b border-[#263f50] bg-[#172f40] px-4 py-3 text-white md:hidden">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c6a66b] font-bold text-[#172f40]">
            B
          </div>
          <h1 className="text-base font-bold">
            BusinessFlow <span className="text-[#d6b978]">AI</span>
          </h1>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-[#c6a66b] text-[#172f40]" }}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-slate-200"
          >
            Dashboard
          </Link>

          <Link
            to="/businesses"
            activeProps={{ className: "bg-[#c6a66b] text-[#172f40]" }}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-slate-200"
          >
            Businesses
          </Link>

          <Link
            to="/transactions"
            activeProps={{ className: "bg-[#c6a66b] text-[#172f40]" }}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-slate-200"
          >
            Transactions
          </Link>

          <Link
            to="/ai-assistant"
            activeProps={{ className: "bg-[#c6a66b] text-[#172f40]" }}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-slate-200"
          >
            AI Assistant
          </Link>
        </nav>
      </div>
    </>
  );
}
