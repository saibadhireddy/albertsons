import { KPICard } from "../components/KPICard";
import { Gauge, Activity, AlertCircle, CheckCircle, TrendingDown, Network } from "lucide-react";
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
  Cell,
  PieChart,
  Pie
} from "recharts";
import { oeeData, downtimeReasonsData, machineUtilizationData, throughputData, causalDriversData } from "../utils/mockData";
import { useFilters } from "../contexts/FilterContext";

export function OEEPerformance() {
  const { location, timeRange, category } = useFilters();

  const currentOEEData = oeeData(location, timeRange, category);
  const currentDowntimeData = downtimeReasonsData(location, category);
  const currentMachineData = machineUtilizationData(location, category);
  const currentThroughputData = throughputData(location, category);
  const currentCausalData = causalDriversData(location, category);

  const latestOEE = currentOEEData[currentOEEData.length - 1];

  const oeeBreakdown = [
    { name: 'Availability', value: latestOEE.availability, color: '#3b82f6' },
    { name: 'Performance', value: latestOEE.performance, color: '#10b981' },
    { name: 'Quality', value: latestOEE.quality, color: '#f59e0b' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const correlationData = [
    { factor: 'Labor Shortage', oeeImpact: -12.5, correlation: 78 },
    { factor: 'Downtime', oeeImpact: -8.3, correlation: 65 },
    { factor: 'Demand Spike', oeeImpact: -6.7, correlation: 52 },
    { factor: 'Maint. Delay', oeeImpact: -5.2, correlation: 48 },
    { factor: 'SKU Mix', oeeImpact: -3.8, correlation: 35 },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const causalNodes = [
    { id: 1, name: 'Labor\nShortage', x: 100, y: 200, impact: 'high' },
    { id: 2, name: 'Machine\nUtilization', x: 300, y: 100, impact: 'medium' },
    { id: 3, name: 'Unplanned\nDowntime', x: 300, y: 300, impact: 'high' },
    { id: 4, name: 'Throughput\nLoss', x: 500, y: 200, impact: 'critical' },
    { id: 5, name: 'Demand\nSpike', x: 100, y: 350, impact: 'medium' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">OEE & Machine Performance</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overall Equipment Effectiveness analysis and machine health monitoring
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Overall OEE"
          value={latestOEE.oee}
          unit="%"
          trend={4.2}
          status="good"
          icon={<Gauge className="w-5 h-5" />}
        />
        <KPICard
          title="Availability"
          value={latestOEE.availability}
          unit="%"
          trend={2.1}
          status="good"
          icon={<Activity className="w-5 h-5" />}
        />
        <KPICard
          title="Performance"
          value={latestOEE.performance}
          unit="%"
          trend={5.3}
          status="good"
          icon={<Gauge className="w-5 h-5" />}
        />
        <KPICard
          title="Quality"
          value={latestOEE.quality}
          unit="%"
          trend={1.2}
          status="good"
          icon={<CheckCircle className="w-5 h-5" />}
        />
      </div>

      {/* OEE Trend & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">OEE Components Trend - {location}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentOEEData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={timeRange === "Daily" ? 0 : timeRange === "Weekly" ? 4 : 1} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="availability" stroke="#3b82f6" strokeWidth={2} name="Availability %" />
              <Line type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={2} name="Performance %" />
              <Line type="monotone" dataKey="quality" stroke="#f59e0b" strokeWidth={2} name="Quality %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">OEE Breakdown</h3>
          <div className="space-y-4 mt-8">
            {oeeBreakdown.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: item.color }}>
                    {item.value.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Overall OEE</span>
                <span className="text-lg font-semibold text-blue-600">{latestOEE.oee}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                = {oeeBreakdown[0].value.toFixed(1)}% × {oeeBreakdown[1].value.toFixed(1)}% × {oeeBreakdown[2].value.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Downtime Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Downtime Analysis (Pareto Chart) - {category}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={currentDowntimeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="reason" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="hours" fill="#3b82f6" name="Downtime Hours">
                {currentDowntimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index < 3 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Machine Utilization - {location}</h3>
          <div className="space-y-3 mt-4">
            {currentMachineData.map((machine) => (
              <div key={machine.machine}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{machine.machine}</span>
                  <span className="text-sm font-semibold" style={{ color: getStatusColor(machine.status) }}>
                    {machine.utilization}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${machine.utilization}%`, 
                      backgroundColor: getStatusColor(machine.status) 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Throughput vs Capacity */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Throughput vs Designed Capacity (24h) - {category}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={currentThroughputData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={2} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="capacity" fill="#e5e7eb" name="Designed Capacity" />
            <Bar dataKey="actual" fill="#3b82f6" name="Actual Throughput" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">MTBF (Mean Time Between Failures)</div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">156 hrs</div>
          <p className="text-xs text-green-600 mt-1">↑ 12% vs last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-sm text-gray-600">MTTR (Mean Time To Repair)</div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">2.3 hrs</div>
          <p className="text-xs text-gray-500 mt-1">↓ 18% vs last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-sm text-gray-600">Unplanned Downtime</div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">12.4 hrs</div>
          <p className="text-xs text-green-600 mt-1">↓ 15.3% vs last week</p>
        </div>
      </div>

      {/* Root Cause Analysis Section */}
      <div className="border-t-4 border-blue-100 pt-6 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Network className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Root Cause Analysis & Quantification</h2>
            <p className="text-sm text-gray-600">Understand key drivers and dependencies affecting OEE performance</p>
          </div>
        </div>

        {/* Driver Impact Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Driver Impact Analysis</h3>
              <p className="text-sm text-gray-600">Key factors affecting OEE performance with quantified impact</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentCausalData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="factor" tick={{ fontSize: 12 }} width={120} />
              <Tooltip />
              <Bar dataKey="impact" fill="#ef4444" name="Impact on OEE (%)">
                {currentCausalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Math.abs(entry.impact) > 10 ? '#ef4444' : Math.abs(entry.impact) > 5 ? '#f59e0b' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Correlation & Causal Network */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Correlation Analysis</h3>
            <div className="space-y-4">
              {correlationData.map((item) => (
                <div key={item.factor}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{item.factor}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">r = {(item.correlation / 100).toFixed(2)}</span>
                      <span className="text-sm font-semibold text-red-600">
                        {item.oeeImpact}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${item.correlation}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Correlation strength:</strong> Values closer to 1.0 indicate stronger relationships between factors and OEE impact.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Causal Network Graph</h3>
            <div className="relative bg-gray-50 rounded-lg p-6" style={{ height: 320 }}>
              <svg width="100%" height="100%" viewBox="0 0 600 400">
                {/* Edges */}
                <line x1="100" y1="200" x2="300" y2="100" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="100" y1="200" x2="300" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="300" y1="100" x2="500" y2="200" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="300" y1="300" x2="500" y2="200" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrowhead)" />
                <line x1="100" y1="350" x2="300" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                
                {/* Arrow marker */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Nodes */}
                {causalNodes.map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="35"
                      fill={getImpactColor(node.impact)}
                      opacity="0.2"
                      stroke={getImpactColor(node.impact)}
                      strokeWidth="2"
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fill="#1f2937"
                      fontWeight="600"
                    >
                      {node.name.split('\n').map((line, i) => (
                        <tspan key={i} x={node.x} dy={i === 0 ? 0 : 14}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Medium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Tree */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Driver Tree Breakdown</h3>
          <p className="text-sm text-gray-600 mb-6">Hierarchical view of performance drivers with quantified impact</p>

          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <div className="font-semibold text-gray-900 mb-2">Primary Drivers (Impact {'>'} 8%)</div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>→ Labor Shortage in Picking Zone</span>
                  <span className="font-semibold text-red-600">-12.5%</span>
                </li>
                <li className="flex justify-between">
                  <span>→ Unplanned Machine Downtime</span>
                  <span className="font-semibold text-red-600">-8.3%</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <div className="font-semibold text-gray-900 mb-2">Secondary Drivers (Impact 4-8%)</div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>→ Demand Spike Without Capacity Planning</span>
                  <span className="font-semibold text-amber-600">-6.7%</span>
                </li>
                <li className="flex justify-between">
                  <span>→ Delayed Preventive Maintenance</span>
                  <span className="font-semibold text-amber-600">-5.2%</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <div className="font-semibold text-gray-900 mb-2">Tertiary Drivers (Impact {'<'} 4%)</div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>→ Complex SKU Mix</span>
                  <span className="font-semibold text-blue-600">-3.8%</span>
                </li>
                <li className="flex justify-between">
                  <span>→ Shift Change Inefficiencies</span>
                  <span className="font-semibold text-blue-600">-2.1%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            Key Causal Insights
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-gray-700">
                <strong className="text-red-600">Critical Finding:</strong> Unplanned downtime increased OEE loss by 8.3% due to higher machine utilization and delayed preventive maintenance.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-gray-700">
                <strong className="text-amber-600">Warning:</strong> Labor shortage in picking zone reduced overall throughput by 12.5%, with cascading effects on packing operations.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-600">Opportunity:</strong> Demand spike correlation with quality issues suggests need for better capacity planning and worker training.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}