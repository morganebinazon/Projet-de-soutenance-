
import { useState } from "react";
import { Search, Book, FileText } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCountry } from "@/hooks/use-country";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  country: string[];
  type: "article" | "video" | "document";
  date: string;
}

const resourcesData: Resource[] = [
  {
    id: "1",
    title: "Guide complet des cotisations sociales au Bénin",
    description: "Présentation détaillée des différentes cotisations sociales pour les employeurs et employés au Bénin.",
    category: "législation",
    country: ["benin"],
    type: "article",
    date: "2025-04-15",
  },
  {
    id: "2",
    title: "Calcul de l'IRPP au Togo - Barème 2025",
    description: "Explication du barème progressif de l'Impôt sur le Revenu des Personnes Physiques applicable au Togo en 2025.",
    category: "fiscalité",
    country: ["togo"],
    type: "document",
    date: "2025-03-22",
  },
  {
    id: "3",
    title: "Comparaison des systèmes de paie Bénin vs Togo",
    description: "Analyse comparative des obligations légales et fiscales en matière de paie entre le Bénin et le Togo.",
    category: "comparatif",
    country: ["benin", "togo"],
    type: "article",
    date: "2025-02-10",
  },
  {
    id: "4",
    title: "Congés payés et indemnités au Bénin",
    description: "Comment calculer correctement les indemnités de congés payés selon le code du travail béninois.",
    category: "législation",
    country: ["benin"],
    type: "video",
    date: "2025-01-18",
  },
  {
    id: "5",
    title: "Guide des avantages en nature et leur traitement fiscal au Togo",
    description: "Traitement fiscal et social des différents avantages en nature (logement, véhicule, etc.) au Togo.",
    category: "fiscalité",
    country: ["togo"],
    type: "document",
    date: "2024-12-05",
  },
  {
    id: "6",
    title: "Réforme fiscale 2025 au Bénin - Impact sur la paie",
    description: "Analyse des changements fiscaux récents au Bénin et leur impact sur le calcul des salaires.",
    category: "actualité",
    country: ["benin"],
    type: "article",
    date: "2025-05-01",
  },
];

const categories = [
  { id: "all", name: "Tous" },
  { id: "législation", name: "Législation" },
  { id: "fiscalité", name: "Fiscalité" },
  { id: "actualité", name: "Actualités" },
  { id: "comparatif", name: "Comparatifs" },
];

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const typeIcon = () => {
    switch (resource.type) {
      case "article":
        return <Book className="h-5 w-5 text-benin-green" />;
      case "document":
        return <FileText className="h-5 w-5 text-togo-yellow" />;
      case "video":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-togo-red"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {typeIcon()}
          <span className="text-sm text-muted-foreground capitalize">
            {resource.type}
          </span>
        </div>
        <div className="flex space-x-1">
          {resource.country.includes("benin") && (
            <span className="text-lg" title="Bénin">
              🇧🇯
            </span>
          )}
          {resource.country.includes("togo") && (
            <span className="text-lg" title="Togo">
              🇹🇬
            </span>
          )}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2 font-heading">{resource.title}</h3>
      <p className="text-muted-foreground mb-4">{resource.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(resource.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <Button variant="outline" size="sm">
          Lire plus
        </Button>
      </div>
    </div>
  );
};

const Resources = () => {
  const { country } = useCountry();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredResources = resourcesData.filter((resource) => {
    // Filter by country if not "all"
    const countryMatch = selectedTab === "all" || resource.country.includes(selectedTab);
    
    // Filter by category if not "all"
    const categoryMatch = 
      selectedCategory === "all" || resource.category === selectedCategory;
    
    // Filter by search term
    const searchMatch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return countryMatch && categoryMatch && searchMatch;
  });

  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Centre de Ressources
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos guides, articles et documents explicatifs sur la paie et la
            législation sociale au Bénin et au Togo.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Rechercher des ressources..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue={country} className="mb-8" onValueChange={setSelectedTab}>
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="all">Tous les pays</TabsTrigger>
              <TabsTrigger value="benin">Bénin</TabsTrigger>
              <TabsTrigger value="togo">Togo</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-benin-green hover:bg-benin-green/90"
                    : ""
                }
              >
                {category.name}
              </Button>
            ))}
          </div>

          <TabsContent value="all" className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="benin" className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources
                .filter((r) => r.country.includes("benin"))
                .map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="togo" className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources
                .filter((r) => r.country.includes("togo"))
                .map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Resources;
