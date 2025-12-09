import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/models/resume";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Connect to DB
    await connectDB();

    // Select Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare Prompt
    const prompt = `Analyze this resume:
      ${text}

      Please provide:
      1. Missing Skills:
      2. Missing sections:
      3. Strong/Weak points:
      4. Improvements:`;

    // Generate Content
    const aiResult = await model.generateContent(prompt);
    const response = await aiResult.response;
    const resultText = response.text();

    // Save to Database
    await Resume.create({
      user: "anonymous-user",
      text,
      skillsDetected: [], // You could ask AI to extract these separately if needed
      suggestions: [resultText],
    });

    return NextResponse.json({ analysis: resultText });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 },
    );
  }
}
