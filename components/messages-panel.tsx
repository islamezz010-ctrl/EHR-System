"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";

const TEAL = "#26C6DA";

type ConversationTag = { type: "files" | "photo"; label: string };

type Conversation = {
  id: number;
  name: string;
  avatar: string;
  status: string;
  statusTyping?: boolean;
  lastMessage: string;
  time: string;
  unread: number;
  lastOnline?: string;
  tags?: ConversationTag[];
  online?: boolean;
};

type ChatMessage =
  | {
      id: string;
      type: "text";
      from: "patient" | "doctor";
      text: string;
      time: string;
      read?: boolean;
    }
  | {
      id: string;
      type: "file";
      from: "patient" | "doctor";
      fileName: string;
      fileSize: string;
      time: string;
      read?: boolean;
    }
  | { id: string; type: "date"; label: string };

type Thread = {
  conversationId: number;
  messages: ChatMessage[];
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Jonathan Wick",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    status: "writes…",
    statusTyping: true,
    lastMessage: "I've been taking the new dosage. Headaches are slightly better.",
    time: "1 minute ago",
    unread: 2,
    lastOnline: "5 hours ago",
    online: true,
  },
  {
    id: 2,
    name: "Sarah Connor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    status: "records voice message",
    statusTyping: true,
    lastMessage: "Are my HbA1c results available yet?",
    time: "12 minutes ago",
    unread: 1,
    lastOnline: "2 hours ago",
    tags: [{ type: "files", label: "Files (x2)" }],
  },
  {
    id: 3,
    name: "David Miller",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    status: "last online 5 hours ago",
    lastMessage: "The swelling has gone down. Should I start PT?",
    time: "Yesterday",
    unread: 0,
    lastOnline: "5 hours ago",
    tags: [{ type: "photo", label: "Photo" }],
  },
  {
    id: 4,
    name: "Emily Chen",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    status: "last online yesterday",
    lastMessage: "Can we discuss preventative options for migraines?",
    time: "2 days ago",
    unread: 0,
    lastOnline: "yesterday",
  },
  {
    id: 5,
    name: "Olivia Taylor",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150",
    status: "last online 3 days ago",
    lastMessage: "Thank you for the prenatal vitamin recommendation.",
    time: "3 days ago",
    unread: 0,
    lastOnline: "3 days ago",
  },
];

const INITIAL_THREADS: Thread[] = [
  {
    conversationId: 1,
    messages: [
      { id: "d1", type: "date", label: "3 days ago" },
      {
        id: "m1",
        type: "text",
        from: "patient",
        text: "Good morning, Dr. I wanted to follow up on my blood pressure medication adjustment.",
        time: "3 days ago",
      },
      {
        id: "m2",
        type: "text",
        from: "doctor",
        text: "Good morning Jonathan. How have you been feeling since we increased the Lisinopril dosage?",
        time: "3 days ago",
        read: true,
      },
      { id: "d2", type: "date", label: "Yesterday" },
      {
        id: "m3",
        type: "file",
        from: "patient",
        fileName: "x-ray.pdf",
        fileSize: "41.36 Mb",
        time: "4 days ago",
      },
      {
        id: "m4",
        type: "text",
        from: "patient",
        text: "I've attached my latest imaging results from the clinic visit.",
        time: "Yesterday",
      },
      {
        id: "m5",
        type: "text",
        from: "doctor",
        text: "Thank you for sending those over. The results look stable. Let's continue monitoring for another two weeks.",
        time: "Yesterday",
        read: true,
      },
      {
        id: "m6",
        type: "text",
        from: "patient",
        text: "I've been taking the new dosage. My morning headaches are slightly better.",
        time: "1 minute ago",
      },
    ],
  },
  {
    conversationId: 2,
    messages: [
      { id: "d1", type: "date", label: "Yesterday" },
      {
        id: "m1",
        type: "text",
        from: "patient",
        text: "Hi Dr, I had my blood work done last week. When should I expect the HbA1c results?",
        time: "Yesterday",
      },
      {
        id: "m2",
        type: "text",
        from: "doctor",
        text: "Results typically come back within 3–5 business days. I'll notify you as soon as they're in.",
        time: "Yesterday",
        read: true,
      },
      {
        id: "m3",
        type: "text",
        from: "patient",
        text: "Are my HbA1c results available yet?",
        time: "12 minutes ago",
      },
    ],
  },
  {
    conversationId: 3,
    messages: [
      {
        id: "m1",
        type: "text",
        from: "patient",
        text: "The swelling has gone down significantly since the surgery. Should I start physical therapy?",
        time: "Yesterday",
      },
      {
        id: "m2",
        type: "text",
        from: "doctor",
        text: "That's great progress! Yes, you can begin PT next week. I'll send a referral today.",
        time: "Yesterday",
        read: true,
      },
    ],
  },
  {
    conversationId: 4,
    messages: [
      {
        id: "m1",
        type: "text",
        from: "patient",
        text: "Can we discuss preventative options for migraines during my next visit?",
        time: "2 days ago",
      },
    ],
  },
  {
    conversationId: 5,
    messages: [
      {
        id: "m1",
        type: "text",
        from: "patient",
        text: "Thank you for the prenatal vitamin recommendation. I've been taking them daily.",
        time: "3 days ago",
      },
    ],
  },
];

