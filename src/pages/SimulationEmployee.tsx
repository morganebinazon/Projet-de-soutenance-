import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, BarChart2, Calculator, Download, Eye, HelpCircle, Mail, Share } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCountry } from "@/hooks/use-country.tsx";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { calculateBeninSalary, calculateTogoSalary, calculateBeninNetToBrut, calculateTogoNetToBrut, SalaryResult, FamilyStatus } from '@/lib/salary-calculator';

const SimulationEmployee = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const [simulationType, setSimulationType] = useState("gross-to-net");
  const [grossSalary, setGrossSalary] = useState<number>(350000);
  const [netSalary, setNetSalary] = useState<string>("250000");
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>("single");
  const [children, setChildren] = useState("0");
  const [transportBonus, setTransportBonus] = useState<number>(0);
  const [housingBonus, setHousingBonus] = useState<number>(0);
  const [thirteenthMonth, setThirteenthMonth] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SalaryResult | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleCalculate = () => {
    if (simulationType === "gross-to-net") {
      if (!grossSalary || grossSalary <= 0) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir un salaire brut valide",
          variant: "destructive"
        });
        return;
      }

      const result = country === 'benin' 
        ? calculateBeninSalary({
            salaireBrut: grossSalary,
            familyStatus: familyStatus as FamilyStatus,
            children,
            transportBonus,
            housingBonus,
            thirteenthMonth
          })
        : calculateTogoSalary({
            salaireBrut: grossSalary,
            familyStatus: familyStatus as FamilyStatus,
            children,
            transportBonus,
            housingBonus,
            thirteenthMonth
          });
      
      setResults(result);
      setShowResults(true);
    } else {
      if (!netSalary || parseFloat(netSalary) <= 0) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir un salaire net valide",
          variant: "destructive"
        });
        return;
      }

      const brutCalcule = country === 'benin'
        ? calculateBeninNetToBrut(parseFloat(netSalary), familyStatus as FamilyStatus, children, transportBonus, housingBonus)
        : calculateTogoNetToBrut(parseFloat(netSalary), familyStatus as FamilyStatus, children, transportBonus, housingBonus);

      const result = country === 'benin' 
        ? calculateBeninSalary({
            salaireBrut: brutCalcule,
            familyStatus: familyStatus as FamilyStatus,
            children,
            transportBonus,
            housingBonus,
            thirteenthMonth
          })
        : calculateTogoSalary({
            salaireBrut: brutCalcule,
            familyStatus: familyStatus as FamilyStatus,
            children,
            transportBonus,
            housingBonus,
            thirteenthMonth
          });
      
      setResults(result);
      setShowResults(true);
    }
  };

  const handleDownloadPDF = async () => {
    if (!results) {
      toast({
        title: "Erreur",
        description: "Aucun résultat à télécharger",
        variant: "destructive"
      });
      return;
    }

    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      document.body.appendChild(tempContainer);

      const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; background: white; color: #333;">
          <!-- En-tête -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px;">
            <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #16a34a;">Simulation de Salaire</h1>
            <p style="font-size: 18px; color: #666;">PayeAfrique - ${country === 'benin' ? 'Bénin' : 'Togo'}</p>
            <p style="font-size: 14px; color: #666;">Date de simulation : ${formatDate(new Date())}</p>
          </div>

          <!-- Paramètres -->
          <div style="margin-bottom: 30px; background: #f8f8f8; padding: 20px; border-radius: 8px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Paramètres de la simulation</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #666; margin-bottom: 5px;">Type de simulation</p>
                <p style="font-weight: 500;">${simulationType === 'gross-to-net' ? 'Brut → Net' : 'Net → Brut'}</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Pays</p>
                <p style="font-weight: 500;">${country === 'benin' ? 'Bénin' : 'Togo'}</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Situation familiale</p>
                <p style="font-weight: 500;">${familyStatus === 'single' ? 'Célibataire' : 
                                             familyStatus === 'married' ? 'Marié(e)' :
                                             familyStatus === 'divorced' ? 'Divorcé(e)' : 'Veuf/Veuve'}</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Nombre d'enfants</p>
                <p style="font-weight: 500;">${children}</p>
              </div>
            </div>
          </div>

          <!-- Résultats -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Résultats de la simulation</h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>Salaire brut total</span>
                <span style="font-weight: 500;">${formatCurrency(results.totalBrut)}</span>
              </div>
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>Cotisations sociales (${country === 'benin' ? '3.6%' : '9%'})</span>
                <span style="color: #dc2626; font-weight: 500;">-${formatCurrency(results.cnssEmploye)}</span>
              </div>
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>${country === 'benin' ? 'ITS' : 'IRPP'}</span>
                <span style="color: #dc2626; font-weight: 500;">-${formatCurrency(results.impots)}</span>
              </div>
              <div style="padding: 12px; background: #f0fdf4; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Salaire net mensuel</span>
                <span style="font-weight: bold; color: #16a34a;">${formatCurrency(results.salaireNet)}</span>
              </div>
            </div>
          </div>

          <!-- Coût employeur -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Coût total employeur</h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>Salaire brut</span>
                <span style="font-weight: 500;">${formatCurrency(results.totalBrut)}</span>
              </div>
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>Charges patronales (${country === 'benin' ? '21.4%' : '21.5%'})</span>
                <span style="font-weight: 500;">+${formatCurrency(results.chargesPatronales)}</span>
              </div>
              <div style="padding: 12px; background: #f8f8f8; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Coût total employeur</span>
                <span style="font-weight: bold;">${formatCurrency(results.coutTotal)}</span>
              </div>
            </div>
          </div>

          <!-- Avertissement -->
          <div style="background-color: #fff8e6; border: 1px solid #ffd77a; border-radius: 4px; padding: 12px; margin-top: 20px;">
            <p style="color: #664d03; font-size: 11px; line-height: 1.4;">
              <strong>Avertissement :</strong> Cette simulation est donnée à titre indicatif. 
              Les taux et barèmes fiscaux sont basés sur les informations officielles en vigueur ${country === 'benin' ? 'au Bénin' : 'au Togo'}. 
              Pour une analyse précise, consultez un expert-comptable.
            </p>
          </div>
        </div>
      `;

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      pdf.save(`simulation-salaire-${country}-${formatDate(new Date()).replace(/[/:]/g, '-')}.pdf`);

      document.body.removeChild(tempContainer);

      toast({
        title: "Succès",
        description: "Le PDF a été téléchargé avec succès",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération du PDF",
        variant: "destructive"
      });
    }
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
                <h1 className="text-3xl font-bold">Simulateur de Salaire {country === "benin" ? "Bénin" : "Togo"}</h1>
              </div>
              <p className="text-muted-foreground">
                Calculez votre salaire net/brut selon la législation {country === "benin" ? "béninoise" : "togolaise"} en vigueur
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="gross-to-net" className="mb-8" onValueChange={setSimulationType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gross-to-net">
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Brut → Net
              </TabsTrigger>
              <TabsTrigger value="net-to-gross">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Net → Brut
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="gross-to-net">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        <Label htmlFor="gross-salary">Salaire brut mensuel (FCFA)</Label>
                        <Input
                          id="gross-salary"
                          type="number"
                          value={grossSalary === 0 ? '' : grossSalary}
                          onChange={(e) => setGrossSalary(parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-4">Situation personnelle</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="family-status">Situation familiale</Label>
                            <Select value={familyStatus} onValueChange={(value: FamilyStatus) => setFamilyStatus(value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Sélectionner" />
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
                            <Label htmlFor="children">Enfants à charge</Label>
                            <Select value={children} onValueChange={setChildren}>
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
                            <Label htmlFor="transport-allowance" className="text-sm">
                              Prime de transport
                            </Label>
                            <Input
                              id="transport-allowance"
                              type="number"
                              placeholder="0"
                              value={transportBonus === 0 ? '' : transportBonus}
                              onChange={(e) => setTransportBonus(parseFloat(e.target.value) || 0)}
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="housing-allowance" className="text-sm">
                              Indemnité de logement
                            </Label>
                            <Input
                              id="housing-allowance"
                              type="number"
                              placeholder="0"
                              value={housingBonus === 0 ? '' : housingBonus}
                              onChange={(e) => setHousingBonus(parseFloat(e.target.value) || 0)}
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Checkbox 
                                id="thirteenth-month" 
                                checked={thirteenthMonth}
                                onCheckedChange={(checked) => setThirteenthMonth(checked === true)}
                              />
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
                        onClick={handleCalculate}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculer le salaire net
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                  {showResults && results ? (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Résultats de la simulation</CardTitle>
                          <CardDescription>
                            Basé sur la législation {country === "benin" ? "béninoise" : "togolaise"} en vigueur (juin 2025)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Salaire net mensuel</h3>
                                <div className="text-4xl font-bold text-benin-green">{formatCurrency(results.salaireNet)}</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Soit {results.tauxNet.toFixed(1)}% du brut
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                                  <div className="flex justify-between mb-2">
                                    <span className="font-medium">Salaire brut mensuel</span>
                                    <span className="font-medium">{formatCurrency(results.totalBrut)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-red-500">
                                    <span>Cotisations sociales ({country === 'benin' ? '3.6%' : '9%'})</span>
                                    <span>- {formatCurrency(results.cnssEmploye)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-red-500">
                                    <span>${country === 'benin' ? 'ITS' : 'IRPP'}</span>
                                    <span>- {formatCurrency(results.impots)}</span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-medium">
                                    <span>Salaire net mensuel</span>
                                    <span className="text-benin-green">{formatCurrency(results.salaireNet)}</span>
                                  </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                                  <h3 className="font-medium mb-2">Projection annuelle</h3>
                                  <div className="flex justify-between text-sm">
                                    <span>Net annuel (12 mois)</span>
                                    <span>{formatCurrency(results.salaireNet * 12)}</span>
                                  </div>
                                  {thirteenthMonth && (
                                    <div className="flex justify-between text-sm text-green-500">
                                      <span>13ème mois</span>
                                      <span>+ {formatCurrency(results.salaireNet)}</span>
                                    </div>
                                  )}
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-medium">
                                    <span>Total annuel estimé</span>
                                    <span>{formatCurrency(results.salaireNet * (thirteenthMonth ? 13 : 12))}</span>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
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
                            
                            <div className="space-y-6">
                              <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="font-medium">Détail du calcul {country === 'benin' ? 'ITS' : 'IRPP'}</h3>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <div className="flex justify-between">
                                      <span>Revenu imposable</span>
                                      <span>{formatCurrency(results.baseImposable)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Salaire brut - cotisations sociales - frais pro
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <div className="flex justify-between font-medium">
                                      <span>Calcul par tranches:</span>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                      {results.impotsDetails.map((tranche: any, index: number) => (
                                        <div key={index} className="flex justify-between">
                                          <span>Tranche {tranche.taux}% ({tranche.tranche})</span>
                                          <span>{formatCurrency(tranche.impot)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div className="flex justify-between">
                                    <span>Total {country === 'benin' ? 'ITS' : 'IRPP'} mensuel</span>
                                    <span className="font-medium">{formatCurrency(results.impots)}</span>
                                  </div>
                                  
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Taux moyen d'imposition</span>
                                    <span>{results.tauxPrelevement.toFixed(2)}% du salaire brut</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Coût employeur</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium mb-4">Charges patronales</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span>Salaire brut (base)</span>
                                  <span className="font-medium">{formatCurrency(results.totalBrut)}</span>
                                </div>
                                {country === 'benin' ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>CNSS patronal (6.4%)</span>
                                      <span className="font-medium text-red-500">+ {formatCurrency(results.detailsChargesPatronales.cnssPatronal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Prestations familiales (9%)</span>
                                      <span className="font-medium text-red-500">+ {formatCurrency(results.detailsChargesPatronales.prestationsFamiliales)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Versement patronal (4%)</span>
                                      <span className="font-medium text-red-500">+ {formatCurrency(results.detailsChargesPatronales.versementPatronal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Risque professionnel (2%)</span>
                                      <span className="font-medium text-red-500">+ {formatCurrency(results.detailsChargesPatronales.risqueProfessionnel)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex justify-between">
                                    <span>CNSS patronal (21.5%)</span>
                                    <span className="font-medium text-red-500">+ {formatCurrency(results.chargesPatronales)}</span>
                                  </div>
                                )}
                                <Separator className="my-1" />
                                <div className="flex justify-between">
                                  <span className="font-medium">Coût total employeur</span>
                                  <span className="font-bold">{formatCurrency(results.coutTotal)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Ratio net/coût total</span>
                                  <span>{((results.salaireNet / results.coutTotal) * 100).toFixed(2)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
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
                          Ajustez les paramètres selon votre situation personnelle et cliquez sur le bouton "Calculer" pour voir les résultats.
                        </p>
                        <Button 
                          className="bg-benin-green hover:bg-benin-green/90"
                          onClick={handleCalculate}
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
            
            <TabsContent value="net-to-gross">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        <Label htmlFor="net-salary-input">Salaire net souhaité (FCFA)</Label>
                        <Input
                          id="net-salary-input"
                          type="number"
                          value={netSalary}
                          onChange={(e) => setNetSalary(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-4">Situation personnelle</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="family-status-net">Situation familiale</Label>
                            <Select value={familyStatus} onValueChange={(value: FamilyStatus) => setFamilyStatus(value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Sélectionner" />
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
                            <Label htmlFor="children-net">Enfants à charge</Label>
                            <Select value={children} onValueChange={setChildren}>
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
                      
                      <Button 
                        className="w-full bg-benin-green hover:bg-benin-green/90"
                        onClick={handleCalculate}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculer le salaire brut nécessaire
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  {showResults && results ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Résultats de la simulation</CardTitle>
                        <CardDescription>
                          Salaire brut nécessaire pour obtenir le net souhaité
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Salaire brut nécessaire</h3>
                          <div className="text-4xl font-bold text-benin-green">{formatCurrency(results.totalBrut)}</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pour obtenir {formatCurrency(results.salaireNet)} net
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
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
                      </CardContent>
                    </Card>
                  ) : (
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
                          onClick={handleCalculate}
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
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SimulationEmployee;
