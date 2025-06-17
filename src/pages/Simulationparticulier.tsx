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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSimulationStore, Simulation } from "@/stores/simulation.store";

// =======================================================
// Fonctions de calcul spécifiques au Bénin
// =======================================================

const calculateITSBenin = (taxableSalary) => {
  let its = 0;
  if (taxableSalary <= 60000) {
    its = 0;
  } else if (taxableSalary <= 150000) {
    its = (taxableSalary - 60000) * 0.10;
  } else if (taxableSalary <= 250000) {
    its = (90000 * 0.10) + ((taxableSalary - 150000) * 0.15);
  } else if (taxableSalary <= 500000) {
    its = (90000 * 0.10) + (100000 * 0.15) + ((taxableSalary - 250000) * 0.19);
  } else { // > 500 000
    its = (90000 * 0.10) + (100000 * 0.15) + (250000 * 0.19) + ((taxableSalary - 500000) * 0.30);
  }
  return Math.round(its);
};

const calculateNetFromGrossBenin = (grossSalary, transportBonus = 0, housingBonus = 0) => {
  const totalGrossForCalculations = grossSalary + transportBonus + housingBonus;
  const cnss = Math.round(totalGrossForCalculations * 0.036);
  const its = calculateITSBenin(totalGrossForCalculations);
  const totalDeductions = cnss + its;
  const netSalary = totalGrossForCalculations - totalDeductions;

  return {
    salaireBrut: grossSalary,
    salaireBrutTotalCalcul: totalGrossForCalculations,
    salaireNet: netSalary,
    cnss: cnss,
    impot: its,
    transportBonus: transportBonus,
    housingBonus: housingBonus,
    totalDeductions: totalDeductions
  };
};

const calculateGrossFromNetBenin = (targetNet, transportBonus = 0, housingBonus = 0) => {
  let estimatedGross = targetNet / 0.76; // Estimation initiale plus directe (net / ratio_moyen_net_brut)
  let iterations = 0;
  const maxIterations = 500; // Augmenter le nombre max d'itérations
  const tolerance = 0.01; // Réduire la tolérance pour plus de précision (0.01 FCFA)

  // Facteur d'amortissement pour stabiliser la convergence
  const dampingFactor = 0.8; 

  while (iterations < maxIterations) {
    // Calcule le net pour le brut estimé actuel
    const currentCalculation = calculateNetFromGrossBenin(estimatedGross, transportBonus, housingBonus);
    const currentNet = currentCalculation.salaireNet;

    // Calcule la différence
    const difference = targetNet - currentNet;

    // Si la différence est dans la tolérance, on a trouvé notre brut
    if (Math.abs(difference) <= tolerance) {
      // Pour s'assurer que le brut final est un nombre entier si c'est ce que l'on souhaite afficher
      const finalGross = Math.round(estimatedGross);
      const finalResults = calculateNetFromGrossBenin(finalGross, transportBonus, housingBonus);
      return {
        ...finalResults,
        salaireBrut: finalGross, // Assurer que le brut final est celui arrondi
        salaireNet: targetNet // On force le net à la valeur cible pour le rapport
      };
    }

    // Ajustement de l'estimation du brut
    // Utiliser la différence ajustée par un facteur de proportionnalité du taux net moyen
    // et un facteur d'amortissement pour éviter l'oscillation
    const currentNetPercentage = currentNet / (estimatedGross + transportBonus + housingBonus);
    // Empêcher la division par zéro ou par un très petit nombre
    const adjustment = difference / (currentNetPercentage || 0.76) * dampingFactor;
    
    estimatedGross += adjustment;

    // S'assurer que le brut ne devient pas négatif
    if (estimatedGross < 0) estimatedGross = 0;

    iterations++;
  }

  console.warn("La simulation Net -> Brut (Bénin) n'a pas convergé après", maxIterations, "itérations.");
  // Retourne le dernier résultat calculé, même si non parfaitement convergent
  const finalGross = Math.round(estimatedGross);
  const finalResults = calculateNetFromGrossBenin(finalGross, transportBonus, housingBonus);
  return {
    ...finalResults,
    salaireBrut: finalGross,
    salaireNet: finalResults.salaireNet // Le net réel calculé, pas le targetNet exact
  };
};

// =======================================================
// Fonctions de calcul spécifiques au Togo
// =======================================================

