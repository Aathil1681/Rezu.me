// list-models.js
require("dotenv").config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API Key found in .env");
    return;
  }

  console.log(`Checking models for key ending in ...${apiKey.slice(-4)}`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    if (!data.models) {
      console.log("⚠️ No models found.");
      return;
    }

    console.log("\n✅ SUCCESS! Here are your available models:");
    const available = data.models
      .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));

    console.log(available);
  } catch (error) {
    console.error("Network error:", error);
  }
}

listModels();
