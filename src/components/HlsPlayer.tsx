import { useEffect, useRef, useState } from "preact/hooks";
import { logout as logoutUser } from "../services/auth-service";

type HlsConstructor = {
  isSupported: () => boolean;
  new (): {
    loadSource: (source: string) => void;
    attachMedia: (media: HTMLVideoElement) => void;
    destroy: () => void;
  };
};

declare global {
  interface Window {
    Hls?: HlsConstructor;
  }
}

type HlsPlayerProps = {
  src: string;
  title: string;
  embedded?: boolean;
  showLogout?: boolean;
};

export function HlsPlayer(props: HlsPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<number | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Loading live stream...");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let hls: InstanceType<HlsConstructor> | null = null;
    let isActive = true;

    async function setupPlayer() {
      const video = videoRef.current;

      if (!video) return;

      setMessage("Loading live stream...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = props.src;
        await playVideo(video);
        return;
      }

      const Hls = await loadHls();

      if (!isActive || !Hls?.isSupported()) {
        setMessage("This browser cannot play this live stream.");
        return;
      }

      hls = new Hls();
      hls.loadSource(props.src);
      hls.attachMedia(video);
      await playVideo(video);
    }

    setupPlayer();

    return () => {
      isActive = false;
      hls?.destroy();
    };
  }, [props.src]);

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    showControlsTemporarily();

    return () => {
      window.clearTimeout(hideControlsTimeoutRef.current);
    };
  }, []);

  async function playVideo(video: HTMLVideoElement) {
    try {
      await video.play();
      setMessage("");
    } catch {
      setMessage("Press OK or Enter to start playback.");
    }
  }

  function startPlayback() {
    const video = videoRef.current;

    if (video) {
      playVideo(video);
    }
  }

  function showControlsTemporarily() {
    setShowControls(true);
    window.clearTimeout(hideControlsTimeoutRef.current);

    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }

  async function toggleFullscreen(event: Event) {
    event.stopPropagation();
    showControlsTemporarily();

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await containerRef.current?.requestFullscreen();
  }

  function logout(event: Event) {
    event.stopPropagation();
    logoutUser();
    window.location.href = "/";
  }

  return (
    <div
      ref={containerRef}
      class={`relative bg-black ${props.embedded ? "h-full w-full" : "h-screen w-screen"}`}
      onClick={() => {
        showControlsTemporarily();
        startPlayback();
      }}
      onMouseMove={showControlsTemporarily}
      onKeyDown={(event) => {
        showControlsTemporarily();

        if (event.key === "Enter" || event.key === " ") {
          startPlayback();
        }
      }}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        class="h-full w-full bg-black object-contain"
        autoPlay
        playsInline
        title={props.title}
      />

      <button
        type="button"
        onClick={logout}
        class={`absolute right-5 top-5 z-20 rounded-md border border-white/30 bg-black/70 px-4 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-teal-300 hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        } ${props.showLogout === false ? "hidden" : ""}`}
      >
        Logout
      </button>

      <button
        type="button"
        onClick={toggleFullscreen}
        class={`absolute bottom-5 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-md border border-white/30 bg-black/70 text-white transition hover:border-teal-300 hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
      </button>

      {message && (
        <div class="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center">
          <p class="rounded-md border border-slate-700 bg-slate-900 px-6 py-4 text-xl font-black text-white">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
      <path
        d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>
  );
}

function loadHls(): Promise<HlsConstructor | undefined> {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.async = true;
    script.onload = () => resolve(window.Hls);
    script.onerror = () => reject(new Error("Unable to load hls.js."));
    document.head.appendChild(script);
  });
}
