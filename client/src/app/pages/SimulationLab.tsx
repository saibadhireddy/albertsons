import { useState } from "react";
import { FlaskConical, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useFilters } from "../contexts/FilterContext";
import { oeeData } from "../utils/mockData";

export function SimulationLab() {
  const { location, timeRange, category } = useFilters();

  const [laborZoneA, setLaborZoneA] = useState(50);
  const [laborZoneB, setLaborZoneB] = useState(45);
  const [laborZoneC, setLaborZoneC] = useState(40);
  const [downtimeReduction, setDowntimeReduction] = useState(0);
  const [maintenanceFreq, setMaintenanceFreq] = useState(7);

  // Get baseline OEE from filtered data
  const currentOEEData = oeeData(location, timeRange, category);
  const avgOEE = currentOEEData.reduce((sum, d) => sum + d.oee, 0) / currentOEEData.length;

  // Location-based cost multipliers
  const costMultiplier = location === "Warehouse DC-02" ? 1.15 : location === "FC-West Coast" ? 1.08 : location === "FC-Northeast" ? 0.92 : 1.0;

  // Calculations for Labor Simulation
  const totalLabor = laborZoneA + laborZoneB + laborZoneC;
  const baseCost = 95000 * costMultiplier;
  const simulatedCost = baseCost * (totalLabor / 135);
  const costDelta = ((simulatedCost - baseCost) / baseCost) * 100;

  const baseServiceLevel = 92;
  const simulatedServiceLevel = Math.min(98, baseServiceLevel + (totalLabor - 135) * 0.15);

  // Calculations for OEE Simulation using dynamic baseline
  const baseOEE = Number(avgOEE.toFixed(1));
  const simulatedOEE = Math.min(95, baseOEE + downtimeReduction * 0.3 + (7 - maintenanceFreq) * 0.5);
  const oeeDelta = simulatedOEE - baseOEE;
  const throughputGain = (oeeDelta / baseOEE) * 100;

  const laborComparisonData = [
    { metric: 'Cost ($K)', baseline: baseCost / 1000, simulated: simulatedCost / 1000 },
    { metric: 'Service Level (%)', baseline: baseServiceLevel, simulated: simulatedServiceLevel },
    { metric: 'Utilization (%)', baseline: 82, simulated: Math.min(95, 82 + (totalLabor - 135) * 0.2) },
  ];

  const oeeComparisonData = [
    { metric: 'OEE (%)', baseline: baseOEE, simulated: simulatedOEE },
    { metric: 'Throughput (units/hr)', baseline: 850, simulated: 850 * (simulatedOEE / baseOEE) },
    { metric: 'Downtime (hrs)', baseline: 24, simulated: 24 * (1 - downtimeReduction / 100) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Simulation Lab</h1>
        <p className="text-sm text-gray-600 mt-1">
          What-if analysis for labor optimization and OEE improvement
        </p>
      </div>

      {/* Labor Optimization Simulator */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FlaskConical className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Labor Optimization Simulator</h2>
            <p className="text-sm text-gray-600">Adjust labor allocation to see impact on cost and service</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Input Parameters</h3>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-700">Zone A Labor</label>
                <span className="text-sm font-semibold text-gray-900">{laborZoneA} workers</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={laborZoneA}
                onChange={(e) => setLaborZoneA(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-700">Zone B Labor</label>
                <span className="text-sm font-semibold text-gray-900">{laborZoneB} workers</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={laborZoneB}
                onChange={(e) => setLaborZoneB(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-700">Zone C Labor</label>
                <span className="text-sm font-semibold text-gray-900">{laborZoneC} workers</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={laborZoneC}
                onChange={(e) => setLaborZoneC(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Labor</span>
                <span className="font-semibold text-gray-900">{totalLabor} workers</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Baseline Total</span>
                <span className="text-gray-600">135 workers</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Simulated Outcomes</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Cost Impact</div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${(simulatedCost / 1000).toFixed(1)}K
                </div>
                <div className={`text-sm mt-1 flex items-center gap-1 ${costDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {costDelta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(costDelta).toFixed(1)}% vs baseline
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Service Level</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {simulatedServiceLevel.toFixed(1)}%
                </div>
                <div className={`text-sm mt-1 flex items-center gap-1 ${simulatedServiceLevel >= baseServiceLevel ? 'text-green-600' : 'text-red-600'}`}>
                  {simulatedServiceLevel >= baseServiceLevel ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(simulatedServiceLevel - baseServiceLevel).toFixed(1)}% vs baseline
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={laborComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" />
                <Bar dataKey="simulated" fill="#3b82f6" name="Simulated" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OEE Simulator */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <FlaskConical className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">OEE Improvement Simulator</h2>
            <p className="text-sm text-gray-600">Model the impact of operational improvements on OEE</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Input Parameters</h3>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-700">Downtime Reduction</label>
                <span className="text-sm font-semibold text-gray-900">{downtimeReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={downtimeReduction}
                onChange={(e) => setDowntimeReduction(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-700">Maintenance Frequency (days)</label>
                <span className="text-sm font-semibold text-gray-900">{maintenanceFreq} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={maintenanceFreq}
                onChange={(e) => setMaintenanceFreq(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <p className="text-xs text-gray-500 mt-1">Baseline: 7 days</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Scenario Summary</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Reducing downtime by {downtimeReduction}%</li>
                <li>• Maintenance every {maintenanceFreq} days</li>
                <li>• Expected OEE: {simulatedOEE.toFixed(1)}%</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Simulated Outcomes</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">OEE Improvement</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {simulatedOEE.toFixed(1)}%
                </div>
                <div className={`text-sm mt-1 flex items-center gap-1 ${oeeDelta > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {oeeDelta > 0 ? <TrendingUp className="w-4 h-4" /> : <span className="w-4 h-4" />}
                  {oeeDelta > 0 ? '+' : ''}{oeeDelta.toFixed(1)}% points
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Throughput Gain</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {throughputGain.toFixed(1)}%
                </div>
                <div className={`text-sm mt-1 flex items-center gap-1 ${throughputGain > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {throughputGain > 0 ? <TrendingUp className="w-4 h-4" /> : <span className="w-4 h-4" />}
                  +{Math.round(850 * (throughputGain / 100))} units/hr
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={oeeComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" />
                <Bar dataKey="simulated" fill="#10b981" name="Simulated" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
