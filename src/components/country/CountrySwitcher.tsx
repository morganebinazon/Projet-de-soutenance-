
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Flag } from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { toast } from "sonner";
import { useCountryComparison } from "@/hooks/use-country-comparison";

const CountrySwitcher = () => {
  const { country, setCountry } = useCountry();
  const { legislationComparison } = useCountryComparison();
  const [open, setOpen] = useState(false);

  const toggleCountry = () => {
    const newCountry = country === "benin" ? "togo" : "benin";
    setCountry(newCountry);
    setOpen(false);
    toast.success(`Pays changé pour ${newCountry === "benin" ? "Bénin" : "Togo"}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Flag className="h-4 w-4" />
          <span>Changer de pays</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer de pays</DialogTitle>
          <DialogDescription>
            Passer du {country === "benin" ? "Bénin" : "Togo"} au {country === "benin" ? "Togo" : "Bénin"} ?
            Cela adaptera tous les calculs selon la législation applicable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex gap-4 justify-center mb-6">
            <div className={`text-center p-3 rounded-lg ${country === "benin" ? "bg-benin-green/10 border border-benin-green/20" : "opacity-50"}`}>
              <span className="text-4xl block mb-2">🇧🇯</span>
              <h3 className="font-medium">Bénin</h3>
            </div>
            <div className="flex items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={`text-center p-3 rounded-lg ${country === "togo" ? "bg-togo-red/10 border border-togo-red/20" : "opacity-50"}`}>
              <span className="text-4xl block mb-2">🇹🇬</span>
              <h3 className="font-medium">Togo</h3>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Principales différences:</p>
            <ul className="list-disc list-inside space-y-1">
              {legislationComparison.slice(0, 3).map((item, index) => (
                <li key={index}>
                  <span className="font-medium">{item.feature}:</span> {item.benin} (Bénin) vs {item.togo} (Togo)
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 text-center">
            <Button 
              variant="link" 
              size="sm" 
              asChild 
              className="text-xs"
            >
              <Link to="/country-selection">
                <ExternalLink className="h-3 w-3 mr-1" />
                Voir toutes les différences
              </Link>
            </Button>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={toggleCountry}
            className={country === "benin" ? "bg-togo-red hover:bg-togo-red/90" : "bg-benin-green hover:bg-benin-green/90"}
          >
            Passer au {country === "benin" ? "Togo" : "Bénin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CountrySwitcher;
