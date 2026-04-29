// Mock data for the analytics platform
import type { Location, TimeRange, Category } from "../contexts/FilterContext";

// Multipliers for different filters
const locationMultipliers: Record<Location, number> = {
  "Warehouse DC-01": 1.0,
  "Warehouse DC-02": 1.15,
  "FC-Northeast": 0.92,
  "FC-West Coast": 1.08,
};

const categoryMultipliers: Record<Category, number> = {
  "All Categories": 1.0,
  "Electronics": 1.12,
  "Apparel": 0.88,
  "Home & Garden": 0.95,
  "Food & Beverage": 1.05,
};

const timeRangePoints: Record<TimeRange, number> = {
  "Daily": 7,
  "Weekly": 30,
  "Monthly": 12,
};

function getFilterMultiplier(location: Location, category: Category): number {
  return locationMultipliers[location] * categoryMultipliers[category];
}

export const laborForecastData = (location: Location, timeRange: TimeRange, category: Category) => {
  const points = timeRangePoints[timeRange];
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);

  return Array.from({ length: points }, (_, i) => ({
    day: timeRange === "Monthly"
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]
      : `Day ${i + 1}`,
    forecasted: (180 + (seed % 20) + Math.sin(i * 0.3) * 20) * multiplier,
    actual: (175 + (seed % 25) + Math.cos(i * 0.4) * 25) * multiplier,
  }));
};

export const laborCostData = (location: Location, category: Category) => {
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);

  return Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    budget: (85000 + (seed % 5000) + Math.sin(i * 0.5) * 10000) * multiplier,
    actual: (82000 + (seed % 6000) + Math.cos(i * 0.6) * 12000) * multiplier,
  }));
};

export const shiftHeatmapData = (location: Location, category: Category) => {
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);
  const baseOffset = (seed % 10) - 5;

  return [
    { shift: 'Shift 1', zoneA: Math.round((92 + baseOffset) * (multiplier * 0.95)), zoneB: Math.round((85 + baseOffset) * multiplier), zoneC: Math.round((78 + baseOffset) * (multiplier * 1.02)), zoneD: Math.round((88 + baseOffset) * multiplier) },
    { shift: 'Shift 2', zoneA: Math.round((88 + baseOffset) * multiplier), zoneB: Math.round((91 + baseOffset) * (multiplier * 0.98)), zoneC: Math.round((82 + baseOffset) * multiplier), zoneD: Math.round((79 + baseOffset) * (multiplier * 1.03)) },
    { shift: 'Shift 3', zoneA: Math.round((75 + baseOffset) * (multiplier * 1.01)), zoneB: Math.round((72 + baseOffset) * multiplier), zoneC: Math.round((68 + baseOffset) * (multiplier * 1.05)), zoneD: Math.round((71 + baseOffset) * multiplier) },
  ];
};

export const productivityData = (location: Location, timeRange: TimeRange, category: Category) => {
  const points = timeRangePoints[timeRange];
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);

  return Array.from({ length: points }, (_, i) => ({
    day: timeRange === "Monthly"
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]
      : `Day ${i + 1}`,
    unitsPerHour: (45 + (seed % 8) + Math.sin(i * 0.4) * 10) * multiplier,
    costPerUnit: (2.5 + Math.cos(i * 0.3) * 0.6) / multiplier,
  }));
};

export const absenteeismData = (location: Location, timeRange: TimeRange) => {
  const points = timeRange === "Daily" ? 7 : timeRange === "Weekly" ? 30 : 90;
  const seed = location.charCodeAt(0);
  const baseRate = location === "FC-West Coast" ? 3.5 : location === "FC-Northeast" ? 5.5 : 4.2;

  return Array.from({ length: points }, (_, i) => ({
    day: i + 1,
    rate: baseRate + Math.sin(i * 0.2 + seed) * 2,
  }));
};

// Generate OEE data where OEE = Availability × Performance × Quality
export const oeeData = (location: Location, timeRange: TimeRange, category: Category) => {
  const points = timeRangePoints[timeRange];
  const seed = location.charCodeAt(0) + category.charCodeAt(0);
  const multiplier = getFilterMultiplier(location, category);

  const baseAvailability = location === "Warehouse DC-02" ? 92 : location === "FC-Northeast" ? 87 : 90;
  const basePerformance = category === "Electronics" ? 88 : category === "Apparel" ? 84 : 86;

  return Array.from({ length: points }, (_, i) => {
    const availability = Math.min(98, baseAvailability + Math.sin(i * 0.3 + seed) * 4);
    const performance = Math.min(95, basePerformance + Math.cos(i * 0.4 + seed) * 5);
    const quality = 95 + Math.sin(i * 0.2) * 3;
    const oee = (availability * performance * quality) / 10000;

    return {
      day: timeRange === "Monthly"
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]
        : `Day ${i + 1}`,
      oee: Number(oee.toFixed(1)),
      availability: Number(availability.toFixed(1)),
      performance: Number(performance.toFixed(1)),
      quality: Number(quality.toFixed(1)),
    };
  });
};

