import { Lightbulb, TrendingUp, AlertTriangle, Info } from "lucide-react";

interface Insight {
  type: "success" | "warning" | "info" | "critical";
  message: string;
}

interface InsightPanelProps {
  title: string;
  insights: Insight[];
}

export function InsightPanel({ title, insights }: InsightPanelProps) {
  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "critical":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex gap-3 p-3 rounded-lg border ${getBgColor(insight.type)}`}
          >
            {getIcon(insight.type)}
            <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
