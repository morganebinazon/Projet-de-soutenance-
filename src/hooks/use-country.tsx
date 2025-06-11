import { createContext, useContext, useState, ReactNode } from 'react';

export type CountryId = "benin" | "togo";

interface CountryContextType {
  country: CountryId;
  setCountry: (country: CountryId) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<CountryId>(() => {
    if (typeof window !== 'undefined') {
      const savedCountry = localStorage.getItem("paye-afrique-country");
      return (savedCountry === "benin" || savedCountry === "togo") 
        ? savedCountry as CountryId 
        : "benin";
    }
    return "benin";
  });

  const setCountry = (newCountry: CountryId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("paye-afrique-country", newCountry);
    }
    setCountryState(newCountry);
  };

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
};
