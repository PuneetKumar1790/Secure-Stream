import express from "express";
import fetch from "node-fetch";
import https from "https";

const router = express.Router();
const agent = new https.Agent({ keepAlive: true });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const endpoints = {
  trending: "/trending/movie/week",
  popular: "/movie/popular",
  topRated: "/movie/top_rated"
};

router.get("/:type", async (req, res) => {
  const { type } = req.params;
  const tmdbPath = endpoints[type];
  if (!tmdbPath) return res.status(400).json({ error: "Invalid movie category" });

  const tmdbUrl = `${TMDB_BASE_URL}${tmdbPath}?api_key=${TMDB_API_KEY}`;

  try {
    const response = await fetch(tmdbUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SecureStream-Server",
        "Accept": "application/json"
      },
      agent
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: "TMDB error"});
    }

    const data = await response.json();
    res.json({ results: data.results });

  } catch (err) {
    console.error(` TMDB fetch error [${type}]:`);
    res.status(500).json({ error: "TMDB fetch failed", });
  }
});

export default router;
