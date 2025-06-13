import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, Download, Plus, Trash2, Users, Building, PieChart, BarChart2, HelpCircle, Filter, Search, Eye, Edit, Send, UserCheck } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useCountry } from "@/hooks/use-country";
import { SalaryDistributionChart, DepartmentChart, MonthlyEvolutionChart, BudgetProjectionChart } from "@/components/simulation/EnterpriseCharts";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Loader2 } from "lucide-react";
import { usePayrollStore } from "@/stores/payroll.store";

// Types intégrés avec le dashboard
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
  familyStatus?: string;
  children?: number;
  email?: string;
  phone?: string;
  hireDate?: string;
}

interface Department {
  id: string;
  name: string;
  headcount: number;
  budget: number;
  plannedPositions: number;
  manager?: string;
}

interface SimulationResult {
  employee: Employee;
  grossSalary: number;
  netSalary: number;
  socialContributions: number;
  incomeTax: number;
  totalCost: number;
  details: any;
}

interface MonthlyData {
  month: number;
  projectedSalary: number;
  employeeCount: number;
}

const SimulationEnterprise: React.FC = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showEmployeeSimulation, setShowEmployeeSimulation] = useState(false);
  const [showSendBulletin, setShowSendBulletin] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  // Intégration avec le store du dashboard
  const {
    employees,
    departments,
    totalGrossSalary,
    totalBenefits,
    socialContributions,
    netSalaries,
    totalCost,
    removeEmployee,
    updateEmployee,
    calculateStats
  } = usePayrollStore();

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

  // Calculs conformes aux normes du Bénin et du Togo
  const calculateSalaryDetails = (employee: Employee) => {
    const totalGross = employee.grossSalary + 
      (employee.benefits.transport || 0) + 
      (employee.benefits.housing || 0) + 
      (employee.benefits.performance || 0);

    let socialContribEmployee = 0;
    let incomeTax = 0;
    let employerCharges = 0;

    if (country === "benin") {
      // Calculs pour le Bénin
      socialContribEmployee = Math.round(totalGross * 0.036); // 3.6% CNSS
      employerCharges = Math.round(totalGross * 0.214); // 21.4% charges patronales
      
      // Calcul ITS simplifié
      const taxableIncome = totalGross - socialContribEmployee - (totalGross * 0.20); // Frais pro 20%
      
      if (taxableIncome <= 50000) {
        incomeTax = 0;
      } else if (taxableIncome <= 130000) {
        incomeTax = (taxableIncome - 50000) * 0.10;
      } else if (taxableIncome <= 280000) {
        incomeTax = 8000 + (taxableIncome - 130000) * 0.15;
      } else if (taxableIncome <= 580000) {
        incomeTax = 30500 + (taxableIncome - 280000) * 0.20;
      } else {
        incomeTax = 90500 + (taxableIncome - 580000) * 0.25;
      }
    } else {
      // Calculs pour le Togo
      socialContribEmployee = Math.round(totalGross * 0.09); // 9% CNSS
      employerCharges = Math.round(totalGross * 0.215); // 21.5% charges patronales
      
      // Calcul IRPP simplifié
      const taxableIncome = totalGross - socialContribEmployee - (totalGross * 0.20); // Frais pro 20%
      
      if (taxableIncome <= 50000) {
        incomeTax = 0;
      } else if (taxableIncome <= 130000) {
        incomeTax = (taxableIncome - 50000) * 0.05;
      } else if (taxableIncome <= 280000) {
        incomeTax = 4000 + (taxableIncome - 130000) * 0.10;
      } else if (taxableIncome <= 580000) {
        incomeTax = 19000 + (taxableIncome - 280000) * 0.15;
      } else if (taxableIncome <= 1000000) {
        incomeTax = 64000 + (taxableIncome - 580000) * 0.20;
      } else {
        incomeTax = 148000 + (taxableIncome - 1000000) * 0.25;
      }
    }

    const netSalary = totalGross - socialContribEmployee - Math.round(incomeTax);
    const totalEmployerCost = totalGross + employerCharges;

    return {
      grossSalary: totalGross,
      netSalary,
      socialContributions: socialContribEmployee,
      incomeTax: Math.round(incomeTax),
      employerCharges,
      totalCost: totalEmployerCost,
      details: {
        country,
        taxableIncome: totalGross - socialContribEmployee,
        professionalExpenses: Math.round(totalGross * 0.20),
        benefits: employee.benefits
      }
    };
  };

  // Filtrer les employés selon les critères
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filters.department === "all" || employee.department === filters.department;
    const matchesSalary = employee.grossSalary >= filters.minSalary && employee.grossSalary <= filters.maxSalary;
    
    return matchesSearch && matchesDepartment && matchesSalary;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Voir les détails d'un employé
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  // Simuler le salaire d'un employé
  const handleSimulateEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeSimulation(true);
  };

  // Supprimer un employé
  const handleDeleteEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      removeEmployee(employeeId);
      toast.success(`${employee.name} a été supprimé de la liste`);
    }
  };

  // Envoyer le bulletin de paie
  const handleSendBulletin = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowSendBulletin(true);
  };

  // Confirmer l'envoi du bulletin
  const confirmSendBulletin = async () => {
    if (!selectedEmployee) return;

    try {
      setIsLoading(true);
      
      // Simuler l'envoi du bulletin
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Bulletin de paie envoyé à ${selectedEmployee.name}`);
      setShowSendBulletin(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du bulletin");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les statistiques globales
  const calculateGlobalStats = () => {
    const totalEmployees = employees.length;
    const avgSalary = totalEmployees > 0 ? Math.round(totalGrossSalary / totalEmployees) : 0;
    const totalEmployerCost = employees.reduce((sum, emp) => {
      const details = calculateSalaryDetails(emp);
      return sum + details.totalCost;
    }, 0);

    return {
      totalEmployees,
      totalGrossSalary,
      avgSalary,
      totalEmployerCost,
      totalNetSalaries: employees.reduce((sum, emp) => {
        const details = calculateSalaryDetails(emp);
        return sum + details.netSalary;
      }, 0)
    };
  };

  const stats = calculateGlobalStats();

  // Simulation avancée
  const handleAdvancedSimulation = () => {
    const months = parseInt(advancedSimulationParams.period);
    const growthRate = parseFloat(advancedSimulationParams.growthRate) / 100;
    const inflationRate = parseFloat(advancedSimulationParams.inflationRate) / 100;

    const projections = Array.from({ length: months }, (_, i) => {
      const month = i + 1;
      const salaryGrowth = Math.pow(1 + growthRate, month / 12);
      const inflationAdjustment = Math.pow(1 + inflationRate, month / 12);
      
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

    setMonthlyData(projections);
    setShowAdvancedSimulationModal(false);
    toast.success("Simulation avancée lancée avec succès");
  };

  // Télécharger le rapport
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text("Rapport de Simulation Entreprise", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Pays: ${country === 'benin' ? 'Bénin' : 'Togo'}`, 20, 40);
    
    // Statistiques générales
    doc.setFontSize(16);
    doc.text("Statistiques Générales", 20, 55);
    doc.setFontSize(12);
    doc.text(`Nombre total d'employés: ${stats.totalEmployees}`, 20, 65);
    doc.text(`Masse salariale totale: ${formatCurrency(stats.totalGrossSalary)}`, 20, 75);
    doc.text(`Salaire moyen: ${formatCurrency(stats.avgSalary)}`, 20, 85);
    doc.text(`Coût total employeur: ${formatCurrency(stats.totalEmployerCost)}`, 20, 95);
    
    // Liste des employés avec simulations
    const employeeData = employees.map(emp => {
      const details = calculateSalaryDetails(emp);
      return [
        emp.name,
        emp.department,
        emp.position,
        formatCurrency(emp.grossSalary),
        formatCurrency(details.netSalary),
        formatCurrency(details.totalCost)
      ];
    });
    
    (doc as any).autoTable({
      startY: 110,
      head: [['Nom', 'Département', 'Poste', 'Salaire Brut', 'Salaire Net', 'Coût Total']],
      body: employeeData
    });
    
    doc.save('rapport-simulation-entreprise.pdf');
    toast.success("Rapport généré avec succès");
  };

  // Calculer les données pour les graphiques
  const calculateChartData = () => {
    const salaryDistributionData = [
      { name: "Salaires bruts", value: stats.totalGrossSalary },
      { name: "Charges sociales", value: socialContributions },
      { name: "Avantages", value: totalBenefits }
    ];

    const departmentData = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept.name);
      const deptSalary = deptEmployees.reduce((sum, emp) => sum + emp.grossSalary, 0);
      
      return {
        name: dept.name,
        salary: deptSalary,
        employees: deptEmployees.length,
        budget: dept.budget
      };
    });

    return { salaryDistributionData, departmentData };
  };

  const chartData = calculateChartData();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => navigate('/enterprise-dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Simulateur Entreprise</h1>
            </div>
            <p className="text-muted-foreground">
              Gérez votre masse salariale et simulez les salaires • {stats.totalEmployees} employés
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
              Employés ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building className="h-4 w-4 mr-2" />
              Départements ({departments.length})
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
                  <div className="flex items-center mt-1 text-xs">
                    <span className="text-muted-foreground">Moyenne: {formatCurrency(stats.avgSalary)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Effectif total</CardTitle>
                  <CardDescription>Employés actifs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {departments.length} départements
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Salaires nets</CardTitle>
                  <CardDescription>Total mensuel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalNetSalaries)}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>{((stats.totalNetSalaries / stats.totalGrossSalary) * 100).toFixed(1)}% du brut</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Coût total employeur</CardTitle>
                  <CardDescription>Charges incluses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(stats.totalEmployerCost)}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>+{(((stats.totalEmployerCost - stats.totalGrossSalary) / stats.totalGrossSalary) * 100).toFixed(1)}% de charges</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition de la masse salariale</CardTitle>
                  <CardDescription>Aperçu des composantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <SalaryDistributionChart data={chartData.salaryDistributionData} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition par département</CardTitle>
                  <CardDescription>Masse salariale par service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <DepartmentChart data={chartData.departmentData} />
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
                Simulation avancée
              </Button>
            </div>
          </TabsContent>
          
          {/* Gestion des employés */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Liste des employés</CardTitle>
                    <CardDescription>
                      Gestion et simulation des salaires • {filteredEmployees.length} employés affichés
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
                    <Select 
                      value={filters.department} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les départements</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun employé trouvé</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                      {searchTerm || filters.department !== "all" 
                        ? "Aucun employé ne correspond à vos critères" 
                        : "Aucun employé dans la base de données"}
                    </p>
                    <Button onClick={() => navigate('/enterprise-dashboard')}>
                      Retour au dashboard
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Département</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead className="text-right">Salaire brut</TableHead>
                        <TableHead className="text-right">Salaire net estimé</TableHead>
                        <TableHead className="text-right">Coût employeur</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map(employee => {
                        const salaryDetails = calculateSalaryDetails(employee);
                        
                        return (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">{employee.name}</div>
                                  <div className="text-xs text-muted-foreground">ID: {employee.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{employee.department}</Badge>
                            </TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(employee.grossSalary)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(salaryDetails.netSalary)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(salaryDetails.totalCost)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewEmployee(employee)}
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleSimulateEmployee(employee)}
                                  title="Simuler le salaire"
                                >
                                  <Calculator className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleSendBulletin(employee)}
                                  title="Envoyer bulletin"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Départements */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(department => {
                const deptEmployees = employees.filter(emp => emp.department === department.name);
                const deptSalary = deptEmployees.reduce((sum, emp) => sum + emp.grossSalary, 0);
                const avgDeptSalary = deptEmployees.length > 0 ? deptSalary / deptEmployees.length : 0;
                
                return (
                  <Card key={department.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span>{department.name}</span>
                        <Badge variant="outline">{deptEmployees.length} employés</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Masse salariale</span>
                          <span className="font-medium">{formatCurrency(deptSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Salaire moyen</span>
                          <span className="font-medium">{formatCurrency(avgDeptSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Budget alloué</span>
                          <span className="font-medium">{formatCurrency(department.budget)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Utilisation budget</span>
                          <span className="font-medium">
                            {((deptSalary / department.budget) * 100).toFixed(1)}%
                          </span>
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
                );
              })}
            </div>
          </TabsContent>
          
          {/* Projections */}
          <TabsContent value="projections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulation avancée</CardTitle>
                <CardDescription>
                  Projections de la masse salariale sur {advancedSimulationParams.period} mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div className="h-[400px]">
                    <BudgetProjectionChart data={monthlyData} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune projection disponible</h3>
                    <p className="text-muted-foreground mb-4">
                      Lancez une simulation avancée pour voir les projections
                    </p>
                    <Button onClick={() => setShowAdvancedSimulationModal(true)}>
                      <Calculator className="mr-2 h-4 w-4" />
                      Lancer une simulation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal détails employé */}
        <Dialog open={showEmployeeDetails} onOpenChange={setShowEmployeeDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'employé</DialogTitle>
              <DialogDescription>
                Informations complètes et calculs salariaux
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom complet</Label>
                    <p className="font-medium">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <Label>Département</Label>
                    <p className="font-medium">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <Label>Poste</Label>
                    <p className="font-medium">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <Label>Salaire brut</Label>
                    <p className="font-medium">{formatCurrency(selectedEmployee.grossSalary)}</p>
                  </div>
                </div>
                
                {/* Calculs détaillés */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Simulation salariale ({country === 'benin' ? 'Bénin' : 'Togo'})</h4>
                  {(() => {
                    const details = calculateSalaryDetails(selectedEmployee);
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Salaire brut total</span>
                            <span className="font-medium">{formatCurrency(details.grossSalary)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Cotisations sociales ({country === 'benin' ? '3.6%' : '9%'})</span>
                            <span>-{formatCurrency(details.socialContributions)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>{country === 'benin' ? 'ITS' : 'IRPP'}</span>
                            <span>-{formatCurrency(details.incomeTax)}</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-medium text-green-600">
                              <span>Salaire net</span>
                              <span>{formatCurrency(details.netSalary)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Charges patronales</span>
                            <span className="font-medium">+{formatCurrency(details.employerCharges)}</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-medium">
                              <span>Coût total employeur</span>
                              <span>{formatCurrency(details.totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleSimulateEmployee(selectedEmployee)}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Simuler modifications
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleSendBulletin(selectedEmployee)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer bulletin
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal simulation employé */}
        <Dialog open={showEmployeeSimulation} onOpenChange={setShowEmployeeSimulation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Simulation salariale</DialogTitle>
              <DialogDescription>
                Simulez les modifications de salaire pour {selectedEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nouveau salaire brut</Label>
                    <Input 
                      type="number" 
                      defaultValue={selectedEmployee.grossSalary}
                      placeholder="Saisir le nouveau salaire"
                    />
                  </div>
                  <div>
                    <Label>Prime de transport</Label>
                    <Input 
                      type="number" 
                      defaultValue={selectedEmployee.benefits.transport || 0}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Résultat de la simulation</h4>
                  <p className="text-sm text-muted-foreground">
                    Les calculs seront mis à jour en temps réel lors de la modification des valeurs
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculer
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Appliquer les modifications
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal envoi bulletin */}
        <Dialog open={showSendBulletin} onOpenChange={setShowSendBulletin}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Envoyer le bulletin de paie</DialogTitle>
              <DialogDescription>
                Confirmer l'envoi du bulletin de paie à {selectedEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="email" defaultChecked />
                <Label htmlFor="email">Envoyer par email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="dashboard" defaultChecked />
                <Label htmlFor="dashboard">Ajouter au dashboard employé</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notification" />
                <Label htmlFor="notification">Envoyer une notification</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendBulletin(false)}>
                Annuler
              </Button>
              <Button onClick={confirmSendBulletin} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal simulation avancée */}
        <Dialog open={showAdvancedSimulationModal} onOpenChange={setShowAdvancedSimulationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simulation avancée</DialogTitle>
              <DialogDescription>
                Configurez les paramètres pour projeter l'évolution de la masse salariale
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
                    <SelectValue />
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
                  Croissance (%)
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
                  Inflation (%)
                </Label>
                <Input
                  id="inflationRate"
                  type="number"
                  value={advancedSimulationParams.inflationRate}
                  onChange={(e) => setAdvancedSimulationParams(prev => ({ ...prev, inflationRate: e.target.value }))}
                  className="col-span-3"
                />
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
      </div>
    </Layout>
  );
};

export default SimulationEnterprise;
