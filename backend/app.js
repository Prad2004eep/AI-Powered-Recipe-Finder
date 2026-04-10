const path = require("path");
const express = require("express");
const cors = require("cors");
const {
  allowedOrigins,
  appEnv,
  publicApiBaseUrl,
  recipeApiKey,
  youtubeApiKey
} = require("./config");
const { generateRecipe } = require("./services/recipe-service");
const { searchYouTubeVideos } = require("./services/youtube-service");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    }
  })
);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    appEnv,
    publicApiBaseUrl,
    checks: {
      recipeApiConfigured: Boolean(recipeApiKey),
      youtubeApiConfigured: Boolean(youtubeApiKey)
    }
  });
});

app.post("/api/recipe", async (request, response, next) => {
  try {
    const { prompt } = request.body || {};
    if (!prompt || typeof prompt !== "string") {
      response.status(400).json({ error: "A string prompt is required." });
      return;
    }

    const result = await generateRecipe(prompt);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/youtube-search", async (request, response, next) => {
  try {
    const query = request.query.q;
    const maxResults = request.query.maxResults || "1";

    if (!query || typeof query !== "string") {
      response.status(400).json({ error: "A search query is required." });
      return;
    }

    const result = await searchYouTubeVideos(query, maxResults);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(process.cwd()));

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api/")) {
    next();
    return;
  }

  response.sendFile(path.join(process.cwd(), "index.html"));
});

app.use((error, _request, response) => {
  const statusCode = error.statusCode || 500;
  console.error(error);
  response.status(statusCode).json({
    error: error.message || "Unexpected server error."
  });
});

module.exports = app;
