import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ApiError } from "../../lib/api-client";
import {
  getCurrentUser,
  logout as logoutUser,
  type AuthUser,
} from "../../services/auth-service";

type AdminShellProps = {
  eyebrow?: string;
  title: string;
  children: ComponentChildren;
};

export function AdminShell(props: AdminShellProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("Checking admin access...");

  useEffect(() => {
    verifyAdmin();
  }, []);

  async function verifyAdmin() {
    try {
      const currentUser = await getCurrentUser();

      if (currentUser.role !== "admin") {
        setMessage("Admin access only.");
        window.location.href = "/";
        return;
      }

      setUser(currentUser);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Please login again.",
      );
      logoutUser();
      window.location.href = "/";
    }
  }

  function logout() {
    logoutUser();
    window.location.href = "/";
  }

  if (!user) {
    return (
      <div class="min-h-screen bg-black px-6 py-10 text-white">
        <div class="mx-auto flex min-h-screen max-w-4xl items-center justify-center">
          <p class="rounded-md border border-slate-700 bg-slate-900 px-6 py-4 text-lg font-bold text-slate-200">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-black px-6 py-10 text-white sm:px-10">
      <div class="mx-auto max-w-6xl">
        <header class="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <a
              href="/admin"
              class="text-sm font-black uppercase tracking-widest text-teal-300"
            >
              {props.eyebrow || "Admin"}
            </a>
            <h1 class="mt-2 text-4xl font-black text-white">{props.title}</h1>
          </div>

          <button
            type="button"
            onClick={logout}
            class="h-12 rounded-md border border-slate-600 px-5 font-bold text-slate-100 transition hover:border-slate-300 hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-300"
          >
            Logout
          </button>
        </header>

        <div class="mt-10 grid gap-6">
          <div>{props.children}</div>
        </div>
      </div>
    </div>
  );
}
