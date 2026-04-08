import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { GroupStats, GroupPublic } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [group, setGroup] = useState<GroupPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberName, setMemberName] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<GroupStats>(`/groups/${id}/stats`),
      api.get<GroupPublic[]>("/groups/me"),
    ])
      .then(([s, groups]) => {
        setStats(s);
        setGroup(groups.find((g) => g.id === Number(id)) ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setMsg("");
    try {
      await api.post(`/groups/${id}/members`, { username: memberName });
      setMsg("Member added!");
      setMemberName("");
      const updated = await api.get<GroupStats>(`/groups/${id}/stats`);
      setStats(updated);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-text-secondary">Group not found.</p>;

  const isOwner = group?.owner_id === user?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{stats.group_name}</h1>
        <p className="text-text-secondary">
          {stats.member_count} member{stats.member_count !== 1 && "s"}
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-lg border border-border-dark bg-bg-card px-5 py-3">
        <span className="text-sm text-text-secondary">Group Streak</span>
        <span className="text-2xl font-bold text-accent-green">
          {stats.group_daily_problem_streak}
        </span>
        <span className="text-sm text-text-secondary">days</span>
      </div>

      {msg && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            msg.includes("added")
              ? "bg-accent-green/10 text-accent-green"
              : "bg-danger/10 text-danger"
          }`}
        >
          {msg}
        </div>
      )}

      {isOwner && (
        <form onSubmit={handleAddMember} className="flex gap-2">
          <input
            type="text"
            placeholder="Username to add"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            required
            className="flex-1 rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {adding ? "..." : "Add Member"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-border-dark">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-dark bg-bg-secondary text-text-secondary">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Solved</th>
              <th className="px-4 py-3">Activity Streak</th>
              <th className="px-4 py-3">Daily Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {stats.leaderboard.map((m) => (
              <tr key={m.username} className="bg-bg-card hover:bg-bg-secondary/50">
                <td className="px-4 py-3 font-medium">{m.username}</td>
                <td className="px-4 py-3">{m.total_problems_solved}</td>
                <td className="px-4 py-3">{m.current_activity_streak} days</td>
                <td className="px-4 py-3">{m.current_daily_problem_streak} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
