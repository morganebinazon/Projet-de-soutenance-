// src/pages/About.tsx
import { Building2, Users, Target, Award, Globe, Shield, Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">À propos de PayeAfrique</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simplifiez la gestion de votre paie en Afrique avec notre solution innovante et adaptée aux spécificités locales.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-benin-green" />
                Notre Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Notre mission est de démocratiser l'accès à des outils de gestion de paie professionnels en Afrique, 
                en offrant une solution adaptée aux besoins spécifiques des entreprises africaines et conforme aux 
                réglementations locales.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-benin-green" />
                Notre Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous aspirons à devenir la référence en matière de solutions de gestion de paie en Afrique, 
                en contribuant à la modernisation des pratiques RH et à l'amélioration de la productivité 
                des entreprises africaines.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Nos Points Forts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-benin-green" />
                  Conformité Légale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Solution conforme aux réglementations fiscales et sociales de chaque pays d'Afrique de l'Ouest.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-benin-green" />
                  Support Local
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Une équipe d'experts locaux à votre écoute pour vous accompagner dans votre transition digitale.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-benin-green" />
                  Innovation Continue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Des mises à jour régulières pour intégrer les dernières innovations et répondre aux besoins émergents.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-benin-green" />
                  Direction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Une équipe de direction expérimentée avec une expertise approfondie du marché africain et des 
                  technologies de gestion de paie.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-benin-green" />
                  Experts RH
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Des professionnels des ressources humaines qui comprennent les défis spécifiques aux entreprises 
                  africaines.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-benin-green" />
                  Support Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Une équipe dédiée à votre service, disponible pour vous accompagner dans l'utilisation de notre 
                  plateforme.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Prêt à moderniser votre gestion de paie ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez les centaines d'entreprises qui font confiance à PayeAfrique pour leur gestion de paie.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">
              Commencer maintenant
            </Button>
            <Button variant="outline" size="lg">
              Demander une démo
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;