type MessagesPanelProps = {
  onUnreadTotalChange: (total: number) => void;
};

export function MessagesPanel({ onUnreadTotalChange }: MessagesPanelProps) {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const syncUnread = useCallback(
    (list: Conversation[]) => {
      onUnreadTotalChange(list.reduce((sum, c) => sum + c.unread, 0));
    },
    [onUnreadTotalChange],
  );

  useEffect(() => {
    syncUnread(conversations);
  }, [conversations, syncUnread]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const thread =
    threads.find((t) => t.conversationId === selected?.id)?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, thread.length]);

  const selectConversation = (id: number) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const handleSend = () => {
    if (!draft.trim() || !selected) return;
    const text = draft.trim();
    const msgId = `m_${Date.now()}`;

    setThreads((prev) =>
      prev.map((t) =>
        t.conversationId === selected.id
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: msgId,
                  type: "text" as const,
                  from: "doctor" as const,
                  text,
                  time: "Just now",
                  read: false,
                },
              ],
            }
          : t,
      ),
    );

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, lastMessage: text, time: "Just now", status: "last online just now" }
          : c,
      ),
    );
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[560px] overflow-clip rounded-2xl bg-[#F8F9FB] shadow-[0_4px_24px_rgba(15,23,42,0.08)] dark:bg-card dark:shadow-none">
      {/* Left sidebar */}
      <aside className="flex w-full max-w-[340px] shrink-0 flex-col border-r border-[#E8ECF0] bg-[#F8F9FB] dark:border-border dark:bg-muted/20">
        <div className="px-5 pt-5 pb-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#1A202C] dark:text-slate-50">
              Messages
            </h2>
            <button
              type="button"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: TEAL }}
            >
              New message
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A0AEC0]" />
            <input
              type="search"
              placeholder="Search messages…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm text-[#1A202C] shadow-sm outline-none placeholder:text-[#A0AEC0] focus:ring-2 focus:ring-[#26C6DA]/30 dark:bg-background dark:text-foreground"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === selectedId;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => selectConversation(conv.id)}
                className={cn(
                  "w-full rounded-2xl p-3.5 text-left transition-all",
                  isActive
                    ? "shadow-md"
                    : "bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-md dark:bg-card",
                )}
                style={isActive ? { backgroundColor: TEAL } : undefined}
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt=""
                      className="size-11 rounded-full object-cover"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm font-bold",
                          isActive ? "text-white" : "text-[#1A202C] dark:text-slate-50",
                        )}
                      >
                        {conv.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[11px]",
                          isActive ? "text-white/80" : "text-[#A0AEC0]",
                        )}
                      >
                        {conv.time}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mb-1 text-xs",
                        conv.statusTyping && !isActive
                          ? "font-medium text-[#26C6DA]"
                          : isActive
                            ? "text-white/75"
                            : "text-[#A0AEC0]",
                        conv.statusTyping && isActive && "text-white/90",
                      )}
                    >
                      {conv.status}
                    </p>
                    <p
                      className={cn(
                        "truncate text-sm",
                        isActive ? "text-white/90" : "text-[#718096] dark:text-muted-foreground",
                      )}
                    >
                      {conv.lastMessage}
                    </p>
                    {(conv.tags?.length || conv.unread > 0) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {conv.tags?.map((tag) => (
                          <span
                            key={tag.label}
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              tag.type === "files"
                                ? isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-[#E0F7FA] text-[#26C6DA]"
                                : isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-[#FCE4EC] text-[#E91E63]",
                            )}
                          >
                            {tag.label}
                          </span>
                        ))}
                        {conv.unread > 0 && (
                          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right chat panel */}
      <section className="flex min-w-0 flex-1 flex-col bg-white dark:bg-background">
        {selected ? (
          <>
            {/* Chat header */}
            <header className="flex items-center justify-between border-b border-[#E8ECF0] px-6 py-4 dark:border-border">
              <div className="flex items-center gap-3">
                <img
                  src={selected.avatar}
                  alt=""
                  className="size-11 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-[#1A202C] dark:text-slate-50">
                    {selected.name}
                  </h3>
                  <p className="text-xs font-medium" style={{ color: TEAL }}>
                    last online {selected.lastOnline ?? "recently"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full text-[#A0AEC0] transition-colors hover:bg-[#F8F9FB] hover:text-[#718096]"
                  aria-label="Attach file"
                >
                  <Paperclip className="size-5" />
                </button>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full text-[#A0AEC0] transition-colors hover:bg-[#F8F9FB] hover:text-[#718096]"
                  aria-label="More options"
                >
                  <MoreVertical className="size-5" />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mx-auto max-w-2xl space-y-4">
                {thread.map((msg) => {
                  if (msg.type === "date") {
                    return (
                      <div key={msg.id} className="relative py-3">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-[#E8ECF0] dark:bg-border" />
                        <span className="relative mx-auto block w-fit bg-white px-4 text-xs text-[#A0AEC0] dark:bg-background">
                          {msg.label}
                        </span>
                      </div>
                    );
                  }

                  const isPatient = msg.from === "patient";

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        isPatient ? "justify-start" : "justify-end",
                      )}
                    >
                      {isPatient && (
                        <img
                          src={selected.avatar}
                          alt=""
                          className="mt-1 size-8 shrink-0 rounded-full object-cover"
                        />
                      )}
                      <div
                        className={cn(
                          "max-w-[75%]",
                          !isPatient && "flex flex-col items-end",
                        )}
                      >
                        {msg.type === "file" ? (
                          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
                            <div className="flex items-center gap-3">
                              <div
                                className="grid size-10 place-items-center rounded-xl"
                                style={{ backgroundColor: `${TEAL}20` }}
                              >
                                <FileText className="size-5" style={{ color: TEAL }} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#1A202C] dark:text-slate-50">
                                  {msg.fileName}
                                </p>
                                <p className="text-xs text-[#A0AEC0]">{msg.fileSize}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                              isPatient
                                ? "rounded-bl-md text-white"
                                : "rounded-br-md border border-[#E8ECF0] bg-white text-[#1A202C] shadow-sm dark:border-border dark:bg-card dark:text-slate-50",
                            )}
                            style={
                              isPatient ? { backgroundColor: TEAL } : undefined
                            }
                          >
                            {msg.text}
                          </div>
                        )}
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1 text-[11px] text-[#A0AEC0]",
                            !isPatient && "flex-row-reverse",
                          )}
                        >
                          <span>{msg.time}</span>
                          {!isPatient && msg.read !== undefined && (
                            msg.read ? (
                              <CheckCheck className="size-3.5" />
                            ) : (
                              <Check className="size-3.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-[#E8ECF0] px-6 py-4 dark:border-border">
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-2">
                  {[Video, ImageIcon, FileText, Plus].map((Icon, i) => (
                    <button
                      key={i}
                      type="button"
                      className="grid size-9 place-items-center rounded-full border-2 transition-colors hover:bg-[#E0F7FA]"
                      style={{ borderColor: TEAL, color: TEAL }}
                      aria-label="Attachment"
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    placeholder="Type a message here"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="h-12 w-full rounded-2xl border border-[#E8ECF0] bg-white pl-4 pr-12 text-sm outline-none placeholder:text-[#A0AEC0] focus:border-[#26C6DA] focus:ring-2 focus:ring-[#26C6DA]/20 dark:border-border dark:bg-card"
                  />
                  <button
                    type="button"
                    className="absolute right-14 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#718096]"
                    aria-label="Emoji"
                  >
                    <Smile className="size-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="grid size-12 shrink-0 place-items-center rounded-full text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: TEAL }}
                  aria-label="Send message"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[#A0AEC0]">
            Select a conversation to start messaging
          </div>
        )}
      </section>
    </div>
  );
}
