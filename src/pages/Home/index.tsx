import { useEffect, useState } from "preact/hooks";
import { ApiError } from "../../lib/api-client";
import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
  type AuthUser,
} from "../../services/auth-service";

export function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canLogin = email.includes("@") && password.length >= 6;

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const currentUser = await getCurrentUser();

      if (currentUser.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      setUser(currentUser);
      window.location.href = "/watch";
    } catch {
      logoutUser();
    }
  }

  async function login(event: Event) {
    event.preventDefault();

    if (!canLogin) {
      setMessage("Enter a valid email and password.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const loggedInUser = await loginUser(email, password);

      if (loggedInUser.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      setUser(loggedInUser);
      setPassword("");
      window.location.href = "/watch";
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to login right now.");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    logoutUser();
    setUser(null);
    setMessage("");
  }

  return (
    <div class="min-h-screen overflow-hidden bg-black px-6 py-6 text-white sm:px-10 lg:h-screen lg:min-h-0 lg:py-8">
      <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-start justify-center pt-4 sm:pt-8 lg:h-full lg:min-h-0 lg:items-center lg:pt-0">
        <section class="grid w-full max-w-md gap-6 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <div class="text-center lg:text-left">
            <p class="mb-3 text-sm font-bold uppercase tracking-widest text-teal-300">
              Stream-App
            </p>
            <h1 class="mx-auto max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:mx-0 lg:text-5xl">
              Sign in to watch live matches.
            </h1>
            <p class="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-300 lg:mx-0 lg:text-lg">
              Enter your email and password to continue into the app.
            </p>
          </div>

          <form
            onSubmit={login}
            class="rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl shadow-black sm:p-6"
          >
            {user ? (
              <div>
                <div class="mb-4 rounded-md border border-teal-500 bg-slate-950 px-4 py-3">
                  <p class="text-sm font-bold uppercase tracking-wider text-teal-300">
                    Signed in
                  </p>
                  <p class="mt-1 text-lg font-bold text-white">{user.email}</p>
                </div>

                <a
                  href="/watch"
                  class="block rounded-md border border-slate-700 bg-slate-950 p-4 text-left transition hover:border-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-300"
                >
                  <p class="text-xs font-black uppercase tracking-widest text-teal-300">
                    Player
                  </p>
                  <h2 class="mt-2 text-xl font-black text-white">Open live stream</h2>
                  <p class="mt-1 text-slate-300">
                    The player will start automatically when a stream is live.
                  </p>
                </a>

                <button
                  type="button"
                  onClick={logout}
                  class="mt-4 h-12 w-full rounded-md border border-slate-600 px-5 font-bold text-slate-100 transition hover:border-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <div class="mb-4">
                  <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
                    Email
                  </label>
                  <input
                    value={email}
                    onInput={(event) =>
                      setEmail((event.currentTarget as HTMLInputElement).value)
                    }
                    type="email"
                    inputMode="email"
                    autocomplete="email"
                    placeholder="you@example.com"
                    class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 text-base font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300 lg:h-14 lg:text-lg"
                  />
                </div>

                <div class="mb-4">
                  <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <input
                    value={password}
                    onInput={(event) =>
                      setPassword((event.currentTarget as HTMLInputElement).value)
                    }
                    type="password"
                    autocomplete="current-password"
                    placeholder="Enter password"
                    class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 text-base font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300 lg:h-14 lg:text-lg"
                  />
                </div>

                {message && (
                  <p class="mb-4 rounded-md border border-teal-500 bg-slate-950 px-4 py-3 text-sm font-semibold text-teal-200">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canLogin || isLoading}
                  class="h-12 w-full rounded-md bg-teal-400 px-6 text-base font-black text-slate-950 transition hover:bg-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 lg:h-14 lg:text-lg"
                >
                  {isLoading ? "Signing in..." : "Login"}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
