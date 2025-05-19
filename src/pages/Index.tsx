
import { Link } from "react-router-dom";
import { ArrowRight, Check, BarChart3, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Simulation et gestion <span className="text-benin-green">de paie</span> pour le Bénin et le Togo
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Une plateforme moderne et intuitive pour calculer et gérer les salaires conformément aux législations fiscales et sociales en Afrique de l'Ouest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="bg-benin-green hover:bg-benin-green/90 text-white px-8 py-6" size="lg" asChild>
                  <Link to="/simulation">
                    Simuler maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6" asChild>
                  <Link to="/about">En savoir plus</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 animate-scale-in">
                <div className="absolute -top-3 -right-3 bg-benin-green text-white text-xs px-3 py-1 rounded-full">
                  Bénin
                </div>
                <h3 className="text-xl font-bold mb-4">Simulation rapide</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Salaire brut
                      </label>
                      <input
                        type="text"
                        className="input-field w-full"
                        placeholder="250,000 FCFA"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Situation familiale
                      </label>
                      <select className="input-field w-full bg-white dark:bg-gray-800" disabled>
                        <option>Marié(e), 2 enfants</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Salaire net estimé:</span>
                      <span className="text-benin-green font-bold">210,450 FCFA</span>
                    </div>
                    <div className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-benin-green rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  <Button className="w-full bg-benin-green hover:bg-benin-green/90" asChild>
                    <Link to="/simulation">
                      Simulation détaillée
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-benin-green/10 rounded-full blur-3xl"></div>
        <div className="absolute top-32 right-10 w-32 h-32 bg-togo-red/10 rounded-full blur-2xl"></div>
        <div className="absolute top-64 left-1/2 w-40 h-40 bg-togo-yellow/20 rounded-full blur-2xl"></div>
      </section>

      {/* Features section */}
      <section className="bg-white dark:bg-gray-900 section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Une solution complète pour vos besoins de paie
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Découvrez les avantages qui font de PayeAfrique la plateforme incontournable pour la gestion des salaires au Bénin et au Togo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-benin-green/10 rounded-lg flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-benin-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Conformité garantie</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Calculs conformes aux dernières réglementations fiscales et sociales du Bénin et du Togo.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-benin-green/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-benin-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Visualisation claire</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Graphiques et rapports détaillés pour comprendre facilement la structure de votre rémunération.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-benin-green/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-benin-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Sécurité maximale</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vos données sensibles sont protégées par des systèmes de sécurité avancés et conformes aux standards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-benin-green/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-benin-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Gain de temps</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatisez vos calculs et générez des fiches de paie en quelques clics plutôt qu'en heures.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-benin-green/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-benin-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Documentation complète</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Accédez à une base de connaissances détaillée sur les réglementations et bonnes pratiques.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-benin-green/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-benin-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Simulation multi-scénarios</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comparez différentes structures de rémunération pour optimiser vos choix stratégiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-benin-green text-white section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à optimiser votre gestion de paie ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des milliers d'entreprises et de professionnels qui font confiance à PayeAfrique pour leurs besoins de paie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-benin-green hover:bg-gray-100" size="lg" asChild>
                <Link to="/register">
                  Créer un compte
                </Link>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" asChild>
                <Link to="/simulation">
                  Essayer sans inscription
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
