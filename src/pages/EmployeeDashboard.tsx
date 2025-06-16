import React, { useState, useEffect, useRef } from "react";
import { useCountry } from "@/hooks/use-country.tsx";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Calculator,
  Calendar,
  CalendarDays,
  ChartBar,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Mail,
  Printer,
  Save,
  Share2,
  Target,
  TrendingUp,
  User as UserIcon,
  Search,
  Filter,
  Plus,
  Settings,
  X,
  Building,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Bell,
  Camera
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeStore } from "@/stores/employee.store";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Sample data for the dashboard
const salaryHistoryData = [
  { month: "Jan", simulations: 3, avgNet: 245000 },
  { month: "Fév", simulations: 5, avgNet: 268000 },
  { month: "Mar", simulations: 4, avgNet: 285000 },
  { month: "Avr", simulations: 7, avgNet: 295000 },
  { month: "Mai", simulations: 6, avgNet: 315000 },
  { month: "Jun", simulations: 4, avgNet: 285000 }
];

const mockDocuments = [
  { name: "Bulletin de paie - Mai 2025", type: "Bulletin", date: "28/05/2025", icon: "FileText" },
  { name: "Bulletin de paie - Avril 2025", type: "Bulletin", date: "28/04/2025", icon: "FileText" },
  { name: "Attestation de travail", type: "Attestation", date: "15/03/2025", icon: "FileText" }
];

const mockLeavesData = [
  { type: "Congés annuels", start: "05/08/2025", end: "20/08/2025", days: 12, status: "approved" },
  { type: "Congés annuels", start: "02/05/2025", end: "03/05/2025", days: 2, status: "approved" },
  { type: "Congé maladie", start: "15/02/2025", end: "17/02/2025", days: 3, status: "justified" }
];

