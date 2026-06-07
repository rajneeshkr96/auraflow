'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Send, Bot, User, Check, ShieldAlert, Zap, ZapOff,
  UserCheck, AlertCircle, FileText, Plus, X, MessageSquare,
  Clock, Sparkles, Filter, Smile, Paperclip,
  CheckSquare, BookOpen, Star, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  getConversations,
  toggleConversationAi,
  addConversationTag,
  removeConversationTag,
  updateConversationNotes,
  sendInboxMessage
} from '@/actions/inbox';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Thread {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  lastMessage: string;
  lastActive: string;
  unreadCount: number;
  aiActive: boolean;
  tags: string[];
  notes: string;
  messages: Message[];
}

const QUICK_TEMPLATES = [
  { label: 'Freebie Link', text: 'Hi! Here is your exclusive access link to our templates: https://auraflow.codeswayam.com/freebie. Let me know if you have any questions!' },
  { label: 'Pricing Info', text: 'Hi! Our Pro plan is ₹999/month, which includes unlimited automation flows, AI DM responses, and advanced analytics. You can sign up here: https://auraflow.codeswayam.com/pricing' },
  { label: 'Manual Takeover', text: 'Hi there, I am taking over this chat manually to assist you. How can I help you today?' },
  { label: 'Support Ticket', text: 'Got it. I have raised a support ticket for our engineering team. We will update you here as soon as we resolve this.' },
];

