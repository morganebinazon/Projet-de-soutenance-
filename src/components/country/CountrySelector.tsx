
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/hooks/use-country";

interface Country {
  id: string;
  name: string;
  flag: string;
  code: string;
}

const countries: Country[] = [
  {
    id: "benin",
    name: "Bénin",
    flag: "🇧🇯",
    code: "BJ",
  },
  {
    id: "togo",
    name: "Togo",
    flag: "🇹🇬",
    code: "TG",
  },
];

const CountrySelector = () => {
  const { country, setCountry } = useCountry();
  const [open, setOpen] = useState(false);

  const selectedCountry = countries.find(c => c.id === country) || countries[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className="flex items-center gap-2 h-9 px-3"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="hidden sm:inline">{selectedCountry.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <div className="p-1">
          {countries.map((countryOption) => (
            <Button
              key={countryOption.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left px-2 py-1.5 h-9",
                selectedCountry.id === countryOption.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                setCountry(countryOption.id);
                setOpen(false);
              }}
            >
              <span className="text-lg mr-2">{countryOption.flag}</span>
              <span>{countryOption.name}</span>
              {selectedCountry.id === countryOption.id && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </Button>
          ))}
          
          <div className="border-t my-1 pt-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-left px-2 py-1.5 h-9 text-sm"
              asChild
            >
              <Link to="/country-selection">
                <ExternalLink className="h-4 w-4 mr-2" />
                Comparaison détaillée
              </Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelector;
