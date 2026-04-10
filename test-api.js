const dotenv = require("dotenv");

dotenv.config();

function getBaseUrl() {
  return (process.env.BACKEND_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
}

async function validateHealth(baseUrl) {
  const response = await fetch(`${baseUrl}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}.`);
  }

  const payload = await response.json();
  if (payload.status !== "ok") {
    throw new Error("Health check did not return status ok.");
  }
}

async function validateRecipeEndpoint(baseUrl) {
  const response = await fetch(`${baseUrl}/api/recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt:
        "Create a simple vegetarian Indian recipe using potato, peas, cumin, onion, tomato, turmeric, and salt."
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Recipe endpoint failed with status ${response.status}: ${errorText}`
    );
  }

  const payload = await response.json();
  if (!payload.recipe || typeof payload.recipe !== "object") {
    throw new Error("Recipe endpoint did not return a recipe object.");
  }

  if (
    !Array.isArray(payload.recipe.ingredients) ||
    !Array.isArray(payload.recipe.instructions)
  ) {
    throw new Error("Recipe endpoint returned an invalid recipe structure.");
  }
}

async function validateYoutubeEndpoint(baseUrl) {
  const url = new URL(`${baseUrl}/api/youtube-search`);
  url.search = new URLSearchParams({
    q: process.env.YOUTUBE_SEARCH_QUERY || "Paneer Butter Masala recipe",
    maxResults: "1"
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `YouTube endpoint failed with status ${response.status}: ${errorText}`
    );
  }

  const payload = await response.json();
  if (!Array.isArray(payload.items)) {
    throw new Error("YouTube endpoint did not return an items array.");
  }
}

async function main() {
  const baseUrl = getBaseUrl();
  await validateHealth(baseUrl);
  await validateRecipeEndpoint(baseUrl);
  await validateYoutubeEndpoint(baseUrl);
  console.log("All backend API validations passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
