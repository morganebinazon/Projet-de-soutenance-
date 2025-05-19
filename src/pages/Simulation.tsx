
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, DownloadIcon, Mail } from "lucide-react";
import SalaryChart from "@/components/simulation/SalaryChart";
import { useCountry } from "@/hooks/use-country";

const Simulation = () => {
  const { country } = useCountry();
  const [grossSalary, setGrossSalary] = useState<string>("");
  const [netSalary, setNetSalary] = useState<string>("");
  const [familyStatus, setFamilyStatus] = useState<string>("single");
  const [children, setChildren] = useState<string>("0");
  const [simulationType, setSimulationType] = useState<string>("gross-to-net");
  const [results, setResults] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perform calculation (simplified for demo)
    const grossValue = parseFloat(grossSalary.replace(/,/g, "")) || 0;
    const netValue = parseFloat(netSalary.replace(/,/g, "")) || 0;
    
    let calculatedNet = 0;
    let calculatedGross = 0;
    let socialContributions = 0;
    let incomeTax = 0;
    
    if (simulationType === "gross-to-net") {
      // Simple calculation for demo
      socialContributions = grossValue * 0.0525; // 5.25% CNSS in Benin
      const taxableIncome = grossValue - socialContributions;
      incomeTax = taxableIncome * 0.1; // Simplified 10% tax
      calculatedNet = grossValue - socialContributions - incomeTax;
      
      setResults({
        grossSalary: grossValue,
        netSalary: calculatedNet,
        socialContributions,
        incomeTax,
        country,
        familyStatus,
        children: parseInt(children)
      });
    } else {
      // Net to gross (simplified)
      calculatedGross = netValue / 0.85; // Approximately reversing the above
      socialContributions = calculatedGross * 0.0525;
      incomeTax = (calculatedGross - socialContributions) * 0.1;
      
      setResults({
        grossSalary: calculatedGross,
        netSalary: netValue,
        socialContributions,
        incomeTax,
        country,
        familyStatus,
        children: parseInt(children)
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Simulateur de Salaire {country === "benin" ? "Bénin" : "Togo"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Calculez rapidement votre salaire net ou brut selon la législation en vigueur
            </p>
          </div>

          <Tabs defaultValue="gross-to-net" onValueChange={setSimulationType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="gross-to-net" className="text-base py-3">Brut → Net</TabsTrigger>
              <TabsTrigger value="net-to-gross" className="text-base py-3">Net → Brut</TabsTrigger>
            </TabsList>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  {simulationType === "gross-to-net" 
                    ? "Calculer le salaire net à partir du brut" 
                    : "Calculer le salaire brut nécessaire"}
                </CardTitle>
                <CardDescription>
                  {simulationType === "gross-to-net"
                    ? "Entrez votre salaire brut et vos informations personnelles"
                    : "Entrez le salaire net souhaité et vos informations personnelles"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <TabsContent value="gross-to-net" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="gross-salary">Salaire brut mensuel (FCFA)</Label>
                        <Input
                          id="gross-salary"
                          placeholder="Ex: 250000"
                          value={grossSalary}
                          onChange={(e) => setGrossSalary(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="net-to-gross" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="net-salary">Salaire net souhaité (FCFA)</Label>
                        <Input
                          id="net-salary"
                          placeholder="Ex: 200000"
                          value={netSalary}
                          onChange={(e) => setNetSalary(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="family-status">Situation familiale</Label>
                      <Select 
                        value={familyStatus} 
                        onValueChange={setFamilyStatus}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Célibataire</SelectItem>
                          <SelectItem value="married">Marié(e)</SelectItem>
                          <SelectItem value="divorced">Divorcé(e)</SelectItem>
                          <SelectItem value="widowed">Veuf/Veuve</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="children">Nombre d'enfants à charge</Label>
                      <Select 
                        value={children} 
                        onValueChange={setChildren}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-benin-green hover:bg-benin-green/90 text-lg py-6"
                  >
                    Calculer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Tabs>
          
          {results && (
            <div className="mt-12 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Résultats de la simulation</CardTitle>
                  <CardDescription>
                    Basé sur la législation {country === "benin" ? "béninoise" : "togolaise"} en vigueur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Salaire brut mensuel</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(results.grossSalary)}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Cotisations sociales (CNSS)</p>
                          <p className="text-xl font-semibold text-togo-red">
                            - {formatCurrency(results.socialContributions)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            5,25% du salaire brut
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Impôt sur le revenu (IRPP)</p>
                          <p className="text-xl font-semibold text-togo-red">
                            - {formatCurrency(results.incomeTax)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Selon barème {country === "benin" ? "béninois" : "togolais"}
                          </p>
                        </div>
                        
                        <div className="bg-benin-green/10 p-4 rounded-lg">
                          <p className="text-sm text-benin-green font-medium">Salaire net à payer</p>
                          <p className="text-3xl font-bold text-benin-green">
                            {formatCurrency(results.netSalary)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button variant="outline" className="flex-1">
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Télécharger PDF
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Mail className="mr-2 h-4 w-4" />
                            Envoyer par email
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Répartition du salaire
                      </h3>
                      <div className="h-64">
                        <SalaryChart results={results} />
                      </div>
                      
                      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Informations</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex justify-between">
                            <span>Pays:</span>
                            <span className="font-medium">
                              {country === "benin" ? "Bénin" : "Togo"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Situation familiale:</span>
                            <span className="font-medium">
                              {familyStatus === "single" ? "Célibataire" : 
                               familyStatus === "married" ? "Marié(e)" :
                               familyStatus === "divorced" ? "Divorcé(e)" : "Veuf/Veuve"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Enfants à charge:</span>
                            <span className="font-medium">{children}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Taux de prélèvement:</span>
                            <span className="font-medium">
                              {Math.round(((results.grossSalary - results.netSalary) / results.grossSalary) * 100)}%
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Note: Cette simulation est donnée à titre indicatif et peut varier selon votre situation particulière. 
                      Pour une analyse précise, consultez un expert-comptable.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => setResults(null)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la simulation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Simulation;
