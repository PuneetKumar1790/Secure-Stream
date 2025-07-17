document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(" http://127.0.0.1:5000/api/stream/social", {
      method: "GET",
      credentials: "include", // Important
    });

    if (!res.ok) {
      const errorData = await res.json(); 
      console.error("Server Error:", errorData); 
      alert("You must be logged in to access the stream.\n" + errorData.message); 
      window.location.href = "http://127.0.0.1:5500/secure-stream-frontend/login.html";
      return;
    }

    const { playlist } = await res.json();
    const video = document.getElementById("video-player");

    if (!video) {
      console.error("🎥 Video element not found!");
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playlist);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlist;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    } else {
      alert("Your browser doesn't support HLS streaming.");
    }

    // Auto-expire
    setTimeout(() => {
      video.pause();
      video.src = "";
      alert("⛔ Secure stream expired after 10 minutes.");
    }, 10 * 60 * 1000);
  } catch (err) {
    console.error("Error streaming video:", err);
    alert("Streaming failed. Try again later.");
  }
//Log out
document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      alert(" Logged out successfully.");
      window.location.href = "login.html";
    } else {
      const data = await res.json();
      alert("Logout failed: " + data.message);
    }
  } catch (err) {
    console.error("Logout Error:", err);
    alert("Something went wrong during logout.");
  }
});


});
