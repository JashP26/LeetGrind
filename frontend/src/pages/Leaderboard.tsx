import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { LeaderboardEntry } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<LeaderboardEntry[]>("/leaderboards/global?limit=50")
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Global Leaderboard</h1>

      {entries.length === 0 ? (
        <p className="py-10 text-center text-text-secondary">
          No one on the leaderboard yet. Be the first!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-dark">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-dark bg-bg-secondary text-text-secondary">
              <tr>
                <th className="px-4 py-3 w-16">#</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Solved</th>
                <th className="px-4 py-3">Activity Streak</th>
                <th className="px-4 py-3">Daily Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {entries.map((e) => {
                const isMe = e.username === user?.username;
                return (
                  <tr
                    key={e.rank}
                    className={
                      isMe
                        ? "bg-accent-yellow/10"
                        : "bg-bg-card hover:bg-bg-secondary/50"
                    }
                  >
                    <td className="px-4 py-3 font-bold text-text-secondary">
                      {e.rank}
                    </td>
                    <td className={`px-4 py-3 font-medium ${isMe ? "text-accent-yellow" : ""}`}>
                      {e.username}
                    </td>
                    <td className="px-4 py-3">{e.total_problems_solved}</td>
                    <td className="px-4 py-3">{e.current_activity_streak} days</td>
                    <td className="px-4 py-3">{e.current_daily_problem_streak} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