const calculateIRPPTogo = (taxableIncome) => {
  let irpp = 0;
  if (taxableIncome <= 25000) {
    irpp = 0;
  } else if (taxableIncome <= 50000) {
    irpp = (taxableIncome - 25000) * 0.05;
  } else if (taxableIncome <= 80000) {
    irpp = (25000 * 0.05) + ((taxableIncome - 50000) * 0.10);
  } else if (taxableIncome <= 120000) {
    irpp = (25000 * 0.05) + (30000 * 0.10) + ((taxableIncome - 80000) * 0.15);
  } else if (taxableIncome <= 200000) {
    irpp = (25000 * 0.05) + (30000 * 0.10) + (40000 * 0.15) + ((taxableIncome - 120000) * 0.20);
  } else if (taxableIncome <= 350000) {
    irpp = (25000 * 0.05) + (30000 * 0.10) + (40000 * 0.15) + (80000 * 0.20) + ((taxableIncome - 200000) * 0.25);
  } else if (taxableIncome <= 500000) {
    irpp = (25000 * 0.05) + (30000 * 0.10) + (40000 * 0.15) + (80000 * 0.20) + (150000 * 0.25) + ((taxableIncome - 350000) * 0.30);
  } else {
    irpp = (25000 * 0.05) + (30000 * 0.10) + (40000 * 0.15) + (80000 * 0.20) + (150000 * 0.25) + (150000 * 0.30) + ((taxableIncome - 500000) * 0.35);
  }
  return Math.round(irpp);
};

const CNSS_PLAFOND_TOGO = 150000;

const calculateNetFromGrossTogo = (grossSalary, transportBonus = 0, housingBonus = 0, familyStatus, children) => {
  const totalGrossForCalculations = grossSalary + transportBonus + housingBonus;
  const cnssBase = Math.min(totalGrossForCalculations, CNSS_PLAFOND_TOGO);
  const cnss = Math.round(cnssBase * 0.03);

  const taxableIRPP = Math.max(0, (totalGrossForCalculations - cnss) * (1 - 0.20));
  const irpp = calculateIRPPTogo(taxableIRPP);

  const totalDeductions = cnss + irpp;
  const netSalary = totalGrossForCalculations - totalDeductions;

  return {
    salaireBrut: grossSalary,
    salaireBrutTotalCalcul: totalGrossForCalculations,
    salaireNet: netSalary,
    cnss: cnss,
    impot: irpp,
    transportBonus: transportBonus,
    housingBonus: housingBonus,
    totalDeductions: totalDeductions,
    taxableIRPP: taxableIRPP
  };
};

const calculateGrossFromNetTogo = (targetNet, transportBonus = 0, housingBonus = 0, familyStatus, children) => {
  let estimatedGross = targetNet / 0.70; // Estimation initiale plus directe (net / ratio_moyen_net_brut)
  let iterations = 0;
  const maxIterations = 500; // Augmenter le nombre max d'itérations
  const tolerance = 0.01; // Réduire la tolérance pour plus de précision
  const dampingFactor = 0.8;

  while (iterations < maxIterations) {
    const currentCalculation = calculateNetFromGrossTogo(estimatedGross, transportBonus, housingBonus, familyStatus, children);
    const currentNet = currentCalculation.salaireNet;

    const difference = targetNet - currentNet;

    if (Math.abs(difference) <= tolerance) {
      const finalGross = Math.round(estimatedGross);
      const finalResults = calculateNetFromGrossTogo(finalGross, transportBonus, housingBonus, familyStatus, children);
      return {
        ...finalResults,
        salaireBrut: finalGross,
        salaireNet: targetNet // On force le net à la valeur cible pour le rapport
      };
    }

    const currentNetPercentage = currentNet / (estimatedGross + transportBonus + housingBonus);
    const adjustment = difference / (currentNetPercentage || 0.70) * dampingFactor;

    estimatedGross += adjustment;

    if (estimatedGross < 0) estimatedGross = 0;

    iterations++;
  }

  console.warn("La simulation Net -> Brut (Togo) n'a pas convergé après", maxIterations, "itérations.");
  const finalGross = Math.round(estimatedGross);
  const finalResults = calculateNetFromGrossTogo(finalGross, transportBonus, housingBonus, familyStatus, children);
  return {
    ...finalResults,
    salaireBrut: finalGross,
    salaireNet: finalResults.salaireNet // Le net réel calculé, pas le targetNet exact
  };
};

// =======================================================
// Composant React
// =======================================================

type FamilyStatus = Simulation['familyStatus'];

