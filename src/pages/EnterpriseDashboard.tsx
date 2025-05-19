
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, ChartPie, FileText, Users, Search, Plus, Filter } from "lucide-react";
import { useCountry } from "@/hooks/use-country";
import { Link } from "react-router-dom";

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
  
  const totalEmployees = mockDepartmentData.reduce((acc, dept) => acc + dept.employees, 0);
  const totalMassSalary = mockDepartmentData.reduce((acc, dept) => acc + dept.totalSalary, 0);
  const avgSalary = Math.round(totalMassSalary / totalEmployees);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord Entreprise</h1>
            <p className="text-muted-foreground">
              Gestion des employés et de la masse salariale
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-sm font-medium mr-2">Pays:</span>
            <span className="font-bold capitalize">{country}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Effectif total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Employés actifs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Masse salariale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMassSalary.toLocaleString()} {currencySymbol}</div>
              <p className="text-xs text-muted-foreground">
                Mensuelle totale
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ChartPie className="h-5 w-5" />
                Salaire moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgSalary.toLocaleString()} {currencySymbol}</div>
              <p className="text-xs text-muted-foreground">
                Par employé
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Prochaine échéance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15 Juin</div>
              <p className="text-xs text-muted-foreground">
                Déclarations sociales
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="departments">Départements</TabsTrigger>
            <TabsTrigger value="employees">Employés</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
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
                      <BarChart data={mockDepartmentData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="department" />
                        <YAxis yAxisId="left" orientation="left" stroke="#1976D2" />
                        <YAxis yAxisId="right" orientation="right" stroke="#2E7D32" />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                        />
                        <Bar yAxisId="left" dataKey="employees" fill="var(--color-employees, #1976D2)" name="Employés" />
                        <Bar yAxisId="right" dataKey="totalSalary" fill="var(--color-totalSalary, #2E7D32)" name="Masse Salariale" />
                      </BarChart>
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
                <Button size="sm" variant="outline">
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
                    <input 
                      type="text" 
                      placeholder="Rechercher..." 
                      className="pl-8 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                          <Link 
                            to={`/employees/${employee.id}`} 
                            className="text-blue-500 hover:underline"
                          >
                            Voir détails
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rapport</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Dernière mise à jour</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Bilan Social</TableCell>
                      <TableCell>Rapport complet sur la situation sociale de l'entreprise</TableCell>
                      <TableCell>01/05/2025</TableCell>
                      <TableCell className="text-blue-500 hover:underline cursor-pointer">Télécharger</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Analyse Salariale</TableCell>
                      <TableCell>Étude comparative des salaires par poste et ancienneté</TableCell>
                      <TableCell>15/04/2025</TableCell>
                      <TableCell className="text-blue-500 hover:underline cursor-pointer">Télécharger</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Prévisions Budgétaires</TableCell>
                      <TableCell>Projections financières pour les charges salariales</TableCell>
                      <TableCell>30/04/2025</TableCell>
                      <TableCell className="text-blue-500 hover:underline cursor-pointer">Télécharger</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Indicateurs RH</TableCell>
                      <TableCell>Principaux KPIs ressources humaines</TableCell>
                      <TableCell>01/05/2025</TableCell>
                      <TableCell className="text-blue-500 hover:underline cursor-pointer">Télécharger</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EnterpriseDashboard;
