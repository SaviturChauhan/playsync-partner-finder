"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";
import { api } from "@/lib/api";
import { useToast } from "@/lib/Toast";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Friend {
  _id: string;
  name: string;
  avatar?: string;
  games?: string[];
  skillLevel?: string;
  location?: string;
}

interface Conversation {
  friend: Friend;
  lastMessage: { content: string; createdAt: string; isMine: boolean } | null;
  unreadCount: number;
}

interface Message {
  _id: string;
  senderId: { _id: string; name: string; avatar?: string };
  receiverId: { _id: string; name: string; avatar?: string };
  content: string;
  read: boolean;
  createdAt: string;
}

interface PlayRequest {
  _id: string;
  senderId?: { _id: string; name: string; avatar?: string; games?: string[] };
  receiverId?: { _id: string; name: string; avatar?: string; games?: string[] };
  game: string;
  status: string;
  scheduledTime: string;
  message?: string;
  createdAt: string;
}

// ─── Helper Components ───────────────────────────────────────────────────────

function Avatar({ name, avatar, size = 10 }: { name: string; avatar?: string; size?: number }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover border border-[var(--border)]`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[var(--accent)]/40 to-[#8391ff]/30 border border-[var(--accent)]/20 flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Messages() {
  const [mainTab, setMainTab] = useState<"chats" | "requests">("chats");
  const [requestTab, setRequestTab] = useState<"inbox" | "sent">("inbox");

  // Chats state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [myMongoId, setMyMongoId] = useState<string | null>(null);

  // Requests state
  const [inboxRequests, setInboxRequests] = useState<PlayRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PlayRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ── Scroll to bottom of chat ──
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Get my Mongo user ID ──
  useEffect(() => {
    api.get("/api/users/me").then((user: any) => {
      setMyMongoId(user?._id || null);
    }).catch(() => {});
  }, []);

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    try {
      const convs = await api.get<Conversation[]>("/api/messages");
      setConversations(convs);
    } catch {
      // silent
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages for active friend (with polling) ──
  const loadMessages = useCallback(async (friendId: string) => {
    try {
      const msgs = await api.get<Message[]>(`/api/messages/${friendId}`);
      setMessages(msgs);
      // Refresh conversation list to update unread counts
      loadConversations();
    } catch {
      // silent
    }
  }, [loadConversations]);

  useEffect(() => {
    if (!activeFriendId) return;

    loadMessages(activeFriendId);

    // Poll every 3 seconds
    pollingRef.current = setInterval(() => {
      loadMessages(activeFriendId);
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeFriendId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Load play requests ──
  useEffect(() => {
    const fetchRequests = async () => {
      setRequestsLoading(true);
      try {
        const [inbox, sent] = await Promise.allSettled([
          api.get("/api/requests"),
          api.get("/api/requests/sent"),
        ]);
        if (inbox.status === "fulfilled") setInboxRequests(inbox.value);
        if (sent.status === "fulfilled") setSentRequests(sent.value);
      } catch {
        // silent
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // ── Send message ──
  const handleSend = async () => {
    if (!messageInput.trim() || !activeFriendId || isSending) return;
    const content = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    // Optimistic update
    const tempMsg: Message = {
      _id: "temp-" + Date.now(),
      senderId: { _id: myMongoId || "", name: "Me" },
      receiverId: { _id: activeFriendId, name: "" },
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post("/api/messages", { receiverId: activeFriendId, content });
      // Refresh to get server-confirmed message
      await loadMessages(activeFriendId);
    } catch (err: any) {
      showToast(err.message || "Failed to send message", "error");
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  };

  // ── Handle request actions ──
  const handleRequestAction = async (id: string, action: "accepted" | "declined") => {
    setInboxRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: action } : r)));
    try {
      await api.put(`/api/requests/${id}`, { status: action });
      showToast(action === "accepted" ? "Request accepted! You are now friends 🎉" : "Request declined", action === "accepted" ? "success" : "info");
      if (action === "accepted") {
        // Reload conversations to show new friend
        setTimeout(loadConversations, 500);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update request", "error");
      setInboxRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: "pending" } : r)));
    }
  };

  const handleCancelSent = async (id: string) => {
    try {
      await api.delete(`/api/requests/${id}`);
      setSentRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: "cancelled" } : r)));
      showToast("Request cancelled", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to cancel", "error");
    }
  };

  // ── Status badge ──
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      accepted: "bg-green-500/10 text-green-500 border-green-500/20",
      declined: "bg-red-500/10 text-red-500 border-red-500/20",
      cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return (
      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const activeFriend = conversations.find((c) => c.friend._id === activeFriendId)?.friend;
  const pendingCount = inboxRequests.filter((r) => r.status === "pending").length;
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0 bg-[var(--background)] z-10">
          <h1 className="font-medium">Messages</h1>
        </header>

        {/* Two-panel body */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── Left Panel: Sidebar ── */}
          <div className="w-full md:w-80 shrink-0 border-r border-[var(--border)] flex flex-col overflow-hidden">
            {/* Main tab switcher */}
            <div className="flex border-b border-[var(--border)] shrink-0">
              <button
                onClick={() => setMainTab("chats")}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${mainTab === "chats" ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Chats
                {totalUnread > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-full">
                    {totalUnread}
                  </span>
                )}
                {mainTab === "chats" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full" />}
              </button>
              <button
                onClick={() => setMainTab("requests")}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${mainTab === "requests" ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Requests
                {pendingCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                    {pendingCount}
                  </span>
                )}
                {mainTab === "requests" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full" />}
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto">

              {/* ── CHATS TAB ── */}
              {mainTab === "chats" && (
                <>
                  {chatsLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 items-center animate-pulse">
                          <div className="w-11 h-11 rounded-full bg-white/10 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-2/3" />
                            <div className="h-3 bg-white/5 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mb-3 shadow-[0_0_20px_rgba(94,106,210,0.15)]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--muted)]">No friends yet</p>
                      <p className="text-xs text-[var(--muted)]/60 mt-1">Accept a play request to start chatting</p>
                    </div>
                  ) : (
                    <div>
                      {conversations.map((conv) => (
                        <button
                          key={conv.friend._id}
                          onClick={() => {
                            setActiveFriendId(conv.friend._id);
                            setMainTab("chats");
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-[var(--border)]/40 ${activeFriendId === conv.friend._id ? "bg-[var(--accent)]/10 border-l-2 border-l-[var(--accent)]" : ""}`}
                        >
                          <div className="relative shrink-0">
                            <Avatar name={conv.friend.name} avatar={conv.friend.avatar} size={11} />
                            {conv.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? "text-[var(--foreground)]" : "text-[var(--foreground)]/80"}`}>
                                {conv.friend.name}
                              </span>
                              {conv.lastMessage && (
                                <span className="text-[10px] text-[var(--muted)] shrink-0 ml-2">
                                  {formatTime(conv.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-[var(--foreground)]/70 font-medium" : "text-[var(--muted)]"}`}>
                              {conv.lastMessage
                                ? `${conv.lastMessage.isMine ? "You: " : ""}${conv.lastMessage.content}`
                                : conv.friend.games?.slice(0, 2).join(", ") || "Start chatting!"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── REQUESTS TAB ── */}
              {mainTab === "requests" && (
                <div className="p-4">
                  {/* Sub-tabs */}
                  <div className="flex gap-4 border-b border-[var(--border)] mb-4">
                    {(["inbox", "sent"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setRequestTab(tab)}
                        className={`pb-2 text-xs font-medium capitalize transition-colors relative ${requestTab === tab ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}
                      >
                        {tab}
                        {tab === "inbox" && pendingCount > 0 && (
                          <span className="ml-1 text-[9px] bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                        )}
                        {requestTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full" />}
                      </button>
                    ))}
                  </div>

                  {requestsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-[var(--border)] animate-pulse">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-white/10 rounded w-3/4" />
                              <div className="h-3 bg-white/5 rounded w-1/2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (requestTab === "inbox" ? inboxRequests : sentRequests).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        {requestTab === "inbox" ? "No incoming requests" : "No sent requests"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(requestTab === "inbox" ? inboxRequests : sentRequests).map((req) => {
                        const person = requestTab === "inbox" ? req.senderId : req.receiverId;
                        return (
                          <div key={req._id} className="p-4 rounded-xl border border-[var(--border)] bg-white/[0.02] flex flex-col gap-3">
                            <div className="flex gap-3 items-start">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-[#8391ff]/30 border border-[var(--accent)]/20 flex items-center justify-center font-bold text-xs shrink-0">
                                {person?.name?.charAt(0) || "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">
                                    {requestTab === "inbox" ? `From ${person?.name || "Player"}` : `To ${person?.name || "Player"}`}
                                  </span>
                                  <StatusBadge status={req.status} />
                                </div>
                                <div className="text-xs text-[var(--muted)] mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                  <span>{req.game}</span>
                                  <span>{new Date(req.scheduledTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                                </div>
                                {req.message && (
                                  <div className="mt-2 text-xs text-[var(--muted)] bg-white/5 p-2 rounded-lg border border-[var(--border)]">
                                    "{req.message}"
                                  </div>
                                )}
                              </div>
                            </div>
                            {requestTab === "inbox" && req.status === "pending" && (
                              <div className="flex gap-2">
                                <button onClick={() => handleRequestAction(req._id, "accepted")} className="flex-1 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium rounded-lg transition-colors">
                                  Accept
                                </button>
                                <button onClick={() => handleRequestAction(req._id, "declined")} className="flex-1 py-1.5 border border-[var(--border)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 text-xs font-medium rounded-lg transition-colors">
                                  Decline
                                </button>
                              </div>
                            )}
                            {requestTab === "sent" && req.status === "pending" && (
                              <button onClick={() => handleCancelSent(req._id)} className="w-full py-1.5 border border-[var(--border)] hover:bg-red-500/10 hover:text-red-500 text-xs font-medium rounded-lg transition-colors">
                                Cancel
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── Right Panel: Chat Window ── */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
            {activeFriendId && activeFriend ? (
              <>
                {/* Chat header */}
                <div className="h-14 border-b border-[var(--border)] px-6 flex items-center gap-3 shrink-0 bg-[var(--background)]">
                  <Avatar name={activeFriend.name} avatar={activeFriend.avatar} size={9} />
                  <div>
                    <div className="font-medium text-sm">{activeFriend.name}</div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {activeFriend.games?.slice(0, 2).join(", ")} · {activeFriend.location || ""}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mb-4 shadow-[0_0_20px_rgba(94,106,210,0.15)]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--muted)]">No messages yet</p>
                      <p className="text-xs text-[var(--muted)]/60 mt-1">Say hi to {activeFriend.name}!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId._id === myMongoId || msg._id.startsWith("temp-");
                      return (
                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`flex gap-2 items-end max-w-[70%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                            {!isMine && (
                              <Avatar name={msg.senderId.name} avatar={msg.senderId.avatar} size={7} />
                            )}
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? "bg-[var(--accent)] text-white rounded-br-sm shadow-[0_0_12px_rgba(94,106,210,0.3)]"
                                  : "bg-white/[0.07] border border-[var(--border)] text-[var(--foreground)] rounded-bl-sm"
                              }`}
                            >
                              {msg.content}
                              <div className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-[var(--muted)]"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="border-t border-[var(--border)] px-4 py-3 shrink-0 bg-[var(--background)]">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder={`Message ${activeFriend.name}...`}
                      className="flex-1 bg-white/[0.05] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageInput.trim() || isSending}
                      className="w-10 h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_16px_rgba(94,106,210,0.4)] shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No chat selected */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mb-5 shadow-[0_0_30px_rgba(94,106,210,0.15)]">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-lg mb-2">Your Messages</h2>
                <p className="text-sm text-[var(--muted)] max-w-xs">
                  Select a friend from the left to start chatting. Agree on venues, game times, and more.
                </p>
                {conversations.length === 0 && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-white/5 border border-[var(--border)] text-xs text-[var(--muted)] max-w-xs">
                    💡 Accept a play request to become friends and unlock messaging!
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  );
}
