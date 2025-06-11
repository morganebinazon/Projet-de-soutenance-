import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Calculator, Shield, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useCountry } from "@/hooks/use-country";

const Index = () => {
  const { country } = useCountry();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-benin-green/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-20 -left-20 w-60 h-60 bg-togo-red/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-togo-yellow/10 rounded-full blur-2xl animate-float-reverse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-benin-green/5 via-togo-red/5 to-togo-yellow/5 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Simplifiez la gestion de votre
                <span className="text-benin-green block mt-2">paie en Afrique</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300">
                Solution complète de gestion de paie pour les entreprises et les employés au Bénin et au Togo.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/simulation">
                  <Button size="lg" className="group">
                    Simuler maintenant
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <Calculator className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Calculs précis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Calculs automatiques des salaires selon les législations locales
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <Shield className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Conformité</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Respect des normes fiscales et sociales en vigueur
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <BarChart3 className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Rapports détaillés</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyses et statistiques pour une meilleure gestion
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <Users className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestion RH</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Outils complets pour la gestion des ressources humaines
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index; 