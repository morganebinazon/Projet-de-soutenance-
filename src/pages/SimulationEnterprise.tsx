import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, Download, Plus, Trash2, Users, Building, PieChart, BarChart2, HelpCircle, Filter, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCountry } from "@/hooks/use-country.tsx";
import { Eye } from "lucide-react";
import { SalaryDistributionChart, DepartmentChart, MonthlyEvolutionChart, BudgetProjectionChart } from "@/components/simulation/EnterpriseCharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Loader2 } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  grossSalary: number;
  benefits: {
    transport?: number;
    housing?: number;
    performance?: number;
  };
}

interface MonthlyData {
  month: number;
  projectedSalary: number;
  employeeCount: number;
}

const SimulationEnterprise = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    department: "",
    position: "",
    salary: 0,
    status: "active"
  });
  const [filters, setFilters] = useState({
    department: "all",
    minSalary: 0,
    maxSalary: 2000000
  });
  const [showAdvancedSimulationModal, setShowAdvancedSimulationModal] = useState(false);
  const [advancedSimulationParams, setAdvancedSimulationParams] = useState({
    period: "12",
    growthRate: "5",
    inflationRate: "2",
    includeBenefits: true
  });
  
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "Marie Koné",
      position: "Responsable Ventes",
      department: "Commercial",
      grossSalary: 650000,
      benefits: {
        transport: 25000,
        performance: 50000,
      }
    },
    {
      id: "2",
      name: "Paul Agossou",
      position: "Développeur Frontend",
      department: "Technique",
      grossSalary: 450000,
      benefits: {
        transport: 20000,
      }
    },
    {
      id: "3",
      name: "Sophie Mensah",
      position: "Assistante RH",
      department: "Ressources Humaines",
      grossSalary: 380000,
      benefits: {
        transport: 15000,
      }
    },
    {
      id: "4",
      name: "Jean Koffi",
      position: "Directeur Technique",
      department: "Technique",
      grossSalary: 950000,
      benefits: {
        transport: 30000,
        housing: 150000,
        performance: 150000,
      }
    }
  ]);

  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filters.department === "all" || employee.department === filters.department;
    const matchesSalary = employee.grossSalary >= filters.minSalary && employee.grossSalary <= filters.maxSalary;
    
    return matchesSearch && matchesDepartment && matchesSalary;
  });

  // Calculate total payroll stats
  const calculateStats = () => {
    const totalGrossSalary = employees.reduce((sum, emp) => sum + emp.grossSalary, 0);
    
    const totalBenefits = employees.reduce((sum, emp) => {
      return sum + 
        (emp.benefits.transport || 0) + 
        (emp.benefits.housing || 0) + 
        (emp.benefits.performance || 0);
    }, 0);
    
    const socialContributions = totalGrossSalary * 0.154; // 15.4% employer contributions
    const netSalaries = employees.reduce((sum, emp) => {
      const employeeSocialContribution = emp.grossSalary * 0.036; // 3.6% employee contribution
      const taxableIncome = emp.grossSalary - employeeSocialContribution;
      
      // Simplified tax calculation
      let incomeTax = 0;
      if (taxableIncome <= 50000) {
        incomeTax = 0;
      } else if (taxableIncome <= 130000) {
        incomeTax = (taxableIncome - 50000) * 0.1;
      } else if (taxableIncome <= 280000) {
        incomeTax = 8000 + (taxableIncome - 130000) * 0.15;
      } else if (taxableIncome <= 530000) {
        incomeTax = 30500 + (taxableIncome - 280000) * 0.2;
      } else {
        incomeTax = 80500 + (taxableIncome - 530000) * 0.35;
      }
      
      const netSalary = emp.grossSalary - employeeSocialContribution - incomeTax;
      return sum + netSalary;
    }, 0);
    
    const totalCost = totalGrossSalary + totalBenefits + socialContributions;
    
    return {
      totalGrossSalary,
      totalBenefits,
      socialContributions,
      netSalaries,
      totalCost,
      employeeCount: employees.length
    };
  };

  const stats = calculateStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleAddEmployee = () => {
    const employee: Employee = {
      id: (employees.length + 1).toString(),
      name: newEmployee.name,
      department: newEmployee.department,
      position: newEmployee.position,
      grossSalary: newEmployee.salary,
      benefits: {}
    };
    
    setEmployees(prev => [...prev, employee]);
    setShowAddEmployeeModal(false);
    setNewEmployee({
      name: "",
      department: "",
      position: "",
      salary: 0,
      status: "active"
    });
  };

  // Add useEffect for loading simulation
  useEffect(() => {
    const loadSimulation = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading simulation:", error);
        setIsLoading(false);
      }
    };

    loadSimulation();
  }, []);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Rapport de Simulation Entreprise", 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add general stats
    doc.setFontSize(16);
    doc.text("Statistiques Générales", 20, 45);
    doc.setFontSize(12);
    doc.text(`Nombre total d'employés: ${employees.length}`, 20, 55);
    doc.text(`Masse salariale totale: ${formatCurrency(stats.totalGrossSalary)}`, 20, 65);
    doc.text(`Salaire moyen: ${formatCurrency(stats.totalGrossSalary / stats.employeeCount)}`, 20, 75);
    
    // Add department distribution
    doc.setFontSize(16);
    doc.text("Répartition par Département", 20, 95);
    doc.setFontSize(12);
    
    let yPos = 105;
    const departmentCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(departmentCounts).forEach(([dept, count]) => {
      doc.text(`${dept}: ${count} employés`, 20, yPos);
      yPos += 10;
    });
    
    // Add employee list
    doc.setFontSize(16);
    doc.text("Liste des Employés", 20, yPos + 10);
    doc.setFontSize(12);
    
    const employeeData = employees.map(emp => [
      emp.name,
      emp.department,
      emp.position,
      formatCurrency(emp.grossSalary)
    ]);
    
    doc.autoTable({
      startY: yPos + 20,
      head: [['Nom', 'Département', 'Poste', 'Salaire']],
      body: employeeData
    });
    
    // Add monthly projections if available
    if (monthlyData.length > 0) {
      const lastY = (doc as any).lastAutoTable.finalY || yPos + 20;
      doc.setFontSize(16);
      doc.text("Projections Salariales", 20, lastY + 20);
      doc.setFontSize(12);
      
      const projectionData = monthlyData.map(data => [
        `Mois ${data.month}`,
        formatCurrency(data.projectedSalary),
        data.employeeCount.toString()
      ]);
      
      doc.autoTable({
        startY: lastY + 30,
        head: [['Période', 'Salaire Projeté', 'Nombre d\'employés']],
        body: projectionData
      });
    }
    
    // Save the PDF
    doc.save('rapport-simulation-entreprise.pdf');
    toast.success("Rapport généré avec succès");
  };

  const handleAdvancedSimulation = () => {
    // Calculer les projections
    const months = parseInt(advancedSimulationParams.period);
    const growthRate = parseFloat(advancedSimulationParams.growthRate) / 100;
    const inflationRate = parseFloat(advancedSimulationParams.inflationRate) / 100;

    const projections = Array.from({ length: months }, (_, i) => {
      const month = i + 1;
      const salaryGrowth = Math.pow(1 + growthRate, month);
      const inflationAdjustment = Math.pow(1 + inflationRate, month);
      
      const projectedSalary = employees.reduce((sum, emp) => {
        const baseSalary = emp.grossSalary;
        const adjustedSalary = baseSalary * salaryGrowth * inflationAdjustment;
        return sum + adjustedSalary;
      }, 0);

      return {
        month,
        projectedSalary,
        employeeCount: employees.length
      };
    });

    // Mettre à jour les données pour les graphiques
    setMonthlyData(projections);
    setShowAdvancedSimulationModal(false);
    toast.success("Simulation avancée lancée avec succès");
  };

  // Calculer les données pour les graphiques
  const calculateChartData = () => {
    // Données pour le graphique de répartition de la masse salariale
    const salaryDistributionData = [
      { name: "Salaires bruts", value: stats.totalGrossSalary },
      { name: "Cotisations sociales", value: stats.socialContributions },
      { name: "Charges patronales", value: stats.totalGrossSalary * 0.225 },
      { name: "Primes et avantages", value: stats.totalBenefits }
    ];

    // Données pour le graphique par département
    const departmentData = employees.reduce((acc, emp) => {
      const dept = acc.find(d => d.name === emp.department);
      if (dept) {
        dept.salary += emp.grossSalary;
        dept.employees += 1;
      } else {
        acc.push({
          name: emp.department,
          salary: emp.grossSalary,
          employees: 1
        });
      }
      return acc;
    }, [] as { name: string; salary: number; employees: number }[]);

    // Données pour l'évolution mensuelle
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleString('fr-FR', { month: 'short' });
      const monthEmployees = employees.filter(emp => {
        // Simuler une croissance mensuelle
        const growthFactor = 1 + (i * 0.02); // 2% de croissance par mois
        return emp.grossSalary * growthFactor;
      });
      
      return {
        month,
        salary: monthEmployees.reduce((sum, emp) => sum + emp.grossSalary, 0),
        employees: monthEmployees.length
      };
    });

    return {
      salaryDistributionData,
      departmentData,
      monthlyData
    };
  };

  const chartData = calculateChartData();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-benin-green" />
            <p className="text-lg font-medium">Chargement de la simulation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
              <h1 className="text-3xl font-bold">Simulateur Entreprise</h1>
            </div>
            <p className="text-muted-foreground">
              Gérez votre masse salariale et planifiez vos budgets RH
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
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <PieChart className="h-4 w-4 mr-2" />
              Vue globale
            </TabsTrigger>
            <TabsTrigger value="employees">
              <Users className="h-4 w-4 mr-2" />
              Employés
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building className="h-4 w-4 mr-2" />
              Départements
            </TabsTrigger>
            <TabsTrigger value="projections">
              <BarChart2 className="h-4 w-4 mr-2" />
              Projections
            </TabsTrigger>
          </TabsList>
          
          {/* Vue globale */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Masse salariale</CardTitle>
                  <CardDescription>Salaires bruts mensuels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-benin-green">{formatCurrency(stats.totalGrossSalary)}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>Moyenne par employé: {formatCurrency(stats.totalGrossSalary / stats.employeeCount)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Effectif total</CardTitle>
                  <CardDescription>Employés actifs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.employeeCount}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="success" className="text-xs">+2 ce mois</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Charges sociales</CardTitle>
                  <CardDescription>Cotisations employeur</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-togo-red">{formatCurrency(stats.socialContributions)}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>{Math.round((stats.socialContributions / stats.totalGrossSalary) * 100)}% de la masse salariale</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Coût total</CardTitle>
                  <CardDescription>Incluant charges et avantages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(stats.totalCost)}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>Ratio net/coût: {Math.round((stats.netSalaries / stats.totalCost) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Répartition de la masse salariale</CardTitle>
                  <CardDescription>
                    Aperçu des composantes du coût salarial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-72">
                      <SalaryDistributionChart data={chartData.salaryDistributionData} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Analyse des coûts</h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Salaires bruts</span>
                            <span className="font-medium">{formatCurrency(stats.totalGrossSalary)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${(stats.totalGrossSalary / stats.totalCost) * 100}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Charges sociales patronales</span>
                            <span className="font-medium">{formatCurrency(stats.socialContributions)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${(stats.socialContributions / stats.totalCost) * 100}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Avantages et primes</span>
                            <span className="font-medium">{formatCurrency(stats.totalBenefits)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${(stats.totalBenefits / stats.totalCost) * 100}%` }}></div>
                          </div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="flex items-center justify-between font-medium">
                          <span>Coût total employeur</span>
                          <span>{formatCurrency(stats.totalCost)}</span>
                        </div>
                      </div>
                      
                      <Card className="bg-gray-50 dark:bg-gray-800 border-amber-200 dark:border-amber-900">
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <HelpCircle className="h-5 w-5 mr-3 text-amber-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-sm mb-1">Optimisations possibles</h4>
                              <p className="text-xs text-muted-foreground">
                                Réduisez votre coût employeur de jusqu'à 8% grâce à des optimisations fiscales et sociales légales.
                              </p>
                              <Button variant="link" className="text-xs p-0 h-auto mt-1">Découvrir comment →</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par département</CardTitle>
                  <CardDescription>
                    Masse salariale par service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <DepartmentChart data={chartData.departmentData} />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>Technique</span>
                      </div>
                      <span className="font-medium">{formatCurrency(1400000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Commercial</span>
                      </div>
                      <span className="font-medium">{formatCurrency(650000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                        <span>Ressources Humaines</span>
                      </div>
                      <span className="font-medium">{formatCurrency(380000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Évolution mensuelle</CardTitle>
                  <CardDescription>
                    Tendance sur les 6 derniers mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <MonthlyEvolutionChart data={chartData.monthlyData} />
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Décembre</span>
                      <span>Janvier</span>
                      <span>Février</span>
                      <span>Mars</span>
                      <span>Avril</span>
                      <span>Mai</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 h-1 bg-benin-green rounded-full"></div>
                      <div className="flex-1 h-1 bg-benin-green rounded-full"></div>
                      <div className="flex-1 h-1 bg-benin-green rounded-full"></div>
                      <div className="flex-1 h-1 bg-benin-green rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger rapport
              </Button>
              <Button onClick={() => setShowAdvancedSimulationModal(true)}>
                <Calculator className="mr-2 h-4 w-4" />
                Lancer simulation avancée
              </Button>
            </div>
          </TabsContent>
          
          {/* Gestion des employés */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion des employés</h2>
              <Button 
                size="sm"
                onClick={() => setShowAddEmployeeModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un employé
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Liste des employés</CardTitle>
                    <CardDescription>
                      Masse salariale totale: {formatCurrency(stats.totalGrossSalary)}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="pl-8 h-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filtres
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {showFilters && (
                <div className="px-6 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Département</Label>
                      <Select 
                        value={filters.department} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les départements" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les départements</SelectItem>
                          <SelectItem value="Technique">Technique</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Ressources Humaines">Ressources Humaines</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Salaire minimum</Label>
                      <Input 
                        type="number"
                        value={filters.minSalary}
                        onChange={(e) => setFilters(prev => ({ ...prev, minSalary: Number(e.target.value) }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Salaire maximum</Label>
                      <Input 
                        type="number"
                        value={filters.maxSalary}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxSalary: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead className="text-right">Salaire brut</TableHead>
                      <TableHead className="text-right">Avantages</TableHead>
                      <TableHead className="text-right">Coût total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map(employee => {
                      const totalBenefits = 
                        (employee.benefits.transport || 0) +
                        (employee.benefits.housing || 0) +
                        (employee.benefits.performance || 0);
                      
                      const employerCost = employee.grossSalary + totalBenefits;
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            {employee.name}
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell className="text-right">{formatCurrency(employee.grossSalary)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalBenefits)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(employerCost)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Calculator className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Employé sélectionné</CardTitle>
                <CardDescription>
                  Détail et simulation individuelle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sélectionnez un employé</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    Cliquez sur un employé dans la liste pour voir ses détails et effectuer des simulations individuelles
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Départements */}
          <TabsContent value="departments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analyse par département</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau département
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Technique</span>
                    <Badge variant="outline">2 employés</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Masse salariale</span>
                      <span className="font-medium">{formatCurrency(1400000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Coût moyen / employé</span>
                      <span className="font-medium">{formatCurrency(700000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">% de la masse salariale totale</span>
                      <span className="font-medium">58%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Simuler évolution
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Commercial</span>
                    <Badge variant="outline">1 employé</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Masse salariale</span>
                      <span className="font-medium">{formatCurrency(650000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Coût moyen / employé</span>
                      <span className="font-medium">{formatCurrency(650000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">% de la masse salariale totale</span>
                      <span className="font-medium">26.5%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Simuler évolution
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Ressources Humaines</span>
                    <Badge variant="outline">1 employé</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Masse salariale</span>
                      <span className="font-medium">{formatCurrency(380000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Coût moyen / employé</span>
                      <span className="font-medium">{formatCurrency(380000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">% de la masse salariale totale</span>
                      <span className="font-medium">15.5%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Simuler évolution
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Analyse comparative des départements</CardTitle>
                <CardDescription>
                  Indicateurs clés par département
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <DepartmentChart data={chartData.departmentData} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Salaire moyen</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Technique</span>
                        <span className="font-medium">{formatCurrency(700000)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Commercial</span>
                        <span className="font-medium">{formatCurrency(650000)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>RH</span>
                        <span className="font-medium">{formatCurrency(380000)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Évolution annuelle</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Technique</span>
                        <Badge variant="success">+5.5%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Commercial</span>
                        <Badge variant="success">+4.2%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>RH</span>
                        <Badge variant="success">+3.8%</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Impact budgétaire</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Technique</span>
                        <span className="font-medium text-amber-500">Élevé</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Commercial</span>
                        <span className="font-medium text-amber-500">Moyen</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>RH</span>
                        <span className="font-medium text-green-500">Faible</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Projections */}
          <TabsContent value="projections" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Projections budgétaires</h2>
              <div className="flex items-center space-x-2">
                <Select defaultValue="2025">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Calculator className="mr-2 h-4 w-4" />
                  Nouvelle simulation
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de simulation</CardTitle>
                <CardDescription>
                  Définissez les hypothèses pour votre projection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-4">Hypothèses générales</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label>Augmentation générale</Label>
                          <div className="flex items-center mt-1">
                            <Input 
                              type="number" 
                              placeholder="3" 
                              className="w-20 mr-2" 
                            />
                            <span className="text-sm text-muted-foreground">% par an</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Inflation prévue</Label>
                          <div className="flex items-center mt-1">
                            <Input 
                              type="number" 
                              placeholder="2" 
                              className="w-20 mr-2" 
                            />
                            <span className="text-sm text-muted-foreground">% par an</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Horizon de projection</Label>
                          <Select defaultValue="12">
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 mois</SelectItem>
                              <SelectItem value="6">6 mois</SelectItem>
                              <SelectItem value="12">12 mois</SelectItem>
                              <SelectItem value="24">24 mois</SelectItem>
                              <SelectItem value="36">36 mois</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-4">Évolution des effectifs</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Checkbox id="enable-recruitment" />
                            <label htmlFor="enable-recruitment" className="ml-2 text-sm">
                              Inclure recrutements
                            </label>
                          </div>
                          <Input
                            type="number"
                            placeholder="Nombre"
                            className="w-20 h-8 text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Checkbox id="enable-departures" />
                            <label htmlFor="enable-departures" className="ml-2 text-sm">
                              Inclure départs
                            </label>
                          </div>
                          <Input
                            type="number"
                            placeholder="Nombre"
                            className="w-20 h-8 text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Checkbox id="enable-promotions" />
                            <label htmlFor="enable-promotions" className="ml-2 text-sm">
                              Inclure promotions
                            </label>
                          </div>
                          <Input
                            type="number"
                            placeholder="Nombre"
                            className="w-20 h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-4">Évolution par département</h3>
                    
                    <div className="space-y-4">
                      <Card className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Technique</h4>
                            <Badge variant="outline">2 employés</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <Label className="text-xs">Croissance</Label>
                              <Select defaultValue="5">
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="%" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="3">3%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="7">7%</SelectItem>
                                  <SelectItem value="10">10%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Nouveaux postes</Label>
                              <Input type="number" placeholder="0" className="h-8 text-xs" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Commercial</h4>
                            <Badge variant="outline">1 employé</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <Label className="text-xs">Croissance</Label>
                              <Select defaultValue="7">
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="%" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="3">3%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="7">7%</SelectItem>
                                  <SelectItem value="10">10%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Nouveaux postes</Label>
                              <Input type="number" placeholder="1" className="h-8 text-xs" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Ressources Humaines</h4>
                            <Badge variant="outline">1 employé</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <Label className="text-xs">Croissance</Label>
                              <Select defaultValue="3">
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="%" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="3">3%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="7">7%</SelectItem>
                                  <SelectItem value="10">10%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Nouveaux postes</Label>
                              <Input type="number" placeholder="0" className="h-8 text-xs" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-6">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculer la projection
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Résultats de la projection</CardTitle>
                    <CardDescription>
                      Simulation sur 12 mois (juin 2025 - mai 2026)
                    </CardDescription>
                  </div>
                  <Badge variant="warning">Simulation</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <h4 className="text-sm text-muted-foreground mb-1">Masse salariale actuelle</h4>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalGrossSalary)}</div>
                    <div className="mt-2 text-xs text-muted-foreground">Mai 2025</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <h4 className="text-sm text-muted-foreground mb-1">Masse salariale projetée</h4>
                    <div className="text-2xl font-bold text-benin-green">{formatCurrency(stats.totalGrossSalary * 1.15)}</div>
                    <div className="mt-2 text-xs text-muted-foreground">Mai 2026</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <h4 className="text-sm text-muted-foreground mb-1">Augmentation</h4>
                    <div className="text-2xl font-bold text-amber-500">+15%</div>
                    <div className="mt-2 text-xs text-muted-foreground">Sur 12 mois</div>
                  </div>
                </div>
                
                <div className="h-72">
                  <BudgetProjectionChart data={chartData.monthlyData} />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Facteurs d'évolution</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Augmentation générale (3%)</span>
                        <span>{formatCurrency(stats.totalGrossSalary * 0.03)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Recrutements (3 postes)</span>
                        <span>{formatCurrency(stats.totalGrossSalary * 0.08)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: "55%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Promotions</span>
                        <span>{formatCurrency(stats.totalGrossSalary * 0.04)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <HelpCircle className="h-5 w-5 mr-3 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Points d'attention</h4>
                        <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                          <li>L'augmentation de la masse salariale est supérieure à l'inflation projetée (15% vs 2%).</li>
                          <li>Le coût des nouveaux recrutements représente 55% de la hausse totale.</li>
                          <li>Considérez d'échelonner les recrutements sur deux exercices fiscaux.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger rapport
                  </Button>
                  <Button>
                    <Calculator className="mr-2 h-4 w-4" />
                    Affiner la simulation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal d'ajout d'employé */}
      <Dialog open={showAddEmployeeModal} onOpenChange={setShowAddEmployeeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel employé</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Département
              </Label>
              <Select
                value={newEmployee.department}
                onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technique">Technique</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Administratif">Administratif</SelectItem>
                  <SelectItem value="Direction">Direction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Poste
              </Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                Salaire
              </Label>
              <Input
                id="salary"
                type="number"
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: Number(e.target.value) }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEmployeeModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddEmployee}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de simulation avancée */}
      <Dialog open={showAdvancedSimulationModal} onOpenChange={setShowAdvancedSimulationModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Simulation avancée</DialogTitle>
            <DialogDescription>
              Configurez les paramètres de la simulation pour projeter l'évolution des salaires
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Période (mois)
              </Label>
              <Select
                value={advancedSimulationParams.period}
                onValueChange={(value) => setAdvancedSimulationParams(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner la période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 mois</SelectItem>
                  <SelectItem value="12">12 mois</SelectItem>
                  <SelectItem value="24">24 mois</SelectItem>
                  <SelectItem value="36">36 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="growthRate" className="text-right">
                Taux de croissance (%)
              </Label>
              <Input
                id="growthRate"
                type="number"
                value={advancedSimulationParams.growthRate}
                onChange={(e) => setAdvancedSimulationParams(prev => ({ ...prev, growthRate: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inflationRate" className="text-right">
                Taux d'inflation (%)
              </Label>
              <Input
                id="inflationRate"
                type="number"
                value={advancedSimulationParams.inflationRate}
                onChange={(e) => setAdvancedSimulationParams(prev => ({ ...prev, inflationRate: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="includeBenefits" className="text-right">
                Inclure avantages
              </Label>
              <div className="col-span-3">
                <input
                  type="checkbox"
                  id="includeBenefits"
                  checked={advancedSimulationParams.includeBenefits}
                  onChange={(e) => setAdvancedSimulationParams(prev => ({ ...prev, includeBenefits: e.target.checked }))}
                  className="mr-2"
                />
                <Label htmlFor="includeBenefits" className="text-sm">
                  Inclure les avantages sociaux dans la simulation
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdvancedSimulationModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleAdvancedSimulation}>
              Lancer la simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SimulationEnterprise;
