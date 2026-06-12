import { useEffect, useState } from "preact/hooks";
import { ApiError } from "../../lib/api-client";
import {
  createStream,
  getAdminStreams,
  type AdminStream,
  updateStream,
} from "../../services/stream-service";
import { AdminShell } from "./admin-shell";

export function AdminStreams() {
  const [title, setTitle] = useState("");
  const [teams, setTeams] = useState("");
  const [description, setDescription] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [hlsUrl, setHlsUrl] = useState("");
  const [status, setStatus] = useState<"offline" | "live" | "disabled">("offline");
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [streams, setStreams] = useState<AdminStream[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canCreate = title.trim().length > 0;

  useEffect(() => {
    loadStreams();
  }, []);

  async function loadStreams() {
    try {
      setStreams(await getAdminStreams());
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load streams.");
    }
  }

  async function submitStream(event: Event) {
    event.preventDefault();

    if (!canCreate) {
      setMessage("Enter a stream title.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const payload = {
        title,
        teams,
        description,
        streamKey,
        hlsUrl,
        status,
      };

      const stream = editingStreamId
        ? await updateStream(editingStreamId, payload)
        : await createStream(payload);

      setStreams((currentStreams) =>
        editingStreamId
          ? currentStreams.map((currentStream) =>
              currentStream.id === stream.id ? stream : currentStream,
            )
          : [stream, ...currentStreams],
      );
      resetForm();
      setMessage(
        editingStreamId
          ? "Stream updated successfully."
          : "Stream created. Copy the stream key into OBS.",
      );
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to create stream.");
    } finally {
      setIsSaving(false);
    }
  }

  function editStream(stream: AdminStream) {
    setEditingStreamId(stream.id);
    setTitle(stream.title);
    setTeams(stream.teams || "");
    setDescription(stream.description || "");
    setStreamKey(stream.streamKey);
    setHlsUrl(stream.hlsUrl);
    setStatus(stream.status);
    setMessage("");
  }

  function resetForm() {
    setEditingStreamId(null);
    setTitle("");
    setTeams("");
    setDescription("");
    setStreamKey("");
    setHlsUrl("");
    setStatus("offline");
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setMessage("Copied.");
  }

  return (
    <AdminShell eyebrow="Admin / Streams" title="Manage Streams">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          onSubmit={submitStream}
          class="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black"
        >
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-black text-white">
              {editingStreamId ? "Edit stream" : "Create stream"}
            </h2>
            {editingStreamId && (
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
              Title
            </label>
            <input
              value={title}
              onInput={(event) =>
                setTitle((event.currentTarget as HTMLInputElement).value)
              }
              type="text"
              placeholder="Opening Match"
              class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            />
          </div>

          <div class="mt-4">
            <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
              Teams
            </label>
            <input
              value={teams}
              onInput={(event) =>
                setTeams((event.currentTarget as HTMLInputElement).value)
              }
              type="text"
              placeholder="Team A vs Team B"
              class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            />
          </div>

          <div class="mt-4">
            <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
              Description
            </label>
            <textarea
              value={description}
              onInput={(event) =>
                setDescription((event.currentTarget as HTMLTextAreaElement).value)
              }
              placeholder="Optional match note"
              class="min-h-24 w-full resize-none rounded-md border border-slate-700 bg-slate-950 px-4 py-3 font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            />
          </div>

          <div class="mt-4">
            <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
              OBS Stream Key
            </label>
            <input
              value={streamKey}
              onInput={(event) =>
                setStreamKey((event.currentTarget as HTMLInputElement).value)
              }
              type="text"
              placeholder="Leave empty to auto-generate"
              class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            />
          </div>

          <div class="mt-4">
            <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
              HLS URL
            </label>
            <input
              value={hlsUrl}
              onInput={(event) =>
                setHlsUrl((event.currentTarget as HTMLInputElement).value)
              }
              type="url"
              placeholder="Leave empty to derive from HLS_BASE_URL"
              class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-4 font-bold text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            />
          </div>

          <div class="mt-4">
            <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-300">
              Status
            </label>
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  (event.currentTarget as HTMLSelectElement).value as
                    | "offline"
                    | "live"
                    | "disabled",
                )
              }
              class="h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-3 font-bold text-white outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300"
            >
              <option value="offline">Offline</option>
              <option value="live">Live</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {message && (
            <p class="mt-5 rounded-md border border-teal-500 bg-slate-950 px-4 py-3 text-sm font-semibold text-teal-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={!canCreate || isSaving}
            class="mt-5 h-12 w-full rounded-md bg-teal-400 px-6 font-black text-slate-950 transition hover:bg-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSaving
              ? editingStreamId
                ? "Updating..."
                : "Creating..."
              : editingStreamId
                ? "Update Stream"
                : "Create Stream"}
          </button>
        </form>

        <section class="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black">
          <h2 class="text-2xl font-black text-white">OBS stream keys</h2>

          <div class="mt-5 space-y-3">
            {streams.length ? (
              streams.map((stream) => (
                <article
                  key={stream.id}
                  class="rounded-md border border-slate-700 bg-slate-950 p-4"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="font-bold text-white">{stream.title}</p>
                      {stream.teams && (
                        <p class="mt-1 text-sm font-semibold text-slate-300">
                          {stream.teams}
                        </p>
                      )}
                      <p class="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                        {stream.status}
                      </p>
                    </div>
                    <span class="rounded-md border border-slate-600 px-3 py-1 text-sm font-bold text-slate-200">
                      {stream.id}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => editStream(stream)}
                    class="mt-4 h-10 rounded-md border border-slate-600 px-4 text-sm font-bold text-slate-100 transition hover:border-teal-300 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
                  >
                    Edit
                  </button>

                  <div class="mt-4 space-y-3">
                    <KeyRow
                      label="OBS Stream Key"
                      value={stream.streamKey}
                      onCopy={() => copyText(stream.streamKey)}
                    />
                    <KeyRow
                      label="HLS URL"
                      value={stream.hlsUrl}
                      onCopy={() => copyText(stream.hlsUrl)}
                    />
                  </div>
                </article>
              ))
            ) : (
              <p class="rounded-md border border-slate-700 bg-slate-950 px-4 py-5 text-slate-300">
                No streams yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

type KeyRowProps = {
  label: string;
  value: string;
  onCopy: () => void;
};

function KeyRow(props: KeyRowProps) {
  return (
    <div>
      <p class="mb-1 text-xs font-black uppercase tracking-widest text-teal-300">
        {props.label}
      </p>
      <div class="flex gap-2">
        <code class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-slate-700 bg-black px-3 py-2 text-sm font-bold text-slate-200">
          {props.value}
        </code>
        <button
          type="button"
          onClick={props.onCopy}
          class="rounded-md border border-slate-600 px-3 text-sm font-bold text-slate-100 transition hover:border-teal-300 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
