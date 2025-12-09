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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    score: number;
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

  // Helper for score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 text-zinc-900 p-6 md:p-12">
      {/* Navigation / Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-0">
        <div className="flex justify-between items-center mb-10 gap-4">
          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-all duration-300 group"
            aria-label="Back to Home"
          >
            {/* Mobile: Icon only, no background */}
            <div className="sm:hidden">
              <ChevronLeft className="w-6 h-6" />
            </div>

            {/* Desktop: Icon + Text */}
            <div className="hidden sm:flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-lg">Back to Home</span>
            </div>
          </Link>

          {/* CTA Button with Mobile Optimization */}
          <div className="relative flex-1 sm:flex-none">
            <Link href="/create-cv" className="block">
              {/* Mobile Floating Action Style */}
              <div className="sm:hidden">
                <Button
                  className="
      w-[160px]
      bg-gradient-to-r from-indigo-600 to-purple-600
      hover:from-indigo-700 hover:to-purple-700
      text-white
      font-semibold
      shadow-lg hover:shadow-xl
      rounded-full
      h-14
      flex items-center justify-center gap-2
      relative overflow-hidden
      float-right
    "
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-base">Create</span>
                </Button>
              </div>

              {/* Desktop Version */}
              <div className="hidden sm:block">
                <Button
                  className="
            group
            bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-700 hover:to-purple-700
            text-white 
            text-lg
            shadow-lg hover:shadow-xl 
            transform hover:-translate-y-0.5
            transition-all duration-300
            font-semibold
            px-6 py-4
            relative overflow-hidden
          "
                >
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

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-xl bg-indigo-50 rounded-full text-indigo-700 font-medium mb-4">
            <Brain className="w-4 h-4" /> AI-Powered Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 mb-4">
            Resume{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Health Check
            </span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Upload your PDF resume to get an instant ATS score, identify missing
            skills, and generate interview questions.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-indigo-200 rounded-2xl p-10 text-center hover:border-indigo-400 transition-all shadow-sm group">
          <input
            type="file"
            id="resume-upload"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
          <label htmlFor="resume-upload" className="cursor-pointer block">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              {loading ? (
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-indigo-600" />
              )}
            </div>

            {loading ? (
              <div>
                <h3 className="text-xl font-semibold text-zinc-800 mb-2">
                  Analyzing Resume...
                </h3>
                <p className="text-zinc-500">
                  Our AI is reading your skills and experience
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-zinc-800 mb-2">
                  Drop your resume here
                </h3>
                <p className="text-zinc-500 mb-4">
                  or click to browse (PDF only)
                </p>
                <div className="inline-block px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-600 shadow-sm">
                  Trusted by 50K+ job seekers
                </div>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* RESULTS DASHBOARD */}
        {data && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* 1. Score & Header Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-0" />

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                {/* Score Circle */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      className="text-zinc-100"
                      strokeWidth="8"
                      fill="transparent"
                      stroke="currentColor"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      className={getScoreColor(data.analysis?.score || 0)}
                      strokeWidth="8"
                      fill="transparent"
                      stroke="currentColor"
                      strokeDasharray={377}
                      strokeDashoffset={
                        377 - (377 * (data.analysis?.score || 0)) / 100
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span
                      className={`text-3xl font-bold ${getScoreColor(data.analysis?.score || 0)}`}
                    >
                      {data.analysis?.score || 0}
                    </span>
                    <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">
                      Score
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-zinc-800">
                      {data.fullName}
                    </h2>
                    {data.analysis?.score && data.analysis.score > 80 && (
                      <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <p className="text-zinc-500 mb-4">{data.email}</p>
                  {data.analysis?.jobTitle && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                      <Briefcase className="w-3.5 h-3.5" />
                      Target Role: {data.analysis.jobTitle}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Skills Analysis Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Found Skills */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-zinc-800">
                    Detected Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-zinc-800">
                    Recommended Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.analysis?.missingSkills?.length ? (
                    data.analysis.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100"
                      >
                        + {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-400 italic">
                      No major skills missing!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. AI Improvements (The "Meat" of the feedback) */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-8">
              <h3 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Strategic Improvements
              </h3>
              <div className="space-y-4">
                {data.analysis?.improvements?.map((tip, index) => (
                  <div
                    key={index}
                    className="flex gap-4 bg-white/60 p-4 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-zinc-700 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-indigo-100 flex justify-center">
                <p className="text-sm text-indigo-600 mr-4 flex items-center">
                  Want to apply these changes?
                </p>
                <Link href="/create-cv">
                  <Button
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-white"
                  >
                    Edit in Builder
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4. Experience Timeline */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
              <h3 className="font-bold text-zinc-800 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-400" /> Experience Review
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-12 before:bottom-4 before:w-0.5 before:bg-zinc-100">
                {data.experience?.map((job, index) => (
                  <div key={index} className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 bg-white border-2 border-zinc-100 rounded-full flex items-center justify-center shadow-sm z-10">
                      <Briefcase className="w-4 h-4 text-zinc-400" />
                    </div>
                    <h4 className="font-semibold text-zinc-800 text-lg">
                      {job.role}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                      <span className="font-medium text-indigo-600">
                        {job.company}
                      </span>
                      <span>•</span>
                      <span>{job.duration}</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-sm bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Interview Prep */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
              <h3 className="font-bold text-zinc-800 mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Interview Preparation
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {data.analysis?.interviewQuestions?.map((q, index) => (
                  <div
                    key={index}
                    className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl"
                  >
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">
                      Question {index + 1}
                    </p>
                    <p className="text-zinc-700 font-medium">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-4">
                Ready to build a stronger version of this resume?
              </p>
              <Link href="/create-cv">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  Create Optimized Resume Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