function mapDbConversationToThread(conv: any): Thread {
  const messages: Message[] = (conv.messages || []).map((m: any) => ({
    id: m.id,
    sender: (m.senderType || (m.role === 'USER' ? 'user' : 'bot')) as 'user' | 'bot' | 'agent',
    text: m.content,
    timestamp: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date(m.createdAt).toISOString(),
    status: 'read',
  }));

  const lastMsgObj = messages[messages.length - 1];
  const lastMessage = lastMsgObj ? lastMsgObj.text : 'No messages yet';
  const lastActive = lastMsgObj 
    ? lastMsgObj.timestamp 
    : (conv.createdAt instanceof Date ? conv.createdAt.toISOString() : new Date(conv.createdAt).toISOString());

  return {
    id: conv.id,
    username: conv.username || `@ig_user_${conv.recipientId.slice(-4)}`,
    fullName: conv.fullName || `Instagram User ${conv.recipientId.slice(-4)}`,
    avatarUrl: conv.avatarUrl || undefined,
    lastMessage,
    lastActive,
    unreadCount: 0, 
    aiActive: conv.aiActive,
    tags: conv.tags || [],
    notes: conv.notes || '',
    messages,
  };
}

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'ai_active' | 'manual'>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localNotes, setLocalNotes] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load active conversations
  useEffect(() => {
    async function loadData() {
      setRefreshing(true);
      try {
        const dbConvs = await getConversations();
        const mapped = dbConvs.map(mapDbConversationToThread);
        setThreads(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      } catch (err: any) {
        toast.error("Failed to load conversation history.");
      } finally {
        setRefreshing(false);
      }
    }
    loadData();
  }, []);

  const selectedThread = useMemo(() => {
    return threads.find(t => t.id === selectedId) || null;
  }, [threads, selectedId]);

  // Sync internal notes text values when switching conversation items
  useEffect(() => {
    if (selectedThread) {
      setLocalNotes(selectedThread.notes);
    } else {
      setLocalNotes('');
    }
  }, [selectedId, selectedThread?.notes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread?.messages, isTyping]);

  // Search and Filter
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchSearch = t.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          t.username.toLowerCase().includes(search.toLowerCase()) ||
                          t.lastMessage.toLowerCase().includes(search.toLowerCase());
      
      const matchFilter = 
        filterTab === 'all' ? true :
        filterTab === 'unread' ? t.unreadCount > 0 :
        filterTab === 'ai_active' ? t.aiActive :
        filterTab === 'manual' ? !t.aiActive : true;

      return matchSearch && matchFilter;
    });
  }, [threads, search, filterTab]);

  // Manual inbox refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const dbConvs = await getConversations();
      const mapped = dbConvs.map(mapDbConversationToThread);
      setThreads(mapped);
      if (mapped.length > 0 && !mapped.some(t => t.id === selectedId)) {
        setSelectedId(mapped[0].id);
      }
      toast.success("Inbox refreshed!");
    } catch {
      toast.error("Failed to refresh conversation history.");
    } finally {
      setRefreshing(false);
    }
  };

  // Send message handler with optimistic UI updates
  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim() || !selectedThread) return;

    const text = textToSend.trim();
    setInputMessage('');
    setShowQuickTemplates(false);

    const tempMsgId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempMsgId,
      sender: 'agent',
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    // Update state optimistically
    setThreads(prev => prev.map(t => {
      if (t.id === selectedThread.id) {
        return {
          ...t,
          lastMessage: text,
          lastActive: optimisticMessage.timestamp,
          messages: [...t.messages, optimisticMessage],
        };
      }
      return t;
    }));

    try {
      const res = await sendInboxMessage(selectedThread.id, text);
      if (res.success && res.message) {
        // Swap temp client ID with permanent server ID
        setThreads(prev => prev.map(t => {
          if (t.id === selectedThread.id) {
            const finalMsgs = t.messages.map(m => 
              m.id === tempMsgId 
                ? {
                    id: res.message.id,
                    sender: 'agent' as const,
                    text: res.message.content,
                    timestamp: new Date(res.message.createdAt).toISOString(),
                    status: 'sent' as const,
                  }
                : m
            );
            return { ...t, messages: finalMsgs };
          }
          return t;
        }));
        toast.success('Message sent!');
      } else {
        throw new Error(res.error || 'Failed to send message');
      }
    } catch (err: any) {
      toast.error(`Error sending message: ${err.message}`);
      // Revert optimistic message on failure
      setThreads(prev => prev.map(t => {
        if (t.id === selectedThread.id) {
          const originalMsgs = t.messages.filter(m => m.id !== tempMsgId);
          const lastMsg = originalMsgs[originalMsgs.length - 1];
          return {
            ...t,
            lastMessage: lastMsg ? lastMsg.text : 'No messages',
            lastActive: lastMsg ? lastMsg.timestamp : new Date(t.lastActive).toISOString(),
            messages: originalMsgs
          };
        }
        return t;
      }));
    }
  };

  // Toggle AI Copilot for contact
  const toggleAi = async (id: string) => {
    // Toggle optimistically
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, aiActive: !t.aiActive };
      }
      return t;
    }));

    try {
      const res = await toggleConversationAi(id);
      if (res.success) {
        toast.info(res.aiActive ? 'AI Copilot activated for this contact' : 'AI Copilot paused. Manual override active.');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(`Failed to update AI state: ${err.message}`);
      // Revert optimistic toggle
      setThreads(prev => prev.map(t => {
        if (t.id === id) {
          return { ...t, aiActive: !t.aiActive };
        }
        return t;
      }));
    }
  };

  // Add tag handler
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !selectedThread) return;
    const tag = newTag.trim();
    if (selectedThread.tags.includes(tag)) {
      toast.error('Tag already exists');
      return;
    }

    setNewTag('');

    // Add optimistically
    setThreads(prev => prev.map(t => {
      if (t.id === selectedThread.id) {
        return { ...t, tags: [...t.tags, tag] };
      }
      return t;
    }));

    try {
      const res = await addConversationTag(selectedThread.id, tag);
      if (res.success) {
        toast.success('Tag added');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(`Failed to add tag: ${err.message}`);
      // Revert tag
      setThreads(prev => prev.map(t => {
        if (t.id === selectedThread.id) {
          return { ...t, tags: t.tags.filter(tg => tg !== tag) };
        }
        return t;
      }));
    }
  };

  // Remove tag handler
  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedThread) return;

    // Remove optimistically
    setThreads(prev => prev.map(t => {
      if (t.id === selectedThread.id) {
        return { ...t, tags: t.tags.filter(tag => tag !== tagToRemove) };
      }
      return t;
    }));

    try {
      const res = await removeConversationTag(selectedThread.id, tagToRemove);
      if (res.success) {
        toast.success('Tag removed');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(`Failed to remove tag: ${err.message}`);
      // Revert tag
      setThreads(prev => prev.map(t => {
        if (t.id === selectedThread.id) {
          return { ...t, tags: [...t.tags, tagToRemove] };
        }
        return t;
      }));
    }
  };

  // Save notes on blur
  const handleNotesBlur = async () => {
    if (!selectedThread || localNotes === selectedThread.notes) return;

    try {
      const res = await updateConversationNotes(selectedThread.id, localNotes);
      if (res.success) {
        setThreads(prev => prev.map(t => {
          if (t.id === selectedThread.id) {
            return { ...t, notes: localNotes };
          }
          return t;
        }));
        toast.success('Notes auto-saved');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(`Failed to save notes: ${err.message}`);
      setLocalNotes(selectedThread.notes);
    }
  };

  const handleSelectThread = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-3xl overflow-hidden min-h-[600px] flex-1">
      {/* Inbox Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_280px] h-full divide-x divide-border flex-1 overflow-hidden">
        
        {/* ================= LEFT COLUMN: THREAD LIST ================= */}
        <div className="flex flex-col h-full overflow-hidden bg-muted/10">
          {/* Top Search & Stats */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Inbox
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                  title="Refresh conversations"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                </button>
                <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  {threads.reduce((acc, t) => acc + t.unreadCount, 0)} New
                </span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search inbox..."
                className="w-full h-10 pl-9 pr-4 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-border p-1 bg-muted/40 gap-1">
            {([
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'ai_active', label: 'AI' },
              { id: 'manual', label: 'Manual' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={cn(
                  'flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all',
                  filterTab === tab.id
                    ? 'bg-background shadow-sm text-foreground border border-border/50'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <Filter className="w-8 h-8 opacity-25" />
                <p className="text-xs font-semibold">No conversations found</p>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = thread.id === selectedId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={cn(
                      'flex items-start gap-3 p-4 cursor-pointer hover:bg-secondary/40 transition-colors relative border-l-2 border-transparent',
                      isSelected && 'bg-secondary/70 border-primary',
                      thread.unreadCount > 0 && 'font-semibold bg-primary/5'
                    )}
                  >
                    {/* Avatar with status indicator */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center font-bold text-xs text-primary overflow-hidden">
                        {thread.avatarUrl ? (
                          <img src={thread.avatarUrl} alt="" className="object-cover w-full h-full" />
                        ) : (
                          thread.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background flex items-center justify-center text-[8px] text-white shadow-sm',
                        thread.aiActive ? 'bg-primary' : 'bg-amber-500'
                      )} title={thread.aiActive ? 'AI Automations Active' : 'Manual Response Only'}>
                        {thread.aiActive ? <Bot className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                      </span>
                    </div>

                    {/* Meta & preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold truncate text-foreground">{thread.fullName}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(thread.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{thread.lastMessage}</p>
                      
                      {/* Tags row */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {thread.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] font-bold bg-muted border border-border px-1.5 py-0.5 rounded-md text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {thread.tags.length > 2 && (
                          <span className="text-[9px] font-bold text-muted-foreground">+{thread.tags.length - 2}</span>
                        )}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {thread.unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-primary absolute top-4 right-4 animate-pulse" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= CENTER COLUMN: CHAT INTERFACE ================= */}
        <div className="flex flex-col h-full overflow-hidden bg-background">
          {selectedThread ? (
            <>
              {/* Chat Top Bar */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center font-bold text-sm text-primary">
                    {selectedThread.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      {selectedThread.fullName}
                      <span className="text-xs font-mono text-muted-foreground">{selectedThread.username}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('w-2 h-2 rounded-full', selectedThread.aiActive ? 'bg-emerald-500' : 'bg-amber-500')} />
                      <span className="text-[10px] text-muted-foreground">
                        {selectedThread.aiActive ? 'AI Assistant is processing comments/DMs' : 'Manual override active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Automation Action Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAi(selectedThread.id)}
                    className={cn(
                      'h-9 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all',
                      selectedThread.aiActive
                        ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'border-primary/20 text-primary bg-primary/5 hover:bg-primary/10'
                    )}
                  >
                    {selectedThread.aiActive ? (
                      <>
                        <ZapOff className="w-3.5 h-3.5" /> Pause AI Copilot
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 animate-pulse" /> Activate AI Copilot
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message Feed Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
                {selectedThread.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-end gap-2.5 max-w-[80%]',
                        isUser ? 'mr-auto' : 'ml-auto flex-row-reverse'
                      )}
                    >
                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden text-[9px] font-bold text-primary">
                        {isUser ? (
                          <User className="w-3 h-3 text-muted-foreground" />
                        ) : isBot ? (
                          <Bot className="w-3 h-3 text-primary" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-violet-600" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-1">
                        <div
                          className={cn(
                            'p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm',
                            isUser
                              ? 'bg-card border border-border rounded-bl-none text-foreground'
                              : isBot
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-violet-600 text-white rounded-br-none'
                          )}
                        >
                          {/* AI Response Header tag */}
                          {isBot && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-md w-fit mb-1.5 uppercase tracking-wider">
                              <Bot className="w-2.5 h-2.5" /> AI Autopilot
                            </div>
                          )}
                          {msg.sender === 'agent' && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-md w-fit mb-1.5 uppercase tracking-wider">
                              <UserCheck className="w-2.5 h-2.5" /> Team Agent
                            </div>
                          )}
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                        <div className={cn('flex items-center gap-1 text-[9px] text-muted-foreground', isUser ? '' : 'justify-end')}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {!isUser && <Check className="w-3 h-3 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* AI Typings indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-primary animate-bounce" />
                    </div>
                    <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2.5 rounded-2xl rounded-br-none text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] font-bold ml-1.5">AI is drafting reply...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="p-4 border-t border-border space-y-3 bg-card sticky bottom-0">
                {/* Quick Templates Panel */}
                {showQuickTemplates && (
                  <div className="border border-border/80 rounded-2xl p-3 bg-muted/30 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="col-span-full flex items-center justify-between pb-1 border-b border-border/40">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Select Quick Template
                      </p>
                      <button onClick={() => setShowQuickTemplates(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {QUICK_TEMPLATES.map(tmpl => (
                      <button
                        key={tmpl.label}
                        onClick={() => handleSendMessage(tmpl.text)}
                        className="text-left p-2.5 rounded-xl border border-border/50 bg-background hover:bg-secondary/40 hover:border-primary/30 transition-all text-xs space-y-1 group"
                      >
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" /> {tmpl.label}
                        </p>
                        <p className="text-muted-foreground text-[10px] line-clamp-1">{tmpl.text}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Toolbar under input */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowQuickTemplates(p => !p)}
                      className={cn(
                        'h-8 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all',
                        showQuickTemplates ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Templates
                    </button>
                    <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Attach file (mock)">
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Insert Emoji (mock)">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">
                    Press Enter to send, Shift+Enter for newline
                  </span>
                </div>

                {/* Input Text box */}
                <div className="flex gap-2">
                  <textarea
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={selectedThread.aiActive ? "Type manual message (AI Copilot is ACTIVE)..." : "Type manual reply..."}
                    rows={1}
                    className="flex-1 px-4 py-3 bg-secondary/35 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs resize-none min-h-[44px] max-h-[120px]"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="h-11 px-5 bg-primary text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <MessageSquare className="w-12 h-12 opacity-15" />
              <p className="font-semibold">Select a conversation to start messaging</p>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: CONTACT DETAIL PANEL ================= */}
        {selectedThread && (
          <div className="hidden lg:flex flex-col h-full overflow-hidden bg-card">
            {/* Top Header */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contact Details</p>
            </div>

            {/* Profile block */}
            <div className="p-6 border-b border-border flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-[24px] bg-secondary border border-border flex items-center justify-center font-bold text-lg text-primary shadow-sm">
                {selectedThread.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{selectedThread.fullName}</h4>
                <p className="text-xs text-muted-foreground">{selectedThread.username}</p>
              </div>

              {/* AI Badge status */}
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border',
                selectedThread.aiActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              )}>
                {selectedThread.aiActive ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {selectedThread.aiActive ? 'AI Copilot Active' : 'Manual Input Override'}
              </div>
            </div>

            {/* Metadata Tags */}
            <div className="p-6 border-b border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1"><Star className="w-3 h-3" /> Lead Tags</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedThread.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-secondary text-foreground px-2.5 py-1 rounded-lg border border-border/45">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="text-muted-foreground hover:text-destructive transition-colors ml-0.5">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-1.5 mt-2">
                <input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="New tag..."
                  className="flex-1 h-8 px-2 text-[10px] bg-secondary/50 border border-border rounded-lg focus:outline-none"
                />
                <button type="submit" className="h-8 w-8 bg-foreground text-background rounded-lg flex items-center justify-center hover:opacity-90">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Editable Notes Section */}
            <div className="p-6 flex-1 flex flex-col min-h-0 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1"><FileText className="w-3 h-3" /> Internal Notes</p>
              <textarea
                value={localNotes}
                onChange={e => setLocalNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes about this contact (deals, issues, requirements)..."
                className="w-full flex-1 p-3 bg-secondary/25 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary/25 resize-none leading-relaxed"
              />
              <p className="text-[9px] text-muted-foreground italic">
                Notes are auto-saved on blur and only visible to team members.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
