const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env") });

function normalizeAllowedOrigins(value) {
  if (!value) {
    return ["*"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolvePublicApiBaseUrl() {
  if (process.env.API_PROXY_BASE_URL) {
    return process.env.API_PROXY_BASE_URL;
  }

  return "/api";
}

module.exports = {
  appEnv: process.env.APP_ENV || process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "3000", 10),
  allowedOrigins: normalizeAllowedOrigins(process.env.ALLOWED_ORIGINS),
  publicApiBaseUrl: resolvePublicApiBaseUrl(),
  recipeApiUrl:
    process.env.RECIPE_API_URL ||
    "https://api.groq.com/openai/v1/chat/completions",
  recipeApiKey: process.env.RECIPE_API_KEY || "",
  recipeApiModel: process.env.RECIPE_API_MODEL || "llama-3.1-8b-instant",
  youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
  youtubeApiUrl:
    process.env.YOUTUBE_API_URL ||
    "https://www.googleapis.com/youtube/v3/search"
};
