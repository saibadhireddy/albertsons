const API_URL = import.meta.env.VITE_API_BASE_URL || "";

// This matches your specific response type exactly
const MOCK_USER_DATA = {
  id: "1",
  name: "Kiruthika B",
  role: "admin",
  defaultPage: "/overview"
};

export async function getUserName() {
  const endpoint = `${API_URL}/user-name/`;

  try {
    // If you want to skip the network error completely, just return mock here:
    // return MOCK_USER_DATA;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return await response.json();

  } catch (error) {
    console.warn("Backend not reached. Using mock user: Kiruthika B", error);
    return MOCK_USER_DATA;
  }
}