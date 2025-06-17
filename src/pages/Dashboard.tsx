/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Calculator,
  Calendar,
  ChartBar,
  Download,
  Eye,
  Settings,
  TrendingUp,
  User as UserIcon,
  History,
  Target,
  Award,
  Trash2,
  Share2,
  Camera,
  Wallet,
  Banknote,
  PieChart as PieChartIcon,
  Search,
  Building
} from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSimulationStore, FamilyStatus } from "@/stores/simulation.store";
import { Checkbox } from "@/components/ui/checkbox";

// Données pour les graphiques
const salaryTrendsData = [
  { month: "Jan", simulations: 3, avgNet: 245000 },
  { month: "Fév", simulations: 5, avgNet: 268000 },
  { month: "Mar", simulations: 4, avgNet: 285000 },
  { month: "Avr", simulations: 7, avgNet: 295000 },
  { month: "Mai", simulations: 6, avgNet: 315000 },
  { month: "Jun", simulations: 4, avgNet: 285000 }
];

const taxDistribution = [
  { name: "Impôt sur le revenu", value: 35, color: "#ef4444" },
  { name: "CNSS", value: 25, color: "#f97316" },
  { name: "Autres taxes", value: 15, color: "#f59e0b" },
  { name: "Salaire net", value: 25, color: "#10b981" }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { simulations: simulationHistory, removeSimulation, clearOldSimulations } = useSimulationStore();
  const [selectedSimulation, setSelectedSimulation] = useState<any>(null);
  const [showSimulationDetails, setShowSimulationDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [defaultCountry, setDefaultCountry] = useState(country);
  const [defaultFamilyStatus, setDefaultFamilyStatus] = useState<FamilyStatus>("single");
  const [autoSave, setAutoSave] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les préférences et l'image de profil
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setDefaultCountry(preferences.defaultCountry || country);
      setDefaultFamilyStatus(preferences.defaultFamilyStatus || "single");
      setAutoSave(preferences.autoSave ?? true);
    }

    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }

    clearOldSimulations();
  }, [country, clearOldSimulations, user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrer les simulations
  const filteredSimulations = simulationHistory.filter(sim => {
    const matchesSearch = sim.salaireBrut.toString().includes(searchTerm) ||
      sim.salaireNet.toString().includes(searchTerm);
    const matchesCountry = filterCountry === "all" || sim.country === filterCountry;
    const matchesType = filterType === "all" || sim.type === filterType;

    return matchesSearch && matchesCountry && matchesType;
  });

  // Statistiques calculées
  const totalSimulations = simulationHistory.length;
  const avgSalaireBrut = totalSimulations > 0
    ? Math.round(simulationHistory.reduce((sum, sim) => sum + sim.salaireBrut, 0) / totalSimulations)
    : 0;
  const avgSalaireNet = totalSimulations > 0
    ? Math.round(simulationHistory.reduce((sum, sim) => sum + sim.salaireNet, 0) / totalSimulations)
    : 0;
  const savedSimulations = simulationHistory.filter(sim => sim.saved).length;

  const handleViewSimulation = (simulation: any) => {
    setSelectedSimulation(simulation);
    setShowSimulationDetails(true);
  };

  const handleDownloadPDF = async (simulation: any) => {
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
            <p style="font-size: 18px; color: #666;">PayeAfrique - ${simulation.country === 'benin' ? 'Bénin' : 'Togo'}</p>
            <p style="font-size: 14px; color: #666;">Date de simulation : ${formatDate(simulation.date)}</p>
          </div>

          <div style="margin-bottom: 30px; background: #f8f8f8; padding: 20px; border-radius: 8px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Paramètres de la simulation</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #666; margin-bottom: 5px;">Type de simulation</p>
                <p style="font-weight: 500;">${simulation.type}</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Pays</p>
                <p style="font-weight: 500;">${simulation.country === 'benin' ? 'Bénin' : 'Togo'}</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Situation familiale</p>
                <p style="font-weight: 500;">${simulation.familyStatus === 'single' ? 'Célibataire' :
          simulation.familyStatus === 'married' ? 'Marié(e)' :
            simulation.familyStatus === 'divorced' ? 'Divorcé(e)' : 'Veuf/Veuve'}</p>
              </div>
              <div>
                <p style="color: #666; margin-bottom: 5px;">Nombre d'enfants</p>
                <p style="font-weight: 500;">${simulation.children}</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #16a34a;">Résultats de la simulation</h2>
            <div style="border: 1px solid #eee; border-radius: 8px;">
              <div style="border-bottom: 1px solid #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>Salaire brut mensuel</span>
                <span style="font-weight: 500;">${formatCurrency(simulation.salaireBrut)}</span>
              </div>
              <div style="padding: 12px; background: #f0fdf4; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Salaire net mensuel</span>
                <span style="font-weight: bold; color: #16a34a;">${formatCurrency(simulation.salaireNet)}</span>
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

      pdf.save(`simulation-${simulation.id}-${simulation.date}.pdf`);
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

  const handleDeleteSimulation = (id: number) => {
    removeSimulation(id);
    toast({
      title: "Simulation supprimée",
      description: "La simulation a été supprimée de votre historique",
      variant: "default"
    });
  };

  const handleShareSimulation = async (simulation: any) => {
    const shareData = {
      title: 'Simulation de Salaire PayeAfrique',
      text: `Voici ma simulation de salaire sur PayeAfrique :
Type: ${simulation.type}
Pays: ${simulation.country === 'benin' ? 'Bénin' : 'Togo'}
Salaire brut: ${formatCurrency(simulation.salaireBrut)}
Salaire net: ${formatCurrency(simulation.salaireNet)}`,
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);

        if (user) {
          updateUser({
            ...user,
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
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête du dashboard */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          {/* Profil utilisateur */}
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

              <div
                className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 text-white" />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <h2 className="mt-4 text-xl font-bold">{user?.name || "Utilisateur"}</h2>
            <p className="text-sm text-muted-foreground">Particulier</p>
            <Badge className="mt-2 bg-benin-green" variant="secondary">
              {user?.country || (country === 'benin' ? 'Bénin' : 'Togo')}
            </Badge>

            <div className="w-full mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium truncate">{user?.email || "Non renseigné"}</div>
            </div>

            {user?.phone && (
              <div className="w-full mt-2">
                <div className="text-sm text-muted-foreground">Téléphone</div>
                <div className="font-medium">{user.phone}</div>
              </div>
            )}

            <Button
              className="w-full mt-4 bg-benin-green hover:bg-benin-green/90"
              onClick={() => navigate('/simulationparticulier')}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Nouvelle simulation
            </Button>
          </div>

          {/* Zone principale */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6">Mon Tableau de Bord</h1>

            {/* Message de bienvenue */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h2 className="text-xl font-semibold">
                Bienvenue, {user?.firstName || user?.name || 'Cher client'} !
              </h2>
              <p className="text-muted-foreground">
                Suivez vos simulations de salaires et optimisez vos revenus
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total simulations</CardTitle>
                  <CardDescription>Depuis votre inscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-benin-green">{totalSimulations}</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Calculator className="h-3 w-3 mr-1 text-blue-500" />
                    <span className="text-muted-foreground">{savedSimulations} sauvegardées</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Salaire brut moyen</CardTitle>
                  <CardDescription>Toutes simulations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(avgSalaireBrut)}</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Wallet className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500 font-medium">Stable</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Salaire net moyen</CardTitle>
                  <CardDescription>Toutes simulations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(avgSalaireNet)}</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Banknote className="h-3 w-3 mr-1 text-blue-500" />
                    <span className="text-muted-foreground">Objectif atteint</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution des simulations */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution de vos simulations</CardTitle>
              <CardDescription>6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salaryTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'simulations' ? value : formatCurrency(value),
                        name === 'simulations' ? 'Simulations' : 'Salaire net moyen'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="simulations" fill="#16a34a" name="Simulations" />
                    <Line
                      type="monotone"
                      dataKey="avgNet"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Salaire net moyen"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition des taxes */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des taxes</CardTitle>
              <CardDescription>Analyse de vos prélèvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taxDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taxDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Pourcentage"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <ChartBar className="mr-2 h-4 w-4" />
              Analyses
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Onglet Historique */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Historique des simulations</CardTitle>
                    <CardDescription>
                      Consultez et gérez toutes vos simulations passées
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
                    <Select value={filterCountry} onValueChange={setFilterCountry}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="benin">Bénin</SelectItem>
                        <SelectItem value="togo">Togo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        <SelectItem value="Brut → Net">Brut → Net</SelectItem>
                        <SelectItem value="Net → Brut">Net → Brut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Salaire brut</TableHead>
                      <TableHead>Salaire net</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSimulations.map((simulation) => (
                      <TableRow key={simulation.id}>
                        <TableCell className="font-medium">
                          {formatDate(simulation.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{simulation.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={simulation.country === 'benin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {simulation.country === 'benin' ? 'Bénin' : 'Togo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(simulation.salaireBrut)}</TableCell>
                        <TableCell className="font-medium text-benin-green">
                          {formatCurrency(simulation.salaireNet)}
                        </TableCell>
                        <TableCell>
                          {simulation.saved ? (
                            <Badge className="bg-green-100 text-green-800">Sauvegardée</Badge>
                          ) : (
                            <Badge variant="secondary">Temporaire</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSimulation(simulation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(simulation)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSimulation(simulation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

          {/* Onglet Analyses */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse comparative</CardTitle>
                  <CardDescription>Comparaison Bénin vs Togo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <span className="font-medium">Simulations Bénin</span>
                      <div className="text-right">
                        <span className="font-bold block">
                          {simulationHistory.filter(s => s.country === 'benin').length}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(
                            simulationHistory
                              .filter(s => s.country === 'benin')
                              .reduce((sum, s) => sum + s.salaireNet, 0) /
                            (simulationHistory.filter(s => s.country === 'benin').length || 1)
                          )} net moyen
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <span className="font-medium">Simulations Togo</span>
                      <div className="text-right">
                        <span className="font-bold block">
                          {simulationHistory.filter(s => s.country === 'togo').length}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(
                            simulationHistory
                              .filter(s => s.country === 'togo')
                              .reduce((sum, s) => sum + s.salaireNet, 0) /
                            (simulationHistory.filter(s => s.country === 'togo').length || 1)
                          )} net moyen
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium">Écart moyen net</span>
                      <div className="text-right">
                        <span className="font-bold block">
                          {formatCurrency(Math.abs(
                            (simulationHistory
                              .filter(s => s.country === 'benin')
                              .reduce((sum, s) => sum + s.salaireNet, 0) /
                              (simulationHistory.filter(s => s.country === 'benin').length || 1)) -
                            (simulationHistory
                              .filter(s => s.country === 'togo')
                              .reduce((sum, s) => sum + s.salaireNet, 0) /
                              (simulationHistory.filter(s => s.country === 'togo').length || 1))
                          ))}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Différence entre les deux pays
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommandations</CardTitle>
                  <CardDescription>Basées sur vos simulations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Award className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Optimisation fiscale</p>
                        <p className="text-xs text-muted-foreground">
                          {simulationHistory.some(s => s.children > 0)
                            ? "Vous bénéficiez déjà d'avantages familiaux"
                            : "Considérez les avantages familiaux pour réduire vos impôts"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Target className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Négociation salariale</p>
                        <p className="text-xs text-muted-foreground">
                          {avgSalaireNet > 300000
                            ? "Votre profil suggère un potentiel d'augmentation"
                            : "Considérez une négociation salariale basée sur vos simulations"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <Building className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Comparaison régionale</p>
                        <p className="text-xs text-muted-foreground">
                          {simulationHistory.some(s => s.country === 'benin') && simulationHistory.some(s => s.country === 'togo')
                            ? "Vous avez exploré les deux pays, comparez les résultats"
                            : "Explorez les opportunités dans les deux pays"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de simulation</CardTitle>
                <CardDescription>Configurez vos paramètres par défaut</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pays par défaut</Label>
                    <Select
                      value={defaultCountry}
                      onValueChange={(value: 'benin' | 'togo') => setDefaultCountry(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="benin">Bénin</SelectItem>
                        <SelectItem value="togo">Togo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Situation familiale</Label>
                    <Select
                      value={defaultFamilyStatus}
                      onValueChange={(value: FamilyStatus) => setDefaultFamilyStatus(value)}
                    >
                      <SelectTrigger>
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
                </div>
                <div>
                  <Label>Sauvegarde automatique</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="auto-save"
                      checked={autoSave}
                      onCheckedChange={(checked) => setAutoSave(checked === true)}
                    />
                    <Label htmlFor="auto-save" className="text-sm">
                      Sauvegarder automatiquement mes simulations
                    </Label>
                  </div>
                </div>
                <Button
                  className="bg-benin-green hover:bg-benin-green/90"
                  onClick={() => {
                    // Sauvegarder les préférences dans le localStorage
                    localStorage.setItem('userPreferences', JSON.stringify({
                      defaultCountry,
                      defaultFamilyStatus,
                      autoSave
                    }));

                    toast({
                      title: "Préférences sauvegardées",
                      description: "Vos préférences ont été mises à jour avec succès",
                      variant: "default"
                    });
                  }}
                >
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal détails simulation */}
        <Dialog open={showSimulationDetails} onOpenChange={setShowSimulationDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la simulation</DialogTitle>
              <DialogDescription>
                Simulation du {selectedSimulation && formatDate(selectedSimulation.date)}
              </DialogDescription>
            </DialogHeader>
            {selectedSimulation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type de simulation</Label>
                    <p className="font-medium">{selectedSimulation.type}</p>
                  </div>
                  <div>
                    <Label>Pays</Label>
                    <p className="font-medium">
                      {selectedSimulation.country === 'benin' ? 'Bénin' : 'Togo'}
                    </p>
                  </div>
                  <div>
                    <Label>Situation familiale</Label>
                    <p className="font-medium">
                      {selectedSimulation.familyStatus === 'single' ? 'Célibataire' :
                        selectedSimulation.familyStatus === 'married' ? 'Marié(e)' :
                          selectedSimulation.familyStatus === 'divorced' ? 'Divorcé(e)' : 'Veuf/Veuve'}
                    </p>
                  </div>
                  <div>
                    <Label>Enfants à charge</Label>
                    <p className="font-medium">{selectedSimulation.children}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Label>Salaire brut</Label>
                      <p className="text-xl font-bold">{formatCurrency(selectedSimulation.salaireBrut)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Label>Salaire net</Label>
                      <p className="text-xl font-bold text-benin-green">
                        {formatCurrency(selectedSimulation.salaireNet)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownloadPDF(selectedSimulation)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShareSimulation(selectedSimulation)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Dashboard;