import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { GroupPublic } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Groups() {
  const [groups, setGroups] = useState<GroupPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<GroupPublic[]>("/groups/me")
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const group = await api.post<GroupPublic>("/groups", { name });
      setGroups((prev) => [group, ...prev]);
      setName("");
      setShowCreate(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Groups</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-accent-yellow px-4 py-2 text-sm font-medium text-bg-primary transition-opacity hover:opacity-90"
        >
          {showCreate ? "Cancel" : "Create Group"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="flex gap-2 rounded-lg border border-border-dark bg-bg-card p-4"
        >
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={120}
            className="flex-1 rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-accent-green px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {creating ? "..." : "Create"}
          </button>
        </form>
      )}

      {groups.length === 0 ? (
        <p className="py-10 text-center text-text-secondary">
          You're not in any groups yet. Create one to get started!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="rounded-lg border border-border-dark bg-bg-card p-5 transition-colors hover:border-accent-yellow/40"
            >
              <h3 className="mb-1 font-semibold text-text-primary">{g.name}</h3>
              <p className="text-xs text-text-secondary">
                Created {new Date(g.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
