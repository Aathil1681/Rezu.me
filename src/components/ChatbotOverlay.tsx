"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  X,
  Send,
  Copy,
  Sparkles,
  Bot,
  Loader2,
  CheckCircle2,
  Wand2,
  Edit,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  action?: "copy" | "apply" | "suggest";
  latexContent?: string;
}

interface ChatbotOverlayProps {
  currentLatex: string;
  onLatexUpdate: (newLatex: string) => void;
}

export default function ChatbotOverlay({
  currentLatex,
  onLatexUpdate,
}: ChatbotOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [appliedMessageId, setAppliedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI resume assistant. I can help you:\n\n• Convert plain text to LaTeX format\n• Suggest improvements to your resume\n• Add new sections based on your instructions\n• Optimize your existing content",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "2",
      content:
        'Try asking me:\n\n"Add a skills section with React and TypeScript"\n"Make my experience section more professional"\n"Convert this to LaTeX: Senior Developer with 8 years of cloud experience"',
      isUser: false,
      timestamp: new Date(Date.now() + 1000),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleAIChat = async (userMessage: string) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          currentLatex: currentLatex,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Create AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          data.response || "I've processed your request. Here's the result:",
        isUser: false,
        timestamp: new Date(),
        action: data.latex ? "apply" : "suggest",
        latexContent: data.latex,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I encountered an error processing your request. Please try again or rephrase your question.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Process the message
    if (
      input.toLowerCase().includes("convert") ||
      input.toLowerCase().includes("to latex")
    ) {
      // Handle conversion locally for simple cases
      setTimeout(() => {
        const latexResponse = convertToLatex(input);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Here's your text converted to LaTeX:\n\n\`\`\`latex\n${latexResponse}\n\`\`\`\n\nYou can copy this or apply it directly to your resume.`,
          isUser: false,
          timestamp: new Date(),
          action: "apply",
          latexContent: latexResponse,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 1000);
    } else {
      // Use AI for complex requests
      await handleAIChat(input);
    }
  };

  const convertToLatex = (text: string): string => {
    let latex = text.trim();

    // Check if it's a command to add/modify
    if (
      latex.toLowerCase().includes("add") ||
      latex.toLowerCase().includes("create")
    ) {
      if (latex.toLowerCase().includes("skill")) {
        return `\\section{Skills}\n\\begin{itemize}\n\\item ${extractSkills(latex).join("\n\\item ")}\n\\end{itemize}`;
      } else if (
        latex.toLowerCase().includes("experience") ||
        latex.toLowerCase().includes("work")
      ) {
        return `\\section{Experience}\n\\resumeSubHeadingListStart\n\\resumeSubheading{Company Name}{Location}{Position}{Date}\n\\resumeItemListStart\n\\resumeItem{Accomplishment 1}\n\\resumeItem{Accomplishment 2}\n\\resumeItemListEnd\n\\resumeSubHeadingListEnd`;
      } else if (latex.toLowerCase().includes("education")) {
        return `\\section{Education}\n\\resumeSubHeadingListStart\n\\resumeSubheading{University Name}{Location}{Degree}{Date}\n\\resumeSubHeadingListEnd`;
      }
    }

    // Simple conversion rules
    latex = latex.replace(/•\s*/g, "\\item ");

    if (latex.match(/^#[^#]/)) {
      latex = latex.replace(/^#\s*(.+)/, "\\section{$1}");
    } else if (latex.match(/^##[^#]/)) {
      latex = latex.replace(/^##\s*(.+)/, "\\subsection{$1}");
    }

    latex = latex.replace(/\*\*(.*?)\*\*/g, "\\textbf{$1}");
    latex = latex.replace(/\*(.*?)\*/g, "\\textit{$1}");

    if (latex.includes("\\item")) {
      latex = `\\begin{itemize}\n${latex}\n\\end{itemize}`;
    }

    return latex;
  };

  const extractSkills = (text: string): string[] => {
    const skillKeywords = [
      "JavaScript",
      "TypeScript",
      "Python",
      "React",
      "Node.js",
      "Next.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "Docker",
      "AWS",
      "Git",
      "Tailwind",
      "Prisma",
      "GraphQL",
      "REST",
      "API",
      "HTML",
      "CSS",
    ];

    const foundSkills = skillKeywords.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase()),
    );

    return foundSkills.length > 0
      ? foundSkills
      : ["Your skill 1", "Your skill 2", "Your skill 3"];
  };

  const handleCopy = (content: string, messageId: string) => {
    const latexMatch = content.match(/```latex\n([\s\S]*?)\n```/);
    const textToCopy = latexMatch ? latexMatch[1] : content;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleApply = (latexContent: string, messageId: string) => {
    if (latexContent) {
      onLatexUpdate(latexContent);
      setAppliedMessageId(messageId);
      setTimeout(() => setAppliedMessageId(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    {
      text: "Add skills section",
      prompt: "Add a skills section with React, TypeScript, and Node.js",
    },
    {
      text: "Improve experience",
      prompt:
        "Make my experience section more professional and achievement-oriented",
    },
    {
      text: "Add education",
      prompt: "Add an education section for Computer Science degree",
    },
    {
      text: "Convert to LaTeX",
      prompt: "Convert: Senior Full Stack Developer with 5 years experience",
    },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all group"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-400 to-teal-500 p-1 rounded-full animate-pulse">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl h-[600px] bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-zinc-200/50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-none flex items-center justify-between p-4 border-b border-zinc-200/50 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 p-1 rounded-full">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-800">
                    AI Resume Assistant
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Enhance and edit your resume with AI
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 rounded-full hover:bg-white/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.isUser
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        : "bg-white border border-zinc-200/50 shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* Action buttons for AI messages */}
                    {!message.isUser && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="flex gap-2">
                          {message.latexContent && (
                            <>
                              <Button
                                size="sm"
                                variant={
                                  copiedMessageId === message.id
                                    ? "default"
                                    : "outline"
                                }
                                className={`h-7 text-xs ${
                                  copiedMessageId === message.id
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "border-zinc-300 hover:bg-zinc-100"
                                }`}
                                onClick={() =>
                                  handleCopy(message.content, message.id)
                                }
                              >
                                {copiedMessageId === message.id ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy LaTeX
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  appliedMessageId === message.id
                                    ? "default"
                                    : "secondary"
                                }
                                className={`h-7 text-xs ${
                                  appliedMessageId === message.id
                                    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                                    : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                                }`}
                                onClick={() =>
                                  handleApply(message.latexContent!, message.id)
                                }
                              >
                                {appliedMessageId === message.id ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Applied!
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="w-3 h-3 mr-1" />
                                    Apply to Resume
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-white border border-zinc-200/50 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span className="text-sm text-zinc-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none border-t border-zinc-200/50 p-4 bg-gradient-to-r from-gray-50 to-white">
              {/* Quick Prompts */}
              <div className="mb-3">
                <p className="text-xs text-zinc-500 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setInput(prompt.prompt)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {prompt.text}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tell me what to add or change in your resume..."
                    className="w-full min-h-[60px] max-h-[120px] p-3 pr-10 text-sm rounded-xl border border-zinc-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none outline-none"
                    rows={3}
                  />
                  <div className="absolute right-2 bottom-2 text-xs text-zinc-400">
                    Enter to send • Shift+Enter for new line
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-auto px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
