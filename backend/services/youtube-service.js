const { youtubeApiKey, youtubeApiUrl } = require("../config");

async function searchYouTubeVideos(query, maxResults = "1") {
  if (!youtubeApiKey) {
    const error = new Error("YOUTUBE_API_KEY is not configured on the backend.");
    error.statusCode = 500;
    throw error;
  }

  const url = new URL(youtubeApiUrl);
  url.search = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: String(maxResults || "1"),
    q: query,
    key: youtubeApiKey
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      `YouTube API request failed with status ${response.status}: ${errorText}`
    );
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

module.exports = {
  searchYouTubeVideos
};
