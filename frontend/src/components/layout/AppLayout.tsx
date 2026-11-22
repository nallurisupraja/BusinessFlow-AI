
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../features/auth/AuthContext";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    await navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f5f3ee] md:flex-row">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-10 flex shrink-0 items-center justify-between border-b border-[#e9e5dc] bg-white px-4 py-3.5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b0935e]">
              Business workspace
            </p>
            <h2 className="mt-0.5 text-base font-bold text-[#172f40] sm:text-lg">
              Business Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#172f40]">
                {user?.full_name ?? "User"}
              </p>
              <p className="text-xs text-[#929ba1]">Account</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9dfcc] bg-[#f7f3e9] text-sm font-bold text-[#927b51]">
              {(user?.full_name ?? "U").charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#e5e1d8] px-3 py-2 text-xs font-semibold text-[#52616a] transition hover:border-[#172f40] hover:bg-[#172f40] hover:text-white sm:px-4 sm:text-sm"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
