
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChartPie, FileText, Users, Search, Plus, Filter, TrendingUp, ArrowUpDown, Building, Briefcase, 
  ChevronDown, ChevronUp, BarChart, ArrowRight, FileSpreadsheet, Settings } from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock data
const mockDepartmentData = [
  { department: "Administratif", employees: 4, avgSalary: 520000, totalSalary: 2080000 },
  { department: "Commercial", employees: 6, avgSalary: 480000, totalSalary: 2880000 },
  { department: "Technique", employees: 8, avgSalary: 620000, totalSalary: 4960000 },
  { department: "Direction", employees: 2, avgSalary: 950000, totalSalary: 1900000 },
];

const mockEmployeeData = [
  { id: 1, name: "Jean Dupont", department: "Technique", position: "Développeur Senior", salary: 700000 },
  { id: 2, name: "Marie Koné", department: "Commercial", position: "Responsable Ventes", salary: 650000 },
  { id: 3, name: "Robert Mensah", department: "Administratif", position: "Comptable", salary: 550000 },
  { id: 4, name: "Sophie Bello", department: "Technique", position: "Designer UI/UX", salary: 580000 },
  { id: 5, name: "Franck Touré", department: "Direction", position: "Directeur Général", salary: 1200000 },
];

const monthlySalaryData = [
  { month: "Jan", salary: 10800000 },
  { month: "Fév", salary: 10800000 },
  { month: "Mar", salary: 11200000 },
  { month: "Avr", salary: 11200000 },
  { month: "Mai", salary: 11520000 },
  { month: "Juin", salary: 11520000 },
  { month: "Juil", salary: 11520000 },
  { month: "Août", salary: 11820000 },
  { month: "Sep", salary: 11820000 },
  { month: "Oct", salary: 11820000 },
  { month: "Nov", salary: 11820000 },
  { month: "Déc", salary: 11820000 },
];

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

const pieChartData = mockDepartmentData.map(item => ({
  name: item.department,
  value: item.totalSalary
}));

