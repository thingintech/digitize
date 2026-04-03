import { NavLink } from "react-router";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8 tracking-tight">
          Thing in Tech{" "}
          <span className="text-xs font-mono bg-purple-600 px-2 py-0.5 rounded-full ml-2">
            ADMIN
          </span>
        </h2>
        <nav className="flex-1 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block p-3 rounded-lg hover:bg-slate-800 ${isActive ? "bg-slate-800 font-bold" : ""}`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/businesses"
            className={({ isActive }) =>
              `block p-3 rounded-lg hover:bg-slate-800 ${isActive ? "bg-slate-800 font-bold" : ""}`
            }
          >
            Businesses
          </NavLink>
          <NavLink
            to="/admin/subscriptions"
            className={({ isActive }) =>
              `block p-3 rounded-lg hover:bg-slate-800 ${isActive ? "bg-slate-800 font-bold" : ""}`
            }
          >
            Subscriptions
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
