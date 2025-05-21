
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ArrowLeft, DownloadIcon, Mail, Calculator, BarChart2, History, FileText, MinusCircle, Building, Info, Settings, ChevronDown } from "lucide-react";
import SalaryChart from "@/components/simulation/SalaryChart";
import { useCountry } from "@/hooks/use-country";

const Simulation = () => {
  const { country } = useCountry();
  const [grossSalary, setGrossSalary] = useState<number>(250000);
  const [netSalary, setNetSalary] = useState<string>("");
  const [familyStatus, setFamilyStatus] = useState<string>("single");
  const [children, setChildren] = useState<string>("0");
  const [simulationType, setSimulationType] = useState<string>("gross-to-net");
  const [results, setResults] = useState<any>(null);
  const [liveCalculation, setLiveCalculation] = useState<boolean>(false);
  const [expertMode, setExpertMode] = useState<boolean>(false);
  const [detailsExpanded, setDetailsExpanded] = useState<{[key: string]: boolean}>({
    cnss: false,
    irpp: false
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateResults();
  };

  const calculateResults = () => {
    // Perform calculation (simplified for demo)
    const grossValue = simulationType === "gross-to-net" ? grossSalary : parseFloat(netSalary.replace(/,/g, "")) || 0;
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

  const toggleDetail = (section: string) => {
    setDetailsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setGrossSalary(newValue);
    if (liveCalculation) {
      calculateResults();
    }
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

          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="simple" className="text-base py-3">
                <Calculator className="h-4 w-4 mr-2" />
                Calcul Simple
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-base py-3">
                <BarChart2 className="h-4 w-4 mr-2" />
                Comparaison
              </TabsTrigger>
              <TabsTrigger value="history" className="text-base py-3">
                <History className="h-4 w-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple">
              <Tabs defaultValue="gross-to-net" onValueChange={setSimulationType}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="gross-to-net" className="text-base py-3">Brut → Net</TabsTrigger>
                  <TabsTrigger value="net-to-gross" className="text-base py-3">Net → Brut</TabsTrigger>
                </TabsList>
                
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
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
                      </div>
                      <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                        Législation à jour • Mai 2025
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <TabsContent value="gross-to-net" className="mt-0">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="gross-salary">Salaire brut mensuel (FCFA)</Label>
                              <span className="font-medium text-benin-green">{formatCurrency(grossSalary)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-4 py-2">
                              <span className="text-sm">50 000</span>
                              <Slider
                                value={[grossSalary]}
                                min={50000}
                                max={2000000}
                                step={10000}
                                onValueChange={handleSliderChange}
                                className="flex-1"
                              />
                              <span className="text-sm">2 000 000</span>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>SMIG</span>
                              <span>Salaire moyen</span>
                              <span>Cadre sup.</span>
                            </div>
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
                      
                      {/* Mode Expert */}
                      <div className="mt-4 border-t pt-4">
                        <Collapsible open={expertMode} onOpenChange={setExpertMode}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex w-full justify-between p-2">
                              <span className="flex items-center">
                                <Settings className="h-4 w-4 mr-2" />
                                Mode Expert
                              </span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Type de contrat</Label>
                                <Select defaultValue="cdi">
                                  <SelectTrigger>
                                    <SelectValue placeholder="CDI" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cdi">CDI</SelectItem>
                                    <SelectItem value="cdd">CDD</SelectItem>
                                    <SelectItem value="stage">Stage</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label>Secteur d'activité</Label>
                                <Select defaultValue="commerce">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="commerce">Commerce</SelectItem>
                                    <SelectItem value="industrie">Industrie</SelectItem>
                                    <SelectItem value="service">Services</SelectItem>
                                    <SelectItem value="btp">BTP</SelectItem>
                                    <SelectItem value="agriculture">Agriculture</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Primes et avantages */}
                              <div>
                                <Label>Prime de transport</Label>
                                <Input placeholder="0" type="number" />
                              </div>
                              
                              <div>
                                <Label>Prime de logement</Label>
                                <Input placeholder="0" type="number" />
                              </div>
                              
                              <div>
                                <Label>Avantages en nature</Label>
                                <Input placeholder="0" type="number" />
                              </div>
                              
                              <div>
                                <Label>Prime de rendement</Label>
                                <Input placeholder="0" type="number" />
                              </div>
                            </div>
                            
                            <div className="pt-2 flex items-center space-x-2">
                              <Checkbox id="live-calculation" checked={liveCalculation} onCheckedChange={(checked) => setLiveCalculation(checked as boolean)} />
                              <label htmlFor="live-calculation" className="text-sm cursor-pointer">
                                Calcul en temps réel (mise à jour instantanée des résultats)
                              </label>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
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
            </TabsContent>
            
            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Comparaison de deux scénarios</CardTitle>
                  <CardDescription>
                    Comparez deux situations différentes ou deux pays
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold mb-4">Scénario 1</h3>
                      <p className="text-sm mb-6">Configurez les paramètres du premier scénario</p>
                      <Button className="w-full">Configurer</Button>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold mb-4">Scénario 2</h3>
                      <p className="text-sm mb-6">Configurez les paramètres du second scénario</p>
                      <Button className="w-full">Configurer</Button>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">Cette fonctionnalité sera bientôt disponible</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des simulations</CardTitle>
                  <CardDescription>
                    Consultez vos simulations précédentes
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center p-10">
                  <div className="mb-4">
                    <FileText className="h-16 w-16 mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Aucun historique disponible</h3>
                  <p className="text-gray-500 mb-6">
                    Connectez-vous pour enregistrer vos simulations et y accéder ultérieurement
                  </p>
                  <Button variant="outline">Se connecter</Button>
                </CardContent>
              </Card>
            </TabsContent>
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
                      <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                        <h3 className="text-lg font-bold mb-6 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-benin-green" />
                          Détail du calcul
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Salaire brut */}
                          <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="font-medium">Salaire brut</p>
                              <p className="text-xs text-gray-500">Base de calcul</p>
                            </div>
                            <p className="text-lg font-bold">{formatCurrency(results.grossSalary)}</p>
                          </div>
                          
                          {/* Cotisations détaillées - cliquables pour détails */}
                          <div className="pl-4 py-2 border-l-2 border-togo-red">
                            <div className="flex justify-between items-center mb-2">
                              <button className="flex items-center text-sm font-medium group" onClick={() => toggleDetail('cnss')}>
                                <MinusCircle className="h-4 w-4 mr-2 text-togo-red group-hover:text-togo-red/70" />
                                Cotisations sociales (CNSS)
                              </button>
                              <p className="text-togo-red font-medium">- {formatCurrency(results.socialContributions)}</p>
                            </div>
                            
                            {detailsExpanded.cnss && (
                              <div className="pl-6 space-y-1 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>• Retraite (3.6%)</span>
                                  <span>- {formatCurrency(results.grossSalary * 0.036)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>• Prestations familiales (0%)</span>
                                  <span>- {formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>• Risques professionnels (0%)</span>
                                  <span>- {formatCurrency(0)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Impôts */}
                          <div className="pl-4 py-2 border-l-2 border-togo-red">
                            <div className="flex justify-between items-center mb-2">
                              <button className="flex items-center text-sm font-medium group" onClick={() => toggleDetail('irpp')}>
                                <MinusCircle className="h-4 w-4 mr-2 text-togo-red group-hover:text-togo-red/70" />
                                Impôt sur le revenu (IRPP)
                              </button>
                              <p className="text-togo-red font-medium">- {formatCurrency(results.incomeTax)}</p>
                            </div>
                            
                            {detailsExpanded.irpp && (
                              <div className="pl-6 space-y-1 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>• Tranche 1 (0%)</span>
                                  <span>- {formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>• Tranche 2 (10%)</span>
                                  <span>- {formatCurrency(results.incomeTax)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Salaire net - avec effet de surlignage */}
                          <div className="flex justify-between items-center p-3 bg-benin-green/10 rounded-lg mt-6">
                            <div>
                              <p className="font-bold text-benin-green">Salaire net à payer</p>
                              <p className="text-xs text-gray-600">Versé sur compte bancaire</p>
                            </div>
                            <p className="text-2xl font-bold text-benin-green">{formatCurrency(results.netSalary)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Coût employeur - nouvelle section */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mt-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <Building className="h-5 w-5 mr-2 text-gray-600" />
                          Coût total employeur
                        </h3>
                        
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium">Coût total employeur</p>
                            <p className="text-xs text-gray-500">Inclut toutes les charges patronales</p>
                          </div>
                          <p className="text-xl font-bold">{formatCurrency(results.grossSalary * 1.17)}</p>
                        </div>
                        
                        <button className="mt-3 text-sm text-benin-green flex items-center hover:underline">
                          <Info className="h-4 w-4 mr-1" />
                          Voir le détail des charges patronales
                        </button>
                      </div>
                      
                      <div className="flex space-x-3 mt-6">
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