const EnterpriseDashboard = () => {
  const { country } = useCountry();
  const currencySymbol = country === "benin" ? "FCFA" : "FCFA";
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  
  const totalEmployees = mockDepartmentData.reduce((acc, dept) => acc + dept.employees, 0);
  const totalMassSalary = mockDepartmentData.reduce((acc, dept) => acc + dept.totalSalary, 0);
  const avgSalary = Math.round(totalMassSalary / totalEmployees);
  const employerCharges = totalMassSalary * 0.174;
  const employeeCharges = totalMassSalary * 0.036;
  const chargeRatio = ((employerCharges + employeeCharges) / totalMassSalary * 100).toFixed(1);

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
                  <h1 className="text-2xl font-bold">Technoplus Bénin SARL</h1>
                  <p className="text-sm text-muted-foreground">
                    Service RH & Paie • Pays: <span className="font-medium capitalize">{country}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
                <div className="text-2xl font-bold">{totalMassSalary.toLocaleString()} {currencySymbol}</div>
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
                  {mockDepartmentData.map((dept, idx) => (
                    <div 
                      key={idx} 
                      className="bg-indigo-500 h-2 rounded-full" 
                      style={{
                        opacity: 0.6 + (idx * 0.1),
                        width: `${(dept.employees / totalEmployees) * 100}%`
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
                <div className="text-2xl font-bold">{avgSalary.toLocaleString()} {currencySymbol}</div>
                <p className="text-xs flex justify-between items-center">
                  <span className="text-muted-foreground">Par employé</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                    +8% vs secteur
                  </Badge>
                </p>
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
                <div className="text-2xl font-bold">{(employerCharges + employeeCharges).toLocaleString()} {currencySymbol}</div>
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Totales</span>
                </div>
                <div className="flex h-2 mt-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{width: `${(employerCharges / (employerCharges + employeeCharges)) * 100}%`}}></div>
                  <div className="bg-emerald-400 h-full" style={{width: `${(employeeCharges / (employerCharges + employeeCharges)) * 100}%`}}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Employeur: {Math.round(employerCharges).toLocaleString()}</span>
                  <span>Employé: {Math.round(employeeCharges).toLocaleString()}</span>
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
                  <LineChart data={monthlySalaryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`}/>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
                    <Line 
                      type="monotone" 
                      dataKey="salary" 
                      stroke="#2E7D32" 
                      strokeWidth={3}
                      dot={{ stroke: '#2E7D32', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ r: 6 }}
                    />
                    {/* Event points */}
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="transparent"
                      strokeWidth={0}
                      dot={({ cx, cy, payload }) => {
                        if (payload.event) {
                          return (
                            <circle cx={cx} cy={cy-20} r={6} fill="#f44336" stroke="white" strokeWidth={1} />
                          );
                        }
                        return null;
                      }}
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
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => `${value.toLocaleString()} ${currencySymbol}`} />
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
                        <RechartsBarChart data={mockDepartmentData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="department" />
                          <YAxis yAxisId="left" orientation="left" stroke="#1976D2" />
                          <YAxis yAxisId="right" orientation="right" stroke="#2E7D32" />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                          />
                          <Bar yAxisId="left" dataKey="employees" fill="var(--color-employees, #1976D2)" name="Employés" />
                          <Bar yAxisId="right" dataKey="totalSalary" fill="var(--color-totalSalary, #2E7D32)" name="Masse Salariale" />
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
                  <Button size="sm">
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
                        <TableHead>Salaire moyen</TableHead>
                        <TableHead>Masse salariale</TableHead>
                        <TableHead>% du Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDepartmentData.map((dept, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell>{dept.employees}</TableCell>
                          <TableCell>{dept.avgSalary.toLocaleString()} {currencySymbol}</TableCell>
                          <TableCell>{dept.totalSalary.toLocaleString()} {currencySymbol}</TableCell>
                          <TableCell>{Math.round((dept.totalSalary / totalMassSalary) * 100)}%</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Liste des employés</CardTitle>
                    <CardDescription>
                      Gestion et suivi du personnel
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="pl-8 h-9"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtres
                    </Button>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Département</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Salaire</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEmployeeData.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.salary.toLocaleString()} {currencySymbol}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">Détails</Button>
                              <Button variant="outline" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                  <div className="text-sm text-muted-foreground">
                    Affichage de <strong>1-5</strong> sur <strong>20</strong> employés
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>Précédent</Button>
                    <Button variant="outline" size="sm">Suivant</Button>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Analyses RH</CardTitle>
                    <CardDescription>
                      Indicateurs et métriques des ressources humaines
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Taux de rotation</h3>
                          <Badge variant={4.5 < 5 ? "success" : "destructive"}>4.5%</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Derniers 12 mois
                        </div>
                        <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: '45%' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Ancienneté moyenne</h3>
                          <span className="font-medium">3.2 ans</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          +0.5 an vs année précédente
                        </div>
                        <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: '65%' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Ratio hommes/femmes</h3>
                          <span className="font-medium">58% / 42%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Objectif parité: 50% / 50%
                        </div>
                        <div className="flex h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: '58%' }}></div>
                          <div className="bg-pink-500 h-full" style={{ width: '42%' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline">
                      <ChartPie className="mr-2 h-4 w-4" />
                      Voir plus d'analyses RH
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports disponibles</CardTitle>
                  <CardDescription>
                    Analyses et statistiques de l'entreprise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer">
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
                    
                    <Card className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer">
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
                    
                    <Card className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer">
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
                    
                    <Card className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer">
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
                    
                    <Card className="border-2 border-dashed hover:border-primary/50 transition-colors group cursor-pointer">
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
                <CardHeader>
                  <CardTitle>Calendrier des échéances</CardTitle>
                  <CardDescription>
                    Déclarations et paiements à effectuer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Échéance</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">15 Juin 2025</TableCell>
                        <TableCell>CNSS</TableCell>
                        <TableCell>Déclaration et paiement mensuel</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">À venir</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Préparer
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">20 Juin 2025</TableCell>
                        <TableCell>IPTS / IRPP</TableCell>
                        <TableCell>Déclaration et versement mensuel</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">À venir</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Préparer
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">15 Mai 2025</TableCell>
                        <TableCell>CNSS</TableCell>
                        <TableCell>Déclaration et paiement mensuel</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Effectué</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Voir détail
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Raison sociale</Label>
                            <div className="font-medium">Technoplus Bénin SARL</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Forme juridique</Label>
                            <div className="font-medium">SARL</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">RCCM</Label>
                            <div className="font-medium">RB/COT/18/A/2563</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">IFU</Label>
                            <div className="font-medium">3201865430</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Date création</Label>
                            <div className="font-medium">15/03/2018</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Secteur d'activité</Label>
                            <div className="font-medium">Technologie et Services</div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4">
                        Modifier les informations
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Logo et identité visuelle</h3>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                          <Building className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            Changer le logo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Paramètres de paie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="payroll-cycle">Cycle de paie</Label>
                        <Select defaultValue="monthly">
                          <SelectTrigger id="payroll-cycle">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Mensuel</SelectItem>
                            <SelectItem value="biweekly">Bimensuel</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pay-day">Jour de paie</Label>
                        <Select defaultValue="25">
                          <SelectTrigger id="pay-day">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last">Dernier jour du mois</SelectItem>
                            <SelectItem value="25">25ème jour du mois</SelectItem>
                            <SelectItem value="30">30ème jour du mois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tax-id">Numéro d'employeur CNSS</Label>
                        <Input id="tax-id" placeholder="12345-ABC" value="33562-B" />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="mb-2 block">Déclarations automatiques</Label>
                        <div className="flex items-center">
                          <Input 
                            type="checkbox" 
                            id="auto-declare" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                          />
                          <Label htmlFor="auto-declare" className="ml-2">
                            Activer la préparation automatique des déclarations sociales et fiscales
                          </Label>
                        </div>
                      </div>
                    </div>
                    <Button className="mt-4">
                      Enregistrer les paramètres
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default EnterpriseDashboard;
