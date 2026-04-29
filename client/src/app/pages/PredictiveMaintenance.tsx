import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { predictiveMaintenanceData } from "../utils/mockData";
import { useFilters } from "../contexts/FilterContext";

export function PredictiveMaintenance() {
  const { location, category } = useFilters();
  const currentMaintenanceData = predictiveMaintenanceData(location, category);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'good': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'good': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const upcomingMaintenance = [
    { machine: 'Sorter 3', scheduled: 'Apr 21, 2026', type: 'Emergency', priority: 'critical' },
    { machine: 'Conveyor Belt 7', scheduled: 'Apr 28, 2026', type: 'Preventive', priority: 'warning' },
    { machine: 'Picker Arm 4', scheduled: 'May 3, 2026', type: 'Preventive', priority: 'warning' },
    { machine: 'Packer 2', scheduled: 'May 15, 2026', type: 'Routine', priority: 'good' },
  ];

  const maintenanceRecommendations = [
    {
      type: "critical" as const,
      message: "Schedule immediate maintenance for Sorter 3 - predicted failure in 5 days with 85% confidence.",
    },
    {
      type: "warning" as const,
      message: "Conveyor Belt 7 showing degradation patterns. Plan preventive maintenance within 12 days.",
    },
    {
      type: "info" as const,
      message: "Optimize maintenance schedule: Consolidate Picker Arm 4 & 5 maintenance to reduce downtime by 40%.",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Predictive Maintenance</h1>
        <p className="text-sm text-gray-600 mt-1">
          AI-powered failure prediction and maintenance optimization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
          <div className="text-3xl font-semibold text-gray-900">3</div>
          <p className="text-xs text-gray-500 mt-1">Require immediate action</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          <div className="text-3xl font-semibold text-gray-900">7</div>
          <p className="text-xs text-gray-500 mt-1">Schedule within 2 weeks</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="text-3xl font-semibold text-gray-900">12</div>
          <p className="text-xs text-gray-500 mt-1">Maintenance tasks</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">Healthy Assets</div>
          </div>
          <div className="text-3xl font-semibold text-gray-900">42</div>
          <p className="text-xs text-gray-500 mt-1">Operating normally</p>
        </div>
      </div>

      {/* Failure Risk Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Machine Failure Risk Scores - {location}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={currentMaintenanceData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="machine" tick={{ fontSize: 12 }} width={120} />
            <Tooltip />
            <Bar dataKey="failureRisk" name="Failure Risk Score">
              {currentMaintenanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Heatmap & RUL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Asset Health Overview - {category}</h3>
          <div className="space-y-3">
            {currentMaintenanceData.map((item) => (
              <div
                key={item.machine}
                className={`border rounded-lg p-4 ${getPriorityBg(item.priority)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(item.priority)}
                    <span className="font-medium text-gray-900">{item.machine}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: getPriorityColor(item.priority) }}>
                    {item.failureRisk}% risk
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">RUL:</span>
                    <span className="ml-2 font-semibold text-gray-900">{item.rul} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className="ml-2 font-semibold capitalize" style={{ color: getPriorityColor(item.priority) }}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Upcoming Maintenance Schedule</h3>
          <div className="space-y-3">
            {upcomingMaintenance.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getPriorityBg(item.priority)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(item.priority)}
                    <span className="font-medium text-gray-900">{item.machine}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded" style={{ 
                    backgroundColor: getPriorityColor(item.priority) + '20',
                    color: getPriorityColor(item.priority)
                  }}>
                    {item.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Scheduled: <span className="font-semibold text-gray-900">{item.scheduled}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Maintenance Recommendations</h3>
            <p className="text-sm text-gray-600">AI-powered insights for optimal maintenance strategy</p>
          </div>
        </div>
        <div className="space-y-3">
          {maintenanceRecommendations.map((rec, index) => {
            const getBgColor = (type: string) => {
              switch (type) {
                case 'critical': return 'bg-red-50 border-red-200';
                case 'warning': return 'bg-amber-50 border-amber-200';
                default: return 'bg-blue-50 border-blue-200';
              }
            };

            const getIcon = (type: string) => {
              switch (type) {
                case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
                case 'warning': return <Clock className="w-5 h-5 text-amber-600" />;
                default: return <CheckCircle className="w-5 h-5 text-blue-600" />;
              }
            };

            return (
              <div
                key={index}
                className={`flex gap-3 p-4 rounded-lg border ${getBgColor(rec.type)}`}
              >
                {getIcon(rec.type)}
                <p className="text-sm text-gray-700 flex-1">{rec.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Efficiency Gains */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-2">Prevented Failures (YTD)</div>
          <div className="text-3xl font-semibold text-green-600">23</div>
          <p className="text-xs text-gray-500 mt-1">Est. savings: $340K</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-2">Downtime Reduction</div>
          <div className="text-3xl font-semibold text-blue-600">34%</div>
          <p className="text-xs text-gray-500 mt-1">vs reactive maintenance</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-2">Prediction Accuracy</div>
          <div className="text-3xl font-semibold text-purple-600">91.2%</div>
          <p className="text-xs text-gray-500 mt-1">Last 90 days average</p>
        </div>
      </div>
    </div>
  );
}
