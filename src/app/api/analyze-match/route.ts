import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Both resume and job description are required" },
        { status: 400 },
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI Career Coach and Recruiter. Compare the resume with the job description and provide detailed matching analysis, gap analysis, and actionable recommendations.",
        },
        {
          role: "user",
          content: `
            Analyze this resume against the job description and provide comprehensive matching insights.
            
            Return strictly valid JSON (no markdown):
            {
              "resumeSummary": {
                "fullName": "Name",
                "jobTitle": "Inferred Job Title",
                "summary": "Brief professional summary",
                "keySkills": ["Skill 1", "Skill 2"]
              },
              "jobSummary": {
                "jobTitle": "Extracted Job Title",
                "seniority": "Junior/Mid/Senior/Lead/Executive",
                "companySize": "Small/Medium/Large if mentioned",
                "industry": "Industry"
              },
              "matchAnalysis": {
                "overallMatch": 85,
                "skillsMatch": 80,
                "experienceMatch": 75,
                "cultureMatch": 90,
                "atsOptimization": 70
              },
              "gapAnalysis": {
                "missingSkills": ["Critical missing skill 1", "Missing skill 2"],
                "experienceGaps": ["Gap 1", "Gap 2"],
                "keywordsMissing": ["Keyword 1", "Keyword 2"],
                "strengths": ["Your strong match 1", "Strong match 2"]
              },
              "actionableRecommendations": {
                "resumeChanges": ["Add 'React' to skills section", "Quantify achievements in experience"],
                "skillDevelopment": ["Learn 'TypeScript' basics", "Practice 'System Design' interviews"],
                "applicationStrategy": ["Tailor cover letter for 'team collaboration'", "Highlight 'project management' experience"],
                "interviewPrep": ["Prepare for 'technical assessment'", "Practice 'behavioral questions' about 'leadership'"]
              },
              "detailedBreakdown": {
                "skillsComparison": {
                  "matched": ["JavaScript", "React", "Node.js"],
                  "partialMatch": ["AWS", "TypeScript"],
                  "missing": ["Docker", "Kubernetes"]
                },
                "experienceComparison": {
                  "yearsMatch": "3/5 years required",
                  "roleAlignment": "Good alignment with Senior Developer role",
                  "industryRelevance": "Direct industry experience"
                },
                "keywordOptimization": {
                  "presentKeywords": ["agile", "scrum", "full-stack"],
                  "missingKeywords": ["microservices", "CI/CD", "cloud-native"],
                  "suggestedAdditions": ["Add 'cloud-native' to summary", "Include 'CI/CD' in experience bullets"]
                }
              },
              "atsScore": {
                "score": 78,
                "grade": "B",
                "feedback": "Resume is ATS-friendly but missing some job-specific keywords"
              }
            }

            RESUME TEXT:
            ${resumeText.slice(0, 15000)}

            JOB DESCRIPTION:
            ${jobDescription.slice(0, 15000)}
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
    console.error("Match Analysis Error:", error);
    return NextResponse.json(
      { error: "Match analysis failed. " + (error.message || "") },
      { status: 500 },
    );
  }
}
