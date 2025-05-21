// src/pages/CountrySelection.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCountry } from "@/hooks/use-country";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

const CountrySelection = () => {
  const navigate = useNavigate();
  const { country, setCountry } = useCountry();
  const { theme, setTheme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState(country);

  useEffect(() => {
    if (country) {
      setSelectedCountry(country);
    }
  }, [country]);

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
  };

  const handleSubmit = () => {
    setCountry(selectedCountry);
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Select Your Country</h1>
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${
            selectedCountry === 'benin'
              ? 'bg-benin-green text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleCountryChange('benin')}
        >
          Benin
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            selectedCountry === 'togo'
              ? 'bg-togo-red text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleCountryChange('togo')}
        >
          Togo
        </button>
      </div>
      <Button onClick={handleSubmit}>Confirm Selection</Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default CountrySelection;
