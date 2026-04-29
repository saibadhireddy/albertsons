import { NavLink } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  Gauge, 
  FlaskConical, 
  Wrench 
} from "lucide-react";

const navItems = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/labor-insights", label: "Labor Insights", icon: Users },
  { path: "/oee-performance", label: "OEE & Machine Performance", icon: Gauge },
  { path: "/simulation-lab", label: "Simulation Lab", icon: FlaskConical },
  { path: "/predictive-maintenance", label: "Predictive Maintenance", icon: Wrench },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Warehouse Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">Labor & OEE Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Last updated: 2 min ago</div>
          <div className="mt-1">Data as of: Apr 16, 2026</div>
        </div>
      </div>
    </aside>
  );
}