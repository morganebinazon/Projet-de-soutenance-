import React, { useState } from "react";
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
  ChevronUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

// Sample data for the dashboard
const salaryHistoryData = [
  { month: "Jun 24", salary: 220000 },
  { month: "Jul 24", salary: 220000 },
  { month: "Aug 24", salary: 220000 },
  { month: "Sep 24", salary: 220000 },
  { month: "Oct 24", salary: 250000, event: "Augmentation" },
  { month: "Nov 24", salary: 250000 },
  { month: "Dec 24", salary: 270000, event: "Prime" },
  { month: "Jan 25", salary: 250000 },
  { month: "Feb 25", salary: 250000 },
  { month: "Mar 25", salary: 265000, event: "Augmentation" },
  { month: "Apr 25", salary: 265000 },
  { month: "May 25", salary: 265000 }
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
  const [salaryView, setSalaryView] = useState<string>("net");
  const currencySymbol = "FCFA";
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
  // Format currency for display
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, ''), 10) : value;
    return `${numValue.toLocaleString()} ${currencySymbol}`;
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          {/* Employee Profile Card */}
          <div className="w-full md:w-64 flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            
            <h2 className="mt-4 text-xl font-bold">Simon Adoko</h2>
            <p className="text-sm text-muted-foreground">Développeur Front-end</p>
            <Badge className="mt-2" variant="outline">Tech</Badge>
            
            <div className="w-full mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">Chez TechnoBénin depuis:</div>
              <div className="font-medium">2 ans et 4 mois</div>
            </div>
            
            <Button className="w-full mt-4" onClick={() => navigate('/simulation/employee')}>
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
                  <div className="text-2xl font-bold">265 000 FCFA</div>
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
                  <div className="text-2xl font-bold">14 jours</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-muted-foreground">Prochains congés: Août</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Annual Earnings KPI */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Cumul annuel</CardTitle>
                  <CardDescription>Jan - Mai 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1 295 000 FCFA</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Target className="h-3 w-3 mr-1 text-blue-500" />
                    <span className="text-blue-500 font-medium">43%</span>
                    <span className="text-muted-foreground ml-1">de l'objectif annuel</span>
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
                    formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Salaire Net']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <ReferenceLine x="Oct 24" stroke="#FF8042" label={{ position: 'top', value: 'Augmentation', fill: '#FF8042' }} />
                  <ReferenceLine x="Dec 24" stroke="#FFBB28" label={{ position: 'top', value: 'Prime', fill: '#FFBB28' }} />
                  <ReferenceLine x="Mar 25" stroke="#FF8042" label={{ position: 'top', value: 'Augmentation', fill: '#FF8042' }} />
                  <Line
                    type="monotone"
                    dataKey="salary"
                    stroke="#2E7D32"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
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
                {mockDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-benin-green" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-gray-500">{doc.date}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPayslip(doc)}>
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
                    <div className="text-2xl font-bold">14 jours</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Utilisés cette année</div>
                    <div className="text-2xl font-bold">10 jours</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">En attente</div>
                    <div className="text-2xl font-bold">0</div>
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
                
                <Button className="w-full mt-2">
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
                        <p className="font-medium">Développeur Front-end</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Département:</span>
                        <p className="font-medium">Technique</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Manager:</span>
                        <p className="font-medium">Franck Touré</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Date d'embauche:</span>
                        <p className="font-medium">15/01/2023</p>
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
            <Tabs defaultValue="payslips">
              <TabsList>
                <TabsTrigger value="payslips">Bulletins de paie</TabsTrigger>
                <TabsTrigger value="certificates">Attestations</TabsTrigger>
                <TabsTrigger value="contracts">Contrats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payslips" className="pt-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle>Bulletins de paie</CardTitle>
                        <CardDescription>
                          Historique de vos bulletins de salaire
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Select defaultValue="2025">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Année" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Tout télécharger
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Mai', 'Avril', 'Mars', 'Février', 'Janvier', 'Décembre', 'Novembre', 'Octobre'].map((month, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">{month}</h3>
                              <p className="text-xs text-muted-foreground">2025</p>
                            </div>
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            Émis le 28/{month === 'Janvier' ? '01' : month === 'Février' ? '02' : month === 'Mars' ? '03' : month === 'Avril' ? '04' : '05'}/2025
                          </div>
                          <div className="flex justify-between">
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Download className="h-3 w-3 mr-1" />
                              Télécharger
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="certificates" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Attestations et certificats</CardTitle>
                    <CardDescription>
                      Documents administratifs liés à votre emploi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Date d'émission</TableHead>
                          <TableHead>Validité</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Attestation de travail</TableCell>
                          <TableCell>15/03/2025</TableCell>
                          <TableCell>Permanente</TableCell>
                          <TableCell>PDF</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Attestation fiscale 2024</TableCell>
                          <TableCell>15/01/2025</TableCell>
                          <TableCell>31/12/2025</TableCell>
                          <TableCell>PDF</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Certificat de formation React</TableCell>
                          <TableCell>05/04/2025</TableCell>
                          <TableCell>Permanente</TableCell>
                          <TableCell>PDF</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contracts" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contrats et avenants</CardTitle>
                    <CardDescription>
                      Documents contractuels de votre emploi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Date de signature</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Contrat de travail initial</TableCell>
                          <TableCell>15/01/2023</TableCell>
                          <TableCell>CDI</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Avenant - Promotion</TableCell>
                          <TableCell>01/10/2024</TableCell>
                          <TableCell>Modification</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Avenant - Augmentation</TableCell>
                          <TableCell>01/03/2025</TableCell>
                          <TableCell>Modification</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
                    <CardDescription>Suivi et demandes d'absence</CardDescription>
                  </div>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Nouvelle demande
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Solde actuel</div>
                    <div className="text-2xl font-bold">14 jours</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Congés pris</div>
                    <div className="text-2xl font-bold">10 jours</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">En attente</div>
                    <div className="text-2xl font-bold">0 jours</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Acquisition mensuelle</div>
                    <div className="text-2xl font-bold">2 jours</div>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLeavesData.map((leave, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{leave.type}</TableCell>
                          <TableCell>{leave.start}</TableCell>
                          <TableCell>{leave.end}</TableCell>
                          <TableCell>{leave.days} jours</TableCell>
                          <TableCell>
                            <Badge 
                              variant={leave.status === "approved" ? "secondary" : "outline"}
                            >
                              {leave.status === "approved" ? "Approuvé" : "Justifié"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
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
                <div className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileSpreadsheet className="h-8 w-8 text-benin-green" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-500">{doc.date}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPayslip(doc)}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
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
    </Layout>
  );
};

export default EmployeeDashboard;
