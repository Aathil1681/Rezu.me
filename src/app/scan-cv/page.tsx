"use client";

import React, { useState } from "react";

// Updated Interface to match new JSON structure
interface ResumeData {
  fullName: string;
  email: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  analysis?: {
    jobTitle: string;
    missingSkills: string[];
    improvements: string[];
    interviewQuestions: string[];
  };
}

export default function ScanPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResumeData | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      // Dynamic import to fix Node version issues
      const pdfToText = (await import("react-pdftotext")).default;

      const text = await pdfToText(file);

      const res = await fetch("/api/scan-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });

      const responseJson = await res.json();

      if (res.status !== 200) {
        throw new Error(responseJson.error || "Scan failed");
      }

      setData(responseJson.output);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "auto",
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      <h1
        style={{ marginBottom: "10px", textAlign: "center", color: "#111827" }}
      >
        AI Resume Career Coach
      </h1>
      <p
        style={{ textAlign: "center", color: "#6b7280", marginBottom: "30px" }}
      >
        Upload your CV to get a professional review, missing skills, and
        interview prep.
      </p>

      {/* Upload Box */}
      <div
        style={{
          marginBottom: "40px",
          padding: "40px",
          border: "2px dashed #d1d5db",
          borderRadius: "12px",
          textAlign: "center",
          background: "#f9fafb",
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={loading}
          style={{ display: "block", margin: "0 auto 10px auto" }}
        />
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Supported format: PDF (Text-based)
        </p>

        {loading && (
          <div
            style={{
              marginTop: "20px",
              color: "#2563eb",
              fontWeight: "600",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span className="loader"></span> 🤖 Analyzing Profile & Generating
            Feedback...
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "15px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            marginBottom: "30px",
            border: "1px solid #fca5a5",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* RESULTS SECTION */}
      {data && (
        <div style={{ display: "grid", gap: "30px" }}>
          {/* 1. MAIN PROFILE CARD */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "30px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #f3f4f6",
                paddingBottom: "15px",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: "0", fontSize: "28px", color: "#111827" }}>
                {data.fullName}
              </h2>
              <p style={{ margin: "5px 0 0", color: "#4b5563" }}>
                {data.email}
              </p>
              {data.analysis?.jobTitle && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                    background: "#f3f4f6",
                    color: "#374151",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  🎯 Identified Role: {data.analysis.jobTitle}
                </span>
              )}
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Professional Summary
            </h3>
            <p style={{ lineHeight: "1.6", color: "#4b5563" }}>
              {data.summary}
            </p>
          </div>

          {/* 2. SKILLS ANALYSIS GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Existing Skills */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "15px",
                  color: "#059669",
                }}
              >
                ✅ Your Key Skills
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.skills?.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills (New Feature) */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "15px",
                  color: "#d97706",
                }}
              >
                ⚠️ Recommended Skills to Add
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.analysis?.missingSkills?.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      background: "#fffbeb",
                      color: "#d97706",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "500",
                      border: "1px solid #fcd34d",
                    }}
                  >
                    + {skill}
                  </span>
                )) || (
                  <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                    No critical skills missing found.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. EXPERIENCE SECTION */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              Work Experience
            </h3>
            {data.experience?.map((job, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "25px",
                  paddingLeft: "20px",
                  borderLeft: "4px solid #e5e7eb",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {job.role}
                </h4>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontWeight: "bold", color: "#374151" }}>
                    {job.company}
                  </span>{" "}
                  • {job.duration}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    color: "#4b5563",
                    lineHeight: "1.5",
                  }}
                >
                  {job.description}
                </p>
              </div>
            ))}
          </div>

          {/* 4. AI COACH SUGGESTIONS (New Feature) */}
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#1e40af",
              }}
            >
              🚀 Resume Improvements
            </h3>
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {data.analysis?.improvements?.map((tip, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "10px",
                    color: "#1e3a8a",
                    lineHeight: "1.5",
                  }}
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* 5. INTERVIEW PREP (New Feature) */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#7c3aed",
              }}
            >
              🎙️ Practice Interview Questions
            </h3>
            <div style={{ display: "grid", gap: "15px" }}>
              {data.analysis?.interviewQuestions?.map((q, index) => (
                <div
                  key={index}
                  style={{
                    padding: "15px",
                    background: "#f5f3ff",
                    borderRadius: "8px",
                    borderLeft: "4px solid #7c3aed",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "500", color: "#5b21b6" }}>
                    Question {index + 1}:
                  </p>
                  <p style={{ margin: "5px 0 0", color: "#4c1d95" }}>{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
