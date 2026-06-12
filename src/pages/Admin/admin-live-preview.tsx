import { useLocation } from "preact-iso";
import { useEffect, useRef, useState } from "preact/hooks";
import { HlsPlayer } from "../../components/HlsPlayer";
import { getLiveStreams, type LiveStream } from "../../services/stream-service";

type Position = {
  x: number;
  y: number;
};

export function AdminLivePreview() {
  const { url } = useLocation();
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [message, setMessage] = useState("Checking live stream...");
  const [position, setPosition] = useState<Position>(() => getDefaultPosition());
  const [isDragging, setIsDragging] = useState(false);

  const isAdminRoute = url === "/admin" || url.startsWith("/admin/");

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | undefined;

    async function pollStream() {
      try {
        const streams = await getLiveStreams();
        const liveStream = streams[0] || null;

        if (!isActive) return;

        setStream(liveStream);
        setMessage(liveStream ? "" : "No live stream available yet.");
      } catch {
        if (isActive) {
          setMessage("Unable to load live preview.");
        }
      }

      if (isActive) {
        timeoutId = window.setTimeout(pollStream, 5000);
      }
    }

    pollStream();

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    function handlePointerMove(event: PointerEvent) {
      setPosition({
        x: clamp(event.clientX - dragOffsetRef.current.x, 12, window.innerWidth - 332),
        y: clamp(event.clientY - dragOffsetRef.current.y, 12, window.innerHeight - 230),
      });
    }

    function handlePointerUp() {
      setIsDragging(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  if (!isAdminRoute) {
    return null;
  }

  return (
    <div
      class="fixed z-50 w-80 text-white"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <section
        class="rounded-md border border-slate-700 bg-slate-900 p-3 shadow-xl shadow-black"
      >
        <div
          class="mb-3 flex cursor-move flex-wrap items-center justify-between gap-3"
          onPointerDown={(event) => {
            dragOffsetRef.current = {
              x: event.clientX - position.x,
              y: event.clientY - position.y,
            };
            setIsDragging(true);
          }}
        >
          <div>
            <p class="text-xs font-black uppercase tracking-widest text-teal-300">
              Live Preview
            </p>
            <h2 class="mt-1 text-base font-black text-white">
              {stream?.title || "Player"}
            </h2>
          </div>
          {stream?.status && (
            <span class="rounded-md border border-teal-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-200">
              {stream.status}
            </span>
          )}
        </div>

        <div class="aspect-video overflow-hidden rounded-md border border-slate-800 bg-black">
          {stream?.hlsUrl ? (
            <HlsPlayer
              src={stream.hlsUrl}
              title={stream.title}
              embedded
              showLogout={false}
            />
          ) : (
            <div class="flex h-full w-full items-center justify-center px-4 text-center">
              <p class="text-sm font-bold text-slate-300">{message}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getDefaultPosition(): Position {
  if (typeof window === "undefined") {
    return { x: 24, y: 24 };
  }

  return {
    x: Math.max(12, window.innerWidth - 344),
    y: Math.max(12, window.innerHeight - 244),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
