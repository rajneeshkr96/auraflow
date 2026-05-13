"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bot, ExternalLink, Send, Loader2, CheckCircle2,
  AlertCircle, MessageSquare, Settings, Sparkles, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const NEURAL_WEB_URL = process.env.NEXT_PUBLIC_NEURAL_WEB_URL || "http://localhost:3008";
const MAX_TEST_MESSAGES = 5;

interface AgentInfo {
  id: string;
  name: string;
  model: string;
  status: string;
  guardrailsEnabled: boolean;
  managedByApp: string | null;
}

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  listenerId: string;
  automationId: string;
  initialPrompt: string;
}

export default function AgentPanel({ listenerId, automationId, initialPrompt }: Props) {
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Test chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const sessionId = useRef(`auraflow-test-${listenerId}-${Date.now()}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const msgCount = messages.filter((m) => m.role === "user").length;
  const testExhausted = msgCount >= MAX_TEST_MESSAGES;

  useEffect(() => {
    fetch(`/api/agent?listenerId=${listenerId}`)
      .then((r) => r.json())
      .then((d) => {
        setAgent(d.agent ?? null);
        if (d.prompt) setPrompt(d.prompt);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listenerId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSavePrompt = async () => {
    if (!prompt.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/agent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listenerId, prompt }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSaved(true);
      toast.success("AI prompt saved");
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save prompt");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!input.trim() || testExhausted || chatLoading || !agent) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, message: userMsg, sessionId: sessionId.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error: " + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-[24px] bg-secondary border border-border">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="text-sm font-bold text-muted-foreground">Loading AI Agent...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Status Header */}
      <div className="flex items-center justify-between p-5 rounded-[24px] bg-foreground text-background">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">
                {agent ? agent.name : "Agent not provisioned yet"}
              </span>
              {agent && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                  agent.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/50"
                }`}>
                  {agent.status}
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              {agent
                ? `Model: ${agent.model} · Guardrails: ${agent.guardrailsEnabled ? "On" : "Off"} · Managed by Auraflow`
                : "Will be created automatically when automation first triggers"}
            </p>
          </div>
        </div>

        {agent && (
          <div className="flex items-center gap-2">
            {/* Advanced config deep-link to neural-web */}
            <a
              href={`${NEURAL_WEB_URL}/agents/${agent.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all"
              title="Advanced configuration in NeuralHub (KB, guardrails, analytics)"
            >
              <Settings className="w-3.5 h-3.5" />
              Advanced
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            {/* Test chat toggle */}
            <button
              onClick={() => setChatOpen((v) => !v)}
              className="flex items-center gap-2 h-9 px-4 rounded-full bg-primary hover:bg-primary/90 text-white text-[11px] font-bold transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Test ({MAX_TEST_MESSAGES - msgCount} left)
            </button>
          </div>
        )}
      </div>

      {/* Prompt Editor — the only editable field in Auraflow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            AI System Prompt
          </label>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
            <span className="px-2 py-0.5 rounded-full bg-secondary border border-border">
              Model: gemini-2.0-flash · Locked
            </span>
          </div>
        </div>

        <textarea
          rows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="You are a helpful Instagram DM assistant for [Your Brand]. Reply naturally and concisely. If someone asks about pricing, share our packages. Always end with a question to keep the conversation going."
          className="w-full px-5 py-4 rounded-[20px] border border-border bg-foreground text-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-white/20 leading-relaxed"
        />

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            This prompt defines your AI's personality and behavior.{" "}
            {agent && (
              <a
                href={`${NEURAL_WEB_URL}/agents/${agent.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Configure KB & guardrails in NeuralHub
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </p>
          <button
            onClick={handleSavePrompt}
            disabled={saving || !prompt.trim()}
            className="flex items-center gap-2 h-9 px-5 rounded-full bg-primary text-white text-[11px] font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Prompt"}
          </button>
        </div>
      </div>

      {/* Inline Test Chat — max 5 messages */}
      {chatOpen && agent && (
        <div className="rounded-[24px] border border-border overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 bg-secondary border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold">Test Chat</span>
              <span className="text-[10px] text-muted-foreground">
                · {MAX_TEST_MESSAGES - msgCount} messages remaining
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMessages([]);
                  sessionId.current = `auraflow-test-${listenerId}-${Date.now()}`;
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Bot className="w-8 h-8 opacity-20" />
                <p className="text-xs font-bold">Send a test message to preview your AI agent</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-secondary border border-border text-foreground rounded-bl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-secondary border border-border">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-secondary/30">
            {testExhausted ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold py-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Test limit reached. Reset to test again, or{" "}
                <a
                  href={`${NEURAL_WEB_URL}/agents/${agent.id}/playground`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  open full playground in NeuralHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendTest()}
                  placeholder="Type a test message..."
                  disabled={chatLoading}
                  className="flex-1 px-4 py-2 text-sm bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  onClick={handleSendTest}
                  disabled={!input.trim() || chatLoading}
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No agent yet — info box */}
      {!agent && (
        <div className="flex items-start gap-3 p-4 rounded-[20px] bg-primary/5 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary font-medium leading-relaxed">
            Your AI agent will be automatically provisioned the first time this automation triggers a DM.
            Write your prompt above and save it — it will be applied when the agent is created.
          </p>
        </div>
      )}
    </div>
  );
}
