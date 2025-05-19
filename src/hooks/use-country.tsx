
import React, { createContext, useContext, useState, useEffect } from "react";

type CountryId = "benin" | "togo";

interface CountryProviderProps {
  children: React.ReactNode;
  defaultCountry?: CountryId;
  storageKey?: string;
}

interface CountryContextType {
  country: CountryId;
  setCountry: (country: CountryId) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({
  children,
  defaultCountry = "benin",
  storageKey = "paye-afrique-country",
}: CountryProviderProps) {
  const [country, setCountryState] = useState<CountryId>(
    () => (localStorage.getItem(storageKey) as CountryId) || defaultCountry
  );

  const setCountry = (newCountry: CountryId) => {
    localStorage.setItem(storageKey, newCountry);
    setCountryState(newCountry);
  };

  useEffect(() => {
    // You could perform additional actions when country changes
    // For example, loading country-specific data or settings
    console.log(`Country changed to: ${country}`);
  }, [country]);

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  
  return context;
}
