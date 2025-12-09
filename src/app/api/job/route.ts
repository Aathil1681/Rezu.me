import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { jd } = await req.json();

    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
Analyze this Job Description:
"""
${jd}
"""

Return a structured JSON with:

{
  "role": "",
  "key_requirements": [],
  "required_skills": [],
  "missing_candidate_skills": [],
  "recommended_improvements": []
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return NextResponse.json(JSON.parse(response.text()));
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to analyze job description" },
      { status: 500 },
    );
  }
}
