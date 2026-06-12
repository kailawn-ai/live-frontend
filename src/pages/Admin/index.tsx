import { AdminShell } from "./admin-shell";

export function Admin() {
  return (
    <AdminShell title="Stream Control">
      <section class="grid grid-cols-3 gap-3 md:gap-4">
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
      class="block rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl shadow-black transition hover:-translate-y-1 hover:border-teal-300 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-300 md:p-5"
    >
      <p class="text-xs font-black uppercase tracking-widest text-teal-300 md:text-sm">
        {props.title}
      </p>
      <h2 class="mt-2 text-base font-black text-white md:mt-3 md:text-2xl">
        {props.value}
      </h2>
      <p class="mt-3 hidden text-slate-300 md:block">{props.description}</p>
    </a>
  );
}
