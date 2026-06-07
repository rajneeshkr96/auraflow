"use client";

import { useEffect, useState } from "react";
import {
  Bot, Check, X, Loader2, RefreshCw, Database, Clock,
  CheckCircle2, XCircle, AlertCircle, MessageSquare, Filter,
  Cpu, ExternalLink, ChevronDown, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NEURAL_WEB_URL = process.env.NEXT_PUBLIC_NEURAL_WEB_URL || "http://localhost:3008";
const AURAFLOW_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3004";

type RequestStatus = "pending" | "approved" | "rejected";

interface ModelRequest {
  id: string;
  userId: number;
  listenerId: string;
  neuralAgentId: string;
  requestedModelId: string;
  requestedModelName: string;
  status: RequestStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Status Badge ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RequestStatus }) {
  const config = {
    pending: { icon: Clock, label: "Pending", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    approved: { icon: CheckCircle2, label: "Approved", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected: { icon: XCircle, label: "Rejected", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  }[status];

  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border", config.cls)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ── Action Dialog ────────────────────────────────────────────────────────
function ActionDialog({
  open,
  request,
  action,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  request: ModelRequest | null;
  action: "approve" | "reject";
  onClose: () => void;
  onConfirm: (note: string) => void;
  loading: boolean;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  if (!open || !request) return null;

  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={cn(
          "flex items-center gap-3 px-6 py-5 border-b border-border",
          isApprove ? "bg-emerald-500/5" : "bg-red-500/5"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
            isApprove ? "bg-emerald-500/15 border-emerald-500/30" : "bg-red-500/15 border-red-500/30"
          )}>
            {isApprove
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              : <XCircle className="w-5 h-5 text-red-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm">{isApprove ? "Approve Model Request" : "Reject Model Request"}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isApprove
                ? `This will switch the agent to "${request.requestedModelName}" immediately.`
                : "The user's automation agent will remain on the default model."}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Request details */}
        <div className="px-6 pt-4 pb-2">
          <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requested Model</span>
              <span className="font-bold font-mono">{request.requestedModelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model ID</span>
              <code className="font-mono text-[10px] text-primary">{request.requestedModelId}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono">{request.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Neural Agent</span>
              <a
                href={`${NEURAL_WEB_URL}/agents/${request.neuralAgentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline inline-flex items-center gap-1"
              >
                {request.neuralAgentId.slice(0, 12)}… <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Admin note */}
        <div className="px-6 py-4 space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Admin Note {isApprove ? "(optional)" : "(recommended)"}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={isApprove
              ? "e.g. Approved — BYOK verified, usage within limits"
              : "e.g. Model not supported for automation agents at this tier"}
            className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            className={cn(
              "flex-1 h-10 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              isApprove ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
            )}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : isApprove ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {isApprove ? "Approve & Switch Model" : "Reject Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function AdminModelRequestsPage() {
  const [requests, setRequests] = useState<ModelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("pending");
  const [filterOpen, setFilterOpen] = useState(false);

  // Dialog state
  const [dialog, setDialog] = useState<{
    open: boolean;
    request: ModelRequest | null;
    action: "approve" | "reject";
  }>({ open: false, request: null, action: "approve" });

  const loadRequests = async (filter: RequestStatus | "all" = statusFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/admin/model-requests?status=${filter}`);
      if (res.status === 403) {
        toast.error("Access denied — admin only");
        return;
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleFilterChange = (f: RequestStatus | "all") => {
    setStatusFilter(f);
    setFilterOpen(false);
    loadRequests(f);
  };

  const openDialog = (request: ModelRequest, action: "approve" | "reject") => {
    setDialog({ open: true, request, action });
  };

  const handleConfirm = async (adminNote: string) => {
    if (!dialog.request) return;
    setActioning(true);
    try {
      const res = await fetch("/api/agent/admin/model-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: dialog.request.id,
          action: dialog.action,
          adminNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setDialog({ open: false, request: null, action: "approve" });
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setActioning(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const filterLabels: Record<RequestStatus | "all", string> = {
    all: "All Requests",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <div className="space-y-8">
      <ActionDialog
        open={dialog.open}
        request={dialog.request}
        action={dialog.action}
        onClose={() => setDialog(p => ({ ...p, open: false }))}
        onConfirm={handleConfirm}
        loading={actioning}
      />

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">BYOK Model Requests</h1>
              {pendingCount > 0 && (
                <p className="text-xs text-amber-400 font-bold mt-0.5">
                  {pendingCount} pending {pendingCount === 1 ? "request" : "requests"} awaiting review
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-[52px]">
            Review and approve users' requests to use their own BYOK models for automation AI agents.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(v => !v)}
              className="flex items-center gap-2 h-9 px-4 rounded-full border border-border bg-secondary hover:bg-secondary/80 text-sm font-bold text-muted-foreground transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              {filterLabels[statusFilter]}
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", filterOpen && "rotate-180")} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-20">
                {(["pending", "approved", "rejected", "all"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm font-bold transition-colors hover:bg-secondary",
                      statusFilter === f ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {statusFilter === f && <Check className="w-3.5 h-3.5 inline mr-2" />}
                    {filterLabels[f]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => loadRequests()}
            disabled={loading}
            className="w-9 h-9 rounded-full border border-border bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", count: requests.filter(r => r.status === "pending").length, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Approved", count: requests.filter(r => r.status === "approved").length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Rejected", count: requests.filter(r => r.status === "rejected").length, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
        ].map(stat => (
          <div key={stat.label} className={cn("rounded-2xl border p-4", stat.bg)}>
            <p className={cn("text-2xl font-black", stat.color)}>{stat.count}</p>
            <p className="text-xs font-bold text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl border border-border bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-3xl text-muted-foreground">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center">
            <Database className="w-6 h-6 opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground mb-1">No {statusFilter === "all" ? "" : statusFilter} requests</p>
            <p className="text-xs">
              {statusFilter === "pending"
                ? "All caught up! No model requests waiting for review."
                : `No ${statusFilter} requests found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-start gap-5 p-5 rounded-2xl border border-border bg-background hover:border-primary/20 transition-all group"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold">{req.requestedModelName}</span>
                  <code className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {req.requestedModelId}
                  </code>
                  <StatusBadge status={req.status as RequestStatus} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    Agent:
                    <a
                      href={`${NEURAL_WEB_URL}/agents/${req.neuralAgentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline ml-1"
                    >
                      {req.neuralAgentId.slice(0, 16)}…
                    </a>
                  </span>
                  <span>User #{req.userId}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>

                {req.adminNote && (
                  <div className="flex items-start gap-1.5 mt-1">
                    <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground italic">{req.adminNote}</p>
                  </div>
                )}
              </div>

              {/* Actions — only show for pending */}
              {req.status === "pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openDialog(req, "approve")}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => openDialog(req, "reject")}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}

              {/* View-only badge for actioned requests */}
              {req.status !== "pending" && (
                <div className="shrink-0">
                  <a
                    href={`${NEURAL_WEB_URL}/agents/${req.neuralAgentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border text-muted-foreground text-[11px] font-bold hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Agent
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info callout */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-primary">How BYOK Model Requests work</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            When a user requests a custom model, the automation agent remains on the default model until you approve.
            On approval, the neural agent's model is switched immediately via neural-api.
            The user can see their request status in the Automation builder.
          </p>
        </div>
      </div>
    </div>
  );
}
