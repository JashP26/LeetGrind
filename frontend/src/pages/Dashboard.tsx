import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import type { UserStats } from "../types";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [connectInput, setConnectInput] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    api
      .get<UserStats>("/users/me/stats")
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      await api.post("/users/me/leetcode/sync");
      const updated = await api.get<UserStats>("/users/me/stats");
      setStats(updated);
      setSyncMsg("Synced successfully!");
    } catch (err: unknown) {
      setSyncMsg(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    try {
      await api.post("/users/me/leetcode/connect", {
        leetcode_username: connectInput,
      });
      window.location.reload();
    } catch (err: unknown) {
      setSyncMsg(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setConnecting(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="text-accent-yellow">{user?.username}</span>
        </h1>
        {user?.leetcode_username && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync LeetCode"}
          </button>
        )}
      </div>

      {syncMsg && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            syncMsg.includes("success")
              ? "bg-accent-green/10 text-accent-green"
              : "bg-danger/10 text-danger"
          }`}
        >
          {syncMsg}
        </div>
      )}

      {!user?.leetcode_username && (
        <div className="rounded-lg border border-accent-yellow/30 bg-accent-yellow/5 p-5">
          <p className="mb-3 text-sm text-accent-yellow">
            Connect your LeetCode account to sync your stats.
          </p>
          <form onSubmit={handleConnect} className="flex gap-2">
            <input
              type="text"
              placeholder="LeetCode username"
              value={connectInput}
              onChange={(e) => setConnectInput(e.target.value)}
              required
              className="flex-1 rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
            />
            <button
              type="submit"
              disabled={connecting}
              className="rounded-lg bg-accent-yellow px-4 py-2 text-sm font-medium text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {connecting ? "..." : "Connect"}
            </button>
          </form>
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Solved"
              value={stats.total_problems_solved}
              accent="yellow"
            />
            <StatCard
              label="Easy"
              value={stats.solved_by_difficulty?.easy ?? 0}
              accent="green"
            />
            <StatCard
              label="Medium"
              value={stats.solved_by_difficulty?.medium ?? 0}
              accent="yellow"
            />
            <StatCard
              label="Hard"
              value={stats.solved_by_difficulty?.hard ?? 0}
              accent="danger"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard
              label="Activity Streak"
              value={`${stats.current_activity_streak} days`}
              accent="green"
            />
            <StatCard
              label="Daily Problem Streak"
              value={`${stats.current_daily_problem_streak} days`}
              accent="blue"
            />
            <StatCard
              label="Total Hours"
              value={stats.total_hours_spent.toFixed(1)}
            />
          </div>

          <div className="rounded-lg border border-border-dark bg-bg-card p-5">
            <h2 className="mb-2 text-lg font-semibold">Today's Check-in</h2>
            <Link
              to="/checkin"
              className="inline-block rounded-lg bg-accent-green px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Log your progress
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
