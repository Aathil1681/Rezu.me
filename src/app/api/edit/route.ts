import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_INSTRUCTION = `You are a LaTeX resume generator. Your ONLY job is to convert plain text resumes into LaTeX code.

INPUT FORMAT: User provides raw resume text with name, contact, experience, etc.
OUTPUT FORMAT: Pure LaTeX code only, no explanations.

IMPORTANT: You MUST use the EXACT text from the user's input. NEVER use placeholder text like "Company Name" or "Accomplishment 1".`;

export async function POST(req: Request) {
  try {
    const { message, currentLatex } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "No input text provided" },
        { status: 400 },
      );
    }

    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Create a template with placeholders, then instruct AI to fill them
    const latexTemplate = `
% ========== RESUME TEMPLATE ==========
% INSTRUCTIONS: Fill in the EXACT text from user input below
% DO NOT use "Company Name", "Location", etc. Use actual values.

\\begin{center}
\\textbf{\\Huge \\scshape [USER_NAME_HERE]} \\\\
[USER_CONTACT_INFO_HERE]
\\end{center}

[PROFESSIONAL_SUMMARY_HERE]

\\section{Work Experience}
\\resumeSubHeadingListStart
[WORK_EXPERIENCE_HERE]
\\resumeSubHeadingListEnd

\\section{Education}
\\resumeSubHeadingListStart
[EDUCATION_HERE]
\\resumeSubHeadingListEnd

\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
[SKILLS_HERE]
\\end{itemize}
% ========== END TEMPLATE ==========
`;

    // Create a detailed parsing prompt
    const parsingPrompt = `
    USER'S RESUME TEXT:
    """
    ${message}
    """

    Your task: Parse this resume text and fill in the LaTeX template below with EXACT text from the user.

    TEMPLATE TO FILL:
    ${latexTemplate}

    STEP-BY-STEP PARSING:
    1. Find the person's name (first thing in text) → replace [USER_NAME_HERE]
    2. Find contact info (lines after name with email, phone, location) → replace [USER_CONTACT_INFO_HERE]
       Format: "City, State \\\\ Phone: number \\\\ email@domain.com \\\\ LinkedIn/GitHub links"
       Use: " \\ \$|\$ \\ " for separators
    3. Find "Professional Summary" text → replace [PROFESSIONAL_SUMMARY_HERE] with "\\section{Professional Summary} Summary text here"
    4. Find work experience:
       - Each job: Company Name, Position, Dates
       - Bullet points (lines starting with • or -)
       - Format each job as:
         \\resumeSubheading{COMPANY_NAME}{LOCATION}{POSITION}{DATES}
         \\resumeItemListStart
         \\resumeItem{BULLET_POINT_1}
         \\resumeItem{BULLET_POINT_2}
         \\resumeItemListEnd
    5. Find education → replace [EDUCATION_HERE] with \\resumeSubheading{UNIVERSITY}{LOCATION}{DEGREE}{YEARS}
    6. Find skills/technologies → replace [SKILLS_HERE] with \\item Technology1, Technology2, etc.

    CRITICAL RULES:
    1. USE EXACT TEXT from user input
    2. NO placeholders like "Company Name"
    3. Convert bullet points (•) to \\resumeItem{}
    4. Keep dates exactly as written
    5. Format contact info with pipe separators: " \\ \$|\$ \\ "

    OUTPUT: Only the filled LaTeX template, nothing else.
    `;

    const result = await model.generateContent(parsingPrompt);
    const response = await result.response;
    let latex = response.text();

    // Clean the output
    latex = latex
      .replace(/```(?:latex)?/gi, "")
      .replace(/^\s*language-.*$/gim, "")
      .trim();

    // If we still get placeholders, do manual parsing as fallback
    if (latex.includes("Company Name") || latex.includes("Accomplishment")) {
      console.log("AI returned placeholders, using manual parsing fallback");
      latex = manualParseToLatex(message);
    }

    const friendlyResponse =
      "I've converted your resume text into properly formatted LaTeX code. All your information has been structured into appropriate sections.";

    return NextResponse.json({
      response: friendlyResponse,
      latex,
    });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate LaTeX",
        response:
          "Sorry, I encountered an error. Here's a basic template you can modify.",
      },
      { status: 500 },
    );
  }
}

// Fallback manual parser
function manualParseToLatex(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let name = "";
  let contact: string[] = [];
  let professionalSummary = "";
  let workExperience: Array<{
    company: string;
    position: string;
    dates: string;
    bullets: string[];
  }> = [];
  let education: Array<{
    institution: string;
    degree: string;
    years: string;
  }> = [];
  let skills: string[] = [];

  // Simple parsing logic
  let currentSection = "";
  let currentJob: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Get name (first non-empty line)
    if (
      !name &&
      line &&
      !line.toLowerCase().includes("professional") &&
      !line.toLowerCase().includes("experience") &&
      !line.toLowerCase().includes("summary")
    ) {
      name = line;
      continue;
    }

    // Get contact info (lines after name before "Professional Summary")
    if (
      name &&
      !currentSection &&
      !line.toLowerCase().includes("professional summary") &&
      !line.toLowerCase().includes("work experience")
    ) {
      if (
        line.includes("@") ||
        line.includes("+") ||
        line.includes("github") ||
        line.includes("linkedin")
      ) {
        contact.push(line);
      } else if (
        line.includes(",") ||
        line.includes("UAE") ||
        line.includes("Sri Lanka")
      ) {
        contact.unshift(line); // Location goes first
      }
      continue;
    }

    // Detect sections
    if (line.toLowerCase().includes("professional summary")) {
      currentSection = "summary";
      continue;
    } else if (line.toLowerCase().includes("work experience")) {
      currentSection = "experience";
      continue;
    } else if (line.toLowerCase().includes("education")) {
      currentSection = "education";
      continue;
    } else if (line.toLowerCase().includes("skill")) {
      currentSection = "skills";
      continue;
    }

    // Parse content based on current section
    if (currentSection === "summary") {
      if (line && !line.toLowerCase().includes("work experience")) {
        professionalSummary += line + " ";
      }
    } else if (currentSection === "experience") {
      // Look for company names (lines without bullet points)
      if (
        line &&
        !line.startsWith("•") &&
        !line.startsWith("-") &&
        !line.toLowerCase().includes("website") &&
        line.length > 3
      ) {
        if (currentJob && currentJob.company) {
          workExperience.push(currentJob);
        }

        // Try to extract company, position, dates
        const parts = line.split(/\s{2,}/);
        if (parts.length >= 2) {
          currentJob = {
            company: parts[0],
            position: parts[1] || "",
            dates: "",
            bullets: [],
          };
        } else {
          currentJob = {
            company: line,
            position: "",
            dates: "",
            bullets: [],
          };
        }
      } else if (line.startsWith("•") || line.startsWith("-")) {
        const bullet = line.replace(/^[•\-]\s*/, "");
        if (currentJob) {
          currentJob.bullets.push(bullet);
        }
      } else if (line.includes("[") && line.includes("]") && currentJob) {
        // This might be dates
        currentJob.dates = line;
      }
    } else if (currentSection === "skills") {
      // Extract skills from text
      const techKeywords = [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind",
        "Prisma",
        "MongoDB",
        "Node.js",
        "Python",
        "JavaScript",
        "AWS",
        "Docker",
      ];
      techKeywords.forEach((tech) => {
        if (
          line.toLowerCase().includes(tech.toLowerCase()) &&
          !skills.includes(tech)
        ) {
          skills.push(tech);
        }
      });
    }
  }

  // Add the last job
  if (currentJob && currentJob.company) {
    workExperience.push(currentJob);
  }

  // Build LaTeX from parsed data
  let latex = "";

  // Header
  latex += `\\begin{center}\n`;
  latex += `\\textbf{\\Huge \\scshape ${name || "Your Name"}} \\\\\n`;
  if (contact.length > 0) {
    latex += contact.join(" \\\\\n") + "\n";
  }
  latex += `\\end{center}\n\n`;

  // Professional Summary
  if (professionalSummary) {
    latex += `\\section{Professional Summary}\n`;
    latex += `${professionalSummary.trim()}\n\n`;
  }

  // Work Experience
  if (workExperience.length > 0) {
    latex += `\\section{Work Experience}\n`;
    latex += `\\resumeSubHeadingListStart\n\n`;

    workExperience.forEach((job) => {
      latex += `\\resumeSubheading{${job.company}}{}{${job.position}}{${job.dates}}\n`;
      if (job.bullets.length > 0) {
        latex += `\\resumeItemListStart\n`;
        job.bullets.forEach((bullet) => {
          latex += `  \\resumeItem{${bullet}}\n`;
        });
        latex += `\\resumeItemListEnd\n`;
      }
      latex += `\n`;
    });

    latex += `\\resumeSubHeadingListEnd\n\n`;
  }

  // Skills
  if (skills.length > 0) {
    latex += `\\section{Skills}\n`;
    latex += `\\begin{itemize}[leftmargin=0.15in, label={}]\n`;
    latex += `  \\item ${skills.join(", ")}\n`;
    latex += `\\end{itemize}\n`;
  }

  return latex;
}
