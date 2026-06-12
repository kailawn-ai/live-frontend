import { useEffect, useState } from "preact/hooks";
import { ApiError } from "../../lib/api-client";
import type { AuthUser } from "../../services/auth-service";
import { createUser, deleteUser, getUsers, updateUser } from "../../services/user-service";
import { AdminShell } from "./admin-shell";

export function AdminUsers() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [status, setStatus] = useState<"allowed" | "blocked">("allowed");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSave = email.includes("@") && (editingUserId ? true : password.length >= 6);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setUsers(await getUsers());
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load users.");
    }
  }

  async function submitUser(event: Event) {
    event.preventDefault();

    if (!canSave) {
      setMessage(
        editingUserId
          ? "Enter a valid email."
          : "Enter a valid email and password with at least 6 characters.",
      );
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const payload = { email, password, role, status };
      const user = editingUserId
        ? await updateUser(editingUserId, payload)
        : await createUser(payload);

      setUsers((currentUsers) =>
        editingUserId
          ? currentUsers.map((currentUser) =>
              currentUser.id === user.id ? user : currentUser,
            )
          : [user, ...currentUsers],
      );
      resetForm();
      setMessage(editingUserId ? "User updated successfully." : "User added successfully.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to add user.");
    } finally {
      setIsSaving(false);
    }
  }

  function editUser(user: AuthUser) {
    setEditingUserId(user.id);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setStatus(user.status);
    setMessage("");
  }

  function resetForm() {
    setEditingUserId(null);
    setEmail("");
    setPassword("");
    setRole("user");
    setStatus("allowed");
  }

  async function removeUser(user: AuthUser) {
    setMessage("");

    try {
      await deleteUser(user.id);
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));

      if (editingUserId === user.id) {
        resetForm();
      }

      setMessage("User deleted successfully.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to delete user.");
    }
  }

  return (
    <AdminShell eyebrow="Admin / Users" title="Manage Users">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          onSubmit={submitUser}
          class="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black"
        >
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-black text-white">
              {editingUserId ? "Edit user" : "Add allowed email"}
            </h2>
            {editingUserId && (
              <button
                type="button"
                onClick={resetForm}
                class="rounded-md border border-slate-600 px-3 py-2 text-sm font-bold text-slate-100 transition hover:border-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
              >
                Cancel
              </button>
            )}
          </div>

          <div class="mt-6">
            <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
              Email
            </label>
            <input
              value={email}
              onInput={(event) =>
                setEmail((event.currentTarget as HTMLInputElement).value)
              }
              type="email"
              placeholder="viewer@example.com"
              class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            />
          </div>

          <div class="mt-4">
            <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <input
              value={password}
              onInput={(event) =>
                setPassword((event.currentTarget as HTMLInputElement).value)
              }
              type="password"
              placeholder={editingUserId ? "Leave empty to keep current" : "Minimum 6 characters"}
              class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            />
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
                Role
              </label>
              <select
                value={role}
                onChange={(event) =>
                  setRole((event.currentTarget as HTMLSelectElement).value as "user" | "admin")
                }
                class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-3 font-bold text-white outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    (event.currentTarget as HTMLSelectElement).value as "allowed" | "blocked",
                  )
                }
                class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-3 font-bold text-white outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
              >
                <option value="allowed">Allowed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {message && (
            <p class="mt-5 rounded-md border border-teal-500 bg-slate-950 px-4 py-3 text-sm font-semibold text-teal-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSave || isSaving}
            class="mt-5 h-12 w-full rounded-md bg-teal-400 px-6 font-black text-slate-950 transition hover:bg-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSaving
              ? editingUserId
                ? "Updating..."
                : "Adding..."
              : editingUserId
                ? "Update User"
                : "Add User"}
          </button>
        </form>

        <section class="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black">
          <h2 class="text-2xl font-black text-white">Users</h2>

          <div class="mt-5 space-y-3">
            {users.length ? (
              users.map((user) => (
                <article
                  key={user.id}
                  class="rounded-md border border-slate-700 bg-slate-950 p-4"
                >
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p class="font-bold text-white">{user.email}</p>
                      <p class="mt-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
                        {user.role} / {user.status}
                      </p>
                    </div>
                    <span class="rounded-md border border-slate-600 px-3 py-1 text-sm font-bold text-slate-200">
                      #{user.id}
                    </span>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editUser(user)}
                      class="h-10 rounded-md border border-slate-600 px-4 text-sm font-bold text-slate-100 transition hover:border-teal-300 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUser(user)}
                      class="h-10 rounded-md border border-red-500 px-4 text-sm font-bold text-red-200 transition hover:bg-red-950 focus:outline-none focus:ring-4 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p class="rounded-md border border-slate-700 bg-slate-950 px-4 py-5 text-slate-300">
                No users yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
