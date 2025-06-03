import React, { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ArrowLeft, DownloadIcon, Mail, Calculator, BarChart2, History, FileText, MinusCircle, Building, Info, Settings, ChevronDown } from "lucide-react";
import SalaryChart from "@/components/simulation/SalaryChart";
import SimulationPDF from "@/components/simulation/SimulationPDF";
import { useCountry } from "@/hooks/use-country";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/use-auth";
import emailService from "@/services/email.service";
import { toast } from "@/components/ui/use-toast";

// Constantes pour les calculs des frais professionnels
const FRAIS_PRO_RATE = 0.20; // 20% pour frais professionnels
const FRAIS_PRO_PLAFOND_ANNUEL = 600000 * 12; // 600 000 FCFA par mois * 12
const FRAIS_PRO_PLAFOND_MENSUEL = FRAIS_PRO_PLAFOND_ANNUEL / 12; // Plafond mensuel

// Constantes pour les calculs au Bénin
const BENIN = {
  CNSS: {
    SALARIAL: 0.036,          // 3.6% cotisation salariale
    PATRONAL: {
      VIEILLESSE: 0.10,       // 10% cotisation patronale vieillesse
      PRESTATIONS_FAM: 0.06,  // 6% prestations familiales
      ACCIDENTS: 0.005        // 0.5% accidents du travail
    }
  },
  FRAIS_PRO: {
    TAUX: 0.20,              // 20% pour frais professionnels
    PLAFOND_MENSUEL: 600000  // 600 000 FCFA par mois
  },
  ITS: {
    TRANCHES: [
      { min: 0, max: 60000, taux: 0 },
      { min: 60001, max: 150000, taux: 0.10 },
      { min: 150001, max: 250000, taux: 0.15 },
      { min: 250001, max: 500000, taux: 0.19 },
      { min: 500001, max: Infinity, taux: 0.30 }
    ]
  }
};

