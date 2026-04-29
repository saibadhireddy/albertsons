import type { Location, TimeRange, Category } from "../contexts/FilterContext";

export function calculateOverviewKPIs(location: Location, category: Category) {
  // Location-based base values
  const locationFactors = {
    "Warehouse DC-01": { accuracy: 94.2, costVar: 7.3, adherence: 91.5, downtime: 12.4 },
    "Warehouse DC-02": { accuracy: 96.8, costVar: 5.1, adherence: 94.2, downtime: 9.8 },
    "FC-Northeast": { accuracy: 89.5, costVar: 9.7, adherence: 87.3, downtime: 15.6 },
    "FC-West Coast": { accuracy: 92.1, costVar: 6.8, adherence: 90.8, downtime: 11.2 },
  }[location];

  // Category-based adjustments
  const categoryAdjustments = {
    "All Categories": { accuracy: 0, costVar: 0, adherence: 0, downtime: 0 },
    "Electronics": { accuracy: 2.5, costVar: -1.2, adherence: 2.1, downtime: -1.5 },
    "Apparel": { accuracy: -2.1, costVar: 1.8, adherence: -1.7, downtime: 2.3 },
    "Home & Garden": { accuracy: -0.8, costVar: 0.5, adherence: -0.5, downtime: 0.8 },
    "Food & Beverage": { accuracy: 1.2, costVar: -0.6, adherence: 1.0, downtime: -0.9 },
  }[category];

  return {
    laborForecastAccuracy: Number((locationFactors.accuracy + categoryAdjustments.accuracy).toFixed(1)),
    laborCostVariance: Number((locationFactors.costVar + categoryAdjustments.costVar).toFixed(1)),
    scheduleAdherence: Number((locationFactors.adherence + categoryAdjustments.adherence).toFixed(1)),
    unplannedDowntime: Number((locationFactors.downtime + categoryAdjustments.downtime).toFixed(1)),
  };
}

export function calculateLaborKPIs(location: Location, category: Category) {
  // Location-based base values
  const locationFactors = {
    "Warehouse DC-01": { accuracy: 94.2, adherence: 91.5 },
    "Warehouse DC-02": { accuracy: 97.1, adherence: 94.8 },
    "FC-Northeast": { accuracy: 88.7, adherence: 86.2 },
    "FC-West Coast": { accuracy: 91.8, adherence: 90.1 },
  }[location];

  // Category-based adjustments
  const categoryAdjustments = {
    "All Categories": { accuracy: 0, adherence: 0 },
    "Electronics": { accuracy: 3.1, adherence: 2.8 },
    "Apparel": { accuracy: -2.5, adherence: -2.1 },
    "Home & Garden": { accuracy: -1.2, adherence: -0.9 },
    "Food & Beverage": { accuracy: 1.5, adherence: 1.3 },
  }[category];

  return {
    laborForecastAccuracy: Number((locationFactors.accuracy + categoryAdjustments.accuracy).toFixed(1)),
    scheduleAdherence: Number((locationFactors.adherence + categoryAdjustments.adherence).toFixed(1)),
  };
}
