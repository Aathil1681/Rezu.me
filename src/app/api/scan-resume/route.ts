import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText } = body;

    if (!resumeText) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI Career Coach. Extract data and provide a critical ATS score.",
        },
        {
          role: "user",
          content: `
            Analyze this resume text.
            
            Return strictly valid JSON (no markdown):
            {
              "fullName": "Name",
              "email": "Email",
              "summary": "Professional summary",
              "skills": ["Skill 1", "Skill 2"],
              "experience": [
                {
                  "company": "Company Name",
                  "role": "Role",
                  "duration": "Dates",
                  "description": "Short description"
                }
              ],
              "analysis": {
                "score": 85, // Rate the resume from 0-100 based on completeness and ATS friendliness
                "jobTitle": "Inferred Job Title",
                "missingSkills": ["Critical Skill 1", "Critical Skill 2"],
                "improvements": ["Actionable tip 1", "Actionable tip 2"],
                "interviewQuestions": ["Q1", "Q2", "Q3"]
              }
            }

            RESUME TEXT:
            ${resumeText.slice(0, 25000)}
          `,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    let rawContent = completion.choices[0]?.message?.content || "{}";
    rawContent = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const jsonOutput = JSON.parse(rawContent);

    return NextResponse.json({ output: jsonOutput });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Analysis failed. " + (error.message || "") },
      { status: 500 },
    );
  }
}
