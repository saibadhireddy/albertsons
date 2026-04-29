import { createContext, useContext, useState, ReactNode } from "react";

export type Location = "Warehouse DC-01" | "Warehouse DC-02" | "FC-Northeast" | "FC-West Coast";
export type TimeRange = "Daily" | "Weekly" | "Monthly";
export type Category = "All Categories" | "Electronics" | "Apparel" | "Home & Garden" | "Food & Beverage";

interface FilterContextType {
  location: Location;
  timeRange: TimeRange;
  category: Category;
  setLocation: (location: Location) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setCategory: (category: Category) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>("Warehouse DC-01");
  const [timeRange, setTimeRange] = useState<TimeRange>("Weekly");
  const [category, setCategory] = useState<Category>("All Categories");

  return (
    <FilterContext.Provider
      value={{
        location,
        timeRange,
        category,
        setLocation,
        setTimeRange,
        setCategory,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
