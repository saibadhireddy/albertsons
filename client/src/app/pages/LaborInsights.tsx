import { KPICard } from "../components/KPICard";
import { InsightPanel } from "../components/InsightPanel";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { laborForecastData, laborCostData, productivityData, shiftHeatmapData } from "../utils/mockData";
import { useFilters } from "../contexts/FilterContext";
import { calculateLaborKPIs } from "../utils/kpiCalculations";

export function LaborInsights() {
  const { location, timeRange, category } = useFilters();

  const currentLaborForecast = laborForecastData(location, timeRange, category);
  const currentLaborCost = laborCostData(location, category);
  const currentProductivity = productivityData(location, timeRange, category);
  const currentShiftHeatmap = shiftHeatmapData(location, category);

  const latestProductivity = currentProductivity[currentProductivity.length - 1];

  // Calculate dynamic KPI values
  const kpis = calculateLaborKPIs(location, category);

  const insights = [
    {
      type: "success" as const,
      message: `${category} productivity at ${latestProductivity.unitsPerHour.toFixed(1)} units/hr in ${location}.`,
    },
    {
      type: "warning" as const,
      message: "Reduce overtime in Shift 2 by 10% through better shift planning. Potential savings: $18K/month.",
    },
    {
      type: "info" as const,
      message: "Cross-training 20 workers in picking operations could improve schedule flexibility by 23%.",
    },
  ];

  const heatmapColors = (value: number) => {
    if (value >= 85) return "#10b981";
    if (value >= 75) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Labor Insights & Optimization</h1>
        <p className="text-sm text-gray-600 mt-1">
          Workforce planning, cost analysis, and productivity optimization
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Labor Forecast Accuracy"
          value={kpis.laborForecastAccuracy}
          unit="%"
          trend={2.3}
          status="good"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KPICard
          title="Cost per Unit"
          value={Number(latestProductivity.costPerUnit.toFixed(2))}
          unit="$"
          trend={-3.4}
          status="good"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KPICard
          title="Productivity"
          value={Number(latestProductivity.unitsPerHour.toFixed(1))}
          unit="units/hr"
          trend={2.7}
          status="good"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KPICard
          title="Schedule Adherence"
          value={kpis.scheduleAdherence}
          unit="%"
          trend={1.8}
          status="good"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Labor Planning */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Labor Planning: Forecasted vs Actual - {category}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentLaborForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={timeRange === "Daily" ? 0 : timeRange === "Weekly" ? 4 : 1} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="forecasted" stroke="#3b82f6" strokeWidth={2} name="Forecasted" />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Analysis & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Labor Cost vs Budget - {location}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={currentLaborCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
              <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Utilization Heatmap by Shift & Zone</h3>
          <div className="space-y-4 mt-6">
            {currentShiftHeatmap.map((shift) => (
              <div key={shift.shift}>
                <div className="text-sm text-gray-600 mb-2">{shift.shift}</div>
                <div className="grid grid-cols-4 gap-2">
                  {['zoneA', 'zoneB', 'zoneC', 'zoneD'].map((zone, idx) => (
                    <div
                      key={zone}
                      className="p-4 rounded-lg text-center"
                      style={{ backgroundColor: heatmapColors(shift[zone as keyof typeof shift] as number) + '20' }}
                    >
                      <div className="text-xs text-gray-600">Zone {String.fromCharCode(65 + idx)}</div>
                      <div className="text-xl font-semibold mt-1" style={{ color: heatmapColors(shift[zone as keyof typeof shift] as number) }}>
                        {shift[zone as keyof typeof shift]}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productivity Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Productivity Trend (Units per Labor Hour) - {timeRange}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={currentProductivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={timeRange === "Daily" ? 0 : timeRange === "Weekly" ? 4 : 1} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="unitsPerHour" stroke="#10b981" strokeWidth={2} name="Units/Hour" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Optimization Recommendations */}
      <InsightPanel title="AI Optimization Recommendations" insights={insights} />
    </div>
  );
}
