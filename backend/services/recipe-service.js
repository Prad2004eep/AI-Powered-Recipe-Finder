const { recipeApiKey, recipeApiModel, recipeApiUrl } = require("../config");

function buildRecipeMessages(prompt) {
  const schemaInstruction = [
    "Return exactly one valid JSON object.",
    "Do not include markdown, comments, trailing commas, fractions, or explanatory text.",
    "Use this exact schema:",
    "{",
    '  "title": "string",',
    '  "description": "string",',
    '  "prepTime": 15,',
    '  "cookTime": 30,',
    '  "totalTime": 45,',
    '  "servings": 4,',
    '  "difficulty": "easy | medium | hard",',
    '  "ingredients": ["string", "string"],',
    '  "instructions": ["string", "string"],',
    '  "tips": "string",',
    '  "nutrition": {',
    '    "calories": 350,',
    '    "protein": 20,',
    '    "carbs": 30,',
    '    "fat": 10,',
    '    "fiber": 5',
    "  }",
    "}",
    "All numeric fields must be JSON numbers.",
    "Ingredients and instructions must be arrays of plain strings only."
  ].join("\n");

  return [
    {
      role: "system",
      content:
        "You are an expert Indian chef who creates authentic Indian recipes. Follow the requested JSON schema exactly."
    },
    {
      role: "user",
      content: `${schemaInstruction}\n\nRecipe request:\n${prompt}`
    }
  ];
}

async function generateRecipe(prompt) {
  if (!recipeApiKey) {
    const error = new Error("RECIPE_API_KEY is not configured on the backend.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(recipeApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${recipeApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: recipeApiModel,
      messages: buildRecipeMessages(prompt),
      temperature: 0.2,
      max_tokens: 900,
      response_format: {
        type: "json_object"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      `Recipe API request failed with status ${response.status}: ${errorText}`
    );
    error.statusCode = response.status;
    throw error;
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    const error = new Error("Recipe API response did not contain message content.");
    error.statusCode = 502;
    throw error;
  }

  const recipe = JSON.parse(content);
  return {
    recipe,
    raw: payload
  };
}

module.exports = {
  generateRecipe
};
