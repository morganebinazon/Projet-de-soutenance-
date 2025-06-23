/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, ChartPie, FileText, Users, Search, Plus, Filter, TrendingUp, ArrowUpDown, Building, Briefcase,
  ChevronDown, ChevronUp, BarChart, ArrowRight, FileSpreadsheet, Settings, Calculator, Trash2, Eye, Download
} from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { usePayrollStore } from "@/stores/payroll.store";
import { useToast } from "@/components/ui/use-toast";
import AdvancedSimulationModal from "@/components/modals/AdvancedSimulationModal";
import AddEmployeeModal from "@/components/modals/AddEmployeeModal";
import AddDepartmentModal from "@/components/modals/AddDepartmentModal";
import { DepartmentDetailsModal } from "@/components/modals/DepartmentDetailsModal";
import { Employee, Department, PayrollStats } from "@/types/payroll";
import { Report, ReportType } from "@/types/reports";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ReportModal from "@/components/modals/ReportModal";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/authStore";
import { useApiQuery } from "@/hooks/use-api";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const chartConfig = {
  department: {
    label: "Département",
  },
  totalSalary: {
    label: "Masse Salariale",
    color: "#2E7D32",
  },
  employees: {
    label: "Employés",
    color: "#1976D2",
  },
};

const pieChartData = [
  { name: "Technique", value: 4960000 },
  { name: "Commercial", value: 2880000 },
  { name: "Administratif", value: 2080000 },
  { name: "Direction", value: 1900000 },
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

interface SalaryData {
  month: string;
  salary: number;
}

const employeeFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  department: z.string().min(1, "Veuillez sélectionner un département").default(""),
  position: z.string().min(2, "Le poste doit contenir au moins 2 caractères"),
  grossSalary: z.number().min(0, "Le salaire ne peut pas être négatif"),
  benefits: z.object({
    transport: z.number().min(0).optional(),
    housing: z.number().min(0).optional(),
    performance: z.number().min(0).optional(),
  }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

// Définition des types de base
interface CompanyInfo {
  name: string;
  legalForm: string;
  rccm: string;
  ifu: string;
  creationDate: string;
  sector: string;
}

interface PayrollSettings {
  cycle: 'monthly' | 'biweekly' | 'weekly';
  payDay: 'last' | '25' | '30';
  cnssNumber: string;
  autoDeclarations: boolean;
}

interface CompanySettings {
  companyInfo: CompanyInfo;
  payrollSettings: PayrollSettings;
  logo?: string;
  generalIncreaseRate: number;
  inflationRate: number;
  employerChargesRate: number;
}

// Schéma de validation Zod
const companyInfoSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  legalForm: z.string().min(1, "La forme juridique est requise"),
  rccm: z.string().min(1, "Le RCCM est requis"),
  ifu: z.string().min(1, "L'IFU est requis"),
  creationDate: z.string().min(1, "La date de création est requise"),
  sector: z.string().min(1, "Le secteur est requis")
});

const payrollSettingsSchema = z.object({
  cycle: z.enum(['monthly', 'biweekly', 'weekly']),
  payDay: z.enum(['last', '25', '30']),
  cnssNumber: z.string().min(1, "Le numéro CNSS est requis"),
  autoDeclarations: z.boolean()
});

const companySettingsSchema = z.object({
  companyInfo: companyInfoSchema,
  payrollSettings: payrollSettingsSchema,
  logo: z.string().optional(),
  generalIncreaseRate: z.number(),
  inflationRate: z.number(),
  employerChargesRate: z.number(),
});

// Type pour le formulaire
type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

// État initial des paramètres de l'entreprise
const initialCompanySettings: CompanySettings = {
  companyInfo: {
    name: '',
    legalForm: '',
    rccm: '',
    ifu: '',
    creationDate: '',
    sector: ''
  },
  payrollSettings: {
    cycle: 'monthly',
    payDay: 'last',
    cnssNumber: '',
    autoDeclarations: false
  },
  generalIncreaseRate: 0,
  inflationRate: 0,
  employerChargesRate: 0,
};

// État initial de l'utilisateur
const initialUser: User = {
  id: '',
  email: '',
  accountType: 'enterprise',
  company: 'Nom de l\'entreprise'
};

// Correction du type User et de son état
interface User {
  id: string;
  email: string;
  accountType: string;
  company: string;
}

interface AuthUser {
  id: string;
  email: string;
  accountType: string;
  company: string;
}

// Correction de l'interface DepartmentDetailsModalProps
interface DepartmentDetailsModalProps {
  isOpen: boolean;
  department: Department;
  onClose: () => void;
  onEdit: (department: Department) => void;
  employeeCount: number;
  totalSalary: number;
}

