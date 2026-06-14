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

      if (shouldRedirectToExternalPlayer(liveStream.hlsUrl)) {
        setMessage("Opening live stream...");
        window.location.replace(liveStream.hlsUrl);
        return true;
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
    <div class="watch-loading-page">
      <p class="watch-loading-message">
        {message}
      </p>
    </div>
  );
}

function shouldRedirectToExternalPlayer(src: string) {
  try {
    const url = new URL(src);
    return url.hostname === "player.castr.com";
  } catch {
    return false;
  }
}
