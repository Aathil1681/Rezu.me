const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Ensure you have 'dotenv' installed: npm install dotenv

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Checking available models for your API key...");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // There is no direct "listModels" on the client instance in all SDK versions,
    // but we can try to fetch a dummy response to see specific errors or permissions.
    console.log("Attempting to connect with 'gemini-1.5-flash'...");

    // We try a simple prompt to verify connectivity
    const result = await model.generateContent("Test");
    console.log("✅ Success! 'gemini-1.5-flash' is working.");
  } catch (error) {
    console.error("❌ Model failed:", error.message);
    console.log("\n--- TROUBLESHOOTING ---");
    if (error.message.includes("404")) {
      console.log(
        "1. Your API Key might be for Vertex AI (Google Cloud) instead of AI Studio.",
      );
      console.log(
        "   -> If so, you need the '@google-cloud/vertexai' package, not '@google/generative-ai'.",
      );
      console.log(
        "2. Your project might not have the 'Generative Language API' enabled.",
      );
      console.log("   -> Go to console.cloud.google.com and enable that API.");
    }
  }
}

main();
