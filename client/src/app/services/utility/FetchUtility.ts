/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Filters } from './../../context/FilterContext';
import { MOCK_STORE } from '../../mock/MockData';

type Params = { [key: string]: string | number | boolean | any };

interface FetchOptions {
  filters?: Filters;
  dimensionFilter: Filters;
  tabName: string;
  dynamicParams?: Params;
  signal?: AbortSignal;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

async function fetchData<T>(path: string, options: FetchOptions): Promise<T> {
  const { dimensionFilter, tabName, dynamicParams, signal } = options;
  const params = new URLSearchParams();
  params.append("dimensionFilters", JSON.stringify(dimensionFilter));

  if (dynamicParams) {
    Object.entries(dynamicParams).forEach(([key, value]) => {
      const paramValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      params.append(key, paramValue);
    });
  }

  const endpoint = `${API_URL}/${tabName}/${path}?${params.toString()}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();

  } catch (error: any) {
    if (error.name === 'AbortError') throw error;

    console.warn(`API Failed: ${error.message}. Attempting fallback to MOCK_STORE...`);

    // 1. Normalize the tabName (e.g., "Demand Funnel" -> "demandfunnel")
    const normalizedTab = tabName.toLowerCase().trim().replace(/[- ]/g, ''); 
    
    // 2. Identify the Metric Title (e.g., "MALs")
    const metricTitle = dynamicParams?.title || "";

    // 3. Match the Tab Bucket in MOCK_STORE
    const tabKey = Object.keys(MOCK_STORE).find(k => 
      k.toLowerCase().replace(/[- ]/g, '') === normalizedTab
    );
    const tabBucket = tabKey ? (MOCK_STORE as any)[tabKey] : null;

    if (tabBucket) {
      const possibleKeys = [
        `${path}:${metricTitle}`,            // bu-performance-aggregate:MALs
        `${path}:AQL ${metricTitle}`,        // bu-performance-aggregate:AQL MALs
        `${path}:INQ ${metricTitle}`,        // bu-performance-aggregate:INQ MALs
        path                                 // bu-performance-aggregate
      ];

      for (const key of possibleKeys) {
        if (tabBucket[key]) {
          console.info(`[Mocking Success] Found key: ${key} in tab: ${tabKey}`);
          return tabBucket[key] as T;
        }
      }
    }

    console.error(`[Mocking Failed] No mock data for ${tabName} with title ${metricTitle}`);
    throw error;
  }
}

export default fetchData;