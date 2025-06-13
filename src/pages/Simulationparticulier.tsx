import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, Download, Save, Share2 } from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { toast } from "@/components/ui/use-toast";

const Simulationparticulier = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const [simulationType, setSimulationType] = useState("gross-to-net");
  const [grossSalary, setGrossSalary] = useState<number>(350000);
  const [netSalary, setNetSalary] = useState<string>("250000");
  const [familyStatus, setFamilyStatus] = useState("single");
  const [children, setChildren] = useState("0");
  const [transportBonus, setTransportBonus] = useState<number>(0);
  const [housingBonus, setHousingBonus] = useState<number>(0);
  const [results, setResults] = useState<any>(null);
  const [saveSimulation, setSaveSimulation] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleCalculate = () => {
    // Logique de calcul (utiliser les fonctions du code précédent)
    const mockResults = {
      salaireBrut: grossSalary,
      salaireNet: Math.round(grossSalary * 0.76),
      cnss: Math.round(grossSalary * 0.036),
      impot: Math.round(grossSalary * 0.18),
      country,
      familyStatus,
      children
    };
    
    setResults(mockResults);
    
    if (saveSimulation) {
      toast({
        title: "Simulation sauvegardée",
        description: "Votre simulation a été ajoutée à votre historique",
        variant: "default"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Simulateur de Salaire</h1>
              <p className="text-muted-foreground">
                Calculez votre salaire selon la législation {country === 'benin' ? 'béninoise' : 'togolaise'}
              </p>
            </div>
          </div>

          <Tabs value={simulationType} onValueChange={setSimulationType} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gross-to-net">Brut → Net</TabsTrigger>
              <TabsTrigger value="net-to-gross">Net → Brut</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulaire de simulation */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres</CardTitle>
                    <CardDescription>
                      Configurez votre simulation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TabsContent value="gross-to-net" className="mt-0">
                      <div>
                        <Label>Salaire brut mensuel (FCFA)</Label>
                        <Input
                          type="number"
                          value={grossSalary === 0 ? '' : grossSalary}
                          onChange={(e) => setGrossSalary(parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="net-to-gross" className="mt-0">
                      <div>
                        <Label>Salaire net souhaité (FCFA)</Label>
                        <Input
                          type="number"
                          value={netSalary}
                          onChange={(e) => setNetSalary(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </TabsContent>

                    <div>
                      <Label>Situation familiale</Label>
                      <Select value={familyStatus} onValueChange={setFamilyStatus}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
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
                      <Label>Enfants à charge</Label>
                      <Select value={children} onValueChange={setChildren}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
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

                    <div className="space-y-2">
                      <Label>Options avancées</Label>
                      <div>
                        <Label className="text-sm">Prime de transport</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={transportBonus === 0 ? '' : transportBonus}
                          onChange={(e) => setTransportBonus(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Prime de logement</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={housingBonus === 0 ? '' : housingBonus}
                          onChange={(e) => setHousingBonus(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="save-simulation" 
                        checked={saveSimulation}
                        onCheckedChange={setSaveSimulation}
                      />
                      <Label htmlFor="save-simulation" className="text-sm">
                        Sauvegarder cette simulation
                      </Label>
                    </div>

                    <Button 
                      onClick={handleCalculate}
                      className="w-full bg-benin-green hover:bg-benin-green/90"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculer
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Résultats */}
              <div className="lg:col-span-2">
                {results ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Résultats de la simulation</CardTitle>
                          <CardDescription>
                            Législation {country === 'benin' ? 'béninoise' : 'togolaise'} - Juin 2025
                          </CardDescription>
                        </div>
                        <Badge className="bg-benin-green">
                          {country === 'benin' ? 'Bénin' : 'Togo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Résultat principal */}
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Salaire net mensuel
                        </h3>
                        <div className="text-4xl font-bold text-benin-green">
                          {formatCurrency(results.salaireNet)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Soit {((results.salaireNet / results.salaireBrut) * 100).toFixed(1)}% du brut
                        </p>
                      </div>

                      {/* Détail du calcul */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Composition</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Salaire brut</span>
                              <span className="font-medium">{formatCurrency(results.salaireBrut)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Cotisations sociales</span>
                              <span>-{formatCurrency(results.cnss)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Impôt sur le revenu</span>
                              <span>-{formatCurrency(results.impot)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-medium">
                                <span>Salaire net</span>
                                <span className="text-benin-green">{formatCurrency(results.salaireNet)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Projection annuelle</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Net annuel (12 mois)</span>
                              <span className="font-medium">{formatCurrency(results.salaireNet * 12)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>13ème mois (estimation)</span>
                              <span>+{formatCurrency(results.salaireNet)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-medium">
                                <span>Total estimé</span>
                                <span>{formatCurrency(results.salaireNet * 13)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Save className="mr-2 h-4 w-4" />
                          Sauvegarder
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Share2 className="mr-2 h-4 w-4" />
                          Partager
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-white dark:bg-gray-800 rounded-xl border">
                    <div className="text-center">
                      <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Prêt à calculer</h3>
                      <p className="text-muted-foreground">
                        Configurez vos paramètres et lancez la simulation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Simulationparticulier;
