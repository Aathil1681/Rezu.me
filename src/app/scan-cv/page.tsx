"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Brain,
  Briefcase,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronLeft,
  Plus,
  Target,
  Clipboard,
  Zap,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  Search,
  GitCompare,
  Users,
  ThumbsUp,
  Lightbulb,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface ResumeData {
  fullName: string;
  email: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  analysis?: {
    score: number;
    jobTitle: string;
    missingSkills: string[];
    improvements: string[];
    interviewQuestions: string[];
  };
}

interface MatchData {
  resumeSummary: {
    fullName: string;
    jobTitle: string;
    summary: string;
    keySkills: string[];
  };
  jobSummary: {
    jobTitle: string;
    seniority: string;
    companySize: string;
    industry: string;
  };
  matchAnalysis: {
    overallMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    cultureMatch: number;
    atsOptimization: number;
  };
  gapAnalysis: {
    missingSkills: string[];
    experienceGaps: string[];
    keywordsMissing: string[];
    strengths: string[];
  };
  actionableRecommendations: {
    resumeChanges: string[];
    skillDevelopment: string[];
    applicationStrategy: string[];
    interviewPrep: string[];
  };
  detailedBreakdown: {
    skillsComparison: {
      matched: string[];
      partialMatch: string[];
      missing: string[];
    };
    experienceComparison: {
      yearsMatch: string;
      roleAlignment: string;
      industryRelevance: string;
    };
    keywordOptimization: {
      presentKeywords: string[];
      missingKeywords: string[];
      suggestedAdditions: string[];
    };
  };
  atsScore: {
    score: number;
    grade: string;
    feedback: string;
  };
}

