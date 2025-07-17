const currentPath = window.location.pathname;
const isPublicPage = currentPath.includes("signup.html") || currentPath.includes("login.html");


if (!isPublicPage) {
  document.addEventListener("DOMContentLoaded", async () => {
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    try {
      const [trendingRes, watchAgainRes, popularRes] = await Promise.all([
        fetch("http://localhost:5000/api/movies/trending"),
        fetch("http://localhost:5000/api/movies/topRated"),
        fetch("http://localhost:5000/api/movies/popular")
      ]);

      const [trending, watchAgain, popular] = await Promise.all([
        trendingRes.json(),
        watchAgainRes.json(),
        popularRes.json()
      ]);

      populateMovies("trending-carousel", trending.results);
      populateMovies("watch-again-carousel", watchAgain.results);
      populateMovies("popular-carousel", popular.results);
    } catch (err) {
      console.error("Movie fetch failed:", err);
    }
  });
}

function populateMovies(containerId, movies) {
  const container = document.getElementById(containerId);
  if (!container || !movies || !Array.isArray(movies)) return;

  container.innerHTML = movies.slice(0, 10).map(movie => `
    <div class="flex-shrink-0 w-48 cursor-pointer movie-card">
      <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <img 
          src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
          alt="${movie.title}" 
          class="w-full h-72 object-cover"
          loading="lazy"
        >
        <div class="p-3">
          <p class="text-sm text-gray-300">${movie.title}</p>
        </div>
      </div>
    </div>
  `).join("");


}
