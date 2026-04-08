import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { ProgressPublic } from "../types";
import DifficultyBadge from "../components/DifficultyBadge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Progress() {
  const [entries, setEntries] = useState<ProgressPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ProgressPublic[]>("/progress/me")
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Progress</h1>

      {entries.length === 0 ? (
        <p className="py-10 text-center text-text-secondary">
          No check-ins yet. Start logging your daily progress!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-dark">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-dark bg-bg-secondary text-text-secondary">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Solved</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Daily</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {entries.map((e) => (
                <tr key={e.id} className="bg-bg-card hover:bg-bg-secondary/50">
                  <td className="px-4 py-3 font-medium">{e.entry_date}</td>
                  <td className="px-4 py-3">
                    <DifficultyBadge difficulty={e.problem_difficulty} />
                  </td>
                  <td className="px-4 py-3">{e.problems_solved}</td>
                  <td className="px-4 py-3">{e.hours_spent}</td>
                  <td className="px-4 py-3">
                    {e.did_daily_problem ? (
                      <span className="text-accent-green">✓</span>
                    ) : (
                      <span className="text-danger">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