export default function ScanPage() {
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [activeView, setActiveView] = useState<"resume" | "match">("resume");
  const [extractedResumeText, setExtractedResumeText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setResumeData(null);
    setMatchData(null);

    try {
      const pdfToText = (await import("react-pdftotext")).default;
      const text = await pdfToText(file);

      setExtractedResumeText(text);

      const res = await fetch("/api/scan-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });

      const responseJson = await res.json();

      if (res.status !== 200) {
        throw new Error(responseJson.error || "Scan failed");
      }

      setResumeData(responseJson.output);
      setActiveView("resume");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAnalysis = async () => {
    if (!extractedResumeText) {
      setError("Please upload a resume first");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const matchRes = await fetch("/api/analyze-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: extractedResumeText,
          jobDescription,
        }),
      });

      const matchJson = await matchRes.json();

      if (matchRes.status !== 200) {
        throw new Error(matchJson.error || "Match analysis failed");
      }

      setMatchData(matchJson.output);
      setActiveView("match");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze match.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 border-emerald-200";
    if (score >= 50) return "bg-amber-100 border-amber-200";
    return "bg-red-100 border-red-200";
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case "A":
        return "bg-gradient-to-r from-emerald-500 to-green-500 text-white";
      case "B":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case "C":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white";
      case "D":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
      case "F":
        return "bg-gradient-to-r from-red-600 to-rose-600 text-white";
      default:
        return "bg-gradient-to-r from-zinc-500 to-gray-500 text-white";
    }
  };

  const getMatchLevel = (score: number) => {
    if (score >= 90)
      return {
        text: "Excellent Match",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      };
    if (score >= 75)
      return {
        text: "Strong Match",
        color: "text-blue-600",
        bg: "bg-blue-100",
      };
    if (score >= 60)
      return {
        text: "Good Match",
        color: "text-amber-600",
        bg: "bg-amber-100",
      };
    if (score >= 50)
      return {
        text: "Moderate Match",
        color: "text-orange-600",
        bg: "bg-orange-100",
      };
    return {
      text: "Needs Improvement",
      color: "text-red-600",
      bg: "bg-red-100",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 text-zinc-900 p-4 md:p-8 lg:p-12">
      {/* Navigation / Header */}
      <div className="max-w-7xl mx-auto px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10 gap-4">
          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-all duration-300 group self-start sm:self-auto"
          >
            <div className="sm:hidden">
              <ChevronLeft className="w-6 h-6" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-lg">Back to Home</span>
            </div>
          </Link>

          {/* View Toggle */}
          {resumeData && (
            <div className="hidden md:flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-zinc-200 shadow-sm">
              <Button
                variant={activeView === "resume" ? "default" : "ghost"}
                onClick={() => setActiveView("resume")}
                className="gap-2 rounded-lg transition-all"
                size="sm"
              >
                <FileText className="w-4 h-4" />
                Resume Analysis
              </Button>
              <Button
                variant={activeView === "match" ? "default" : "ghost"}
                onClick={() => setActiveView("match")}
                disabled={!jobDescription.trim()}
                className="gap-2 rounded-lg transition-all"
                size="sm"
              >
                <GitCompare className="w-4 h-4" />
                Job Match
              </Button>
            </div>
          )}

          {/* CTA Button */}
          <div className="self-end sm:self-auto">
            <Link href="/create-cv" className="block">
              <div className="sm:hidden">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl rounded-full h-12 px-4 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </Button>
              </div>
              <div className="hidden sm:block">
                <Button className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold px-4 sm:px-6 py-3 relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="flex items-center gap-2 relative z-10">
                    Build New Resume
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10 px-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-base sm:text-xl bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white font-medium mb-4 shadow-lg">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5" /> AI-Powered Career
            Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-800 mb-4 leading-tight">
            Resume{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              vs Job Match
            </span>
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg max-w-2xl sm:max-w-3xl mx-auto">
            Upload your resume and paste a job description to get AI-powered
            matching analysis, gap identification, and tailored recommendations.
          </p>
        </div>

        {/* Dual Input Section */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Resume Upload Card */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-dashed border-indigo-200 rounded-2xl p-6 md:p-8 text-center hover:border-indigo-400 transition-all duration-300 shadow-lg hover:shadow-xl group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
              {loading ? (
                <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-zinc-800 mb-3">
              Step 1: Upload Resume
            </h3>
            <p className="text-zinc-500 mb-6">
              Upload your PDF resume for AI analysis
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />

            <label htmlFor="resume-upload" className="cursor-pointer block">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose PDF File
                  </>
                )}
              </Button>
            </label>

            {resumeData && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">
                    Resume uploaded successfully!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Job Description Card */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-dashed border-purple-200 rounded-2xl p-6 md:p-8 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clipboard className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-zinc-800 mb-3">
              Step 2: Job Description
            </h3>
            <p className="text-zinc-500 mb-4">
              Paste the job description you want to match against
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-40 p-4 border-2 border-zinc-200 rounded-xl focus:ring-3 focus:ring-purple-500/30 focus:border-purple-400 resize-none mb-4 transition-all duration-300"
              disabled={loading}
            />

            <Button
              onClick={handleMatchAnalysis}
              disabled={
                loading || !extractedResumeText || !jobDescription.trim()
              }
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5 mr-2" />
                  Analyze Job Match
                </>
              )}
            </Button>

            {!extractedResumeText && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Upload a resume first to enable matching
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Mobile View Toggle */}
        {resumeData && (
          <div className="md:hidden flex justify-center mb-8">
            <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-zinc-200 shadow-sm">
              <button
                onClick={() => setActiveView("resume")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeView === "resume" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Resume</span>
                </div>
              </button>
              <button
                onClick={() => setActiveView("match")}
                disabled={!matchData}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeView === "match" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4" />
                  <span>Match</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* RESUME ANALYSIS VIEW */}
        {activeView === "resume" && resumeData && (
          <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Score & Header Card */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-0 opacity-60" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-50 to-cyan-50 rounded-tr-full -z-0 opacity-40" />

              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                {/* Score Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      className="text-zinc-100"
                      strokeWidth="12"
                      fill="transparent"
                      stroke="currentColor"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      className={getScoreColor(resumeData.analysis?.score || 0)}
                      strokeWidth="12"
                      fill="transparent"
                      stroke="currentColor"
                      strokeDasharray={452}
                      strokeDashoffset={
                        452 - (452 * (resumeData.analysis?.score || 0)) / 100
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(resumeData.analysis?.score || 0)}`}
                    >
                      {resumeData.analysis?.score || 0}
                    </span>
                    <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider mt-1">
                      ATS Score
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-800">
                      {resumeData.fullName}
                    </h2>
                    {resumeData.analysis?.score &&
                      resumeData.analysis.score > 80 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full border border-amber-200">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-amber-700">
                            Top Candidate
                          </span>
                        </div>
                      )}
                  </div>
                  <p className="text-zinc-500 mb-6 text-lg">
                    {resumeData.email}
                  </p>
                  {resumeData.analysis?.jobTitle && (
                    <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-xl border border-indigo-100">
                      <Briefcase className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-indigo-600">
                          Target Role
                        </div>
                        <div className="font-bold">
                          {resumeData.analysis.jobTitle}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Analysis Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-800 text-lg">
                      Detected Skills
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Skills identified from your resume
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200 hover:scale-105 transition-transform cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-800 text-lg">
                      Recommended Skills
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Skills to improve your profile
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.analysis?.missingSkills?.length ? (
                    resumeData.analysis.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200 hover:scale-105 transition-transform cursor-default"
                      >
                        <span className="mr-1">+</span> {skill}
                      </span>
                    ))
                  ) : (
                    <div className="w-full text-center py-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-zinc-400 italic">
                        All essential skills covered!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Improvements */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-indigo-200/50 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">
                    Strategic Improvements
                  </h3>
                  <p className="text-indigo-700/80">
                    AI-powered recommendations to boost your resume
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {resumeData.analysis?.improvements?.map((tip, index) => (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-white hover:border-indigo-200 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <p className="text-zinc-700 leading-relaxed">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-indigo-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-indigo-700 font-medium">
                    Want to apply these changes instantly?
                  </p>
                  <p className="text-sm text-indigo-600/80">
                    Edit your resume with our AI-powered builder
                  </p>
                </div>
                <Link href="/create-cv">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    Edit in Builder
                  </Button>
                </Link>
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-800 text-xl">
                    Experience Review
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Your career journey at a glance
                  </p>
                </div>
              </div>

              <div className="space-y-8 relative before:absolute before:left-6 before:top-12 before:bottom-4 before:w-0.5 before:bg-gradient-to-b from-blue-200 to-purple-200">
                {resumeData.experience?.map((job, index) => (
                  <div key={index} className="relative pl-16">
                    <div className="absolute left-0 top-1 w-12 h-12 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center shadow-lg z-10">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-5 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-zinc-800 text-lg mb-2">
                        {job.role}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 mb-3">
                        <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          {job.company}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="bg-zinc-100 px-3 py-1 rounded-lg">
                          {job.duration}
                        </span>
                      </div>
                      <p className="text-zinc-600 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Prep */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-900">
                    Interview Preparation
                  </h3>
                  <p className="text-purple-700/80">
                    Questions tailored to your profile
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {resumeData.analysis?.interviewQuestions?.map((q, index) => (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        Q{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-700 uppercase tracking-wide mb-2">
                          Question {index + 1}
                        </p>
                        <p className="text-zinc-700 font-medium">{q}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full font-medium mb-4 border border-emerald-200">
                <Lightbulb className="w-4 h-4" />
                Ready to level up your career?
              </div>
              <h3 className="text-2xl font-bold text-zinc-800 mb-4">
                Create Your Perfect Resume
              </h3>
              <p className="text-zinc-500 mb-6 max-w-2xl mx-auto">
                Transform your resume with AI-powered optimizations tailored to
                your goals.
              </p>
              <Link href="/create-cv">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all px-8 py-6 text-lg font-semibold rounded-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Optimized Resume Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* JOB MATCH ANALYSIS VIEW */}
        {activeView === "match" && matchData && (
          <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Match Score Overview */}
            <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-3xl border border-indigo-200 shadow-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-bl-full -z-0" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-100/50 to-cyan-100/50 rounded-tr-full -z-0" />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-indigo-900">
                    Job Match Score
                  </h2>
                  <p className="text-indigo-700/80">
                    How well your resume matches the job
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Overall Match Circle */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="relative w-56 h-56 mx-auto mb-6">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="112"
                          cy="112"
                          r="100"
                          className="text-zinc-100"
                          strokeWidth="16"
                          fill="transparent"
                          stroke="currentColor"
                        />
                        <circle
                          cx="112"
                          cy="112"
                          r="100"
                          className={getScoreColor(
                            matchData.matchAnalysis.overallMatch,
                          )}
                          strokeWidth="16"
                          fill="transparent"
                          stroke="currentColor"
                          strokeDasharray={628}
                          strokeDashoffset={
                            628 -
                            (628 * matchData.matchAnalysis.overallMatch) / 100
                          }
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className={`text-5xl font-bold ${getScoreColor(matchData.matchAnalysis.overallMatch)}`}
                        >
                          {matchData.matchAnalysis.overallMatch}%
                        </span>
                        <span className="text-sm text-zinc-500 uppercase font-bold tracking-wider mt-2">
                          Overall Match
                        </span>
                        <div
                          className={`mt-3 px-4 py-1 rounded-full ${getMatchLevel(matchData.matchAnalysis.overallMatch).bg} ${getMatchLevel(matchData.matchAnalysis.overallMatch).color} font-medium text-sm`}
                        >
                          {
                            getMatchLevel(matchData.matchAnalysis.overallMatch)
                              .text
                          }
                        </div>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl ${getGradeColor(matchData.atsScore.grade)} shadow-lg`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {matchData.atsScore.grade}
                        </div>
                        <div className="text-xs opacity-90">ATS Grade</div>
                      </div>
                      <div className="h-8 w-px bg-white/50" />
                      <div className="text-sm max-w-[160px]">
                        {matchData.atsScore.feedback}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Skills Match",
                        score: matchData.matchAnalysis.skillsMatch,
                        icon: Zap,
                        desc: "Technical & soft skills alignment",
                      },
                      {
                        label: "Experience Match",
                        score: matchData.matchAnalysis.experienceMatch,
                        icon: TrendingUp,
                        desc: "Years & role relevance",
                      },
                      {
                        label: "Culture Match",
                        score: matchData.matchAnalysis.cultureMatch,
                        icon: Users,
                        desc: "Company culture fit",
                      },
                      {
                        label: "ATS Optimization",
                        score: matchData.matchAnalysis.atsOptimization,
                        icon: BarChart3,
                        desc: "Keyword & format optimization",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-5 rounded-xl border ${getScoreBgColor(item.score)} hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.score >= 80 ? "bg-emerald-100 text-emerald-600" : item.score >= 50 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}
                          >
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-zinc-800">
                              {item.label}
                            </h3>
                            <p className="text-xs text-zinc-500">{item.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span
                            className={`text-3xl font-bold ${getScoreColor(item.score)}`}
                          >
                            {item.score}%
                          </span>
                          <div className="flex-1">
                            <div className="w-full bg-zinc-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${item.score >= 80 ? "bg-gradient-to-r from-emerald-500 to-green-500" : item.score >= 50 ? "bg-gradient-to-r from-amber-500 to-yellow-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`}
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Summary */}
                  <div className="mt-6 p-5 bg-gradient-to-r from-white to-indigo-50/30 rounded-xl border border-indigo-100">
                    <h4 className="font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-indigo-600" />
                      Quick Summary
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-zinc-500">
                            Role Match
                          </div>
                          <div className="font-semibold text-zinc-800">
                            {matchData.resumeSummary.jobTitle} →{" "}
                            {matchData.jobSummary.jobTitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm text-zinc-500">
                            Seniority Level
                          </div>
                          <div className="font-semibold text-zinc-800">
                            {matchData.jobSummary.seniority} in{" "}
                            {matchData.jobSummary.industry}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Comparison */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-800">
                    Skills Analysis
                  </h2>
                  <p className="text-zinc-500">
                    How your skills compare to job requirements
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Matched Skills */}
                <div className="bg-gradient-to-b from-emerald-50 to-green-50 border border-emerald-200 p-6 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-700">
                          Strong Matches
                        </h3>
                        <div className="text-xs text-emerald-600">
                          Perfect alignment
                        </div>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {
                        matchData.detailedBreakdown.skillsComparison.matched
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchData.detailedBreakdown.skillsComparison.matched.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200 hover:scale-105 transition-transform"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                {/* Partial Matches */}
                <div className="bg-gradient-to-b from-blue-50 to-cyan-50 border border-blue-200 p-6 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-700">
                          Partial Matches
                        </h3>
                        <div className="text-xs text-blue-600">
                          Some overlap
                        </div>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-700">
                      {
                        matchData.detailedBreakdown.skillsComparison
                          .partialMatch.length
                      }
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchData.detailedBreakdown.skillsComparison.partialMatch.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:scale-105 transition-transform"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-gradient-to-b from-red-50 to-rose-50 border border-red-200 p-6 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-700">
                          Missing Skills
                        </h3>
                        <div className="text-xs text-red-600">
                          Need development
                        </div>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-red-700">
                      {
                        matchData.detailedBreakdown.skillsComparison.missing
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchData.detailedBreakdown.skillsComparison.missing.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200 hover:scale-105 transition-transform"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Analysis & Recommendations */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-indigo-200/50 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-indigo-900">
                    Gap Analysis & Recommendations
                  </h2>
                  <p className="text-indigo-700/80">
                    Actionable insights to improve your match
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Critical Gaps */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-red-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-700">
                        Critical Gaps to Address
                      </h3>
                      <p className="text-sm text-red-600">
                        Priority improvements
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {matchData.gapAnalysis.missingSkills
                      .slice(0, 4)
                      .map((gap, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 group"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm mt-0.5 group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <div className="bg-red-50/50 p-3 rounded-lg flex-1">
                            <p className="text-zinc-700 font-medium">{gap}</p>
                            <p className="text-sm text-red-600 mt-1">
                              Focus on acquiring this skill first
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Your Strengths */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-700">
                        Your Key Strengths
                      </h3>
                      <p className="text-sm text-emerald-600">
                        Leverage these in interviews
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {matchData.gapAnalysis.strengths
                      .slice(0, 4)
                      .map((strength, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 group"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm mt-0.5 group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <div className="bg-emerald-50/50 p-3 rounded-lg flex-1">
                            <p className="text-zinc-700 font-medium">
                              {strength}
                            </p>
                            <p className="text-sm text-emerald-600 mt-1">
                              Highlight this in your application
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-900">
                      Actionable Recommendations
                    </h3>
                    <p className="text-purple-700/80">
                      Step-by-step improvement plan
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Resume Changes */}
                  <div className="bg-gradient-to-b from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-700">
                        Resume Improvements
                      </h4>
                    </div>
                    <ul className="space-y-3">
                      {matchData.actionableRecommendations.resumeChanges
                        .slice(0, 3)
                        .map((change, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-blue-500 mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-zinc-700">
                              {change}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Interview Prep */}
                  <div className="bg-gradient-to-b from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-700">
                        Interview Preparation
                      </h4>
                    </div>
                    <ul className="space-y-3">
                      {matchData.actionableRecommendations.interviewPrep
                        .slice(0, 3)
                        .map((prep, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-purple-500 mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-zinc-700">
                              {prep}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Optimization */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-800">
                    Keyword Optimization
                  </h2>
                  <p className="text-zinc-500">
                    Optimize your resume for ATS systems
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Missing Keywords */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-700">
                      Add These Keywords to Your Resume:
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {matchData.detailedBreakdown.keywordOptimization.missingKeywords.map(
                      (keyword, index) => (
                        <span
                          key={index}
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl text-sm font-medium border border-purple-200 hover:scale-105 transition-transform shadow-sm"
                        >
                          <span className="mr-2">+</span> {keyword}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                {/* Present Keywords */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-emerald-700">
                      Already Present Keywords:
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {matchData.detailedBreakdown.keywordOptimization.presentKeywords.map(
                      (keyword, index) => (
                        <span
                          key={index}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200 hover:scale-105 transition-transform shadow-sm"
                        >
                          <span className="mr-2">✓</span> {keyword}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center py-10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-indigo-200/50 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium mb-4 shadow-lg">
                <Star className="w-4 h-4" />
                Ready to optimize?
              </div>
              <h3 className="text-3xl font-bold text-zinc-800 mb-4">
                Create a Tailored Resume for This Job
              </h3>
              <p className="text-zinc-500 mb-8 max-w-2xl mx-auto text-lg">
                Based on our analysis, we can help you create a resume that's
                perfectly optimized for this specific job description.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/create-cv" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all px-8 py-6 text-lg font-semibold rounded-xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Tailored Resume
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg font-medium rounded-xl"
                  onClick={() => setActiveView("resume")}
                >
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                  Back to Resume Analysis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
