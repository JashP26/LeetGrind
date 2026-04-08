import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { ProgressCheckInRequest } from "../types";

export default function CheckIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProgressCheckInRequest>({
    problems_solved: 0,
    hours_spent: 0,
    did_daily_problem: false,
  });
  const [difficulty, setDifficulty] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const body: ProgressCheckInRequest = { ...form };
    if (difficulty) body.problem_difficulty = difficulty as "easy" | "medium" | "hard";
    if (date) body.entry_date = date;

    try {
      await api.post("/progress/checkin", body);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-4xl">✅</div>
        <p className="mt-4 text-lg font-medium text-accent-green">
          Check-in recorded!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Daily Check-in</h1>

      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border-dark bg-bg-card p-6">
        <div>
          <label className="mb-1 block text-sm text-text-secondary">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="">None</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-secondary">Problems Solved</label>
          <input
            type="number"
            min={0}
            value={form.problems_solved}
            onChange={(e) =>
              setForm({ ...form, problems_solved: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-secondary">Hours Spent</label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={form.hours_spent}
            onChange={(e) =>
              setForm({ ...form, hours_spent: parseFloat(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="daily"
            type="checkbox"
            checked={form.did_daily_problem}
            onChange={(e) =>
              setForm({ ...form, did_daily_problem: e.target.checked })
            }
            className="h-4 w-4 accent-accent-green"
          />
          <label htmlFor="daily" className="text-sm text-text-primary">
            Completed daily problem
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-secondary">
            Date <span className="text-xs">(leave blank for today)</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent-green py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Submit Check-in"}
        </button>
      </form>
    </div>
  );
}
