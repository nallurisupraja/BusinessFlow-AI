
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../features/auth/AuthContext";
import {
  loginSchema,
  type LoginFormValues,
} from "../features/auth/schemas";

export function LoginPage() {
  const { login, status, sessionMessage } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: "/" });
    }
  }, [status, navigate]);

  async function submit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      await login(values.email, values.password);
      navigate({ to: "/" });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  return (
    <main className="min-h-[100dvh] w-full bg-[#f5f3ee] text-[#172b3b]">
      <div className="grid min-h-[100dvh] w-full grid-cols-1 lg:grid-cols-2">

        {/* LEFT BRAND PANEL */}
        <section className="relative hidden min-h-[100dvh] overflow-hidden bg-[#142b3b] px-8 py-6 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-8">

          <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full border border-[#c6a66b]/20" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-[340px] w-[340px] rounded-full border border-[#c6a66b]/20" />
          <div className="pointer-events-none absolute -bottom-48 -left-40 h-[450px] w-[450px] rounded-full bg-[#c6a66b]/10 blur-3xl" />

          <div className="relative z-10 flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#c6a66b]/50 bg-[#c6a66b]/10">
              <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7" aria-hidden="true">
                <path
                  d="M7 30V10L20 22L33 10V30"
                  stroke="#D6B77C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 30V21M27 30V21"
                  stroke="#D6B77C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-base font-semibold tracking-[0.16em]">
                BUSINESSFLOW
              </p>
              <p className="text-[9px] tracking-[0.3em] text-[#c6a66b]">
                INTELLIGENT BUSINESS MANAGEMENT
              </p>
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-xl py-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#d6b77c]">
              Welcome to smarter business
            </p>

            <h1 className="font-serif text-4xl leading-[1.15] xl:text-6xl">
              Manage your business.
              <span className="mt-2 block italic text-[#d6b77c]">
                Master your growth.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-[#c2cbd0] xl:text-base xl:leading-7">
              Bring your finances, business insights and intelligent
              assistance together in one beautifully organized workspace.
            </p>

            <div className="mt-7 grid max-w-md grid-cols-2 gap-5 border-t border-white/15 pt-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#d6b77c]" />
                  <span className="text-sm font-medium text-white">
                    Financial clarity
                  </span>
                </div>
                <p className="text-xs leading-5 text-[#aebdc6]">
                  Understand your business numbers with confidence.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#d6b77c]" />
                  <span className="text-sm font-medium text-white">
                    Intelligent insights
                  </span>
                </div>
                <p className="text-xs leading-5 text-[#aebdc6]">
                  Make better decisions with AI-powered assistance.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-[11px] text-[#aebdc6]">
            <span>© {new Date().getFullYear()} BusinessFlow AI</span>
            <span>Built for better business decisions.</span>
          </div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="flex min-h-[100dvh] items-center justify-center px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-6">

          <div className="my-auto w-full max-w-[410px]">

            {/* MOBILE BRAND */}
            <div className="mb-5 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142b3b]">
                <span className="font-serif text-xl font-bold text-[#d6b77c]">
                  B
                </span>
              </div>
              <div>
                <p className="text-base font-bold tracking-[0.12em] text-[#142b3b]">
                  BUSINESSFLOW
                </p>
                <p className="text-[8px] tracking-[0.25em] text-[#9b7a42]">
                  INTELLIGENT BUSINESS MANAGEMENT
                </p>
              </div>
            </div>

            {/* HEADING */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a17d43]">
                Your business workspace
              </p>

              <h2 className="font-serif text-3xl font-medium tracking-tight text-[#172b3a] sm:text-4xl">
                Welcome back.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#71808a]">
                Sign in to continue managing your business with clarity
                and confidence.
              </p>
            </div>

            {/* LOGIN CARD */}
            <div className="rounded-2xl border border-[#e7e1d5] bg-white p-5 shadow-[0_18px_60px_rgba(28,42,51,0.07)] sm:p-7">

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-[#172b3a]">
                  Sign in to your account
                </h3>
                <p className="mt-1 text-xs text-[#87919a]">
                  Enter your credentials to access your workspace.
                </p>
              </div>

              {sessionMessage && (
                <div
                  role="status"
                  className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"
                >
                  {sessionMessage}
                </div>
              )}

              <form
                noValidate
                onSubmit={handleSubmit(submit)}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-semibold text-[#344653]"
                  >
                    Email address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-[#dfe3e5] bg-[#fcfcfa] px-4 py-3 text-sm text-[#172b3a] outline-none transition placeholder:text-[#aab1b6] focus:border-[#a88750] focus:ring-4 focus:ring-[#c6a66b]/10"
                    {...register("email")}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-sm font-semibold text-[#344653]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-[#dfe3e5] bg-[#fcfcfa] px-4 py-3 pr-16 text-sm text-[#172b3a] outline-none transition placeholder:text-[#aab1b6] focus:border-[#a88750] focus:ring-4 focus:ring-[#c6a66b]/10"
                      {...register("password")}
                    />

                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((shown) => !shown)}
                      className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-[#9b7a42] transition hover:text-[#142b3b]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
                  >
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-3 rounded-lg bg-[#172f40] px-5 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-[#172f40]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#24465a] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "Signing in..." : "Sign in to your account"}
                  {!isSubmitting && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e9e6df]" />
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#a2a9ad]">
                  New to BusinessFlow?
                </span>
                <div className="h-px flex-1 bg-[#e9e6df]" />
              </div>

              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-lg border border-[#c6a66b]/60 bg-[#fbfaf7] px-5 py-3 text-sm font-semibold text-[#795e36] transition hover:border-[#a88750] hover:bg-[#f5f0e7]"
              >
                Create your account
              </Link>
            </div>

            <p className="mt-4 pb-1 text-center text-[10px] leading-5 text-[#92999c]">
              Secure access to your business workspace.
              <span className="block">
                © {new Date().getFullYear()} BusinessFlow AI. All rights reserved.
              </span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
