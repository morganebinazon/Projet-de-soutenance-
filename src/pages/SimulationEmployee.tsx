import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, BarChart2, Calculator, Download, Eye, HelpCircle, Mail, Share } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCountry } from "@/hooks/use-country.tsx";

// Mock chart components (would use recharts in real implementation)
const PieChart = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-100 dark:bg-gray-800 h-full rounded-lg flex items-center justify-center">
    <div className="text-center text-sm text-muted-foreground">Graphique de répartition</div>
  </div>
);

const LineChart = ({ data }: { data: any[] }) => (
  <div className="bg-gray-100 dark:bg-gray-800 h-full rounded-lg flex items-center justify-center">
    <div className="text-center text-sm text-muted-foreground">Graphique d'évolution</div>
  </div>
);

const BarChart = ({ data }: { data: any[] }) => (
  <div className="bg-gray-100 dark:bg-gray-800 h-full rounded-lg flex items-center justify-center">
    <div className="text-center text-sm text-muted-foreground">Graphique comparatif</div>
  </div>
);

const SimulationEmployee = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const [simulationType, setSimulationType] = useState("gross-to-net");
  const [grossSalary, setGrossSalary] = useState<number>(350000);
  const [netSalary, setNetSalary] = useState<string>("282625");
  const [familyStatus, setFamilyStatus] = useState("single");
  const [children, setChildren] = useState("0");
  const [showResults, setShowResults] = useState(true);

  const handleSliderChange = (value: number[]) => {
    setGrossSalary(value[0]);
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Simulateur de Salaire</h1>
              </div>
              <p className="text-muted-foreground">
                Calculez votre salaire net/brut et obtenez une analyse détaillée
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-sm font-medium">Pays:</span>
              <Select defaultValue={country}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="benin">Bénin</SelectItem>
                  <SelectItem value="togo">Togo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Onglets de type de simulation */}
          <Tabs defaultValue="gross-to-net" className="mb-8" onValueChange={setSimulationType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gross-to-net">
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Brut → Net
              </TabsTrigger>
              <TabsTrigger value="net-to-gross">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Net → Brut
              </TabsTrigger>
              <TabsTrigger value="compare">
                <BarChart2 className="h-4 w-4 mr-2" />
                Comparaison
              </TabsTrigger>
            </TabsList>
            
            {/* Contenu de l'onglet Brut → Net */}
            <TabsContent value="gross-to-net">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panneau de gauche - Paramètres */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Paramètres de simulation</CardTitle>
                      <CardDescription>
                        Ajustez les valeurs selon votre situation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-4">Salaire brut mensuel</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="gross-salary">Montant</Label>
                            <Label htmlFor="net-salary">Montant net souhaité</Label>
                            <span className="font-medium text-benin-green">{formatCurrency(Number(netSalary))}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Input
                              id="net-salary"
                              type="number"
                              className="w-full"
                              value={netSalary}
                              onChange={(e) => setNetSalary(e.target.value)}
                            />
                            <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">FCFA / mois</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Situation personnelle */}
                      <div>
                        <h3 className="text-sm font-medium mb-4">Situation personnelle</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="family-status">Situation familiale</Label>
                            <Select defaultValue={familyStatus} onValueChange={setFamilyStatus}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Célibataire</SelectItem>
                                <SelectItem value="married">Marié(e)</SelectItem>
                                <SelectItem value="divorced">Divorcé(e)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="children">Enfants à charge</Label>
                            <Select defaultValue={children} onValueChange={setChildren}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Aucun</SelectItem>
                                <SelectItem value="1">1 enfant</SelectItem>
                                <SelectItem value="2">2 enfants</SelectItem>
                                <SelectItem value="3">3 enfants</SelectItem>
                                <SelectItem value="4">4 enfants</SelectItem>
                                <SelectItem value="5">5 enfants ou plus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Avantages */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium">Avantages et primes</h3>
                          <Badge variant="outline">Optionnel</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Checkbox id="transport-allowance" />
                              <label htmlFor="transport-allowance" className="ml-2 text-sm">
                                Prime de transport
                              </label>
                            </div>
                            <Input
                              type="number"
                              placeholder="Montant"
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Checkbox id="housing-allowance" />
                              <label htmlFor="housing-allowance" className="ml-2 text-sm">
                                Indemnité de logement
                              </label>
                            </div>
                            <Input
                              type="number"
                              placeholder="Montant"
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Checkbox id="thirteenth-month" />
                              <label htmlFor="thirteenth-month" className="ml-2 text-sm">
                                13ème mois
                              </label>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              (annualisé)
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-benin-green hover:bg-benin-green/90"
                        onClick={() => setShowResults(true)}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculer le salaire net
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Panneau de droite - Résultats */}
                <div className="lg:col-span-2 space-y-6">
                  {showResults ? (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Résultats de la simulation</CardTitle>
                          <CardDescription>
                            Basé sur la législation {country === "benin" ? "béninoise" : "togolaise"} en vigueur (mai 2025)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Résumé des résultats - côté gauche */}
                            <div className="space-y-6">
                              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Salaire net mensuel</h3>
                                <div className="text-4xl font-bold text-benin-green">282 625 FCFA</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Soit 80.75% du brut
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                {/* Breakdown - salaire brut vers net */}
                                <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                                  <div className="flex justify-between mb-2">
                                    <span className="font-medium">Salaire brut mensuel</span>
                                    <span className="font-medium">350 000 FCFA</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-red-500">
                                    <span>Cotisations sociales (3.6%)</span>
                                    <span>- 12 600 FCFA</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-red-500">
                                    <span>IRPP</span>
                                    <span>- 54 775 FCFA</span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-medium">
                                    <span>Salaire net mensuel</span>
                                    <span className="text-benin-green">282 625 FCFA</span>
                                  </div>
                                </div>
                                
                                {/* Projection annuelle */}
                                <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                                  <h3 className="font-medium mb-2">Projection annuelle</h3>
                                  <div className="flex justify-between text-sm">
                                    <span>Net annuel (12 mois)</span>
                                    <span>3 391 500 FCFA</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-green-500">
                                    <span>13ème mois (si applicable)</span>
                                    <span>+ 282 625 FCFA</span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-medium">
                                    <span>Total annuel estimé</span>
                                    <span>3 674 125 FCFA</span>
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex gap-2">
                                  <Button variant="outline" className="flex-1">
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    <Share className="h-4 w-4 mr-2" />
                                    Partager
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Visualisations - côté droit */}
                            <div className="space-y-6">
                              {/* Graphique en anneau */}
                              <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                                <h3 className="font-medium mb-4">Répartition du salaire</h3>
                                <div className="h-[250px]">
                                  <PieChart>
                                    {/* Mock chart content */}
                                  </PieChart>
                                </div>
                              </div>
                              
                              {/* Détail du calcul IRPP */}
                              <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="font-medium">Détail du calcul IRPP</h3>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <div className="flex justify-between">
                                      <span>Revenu imposable</span>
                                      <span>337 400 FCFA</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Salaire brut - cotisations sociales
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <div className="flex justify-between font-medium">
                                      <span>Calcul par tranches:</span>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                      <div className="flex justify-between">
                                        <span>Tranche 0% (≤ 50 000)</span>
                                        <span>0 FCFA</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tranche 10% (50 001 à 130 000)</span>
                                        <span>8 000 FCFA</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tranche 15% (130 001 à 280 000)</span>
                                        <span>22 500 FCFA</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tranche 20% (280 001 à 337 400)</span>
                                        <span>11 480 FCFA</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div className="flex justify-between">
                                    <span>Total IRPP mensuel</span>
                                    <span className="font-medium">54 775 FCFA</span>
                                  </div>
                                  
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Taux moyen d'imposition</span>
                                    <span>15.65% du salaire brut</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Informations complémentaires et comparatifs */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Informations complémentaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="details">
                            <TabsList className="w-full">
                              <TabsTrigger value="details">Détails additionnels</TabsTrigger>
                              <TabsTrigger value="market">Comparaison marché</TabsTrigger>
                              <TabsTrigger value="employer">Coût employeur</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="details" className="mt-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium mb-2">Taux de prélèvement</h4>
                                  <div className="text-2xl font-bold">19.25%</div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Cumul des charges sociales et fiscales
                                  </p>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium mb-2">Salaire horaire net</h4>
                                  <div className="text-2xl font-bold">1 637 FCFA</div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Base 40h/semaine (173h/mois)
                                  </p>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium mb-2">Salaire journalier net</h4>
                                  <div className="text-2xl font-bold">13 459 FCFA</div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Base 21 jours travaillés/mois
                                  </p>
                                </div>
                              </div>
                              
                              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 text-sm">
                                <h4 className="font-medium flex items-center text-amber-800 dark:text-amber-400">
                                  <HelpCircle className="h-4 w-4 mr-2" />
                                  Information importante
                                </h4>
                                <p className="mt-1 text-amber-700 dark:text-amber-300">
                                  Cette simulation est donnée à titre indicatif et peut varier selon votre convention collective ou accords d'entreprise spécifiques. Pour une analyse précise, consultez un expert-comptable.
                                </p>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="market" className="mt-4">
                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium mb-4">Comparaison avec le marché</h4>
                                  <div className="h-[250px]">
                                    <BarChart data={[]} />
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium mb-4">Position sur le marché</h4>
                                  <div className="space-y-4">
                                    <div>
                                      <div className="flex justify-between mb-1">
                                        <span className="text-sm">Positionnement global</span>
                                        <span className="text-sm font-medium">65ème percentile</span>
                                      </div>
                                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-benin-green rounded-full" style={{ width: '65%' }}></div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Votre salaire est supérieur à 65% des salariés au Bénin
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <div className="flex justify-between mb-1">
                                        <span className="text-sm">Dans votre secteur</span>
                                        <span className="text-sm font-medium">Conforme au marché</span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>-20%</span>
                                        <span className="font-medium">Votre salaire</span>
                                        <span>+20%</span>
                                      </div>
                                      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                        <div className="absolute top-0 left-[40%] h-4 w-4 -mt-1 bg-benin-green rounded-full"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="employer" className="mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-medium mb-4">Charges patronales</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span>Salaire brut (base)</span>
                                      <span className="font-medium">350 000 FCFA</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Cotisations patronales (15.4%)</span>
                                      <span className="font-medium text-red-500">+ 53 900 FCFA</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Assurance risques (2%)</span>
                                      <span className="font-medium text-red-500">+ 7 000 FCFA</span>
                                    </div>
                                    <Separator className="my-1" />
                                    <div className="flex justify-between">
                                      <span className="font-medium">Coût total employeur</span>
                                      <span className="font-bold">410 900 FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>Ratio net/coût total</span>
                                      <span>68.78%</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium mb-4">Répartition du coût total</h4>
                                  <div className="h-[200px]">
                                    <PieChart>
                                      {/* Mock chart content */}
                                    </PieChart>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
                      <div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full inline-flex items-center justify-center mb-4">
                          <Calculator className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Calculez votre salaire</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                          Ajustez les paramètres dans le panneau de gauche selon votre situation personnelle et cliquez sur le bouton "Calculer" pour voir les résultats.
                        </p>
                        <Button 
                          className="bg-benin-green hover:bg-benin-green/90"
                          onClick={() => setShowResults(true)}
                        >
                          <Calculator className="mr-2 h-4 w-4" />
                          Lancer le calcul
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de Net → Brut (structure similaire) */}
            <TabsContent value="net-to-gross">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panneau de gauche - Paramètres */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Paramètres de simulation</CardTitle>
                      <CardDescription>
                        Calculez le salaire brut nécessaire pour obtenir un net souhaité
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-4">Salaire net souhaité</h3>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <Label htmlFor="net-salary">Montant net souhaité</Label>
                            <span className="font-medium text-benin-green">{formatCurrency(Number(netSalary))}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Input
                              id="net-salary"
                              type="number"
                              className="w-full"
                              value={netSalary}
                              onChange={(e) => setNetSalary(e.target.value)}
                            />
                            <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">FCFA / mois</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-4">Situation personnelle</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="family-status">Situation familiale</Label>
                            <Select defaultValue={familyStatus} onValueChange={setFamilyStatus}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Célibataire</SelectItem>
                                <SelectItem value="married">Marié(e)</SelectItem>
                                <SelectItem value="divorced">Divorcé(e)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="children">Enfants à charge</Label>
                            <Select defaultValue={children} onValueChange={setChildren}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Aucun</SelectItem>
                                <SelectItem value="1">1 enfant</SelectItem>
                                <SelectItem value="2">2 enfants</SelectItem>
                                <SelectItem value="3">3 enfants</SelectItem>
                                <SelectItem value="4">4 enfants</SelectItem>
                                <SelectItem value="5">5 enfants ou plus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium">Avantages et primes</h3>
                          <Badge variant="outline">Optionnel</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Checkbox id="transport-allowance-net" />
                              <label htmlFor="transport-allowance-net" className="ml-2 text-sm">
                                Prime de transport
                              </label>
                            </div>
                            <Input
                              type="number"
                              placeholder="Montant"
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Checkbox id="housing-allowance-net" />
                              <label htmlFor="housing-allowance-net" className="ml-2 text-sm">
                                Indemnité de logement
                              </label>
                            </div>
                            <Input
                              type="number"
                              placeholder="Montant"
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-benin-green hover:bg-benin-green/90"
                        onClick={() => setShowResults(true)}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculer le salaire brut nécessaire
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Panneau de droite - Résultats (similar structure) */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-center h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
                    <div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full inline-flex items-center justify-center mb-4">
                        <Calculator className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Calculez votre salaire brut</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Saisissez le salaire net souhaité et vos informations personnelles pour déterminer le salaire brut correspondant.
                      </p>
                      <Button 
                        className="bg-benin-green hover:bg-benin-green/90"
                        onClick={() => setShowResults(true)}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Lancer le calcul
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de Comparaison */}
            <TabsContent value="compare">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Simulateur gauche */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scénario A</CardTitle>
                    <CardDescription>
                      Situation actuelle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Form for scenario A */}
                    <div className="space-y-4">
                      <div>
                        <Label>Salaire brut mensuel</Label>
                        <Input className="mt-1" defaultValue="350000" />
                      </div>
                      <div>
                        <Label>Situation familiale</Label>
                        <Select defaultValue="single">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Célibataire</SelectItem>
                            <SelectItem value="married">Marié(e)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Enfants à charge</Label>
                        <Select defaultValue="0">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Aucun</SelectItem>
                            <SelectItem value="1">1 enfant</SelectItem>
                            <SelectItem value="2">2 enfants</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                          <h4 className="text-sm font-medium mb-1">Salaire net estimé</h4>
                          <div className="text-2xl font-bold text-benin-green">282 625 FCFA</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Simulateur droit */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scénario B</CardTitle>
                    <CardDescription>
                      Situation simulée
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Form for scenario B */}
                    <div className="space-y-4">
                      <div>
                        <Label>Salaire brut mensuel</Label>
                        <Input className="mt-1" defaultValue="400000" />
                      </div>
                      <div>
                        <Label>Situation familiale</Label>
                        <Select defaultValue="married">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Célibataire</SelectItem>
                            <SelectItem value="married">Marié(e)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Enfants à charge</Label>
                        <Select defaultValue="1">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Aucun</SelectItem>
                            <SelectItem value="1">1 enfant</SelectItem>
                            <SelectItem value="2">2 enfants</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                          <h4 className="text-sm font-medium mb-1">Salaire net estimé</h4>
                          <div className="text-2xl font-bold text-benin-green">338 000 FCFA</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Différence entre les deux */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Analyse comparative</CardTitle>
                    <CardDescription>
                      Différences entre les deux scénarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Différence nette</h4>
                          <div className="text-2xl font-bold text-green-600">+55 375 FCFA</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Par mois
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Augmentation</h4>
                          <div className="text-2xl font-bold text-green-600">+19.6%</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Du salaire net
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Impact annuel</h4>
                          <div className="text-2xl font-bold text-green-600">+664 500 FCFA</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sur 12 mois
                          </p>
                        </div>
                      </div>
                      
                      <div className="h-64">
                        <BarChart data={[]} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <h4 className="font-medium">Détails par composante</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Élément</th>
                                <th className="text-right py-2">Scénario A</th>
                                <th className="text-right py-2">Scénario B</th>
                                <th className="text-right py-2">Différence</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2">Salaire brut</td>
                                <td className="text-right">350 000</td>
                                <td className="text-right">400 000</td>
                                <td className="text-right text-green-600">+50 000</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2">Cotisations sociales</td>
                                <td className="text-right">12 600</td>
                                <td className="text-right">14 400</td>
                                <td className="text-right text-red-500">-1 800</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2">IRPP</td>
                                <td className="text-right">54 775</td>
                                <td className="text-right">47 600</td>
                                <td className="text-right text-green-600">+7 175</td>
                              </tr>
                              <tr>
                                <td className="py-2 font-medium">Salaire net</td>
                                <td className="text-right font-medium">282 625</td>
                                <td className="text-right font-medium">338 000</td>
                                <td className="text-right font-medium text-green-600">+55 375</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div>
                          <h4 className="font-medium mb-4">Facteurs d'optimisation</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <div className="bg-green-500 text-white p-1 rounded-full mr-2 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Situation familiale:</span> Le statut "marié" permet une réduction de l'IRPP de 7 175 FCFA.
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-green-500 text-white p-1 rounded-full mr-2 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Optimisation des charges:</span> Le ratio net/brut passe de 80.75% à 84.5% grâce aux abattements familiaux.
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SimulationEmployee;
