import type { Filters } from "../../context/FilterContext";
import fetchData from "../utility/FetchUtility";

export async function fetchRefreshTime(
  dimensionFilter: Filters,
  tabName: string,
  signal?: AbortSignal, 
) {
  try {
    return await fetchData("refresh-time", {
      dimensionFilter,
      tabName,
      signal,
    });
  } catch (error) {
    // 1. Calculate the time for 1 hour before now
    const date = new Date();
    date.setHours(date.getHours() - 1);

    // 2. Format it to match: "Tue, 03 Feb 2026 06:54:31"
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    // Create the formatted string and remove the commas to match your JSON type
    const formattedTime = date.toLocaleString('en-GB', options).replace(/,/g, '');
    
    const MOCK_DATA_CONTENT = tabName === 'demand-funnel' 
    ? {
        "AQL Funnel": [{ "refresh_time": formattedTime }],
        "INQ Funnel": [{ "refresh_time": formattedTime }]
      }
    : [
        { "refresh_time": formattedTime }
      ];

    const MOCK_REFRESH_DATA = {
      "data": MOCK_DATA_CONTENT,
      "message": "Success",
      "meta": {
        "request_id": "b933b855-adb5-49fb-b7ab-26f1372ff146"
      },
      "status": "success",
      "successCode": "SUCCESS"
    };

    console.warn("Backend not reached. Mocking time to 1 hour ago.");
    return MOCK_REFRESH_DATA;
  }
}