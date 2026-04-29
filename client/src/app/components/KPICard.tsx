import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  status?: "good" | "warning" | "critical";
  icon?: React.ReactNode;
}

export function KPICard({ 
  title, 
  value, 
  unit, 
  trend, 
  trendLabel, 
  status = "good",
  icon 
}: KPICardProps) {
  const statusColors = {
    good: "text-green-600 bg-green-50",
    warning: "text-amber-600 bg-amber-50",
    critical: "text-red-600 bg-red-50",
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return "";
    return trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm text-gray-600">{title}</div>
        {icon && (
          <div className={`p-2 rounded-lg ${statusColors[status]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {unit && <span className="text-lg text-gray-500">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>
            {Math.abs(trend)}% {trendLabel || "vs last period"}
          </span>
        </div>
      )}
    </div>
  );
}
