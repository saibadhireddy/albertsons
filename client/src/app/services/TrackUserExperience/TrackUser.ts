
const API_URL = import.meta.env.VITE_API_BASE_URL || "";
export const trackSessionTime = (urlPath: string, durationInSeconds: number, userName:string) => {
    console.debug(`[FRONTEND TRACKER ${userName}] Tracking session for ${urlPath}. Duration: ${durationInSeconds}s`);
    const params = new URLSearchParams();
      params.append("userName", userName);
      params.append("urlPath", urlPath);
      params.append("durationInSeconds", JSON.stringify(durationInSeconds));
    const endPoint = `${API_URL}/track-session/insert-details?${params.toString()}`
    fetch(endPoint, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({
      //   userName: userName, // User identifier
      //   url: urlPath,
      //   duration: durationInSeconds,
      //   timestamp: new Date().toISOString(),
      // }),
    })
    .catch(error => console.error("Failed to send session time to backend:", error));
  };


//   const sessionStartTimeRef = React.useRef<number | null>(null);
//   const {userName} = UserProvider();
//   useEffect(() => {
//     // Component Mount (Start Tracking)
//     sessionStartTimeRef.current = Date.now();
    
//     // Component Unmount (Stop Tracking & Send Data)
//     return () => {
//       const endTime = Date.now();
//       const startTime = sessionStartTimeRef.current;
      
//       if (startTime) {
        
//         const durationMs = endTime - startTime;
//         const durationSeconds = Math.round(durationMs / 1000);
        
//         // The URL path being tracked
//         const urlPath = `/${categoryName}/${tabName}`; 

//         // Send the data to the backend
//         trackSessionTime(urlPath, durationSeconds, userName);
//       }
//     };
//   }, [categoryName, tabName]);