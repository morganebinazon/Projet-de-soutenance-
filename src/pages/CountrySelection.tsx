
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { useCountry } from "@/hooks/use-country";
import { toast } from "sonner";

const CountrySelection = () => {
  const { country, setCountry } = useCountry();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"map" | "comparison">("map");

  const handleCountrySelect = (countryId: string) => {
    setCountry(countryId);
    toast.success(`Pays sélectionné: ${countryId === "benin" ? "Bénin" : "Togo"}`);
  };

  const handleContinue = () => {
    navigate("/simulation");
  };

  return (
    <Layout>
      <div className="container max-w-5xl px-4 py-12 mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Choisissez votre pays</h1>
          <p className="text-muted-foreground mt-2">
            Sélectionnez un pays pour adapter les calculs et formulaires aux spécificités légales
          </p>
        </div>

        <Tabs defaultValue="map" onValueChange={(value) => setSelectedTab(value as "map" | "comparison")}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="map">Carte interactive</TabsTrigger>
            <TabsTrigger value="comparison">Tableau comparatif</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  country === "benin" ? "ring-2 ring-benin-green" : ""
                }`}
                onClick={() => handleCountrySelect("benin")}
              >
                <CardHeader className="bg-benin-green/10 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Bénin</CardTitle>
                    <span className="text-4xl">🇧🇯</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="aspect-[4/3] bg-[url('/images/benin-map.svg')] bg-contain bg-center bg-no-repeat mb-4">
                    {/* Map placeholder */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-40 h-60 bg-benin-green/5 border border-benin-green/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                        <span className="text-6xl">🇧🇯</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">République du Bénin</p>
                    <p className="text-muted-foreground">
                      Calculs conformes au Code du Travail béninois et aux 
                      réglementations CNSS en vigueur.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  country === "togo" ? "ring-2 ring-togo-red" : ""
                }`}
                onClick={() => handleCountrySelect("togo")}
              >
                <CardHeader className="bg-togo-red/10 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Togo</CardTitle>
                    <span className="text-4xl">🇹🇬</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="aspect-[4/3] bg-[url('/images/togo-map.svg')] bg-contain bg-center bg-no-repeat mb-4">
                    {/* Map placeholder */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-40 h-60 bg-togo-red/5 border border-togo-red/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                        <span className="text-6xl">🇹🇬</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">République Togolaise</p>
                    <p className="text-muted-foreground">
                      Calculs conformes au Code du Travail togolais et aux 
                      réglementations CNSS en vigueur.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Comparaison des législations</CardTitle>
                <CardDescription>
                  Principales différences entre les systèmes de paie au Bénin et au Togo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Élément</th>
                        <th className="text-left py-3 px-4">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">🇧🇯</span> Bénin
                          </span>
                        </th>
                        <th className="text-left py-3 px-4">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">🇹🇬</span> Togo
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Congés payés</td>
                        <td className="py-3 px-4">24 jours ouvrables/an</td>
                        <td className="py-3 px-4">30 jours ouvrables/an</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Congé maternité</td>
                        <td className="py-3 px-4">14 semaines</td>
                        <td className="py-3 px-4">14 semaines</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Congé paternité</td>
                        <td className="py-3 px-4">3 jours ouvrables</td>
                        <td className="py-3 px-4">10 jours ouvrables</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Cotisations sociales (part salariale)</td>
                        <td className="py-3 px-4">3,6% du salaire brut</td>
                        <td className="py-3 px-4">4% du salaire brut</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Cotisations sociales (part patronale)</td>
                        <td className="py-3 px-4">16,4% du salaire brut</td>
                        <td className="py-3 px-4">17,5% du salaire brut</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium">Heures supplémentaires (premières heures)</td>
                        <td className="py-3 px-4">Majoration de 15%</td>
                        <td className="py-3 px-4">Majoration de 15%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            className={country === "benin" ? "bg-benin-green" : "bg-togo-red"}
            onClick={handleContinue}
          >
            Continuer avec {country === "benin" ? "le Bénin" : "le Togo"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CountrySelection;
