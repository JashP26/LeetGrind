const styles: Record<string, string> = {
  easy: "bg-accent-green/15 text-accent-green",
  medium: "bg-accent-yellow/15 text-accent-yellow",
  hard: "bg-danger/15 text-danger",
};

export default function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return <span className="text-text-secondary">—</span>;
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${styles[difficulty] ?? "text-text-secondary"}`}>
      {difficulty}
    </span>
  );
}
