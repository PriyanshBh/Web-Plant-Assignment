"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signup, clearAuthError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/dashboard";

  const dispatch = useAppDispatch();
  const { status, error, fieldErrors, user } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user && status === "authenticated") {
      router.replace(nextParam);
    }
  }, [user, status, router, nextParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    const result = await dispatch(signup({ name, email, password }));
    if (signup.fulfilled.match(result)) {
      router.push(nextParam);
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="w-full max-w-[400px] p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--popover-shadow)]">
      {/* Brand Wordmark */}
      <div className="flex flex-col items-center text-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-[var(--ink)] mb-2 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
          <span>MiniPM</span>
        </Link>
        <h1 className="text-xl font-semibold text-[var(--ink)] tracking-tight">
          Create an account
        </h1>
        <p className="text-xs text-[var(--ink-2)] mt-1">
          Start organizing your projects with clarity and precision.
        </p>
      </div>

      {/* Global Error Banner */}
      {error && !fieldErrors && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 mb-6 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg text-xs text-[var(--danger)] transition-all animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          error={fieldErrors?.name}
          disabled={isLoading}
        />

        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@company.com"
          error={fieldErrors?.email}
          disabled={isLoading}
        />

        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters, 1 letter, 1 number"
            helperText="At least 8 characters with letters and numbers."
            error={fieldErrors?.password}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[32px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button
          type="submit"
          variant="accent"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>

      {/* Bottom Switch Link */}
      <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--ink-2)]">
        Already have an account?{" "}
        <Link
          href={`/login${nextParam !== "/dashboard" ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
          className="font-medium text-[var(--ink)] hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-between p-4 sm:p-6 bg-[var(--bg)]">
      <header className="flex justify-between items-center max-w-[1120px] mx-auto w-full pt-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base text-[var(--ink)]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
          <span>MiniPM</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex items-center justify-center py-12">
        <Suspense fallback={<div className="w-[400px] h-[420px] bg-[var(--surface)] rounded-2xl border border-[var(--border)] animate-skeleton" />}>
          <SignupForm />
        </Suspense>
      </main>

      <footer className="text-center text-xs text-[var(--ink-3)] pb-4">
        Crafted for precise, focused project management.
      </footer>
    </div>
  );
}
