import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, Shield, Users, Building2, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-benin-green" />
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Chargement de PayeAfrique...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-benin-green/10 to-white dark:from-benin-green/5 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Simplifiez votre gestion de paie en Afrique
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              La solution complète de gestion de paie adaptée aux spécificités des entreprises africaines.
              Conforme aux réglementations locales, simple et efficace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/simulation")}>
                <Calculator className="mr-2 h-5 w-5" />
                Simuler maintenant
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                Demander une démo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-benin-green mb-4" />
              <h3 className="text-xl font-bold mb-2">Conformité Légale</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Solution conforme aux réglementations fiscales et sociales de chaque pays d'Afrique de l'Ouest.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-benin-green mb-4" />
              <h3 className="text-xl font-bold mb-2">Support Local</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Une équipe d'experts locaux à votre écoute pour vous accompagner dans votre transition digitale.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Building2 className="h-12 w-12 text-benin-green mb-4" />
              <h3 className="text-xl font-bold mb-2">Solution Complète</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gestion des salaires, des congés, des avantages sociaux et des déclarations fiscales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Prêt à moderniser votre gestion de paie ?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Rejoignez les centaines d'entreprises qui font confiance à PayeAfrique pour leur gestion de paie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/simulation")}>
                Commencer maintenant
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                Demander une démo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 