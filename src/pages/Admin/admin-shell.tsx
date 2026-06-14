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
      <div class="admin-page">
        <div class="admin-loading-shell">
          <p class="admin-loading-message">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class="admin-page">
      <div class="admin-shell">
        <header class="admin-header">
          <div>
            <a
              href="/admin"
              class="admin-eyebrow"
            >
              {props.eyebrow || "Admin"}
            </a>
            <h1 class="admin-title">{props.title}</h1>
          </div>

          <button
            type="button"
            onClick={logout}
            class="secondary-button admin-logout-button"
          >
            Logout
          </button>
        </header>

        <div class="admin-content">
          <div>{props.children}</div>
        </div>
      </div>
    </div>
  );
}
