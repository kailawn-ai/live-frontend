import { AdminShell } from "./admin-shell";

export function Admin() {
  return (
    <AdminShell title="Stream Control">
      <section class="admin-card-grid">
        <AdminCard
          href="/admin/users"
          title="Users"
          value="Allowed emails"
          description="Create viewer accounts and block access when needed."
        />
        <AdminCard
          href="/admin/streams"
          title="Streams"
          value="OBS keys"
          description="Create live match records and copy stream keys for OBS."
        />
        <AdminCard
          href="/admin/status"
          title="Status"
          value="Live monitor"
          description="RTMP callbacks will update stream online/offline status."
        />
      </section>
    </AdminShell>
  );
}

type AdminCardProps = {
  href: string;
  title: string;
  value: string;
  description: string;
};

function AdminCard(props: AdminCardProps) {
  return (
    <a
      href={props.href}
      class="admin-card"
    >
      <p class="admin-card-eyebrow">
        {props.title}
      </p>
      <h2 class="admin-card-title">
        {props.value}
      </h2>
      <p class="admin-card-copy">{props.description}</p>
    </a>
  );
}
