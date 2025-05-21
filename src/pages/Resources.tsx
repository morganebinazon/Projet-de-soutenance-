
import { useState } from "react";
import { Search, Book, FileText, Filter, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCountry } from "@/hooks/use-country";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  country: string[];
  type: "article" | "video" | "document" | "webinar" | "calculator";
  date: string;
  image?: string;
  featured?: boolean;
}

const resourcesData: Resource[] = [
  {
    id: "1",
    title: "Guide complet des cotisations sociales au Bénin",
    description: "Présentation détaillée des différentes cotisations sociales pour les employeurs et employés au Bénin.",
    category: "législation",
    tags: ["CNSS", "cotisations", "employeur"],
    country: ["benin"],
    type: "article",
    date: "2025-04-15",
    featured: true,
  },
  {
    id: "2",
    title: "Calcul de l'IRPP au Togo - Barème 2025",
    description: "Explication du barème progressif de l'Impôt sur le Revenu des Personnes Physiques applicable au Togo en 2025.",
    category: "fiscalité",
    tags: ["IRPP", "impôts", "barème"],
    country: ["togo"],
    type: "document",
    date: "2025-03-22",
  },
  {
    id: "3",
    title: "Comparaison des systèmes de paie Bénin vs Togo",
    description: "Analyse comparative des obligations légales et fiscales en matière de paie entre le Bénin et le Togo.",
    category: "comparatif",
    tags: ["comparaison", "fiscalité", "législation"],
    country: ["benin", "togo"],
    type: "article",
    date: "2025-02-10",
    featured: true,
  },
  {
    id: "4",
    title: "Congés payés et indemnités au Bénin",
    description: "Comment calculer correctement les indemnités de congés payés selon le code du travail béninois.",
    category: "législation",
    tags: ["congés", "indemnités", "code du travail"],
    country: ["benin"],
    type: "video",
    date: "2025-01-18",
  },
  {
    id: "5",
    title: "Guide des avantages en nature et leur traitement fiscal au Togo",
    description: "Traitement fiscal et social des différents avantages en nature (logement, véhicule, etc.) au Togo.",
    category: "fiscalité",
    tags: ["avantages", "fiscalité", "optimisation"],
    country: ["togo"],
    type: "document",
    date: "2024-12-05",
  },
  {
    id: "6",
    title: "Réforme fiscale 2025 au Bénin - Impact sur la paie",
    description: "Analyse des changements fiscaux récents au Bénin et leur impact sur le calcul des salaires.",
    category: "actualité",
    tags: ["réforme", "fiscalité", "2025"],
    country: ["benin"],
    type: "article",
    date: "2025-05-01",
    featured: true,
  },
  {
    id: "7",
    title: "Webinaire: Les bonnes pratiques de la paie au Togo",
    description: "Enregistrement de notre webinaire sur les meilleures pratiques pour gérer la paie conformément à la législation togolaise.",
    category: "formation",
    tags: ["webinaire", "bonnes pratiques", "paie"],
    country: ["togo"],
    type: "webinar",
    date: "2025-02-28",
  },
  {
    id: "8",
    title: "Calculateur d'indemnités de licenciement",
    description: "Outil interactif pour estimer les indemnités de licenciement selon le code du travail béninois ou togolais.",
    category: "outil",
    tags: ["calculateur", "indemnités", "licenciement"],
    country: ["benin", "togo"],
    type: "calculator",
    date: "2025-01-10",
  },
  {
    id: "9",
    title: "Guide de déclaration CNSS pour les PME au Bénin",
    description: "Procédures et conseils pour une déclaration CNSS efficace et conforme pour les petites et moyennes entreprises.",
    category: "législation",
    tags: ["CNSS", "PME", "déclaration"],
    country: ["benin"],
    type: "document",
    date: "2024-11-15",
  },
];

const categories = [
  { id: "all", name: "Tous" },
  { id: "législation", name: "Législation" },
  { id: "fiscalité", name: "Fiscalité" },
  { id: "actualité", name: "Actualités" },
  { id: "comparatif", name: "Comparatifs" },
  { id: "formation", name: "Formation" },
  { id: "outil", name: "Outils" },
];

const popularTags = ["CNSS", "IRPP", "congés payés", "indemnités", "réformes 2025"];

const ResourceTypeIcon = ({ type }: { type: Resource["type"] }) => {
  switch (type) {
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
    case "webinar":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-blue-500"
        >
          <path d="M15 10l5 5-5 5" />
          <path d="M4 4v7a4 4 0 0 0 4 4h12" />
        </svg>
      );
    case "calculator":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-purple-500"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" x2="16" y1="6" y2="6" />
          <line x1="16" x2="16" y1="14" y2="18" />
          <path d="M16 10h.01" />
          <path d="M12 10h.01" />
          <path d="M8 10h.01" />
          <path d="M12 14h.01" />
          <path d="M8 14h.01" />
          <path d="M12 18h.01" />
          <path d="M8 18h.01" />
        </svg>
      );
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

