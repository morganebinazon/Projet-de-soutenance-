import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Calculator, Shield, BarChart3, Users, Building2, Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useCountry } from "@/hooks/use-country";
import { motion } from "framer-motion";

const Index = () => {
  const { country } = useCountry();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Amadou Diallo",
      role: "Directeur RH, Entreprise ABC",
      content: "PayeAfrique a révolutionné notre gestion de paie. Plus de temps perdu en calculs manuels, tout est automatisé et précis.",
      rating: 5
    },
    {
      name: "Fatou Ndiaye",
      role: "Comptable, Société XYZ",
      content: "La conformité aux normes fiscales est maintenant un jeu d'enfant. Je recommande vivement PayeAfrique à toutes les entreprises.",
      rating: 5
    },
    {
      name: "Kofi Mensah",
      role: "Entrepreneur",
      content: "En tant que jeune entrepreneur, PayeAfrique m'a permis de gérer efficacement la paie de mes employés dès le début.",
      rating: 5
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Dégradés principaux */}
          <div className="absolute inset-0 bg-gradient-to-br from-benin-green/5 via-togo-red/5 to-togo-yellow/5" />
          <div className="absolute inset-0 bg-gradient-to-tr from-benin-green/10 via-transparent to-togo-red/10" />
          
          {/* Cercles animés avec dégradés */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-benin-green/20 via-benin-green/10 to-transparent rounded-full blur-3xl animate-float-slow glow-benin" />
          <div className="absolute top-20 -left-20 w-60 h-60 bg-gradient-to-tr from-togo-red/20 via-togo-red/10 to-transparent rounded-full blur-3xl animate-float glow-togo" />
          <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-bl from-togo-yellow/20 via-togo-yellow/10 to-transparent rounded-full blur-2xl animate-float-reverse glow" />
          
          {/* Dégradé central avec animation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-benin-green/10 via-togo-red/10 to-togo-yellow/10 rounded-full blur-3xl animate-pulse" />
          
          {/* Dégradés supplémentaires */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent dark:from-slate-950" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent dark:from-slate-950" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Drapeaux animés en haut */}
          <div className="absolute top-4 right-4 flex items-center gap-2 animate-float-slow">
            <span className="text-2xl transform hover:scale-110 transition-transform text-benin-green filter drop-shadow-lg">🇧🇯</span>
            <span className="text-2xl transform hover:scale-110 transition-transform text-benin-green filter drop-shadow-lg">🇹🇬</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in-up">
                Simplifiez la gestion de votre
                <span className="text-benin-green block mt-2 relative">
                  paie en Afrique
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Solution complète de gestion de paie pour les entreprises et les employés au Bénin et au Togo.
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link to="/simulation">
                  <Button size="lg" className="group glow-benin hover:glow bg-benin-green hover:bg-benin-green/90">
                    Simuler maintenant
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="hover:glow border-2 border-benin-green/20 hover:border-benin-green/40 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-down">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-benin">
                <Calculator className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Calculs précis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Calculs automatiques des salaires selon les législations locales
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-togo">
                <Shield className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Conformité</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Respect des normes fiscales et sociales en vigueur
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-benin">
                <BarChart3 className="h-8 w-8 text-benin-green mb-4" />
                <h3 className="text-xl font-semibold mb-2">Rapports détaillés</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyses et statistiques pour une meilleure gestion
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-togo">
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

      {/* Pourquoi choisir PayeAfrique Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-950 dark:to-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir <span className="text-benin-green">PayeAfrique</span> ?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Une solution adaptée aux besoins des entreprises africaines
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-benin"
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
              className="text-center p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-togo"
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
              className="text-center p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-benin"
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

      {/* Témoignages Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ce qu'en disent nos utilisateurs</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Découvrez les expériences de nos clients satisfaits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 glow hover:glow-benin"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-benin-green mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {testimonial.content}
                </p>
                <div>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-benin-green relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl animate-float-reverse" />
          <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/15 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/15 rounded-full blur-2xl animate-pulse" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">Prêt à commencer ?</h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez les entreprises qui font confiance à PayeAfrique pour leur gestion de paie
            </p>
            <Link to="/simulation">
              <Button size="lg" className="group bg-white text-benin-green hover:bg-white/90 hover:text-benin-green/90">
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
