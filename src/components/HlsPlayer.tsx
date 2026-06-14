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
  const isEmbedPlayer = shouldUseEmbedPlayer(props.src);

  useEffect(() => {
    if (isEmbedPlayer) return;

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
  }, [isEmbedPlayer, props.src]);

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

  if (isEmbedPlayer) {
    return (
      <div
        ref={containerRef}
        class={`player-frame ${props.embedded ? "player-frame-embedded" : "player-frame-full"}`}
      >
        <iframe
          class="player-iframe"
          src={props.src}
          title={props.title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />

        <button
          type="button"
          onClick={logout}
          class={`player-control-button player-logout-button ${
            props.showLogout === false ? "is-hidden" : ""
          }`}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      class={`player-frame ${props.embedded ? "player-frame-embedded" : "player-frame-full"}`}
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
        class="player-video"
        autoPlay
        playsInline
        title={props.title}
      />

      <button
        type="button"
        onClick={logout}
        class={`player-control-button player-logout-button ${
          showControls ? "is-visible" : "is-faded"
        } ${props.showLogout === false ? "is-hidden" : ""}`}
      >
        Logout
      </button>

      <button
        type="button"
        onClick={toggleFullscreen}
        class={`player-control-button player-fullscreen-button ${
          showControls ? "is-visible" : "is-faded"
        }`}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
      </button>

      {message && (
        <div class="player-message-layer">
          <p class="player-message">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

function shouldUseEmbedPlayer(src: string) {
  try {
    const url = new URL(src);
    return url.hostname === "player.castr.com" || !url.pathname.toLowerCase().endsWith(".m3u8");
  } catch {
    return false;
  }
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" class="player-icon" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" class="player-icon" aria-hidden="true">
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