export const downtimeReasonsData = (location: Location, category: Category) => {
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);

  return [
    { reason: 'Mechanical Failure', hours: Math.round((45 + (seed % 10)) * multiplier) },
    { reason: 'Planned Maintenance', hours: Math.round((32 + (seed % 8)) * multiplier) },
    { reason: 'Minor Stops', hours: Math.round((28 + (seed % 7)) * multiplier) },
    { reason: 'Quality Issues', hours: Math.round((18 + (seed % 5)) * multiplier) },
    { reason: 'Wave Changeover', hours: Math.round((15 + (seed % 6)) * multiplier) },
    { reason: 'Operator Unavailable', hours: Math.round((12 + (seed % 4)) * multiplier) },
  ];
};

export const machineUtilizationData = (location: Location, category: Category) => {
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);
  const offset = (seed % 10) - 5;

  const getStatus = (util: number) => util >= 80 ? 'good' : util >= 60 ? 'warning' : 'critical';

  return [
    { machine: 'Conveyor A1', utilization: Math.round((87 + offset) * (multiplier * 0.98)), status: getStatus(87 + offset) },
    { machine: 'Conveyor A2', utilization: Math.round((92 + offset) * multiplier), status: getStatus(92 + offset) },
    { machine: 'Sorter B1', utilization: Math.round((65 + offset) * (multiplier * 1.05)), status: getStatus(65 + offset) },
    { machine: 'Sorter B2', utilization: Math.round((78 + offset) * multiplier), status: getStatus(78 + offset) },
    { machine: 'Picker C1', utilization: Math.round((94 + offset) * (multiplier * 0.97)), status: getStatus(94 + offset) },
    { machine: 'Picker C2', utilization: Math.round((45 + offset) * (multiplier * 1.08)), status: getStatus(45 + offset) },
    { machine: 'Packer D1', utilization: Math.round((82 + offset) * multiplier), status: getStatus(82 + offset) },
    { machine: 'Packer D2', utilization: Math.round((88 + offset) * (multiplier * 0.99)), status: getStatus(88 + offset) },
  ];
};

export const predictiveMaintenanceData = (location: Location, category: Category) => {
  const seed = location.charCodeAt(0) + category.charCodeAt(0);
  const offset = (seed % 15) - 7;

  const getPriority = (risk: number) => risk >= 70 ? 'critical' : risk >= 50 ? 'warning' : 'good';

  return [
    { machine: 'Sorter 3', failureRisk: Math.max(0, Math.min(100, 85 + offset)), rul: Math.max(3, 5 - Math.floor(offset / 3)), priority: getPriority(85 + offset) },
    { machine: 'Conveyor Belt 7', failureRisk: Math.max(0, Math.min(100, 72 + offset)), rul: Math.max(5, 12 - Math.floor(offset / 2)), priority: getPriority(72 + offset) },
    { machine: 'Picker Arm 4', failureRisk: Math.max(0, Math.min(100, 65 + offset)), rul: Math.max(8, 18 - Math.floor(offset / 2)), priority: getPriority(65 + offset) },
    { machine: 'Packer 2', failureRisk: Math.max(0, Math.min(100, 45 + offset)), rul: Math.max(15, 30 - offset), priority: getPriority(45 + offset) },
    { machine: 'AGV Unit 12', failureRisk: Math.max(0, Math.min(100, 38 + offset)), rul: Math.max(20, 45 - offset), priority: getPriority(38 + offset) },
    { machine: 'Lift Mechanism 9', failureRisk: Math.max(0, Math.min(100, 25 + offset)), rul: Math.max(30, 60 - offset), priority: getPriority(25 + offset) },
  ];
};

export const causalDriversData = (location: Location, category: Category) => {
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);

  return [
    { factor: 'Labor Shortage', impact: -12.5 * multiplier, correlation: 0.78 - (seed % 10) / 100 },
    { factor: 'Machine Downtime', impact: -8.3 * multiplier, correlation: 0.65 + (seed % 8) / 100 },
    { factor: 'Demand Spike', impact: -6.7 * multiplier, correlation: 0.52 + (seed % 12) / 100 },
    { factor: 'Maintenance Delay', impact: -5.2 * multiplier, correlation: 0.48 - (seed % 6) / 100 },
    { factor: 'SKU Complexity', impact: -3.8 * multiplier, correlation: 0.35 + (seed % 9) / 100 },
    { factor: 'Shift Change', impact: -2.1 * multiplier, correlation: 0.22 + (seed % 5) / 100 },
  ];
};

export const throughputData = (location: Location, category: Category) => {
  const multiplier = getFilterMultiplier(location, category);
  const seed = location.charCodeAt(0) + category.charCodeAt(0);

  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    actual: (800 + (seed % 100) + Math.sin(i * 0.5) * 300) * multiplier,
    capacity: 1200 * multiplier,
  }));
};