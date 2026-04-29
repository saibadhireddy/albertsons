import React, { createContext, useContext, useState, useEffect } from "react";
// Change this import path if needed
import { getUserName } from "../services/UserNameService/UserName.api"; 

// --- Local Storage Keys ---
const USER_KEY = "currentUser";
const LAST_UPDATE_KEY = "lastUserUpdate";

// Helper function to check if the cached data is still valid (updated today)
const isCacheValid = (lastUpdateTime: string | null): boolean => {
  if (!lastUpdateTime) return false;
  const lastUpdateDate = new Date(lastUpdateTime);
  const today = new Date();
  
  // Check if the year, month, and day are the same
  return (
    lastUpdateDate.getFullYear() === today.getFullYear() &&
    lastUpdateDate.getMonth() === today.getMonth() &&
    lastUpdateDate.getDate() === today.getDate()
  );
};

export interface User {
  id?: string;
  name: string; // The property we are caching/updating
  role?: string;
  defaultPage?: string;
}

interface UserContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start AND perform daily check/fetch for the name
  useEffect(() => {
    const loadAndCacheUserName = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem(USER_KEY);
      const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
      const userObj: User | null = storedUser ? JSON.parse(storedUser) : null;
      
      // Determine if we need to fetch the name. Fetch if:
      // 1. The cache is expired (the most common use case) OR
      // 2. The local storage is empty (need initial fetch for session)
      const shouldFetch = !isCacheValid(lastUpdate) || !userObj; 

      // 1. Set initial user from storage immediately
      if (userObj) {
          setCurrentUser(userObj);
      } 
      
      // 2. Fetch fresh name/initial details if required
      if (shouldFetch) {
        try {
          // Assuming getUserName returns an object with 'name' or 'userName'
          const data = await getUserName(); 
          const fetchedName = data.name || data.userName;
          
          if (fetchedName) {
            
            // If userObj exists, update its name. If not (initial login), create a new User object.
            const updatedUser: User = userObj ? { ...userObj, name: fetchedName } : { 
                // Provide sensible defaults for a new session until other details are fetched
                id: data.id || "temp-id",
                name: fetchedName,
                role: data.role || "admin",
                defaultPage: data.defaultPage || "/overview"
            };

            // 3. Update cache and context
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
            setCurrentUser(updatedUser);
            console.debug(userObj ? "User name fetched and cached." : "Initial user details fetched and cached.");
          } else {
            // If the API call succeeded but returned no name, treat as unauthenticated
            console.warn("API returned no identifiable user name, maintaining current state (unauthenticated).");
            setCurrentUser(null);
          }

        } catch (error) {
          console.error("Failed to fetch user details (initial/update):", error);
          // Force null user on API failure to direct to login
          setCurrentUser(null); 
        }
      }
      
      setLoading(false);
    };

    loadAndCacheUserName();
  }, []); // Run only on mount

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString()); // Set cache date on login
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_UPDATE_KEY);
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};