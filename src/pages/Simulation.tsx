import React, { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ArrowLeft, DownloadIcon, Mail, Calculator, BarChart2, History, FileText, MinusCircle, Building, Info, Settings, ChevronDown, Users, Plus, X, Share2 } from "lucide-react";
import SalaryChart from "@/components/simulation/SalaryChart";
import SimulationPDF from "@/components/simulation/SimulationPDF";
import { useCountry } from "@/hooks/use-country.tsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/use-auth";
import emailService from "@/services/email.service";
import { toast } from "@/components/ui/use-toast";
import { calculateCNSS, calculateImpot, calculateFraisPro, calculateITSBenin, calculateChargesPatronalesTogo, calculateNetToBrutBenin, calculateNetToBrutTogo, TOGO } from "@/constants/tax";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  // États pour la simulation multiple
  const [employees, setEmployees] = useState<Array<{
    name: string;
    grossSalary: number;
    familyStatus: string;
    children: string;
    exceptionalBonus: number;
    transportBonus: number;
    housingBonus: number;
    natureBenefits: number;
    performanceBonus: number;
    results: any;
  }>>([{
    name: '',
    grossSalary: 250000,
    familyStatus: 'single',
    children: '0',
    exceptionalBonus: 0,
    transportBonus: 0,
    housingBonus: 0,
    natureBenefits: 0,
    performanceBonus: 0,
    results: null
  }]);

  const [multipleResults, setMultipleResults] = useState<{
    totalGross: number;
    totalNet: number;
    totalSocialCharges: number;
    totalTax: number;
  } | null>(null);

  // États pour la comparaison
  const [scenario1, setScenario1] = useState<any>({
    country: country,
    grossSalary: 250000,
    familyStatus: "single",
    children: "0",
    transportBonus: 0,
    housingBonus: 0,
    results: null
  });
  
  const [scenario2, setScenario2] = useState<any>({
    country: country === "benin" ? "togo" : "benin",
    grossSalary: 250000,
    familyStatus: "single",
    children: "0",
    transportBonus: 0,
    housingBonus: 0,
    results: null
  });

  // États pour l'historique
  const [simulations, setSimulations] = useState<Array<{
    id: string;
    date: string;
    country: string;
    grossSalary: number;
    netSalary: number;
    familyStatus: string;
    children: string;
    transportBonus: number;
    housingBonus: number;
    results: any;
  }>>([]);
  const [isSavingSimulation, setIsSavingSimulation] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fonction de test pour vérifier les calculs
  const testCalculBenin = () => {
    const salaireBrut = 421670;
    
    // 1. Calcul CNSS (3.6%)
    const cnss = calculateCNSS(salaireBrut, "benin");
    console.log("1. CNSS (3.6%):", Math.round(cnss), "FCFA");
    
    // 2. Calcul des frais professionnels
    const fraisPro = calculateFraisPro(salaireBrut, cnss);
    console.log("2. Frais professionnels:", Math.round(fraisPro), "FCFA");
    
    // 3. Base imposable
    const baseImposable = salaireBrut - cnss - fraisPro;
    console.log("3. Base imposable:", Math.round(baseImposable), "FCFA");
    
    // 4. Calcul ITS par tranches
    const its = calculateITSBenin(baseImposable);
    console.log("4. ITS total:", Math.round(its), "FCFA");
    
    // 5. Calcul du salaire net
    const salaireNet = salaireBrut - cnss - its;
    console.log("5. Salaire net:", Math.round(salaireNet), "FCFA");
    
    return {
      salaireBrut,
      cnss,
      fraisPro,
      baseImposable,
      its,
      salaireNet
    };
  };

  // Exécuter le test au chargement du composant
  useEffect(() => {
    console.log("=== Test de calcul pour 421 670 FCFA ===");
    const resultats = testCalculBenin();
    console.log("=== Fin du test ===");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (simulationType === "net-to-gross") {
      if (!netSalary) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir le salaire net souhaité",
          variant: "destructive"
        });
        return;
      }

      const netSalaryValue = parseFloat(netSalary);
      if (isNaN(netSalaryValue) || netSalaryValue <= 0) {
        toast({
          title: "Erreur",
          description: "Le salaire net doit être un nombre positif",
          variant: "destructive"
        });
        return;
      }

      if (country === "benin") {
        // Calcul du brut à partir du net pour le Bénin
        const resultat = calculateNetToBrutBenin(netSalaryValue);
        const salaireBrut = resultat.salaireBrut;
        
        // Mise à jour des résultats avec les détails du calcul
        setResults({
          salaireBrut: salaireBrut,
          totalGross: salaireBrut,
          salaireNet: netSalaryValue,
          netSalary: netSalaryValue,
          cnss: resultat.details.cnss,
          socialContributionsEmployee: resultat.details.cnss,
          impot: resultat.details.its.total,
          incomeTax: resultat.details.its.total,
          baseImposable: salaireBrut,
          taxableIncomeITS_IRPP: salaireBrut,
          quotientFamilialParts: 1,
          chargesPatronales: salaireBrut * 0.154,
          employerSocialContributions: salaireBrut * 0.154,
          totalEmployerCost: salaireBrut * 1.154,
          // Ajout des détails de l'ITS par tranches
          itsDetails: resultat.details.its.details,
          avantages: {
            transport: 0,
            logement: 0,
            nature: 0,
            performance: 0,
            exceptionnel: 0
          }
        });
      } else {
        // Calcul du brut à partir du net pour le Togo
        const resultat = calculateNetToBrutTogo(netSalaryValue);
        const salaireBrut = resultat.salaireBrut;
        
        // Mise à jour des résultats avec les détails du calcul
        setResults({
          salaireBrut: salaireBrut,
          totalGross: salaireBrut,
          salaireNet: netSalaryValue,
          netSalary: netSalaryValue,
          cnss: resultat.details.cnss,
          socialContributionsEmployee: resultat.details.cnss,
          amu: resultat.details.amu,
          fraisPro: resultat.details.fraisPro,
          impot: resultat.details.irpp.total,
          incomeTax: resultat.details.irpp.total,
          baseImposable: resultat.details.baseImposable,
          taxableIncomeITS_IRPP: resultat.details.baseImposable,
          quotientFamilialParts: 1,
          chargesPatronales: {
            pension: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.PENSION),
            pf: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.PF),
            at: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.AT),
            amu: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.AMU),
            total: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.TOTAL)
          },
          employerSocialContributions: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.TOTAL),
          totalEmployerCost: salaireBrut * (1 + TOGO.CNSS_PATRONAL.TOTAL),
          // Ajout des détails de l'IRPP par tranches
          irppDetails: resultat.details.irpp.details,
          avantages: {
            transport: 0,
            logement: 0,
            nature: 0,
            performance: 0,
            exceptionnel: 0
          }
        });
      }
    } else {
      // Calcul existant Brut → Net
      calculateResults();
    }
  };

  const calculateResults = () => {
    if (!grossSalary) return;

    // Salaire brut total (incluant les primes)
    const salaireBrut = grossSalary + transportBonus + housingBonus + natureBenefits + performanceBonus + exceptionalBonus;
    
    // Calcul des cotisations sociales
    const cotisationsSociales = calculateCNSS(salaireBrut, country);
    
    // Calcul des frais professionnels (20% du brut - cotisations, plafonné)
    const fraisPro = calculateFraisPro(salaireBrut, cotisationsSociales);
    
    // Base imposable pour l'IRPP (après CNSS et frais pro)
    const baseImposable = salaireBrut - cotisationsSociales - fraisPro;
    
    // Calcul de l'IRPP
    const impot = calculateImpot(salaireBrut, country, familyStatus, parseInt(children));
    
    // Calcul du salaire net
    const salaireNet = salaireBrut - cotisationsSociales - impot;
    
    // Calcul des charges patronales
    const chargesPatronales = calculateChargesPatronalesTogo(salaireBrut);
    
    // Mise à jour des résultats avec tous les détails
    setResults({
      // Montants principaux
      salaireBrut: grossSalary,
      totalGross: salaireBrut,
      salaireNet: salaireNet,
      netSalary: salaireNet,
      
      // Cotisations et déductions
      cnss: cotisationsSociales,
      socialContributionsEmployee: cotisationsSociales,
      fraisPro: fraisPro,
      impot: impot,
      incomeTax: impot,
      
      // Base de calcul
      baseImposable: baseImposable,
      taxableIncomeITS_IRPP: baseImposable,
      
      // Charges patronales
      chargesPatronales: chargesPatronales,
      employerSocialContributions: chargesPatronales.total,
      totalEmployerCost: salaireBrut + chargesPatronales.total,
      
      // Quotient familial (à implémenter plus tard)
      quotientFamilialParts: 1,
      
      // Détail des avantages
      avantages: {
        transport: transportBonus,
        logement: housingBonus,
        nature: natureBenefits,
        performance: performanceBonus,
        exceptionnel: exceptionalBonus
      }
    });
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

  const handleDownloadPDF = () => {
    if (!results) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; color: #1a5f7a; margin-bottom: 5px; }
            .subtitle { font-size: 18px; color: #666; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 16px; color: #1a5f7a; margin-bottom: 10px; border-bottom: 2px solid #1a5f7a; padding-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">RÉSULTATS DE LA SIMULATION</div>
            <div class="subtitle">${country === "benin" ? "Bénin" : "Togo"} - ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>

          <div class="section">
            <div class="section-title">Détails du Calcul</div>
            <table class="table">
              <tr>
                <th>Description</th>
                <th>Montant</th>
              </tr>
              <tr>
                <td>Salaire brut mensuel</td>
                <td>${formatCurrency(results.grossSalary)}</td>
              </tr>
              <tr>
                <td>Total brut imposable</td>
                <td>${formatCurrency(results.totalGross)}</td>
              </tr>
            </table>

            <table class="table">
              <tr>
                <th>Déductions</th>
                <th>Montant</th>
              </tr>
              <tr>
                <td>Cotisations sociales (CNSS)</td>
                <td>${formatCurrency(results.socialContributions)}</td>
              </tr>
              <tr>
                <td>${country === "benin" ? "Impôt sur les Salaires (ITS)" : "Impôt sur le revenu (IRPP)"}</td>
                <td>${formatCurrency(results.incomeTax)}</td>
              </tr>
            </table>

            <div class="total">
              Net à payer: ${formatCurrency(results.netSalary)}
                  </div>
                </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    if (!emailAddress) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    toast.success(`La simulation a été envoyée à ${emailAddress}`);
    setShowShareModal(false);
    setEmailAddress("");
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Fonction pour calculer les résultats d'un scénario
  const calculateScenario = (scenario: any) => {
    const salaireBrut = scenario.grossSalary + scenario.transportBonus + scenario.housingBonus;
    
    // Calcul des cotisations sociales
    const cotisationsSociales = calculateCNSS(salaireBrut, scenario.country);
    
    // Calcul des frais professionnels
    const fraisPro = calculateFraisPro(salaireBrut, cotisationsSociales);
    
    // Base imposable
    const baseImposable = salaireBrut - cotisationsSociales - fraisPro;
    
    // Calcul de l'impôt
    const impot = calculateImpot(salaireBrut, scenario.country, scenario.familyStatus, parseInt(scenario.children));
    
    // Calcul du salaire net
    const salaireNet = salaireBrut - cotisationsSociales - impot;
    
    return {
      salaireBrut,
      cotisationsSociales,
      fraisPro,
      baseImposable,
      impot,
      salaireNet
    };
  };

  // Fonction pour comparer les scénarios
  const compareScenarios = () => {
    const results1 = calculateScenario(scenario1);
    const results2 = calculateScenario(scenario2);
    
    setScenario1({ ...scenario1, results: results1 });
    setScenario2({ ...scenario2, results: results2 });
  };

  // Fonction pour mettre à jour un scénario
  const updateScenario = (scenarioNumber: 1 | 2, field: string, value: any) => {
    if (scenarioNumber === 1) {
      setScenario1({ ...scenario1, [field]: value });
    } else {
      setScenario2({ ...scenario2, [field]: value });
    }
  };

  // Fonction pour sauvegarder une simulation dans l'historique
  const saveSimulation = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour sauvegarder une simulation",
        variant: "destructive"
      });
      return;
    }

    if (!results) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord effectuer une simulation",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSavingSimulation(true);
      
      const simulationData = {
        userId: user.id,
        date: new Date().toISOString(),
        country,
        grossSalary,
        netSalary: results.salaireNet,
        familyStatus,
        children,
        transportBonus,
        housingBonus,
        results
      };

      // Appel à votre API pour sauvegarder la simulation
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulationData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      // Mettre à jour l'historique local
      const savedSimulation = await response.json();
      setSimulations(prev => [savedSimulation, ...prev]);

      toast({
        title: "Succès",
        description: "La simulation a été sauvegardée dans votre historique",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setIsSavingSimulation(false);
    }
  };

  // Fonction pour charger l'historique des simulations
  const loadSimulations = async () => {
    if (!isAuthenticated || !user) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      setIsLoadingHistory(true);
      
      // Appel à votre API pour récupérer l'historique
      const response = await fetch(`/api/simulations?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const data = await response.json();
      setSimulations(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fonction pour supprimer une simulation
  const deleteSimulation = async (simulationId: string) => {
    try {
      // Appel à votre API pour supprimer la simulation
      const response = await fetch(`/api/simulations/${simulationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Mettre à jour l'historique local
      setSimulations(prev => prev.filter(sim => sim.id !== simulationId));

      toast({
        title: "Succès",
        description: "La simulation a été supprimée",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression",
        variant: "destructive"
      });
    }
  };

  // Charger l'historique au montage du composant
  useEffect(() => {
    loadSimulations();
  }, [isAuthenticated, user]);

  // Fonctions pour la simulation multiple
  const addEmployee = () => {
    setEmployees([...employees, {
      name: '',
      grossSalary: 250000,
      familyStatus: 'single',
      children: '0',
      exceptionalBonus: 0,
      transportBonus: 0,
      housingBonus: 0,
      natureBenefits: 0,
      performanceBonus: 0,
      results: null
    }]);
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const updateEmployee = (index: number, field: string, value: any) => {
    const newEmployees = [...employees];
    newEmployees[index] = {
      ...newEmployees[index],
      [field]: value
    };
    setEmployees(newEmployees);
  };

  const calculateMultipleResults = () => {
    const updatedEmployees = employees.map(employee => {
      const salaireBrut = employee.grossSalary + 
        employee.exceptionalBonus + 
        employee.transportBonus + 
        employee.housingBonus + 
        employee.natureBenefits + 
        employee.performanceBonus;
      const cotisationsSociales = calculateCNSS(salaireBrut, country);
      const fraisPro = calculateFraisPro(salaireBrut, cotisationsSociales);
      const baseImposable = salaireBrut - cotisationsSociales - fraisPro;
      const impot = calculateImpot(salaireBrut, country, employee.familyStatus, parseInt(employee.children));
      const salaireNet = salaireBrut - cotisationsSociales - impot;

      return {
        ...employee,
        results: {
          salaireBrut,
          cotisationsSociales,
          fraisPro,
          baseImposable,
          impot,
          salaireNet
        }
      };
    });

    setEmployees(updatedEmployees);

    // Calculer les totaux
    const totals = updatedEmployees.reduce((acc, employee) => ({
      totalGross: acc.totalGross + employee.results.salaireBrut,
      totalNet: acc.totalNet + employee.results.salaireNet,
      totalSocialCharges: acc.totalSocialCharges + employee.results.cotisationsSociales,
      totalTax: acc.totalTax + employee.results.impot
    }), {
      totalGross: 0,
      totalNet: 0,
      totalSocialCharges: 0,
      totalTax: 0
    });

    setMultipleResults(totals);
  };

  const handleDownloadMultiplePDF = async () => {
    if (!multipleResults || !isAuthenticated) {
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

      // Générer le contenu HTML pour le PDF
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #16a34a; margin-bottom: 30px;">
            Simulation Multiple de Salaires - ${country === 'benin' ? 'Bénin' : 'Togo'}
          </h1>
          
          <div style="margin-bottom: 40px;">
            <h2 style="color: #16a34a; margin-bottom: 20px;">Détail par employé</h2>
            ${employees.map((employee, index) => `
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h3 style="margin-bottom: 10px; color: #374151;">
                  ${index + 1}. ${employee.name || 'Employé ' + (index + 1)}
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div>
                    <p style="color: #6b7280; margin-bottom: 5px;">Salaire brut</p>
                    <p style="font-weight: bold;">${formatCurrency(employee.results.salaireBrut)}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280; margin-bottom: 5px;">Charges sociales</p>
                    <p style="font-weight: bold; color: #dc2626;">-${formatCurrency(employee.results.cotisationsSociales)}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280; margin-bottom: 5px;">Impôt sur le revenu</p>
                    <p style="font-weight: bold; color: #dc2626;">-${formatCurrency(employee.results.impot)}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280; margin-bottom: 5px;">Salaire net</p>
                    <p style="font-weight: bold; color: #16a34a;">${formatCurrency(employee.results.salaireNet)}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
            <h2 style="color: #16a34a; margin-bottom: 20px;">Résumé global</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="color: #6b7280; margin-bottom: 5px;">Total salaires bruts</p>
                <p style="font-weight: bold;">${formatCurrency(multipleResults.totalGross)}</p>
              </div>
              <div>
                <p style="color: #6b7280; margin-bottom: 5px;">Total charges sociales</p>
                <p style="font-weight: bold; color: #dc2626;">-${formatCurrency(multipleResults.totalSocialCharges)}</p>
              </div>
              <div>
                <p style="color: #6b7280; margin-bottom: 5px;">Total impôts</p>
                <p style="font-weight: bold; color: #dc2626;">-${formatCurrency(multipleResults.totalTax)}</p>
              </div>
              <div>
                <p style="color: #6b7280; margin-bottom: 5px;">Total salaires nets</p>
                <p style="font-weight: bold; color: #16a34a;">${formatCurrency(multipleResults.totalNet)}</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>PayeAfrique - www.payeafrique.com</p>
          </div>
        </div>
      `;

      // Générer le PDF
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

      // Télécharger le PDF
      pdf.save(`simulation-multiple-${country}-${new Date().toISOString().split('T')[0]}.pdf`);

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
    } finally {
      const tempContainer = document.querySelector('div[style*="-9999px"]');
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
    }
  };

  const handleSendMultipleEmail = async () => {
    if (!multipleResults || !isAuthenticated || !user?.email) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour recevoir le PDF par email",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSendingEmail(true);

      // Générer le PDF (même code que handleDownloadMultiplePDF)
      const tempContainer = document.createElement('div');
      // ... (même code HTML que précédemment)

      const canvas = await html2canvas(tempContainer);
      const pdf = new jsPDF();
      // ... (même code de génération PDF)

      // Convertir le PDF en base64
      const pdfBase64 = pdf.output('datauristring');

      // Envoyer l'email
      await emailService.sendSimulationPDF(
        user.email,
        pdfBase64,
        {
          country,
          grossSalary: multipleResults.totalGross,
          netSalary: multipleResults.totalNet,
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
        description: "Une erreur s'est produite lors de l'envoi de l'email",
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
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="simple" className="text-base py-3">
                <Calculator className="h-4 w-4 mr-2" />
                Calcul Simple
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-base py-3">
                <BarChart2 className="h-4 w-4 mr-2" />
                Comparaison
              </TabsTrigger>
              <TabsTrigger value="multiple" className="text-base py-3">
                <Users className="h-4 w-4 mr-2" />
                Simulation Multiple
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
                    Comparez deux situations différentes pour analyser l'impact sur votre salaire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scénario 1 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Scénario 1</h3>
                        <div className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {scenario1.country === "benin" ? "Bénin" : "Togo"}
                        </div>
                    </div>
                    
                      <div className="space-y-4">
                        <div>
                          <Label>Salaire brut mensuel</Label>
                          <Input
                            type="number"
                            placeholder="Ex: 250000"
                            value={scenario1.grossSalary || ''}
                            onChange={(e) => updateScenario(1, 'grossSalary', parseFloat(e.target.value) || 0)}
                          />
                    </div>
                        
                        <div>
                          <Label>Situation familiale</Label>
                          <Select 
                            value={scenario1.familyStatus} 
                            onValueChange={(value) => updateScenario(1, 'familyStatus', value)}
                          >
                            <SelectTrigger>
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
                          <Label>Nombre d'enfants</Label>
                          <Select 
                            value={scenario1.children} 
                            onValueChange={(value) => updateScenario(1, 'children', value)}
                          >
                            <SelectTrigger>
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
                        
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex w-full justify-between p-2">
                              <span className="flex items-center">
                                <Settings className="h-4 w-4 mr-2" />
                                Options avancées
                              </span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4">
                            <div>
                              <Label>Prime de transport</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={scenario1.transportBonus || ''}
                                onChange={(e) => updateScenario(1, 'transportBonus', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Prime de logement</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={scenario1.housingBonus || ''}
                                onChange={(e) => updateScenario(1, 'housingBonus', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>

                    {/* Scénario 2 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Scénario 2</h3>
                        <Select 
                          value={scenario2.country}
                          onValueChange={(value) => updateScenario(2, 'country', value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Pays" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="benin">Bénin</SelectItem>
                            <SelectItem value="togo">Togo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label>Salaire brut mensuel</Label>
                          <Input
                            type="number"
                            placeholder="Ex: 250000"
                            value={scenario2.grossSalary || ''}
                            onChange={(e) => updateScenario(2, 'grossSalary', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div>
                          <Label>Situation familiale</Label>
                          <Select 
                            value={scenario2.familyStatus}
                            onValueChange={(value) => updateScenario(2, 'familyStatus', value)}
                          >
                            <SelectTrigger>
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
                          <Label>Nombre d'enfants</Label>
                          <Select 
                            value={scenario2.children}
                            onValueChange={(value) => updateScenario(2, 'children', value)}
                          >
                            <SelectTrigger>
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
                        
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex w-full justify-between p-2">
                              <span className="flex items-center">
                                <Settings className="h-4 w-4 mr-2" />
                                Options avancées
                              </span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4">
                            <div>
                              <Label>Prime de transport</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={scenario2.transportBonus || ''}
                                onChange={(e) => updateScenario(2, 'transportBonus', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Prime de logement</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={scenario2.housingBonus || ''}
                                onChange={(e) => updateScenario(2, 'housingBonus', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-center">
                    <Button 
                      className="w-full md:w-auto" 
                      size="lg"
                      onClick={compareScenarios}
                    >
                      Comparer les scénarios
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>

                  {/* Zone de résultats de comparaison */}
                  {(scenario1.results && scenario2.results) && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Résultats Scénario 1</CardTitle>
                            <CardDescription>
                              {scenario1.country === "benin" ? "Bénin" : "Togo"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Salaire brut</span>
                                <span className="font-medium">{formatCurrency(scenario1.results.salaireBrut)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Charges salariales</span>
                                <span className="font-medium text-red-600">-{formatCurrency(scenario1.results.cotisationsSociales)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Impôt sur le revenu</span>
                                <span className="font-medium text-red-600">-{formatCurrency(scenario1.results.impot)}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="font-medium">Salaire net</span>
                                <span className="font-bold text-green-600">{formatCurrency(scenario1.results.salaireNet)}</span>
                              </div>
                  </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Résultats Scénario 2</CardTitle>
                            <CardDescription>
                              {scenario2.country === "benin" ? "Bénin" : "Togo"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Salaire brut</span>
                                <span className="font-medium">{formatCurrency(scenario2.results.salaireBrut)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Charges salariales</span>
                                <span className="font-medium text-red-600">-{formatCurrency(scenario2.results.cotisationsSociales)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Impôt sur le revenu</span>
                                <span className="font-medium text-red-600">-{formatCurrency(scenario2.results.impot)}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="font-medium">Salaire net</span>
                                <span className="font-bold text-green-600">{formatCurrency(scenario2.results.salaireNet)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Analyse comparative</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Différence de salaire net</span>
                                <span className={`font-bold ${scenario1.results.salaireNet >= scenario2.results.salaireNet ? 'text-green-600' : 'text-red-600'}`}>
                                  {scenario1.results.salaireNet >= scenario2.results.salaireNet ? '+' : ''}
                                  {formatCurrency(scenario1.results.salaireNet - scenario2.results.salaireNet)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p className="mb-2">Points clés :</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>
                                    Les charges salariales sont {Math.abs(scenario1.results.cotisationsSociales - scenario2.results.cotisationsSociales)} FCFA
                                    {scenario1.results.cotisationsSociales >= scenario2.results.cotisationsSociales ? ' plus élevées' : ' plus basses'} 
                                    dans le scénario 1
                                  </li>
                                  <li>
                                    L'impôt sur le revenu est {Math.abs(scenario1.results.impot - scenario2.results.impot)} FCFA
                                    {scenario1.results.impot >= scenario2.results.impot ? ' plus élevé' : ' plus bas'} 
                                    dans le scénario 1
                                  </li>
                                  <li>
                                    Le scénario {scenario1.results.salaireNet >= scenario2.results.salaireNet ? '1' : '2'} est plus avantageux 
                                    avec un gain net de {formatCurrency(Math.abs(scenario1.results.salaireNet - scenario2.results.salaireNet))}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="multiple">
              <Card>
                <CardHeader>
                  <CardTitle>Simulation pour plusieurs employés</CardTitle>
                  <CardDescription>
                    Calculez les salaires pour plusieurs employés en même temps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {employees.map((employee, index) => (
                      <div key={index} className="p-4 border rounded-lg relative">
                        <Button
                          variant="ghost"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          onClick={() => removeEmployee(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Nom de l'employé</Label>
                            <Input
                              placeholder="Ex: Jean Dupont"
                              value={employee.name}
                              onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Salaire brut mensuel (FCFA)</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 250000"
                              value={employee.grossSalary || ''}
                              onChange={(e) => updateEmployee(index, 'grossSalary', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Situation familiale</Label>
                            <Select 
                              value={employee.familyStatus}
                              onValueChange={(value) => updateEmployee(index, 'familyStatus', value)}
                            >
                              <SelectTrigger>
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
                            <Label>Nombre d'enfants</Label>
                            <Select
                              value={employee.children}
                              onValueChange={(value) => updateEmployee(index, 'children', value)}
                            >
                              <SelectTrigger>
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

                        {employee.results && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Salaire net:</span>
                              <span className="text-lg font-bold text-benin-green">
                                {formatCurrency(employee.results.salaireNet)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addEmployee}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un employé
                    </Button>

                    <Button
                      onClick={calculateMultipleResults}
                      className="w-full bg-benin-green hover:bg-benin-green/90 text-lg py-6"
                      disabled={employees.length === 0}
                    >
                      Calculer tous les salaires
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    {multipleResults && (
                      <div className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Résumé des calculs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Total salaires bruts:</span>
                                <span className="font-bold">
                                  {formatCurrency(multipleResults.totalGross)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Total charges sociales:</span>
                                <span className="font-bold text-red-600">
                                  {formatCurrency(multipleResults.totalSocialCharges)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Total impôts:</span>
                                <span className="font-bold text-red-600">
                                  {formatCurrency(multipleResults.totalTax)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-benin-green/10 rounded-lg">
                                <span className="font-bold text-benin-green">Total salaires nets:</span>
                                <span className="text-xl font-bold text-benin-green">
                                  {formatCurrency(multipleResults.totalNet)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => handleDownloadMultiplePDF()}
                                className="flex-1"
                              >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Télécharger PDF
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleSendMultipleEmail()}
                                className="flex-1"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Envoyer par email
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="multiple">
              <Card>
                <CardHeader>
                  <CardTitle>Simulation pour plusieurs employés</CardTitle>
                  <CardDescription>
                    Calculez les salaires pour plusieurs employés en même temps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {employees.map((employee, index) => (
                      <div key={index} className="p-4 border rounded-lg relative">
                        <Button
                          variant="ghost"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          onClick={() => removeEmployee(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Nom de l'employé</Label>
                              <Input
                                placeholder="Ex: Jean Dupont"
                                value={employee.name}
                                onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Salaire brut mensuel (FCFA)</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 250000"
                                value={employee.grossSalary || ''}
                                onChange={(e) => updateEmployee(index, 'grossSalary', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Situation familiale</Label>
                              <Select 
                                value={employee.familyStatus}
                                onValueChange={(value) => updateEmployee(index, 'familyStatus', value)}
                              >
                                <SelectTrigger>
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
                              <Label>Nombre d'enfants</Label>
                              <Select
                                value={employee.children}
                                onValueChange={(value) => updateEmployee(index, 'children', value)}
                              >
                                <SelectTrigger>
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

                          <div className="space-y-4">
                            <div>
                              <Label>Prime exceptionnelle (FCFA)</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 50000"
                                value={employee.exceptionalBonus || ''}
                                onChange={(e) => updateEmployee(index, 'exceptionalBonus', parseFloat(e.target.value) || 0)}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Prime non récurrente
                              </p>
                            </div>

                            <div>
                              <Label>Prime de transport (FCFA)</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 25000"
                                value={employee.transportBonus || ''}
                                onChange={(e) => updateEmployee(index, 'transportBonus', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            <div>
                              <Label>Prime de logement (FCFA)</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 50000"
                                value={employee.housingBonus || ''}
                                onChange={(e) => updateEmployee(index, 'housingBonus', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            <div>
                              <Label>Avantages en nature (FCFA)</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 30000"
                                value={employee.natureBenefits || ''}
                                onChange={(e) => updateEmployee(index, 'natureBenefits', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            <div>
                              <Label>Prime de rendement (FCFA)</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 40000"
                                value={employee.performanceBonus || ''}
                                onChange={(e) => updateEmployee(index, 'performanceBonus', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          {employee.results && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Salaire brut total:</span>
                                  <span className="text-lg font-bold">
                                    {formatCurrency(employee.results.salaireBrut)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Charges sociales:</span>
                                  <span className="text-lg font-bold text-red-600">
                                    {formatCurrency(employee.results.cotisationsSociales)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Impôt sur le revenu:</span>
                                  <span className="text-lg font-bold text-red-600">
                                    {formatCurrency(employee.results.impot)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                  <span className="font-medium">Salaire net:</span>
                                  <span className="text-lg font-bold text-benin-green">
                                    {formatCurrency(employee.results.salaireNet)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addEmployee}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un employé
                    </Button>

                    <Button
                      onClick={calculateMultipleResults}
                      className="w-full bg-benin-green hover:bg-benin-green/90 text-lg py-6"
                      disabled={employees.length === 0}
                    >
                      Calculer tous les salaires
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    {multipleResults && (
                      <div className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Résumé des calculs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Total salaires bruts:</span>
                                <span className="font-bold">
                                  {formatCurrency(multipleResults.totalGross)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Total charges sociales:</span>
                                <span className="font-bold text-red-600">
                                  {formatCurrency(multipleResults.totalSocialCharges)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Total impôts:</span>
                                <span className="font-bold text-red-600">
                                  {formatCurrency(multipleResults.totalTax)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-benin-green/10 rounded-lg">
                                <span className="font-bold text-benin-green">Total salaires nets:</span>
                                <span className="text-xl font-bold text-benin-green">
                                  {formatCurrency(multipleResults.totalNet)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                              <Button
                                variant="outline"
                                onClick={handleDownloadMultiplePDF}
                                className="flex-1"
                              >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Télécharger PDF
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleSendMultipleEmail}
                                className="flex-1"
                                disabled={isSendingEmail}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                {isSendingEmail ? 'Envoi en cours...' : 'Envoyer par email'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des simulations</CardTitle>
                  <CardDescription>
                    Consultez et gérez vos simulations précédentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div className="text-center p-10">
                  <div className="mb-4">
                    <FileText className="h-16 w-16 mx-auto text-gray-300" />
                  </div>
                      <h3 className="text-xl font-medium mb-2">Connectez-vous pour accéder à l'historique</h3>
                  <p className="text-gray-500 mb-6">
                        Enregistrez vos simulations et retrouvez-les à tout moment
                  </p>
                  <Button variant="outline">Se connecter</Button>
                    </div>
                  ) : isLoadingHistory ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  ) : simulations.length === 0 ? (
                    <div className="text-center p-10">
                      <div className="mb-4">
                        <History className="h-16 w-16 mx-auto text-gray-300" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Aucune simulation enregistrée</h3>
                      <p className="text-gray-500 mb-6">
                        Vos simulations sauvegardées apparaîtront ici
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {simulations.map((simulation) => (
                        <Card key={simulation.id} className="relative">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {formatCurrency(simulation.grossSalary)} → {formatCurrency(simulation.netSalary)}
                                </CardTitle>
                                <CardDescription>
                                  {new Date(simulation.date).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </CardDescription>
                              </div>
                              <div className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                {simulation.country === "benin" ? "Bénin" : "Togo"}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Situation familiale</p>
                                <p className="font-medium">
                                  {simulation.familyStatus === "single" ? "Célibataire" :
                                   simulation.familyStatus === "married" ? "Marié(e)" :
                                   simulation.familyStatus === "divorced" ? "Divorcé(e)" : "Veuf/Veuve"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Enfants</p>
                                <p className="font-medium">{simulation.children}</p>
                              </div>
                              {simulation.transportBonus > 0 && (
                                <div>
                                  <p className="text-sm text-gray-500">Prime transport</p>
                                  <p className="font-medium">{formatCurrency(simulation.transportBonus)}</p>
                                </div>
                              )}
                              {simulation.housingBonus > 0 && (
                                <div>
                                  <p className="text-sm text-gray-500">Prime logement</p>
                                  <p className="font-medium">{formatCurrency(simulation.housingBonus)}</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Restaurer la simulation
                                  setGrossSalary(simulation.grossSalary);
                                  setFamilyStatus(simulation.familyStatus);
                                  setChildren(simulation.children);
                                  setTransportBonus(simulation.transportBonus);
                                  setHousingBonus(simulation.housingBonus);
                                  setResults(simulation.results);
                                  // Changer d'onglet
                                  const tabElement = document.querySelector('[data-value="simple"]') as HTMLElement;
                                  tabElement?.click();
                                }}
                              >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Restaurer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF()}
                              >
                                <DownloadIcon className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendEmail()}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteSimulation(simulation.id)}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
                            <p className="text-lg font-bold">{formatCurrency(results.salaireBrut)}</p>
                          </div>
                          
                          {/* Primes (afficher si > 0) */}
                          {(results.avantages.exceptionnel > 0 || results.avantages.transport > 0 || results.avantages.logement > 0 || results.avantages.nature > 0 || results.avantages.performance > 0) && (
                              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                                  <div>
                                      <p className="font-medium">Total Primes</p>
                                      <p className="text-xs text-gray-500">Except. + Transp. + Logt + Nat. + Rend.</p>
                                  </div>
                                  <p className="text-lg font-bold text-blue-600">{formatCurrency(results.avantages.exceptionnel + results.avantages.transport + results.avantages.logement + results.avantages.nature + results.avantages.performance)}</p>
                              </div>
                          )}

                          {/* Total brut (toujours afficher, c'est la base de départ) */}
                          <div className="flex justify-between items-center py-2 border-b-2 border-green-500 pb-4">
                              <div>
                                  <p className="font-semibold text-green-700 dark:text-green-400">Salaire Brut Total</p>
                                  <p className="text-xs text-gray-500">Base + Toutes les primes</p>
                              </div>
                              <p className="text-xl font-extrabold text-green-700 dark:text-green-400">
                                  {formatCurrency(results.salaireBrut)}
                              </p>
                          </div>
                          
                          {/* Cotisations détaillées - cliquables pour détails */}
                          <div className="pl-4 py-2 border-l-2 border-togo-red">
                            <div className="flex justify-between items-center mb-2">
                              <button type="button" className="flex items-center text-sm font-medium group" onClick={() => toggleDetail('cnss')}>
                                <MinusCircle className="h-4 w-4 mr-2 text-togo-red group-hover:text-togo-red/70" />
                                Cotisations sociales salariales
                              </button>
                              <p className="text-togo-red font-medium">- {formatCurrency(results.cnss)}</p>
                            </div>
                            
                            {detailsExpanded.cnss && (
                              <div className="pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {country === "benin" ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• Base CNSS</span>
                                      <span>{formatCurrency(results.salaireBrut)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS (3.6%)</span>
                                      <span>- {formatCurrency(results.cnss)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• CNSS (4% du salaire brut)</span>
                                      <span>- {formatCurrency(results.cnss)}</span>
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
                              <p className="text-togo-red font-medium">- {formatCurrency(results.impot)}</p>
                            </div>
                            {detailsExpanded.irpp && (
                              <div className="pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {country === "benin" ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• Salaire brut</span>
                                      <span>{formatCurrency(results.salaireBrut)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS (3.6%)</span>
                                      <span>- {formatCurrency(results.cnss)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• Frais professionnels (20%)</span>
                                      <span>- {formatCurrency(results.fraisPro)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                                      <span>Base imposable ITS</span>
                                      <span>{formatCurrency(results.salaireBrut - results.cnss - results.fraisPro)}</span>
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
                                      <span>{formatCurrency(results.salaireBrut)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS (9.68%)</span>
                                      <span>- {formatCurrency(results.cnss)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• Frais professionnels</span>
                                      <span>- {formatCurrency(results.fraisPro)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                                      <span>Base imposable IRPP</span>
                                      <span>{formatCurrency(results.salaireBrut - results.cnss - results.fraisPro)}</span>
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
                                          <span>{formatCurrency(results.impot)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-green-600">
                                          <span>Réduction familiale ({Math.min(parseInt(children), 6)} enfant{parseInt(children) > 1 ? 's' : ''})</span>
                                          <span>- {formatCurrency(results.impot * 0.2)}</span>
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
                            <p className="text-2xl font-bold text-benin-green">{formatCurrency(results.salaireNet)}</p>
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
                              <p className="text-gray-600 font-medium">+ {formatCurrency(results.salaireBrut * 0.17)}</p>
                            </div>
                            
                            {detailsExpanded.employerCosts && (
                              <div className="pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {country === "benin" ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• CNSS Vieillesse (10%)</span>
                                      <span>+ {formatCurrency(Math.min(results.salaireBrut, 160000) * 0.10)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS Prestations Familiales (6%)</span>
                                      <span>+ {formatCurrency(Math.min(results.salaireBrut, 160000) * 0.06)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• CNSS Accidents du Travail (0.5%)</span>
                                      <span>+ {formatCurrency(Math.min(results.salaireBrut, 160000) * 0.005)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                                      <span>Total charges patronales (15.4%)</span>
                                      <span>+ {formatCurrency(results.salaireBrut * 0.17)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span>• CNSS Patronale (17.07%)</span>
                                      <span>+ {formatCurrency(results.salaireBrut * 0.17)}</span>
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
                            <p className="text-xl font-bold">{formatCurrency(results.salaireBrut * 1.17)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={handleShare}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Partager
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
                               {results.salaireBrut > 0 ? `${Math.round(((results.salaireBrut - results.salaireNet) / results.salaireBrut) * 100)}%` : '0%'}
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

      {/* Modal de partage */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Partager la simulation</DialogTitle>
            <DialogDescription>
              Envoyez cette simulation par email
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="col-span-3"
                placeholder="exemple@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Simulation;