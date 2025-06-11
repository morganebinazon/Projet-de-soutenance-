import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Check, BarChart3, Shield, Clock, Calculator, Star, Play, ArrowLeft, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Layout from "@/components/layout/Layout";
import { useCountry } from "@/hooks/use-country";
import { Input } from "@/components/ui/input";
import { calculateCNSS, calculateImpot } from "@/constants/tax";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const Index = () => {
  const { country } = useCountry();
  const [salaryValue, setSalaryValue] = useState(250000);
  const [familyStatus, setFamilyStatus] = useState("single");
  const [childrenCount, setChildrenCount] = useState(0);

  // Constantes pour les calculs des frais professionnels
  const FRAIS_PRO_RATE = 0.20; // 20% pour frais professionnels
  const FRAIS_PRO_PLAFOND_ANNUEL = 600000 * 12; // 600 000 FCFA par mois * 12
  const FRAIS_PRO_PLAFOND_MENSUEL = FRAIS_PRO_PLAFOND_ANNUEL / 12;

  // Constantes CNSS 2025
  const CNSS_PLAFOND_BENIN = 600000; // FCFA - Mis à jour pour 2025
  const CNSS_SALARIAL_RATE_BENIN = 0.036; // 3.6%
  const CNSS_EMPLOYER_RATE_BENIN = 0.154; // 15.4% (6.4% vieillesse + 9% PF + 0.5% AT)
  const CNSS_SALARIAL_RATE_TOGO = 0.0968; // 9.68%
  const CNSS_EMPLOYER_RATE_TOGO = 0.1707; // 17.07%

  // Barème ITS Bénin 2025
  const ITS_TRANCHES_BENIN = [
    { min: 0, max: 50000, taux: 0 },
    { min: 50001, max: 130000, taux: 0.10 },
    { min: 130001, max: 280000, taux: 0.15 },
    { min: 280001, max: 530000, taux: 0.20 },
    { min: 530001, max: Infinity, taux: 0.30 }
  ];

  // Barème IRPP Togo 2025
  const IRPP_TRANCHES_TOGO = [
    { min: 0, max: 60000, taux: 0 },
    { min: 60001, max: 150000, taux: 0.10 },
    { min: 150001, max: 300000, taux: 0.15 },
    { min: 300001, max: 500000, taux: 0.20 },
    { min: 500001, max: 800000, taux: 0.25 },
    { min: 800001, max: Infinity, taux: 0.30 }
  ];

  // Calcul des montants
  const cnssAmount = calculateCNSS(salaryValue, country);
  const impotAmount = calculateImpot(salaryValue, country, familyStatus, childrenCount);
  const netSalary = salaryValue - cnssAmount - impotAmount;

  // Pourcentages pour l'affichage
  const cssCnssPercent = Math.round((cnssAmount / salaryValue) * 100);
  const cssIrppPercent = Math.round((impotAmount / salaryValue) * 100);

  // Fonction pour formater les montants en FCFA
  const formatSalary = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount));
  };
  
  const cssNetPercent = Math.round((netSalary / salaryValue) * 100);
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-benin-green/5 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-60 h-60 bg-togo-red/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="space-y-8"
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Simplifiez la gestion de votre
                <span className="text-benin-green block mt-2">paie en Afrique</span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Solution complète de gestion de paie pour les entreprises et les employés au Bénin et au Togo.
              </motion.p>

              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
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
              </motion.div>
            </motion.div>

            {/* Right Content - Feature Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div 
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calculator className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Calculs précis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Calculs automatiques des salaires selon les législations locales
                </p>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Conformité</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Respect des normes fiscales et sociales en vigueur
                </p>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BarChart3 className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Rapports détaillés</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyses et statistiques pour une meilleure gestion
                </p>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestion RH</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Outils complets pour la gestion des ressources humaines
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir PayeAfrique ?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Une solution adaptée aux besoins des entreprises africaines
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-benin-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-benin-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pour les Entreprises</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gestion simplifiée de la paie et des ressources humaines
              </p>
            </motion.div>

            <motion.div 
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-benin-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-benin-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pour les Employés</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Accès facile à vos informations de paie et documents
              </p>
            </motion.div>

            <motion.div 
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-benin-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-benin-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurité Garantie</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Protection des données et conformité aux normes
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Prêt à commencer ?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Rejoignez les entreprises qui font confiance à PayeAfrique pour leur gestion de paie
            </p>
            <Link to="/simulation">
              <Button size="lg" className="group">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
