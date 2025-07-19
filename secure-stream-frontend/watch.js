document.addEventListener("DOMContentLoaded", async () => {
  const video = document.getElementById("video-player");
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    alert("❌ Missing video ID");
    return;
  }

  try {
    const playlistUrl = `http://127.0.0.1:5000/api/stream/${id}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: function (xhr, url) {
          xhr.withCredentials = true;
        },
      });

      hls.loadSource(playlistUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(" HLS Error:", data);

        if (data.details === "manifestLoadError" || data.response?.status === 403) {
          alert(" Stream expired. Please reload or purchase full access.");
          hls.destroy();
          video.pause();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlistUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    } else {
      alert(" HLS not supported on this browser");
    }
  } catch (err) {
    console.error(" Streaming error:", err);
    alert(" Streaming failed.");
  }

  const stopAfterSeconds = 600; // 10 minutes

  video.addEventListener("timeupdate", () => {
    if (video.currentTime >= stopAfterSeconds) {
      video.pause();
      video.currentTime = stopAfterSeconds;
      alert(" Trial expired. Purchase to continue watching.");
    }
  });

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        alert(" Logged out.");
        window.location.href = "login.html";
      } else {
        const data = await res.json();
        alert(" Logout failed: " + data.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong during logout.");
    }
  });
});
