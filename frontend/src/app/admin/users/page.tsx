"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import { api } from "@/lib/api";
import { useToast } from "@/lib/Toast";

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  location: string;
  games: string[];
  skillLevel: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.append("search", search);
      const data = await api.get(`/api/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      showToast(err.message || "Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This will also remove their requests.`)) return;
    setDeletingId(userId);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotal(prev => prev - 1);
      showToast(`User "${userName}" deleted`, "info");
    } catch (err: any) {
      showToast(err.message || "Failed to delete user", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] flex flex-col bg-[var(--background)] p-4">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <Logo size={30} showText={false} />
          <span className="font-semibold tracking-tight text-sm">Admin Portal</span>
        </Link>
        <nav className="space-y-1 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[var(--foreground)] font-medium text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Users
          </Link>
        </nav>
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <Link href="/discover" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 bg-[var(--background)]">
          <div className="flex items-center gap-4">
            <h1 className="font-medium">Users</h1>
            <span className="text-xs text-[var(--muted)] bg-white/5 px-2 py-0.5 rounded-full">{total} total</span>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" placeholder="Search by name, email, city..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-white/5 border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] w-72"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Table */}
              <table className="w-full">
                <thead className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0">
                  <tr>
                    {["User", "Location", "Games", "Skill", "Role", "Joined", ""].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-[var(--muted)] px-4 py-3 first:pl-6 last:pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user._id} className={`border-b border-[var(--border)] hover:bg-white/[0.02] transition-colors animate-slide-up`} style={{ animationDelay: `${idx * 0.03}s` }}>
                      <td className="px-4 py-3 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-[#8391ff]/30 flex items-center justify-center text-xs font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-[10px] text-[var(--muted)]">{user.email || user.phone || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">{user.location || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {user.games.slice(0, 2).map(g => (
                            <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-[var(--border)] text-[var(--muted)]">{g}</span>
                          ))}
                          {user.games.length > 2 && <span className="text-[10px] text-[var(--muted)]">+{user.games.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">{user.skillLevel}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-[var(--muted)] border border-[var(--border)]"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 pr-6">
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={deletingId === user._id || user.role === "admin"}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {deletingId === user._id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="py-16 text-center text-[var(--muted)]">
                  {search ? `No users matching "${search}"` : "No users found"}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 flex items-center gap-1 transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-[var(--muted)]">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 flex items-center gap-1 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
