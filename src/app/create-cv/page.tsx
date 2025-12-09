"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Download,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Code2,
  Eye,
  FileCode,
  Palette,
  Layout,
  ArrowLeft,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function CreateCV() {
  const router = useRouter();
  const sampleLatex = `
%-------------------------------------------------------------------------------
% CONFIGURATIONS
%-------------------------------------------------------------------------------
\\documentclass[letterpaper,12pt]{fed-res}
\\usepackage{xcolor}
\\definecolor{linkblue}{rgb}{0.0,0.0,0.8}

\\begin{document}

%-------------------------------------------------------------------------------
% HEADING INFORMATION
%-------------------------------------------------------------------------------
\\begin{center}
    \\textbf{\\Huge \\scshape John Doe} \\\\
    Dubai, UAE (Relocated from New York) \\\\
    +971 12 345 6789 \ \\$|$\\ \\href{mailto:johndoe@gmail.com}{\\color{linkblue} johndoe@gmail.com} \\\\
    LinkedIn: \\href{https://www.linkedin.com/in/john-doe/}{\\color{linkblue} linkedin.com/in/john-doe}
\\end{center}

%-------------------------------------------------------------------------------
% PROFESSIONAL SUMMARY
%-------------------------------------------------------------------------------
\\section{Professional Summary}
Motivated and detail-oriented professional with experience in data handling, reporting, and digital coordination. Skilled in analysing datasets, preparing structured reports, and supporting operational workflows. Strong interest in modern digital tools and process optimisation.

%-------------------------------------------------------------------------------
% WORK EXPERIENCE
%-------------------------------------------------------------------------------
\\section{Work Experience}
\\resumeSubHeadingListStart

\\resumeSubheading
{Globex Corporation}{}{Data Analyst}{[2024 Jan]-[2024 Dec]}
\\resumeItemListStart
    \\resumeItem{Processed and analysed operational datasets for reporting accuracy.}
    \\resumeItem{Created performance dashboards using internal data tools.}
    \\resumeItem{Collaborated with cross-functional teams for workflow improvements.}
    \\resumeItem{Supported documentation and issue tracking across digital systems.}
\\resumeItemListEnd

\\resumeSubheading
{Innotech Systems}{}{Assistant Analyst}{[2023 Jan]-[2023 Dec]}
\\resumeItemListStart
    \\resumeItem{Collected and validated technical and application-related data.}
    \\resumeItem{Prepared weekly reports highlighting key performance metrics.}
    \\resumeItem{Worked with the product team to identify and resolve system issues.}
    \\resumeItem{Maintained logs and documentation for internal processes.}
\\resumeItemListEnd

\\resumeSubHeadingListEnd

%-------------------------------------------------------------------------------
% EDUCATION
%-------------------------------------------------------------------------------
\\section{Education}
\\resumeSubHeadingListStart
\\resumeSubheading
{University of Example}{California, USA}
{B.Sc. in Information Technology}{2020 -- 2023}
\\resumeSubHeadingListEnd

%-------------------------------------------------------------------------------
% TECHNICAL SKILLS
%-------------------------------------------------------------------------------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item \\textbf{Data Analysis:} Excel, Google Sheets, Reporting, Data Validation
    \\item \\textbf{Digital Tools:} React, Next.js, TypeScript, Tailwind CSS, APIs
    \\item \\textbf{Monitoring \\\\& Coordination:} Workflow Tracking, Issue Reporting, Performance Logs
    \\item \\textbf{Other:} Problem-Solving, Attention to Detail, Communication
\\end{itemize}

%-------------------------------------------------------------------------------
% JOB RELATED TRAINING
%-------------------------------------------------------------------------------
\\section{Job Related Training}
\\resumeSubHeadingListStart
\\resumeSubheading
{Data Analytics \\\\& Digital Reporting}{Self-Directed}{Online Courses}{Ongoing}
\\resumeItemListStart
    \\resumeItem{Trained in data dashboard creation using spreadsheets and online tools.}
    \\resumeItem{Learned techniques for identifying trends and anomalies in datasets.}
    \\resumeItem{Practiced structured reporting and process documentation.}
    \\resumeItem{Gained understanding of digital workflow tracking systems.}
\\resumeItemListEnd
\\resumeSubHeadingListEnd

%-------------------------------------------------------------------------------
% REFERENCES
%-------------------------------------------------------------------------------
\\section{References}
\\begin{center}
\\begin{minipage}[t]{0.32\\textwidth}
\\textbf{Dr. Emily Carter} \\\\
Professor, University of Example \\\\
Phone: +1 555 222 1111 \\\\
Email: \\href{mailto:e.carter@example.com}{\\color{linkblue} e.carter@example.com} \\\\
Relationship: Academic
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.32\\textwidth}
\\textbf{Michael Green} \\\\
Manager — Innotech Systems \\\\
Phone: +1 555 333 4444 \\\\
Email: \\href{mailto:m.green@example.com}{\\color{linkblue} m.green@example.com} \\\\
Relationship: Supervisor
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.32\\textwidth}
\\textbf{Sarah Johnson} \\\\
Director — Globex Corporation \\\\
Phone: +1 555 777 8888 \\\\
Email: \\href{mailto:s.johnson@example.com}{\\color{linkblue} s.johnson@example.com} \\\\
Relationship: Employer
\\end{minipage}
\\end{center}

%-------------------------------------------------------------------------------
% ADDITIONAL INFORMATION
%-------------------------------------------------------------------------------
\\section{Additional Information}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item Willing to relocate: Yes
    \\item Availability: Immediate
\\end{itemize}

%-------------------------------------------
\\end{document}
`;

  const [latex, setLatex] = useState(sampleLatex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [activeMobileTab, setActiveMobileTab] = useState<"editor" | "preview">(
    "editor",
  );
  const [editorTheme, setEditorTheme] = useState<"dark" | "light">("dark");

  async function generatePreview() {
    if (!latex.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexLikeContent: latex }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      generatePreview();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [latex]);

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = "resume.pdf";
      a.click();
    }
  };

  const toggleEditorTheme = () => {
    setEditorTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-gray-50 to-indigo-50 text-zinc-900 overflow-hidden font-sans">
      {/* --- Enhanced Header --- */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-lg border-b border-zinc-200/50 shadow-lg z-30">
        {/* Left: Brand with Back Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start mb-3 md:mb-0">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 p-2 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all hover:scale-105 flex items-center justify-center"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600" />
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-lg">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Rezu.me
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500">
                Create professional resumes in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex w-full md:hidden gap-2 mb-3">
          <button
            onClick={() => setActiveMobileTab("editor")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeMobileTab === "editor"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-white/50"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setActiveMobileTab("preview")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeMobileTab === "preview"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-white/50"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>

        {/* Actions Toolbar */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-2 justify-between md:justify-end">
          {/* Status Indicator */}
          <div className="flex items-center gap-3 border-r border-zinc-200 pr-4 mb-2 md:mb-0">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"></div>
                <span className="text-sm font-medium text-amber-700">
                  Processing...
                </span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600"></div>
                <span className="text-sm font-medium text-red-700">Error</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-600"></div>
                <span className="text-sm font-medium text-emerald-700">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleEditorTheme}
              className="h-10 w-10 p-0 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 hover:scale-105 transition-all"
              title="Toggle theme"
            >
              <Palette className="w-5 h-5 text-zinc-600" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={generatePreview}
              disabled={loading}
              className="h-10 min-w-[90px] border-zinc-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all hover:scale-105 flex-1 md:flex-auto"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleDownload}
              disabled={!pdfUrl || loading}
              className="h-10 min-w-[120px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 font-medium flex-1 md:flex-auto"
            >
              <Download className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Editor with Theme Support */}
        <div
          className={`
            flex flex-col border-r border-zinc-800 transition-all duration-300
            ${editorTheme === "dark" ? "bg-gradient-to-br from-zinc-950 to-gray-900" : "bg-gradient-to-br from-white to-gray-50"}
            ${activeMobileTab === "editor" ? "w-full flex-1" : "hidden md:flex md:w-1/2"}
        `}
        >
          {/* Editor Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              editorTheme === "dark"
                ? "bg-gradient-to-r from-zinc-900 to-gray-900 border-zinc-800 text-zinc-400"
                : "bg-gradient-to-r from-white to-gray-50 border-zinc-200 text-zinc-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400 shadow"></span>
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow"></span>
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow"></span>
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold ml-2">
                LaTeX Editor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
            </div>
          </div>

          {/* Editor Area */}
          <div className="relative flex-1">
            <textarea
              className={`absolute inset-0 w-full h-full p-4 md:p-6 font-mono text-sm leading-relaxed border-none resize-none focus:ring-0 focus:outline-none scrollbar-thin transition-colors duration-300 ${
                editorTheme === "dark"
                  ? "bg-gradient-to-br from-zinc-950 to-gray-900 text-zinc-300 scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                  : "bg-gradient-to-br from-white to-gray-50 text-zinc-800 scrollbar-thumb-zinc-300 scrollbar-track-transparent"
              }`}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              spellCheck={false}
              placeholder="Type your LaTeX code here..."
              style={{ tabSize: 2 }}
            />
          </div>

          {error && (
            <div className="p-3 bg-gradient-to-r from-red-500/10 to-red-400/10 border-t border-red-500/20 text-red-600 flex items-start gap-2 animate-in slide-in-from-bottom-2 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Right Panel: Enhanced Preview - Made Larger */}
        <div
          className={`
            bg-gradient-to-br from-gray-50 to-indigo-50 relative flex flex-col
            ${activeMobileTab === "preview" ? "w-full flex-1" : "hidden md:flex md:w-1/2"}
        `}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, #a5b4fc 2px, transparent 2px)`,
                backgroundSize: "50px 50px",
              }}
            ></div>
          </div>

          {/* Preview Header */}
          <div className="flex-none flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-lg border-b border-zinc-200/50 z-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Mobile Status */}
              <div className="md:hidden flex items-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-1.5 text-amber-600 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
            </div>

            {/* A4 Size Badge */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600 bg-white/80 px-3 py-1.5 rounded-full border border-zinc-200/50">
              <FileText className="w-4 h-4" />
              <span>A4 Format</span>
            </div>
          </div>

          {/* Preview Content - Made Much Larger */}
          <div className="flex-1 p-2 md:p-4 flex flex-col items-center z-10">
            {pdfUrl && (
              <div className="w-full h-full flex flex-col items-center">
                {/* Desktop: Large Preview with fixed aspect ratio */}
                <div className="hidden md:block relative w-full h-full max-h-[90vh]">
                  <div
                    className="relative mx-auto rounded-xl shadow-2xl border-8 border-white bg-white overflow-hidden"
                    style={{
                      width: "100%",
                      maxWidth: "900px",
                      height: "calc(900px * 1.41)",
                      maxHeight: "90vh",
                    }}
                  >
                    <iframe
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  </div>
                </div>

                {/* Mobile: Full-width preview with vertical scrolling */}
                <div className="md:hidden w-full h-full">
                  <div className="relative w-full h-full">
                    <iframe
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full min-h-[80vh] rounded-xl shadow-2xl border-4 border-white bg-white"
                      title="PDF Preview"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Button for Mobile Download */}
          {activeMobileTab === "preview" && pdfUrl && (
            <div className="md:hidden fixed bottom-6 right-6 z-30">
              <Button
                size="lg"
                onClick={handleDownload}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all"
              >
                <Download className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