const handleUpdateCompanyInfo = async (data: Partial<CompanyInfo>) => {
  try {
    const updatedCompanyInfo: CompanyInfo = {
      name: data.name ?? companySettings.companyInfo.name,
      legalForm: data.legalForm ?? companySettings.companyInfo.legalForm,
      rccm: data.rccm ?? companySettings.companyInfo.rccm,
      ifu: data.ifu ?? companySettings.companyInfo.ifu,
      creationDate: data.creationDate ?? companySettings.companyInfo.creationDate,
      sector: data.sector ?? companySettings.companyInfo.sector
    };

    const updatedSettings: CompanySettings = {
      ...companySettings,
      companyInfo: updatedCompanyInfo
    };

    const validatedData = companySettingsSchema.parse(updatedSettings);
    setCompanySettings(validatedData);

    toast.success("Les informations de l'entreprise ont été mises à jour avec succès.");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
    toast.error("Une erreur est survenue lors de la mise à jour des paramètres.");
  }
};

const EnterpriseDashboard = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const { toast } = useToast();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);

  const currencySymbol = "FCFA";
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("all");
  const [showAdvancedSimulation, setShowAdvancedSimulation] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showEmployeeEdit, setShowEmployeeEdit] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | undefined>();
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    // employees,
    departments,
    totalGrossSalary,
    totalBenefits,
    socialContributions,
    netSalaries,
    totalCost,
    addEmployee,
    removeEmployee,
    addDepartment,
    removeDepartment,
    updateEmployee,
    calculateStats
  } = usePayrollStore();
  const {
    data: apiResponse,
    isLoading: isEmployeeLoading,
    error: employeeError
  } = useApiQuery<any>(
    ['employees', user.id],
    `/employee/${user.id}/employees`,
    {
      onSuccess: (data) => {
        console.log('API Fetch Success:', data);
        if (data?.success && data.data) {
          // Transformez les données de l'API pour correspondre à votre interface Employee
          const formattedEmployees = data.data.map((emp: any) => ({
            id: emp.id.toString(),
            name: `${emp.firstName} ${emp.lastName}`,
            position: emp.position,
            department: emp.department,
            grossSalary: parseFloat(emp.salary),
            benefits: {
              transport: 0, // À adapter selon vos besoins
              housing: 0,
              performance: 0
            },
            // Ajoutez d'autres champs nécessaires
          }));
          setEmployees(formattedEmployees);

          // // Créez les départements à partir des employés (ou appelez une API séparée si nécessaire)
          // const uniqueDepartments = Array.from(new Set(formattedEmployees.map(e => e.department)))
          //   .map((dept, index) => ({
          //     id: index.toString(),
          //     name: dept,
          //     headcount: formattedEmployees.filter(e => e.department === dept).length,
          //     budget: formattedEmployees
          //       .filter(e => e.department === dept)
          //       .reduce((sum, emp) => sum + emp.grossSalary, 0),
          //     plannedPositions: 0 // À adapter
          //   }));
          // setDepartments(uniqueDepartments);
        }
      },
      onError: (error) => {
        console.error('API Fetch Error:', error);
        toast.error("Erreur lors du chargement des employés");
      }
    }
  );
  useEffect(() => {
    if (apiResponse && apiResponse.success) {
      const employees = apiResponse.data.map((emp: any) => ({
        id: emp.id.toString(),
        name: `${emp.firstName} ${emp.lastName}`,
        position: emp.position,
        department: emp.department,
        grossSalary: parseFloat(emp.salary),
        benefits: {
          transport: 0, // À adapter selon vos besoins
          housing: 0,
          performance: 0
        },
        // Ajoutez d'autres champs nécessaires
      }));
      setEmployees(employees);
    }
    // Do not return any JSX here; just return nothing or a cleanup function if needed
  }, [apiResponse]);
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      department: departments[0]?.name || "",
      position: "",
      grossSalary: 0,
      benefits: {
        transport: 0,
        housing: 0,
        performance: 0,
      },
    },
  });

  // État pour les paramètres de l'entreprise
  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
  // const [user, setUser] = useState<User>(initialUser);

  // Formulaire pour les paramètres
  const settingsForm = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: companySettings
  });

  useEffect(() => {
    try {
      setIsLoading(true);
      if (employees.length > 0 || departments.length > 0) {
        calculateStats();
      }
      setError(null);
    } catch (err) {
      setError("Erreur lors du calcul des statistiques");
      console.error("Erreur de calcul:", err);
    } finally {
      setIsLoading(false);
    }
  }, [employees, departments, calculateStats]);

  useEffect(() => {
    if (selectedEmployee && showEmployeeEdit) {
      form.reset({
        name: selectedEmployee.name,
        department: selectedEmployee.department,
        position: selectedEmployee.position,
        grossSalary: selectedEmployee.grossSalary,
        benefits: {
          transport: selectedEmployee.benefits.transport || 0,
          housing: selectedEmployee.benefits.housing || 0,
          performance: selectedEmployee.benefits.performance || 0,
        },
      });
    }
  }, [selectedEmployee, showEmployeeEdit, form]);

  const handleAddEmployee = async (newEmployee: Omit<Employee, "id">) => {
    try {
      setIsLoading(true);
      setEmployees(prev => [...prev, newEmployee]);
      // Recalculez vos stats si nécessaire
      calculateStats();

      // Vérifier si le département existe
      const departmentExists = departments.some(dept => dept.name === newEmployee.department);
      if (!departmentExists) {
        toast({
          title: "Erreur",
          description: "Le département sélectionné n'existe pas",
          variant: "destructive"
        });
        return;
      }

      // S'assurer que le département n'est pas vide
      if (!newEmployee.department || newEmployee.department.trim() === '') {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un département",
          variant: "destructive"
        });
        return;
      }

      // Ajouter l'employé
      addEmployee({
        ...newEmployee,
        department: newEmployee.department,
        benefits: {
          transport: newEmployee.benefits?.transport || 0,
          housing: newEmployee.benefits?.housing || 0,
          performance: newEmployee.benefits?.performance || 0
        }
      });

      toast({
        title: "Employé ajouté",
        description: `${newEmployee.name} a été ajouté avec succès.`
      });
      setShowAddEmployee(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'employé:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'employé",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      setIsLoading(true);
      removeEmployee(employeeId);
      toast({
        title: "Employé supprimé",
        description: "L'employé a été supprimé avec succès."
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = (newDepartment: Omit<Department, "id">) => {
    addDepartment(newDepartment);
    toast({
      title: "Département ajouté",
      description: `Le département ${newDepartment.name} a été ajouté avec succès.`
    });
    setShowAddDepartment(false);
  };

  const handleDeleteDepartment = (departmentId: string) => {
    if (employees.some(emp => emp.department === departments.find(d => d.id === departmentId)?.name)) {
      toast({
        title: "Suppression impossible",
        description: "Ce département contient des employés. Veuillez d'abord réaffecter les employés.",
        variant: "destructive"
      });
      return;
    }

    removeDepartment(departmentId);
    toast({
      title: "Département supprimé",
      description: "Le département a été supprimé avec succès."
    });
  };

  const filteredEmployees = React.useMemo(() => {
    try {
      return employees.filter(employee => {
        const departmentMatch = selectedDepartmentFilter === "all" ||
          employee.department === selectedDepartmentFilter;

        const searchLower = searchQuery.toLowerCase();
        const searchMatch = !searchQuery ||
          employee.name.toLowerCase().includes(searchLower) ||
          employee.position.toLowerCase().includes(searchLower) ||
          employee.department.toLowerCase().includes(searchLower);

        return departmentMatch && searchMatch;
      });
    } catch (err) {
      console.error("Erreur de filtrage:", err);
      return [];
    }
  }, [employees, selectedDepartmentFilter, searchQuery]);

  const handleDownloadPDF = () => {
    // ... existing code ...
  };

  const totalEmployees = departments.reduce((acc, dept) => acc + dept.headcount, 0);
  const totalMassSalary = totalGrossSalary;
  const avgSalary = Math.round(totalMassSalary / totalEmployees);
  const employerCharges = socialContributions;
  const employeeCharges = 0;
  const chargeRatio = ((employerCharges + employeeCharges) / totalMassSalary * 100).toFixed(1);

  // Update the chart data to use store values
  const payrollDistributionData = [
    { name: 'Salaires bruts', value: totalGrossSalary, color: '#4F46E5' },
    { name: 'Charges sociales', value: socialContributions, color: '#EF4444' },
    { name: 'Avantages', value: totalBenefits, color: '#F59E0B' }
  ];

  const departmentData = departments.map(dept => ({
    name: dept.name,
    value: dept.budget,
    color: dept.name === 'Technique' ? '#4F46E5' :
      dept.name === 'Commercial' ? '#10B981' : '#F59E0B'
  }));

  // Fix the Line component dot prop
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (payload?.event) {
      return (
        <svg>
          <circle
            key={`dot-${index}-${cx}-${cy}`}
            cx={cx}
            cy={cy ? cy - 20 : 0}
            r={6}
            fill="#f44336"
            stroke="white"
            strokeWidth={1}
          />
        </svg>
      );
    }
    return (
      <svg>
        <circle
          key={`dot-${index}-${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={4}
          fill="white"
          stroke="#2E7D32"
          strokeWidth={2}
        />
      </svg>
    );
  };

  const monthlyData: SalaryData[] = [
    { month: 'Décembre', salary: netSalaries },
    { month: 'Janvier', salary: netSalaries * 1.02 },
    { month: 'Février', salary: netSalaries * 1.03 },
    { month: 'Mars', salary: netSalaries * 1.04 },
    { month: 'Avril', salary: netSalaries * 1.05 },
    { month: 'Mai', salary: netSalaries * 1.06 }
  ];

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeEdit(true);
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    if (!selectedEmployee) return;

    try {
      setIsLoading(true);
      const updates: Partial<Employee> = {
        name: updatedEmployee.name,
        position: updatedEmployee.position,
        department: updatedEmployee.department,
        grossSalary: updatedEmployee.grossSalary,
        benefits: updatedEmployee.benefits
      };

      updateEmployee(selectedEmployee.id, updates);
      toast({
        title: "Employé modifié",
        description: `Les informations de ${updatedEmployee.name} ont été mises à jour.`
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'employé",
        variant: "destructive"
      });
    } finally {
      setShowEmployeeEdit(false);
      setIsLoading(false);
    }
  };

  const onSubmit = (data: EmployeeFormValues) => {
    if (selectedEmployee) {
      const updatedEmployee: Employee = {
        ...selectedEmployee,
        ...data,
      };
      handleUpdateEmployee(updatedEmployee);
    }
  };

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowDepartmentDetails(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowDepartmentDetails(false);
    setShowAddDepartment(true);
  };

  // Fonction pour mettre à jour les paramètres de paie
  const handleUpdatePayrollSettings = async (data: Partial<PayrollSettings>) => {
    try {
      const updatedPayrollSettings: PayrollSettings = {
        ...companySettings.payrollSettings,
        ...data
      } as PayrollSettings;

      const updatedSettings: CompanySettings = {
        ...companySettings,
        payrollSettings: updatedPayrollSettings
      };

      const validatedData = companySettingsSchema.parse(updatedSettings);
      setCompanySettings(validatedData);

      toast.success("Les paramètres de paie ont été mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres de paie:", error);
      toast.error("Une erreur est survenue lors de la mise à jour des paramètres de paie.");
    }
  };

  // Fonction pour gérer le changement de logo
  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Simuler le chargement du logo
        const reader = new FileReader();
        reader.onloadend = () => {
          setCompanySettings(prev => ({
            ...prev,
            logo: reader.result as string
          }));
        };
        reader.readAsDataURL(file);

        toast({
          title: "Logo mis à jour",
          description: "Le logo de l'entreprise a été mis à jour avec succès.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement du logo.",
          variant: "destructive"
        });
      }
    }
  };

  // Fonction pour soumettre les paramètres de l'entreprise
  const onSubmitSettings = async (data: CompanySettingsFormValues) => {
    try {
      // Validation des données
      const validatedData = companySettingsSchema.parse(data);

      // Mise à jour des paramètres
      setCompanySettings(prev => ({
        ...prev,
        companyInfo: validatedData.companyInfo,
        payrollSettings: validatedData.payrollSettings
      }));

      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres de l'entreprise ont été mis à jour avec succès.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Afficher les erreurs de validation
        error.errors.forEach((err) => {
          toast({
            title: "Erreur de validation",
            description: err.message,
            variant: "destructive"
          });
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des paramètres.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 border-b p-4 sm:p-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-12 w-12 flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user?.companyName || "Nom de l'entreprise"}</h1>
                  <p className="text-sm text-muted-foreground">
                    Service RH & Paie • Pays: <span className="font-medium capitalize">{country}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/simulation/enterprise')}
                  className="flex items-center"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Simuler la masse salariale
                </Button>
                <div>
                  <Label htmlFor="period-selector" className="text-xs mb-1 block">Période d'analyse</Label>
                  <Select defaultValue="month" onValueChange={setSelectedPeriod}>
                    <SelectTrigger id="period-selector" className="w-[180px]">
                      <SelectValue placeholder="Sélectionner la période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Mai 2025 (Mois courant)</SelectItem>
                      <SelectItem value="quarter">Q2 2025 (Trimestre)</SelectItem>
                      <SelectItem value="year">2025 (Année)</SelectItem>
                      <SelectItem value="custom">Période personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-1 block opacity-0">Actions</Label>
                  <Button>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exporter les données
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-6 px-4">
          {/* Enhanced KPIs */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6">
            <Card className="backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Masse salariale
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +2.8%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalGrossSalary)}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === "month" ? "Mensuelle" : selectedPeriod === "quarter" ? "Trimestrielle" : "Annuelle"} • {totalEmployees} employés
                </p>
                <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 mt-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${80}%` }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-indigo-500" />
                    Effectif total
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600 ml-auto">+2</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Employés actifs</span>
                  <span className="font-medium">
                    <span className="text-green-500">95%</span> de présence
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{
                        opacity: 0.6 + (departments.indexOf(dept) * 0.1),
                        width: `${(dept.headcount / totalEmployees) * 100}%`
                      }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <ChartPie className="h-5 w-5 mr-2 text-amber-500" />
                    Coût moyen
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(avgSalary)}</div>
                <div className="text-xs flex justify-between items-center">
                  <span className="text-muted-foreground">Par employé</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                    +8% vs secteur
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 flex-1 rounded-full">
                    <div className="bg-amber-500 h-full rounded-full w-1/3"></div>
                  </div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 flex-1 rounded-full">
                    <div className="bg-amber-500 h-full rounded-full w-2/3"></div>
                  </div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 flex-1 rounded-full">
                    <div className="bg-amber-500 h-full rounded-full w-4/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-emerald-500" />
                    Charges sociales
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(employerCharges + employeeCharges)}</div>
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Totales</span>
                </div>
                <div className="flex h-2 mt-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${(employerCharges / (employerCharges + employeeCharges)) * 100}%` }}></div>
                  <div className="bg-emerald-400 h-full" style={{ width: `${(employeeCharges / (employerCharges + employeeCharges)) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Employeur: {formatCurrency(Math.round(employerCharges))}</span>
                  <span>Employé: {formatCurrency(Math.round(employeeCharges))}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                    Ratio charges/salaires
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chargeRatio}%</div>
                <p className="text-xs text-muted-foreground">
                  Des salaires bruts
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${chargeRatio}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Évolution de la masse salariale</CardTitle>
                  <CardDescription>12 derniers mois</CardDescription>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Comparer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line
                      type="monotone"
                      dataKey="salary"
                      stroke="#2E7D32"
                      strokeWidth={3}
                      dot={renderCustomDot}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
                  <span>Masse salariale</span>
                </div>
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span>Événements majeurs</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 border border-dashed border-blue-500 rounded-full mr-1"></div>
                  <span>Projection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="departments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="departments" className="text-base">
                <Briefcase className="h-4 w-4 mr-2" />
                Départements
              </TabsTrigger>
              <TabsTrigger value="employees" className="text-base">
                <Users className="h-4 w-4 mr-2" />
                Employés
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-base">
                <FileText className="h-4 w-4 mr-2" />
                Rapports
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-base">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="departments" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par département</CardTitle>
                    <CardDescription>
                      Distribution de la masse salariale
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {departmentData.map((entry) => (
                              <Cell key={`cell-${entry.name}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analyse par département</CardTitle>
                    <CardDescription>
                      Employés et masse salariale par service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ChartContainer config={chartConfig}>
                        <RechartsBarChart data={departments}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#1976D2" />
                          <YAxis yAxisId="right" orientation="right" stroke="#2E7D32" />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                          />
                          <Bar yAxisId="left" dataKey="headcount" fill="var(--color-employees, #1976D2)" name="Employés" />
                          <Bar yAxisId="right" dataKey="budget" fill="var(--color-totalSalary, #2E7D32)" name="Masse Salariale" />
                        </RechartsBarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Détails des départements</CardTitle>
                    <CardDescription>
                      Vue d'ensemble des départements et services
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowAddDepartment(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Département</TableHead>
                        <TableHead>Employés</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Croissance</TableHead>
                        <TableHead>Postes ouverts</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((dept) => {
                        const deptEmployees = employees.filter(emp => emp.department === dept.name);
                        const totalSalary = deptEmployees.reduce((sum, emp) => sum + emp.grossSalary, 0);
                        const growthRate = ((totalSalary - dept.budget) / dept.budget) * 100;

                        return (
                          <TableRow key={dept.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <span className="mr-2">{dept.name}</span>
                                {growthRate > 5 && (
                                  <Badge variant="success" className="text-xs">
                                    En croissance
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{deptEmployees.length}</span>
                                {deptEmployees.length < dept.headcount && (
                                  <Badge variant="outline" className="text-xs">
                                    {dept.headcount - deptEmployees.length} poste(s) à pourvoir
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatCurrency(totalSalary)}</span>
                                <span className="text-xs text-muted-foreground">
                                  Budget: {formatCurrency(dept.budget)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Badge
                                  variant={growthRate > 0 ? "success" : "destructive"}
                                  className="text-xs"
                                >
                                  {growthRate.toFixed(1)}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span>{dept.plannedPositions}</span>
                                {dept.plannedPositions > 0 && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Recrutement en cours
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDepartment(dept)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditDepartment(dept)}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDepartment(dept.id)}
                                  className="text-red-500 hover:text-red-700"
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
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total: {departments.length} départements
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Budget total: {formatCurrency(departments.reduce((sum, dept) => sum + dept.budget, 0))}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Liste des employés</CardTitle>
                    <CardDescription>
                      Gestion et suivi du personnel • {employees.length} employés
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Rechercher un employé..."
                          className="pl-8 w-[250px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select
                        value={selectedDepartmentFilter}
                        onValueChange={setSelectedDepartmentFilter}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrer par département" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les départements</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name || `dept-${dept.id}`}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => setShowAddEmployee(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un employé
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {error ? (
                    <div className="flex items-center justify-center p-4 text-red-500">
                      <span>{error}</span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <span>Chargement...</span>
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Aucun employé trouvé</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery || selectedDepartmentFilter !== "all"
                          ? "Aucun employé ne correspond à vos critères de recherche"
                          : "Commencez par ajouter des employés à votre entreprise"}
                      </p>
                      <Button onClick={() => setShowAddEmployee(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un employé
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
                          <TableHead className="text-right">Avantages</TableHead>
                          <TableHead className="text-right">Coût total</TableHead>
                          <TableHead className="text-center">Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => {
                          const totalBenefits = (employee.benefits.transport || 0) +
                            (employee.benefits.housing || 0) +
                            (employee.benefits.performance || 0);
                          const employerCost = employee.grossSalary * 1.154 + totalBenefits;
                          const department = departments.find(d => d.name === employee.department);

                          return (
                            <TableRow key={employee.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                    <Users className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{employee.name}</div>
                                    <div className="text-xs text-muted-foreground">ID: {employee.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">
                                  {employee.department}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{employee.position}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {department?.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col">
                                  <span>{formatCurrency(employee.grossSalary)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Mensuel
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col">
                                  <span>{formatCurrency(totalBenefits)}</span>
                                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                    {employee.benefits.transport && (
                                      <Badge variant="secondary" className="text-xs">Transport</Badge>
                                    )}
                                    {employee.benefits.housing && (
                                      <Badge variant="secondary" className="text-xs">Logement</Badge>
                                    )}
                                    {employee.benefits.performance && (
                                      <Badge variant="secondary" className="text-xs">Performance</Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col">
                                  <span className="font-medium">{formatCurrency(employerCost)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Charges incluses
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={employee.grossSalary > 500000 ? "success" : "default"}
                                  className="font-normal"
                                >
                                  {employee.grossSalary > 500000 ? "Cadre" : "Non-cadre"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewEmployee(employee)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditEmployee(employee)}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteEmployee(employee.id)}
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
                {filteredEmployees.length > 0 && (
                  <CardFooter className="flex justify-between border-t px-6 py-3">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div>
                        Total employés: <strong>{employees.length}</strong>
                      </div>
                      <div>
                        Masse salariale: <strong>{formatCurrency(totalGrossSalary)}</strong>
                      </div>
                      <div>
                        Coût moyen: <strong>{formatCurrency(totalGrossSalary / employees.length)}</strong>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtres avancés
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par département</CardTitle>
                    <CardDescription>Distribution des effectifs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departments.map(dept => {
                        const deptEmployees = employees.filter(e => e.department === dept.name);
                        const percentage = (deptEmployees.length / employees.length) * 100;

                        return (
                          <div key={dept.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{dept.name}</span>
                              <span className="font-medium">{deptEmployees.length} employés</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{percentage.toFixed(1)}% des effectifs</span>
                              <span>Budget: {formatCurrency(dept.budget)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Structure des salaires</CardTitle>
                    <CardDescription>Répartition par tranche</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { range: "< 300k", min: 0, max: 300000 },
                        { range: "300k - 500k", min: 300000, max: 500000 },
                        { range: "500k - 800k", min: 500000, max: 800000 },
                        { range: "> 800k", min: 800000, max: Infinity }
                      ].map((bracket) => {
                        const count = employees.filter(
                          e => e.grossSalary >= bracket.min && e.grossSalary < bracket.max
                        ).length;
                        const percentage = (count / employees.length) * 100;

                        return (
                          <div key={bracket.range} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{bracket.range}</span>
                              <span className="font-medium">{count} employés</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}% des effectifs
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Indicateurs RH</CardTitle>
                    <CardDescription>Métriques clés du personnel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{formatCurrency(totalGrossSalary / employees.length)}</div>
                            <p className="text-xs text-muted-foreground">Salaire moyen</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                              {((employees.filter(e => e.grossSalary > 500000).length / employees.length) * 100).toFixed(0)}%
                            </div>
                            <p className="text-xs text-muted-foreground">Taux d'encadrement</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Répartition hommes/femmes</div>
                            <div className="text-sm text-muted-foreground">58% / 42%</div>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: '58%' }} />
                            <div className="bg-pink-500 h-full" style={{ width: '42%' }} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Ancienneté moyenne</div>
                            <div className="text-sm text-muted-foreground">3.2 ans</div>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full">
                            <div className="bg-primary h-full" style={{ width: '65%' }} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Rapports disponibles</CardTitle>
                    <CardDescription>
                      Analyses et statistiques de l'entreprise
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filtrer par type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="social">Bilan social</SelectItem>
                        <SelectItem value="salary">Analyse salariale</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="hr">RH</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setShowReportModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau rapport
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                      key="bilan-social"
                      className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedReportType('social');
                        setShowReportModal(true);
                      }}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-3 group-hover:bg-primary/10 transition-colors">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Bilan Social</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Rapport complet sur la situation sociale
                        </p>
                        <Badge variant="outline" className="mt-auto">Mai 2025</Badge>
                      </CardContent>
                    </Card>

                    <Card
                      key="analyse-salariale"
                      className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedReportType('salary');
                        setShowReportModal(true);
                      }}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-3 group-hover:bg-primary/10 transition-colors">
                          <BarChart className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Analyse Salariale</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Comparaison des salaires par poste
                        </p>
                        <Badge variant="outline" className="mt-auto">Avril 2025</Badge>
                      </CardContent>
                    </Card>

                    <Card
                      key="previsions-budgetaires"
                      className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedReportType('budget');
                        setShowReportModal(true);
                      }}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-3 group-hover:bg-primary/10 transition-colors">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Prévisions Budgétaires</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Projections des charges salariales
                        </p>
                        <Badge variant="outline" className="mt-auto">Mai 2025</Badge>
                      </CardContent>
                    </Card>

                    <Card
                      key="indicateurs-rh"
                      className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedReportType('hr');
                        setShowReportModal(true);
                      }}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-3 group-hover:bg-primary/10 transition-colors">
                          <ChartPie className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Indicateurs RH</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Principaux KPIs ressources humaines
                        </p>
                        <Badge variant="outline" className="mt-auto">Mai 2025</Badge>
                      </CardContent>
                    </Card>

                    <Card
                      key="nouveau-rapport"
                      className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer"
                      onClick={() => setShowReportModal(true)}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        <div className="bg-primary/10 rounded-full p-3">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-3">
                          Créer un nouveau rapport
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Calendrier des échéances</CardTitle>
                    <CardDescription>
                      Déclarations et paiements à effectuer
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Type d'échéance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="cnss">CNSS</SelectItem>
                        <SelectItem value="ipts">IPTS</SelectItem>
                        <SelectItem value="irpp">IRPP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendrier
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Échéance</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">15 Juin 2025</TableCell>
                        <TableCell>
                          <Badge variant="outline">CNSS</Badge>
                        </TableCell>
                        <TableCell>Déclaration et paiement mensuel</TableCell>
                        <TableCell>{formatCurrency(totalGrossSalary * 0.154)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">À venir</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Préparer
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">20 Juin 2025</TableCell>
                        <TableCell>
                          <div className="space-x-1">
                            <Badge variant="outline">IPTS</Badge>
                            <Badge variant="outline">IRPP</Badge>
                          </div>
                        </TableCell>
                        <TableCell>Déclaration et versement mensuel</TableCell>
                        <TableCell>{formatCurrency(totalGrossSalary * 0.12)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">À venir</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Préparer
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">15 Mai 2025</TableCell>
                        <TableCell>
                          <Badge variant="outline">CNSS</Badge>
                        </TableCell>
                        <TableCell>Déclaration et paiement mensuel</TableCell>
                        <TableCell>{formatCurrency(totalGrossSalary * 0.154)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Effectué</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détail
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total des échéances à venir: {formatCurrency(totalGrossSalary * 0.274)}
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter le calendrier
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de l'entreprise</CardTitle>
                  <CardDescription>
                    Informations générales et configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Form {...settingsForm}>
                    <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={settingsForm.control}
                                name="companyInfo.name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">Raison sociale</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={settingsForm.control}
                                name="companyInfo.legalForm"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">Forme juridique</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={settingsForm.control}
                                name="companyInfo.rccm"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">RCCM</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={settingsForm.control}
                                name="companyInfo.ifu"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">IFU</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={settingsForm.control}
                                name="companyInfo.creationDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">Date création</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={settingsForm.control}
                                name="companyInfo.sector"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">Secteur d'activité</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Logo et identité visuelle</h3>
                          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                              {companySettings.logo ? (
                                <img
                                  src={companySettings.logo}
                                  alt="Logo de l'entreprise"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Building className="h-12 w-12 text-gray-400" />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Label htmlFor="logo-upload" className="cursor-pointer">
                                <Button size="sm" asChild>
                                  <span>Changer le logo</span>
                                </Button>
                                <Input
                                  id="logo-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleLogoChange}
                                />
                              </Label>
                              {companySettings.logo && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCompanySettings(prev => ({ ...prev, logo: undefined }))}
                                >
                                  Supprimer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Paramètres de paie</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="payrollSettings.cycle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cycle de paie</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monthly">Mensuel</SelectItem>
                                    <SelectItem value="biweekly">Bimensuel</SelectItem>
                                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="payrollSettings.payDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jour de paie</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="last">Dernier jour du mois</SelectItem>
                                    <SelectItem value="25">25ème jour du mois</SelectItem>
                                    <SelectItem value="30">30ème jour du mois</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="payrollSettings.cnssNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro d'employeur CNSS</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="md:col-span-3">
                            <FormField
                              control={settingsForm.control}
                              name="payrollSettings.autoDeclarations"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Activer la préparation automatique des déclarations sociales et fiscales
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="mt-4">
                          Enregistrer les paramètres
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <AdvancedSimulationModal
        isOpen={showAdvancedSimulation}
        onClose={() => setShowAdvancedSimulation(false)}
        companyId="1"
        userRole="Administrateur RH"
      />

      <AddEmployeeModal
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
        onAddEmployee={handleAddEmployee}
        departments={departments}
      />

      <AddDepartmentModal
        isOpen={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        onAddDepartment={handleAddDepartment}
        initialDepartment={selectedDepartment}
      />

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <Dialog open={showEmployeeDetails} onOpenChange={setShowEmployeeDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Détails de l'employé</DialogTitle>
              <DialogDescription>
                Informations complètes sur {selectedEmployee.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom complet</Label>
                  <div className="font-medium">{selectedEmployee.name}</div>
                </div>
                <div>
                  <Label>Département</Label>
                  <div className="font-medium">{selectedEmployee.department}</div>
                </div>
                <div>
                  <Label>Poste</Label>
                  <div className="font-medium">{selectedEmployee.position}</div>
                </div>
                <div>
                  <Label>Salaire brut</Label>
                  <div className="font-medium">{formatCurrency(selectedEmployee.grossSalary)}</div>
                </div>
              </div>

              <div>
                <Label>Avantages</Label>
                <div className="flex gap-2 mt-1">
                  {selectedEmployee.benefits.transport && (
                    <Badge>Transport: {formatCurrency(selectedEmployee.benefits.transport)}</Badge>
                  )}
                  {selectedEmployee.benefits.housing && (
                    <Badge>Logement: {formatCurrency(selectedEmployee.benefits.housing)}</Badge>
                  )}
                  {selectedEmployee.benefits.performance && (
                    <Badge>Performance: {formatCurrency(selectedEmployee.benefits.performance)}</Badge>
                  )}
                </div>
              </div>

              <div>
                <Label>Coût total employeur</Label>
                <div className="font-medium">
                  {formatCurrency(
                    selectedEmployee.grossSalary * 1.154 +
                    (selectedEmployee.benefits.transport || 0) +
                    (selectedEmployee.benefits.housing || 0) +
                    (selectedEmployee.benefits.performance || 0)
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmployeeDetails(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                setShowEmployeeDetails(false);
                handleEditEmployee(selectedEmployee);
              }}>
                Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Employee Edit Modal */}
      {selectedEmployee && (
        <Dialog open={showEmployeeEdit} onOpenChange={setShowEmployeeEdit}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'employé</DialogTitle>
              <DialogDescription>
                Modifier les informations de {selectedEmployee.name}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form id="employee-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Département</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={departments[0]?.name || "default"}
                        value={field.value || departments[0]?.name || "default"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name || `dept-${dept.id}`}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poste</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grossSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salaire brut</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Avantages</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="benefits.transport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transport</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="benefits.housing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logement</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="benefits.performance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Performance</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmployeeEdit(false)}>
                Annuler
              </Button>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType={selectedReportType}
      />

      {/* Department Details Modal */}
      {selectedDepartment && (
        <DepartmentDetailsModal
          isOpen={showDepartmentDetails}
          department={selectedDepartment}
          onClose={() => setShowDepartmentDetails(false)}
          onEdit={handleEditDepartment}
          employeeCount={selectedDepartment.headcount}
          totalSalary={selectedDepartment.budget}
        />
      )}
    </Layout>
  );
};

export default EnterpriseDashboard;
