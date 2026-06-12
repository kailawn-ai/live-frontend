import { useEffect, useState } from "preact/hooks";
import { HlsPlayer } from "../../components/HlsPlayer";
import { ApiError } from "../../lib/api-client";
import { getCurrentUser, logout as logoutUser } from "../../services/auth-service";
import {
  getLiveStreams,
  getPublicStream,
  type LiveStream,
} from "../../services/stream-service";

export function Watch() {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [message, setMessage] = useState("Loading stream...");

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | undefined;

    async function pollStream() {
      const didFindStream = await loadStream(isActive);

      if (isActive && !didFindStream) {
        timeoutId = window.setTimeout(pollStream, 5000);
      }
    }

    pollStream();

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  async function loadStream(isActive = true) {
    const id = new URLSearchParams(window.location.search).get("id");

    try {
      await getCurrentUser();
      const liveStream = id ? await getPublicStream(id) : await getFirstLiveStream();

      if (!isActive) return true;

      if (!liveStream) {
        setMessage("No live stream available yet.");
        return false;
      }

      if (!liveStream.hlsUrl) {
        setMessage("No live stream available yet.");
        return false;
      }

      setStream(liveStream);
      setMessage("");
      return true;
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Please login again.");
      logoutUser();
      window.location.href = "/";
      return true;
    }
  }

  async function getFirstLiveStream() {
    const liveStreams = await getLiveStreams();
    return liveStreams[0] || null;
  }

  if (stream?.hlsUrl) {
    return <HlsPlayer src={stream.hlsUrl} title={stream.title} />;
  }

  return (
    <div class="flex h-screen w-screen items-center justify-center bg-black px-6 text-center text-white">
      <p class="rounded-md border border-slate-700 bg-slate-900 px-6 py-4 text-xl font-black">
        {message}
      </p>
    </div>
  );
}
