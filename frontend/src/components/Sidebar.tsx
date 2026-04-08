import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/checkin", label: "Check In", icon: "✅" },
  { to: "/progress", label: "Progress", icon: "📈" },
  { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { to: "/groups", label: "Groups", icon: "👥" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-30 flex h-full w-60 flex-col border-r border-border-dark bg-bg-secondary transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-border-dark px-5 py-4">
          <span className="text-xl font-bold text-accent-yellow">LeetGrind</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-yellow/10 font-medium text-accent-yellow"
                    : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-dark px-5 py-4">
          <p className="mb-2 truncate text-sm text-text-secondary">
            {user?.username ?? ""}
          </p>
          <button
            onClick={logout}
            className="w-full rounded-lg border border-border-dark px-3 py-2 text-sm text-text-secondary transition-colors hover:text-danger"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
