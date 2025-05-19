
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { CalendarDays, ChartBar, FileText } from "lucide-react";
import { useCountry } from "@/hooks/use-country";

const mockSimulationData = [
  { month: "Jan", netSalary: 250000, grossSalary: 320000 },
  { month: "Feb", netSalary: 250000, grossSalary: 320000 },
  { month: "Mar", netSalary: 265000, grossSalary: 340000 },
  { month: "Apr", netSalary: 265000, grossSalary: 340000 },
  { month: "May", netSalary: 265000, grossSalary: 340000 },
  { month: "Jun", netSalary: 280000, grossSalary: 360000 },
];

const chartConfig = {
  netSalary: {
    label: "Salaire Net",
    color: "#2E7D32",
  },
  grossSalary: {
    label: "Salaire Brut",
    color: "#1976D2",
  },
};

const EmployeeDashboard = () => {
  const { country } = useCountry();
  const currencySymbol = country === "benin" ? "FCFA" : "FCFA";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue sur votre espace personnel PayeAfrique
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-sm font-medium mr-2">Pays:</span>
            <span className="font-bold capitalize">{country}</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="simulations">Simulations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Dernière simulation
                  </CardTitle>
                  <CardDescription>Juin 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockSimulationData[5].netSalary.toLocaleString()} {currencySymbol}</div>
                  <p className="text-xs text-muted-foreground">
                    Salaire net mensuel
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChartBar className="h-5 w-5" />
                    Ratio Net/Brut
                  </CardTitle>
                  <CardDescription>Moyenne sur 6 mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">
                    Part du salaire net sur le brut
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents disponibles
                  </CardTitle>
                  <CardDescription>Bulletins et attestations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">
                    Fichiers accessibles
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Évolution salariale</CardTitle>
                <CardDescription>
                  Comparaison des salaires nets et bruts sur les 6 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={mockSimulationData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Bar dataKey="netSalary" fill="var(--color-netSalary, #2E7D32)" name="Salaire Net" />
                      <Bar dataKey="grossSalary" fill="var(--color-grossSalary, #1976D2)" name="Salaire Brut" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dernières notifications</CardTitle>
                <CardDescription>
                  Mises à jour et changements récents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                    <div>
                      <h4 className="font-medium">Mise à jour des barèmes fiscaux</h4>
                      <p className="text-sm text-muted-foreground">
                        Les nouveaux barèmes fiscaux pour {country === "benin" ? "le Bénin" : "le Togo"} sont désormais disponibles.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Il y a 2 jours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                    <div>
                      <h4 className="font-medium">Nouvelle simulation disponible</h4>
                      <p className="text-sm text-muted-foreground">
                        Votre simulation pour le mois de Juin a été générée.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Il y a 1 semaine</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des simulations</CardTitle>
                <CardDescription>
                  Liste de vos simulations récentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Salaire Brut</TableHead>
                      <TableHead>Charges</TableHead>
                      <TableHead>Salaire Net</TableHead>
                      <TableHead>Ratio Net/Brut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSimulationData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.month} 2025</TableCell>
                        <TableCell>{item.grossSalary.toLocaleString()} {currencySymbol}</TableCell>
                        <TableCell>{(item.grossSalary - item.netSalary).toLocaleString()} {currencySymbol}</TableCell>
                        <TableCell>{item.netSalary.toLocaleString()} {currencySymbol}</TableCell>
                        <TableCell>{Math.round((item.netSalary / item.grossSalary) * 100)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents disponibles</CardTitle>
                <CardDescription>
                  Bulletins de paie et attestations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(6)].map((_, index) => {
                      const month = mockSimulationData[5 - index].month;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">Bulletin de paie {month} 2025</TableCell>
                          <TableCell>PDF</TableCell>
                          <TableCell>01/{month}/2025</TableCell>
                          <TableCell>125 KB</TableCell>
                          <TableCell className="text-blue-500 hover:underline cursor-pointer">Télécharger</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell className="font-medium">Attestation fiscale 2024</TableCell>
                      <TableCell>PDF</TableCell>
                      <TableCell>15/Jan/2025</TableCell>
                      <TableCell>250 KB</TableCell>
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

export default EmployeeDashboard;
