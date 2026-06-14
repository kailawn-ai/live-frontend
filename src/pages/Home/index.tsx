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
    <div class="home-page">
      <div class="home-shell">
        <section class="home-layout">
          <div class="home-copy">
            <p class="home-eyebrow">
              Stream-App
            </p>
            <h1 class="home-title">
              Sign in to watch live matches.
            </h1>
            <p class="home-subtitle">
              Enter your email and password to continue into the app.
            </p>
          </div>

          <form
            onSubmit={login}
            class="login-card"
          >
            {user ? (
              <div>
                <div class="login-status">
                  <p class="login-label">
                    Signed in
                  </p>
                  <p class="login-user-email">{user.email}</p>
                </div>

                <a
                  href="/watch"
                  class="watch-link"
                >
                  <p class="watch-eyebrow">
                    Player
                  </p>
                  <h2 class="watch-title">Open live stream</h2>
                  <p class="watch-copy">
                    The player will start automatically when a stream is live.
                  </p>
                </a>

                <button
                  type="button"
                  onClick={logout}
                  class="secondary-button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <div class="field-group">
                  <label class="login-label">
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
                    class="login-input"
                  />
                </div>

                <div class="field-group">
                  <label class="login-label">
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
                    class="login-input"
                  />
                </div>

                {message && (
                  <p class="login-message">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canLogin || isLoading}
                  class="primary-button"
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
