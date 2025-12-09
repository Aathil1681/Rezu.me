"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  Scan,
  CheckCircle,
  Zap,
  Shield,
  Users,
  Star,
  TrendingUp,
  Brain,
  Rocket,
} from "lucide-react";

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: FeatureCardProps) {
  return (
    <div
      className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-200/50 shadow-lg transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${color} shadow-lg`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-800 mb-2">{title}</h3>
      <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  icon: any;
  color: string;
}

function StatCard({ value, label, icon: Icon, color }: StatCardProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-zinc-200/30 shadow-sm">
      <div className={`p-2 rounded-lg mb-2 bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-zinc-500 font-medium mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const [_activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const features = [
    {
      icon: FileText,
      title: "AI-Powered CV Creation",
      description:
        "Generate professional resumes with intelligent LaTeX formatting and real-time preview.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Scan,
      title: "Smart CV Analysis",
      description:
        "Scan your resume for missing keywords and ATS optimization opportunities.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "ATS-Optimized",
      description:
        "Ensure your resume passes through Applicant Tracking Systems with high scores.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Zap,
      title: "Real-time Preview",
      description:
        "See changes instantly with our live preview feature as you edit your resume.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Industry Templates",
      description:
        "Choose from professionally designed templates for every industry and role.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Brain,
      title: "Smart Suggestions",
      description:
        "Get AI-powered suggestions to improve your resume content and structure.",
      color: "from-rose-500 to-red-500",
    },
  ];

  const stats = [
    {
      value: "98%",
      label: "ATS Success Rate",
      icon: CheckCircle,
      color: "from-emerald-400 to-green-500",
    },
    {
      value: "50K+",
      label: "Resumes Created",
      icon: Users,
      color: "from-indigo-400 to-blue-500",
    },
    {
      value: "4.9★",
      label: "User Rating",
      icon: Star,
      color: "from-amber-400 to-orange-500",
    },
    {
      value: "85%",
      label: "More Interviews",
      icon: TrendingUp,
      color: "from-purple-400 to-pink-500",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Resume",
      description: "Use our LaTeX editor or import your existing resume",
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our AI scans and optimizes for target job descriptions",
    },
    {
      number: "03",
      title: "Customize & Preview",
      description:
        "Fine-tune with real-time preview and professional templates",
    },
    {
      number: "04",
      title: "Download & Apply",
      description: "Export as PDF and start applying with confidence",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br -mt-10 from-gray-50 via-white to-indigo-50/30 text-zinc-900 overflow-hidden">
      {mounted && (
        <div className="fixed inset-0 z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}

          <div
            className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.01}px, ${
                mousePosition.y * 0.01
              }px)`,
            }}
          />
          <div
            className="absolute top-1/2 -right-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-pink-500/10 rounded-full blur-3xl"
            style={{
              transform: `translate(${mousePosition.x * -0.01}px, ${
                mousePosition.y * -0.01
              }px)`,
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative pt-20 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-16 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="!text-4xl font-sans lg:-mt-1 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Rezu.me
                </span>
              </div>

              <nav className="hidden md:flex items-center gap-6 text-xl">
                <Link
                  href="/under-construction"
                  className="text-zinc-600  hover:text-indigo-600 transition-colors font-medium"
                >
                  Features
                </Link>
                <Link
                  href="/under-construction"
                  className="text-zinc-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Templates
                </Link>
                <Link
                  href="/under-construction"
                  className="text-zinc-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="/under-construction"
                  className="text-zinc-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  About
                </Link>
              </nav>
            </div>

            {/* Hero Content */}
            <div className="text-center max-w-4xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-zinc-200/50 mb-6 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                <span className="text-xl font-medium text-zinc-700">
                  AI-Powered Resume Builder
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="text-zinc-800">Job Application Journey</span>
              </h1>

              <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Create, optimize, and analyze your resume with AI-powered tools
                that help you land more interviews and better job offers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-cv" className="sm:w-auto w-full">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Your Resume
                    <Rocket className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link href="/scan-cv" className="sm:w-auto w-full">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-8 border-2 border-zinc-300 hover:border-indigo-400 hover:bg-indigo-50 text-zinc-800 text-lg font-semibold transition-all hover:scale-105"
                  >
                    <Scan className="w-5 h-5 mr-2" />
                    Scan Existing CV
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative px-4 sm:px-6 lg:px-8 mb-32">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-zinc-800 mb-4">
                Everything You Need for the
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ml-2">
                  Perfect Resume
                </span>
              </h2>
              <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                From creation to optimization, we&apos;ve got you covered with
                our comprehensive toolkit
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} delay={index * 100} />
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="relative px-4 sm:px-6 lg:px-8 mb-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-zinc-800 mb-4">
                Get Your Dream Job in
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent ml-2">
                  4 Simple Steps
                </span>
              </h2>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 transform -translate-y-1/2" />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative h-full">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-zinc-200/50 shadow-lg text-center h-full flex flex-col justify-between">
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
                        {step.number}
                      </div>

                      <h3 className="text-lg font-semibold text-zinc-800 mb-2 mt-6">
                        {step.title}
                      </h3>
                      <p className="text-zinc-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
