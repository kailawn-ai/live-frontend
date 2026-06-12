import { AdminShell } from "./admin-shell";

export function AdminStatus() {
  return (
    <AdminShell eyebrow="Admin / Status" title="Live Status">
      <section class="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black">
        <h2 class="text-2xl font-black text-white">Live monitor</h2>
        <p class="mt-3 max-w-2xl text-slate-300">
          This page will show which streams are live, offline, or disabled after
          RTMP publish callbacks update the backend.
        </p>
      </section>
    </AdminShell>
  );
}
