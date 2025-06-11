import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountry } from "@/hooks/use-country";
import { useNavigate } from "react-router-dom";

const CountrySelector = () => {
  const { country, setCountry } = useCountry();
  const [currentCountry, setCurrentCountry] = useState(country);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentCountry(country);
  }, [country]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry as "benin" | "togo");
    navigate(0);
  };

  return (
    <Select value={currentCountry} onValueChange={handleCountryChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sélectionner un pays" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="benin">Bénin</SelectItem>
        <SelectItem value="togo">Togo</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