const ResourceCard = ({ resource }: { resource: Resource }) => {
  return (
    <Card className="h-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col h-full">
          {/* Card header with type icon and country flags */}
          <div className="flex items-start justify-between p-6 pb-2">
            <div className="flex items-center space-x-2">
              <ResourceTypeIcon type={resource.type} />
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

          {/* Title and description */}
          <div className="flex-grow px-6 pb-4">
            <h3 className="text-xl font-semibold mb-2 font-heading">{resource.title}</h3>
            <p className="text-muted-foreground mb-4 line-clamp-3">{resource.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {resource.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Card footer with date and action button */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xs text-muted-foreground">
              {new Date(resource.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button variant="outline" size="sm">
              Voir plus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedResource = ({ resource }: { resource: Resource }) => {
  return (
    <div className="relative rounded-xl overflow-hidden h-64 group">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 z-10"></div>
      <div className="absolute inset-0 bg-gray-400 dark:bg-gray-700"></div>
      
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center space-x-2 mb-2">
          <Badge className="bg-benin-green">
            {resource.type === "article" ? "Article" : 
             resource.type === "document" ? "Document" : 
             resource.type === "video" ? "Vidéo" : 
             resource.type === "webinar" ? "Webinaire" : "Calculateur"}
          </Badge>
          
          <div className="flex space-x-1 ml-2">
            {resource.country.includes("benin") && (
              <span className="text-sm" title="Bénin">
                🇧🇯
              </span>
            )}
            {resource.country.includes("togo") && (
              <span className="text-sm" title="Togo">
                🇹🇬
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">{resource.title}</h3>
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{resource.description}</p>
        
        <Button variant="default" size="sm" className="bg-white text-gray-900 hover:bg-white/90">
          Lire maintenant
        </Button>
      </div>
    </div>
  );
};

const DocumentCard = ({ resource }: { resource: Resource }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
        <ResourceTypeIcon type={resource.type} />
      </div>
      <h3 className="font-semibold mb-1">{resource.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">Document officiel • PDF</p>
      <Button variant="outline" size="sm" className="mt-auto w-full">
        <Download className="mr-2 h-4 w-4" /> Télécharger
      </Button>
    </div>
  );
};

const Resources = () => {
  const { country } = useCountry();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTab, setSelectedTab] = useState<string>(country);
  const [selectedType, setSelectedType] = useState("all-types");

  const featuredResources = resourcesData.filter(resource => resource.featured);

  const filteredResources = resourcesData.filter((resource) => {
    // Filter by country if not "all"
    const countryMatch = selectedTab === "all" || resource.country.includes(selectedTab);
    
    // Filter by category if not "all"
    const categoryMatch = 
      selectedCategory === "all" || resource.category === selectedCategory;
    
    // Filter by type if not "all-types"
    const typeMatch =
      selectedType === "all-types" || resource.type === selectedType;
    
    // Filter by search term
    const searchMatch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return countryMatch && categoryMatch && searchMatch && typeMatch;
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

        {/* Featured resources carousel */}
        <div className="mb-12">
          <Carousel className="w-full">
            <CarouselContent>
              {featuredResources.map((resource) => (
                <CarouselItem key={resource.id}>
                  <FeaturedResource resource={resource} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-4">
              <CarouselPrevious className="relative static transform-none" />
              <CarouselNext className="relative static transform-none" />
            </div>
          </Carousel>
        </div>

        {/* Search and filters */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Rechercher des ressources..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">Tous les types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="video">Vidéos</SelectItem>
                  <SelectItem value="webinar">Webinaires</SelectItem>
                  <SelectItem value="calculator">Calculateurs</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtres avancés
              </Button>
            </div>
          </div>
          
          {/* Popular tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm mr-2 text-muted-foreground">Tags populaires:</span>
            {popularTags.map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setSearchTerm(tag)}
              >
                {tag}
              </Badge>
            ))}
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

          <TabsContent value="all" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Toutes les ressources</h2>
              {filteredResources.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedType("all-types");
                  }}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="benin" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Ressources pour le Bénin</h2>
              {filteredResources.filter(r => r.country.includes("benin")).length === 0 ? (
                <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedType("all-types");
                  }}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources
                    .filter((r) => r.country.includes("benin"))
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="togo" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Ressources pour le Togo</h2>
              {filteredResources.filter(r => r.country.includes("togo")).length === 0 ? (
                <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedType("all-types");
                  }}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources
                    .filter((r) => r.country.includes("togo"))
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Newsletter subscription */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-benin-green/10 dark:bg-benin-green/5 rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Restez à jour</h3>
                <p className="text-muted-foreground mb-4">
                  Recevez nos dernières ressources et actualités juridiques directement dans votre boîte mail.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input placeholder="Votre adresse email" className="flex-1" />
                  <Button className="bg-benin-green hover:bg-benin-green/90">S'abonner</Button>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-xs text-muted-foreground">
                    J'accepte de recevoir la newsletter de PayeAfrique
                  </label>
                </div>
              </div>
              
              <div className="hidden md:block border-l border-gray-200 dark:border-gray-700 h-32"></div>
              
              <div className="md:w-1/3">
                <h4 className="font-medium mb-2">Fréquence des envois</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="frequency-monthly" defaultChecked />
                    <label htmlFor="frequency-monthly" className="text-sm">Newsletter mensuelle</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="frequency-alerts" />
                    <label htmlFor="frequency-alerts" className="text-sm">Alertes légales importantes</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