const EmployeeDashboard = () => {
  const { country } = useCountry();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { 
    employee, 
    setEmployee, 
    updateEmployee, 
    addDocument, 
    removeDocument, 
    addNotification,
    markNotificationAsRead,
    updateLeaves 
  } = useEmployeeStore();
  const [salaryView, setSalaryView] = useState<string>("net");
  const currencySymbol = "FCFA";
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showLeaveRequest, setShowLeaveRequest] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [leaveRequest, setLeaveRequest] = useState({
    startDate: "",
    endDate: "",
    type: "",
    comment: ""
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format currency for display
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, ''), 10) : value;
    return `${numValue.toLocaleString()} ${currencySymbol}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Charger l'image de profil au montage du composant
  useEffect(() => {
    if (employee?.profileImage) {
      setProfileImage(employee.profileImage);
    }
  }, [employee?.profileImage]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image valide",
          variant: "destructive"
        });
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive"
        });
        return;
      }

      try {
        // Convertir l'image en base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setProfileImage(base64String);
          
          // Mettre à jour l'image dans le store
          if (employee) {
            updateEmployee({
              ...employee,
              profileImage: base64String
            });
          }

          toast({
            title: "Succès",
            description: "Photo de profil mise à jour",
            variant: "default"
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'image:', error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement de l'image",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownloadPayslip = (payslip: any) => {
    // Créer le contenu HTML du bulletin de paie
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-logo { max-width: 150px; margin-bottom: 10px; }
            .title { font-size: 24px; color: #1a5f7a; margin-bottom: 5px; }
            .subtitle { font-size: 18px; color: #666; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 16px; color: #1a5f7a; margin-bottom: 10px; border-bottom: 2px solid #1a5f7a; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #666; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">BULLETIN DE PAIE</div>
            <div class="subtitle">${payslip.period}</div>
          </div>

          <div class="section">
            <div class="section-title">Informations Employé</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nom</div>
                <div>${payslip.employeeName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Matricule</div>
                <div>${payslip.employeeId}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Département</div>
                <div>${payslip.department}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Poste</div>
                <div>${payslip.position}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Détails de la Paie</div>
            <table class="table">
              <tr>
                <th>Description</th>
                <th>Montant</th>
              </tr>
              <tr>
                <td>Salaire de base</td>
                <td>${payslip.baseSalary.toLocaleString('fr-FR')} FCFA</td>
              </tr>
              <tr>
                <td>Prime de transport</td>
                <td>${payslip.transportAllowance.toLocaleString('fr-FR')} FCFA</td>
              </tr>
              <tr>
                <td>Prime de logement</td>
                <td>${payslip.housingAllowance.toLocaleString('fr-FR')} FCFA</td>
              </tr>
              <tr>
                <td>Autres primes</td>
                <td>${payslip.otherAllowances.toLocaleString('fr-FR')} FCFA</td>
              </tr>
              <tr>
                <td>Total brut</td>
                <td>${payslip.grossSalary.toLocaleString('fr-FR')} FCFA</td>
              </tr>
            </table>

            <table class="table">
              <tr>
                <th>Déductions</th>
                <th>Montant</th>
              </tr>
              <tr>
                <td>CNSS</td>
                <td>${payslip.cnss.toLocaleString('fr-FR')} FCFA</td>
              </tr>
              <tr>
                <td>Impôt sur le revenu</td>
                <td>${payslip.incomeTax.toLocaleString('fr-FR')} FCFA</td>
              </tr>
              <tr>
                <td>Autres déductions</td>
                <td>${payslip.otherDeductions.toLocaleString('fr-FR')} FCFA</td>
              </tr>
            </table>

            <div class="total">
              Net à payer: ${payslip.netSalary.toLocaleString('fr-FR')} FCFA
            </div>
          </div>

          <div class="footer">
            <p>Ce document est généré automatiquement par PayeAfrique</p>
            <p>Date d'émission: ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </body>
      </html>
    `;

    // Créer un Blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);

    // Ouvrir le bulletin dans un nouvel onglet
    window.open(url, '_blank');
  };

  const handleViewAllDocuments = () => {
    setShowAllDocuments(true);
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      document.body.appendChild(tempContainer);

      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; background: white; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px;">
            <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #16a34a;">${document.name}</h1>
            <p style="font-size: 18px; color: #666;">PayeAfrique - ${country === 'benin' ? 'Bénin' : 'Togo'}</p>
            <p style="font-size: 14px; color: #666;">Date: ${formatDate(document.date)}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Informations</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #666; margin-bottom: 5px;">Type de document</p>
                <p style="font-weight: 500;">${document.type}</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Date d'émission</p>
                <p style="font-weight: 500;">${formatDate(document.date)}</p>
              </div>
            </div>
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

      pdf.save(`${document.name}.pdf`);
      document.body.removeChild(tempContainer);

      toast({
        title: "Succès",
        description: "Le document a été téléchargé avec succès",
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

  const handleRequestLeave = () => {
    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (days > (employee?.leaves.total || 0) - (employee?.leaves.taken || 0)) {
      toast({
        title: "Erreur",
        description: "Vous n'avez pas assez de jours de congés disponibles",
        variant: "destructive"
      });
      return;
    }

    updateLeaves({
      pending: (employee?.leaves.pending || 0) + days
    });

    addNotification({
      type: "info",
      message: `Votre demande de congés du ${formatDate(leaveRequest.startDate)} au ${formatDate(leaveRequest.endDate)} a été soumise`,
      date: new Date().toISOString(),
      read: false
    });

    setShowLeaveRequest(false);
    setLeaveRequest({
      startDate: "",
      endDate: "",
      type: "",
      comment: ""
    });

    toast({
      title: "Succès",
      description: "Votre demande de congés a été soumise",
      variant: "default"
    });
  };

  // Unifier la source des documents
  const documents = employee?.documents && employee.documents.length > 0 ? employee.documents : mockDocuments;

  // Filtrer les documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          {/* Employee Profile Card */}
          <div className="w-full md:w-64 flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-benin-green to-green-600 overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                <UserIcon className="h-12 w-12 text-white" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              
              {/* Overlay pour le changement de photo */}
              <div 
                className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 text-white" />
            </div>
            
              {/* Input caché pour le téléchargement de fichier */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            
            <h2 className="mt-4 text-xl font-bold">{employee?.name || 'Employé'}</h2>
            <p className="text-sm text-muted-foreground">{employee?.position || 'N/A'}</p>
            <Badge className="mt-2 bg-benin-green" variant="secondary">
              {employee?.department || 'N/A'}
            </Badge>
            
            <div className="w-full mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">Membre depuis:</div>
              <div className="font-medium">{employee?.hireDate ? formatDate(employee.hireDate) : 'N/A'}</div>
            </div>
            
            <Button 
              className="w-full mt-4 bg-benin-green hover:bg-benin-green/90" 
              onClick={() => navigate('/simulation/employee')}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Simuler mon salaire
            </Button>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Salary KPI */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Salaire net</CardTitle>
                  <CardDescription>Mai 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(employee?.netSalary || 0)}</div>
                  <div className="flex items-center mt-1 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500 font-medium">+5.2%</span>
                    <span className="text-muted-foreground ml-1">vs mois précédent</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Leave KPI */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Congés disponibles</CardTitle>
                  <CardDescription>À prendre avant Déc. 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employee?.leaves ? (employee.leaves.total - employee.leaves.taken) : 0} jours</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-muted-foreground">
                      {employee?.leaves.pending > 0 ? `${employee.leaves.pending} jours en attente` : 'Aucune demande en cours'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Annual Earnings KPI */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Documents</CardTitle>
                  <CardDescription>Documents récents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employee?.documents ? employee.documents.length : 0}</div>
                  <div className="flex items-center mt-1 text-xs">
                    <FileText className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-muted-foreground">
                      Dernier: {employee?.documents[0]?.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Salary Evolution Chart */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Évolution de mon salaire</CardTitle>
              <CardDescription>12 derniers mois</CardDescription>
            </div>
            <Select defaultValue="net" onValueChange={setSalaryView}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type d'affichage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net">Salaire Net</SelectItem>
                <SelectItem value="gross">Salaire Brut</SelectItem>
                <SelectItem value="both">Net et Brut</SelectItem>
                <SelectItem value="deductions">Charges et Déductions</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salaryHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Salaire net']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgNet"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Salaire net"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Documents and Leaves Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Documents Récents</CardTitle>
                  <CardDescription>
                    Vos derniers bulletins de paie et documents importants
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleViewAllDocuments}>
                  <FileText className="mr-2 h-4 w-4" />
                  Tous mes documents
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-benin-green" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-gray-500">{doc.date}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedDocument(doc);
                      setShowDocumentDetails(true);
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Leaves and Absences */}
          <Card>
            <CardHeader>
              <CardTitle>Congés et absences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium">Solde actuel</div>
                    <div className="text-2xl font-bold">{employee?.leaves ? (employee.leaves.total - employee.leaves.taken) : 0} jours</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Utilisés cette année</div>
                    <div className="text-2xl font-bold">{employee?.leaves.taken} jours</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">En attente</div>
                    <div className="text-2xl font-bold">{employee?.leaves.pending} jours</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Prochains congés planifiés</div>
                  <div className="flex items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <Calendar className="h-5 w-5 mr-3 text-green-500" />
                    <div className="flex-1">
                      <div className="font-medium">Congés annuels</div>
                      <div className="text-xs text-muted-foreground">Du 05/08/2025 au 20/08/2025 (12 jours)</div>
                    </div>
                    <Badge variant="secondary">Approuvé</Badge>
                  </div>
                </div>
                
                <Button className="w-full mt-2" onClick={() => setShowLeaveRequest(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Demander un congé
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="documents">Mes documents</TabsTrigger>
            <TabsTrigger value="salary">Détail des revenus</TabsTrigger>
            <TabsTrigger value="leaves">Congés</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Detailed Overview Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu personnel</CardTitle>
                <CardDescription>Informations clés et statistiques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Informations professionnelles</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Poste:</span>
                        <p className="font-medium">{employee?.position || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Département:</span>
                        <p className="font-medium">{employee?.department || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Manager:</span>
                        <p className="font-medium">Franck Touré</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Date d'embauche:</span>
                        <p className="font-medium">{employee?.hireDate ? formatDate(employee.hireDate) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Performance 2025</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Objectifs atteints:</span>
                        <p className="font-medium">4 sur 6</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Évaluation prévue:</span>
                        <p className="font-medium">18/06/2025</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Formations suivies:</span>
                        <p className="font-medium">2 (React Advanced, UX Design)</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Points à revoir:</span>
                        <p className="font-medium">Test unitaires, Documentation</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Projets en cours</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Refonte PayeAfrique:</span>
                        <p className="font-medium">75% complété</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Dashboard Analytics:</span>
                        <p className="font-medium">40% complété</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Prochain milestone:</span>
                        <p className="font-medium">15/06/2025</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Tâches assignées:</span>
                        <p className="font-medium">8 (5 en cours, 3 à faire)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Mes documents</CardTitle>
                    <CardDescription>
                      Consultez et téléchargez vos documents
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-[200px]"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        <SelectItem value="Bulletin">Bulletins</SelectItem>
                        <SelectItem value="Attestation">Attestations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments?.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">
                          {document.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{document.type}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(document.date)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(document);
                                setShowDocumentDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadDocument(document)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <CardTitle>Détail des revenus</CardTitle>
                    <CardDescription>Analyse complète de votre rémunération</CardDescription>
                  </div>
                  <Select defaultValue="current">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Mois en cours</SelectItem>
                      <SelectItem value="previous">Mois précédent</SelectItem>
                      <SelectItem value="year">Année en cours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Salary breakdown */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Composition du salaire - Mai 2025</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">Salaire de base</span>
                        <span className="font-bold">320 000 FCFA</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">Prime de transport</span>
                        <span className="font-bold">25 000 FCFA</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-t-2 border-green-500 bg-green-50/50 dark:bg-green-950/20">
                        <span className="font-medium">Salaire brut</span>
                        <span className="font-bold">345 000 FCFA</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <span className="font-medium">Cotisations sociales</span>
                        <span className="font-bold">-18 112 FCFA</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <span className="font-medium">Impôt sur le revenu</span>
                        <span className="font-bold">-61 888 FCFA</span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-100 dark:bg-green-950/30 rounded-lg border-t-2 border-green-500">
                        <span className="font-medium">Salaire net</span>
                        <span className="font-bold">265 000 FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Graphical representation */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Répartition graphique</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Salaire brut", value: 345000 },
                          { name: "Cotisations", value: 18112 },
                          { name: "Impôts", value: 61888 },
                          { name: "Salaire net", value: 265000 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" name="Montant" fill="#2E7D32" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Year-to-date summary */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Cumul depuis janvier 2025</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>
                        <TableHead>Salaire brut</TableHead>
                        <TableHead>Cotisations</TableHead>
                        <TableHead>Impôts</TableHead>
                        <TableHead>Salaire net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Janvier</TableCell>
                        <TableCell>340 000 FCFA</TableCell>
                        <TableCell>17 850 FCFA</TableCell>
                        <TableCell>57 150 FCFA</TableCell>
                        <TableCell>265 000 FCFA</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Février</TableCell>
                        <TableCell>340 000 FCFA</TableCell>
                        <TableCell>17 850 FCFA</TableCell>
                        <TableCell>57 150 FCFA</TableCell>
                        <TableCell>265 000 FCFA</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mars</TableCell>
                        <TableCell>340 000 FCFA</TableCell>
                        <TableCell>17 850 FCFA</TableCell>
                        <TableCell>57 150 FCFA</TableCell>
                        <TableCell>265 000 FCFA</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Avril</TableCell>
                        <TableCell>340 000 FCFA</TableCell>
                        <TableCell>17 850 FCFA</TableCell>
                        <TableCell>57 150 FCFA</TableCell>
                        <TableCell>265 000 FCFA</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mai</TableCell>
                        <TableCell>340 000 FCFA</TableCell>
                        <TableCell>17 850 FCFA</TableCell>
                        <TableCell>57 150 FCFA</TableCell>
                        <TableCell>265 000 FCFA</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold">TOTAL</TableCell>
                        <TableCell className="font-bold">1 700 000 FCFA</TableCell>
                        <TableCell className="font-bold">89 250 FCFA</TableCell>
                        <TableCell className="font-bold">285 750 FCFA</TableCell>
                        <TableCell className="font-bold">1 325 000 FCFA</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Gestion des congés</CardTitle>
                    <CardDescription>
                      Suivi et demandes d'absence
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowLeaveRequest(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Nouvelle demande
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Solde actuel</div>
                    <div className="text-2xl font-bold">{employee?.leaves ? (employee.leaves.total - employee.leaves.taken) : 0} jours</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Congés pris</div>
                    <div className="text-2xl font-bold">{employee?.leaves.taken} jours</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">En attente</div>
                    <div className="text-2xl font-bold">{employee?.leaves.pending} jours</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Acquisition mensuelle</div>
                    <div className="text-2xl font-bold">{employee?.leaves.monthly} jours</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Historique des congés</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Fin</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLeavesData.map((leave, index) => (
                        <TableRow key={index}>
                          <TableCell>{leave.type}</TableCell>
                          <TableCell>{leave.start}</TableCell>
                          <TableCell>{leave.end}</TableCell>
                          <TableCell>{leave.days} jours</TableCell>
                          <TableCell>
                            <Badge 
                              variant={leave.status === 'approved' ? 'default' : 'secondary'}
                              className={leave.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            >
                              {leave.status === 'approved' ? 'Approuvé' : 'Justifié'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Prochains jours fériés</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">Fête du Travail</div>
                        <div className="text-xs text-muted-foreground">Jour férié national</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">01/05/2025</div>
                        <div className="text-xs text-muted-foreground">Dans 10 jours</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">Fête de l'Indépendance</div>
                        <div className="text-xs text-muted-foreground">Jour férié national</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">01/08/2025</div>
                        <div className="text-xs text-muted-foreground">Dans 3 mois</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Tous les documents */}
      <Dialog open={showAllDocuments} onOpenChange={setShowAllDocuments}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tous mes documents</DialogTitle>
            <DialogDescription>
              Consultez et téléchargez tous vos documents
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Tabs defaultValue="payslips">
              <TabsList>
                <TabsTrigger value="payslips">Bulletins de paie</TabsTrigger>
                <TabsTrigger value="contracts">Contrats</TabsTrigger>
                <TabsTrigger value="certificates">Attestations</TabsTrigger>
              </TabsList>
              <TabsContent value="payslips">
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Aucun document disponible</div>
                ) : (
                <div className="space-y-4">
                    {documents.map((doc, idx) => (
                      <div key={doc.id || doc.name || idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileSpreadsheet className="h-8 w-8 text-benin-green" />
                        <div>
                            <h4 className="font-medium">{doc.name || 'Document'}</h4>
                            <p className="text-sm text-gray-500">{doc.date || ''}</p>
                        </div>
                      </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc)}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
                )}
              </TabsContent>
              <TabsContent value="contracts">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun contrat disponible</p>
                </div>
              </TabsContent>
              <TabsContent value="certificates">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucune attestation disponible</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal demande de congés */}
      <Dialog open={showLeaveRequest} onOpenChange={setShowLeaveRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle demande de congés</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour votre demande de congés
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Input 
                  type="date" 
                  value={leaveRequest.startDate}
                  onChange={(e) => setLeaveRequest(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input 
                  type="date" 
                  value={leaveRequest.endDate}
                  onChange={(e) => setLeaveRequest(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Type de congés</Label>
              <Select 
                value={leaveRequest.type}
                onValueChange={(value) => setLeaveRequest(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Congés annuels</SelectItem>
                  <SelectItem value="sick">Congé maladie</SelectItem>
                  <SelectItem value="special">Congé spécial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commentaire</Label>
              <Input 
                placeholder="Raison de votre demande..." 
                value={leaveRequest.comment}
                onChange={(e) => setLeaveRequest(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveRequest(false)}>
              Annuler
            </Button>
            <Button onClick={handleRequestLeave}>
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal détails document */}
      <Dialog open={showDocumentDetails} onOpenChange={setShowDocumentDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name || 'Document'}</DialogTitle>
            <DialogDescription>
              Détails du document
            </DialogDescription>
          </DialogHeader>
          {selectedDocument ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de document</Label>
                  <p className="font-medium">{selectedDocument.type || 'N/A'}</p>
              </div>
              <div>
                <Label>Date d'émission</Label>
                  <p className="font-medium">{selectedDocument.date ? formatDate(selectedDocument.date) : 'N/A'}</p>
              </div>
            </div>
          </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Aucun document sélectionné</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentDetails(false)}>
              Fermer
            </Button>
            <Button onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)} disabled={!selectedDocument}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal notifications */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Vos notifications récentes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {employee?.notifications && employee.notifications.length > 0 ? (
              employee.notifications.map((notification, idx) => (
              <div 
                  key={notification.id || idx}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 p-2 rounded-full ${
                      notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      notification.type === 'success' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-medium">{notification.message || 'Notification'}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                          {notification.date ? formatDate(notification.date) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      Marquer comme lu
                    </Button>
                  )}
                </div>
              </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">Aucune notification</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EmployeeDashboard;
