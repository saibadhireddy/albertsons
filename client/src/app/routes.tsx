import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Overview } from "./pages/Overview";
import { LaborInsights } from "./pages/LaborInsights";
import { OEEPerformance } from "./pages/OEEPerformance";
import { SimulationLab } from "./pages/SimulationLab";
import { PredictiveMaintenance } from "./pages/PredictiveMaintenance";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Overview },
      { path: "labor-insights", Component: LaborInsights },
      { path: "oee-performance", Component: OEEPerformance },
      { path: "simulation-lab", Component: SimulationLab },
      { path: "predictive-maintenance", Component: PredictiveMaintenance },
    ],
  },
]);