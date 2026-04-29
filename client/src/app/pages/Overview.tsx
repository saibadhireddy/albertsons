import { KPICard } from "../components/KPICard";
import { InsightPanel } from "../components/InsightPanel";
import { TrendingUp, Users, Gauge, Clock, DollarSign, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { oeeData, absenteeismData, machineUtilizationData, productivityData } from "../utils/mockData";
import { useFilters } from "../contexts/FilterContext";
import { calculateOverviewKPIs } from "../utils/kpiCalculations";

export function Overview() {
  const { location, timeRange, category } = useFilters();

  const currentOEEData = oeeData(location, timeRange, category);
  const currentAbsenteeismData = absenteeismData(location, timeRange);
  const currentMachineData = machineUtilizationData(location, category);
  const currentProductivityData = productivityData(location, timeRange, category);

  const latestOEE = currentOEEData[currentOEEData.length - 1];
  const avgOEE = currentOEEData.reduce((sum, d) => sum + d.oee, 0) / currentOEEData.length;
  const latestAbsenteeism = currentAbsenteeismData[currentAbsenteeismData.length - 1];
  const avgMachineUtil = currentMachineData.reduce((sum, m) => sum + m.utilization, 0) / currentMachineData.length;
  const latestProductivity = currentProductivityData[currentProductivityData.length - 1];

  // Calculate dynamic KPI values based on filters
  const kpis = calculateOverviewKPIs(location, category);

  const insights = [
    {
      type: "success" as const,
      message: `OEE at ${latestOEE.oee.toFixed(1)}% for ${location}, driven by ${latestOEE.availability.toFixed(1)}% availability.`,
    },
    {
      type: "warning" as const,
      message: `Labor cost variance at ${kpis.laborCostVariance.toFixed(1)}% above plan due to increased overtime in Shift 2.`,
    },
    {
      type: "info" as const,
      message: "Predictive models suggest reallocating 12 workers from Zone A to Zone C to optimize throughput.",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Executive Overview</h1>
        <p className="text-sm text-gray-600 mt-1">
          Real-time insights into labor optimization and equipment effectiveness
        </p>
      </div>

      {/* KPI Grid */}
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
          title="Labor Cost Variance"
          value={kpis.laborCostVariance}
          unit="%"
          trend={-1.2}
          trendLabel="vs plan"
          status={kpis.laborCostVariance > 7 ? "warning" : "good"}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KPICard
          title="Absenteeism Rate"
          value={Number(latestAbsenteeism.rate.toFixed(1))}
          unit="%"
          trend={-0.5}
          status={latestAbsenteeism.rate > 5 ? "warning" : "good"}
          icon={<Users className="w-5 h-5" />}
        />
        <KPICard
          title="Schedule Adherence"
          value={kpis.scheduleAdherence}
          unit="%"
          trend={1.8}
          status="good"
          icon={<Clock className="w-5 h-5" />}
        />
        <KPICard
          title="Overall OEE"
          value={latestOEE.oee}
          unit="%"
          trend={4.2}
          status="good"
          icon={<Gauge className="w-5 h-5" />}
        />
        <KPICard
          title="Machine Utilization"
          value={Number(avgMachineUtil.toFixed(1))}
          unit="%"
          trend={3.1}
          status="good"
          icon={<Gauge className="w-5 h-5" />}
        />
        <KPICard
          title="Unplanned Downtime"
          value={kpis.unplannedDowntime}
          unit="hrs"
          trend={-15.3}
          status="good"
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <KPICard
          title="Labor Productivity"
          value={Number(latestProductivity.unitsPerHour.toFixed(1))}
          unit="units/hr"
          trend={2.7}
          status="good"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">OEE Trend - {location}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentOEEData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={timeRange === "Daily" ? 0 : 4} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={2} dot={false} name="OEE %" />
              <Line type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={2} dot={false} name="Availability %" />
              <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} dot={false} name="Performance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Absenteeism Rate - {timeRange}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentAbsenteeismData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={timeRange === "Daily" ? 0 : timeRange === "Weekly" ? 4 : 14} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={false} name="Absenteeism %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <InsightPanel title="AI-Generated Insights" insights={insights} />
    </div>
  );
}