const Simulationparticulier = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const addSimulation = useSimulationStore((state) => state.addSimulation);
  const [simulationType, setSimulationType] = useState("gross-to-net");
  const [grossSalary, setGrossSalary] = useState<number>(350000);
  const [netSalary, setNetSalary] = useState<number>(250000);
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>("single");
  const [children, setChildren] = useState("0");
  const [transportBonus, setTransportBonus] = useState<number>(0);
  const [housingBonus, setHousingBonus] = useState<number>(0);
  const [results, setResults] = useState<any>(null);
  const [saveSimulation, setSaveSimulation] = useState(true);

  const handleSaveSimulationChange = (checked: boolean | "indeterminate") => {
    setSaveSimulation(checked === true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(value));
  };

  const handleCalculate = () => {
    let calculationResults = null;

    if (simulationType === "gross-to-net") {
      if (grossSalary <= 0) {
        toast({
          title: "Erreur de saisie",
          description: "Le salaire brut doit être un nombre positif.",
          variant: "destructive"
        });
        setResults(null);
        return;
      }
      if (country === "benin") {
        calculationResults = calculateNetFromGrossBenin(grossSalary, transportBonus, housingBonus);
      } else if (country === "togo") {
        calculationResults = calculateNetFromGrossTogo(grossSalary, transportBonus, housingBonus, familyStatus, parseInt(children));
      }
    } else { // net-to-gross
      if (netSalary <= 0) {
        toast({
          title: "Erreur de saisie",
          description: "Le salaire net souhaité doit être un nombre positif.",
          variant: "destructive"
        });
        setResults(null);
        return;
      }
      if (country === "benin") {
        calculationResults = calculateGrossFromNetBenin(netSalary, transportBonus, housingBonus);
      } else if (country === "togo") {
        calculationResults = calculateGrossFromNetTogo(netSalary, transportBonus, housingBonus, familyStatus, parseInt(children));
      }
    }
    
    setResults(calculationResults);
    
    if (saveSimulation && calculationResults) {
      addSimulation({
        type: simulationType === 'gross-to-net' ? 'Brut → Net' : 'Net → Brut',
        salaireBrut: calculationResults.salaireBrut,
        salaireNet: calculationResults.salaireNet,
        country,
        familyStatus,
        children: parseInt(children),
        saved: true,
        transportBonus: calculationResults.transportBonus,
        housingBonus: calculationResults.housingBonus,
        cnss: calculationResults.cnss,
        impot: calculationResults.impot,
        salaireBrutTotalCalcul: calculationResults.salaireBrutTotalCalcul
      });

      toast({
        title: "Simulation sauvegardée",
        description: "Votre simulation a été ajoutée à votre historique",
        variant: "default"
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      document.body.appendChild(tempContainer);

      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; background: white; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px;">
            <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #16a34a;">Simulation de Salaire</h1>
            <p style="font-size: 18px; color: #666;">PayeAfrique - ${country === 'benin' ? 'Bénin' : 'Togo'}</p>
            <p style="font-size: 14px; color: #666;">Date de simulation : ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>

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
                <p style="font-weight: 500;">${
                  familyStatus === 'single' ? 'Célibataire' : 
                  familyStatus === 'married' ? 'Marié(e)' :
                  familyStatus === 'divorced' ? 'Divorcé(e)' : 'Veuf/Veuve'
                }</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Enfants à charge</p>
                <p style="font-weight: 500;">${children}</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Résultats de la simulation</h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>Salaire brut de base</span>
                <span style="font-weight: 500;">${formatCurrency(results.salaireBrut)}</span>
              </div>
              ${results.transportBonus > 0 ? `
                <div style="padding: 12px; display: flex; justify-content: space-between; color: #16a34a;">
                  <span>Prime de transport</span>
                  <span>+${formatCurrency(results.transportBonus)}</span>
                </div>
              ` : ''}
              ${results.housingBonus > 0 ? `
                <div style="padding: 12px; display: flex; justify-content: space-between; color: #16a34a;">
                  <span>Prime de logement</span>
                  <span>+${formatCurrency(results.housingBonus)}</span>
                </div>
              ` : ''}
              <div style="padding: 12px; display: flex; justify-content: space-between;">
                <span>Brut total imposable</span>
                <span style="font-weight: 500;">${formatCurrency(results.salaireBrutTotalCalcul)}</span>
              </div>
              <div style="padding: 12px; display: flex; justify-content: space-between; color: #dc2626;">
                <span>Cotisations sociales (CNSS)</span>
                <span>-${formatCurrency(results.cnss)}</span>
              </div>
              <div style="padding: 12px; display: flex; justify-content: space-between; color: #dc2626;">
                <span>Impôt sur le revenu (IRPP/ITS)</span>
                <span>-${formatCurrency(results.impot)}</span>
              </div>
              <div style="padding: 12px; background: #f0fdf4; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Salaire net mensuel</span>
                <span style="font-weight: bold; color: #16a34a;">${formatCurrency(results.salaireNet)}</span>
              </div>
            </div>
          </div>

          <div style="background-color: #fff8e6; border: 1px solid #ffd77a; border-radius: 4px; padding: 12px; margin-top: 20px;">
            <p style="color: #664d03; font-size: 11px; line-height: 1.4;">
              <strong>Avertissement :</strong> Cette simulation est donnée à titre indicatif. 
              Consultez un expert-comptable pour une analyse précise.
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

      pdf.save(`simulation-salaire-${new Date().toISOString().split('T')[0]}.pdf`);
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

  const handleSaveSimulation = () => {
    if (!results) return;

    addSimulation({
      type: simulationType === 'gross-to-net' ? 'Brut → Net' : 'Net → Brut',
      salaireBrut: results.salaireBrut,
      salaireNet: results.salaireNet,
      country,
      familyStatus,
      children: parseInt(children),
      saved: true,
      transportBonus: results.transportBonus,
      housingBonus: results.housingBonus,
      cnss: results.cnss,
      impot: results.impot,
      salaireBrutTotalCalcul: results.salaireBrutTotalCalcul
    });

    toast({
      title: "Simulation sauvegardée",
      description: "Votre simulation a été ajoutée à votre historique",
      variant: "default"
    });
  };

  const handleShareSimulation = async () => {
    if (!results) return;

    const shareData = {
      title: 'Simulation de Salaire PayeAfrique',
      text: `Voici ma simulation de salaire sur PayeAfrique :
Type: ${simulationType === 'gross-to-net' ? 'Brut → Net' : 'Net → Brut'}
Pays: ${country === 'benin' ? 'Bénin' : 'Togo'}
Salaire brut: ${formatCurrency(results.salaireBrut)}
Salaire net: ${formatCurrency(results.salaireNet)}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Partage réussi",
          description: "Votre simulation a été partagée",
          variant: "default"
        });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: "Copié !",
          description: "Le texte a été copié dans le presse-papiers",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du partage",
        variant: "destructive"
      });
    }
  };

  const handleFamilyStatusChange = (value: string) => {
    if (value === "single" || value === "married" || value === "divorced" || value === "widowed") {
      setFamilyStatus(value);
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
                          value={netSalary === 0 ? '' : netSalary}
                          onChange={(e) => setNetSalary(parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </TabsContent>

                    <div>
                      <Label>Situation familiale</Label>
                      <Select 
                        value={familyStatus} 
                        onValueChange={handleFamilyStatusChange}
                      >
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
                        onCheckedChange={handleSaveSimulationChange}
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
                          {simulationType === "gross-to-net" ? "Salaire net mensuel" : "Salaire brut mensuel estimé"}
                        </h3>
                        <div className="text-4xl font-bold text-benin-green">
                          {simulationType === "gross-to-net" ? formatCurrency(results.salaireNet) : formatCurrency(results.salaireBrut)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {simulationType === "gross-to-net" ?
                            `Soit ${((results.salaireNet / results.salaireBrutTotalCalcul) * 100).toFixed(1)}% du brut imposable` :
                            `Pour un net souhaité de ${formatCurrency(results.salaireNet)}`}
                        </p>
                      </div>

                      {/* Détail du calcul */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Composition</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Salaire brut de base</span>
                              <span className="font-medium">{formatCurrency(results.salaireBrut)}</span>
                            </div>
                            {results.transportBonus > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Prime de transport</span>
                                <span>+{formatCurrency(results.transportBonus)}</span>
                              </div>
                            )}
                             {results.housingBonus > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Prime de logement</span>
                                <span>+{formatCurrency(results.housingBonus)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                                <span>Brut total imposable</span>
                                <span className="font-medium">{formatCurrency(results.salaireBrutTotalCalcul)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Cotisations sociales (CNSS)</span>
                              <span>-{formatCurrency(results.cnss)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Impôt sur le revenu (IRPP/ITS)</span>
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
                                <span>Total annuel estimé</span>
                                <span>{formatCurrency(results.salaireNet * 13)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={handleDownloadPDF}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={handleSaveSimulation}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={handleShareSimulation}
                        >
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
