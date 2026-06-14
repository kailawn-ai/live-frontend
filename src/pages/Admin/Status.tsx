import { AdminShell } from "./admin-shell";

export function AdminStatus() {
  return (
    <AdminShell eyebrow="Admin / Status" title="Live Status">
      <section class="admin-panel">
        <h2 class="admin-section-title">Live monitor</h2>
        <p class="admin-copy">
          This page will show which streams are live, offline, or disabled after
          RTMP publish callbacks update the backend.
        </p>
      </section>
    </AdminShell>
  );
}