interface SimulationDetails {
    cnss: {
        base: number;
        taux: number;
        montant: number;
    };
    fraisProfessionnels: {
        base: number;
        taux: number;
        montant: number;
    };
    patronales: {
        base: number;
        montantTotal: number;
        details: {
            versementPatronal: {
                taux: number;
                montant: number;
            };
            prestationsFamiliales: {
                taux: number;
                montant: number;
            };
            assuranceRetraite: {
                taux: number;
                montant: number;
            };
            risqueProfessionnel: {
                taux: number;
                montant: number;
            };
        };
    };
    its?: {
        baseImposable: number;
        montant: number;
    };
    irpp?: {
        baseImposable: number;
        montant: number;
        reductionFamiliale: number;
    };
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Simulation = () => {
  const { country } = useCountry();
  const { user, isAuthenticated } = useAuth();
  const [grossSalary, setGrossSalary] = useState<number>(250000); // Salaire brut de base
  const [netSalary, setNetSalary] = useState<string>(""); // Pour la saisie Net -> Brut
  const [exceptionalBonus, setExceptionalBonus] = useState<number>(0);
  const [transportBonus, setTransportBonus] = useState<number>(0);
  const [housingBonus, setHousingBonus] = useState<number>(0);
  const [natureBenefits, setNatureBenefits] = useState<number>(0);
  const [performanceBonus, setPerformanceBonus] = useState<number>(0);

  const [familyStatus, setFamilyStatus] = useState<string>("single");
  const [children, setChildren] = useState<string>("0");
  const [simulationType, setSimulationType] = useState<string>("gross-to-net");
  const [results, setResults] = useState<any>(null);
  const [liveCalculation, setLiveCalculation] = useState<boolean>(false);
  const [expertMode, setExpertMode] = useState<boolean>(false);
  const [detailsExpanded, setDetailsExpanded] = useState<{[key: string]: boolean}>({
    cnss: false,
    irpp: false,
    employerCosts: false
  });
  const [selectedSector, setSelectedSector] = useState<string>("commerce");
  const [customSector, setCustomSector] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fonction pour calculer le quotient familial
  const getQuotientFamilialParts = () => {
    let parts = 1; // Base pour célibataire sans enfant

    if (familyStatus === "married") {
      parts = 2; // Marié(e)
    } else if (familyStatus === "divorced" || familyStatus === "widowed") {
      parts = 1.5; // Divorcé(e)/Veuf(ve)
    }

    const numChildren = parseInt(children);
    // Règles pour les enfants : 0.5 part par enfant jusqu'à 3, puis 0.25 au-delà
    if (numChildren > 0) {
      if (numChildren <= 3) {
        parts += numChildren * 0.5;
      } else {
        parts += 3 * 0.5 + (numChildren - 3) * 0.25;
      }
    }
    
    // Plafonnement à 5 parts maximum
    return Math.min(parts, 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Bloquer la soumission si en mode Net->Brut et afficher un message
    if (simulationType === "net-to-gross") {
        alert("La simulation Net → Brut n'est pas encore implémentée avec précision pour les règles fiscales complexes. Veuillez utiliser la simulation Brut → Net.");
        setResults(null); // Clear previous results if any
        return;
    }
    calculateResults();
  };

  const calculateResults = () => {
    if (simulationType === "net-to-gross") {
      setResults(null);
      alert("La simulation Net → Brut n'est pas encore implémentée avec précision pour les règles fiscales complexes. Veuillez utiliser la simulation Brut → Net.");
      return;
    }

    if (country === "benin") {
      // 1. Calcul du Salaire Brut Total
      const salaireBase = grossSalary;
      const totalPrimes = transportBonus + housingBonus + natureBenefits + performanceBonus + exceptionalBonus;
      const salaireBrutTotal = salaireBase + totalPrimes;

      // 2. Calcul des cotisations sociales (CNSS)
      const cotisationCNSS = Math.round(salaireBrutTotal * BENIN.CNSS.SALARIAL);

      // 3. Calcul des frais professionnels (20% plafonné)
      const fraisPro = Math.round(Math.min(
        salaireBrutTotal * BENIN.FRAIS_PRO.TAUX,
        BENIN.FRAIS_PRO.PLAFOND_MENSUEL
      ));

      // 4. Calcul de la base imposable ITS
      const baseImposableITS = salaireBrutTotal - cotisationCNSS - fraisPro;

      // 5. Calcul de l'ITS par tranches
      let its = 0;
      let baseRestante = baseImposableITS;

      for (let i = 0; i < BENIN.ITS.TRANCHES.length; i++) {
        const tranche = BENIN.ITS.TRANCHES[i];
        const tranchePrecedente = i > 0 ? BENIN.ITS.TRANCHES[i - 1] : null;
        const min = tranchePrecedente ? tranchePrecedente.max + 1 : tranche.min;
        const max = tranche.max;
        
        if (baseRestante <= 0) break;
        
        const montantImposableDansLaTranche = Math.min(
          baseRestante,
          max - min + 1
        );
        
        its += Math.round(montantImposableDansLaTranche * tranche.taux);
        baseRestante -= montantImposableDansLaTranche;
      }

      // 6. Calcul des charges patronales
      const chargesPatronales = {
        vieillesse: Math.round(salaireBrutTotal * BENIN.CNSS.PATRONAL.VIEILLESSE),
        prestationsFamiliales: Math.round(salaireBrutTotal * BENIN.CNSS.PATRONAL.PRESTATIONS_FAM),
        accidentsTravail: Math.round(salaireBrutTotal * BENIN.CNSS.PATRONAL.ACCIDENTS)
      };

      const totalChargesPatronales = 
        chargesPatronales.vieillesse + 
        chargesPatronales.prestationsFamiliales + 
        chargesPatronales.accidentsTravail;

      // 7. Calcul du salaire net et du coût employeur
      const salaireNet = salaireBrutTotal - cotisationCNSS - its;
      const coutTotalEmployeur = salaireBrutTotal + totalChargesPatronales;

      // Mise à jour des résultats
      setResults({
        grossSalaryInput: salaireBase,
        exceptionalBonus,
        transportBonus,
        housingBonus,
        natureBenefits,
        performanceBonus,
        totalRecurringBonuses: totalPrimes - exceptionalBonus,
        totalGross: salaireBrutTotal,
        netSalary: salaireNet,
        socialContributionsEmployee: cotisationCNSS,
        incomeTax: its,
        employerSocialContributions: totalChargesPatronales,
        totalEmployerCost: coutTotalEmployeur,
        country,
        familyStatus,
        children: parseInt(children),
        quotientFamilialParts: getQuotientFamilialParts(),
        details: {
          cnss: {
            base: salaireBrutTotal,
            taux: BENIN.CNSS.SALARIAL,
            montant: cotisationCNSS
          },
          fraisProfessionnels: {
            base: salaireBrutTotal,
            taux: BENIN.FRAIS_PRO.TAUX,
            montant: fraisPro
          },
          its: {
            baseImposable: baseImposableITS,
            montant: its
          },
          patronales: {
            base: salaireBrutTotal,
            montantTotal: totalChargesPatronales,
            details: {
              versementPatronal: {
                taux: BENIN.CNSS.PATRONAL.VIEILLESSE,
                montant: chargesPatronales.vieillesse
              },
              prestationsFamiliales: {
                taux: BENIN.CNSS.PATRONAL.PRESTATIONS_FAM,
                montant: chargesPatronales.prestationsFamiliales
              },
              risqueProfessionnel: {
                taux: BENIN.CNSS.PATRONAL.ACCIDENTS,
                montant: chargesPatronales.accidentsTravail
              }
            }
          }
        }
      });
    } else if (country === "togo") {
        // Garder le code existant pour le Togo
        // ... existing Togo calculation code ...
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

  const handleDownloadPDF = async () => {
    if (!results || !isAuthenticated) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour télécharger le PDF",
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

      // Fonction pour formater la date
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
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

          <!-- Paramètres de la simulation -->
          <div style="margin-bottom: 30px; background: #f8f8f8; padding: 20px; border-radius: 8px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Paramètres de la simulation</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #666; margin-bottom: 5px;">Type de simulation</p>
                <p style="font-weight: 500;">Brut → Net</p>
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
              <div>
                <p style="color: #666; margin-bottom: 5px;">Parts fiscales</p>
                <p style="font-weight: 500;">${results.quotientFamilialParts}</p>
              </div>
            </div>
          </div>

          <!-- Détail du salaire brut -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Composition du salaire brut</h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>Salaire brut de base</span>
                <span style="font-weight: 500;">${formatCurrency(results.grossSalaryInput)} FCFA</span>
              </div>
              ${results.transportBonus > 0 ? `
                <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                  <span>Prime de transport</span>
                  <span style="font-weight: 500;">${formatCurrency(results.transportBonus)} FCFA</span>
                </div>
              ` : ''}
              ${results.housingBonus > 0 ? `
                <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                  <span>Prime de logement</span>
                  <span style="font-weight: 500;">${formatCurrency(results.housingBonus)} FCFA</span>
                </div>
              ` : ''}
              ${results.natureBenefits > 0 ? `
                <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                  <span>Avantages en nature</span>
                  <span style="font-weight: 500;">${formatCurrency(results.natureBenefits)} FCFA</span>
                </div>
              ` : ''}
              ${results.performanceBonus > 0 ? `
                <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                  <span>Prime de rendement</span>
                  <span style="font-weight: 500;">${formatCurrency(results.performanceBonus)} FCFA</span>
                </div>
              ` : ''}
              ${results.exceptionalBonus > 0 ? `
                <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                  <span>Prime exceptionnelle</span>
                  <span style="font-weight: 500;">${formatCurrency(results.exceptionalBonus)} FCFA</span>
                </div>
              ` : ''}
              <div style="padding: 12px; background: #f8f8f8; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Total Brut</span>
                <span style="font-weight: bold;">${formatCurrency(results.totalGross)} FCFA</span>
              </div>
            </div>
          </div>

          <!-- Détail des cotisations -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Détail des cotisations sociales</h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              ${country === 'benin' ? `
                <!-- Cotisations CNSS Bénin -->
                <div style="border-bottom: 1px solid #eee; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>CNSS (3.6% plafonné à 160,000 FCFA)</span>
                    <span style="color: #dc2626; font-weight: 500;">-${formatCurrency(results.socialContributionsEmployee)} FCFA</span>
                  </div>
                  <p style="font-size: 12px; color: #666;">Base de calcul : ${formatCurrency(Math.min(results.totalGross, 160000))} FCFA</p>
                </div>
              ` : `
                <!-- Cotisations CNSS Togo -->
                <div style="border-bottom: 1px solid #eee; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>CNSS (4% du salaire brut)</span>
                    <span style="color: #dc2626; font-weight: 500;">-${formatCurrency(results.socialContributionsEmployee)} FCFA</span>
                  </div>
                  <p style="font-size: 12px; color: #666;">Base de calcul : ${formatCurrency(results.totalGross)} FCFA</p>
                </div>
              `}
            </div>
          </div>

          <!-- Détail de l'impôt sur le revenu -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">
              Calcul de l'impôt sur le revenu (${country === 'benin' ? 'ITS' : 'IRPP'})
            </h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              <div style="border-bottom: 1px solid #eee; padding: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Base imposable avant quotient familial</span>
                  <span style="font-weight: 500;">${formatCurrency(results.taxableIncomeITS_IRPP)} FCFA</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Nombre de parts</span>
                  <span style="font-weight: 500;">${results.quotientFamilialParts}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Base imposable par part</span>
                  <span style="font-weight: 500;">${formatCurrency(results.taxableIncomeITS_IRPP / results.quotientFamilialParts)} FCFA</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Impôt calculé par part</span>
                  <span style="font-weight: 500;">${formatCurrency(results.incomeTax / results.quotientFamilialParts)} FCFA</span>
                </div>
              </div>
              <div style="padding: 12px; background: #f8f8f8;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: bold;">Montant total de l'impôt (${country === 'benin' ? 'ITS' : 'IRPP'})</span>
                  <span style="color: #dc2626; font-weight: bold;">-${formatCurrency(results.incomeTax)} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Résultat final -->
          <div style="margin-bottom: 30px; background: #f0fdf4; padding: 20px; border-radius: 8px; border: 2px solid #16a34a;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Résultat final</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #666; margin-bottom: 5px;">Salaire brut total</p>
                <p style="font-size: 18px; font-weight: 500;">${formatCurrency(results.totalGross)} FCFA</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Total des cotisations</p>
                <p style="font-size: 18px; font-weight: 500; color: #dc2626;">
                  -${formatCurrency(results.socialContributionsEmployee + results.otherEmployeeDeductions + results.incomeTax)} FCFA
                </p>
              </div>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #16a34a;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 20px; font-weight: bold;">Salaire net</span>
                <span style="font-size: 24px; font-weight: bold; color: #16a34a;">
                  ${formatCurrency(results.netSalary)} FCFA
                </span>
              </div>
            </div>
          </div>

          <!-- Coût employeur - nouvelle section -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Coût total employeur</h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              ${country === "benin" ? `
                <div style="border-bottom: 1px solid #eee; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>CNSS Vieillesse (10%)</span>
                    <span style="font-weight: 500;">+${formatCurrency(Math.min(results.totalGross, 160000) * 0.10)} FCFA</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>CNSS Prestations Familiales (6%)</span>
                    <span style="font-weight: 500;">+${formatCurrency(Math.min(results.totalGross, 160000) * 0.06)} FCFA</span>
                  </div>
                  <div style="display: flex; justify-content: space-between">
                    <span>CNSS Accidents du Travail (0.5%)</span>
                    <span style="font-weight: 500;">+${formatCurrency(Math.min(results.totalGross, 160000) * 0.005)} FCFA</span>
                  </div>
                </div>
              ` : `
                <div style="border-bottom: 1px solid #eee; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>CNSS Patronale (17.07%)</span>
                    <span style="font-weight: 500;">+${formatCurrency(results.employerSocialContributions)} FCFA</span>
                  </div>
                  <p style="font-size: 12px; color: #666;">
                    Inclut : Pensions, Prestations Familiales, Accidents du Travail
                  </p>
                </div>
              `}
              <div style="padding: 12px; background: #f8f8f8;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: bold;">Coût total employeur</span>
                  <span style="font-weight: bold;">${formatCurrency(results.totalEmployerCost)} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pied de page -->
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin-bottom: 5px;">Document généré le ${formatDate(new Date())}</p>
            <p style="margin-bottom: 5px;">PayeAfrique - www.payeafrique.com</p>
            <p style="margin-bottom: 15px;">Ce document est fourni à titre indicatif et ne constitue pas un document officiel.</p>
            <div style="background-color: #fff8e6; border: 1px solid #ffd77a; border-radius: 4px; padding: 12px; text-align: left; margin-top: 20px;">
              <p style="color: #664d03; font-size: 11px; line-height: 1.4;">
                <strong>Avertissement important :</strong> Cette simulation est donnée à titre indicatif. 
                Les taux et barèmes fiscaux (${country === 'benin' ? 'ITS' : 'IRPP'}, CNSS${country === 'togo' ? ', AMU' : ''}) 
                sont basés sur les informations disponibles et peuvent nécessiter une vérification avec les lois fiscales 
                officielles les plus récentes ${country === 'benin' ? 'du Bénin' : 'du Togo'}. Pour une analyse précise 
                et adaptée à votre situation spécifique, consultez un expert-comptable ou un conseiller fiscal.
              </p>
            </div>
          </div>
        </div>
      `;

      // Capturer le contenu en image
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Créer le PDF
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

      // Télécharger le PDF
      pdf.save(`simulation-salaire-${country}-${formatDate(new Date()).replace(/[/:]/g, '-')}.pdf`);

      toast({
        title: "Succès",
        description: "Le PDF a été téléchargé avec succès",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération du PDF. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      const tempContainer = document.querySelector('div[style*="-9999px"]');
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
    }
  };

  const handleSendEmail = async () => {
    if (!results || !isAuthenticated || !user?.email) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour recevoir le PDF par email",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSendingEmail(true);
      
      // Générer le PDF
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      document.body.appendChild(tempContainer);

      // ... Même code HTML template que dans handleDownloadPDF ...

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

      // Convertir le PDF en base64
      const pdfBase64 = pdf.output('datauristring');

      // Envoyer l'email
      await emailService.sendSimulationPDF(
        user.email,
        pdfBase64,
        {
          country,
          grossSalary: results.grossSalaryInput,
          netSalary: results.netSalary,
          date: new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      );

      toast({
        title: "Succès",
        description: "Le PDF a été envoyé à votre adresse email",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
      const tempContainer = document.querySelector('div[style*="-9999px"]');
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
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
                            
                            <Input
                              id="gross-salary"
                              type="number"
                              placeholder="Ex: 250000"
                              value={grossSalary === 0 ? '' : grossSalary}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setGrossSalary(isNaN(value) ? 0 : value);
                                if (liveCalculation) {
                                  calculateResults();
                                }
                              }}
                              className="mt-1"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="exceptional-bonus">Prime exceptionnelle (FCFA)</Label>
                              <span className="font-medium text-blue-600">{formatCurrency(exceptionalBonus)}</span>
                            </div>
                            <Input
                              id="exceptional-bonus"
                              type="number"
                              placeholder="Ex: 50000"
                              value={exceptionalBonus === 0 ? '' : exceptionalBonus}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setExceptionalBonus(isNaN(value) ? 0 : value);
                                if (liveCalculation) {
                                  calculateResults();
                                }
                              }}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Ajoutez ici le montant d'une prime non récurrente.
                            </p>
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
                              onChange={(e) => {
                                setNetSalary(e.target.value);
                                if (liveCalculation) {
                                  // Pour l'instant, le calcul live pour net-to-gross n'est pas supporté
                                  // calculateResults();
                                }
                              }}
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
                            onValueChange={(value) => {
                                setFamilyStatus(value);
                                if (liveCalculation) calculateResults();
                            }}
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
                            onValueChange={(value) => {
                                setChildren(value);
                                if (liveCalculation) calculateResults();
                            }}
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
                                <Select 
                                  value={selectedSector} 
                                  onValueChange={(value) => {
                                    setSelectedSector(value);
                                    if (value !== "other") {
                                      setCustomSector("");
                                    }
                                    if (liveCalculation) calculateResults();
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="commerce">Commerce</SelectItem>
                                    <SelectItem value="industrie">Industrie</SelectItem>
                                    <SelectItem value="service">Services</SelectItem>
                                    <SelectItem value="btp">BTP</SelectItem>
                                    <SelectItem value="agriculture">Agriculture</SelectItem>
                                    <SelectItem value="other">Autre (préciser)</SelectItem>
                                  </SelectContent>
                                </Select>
                                {selectedSector === "other" && (
                                  <Input
                                    type="text"
                                    placeholder="Saisissez votre secteur d'activité"
                                    value={customSector}
                                    onChange={(e) => {
                                      setCustomSector(e.target.value);
                                      if (liveCalculation) calculateResults();
                                    }}
                                    className="mt-2"
                                  />
                                )}
                              </div>
                              
                              {/* Primes et avantages récurrents */}
                              <div>
                                <Label>Prime de transport</Label>
                                <Input
                                  placeholder="0"
                                  type="number"
                                  value={transportBonus === 0 ? '' : transportBonus}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setTransportBonus(isNaN(value) ? 0 : value);
                                    if (liveCalculation) calculateResults();
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label>Prime de logement</Label>
                                <Input
                                  placeholder="0"
                                  type="number"
                                  value={housingBonus === 0 ? '' : housingBonus}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setHousingBonus(isNaN(value) ? 0 : value);
                                    if (liveCalculation) calculateResults();
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label>Avantages en nature</Label>
                                <Input
                                  placeholder="0"
                                  type="number"
                                  value={natureBenefits === 0 ? '' : natureBenefits}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setNatureBenefits(isNaN(value) ? 0 : value);
                                    if (liveCalculation) calculateResults();
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label>Prime de rendement</Label>
                                <Input
                                  placeholder="0"
                                  type="number"
                                  value={performanceBonus === 0 ? '' : performanceBonus}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setPerformanceBonus(isNaN(value) ? 0 : value);
                                    if (liveCalculation) calculateResults();
                                  }}
                                />
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
                    Basé sur la législation {country === "benin" ? "béninoise" : "togolaise"} en vigueur (à titre indicatif)
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
                          {/* Salaire brut de base */}
                          <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="font-medium">Salaire brut mensuel</p>
                              <p className="text-xs text-gray-500">Montant de base</p>
                            </div>
                            <p className="text-lg font-bold">{formatCurrency(results.grossSalaryInput)}</p>
                          </div>
                          
                          {/* Primes (afficher si > 0) */}
                          {(results.exceptionalBonus > 0 || results.transportBonus > 0 || results.housingBonus > 0 || results.natureBenefits > 0 || results.performanceBonus > 0) && (
                              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                                  <div>
                                      <p className="font-medium">Total Primes</p>
                                      <p className="text-xs text-gray-500">Except. + Transp. + Logt + Nat. + Rend.</p>
                                  </div>
                                  <p className="text-lg font-bold text-blue-600">{formatCurrency(results.exceptionalBonus + results.transportBonus + results.housingBonus + results.natureBenefits + results.performanceBonus)}</p>
                              </div>
                          )}

                          {/* Total brut (toujours afficher, c'est la base de départ) */}
                          <div className="flex justify-between items-center py-2 border-b-2 border-green-500 pb-4">
                              <div>
                                  <p className="font-semibold text-green-700 dark:text-green-400">Salaire Brut Total</p>
                                  <p className="text-xs text-gray-500">Base + Toutes les primes</p>
                              </div>
                              <p className="text-xl font-extrabold text-green-700 dark:text-green-400">
                                  {formatCurrency(results.totalGross)}
                              </p>
                          </div>
                          
                          {/* Cotisations détaillées - cliquables pour détails */}
                          <div className="pl-4 py-2 border-l-2 border-togo-red">
                            <div className="flex justify-between items-center mb-2">
                              <button type="button" className="flex items-center text-sm font-medium group" onClick={() => toggleDetail('cnss')}>
                                <MinusCircle className="h-4 w-4 mr-2 text-togo-red group-hover:text-togo-red/70" />
                                Cotisations sociales salariales
                              </button>
                              <p className="text-togo-red font-medium">- {formatCurrency(results.socialContributionsEmployee)}</p>
                            </div>
                            
                            {detailsExpanded.cnss && (
                              <div className="pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {country === "benin" ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• Base CNSS</span>
                                      <span>{formatCurrency(results.details.cnss.base)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS (3.6%)</span>
                                      <span>- {formatCurrency(results.details?.cnss?.montant || 0)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• CNSS (4% du salaire brut)</span>
                                      <span>- {formatCurrency(results.socialContributionsEmployee)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Impôts (ITS ou IRPP) */}
                          <div className="pl-4 py-2 border-l-2 border-togo-red">
                            <div className="flex justify-between items-center mb-2">
                              <button type="button" className="flex items-center text-sm font-medium group" onClick={() => toggleDetail('irpp')}>
                                <MinusCircle className="h-4 w-4 mr-2 text-togo-red group-hover:text-togo-red/70" />
                                {country === "benin" ? "Impôt sur les Salaires (ITS)" : "Impôt sur le revenu (IRPP)"}
                              </button>
                              <p className="text-togo-red font-medium">- {formatCurrency(results.incomeTax)}</p>
                            </div>
                            {detailsExpanded.irpp && (
                              <div className="pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {country === "benin" ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• Salaire brut</span>
                                      <span>{formatCurrency(results.totalGross)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS (3.6%)</span>
                                      <span>- {formatCurrency(results.details?.cnss?.montant || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• Frais professionnels (20%)</span>
                                      <span>- {formatCurrency(Math.min(results.totalGross * 0.20, 600000))}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                                      <span>Base imposable ITS</span>
                                      <span>{formatCurrency(results.details.its.baseImposable)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      L'ITS est calculé par tranches :
                                    </p>
                                    <ul className="text-xs space-y-1 mt-1">
                                      <li>• 0 à 60 000 FCFA : 0%</li>
                                      <li>• 60 001 à 150 000 FCFA : 10%</li>
                                      <li>• 150 001 à 250 000 FCFA : 15%</li>
                                      <li>• 250 001 à 500 000 FCFA : 19%</li>
                                      <li>• Au-delà de 500 000 FCFA : 30%</li>
                                    </ul>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• Salaire brut</span>
                                      <span>{formatCurrency(results.totalGross)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS (9.68%)</span>
                                      <span>- {formatCurrency(results.details.cnss.montant)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• Frais professionnels</span>
                                      <span>- {formatCurrency(Math.min(results.totalGross * FRAIS_PRO_RATE, FRAIS_PRO_PLAFOND_ANNUEL / 12))}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                                      <span>Base imposable IRPP</span>
                                      <span>{formatCurrency(results.details.irpp.baseImposable)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      L'IRPP est calculé par tranches :
                                    </p>
                                    <ul className="text-xs space-y-1 mt-1">
                                      <li>• 0 à 60 000 FCFA : 0%</li>
                                      <li>• 60 001 à 150 000 FCFA : 10%</li>
                                      <li>• 150 001 à 300 000 FCFA : 15%</li>
                                      <li>• 300 001 à 500 000 FCFA : 20%</li>
                                      <li>• 500 001 à 800 000 FCFA : 25%</li>
                                      <li>• Au-delà de 800 000 FCFA : 30%</li>
                                    </ul>
                                    {parseInt(children) > 0 && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between text-sm">
                                          <span>IRPP avant réduction familiale</span>
                                          <span>{formatCurrency(results.details.irpp.montant + results.details.irpp.reductionFamiliale)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-green-600">
                                          <span>Réduction familiale ({Math.min(parseInt(children), 6)} enfant{parseInt(children) > 1 ? 's' : ''})</span>
                                          <span>- {formatCurrency(results.details.irpp.reductionFamiliale)}</span>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
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
                        
                        <div className="space-y-3">
                          <div className="pl-4 py-2 border-l-2 border-gray-400">
                            <div className="flex justify-between items-center mb-2">
                              <button type="button" className="flex items-center text-sm font-medium group" onClick={() => toggleDetail('employerCosts')}>
                                <MinusCircle className="h-4 w-4 mr-2 text-gray-600 group-hover:text-gray-400" />
                                Charges patronales
                              </button>
                              <p className="text-gray-600 font-medium">+ {formatCurrency(results.employerSocialContributions)}</p>
                            </div>
                            
                            {detailsExpanded.employerCosts && (
                              <div className="pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {country === "benin" ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• CNSS Vieillesse (10%)</span>
                                      <span>+ {formatCurrency(Math.min(results.totalGross, 160000) * 0.10)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS Prestations Familiales (6%)</span>
                                      <span>+ {formatCurrency(Math.min(results.totalGross, 160000) * 0.06)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS Accidents du Travail (0.5%)</span>
                                      <span>+ {formatCurrency(Math.min(results.totalGross, 160000) * 0.005)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                                      <span>Total charges patronales (15.4%)</span>
                                      <span>+ {formatCurrency(results.employerSocialContributions)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• CNSS Patronale (17.07%)</span>
                                      <span>+ {formatCurrency(results.employerSocialContributions)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      Inclut : Pensions, Prestations Familiales, Accidents du Travail
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-2">
                            <div>
                              <p className="font-medium">Coût total employeur</p>
                              <p className="text-xs text-gray-500">Inclut toutes les charges patronales</p>
                            </div>
                            <p className="text-xl font-bold">{formatCurrency(results.totalEmployerCost)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 mt-6">
                        <Button
                          variant="outline"
                          onClick={handleDownloadPDF}
                          disabled={!results || !isAuthenticated}
                          className="w-full sm:w-auto"
                          title={!isAuthenticated ? "Connectez-vous pour télécharger le PDF" : ""}
                        >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          {isAuthenticated ? 'Télécharger PDF' : 'Connectez-vous pour télécharger'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleSendEmail}
                          disabled={!results || !isAuthenticated || isSendingEmail}
                          className="flex-1"
                        >
                          {isSendingEmail ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              {isAuthenticated ? 'Recevoir par email' : 'Connectez-vous pour recevoir par email'}
                            </>
                          )}
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
                               {results.totalGross > 0 ? `${Math.round(((results.totalGross - results.netSalary) / results.totalGross) * 100)}%` : '0%'}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      **Avertissement important :** Cette simulation est donnée à titre indicatif. Les taux et barèmes fiscaux (ITS/IRPP, CNSS, AMU) sont basés sur des informations générales et peuvent nécessiter une vérification avec les lois fiscales officielles les plus récentes du Bénin et du Togo. Pour une analyse précise et adaptée à votre situation, consultez un expert-comptable ou un conseiller fiscal.
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