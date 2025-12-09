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
            "You are an expert AI Career Coach and Resume Scanner. Your goal is to extract data AND provide critical feedback.",
        },
        {
          role: "user",
          content: `
            Analyze the following resume text deeply.
            
            Return the output in this strict JSON format:
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
                "jobTitle": "Inferred Job Title (e.g. Senior Backend Engineer)",
                "missingSkills": ["Critical Skill 1", "Critical Skill 2"],
                "improvements": [
                  "Actionable tip 1 (e.g. 'Quantify your impact in the X role')",
                  "Actionable tip 2"
                ],
                "interviewQuestions": [
                  "Question 1 (Technical)",
                  "Question 2 (Behavioral)",
                  "Question 3 (Problem Solving)"
                ]
              }
            }

            If a field is missing, use "Not found".
            Do NOT include markdown formatting. Just the raw JSON.

            RESUME TEXT:
            ${resumeText.slice(0, 25000)}
          `,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Slightly higher for creativity in suggestions
    });

    let rawContent = completion.choices[0]?.message?.content || "{}";

    // Cleanup to ensure valid JSON
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
