interface Props {
  label: string;
  value: string | number;
  accent?: "yellow" | "green" | "blue" | "danger";
}

const accentColor: Record<string, string> = {
  yellow: "text-accent-yellow",
  green: "text-accent-green",
  blue: "text-accent-blue",
  danger: "text-danger",
};

export default function StatCard({ label, value, accent }: Props) {
  return (
    <div className="rounded-lg border border-border-dark bg-bg-card p-5">
      <p className="mb-1 text-sm text-text-secondary">{label}</p>
      <p className={`text-3xl font-bold ${accent ? accentColor[accent] : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
