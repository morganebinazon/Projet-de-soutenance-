import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Check, BarChart3, Shield, Clock, Calculator, Star, Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Layout from "@/components/layout/Layout";
import { useCountry } from "@/hooks/use-country";
import { Input } from "@/components/ui/input";
import { calculateCNSS, calculateImpot } from "@/constants/tax";

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
      {/* Hero Section - Redesigned with more African-inspired elements */}
      <section className="relative overflow-hidden section-padding">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl bg-gradient-to-br from-benin-green/20 to-togo-red/10 animate-float-slow"></div>
        <div className="absolute top-40 -left-10 w-40 h-40 rounded-full blur-2xl bg-gradient-to-tr from-togo-yellow/20 to-blue-400/10 animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full blur-xl bg-gradient-to-tl from-purple-400/10 to-benin-green/10 animate-float-reverse"></div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left side - Main content */}
            <div className="md:col-span-6 z-10">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-tight mb-6">
                  <span className="relative inline-block">
                    Simulation
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-benin-green/30" viewBox="0 0 200 8">
                      <path d="M0,5 Q40,0 80,5 T160,5 T200,5" fill="none" stroke="currentColor" strokeWidth="4"></path>
                    </svg>
                  </span> 
                  <span className="block">et gestion de</span>
                  <span className="text-benin-green relative">
                    paie
                    <span className="absolute -right-12 top-0 transform rotate-12 text-xl">🇧🇯 🇹🇬</span>
                  </span>
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
                  Votre partenaire digital pour des calculs de salaire précis et conformes aux législations d'Afrique de l'Ouest.
                </p>
                
                {/* Call to action buttons with hover animations */}
                <div className="flex flex-wrap gap-4">
                  <Link to="/simulation" className="btn-primary group">
                    <span>Simuler maintenant</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/about" className="btn-secondary group">
                    <span className="relative z-10">Découvrir</span>
                    <span className="absolute inset-0 bg-benin-green/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right side - Interactive salary simulator */}
            <div className="md:col-span-6 z-10">
              <div className="relative">
                {/* Country badge */}
                <div className="absolute -top-6 -right-6 country-badge">
                  <span className="flag">{country === "benin" ? "🇧🇯" : "🇹🇬"}</span>
                  <span className="name">{country === "benin" ? "Bénin" : "Togo"}</span>
                </div>
                
                {/* Mini interactive simulator */}
                <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl p-6 transform transition-all hover:scale-[1.02]">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Calculator className="text-benin-green mr-2 h-5 w-5" />
                    Simulation rapide
                  </h3>
                  
                  {/* Salary slider */}
                  <div className="space-y-6 mb-4">
                    <div>
                      <label className="input-label">Salaire brut</label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          value={salaryValue}
                          onChange={(e) => setSalaryValue(Number(e.target.value))}
                          min={50000}
                          max={1000000}
                          step={1000}
                          className="w-full"
                        />
                        <output className="text-benin-green font-mono font-bold whitespace-nowrap">
                          {formatSalary(salaryValue)} FCFA
                        </output>
                      </div>
                    </div>
                    
                    {/* Family status selector */}
                    <div>
                      <label className="input-label">Situation familiale</label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <button 
                          className={`family-option ${familyStatus === "single" ? "active" : ""}`}
                          onClick={() => {
                            setFamilyStatus("single");
                            setChildrenCount(0);
                          }}
                        >
                          <span className="icon">👤</span>
                          <span className="text">Célibataire</span>
                        </button>
                        <button 
                          className={`family-option ${familyStatus === "married" ? "active" : ""}`}
                          onClick={() => setFamilyStatus("married")}
                        >
                          <span className="icon">👫</span>
                          <span className="text">Marié(e)</span>
                        </button>
                        <button 
                          className={`family-option ${familyStatus === "divorced" ? "active" : ""}`}
                          onClick={() => setFamilyStatus("divorced")}
                        >
                          <span className="icon">💔</span>
                          <span className="text">Divorcé(e)</span>
                        </button>
                      </div>

                      {/* Children count selector - Only shown if married or divorced */}
                      {(familyStatus === "married" || familyStatus === "divorced") && (
                        <div className="mt-4">
                          <label className="input-label">Nombre d'enfants</label>
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            {[0, 1, 2, 3, 4].map((count) => (
                              <button
                                key={count}
                                className={`family-option ${childrenCount === count ? "active" : ""}`}
                                onClick={() => setChildrenCount(count)}
                              >
                                <span className="text">{count}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Results with chart */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-900/60 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Salaire brut:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-bold">{formatSalary(salaryValue)} FCFA</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-red-600 dark:text-red-400">
                            - CNSS ({country === "benin" ? "3.6%" : "9.68%"})
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            -{formatSalary(cnssAmount)} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-red-600 dark:text-red-400">
                            - {country === "benin" ? "ITS" : "IRPP"}
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            -{formatSalary(impotAmount)} FCFA
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Salaire net:</span>
                          <span className="text-benin-green font-bold text-lg">
                            {formatSalary(netSalary)} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Distribution chart */}
                    <div className="h-12 w-full relative mt-4 mb-4 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div className="bg-benin-green h-full" style={{ width: `${cssNetPercent}%` }}></div>
                        <div className="bg-amber-500 h-full" style={{ width: `${cssIrppPercent}%` }}></div>
                        <div className="bg-red-400 h-full" style={{ width: `${cssCnssPercent}%` }}></div>
                      </div>
                      <div className="absolute inset-0 flex text-xs text-white font-medium">
                        <div className="flex-grow flex items-center justify-center">Net</div>
                        <div className="w-[12%] flex items-center justify-center">{country === "benin" ? "ITS" : "IRPP"}</div>
                        <div className="w-[6%] flex items-center justify-center">CNSS</div>
                      </div>
                    </div>
                    
                    <Link to="/simulation" className="w-full btn-primary-sm inline-flex items-center justify-center">
                      <span>Simulation détaillée</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section - Redesigned with cards that have hover effects */}
      <section className="py-24 relative">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMEMxMy40IDAgMCAxMy40IDAgMzBzMTMuNCAzMCAzMCAzMCA0NS00LjcgNjAtMjAgMjAtNDUuMyAyMC02MFM0Ni42IDAgMzAgMHptMCA1MmMtMTIuMiAwLTIyLTkuOC0yMi0yMnM5LjgtMjIgMjItMjIgMzIuOCA2LjkgNDQgMThDNjMuMSAzNy45IDQyLjIgNTIgMzAgNTJ6Ii8+PC9zdmc+')]"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-benin-green/10 text-benin-green font-medium text-sm mb-4">Caractéristiques</span>
            <h2 className="text-4xl md:text-5xl font-display mb-6">Une approche innovante de la paie</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Découvrez comment PayeAfrique révolutionne la gestion des salaires en Afrique de l'Ouest
            </p>
          </div>

          {/* Feature cards with hover effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <Check className="feature-icon-svg" />
              </div>
              <h3 className="feature-title">Conformité totale</h3>
              <p className="feature-description">
                Calculs conformes aux dernières réglementations fiscales du Bénin et du Togo, mis à jour automatiquement.
              </p>
              <div className="feature-graphic">
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-benin-green rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="text-xs text-benin-green mt-1">100% conforme</div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <BarChart3 className="feature-icon-svg" />
              </div>
              <h3 className="feature-title">Tableaux de bord avancés</h3>
              <p className="feature-description">
                Visualisez facilement la structure de votre paie avec des graphiques interactifs et personnalisables.
              </p>
              <div className="feature-graphic">
                <div className="flex h-6 items-end space-x-1">
                  <div className="w-1/5 h-2/3 bg-benin-green/70 rounded-t"></div>
                  <div className="w-1/5 h-full bg-benin-green rounded-t"></div>
                  <div className="w-1/5 h-1/2 bg-benin-green/70 rounded-t"></div>
                  <div className="w-1/5 h-3/4 bg-benin-green/80 rounded-t"></div>
                  <div className="w-1/5 h-1/3 bg-benin-green/60 rounded-t"></div>
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <Shield className="feature-icon-svg" />
              </div>
              <h3 className="feature-title">Sécurité maximale</h3>
              <p className="feature-description">
                Protection de vos données sensibles par des systèmes de sécurité avancés et conformes aux normes.
              </p>
              <div className="feature-graphic">
                <div className="relative h-8 w-8 mx-auto">
                  <div className="absolute inset-0 bg-benin-green/20 rounded-full animate-ping-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-benin-green" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <Clock className="feature-icon-svg" />
              </div>
              <h3 className="feature-title">Gain de temps</h3>
              <p className="feature-description">
                Automatisez vos calculs et générez des fiches de paie en quelques clics plutôt qu'en heures.
              </p>
              <div className="feature-graphic">
                <div className="flex justify-center">
                  <div className="relative h-8 w-16">
                    <div className="absolute left-0 bottom-0 w-6 h-6 border-2 border-benin-green rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-benin-green rounded-full"></div>
                    </div>
                    <div className="absolute right-0 bottom-0 w-6 h-6 border-2 border-benin-green/30 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <svg className="h-6 w-6 text-benin-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="feature-title">Documentation complète</h3>
              <p className="feature-description">
                Accédez à une base de connaissances détaillée sur les réglementations et bonnes pratiques.
              </p>
              <div className="feature-graphic">
                <div className="flex justify-center space-x-1">
                  <div className="w-3 h-4 bg-benin-green/30 rounded"></div>
                  <div className="w-3 h-6 bg-benin-green/50 rounded"></div>
                  <div className="w-3 h-8 bg-benin-green/70 rounded"></div>
                  <div className="w-3 h-5 bg-benin-green/40 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <svg className="h-6 w-6 text-benin-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="feature-title">Simulation multi-scénarios</h3>
              <p className="feature-description">
                Comparez différentes structures de rémunération pour optimiser vos choix stratégiques.
              </p>
              <div className="feature-graphic">
                <div className="flex justify-center items-end space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-10 bg-benin-green/50 rounded-t"></div>
                    <div className="mt-1 text-xs">A</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-6 bg-benin-green/70 rounded-t"></div>
                    <div className="mt-1 text-xs">B</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-8 bg-benin-green rounded-t"></div>
                    <div className="mt-1 text-xs">C</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* New section: Country map comparison */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-benin-green/10 text-benin-green font-medium text-sm mb-4">Couverture régionale</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Expertise locale</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Notre solution est spécialement conçue pour les spécificités légales et fiscales du Bénin et du Togo
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <img 
                  src="/images/benin-map.svg" 
                  alt="Carte du Bénin" 
                  className={`w-full transition-all duration-500 ${country === "benin" ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
                />
                <img 
                  src="/images/togo-map.svg" 
                  alt="Carte du Togo" 
                  className={`w-[70%] absolute left-0 top-[5%] transition-all duration-500 ${country === "togo" ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
                />
                {/* Connection points to show relations */}
                <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-benin-green rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-togo-red rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex gap-4 mb-6">
                  <button 
                    className={`flex-1 p-3 rounded-lg flex flex-col items-center transition-all ${
                      country === "benin" 
                        ? "bg-benin-green text-white" 
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => console.log("Would switch to Benin")}
                  >
                    <span className="text-2xl">🇧🇯</span>
                    <span className="mt-1 font-medium">Bénin</span>
                  </button>
                  <button 
                    className={`flex-1 p-3 rounded-lg flex flex-col items-center transition-all ${
                      country === "togo" 
                        ? "bg-togo-red text-white" 
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => console.log("Would switch to Togo")}
                  >
                    <span className="text-2xl">🇹🇬</span>
                    <span className="mt-1 font-medium">Togo</span>
                  </button>
                </div>
                
                <h3 className="text-xl font-bold mb-3">Comparaison des législations</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Impôt sur salaire</div>
                    <div className="col-span-1 text-center px-2 py-1 bg-benin-green/10 rounded text-sm">
                      {country === "benin" ? "IPTS: 0-30%" : "IPTS: 0-30%"}
                    </div>
                    <div className="col-span-1 text-center px-2 py-1 bg-togo-red/10 rounded text-sm">
                      {country === "togo" ? "IRPP: 0-35%" : "IRPP: 0-35%"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Cotisation employeur</div>
                    <div className="col-span-1 text-center px-2 py-1 bg-benin-green/10 rounded text-sm">15.4%</div>
                    <div className="col-span-1 text-center px-2 py-1 bg-togo-red/10 rounded text-sm">16.5%</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Cotisation salarié</div>
                    <div className="col-span-1 text-center px-2 py-1 bg-benin-green/10 rounded text-sm">3.6%</div>
                    <div className="col-span-1 text-center px-2 py-1 bg-togo-red/10 rounded text-sm">4.0%</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Plafond mensuel</div>
                    <div className="col-span-1 text-center px-2 py-1 bg-benin-green/10 rounded text-sm">
                      {formatSalary(250000)} FCFA
                    </div>
                    <div className="col-span-1 text-center px-2 py-1 bg-togo-red/10 rounded text-sm">
                      {formatSalary(240000)} FCFA
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to="/country-selection" className="text-benin-green hover:underline inline-flex items-center">
                    Voir détails législatifs complets
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-benin-green/10 text-benin-green font-medium text-sm mb-4">Témoignages</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Ils nous font confiance</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez comment PayeAfrique simplifie la vie de nos utilisateurs à travers toute l'Afrique de l'Ouest
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar-container">
                  <img src="https://i.pravatar.cc/60?img=11" alt="Avatar" className="avatar" />
                  <span className="testimonial-badge">🇧🇯</span>
                </div>
                <div>
                  <h4 className="name font-bold">Kouassi Amoussou</h4>
                  <p className="position text-sm text-gray-600 dark:text-gray-400">DRH, Entreprise Exemple</p>
                </div>
                <div className="rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <blockquote className="testimonial-content">
                "PayeAfrique nous a fait gagner un temps considérable. Les calculs sont toujours exacts et conformes aux dernières lois fiscales du Bénin. Un vrai gain de productivité pour notre service RH."
              </blockquote>
              <div className="testimonial-video-trigger">
                <Play className="video-icon" /> Voir son témoignage
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar-container">
                  <img src="https://i.pravatar.cc/60?img=32" alt="Avatar" className="avatar" />
                  <span className="testimonial-badge">🇹🇬</span>
                </div>
                <div>
                  <h4 className="name font-bold">Afi Djigbodi</h4>
                  <p className="position text-sm text-gray-600 dark:text-gray-400">Comptable, PME Togolaise</p>
                </div>
                <div className="rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star" />
                </div>
              </div>
              <blockquote className="testimonial-content">
                "Avant PayeAfrique, je passais des heures à calculer manuellement les salaires. Maintenant, je gère tout notre processus de paie en quelques clics, et les employés peuvent consulter leurs bulletins en ligne."
              </blockquote>
              <div className="testimonial-video-trigger">
                <Play className="video-icon" /> Voir son témoignage
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar-container">
                  <img src="https://i.pravatar.cc/60?img=53" alt="Avatar" className="avatar" />
                  <span className="testimonial-badge">🇧🇯</span>
                </div>
                <div>
                  <h4 className="name font-bold">Emmanuel Houngbo</h4>
                  <p className="position text-sm text-gray-600 dark:text-gray-400">CEO, Startup Tech</p>
                </div>
                <div className="rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <blockquote className="testimonial-content">
                "En tant que startup en croissance, nous avions besoin d'une solution flexible qui évolue avec nous. PayeAfrique répond parfaitement à ce besoin et nous permet de rester conformes même quand la législation change."
              </blockquote>
              <div className="testimonial-video-trigger">
                <Play className="video-icon" /> Voir son témoignage
              </div>
            </div>
          </div>
          
          {/* Slider controls */}
          <div className="flex justify-center mt-8 items-center space-x-4">
            <button className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow hover:shadow-md">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex space-x-2">
              <span className="h-2 w-8 bg-benin-green rounded-full"></span>
              <span className="h-2 w-2 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
              <span className="h-2 w-2 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
            </div>
            <button className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow hover:shadow-md">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section - Now with more dynamic design */}
      <section className="relative py-24 overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-benin-green to-benin-green/80"></div>
        
        {/* African pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNNDMuMjgsMjguODVsMi4yNS0uNjRhMi44NSwyLjg1LDAsMCwwLDEuOC0xLjc4LDIuODMsMi44MywwLDAsMC0uMy0yLjVBMywzLDAsMCwwLDQ1LjMxLDIyLjdhNC4zMSw0LjMxLDAsMCwwLTEsLjEybC0yLjI0LjY0YTIuODQsMi44NCwwLDAsMC0xLjc4LDEuNzhBMi44MiwyLjgyLDAsMCwwLDQwLjU4LDI4YTMsMywwLDAsMCwxLjcyLDEuMjNBNC4zMSw0LjMxLDAsMCwwLDQzLjI4LDI4Ljg1Wm0tMy41LTE1LjQ0TDQyLDEyLjc2YTIuODQsMi44NCwwLDAsMCwxLjc4LTEuNzgsMi44NCwyLjg0LDAsMCwwLS4yOS0yLjVBMywzLDAsMCwwLDQxLjgxLDcuMjZhMy44LDMuOCwwLDAsMC0xLC4xM2wtMi4yNS42M2EyLjg0LDIuODQwLDAsMCwwLTEuNzgsMS43OCwyLjgzLDIuODMsMCwwLDAsLjMsMi41LDMuMDcsMy4wNywwLDAsMCwxLjcxLDEuMjJBNC4zMSw0LjMxLDAsMCwwLDM5Ljc4LDEzLjQxWk01MS42LDQ5LjA2QTMuMDYsMy4wNiwwLDAsMCw0OS44OSw0Ny44YTQsNCwwLDAsMC0xLS4xM2wtMi4yNS42M2EzLDMsMCwwLDAtMS43OCwxLjc5LDMsMywwLDAsMCwuMywyLjVBMi44NSwyLjg1LDAsMCwwLDQ3LDUzLjgxYTMuOSwzLjksMCwwLDAsMS0uMTJsMi4yNC0uNjRhMi44NCwyLjg0LDAsMCwwLDEuNzgtMS43OEEyLjgzLDIuODMsMCwwLDAsNTEuNiw0OS4wNlptLTYuMTUtOS45LDIuMjUtLjY0YTIuODQsMi44NCwwLDAsMCwxLjc4LTEuNzgsMi44MywyLjgzLDAsMCwwLS4yOS0yLjUsMy4wNiwzLjA2LDAsMCwwLTEuNzItMS4yMyw0LDQsMCwwLDAtMS0uMTNsLTIuMjUuNjRhMi44NCwyLjg0LDAsMCwwLTEuNzgsMS43OSwyLjgyLDIuODIsMCwwLDAsLjMtMi41LDIuODQsMi44NCwwLDAsMCwxLjcyLDEuMjJBNC4zMSw0LjMxLDAsMCwwLDQ1LjQ1LDM5LjE2Wk0yNi4zNywxMC4yOWwyLjI1LS42NGEyLjgzLDIuODMsMCwwLDAsMS43OC0xLjc4QTIuODMsMi44MywwLDAsMCwzMC4xLDUuMzcsMywzLDAsMCwwLDI4LjM5LDQuMTRhNCw0LDAsMCwwLTEtLjEzbC0yLjI1LjY0YTIuODQsMi44NCwwLDAsMC0xLjc4LDEuNzgsMi44NCwyLjg0LDAsMCwwLC4zLDIuNSwzLDMsMCwwLDAsMS43MSwxLjIzQTQuMzEsNC4zMSwwLDAsMCwyNi4zNywxMC4yOVptMzEsMTQuNzRBMi44NSwyLjg1LDAsMCwwLDU5LDI2LjI1YTIuODUsMi44NSwwLDAsMC0uMTMtMWwtLjY0LTIuMjRhMi44NSwyLjg1LDAsMCwwLTEuNzktMS43OSwyLjgzLDIuODMsMCwwLDAtMi41LjNBMywzLDAsMCwwLDUyLjczLDIzLjJhNC4xLDQuMSwwLDAsMCwuMTMsMWwuNjQsMi4yNGEyLjg0LDIuODQsMCwwLDAsMS43OCwxLjc4LDIuODQsMi44NCwwLDAsMCwyLjUtLjI5QTMsMywwLDAsMCw1Ny4zNywyNVptLTE1LDI3LjczYTMsMywwLDEsMC00LjM0LjQ4QTMsMywwLDAsMCw0Mi4zNiw1Mi43M1pNNTQuODcsMzkuMTZhMywzLDAsMCwwLTEuODIsMS41NywzLDMsMCwwLDAsLjEyLDIuMzksMywyLDAsMCwwLDEuODIsMS41OCwzLDMsMCwwLDAsMi4zOS0uMTEsMywzLDAsMCwwLDEuNTgtMS44MywzLDMsMCwwLDAtLjEyLTIuMzksMywyLDAsMCwwLTEuODItMS41N0EzLDMsMCwwLDAsNTQuODcsMzkuMTZabS05LjQyLTE1LjIsOS42Ni0yLjc2YTIuODQsMi44NCwwLDAsMCwxLjc4LTEuNzgsMi44MywyLjgzLDAsMCwwLS4zLTIuNSwzLjA2LDMuMDYsMCwwLDAtMS43MS0xLjIzLDQuMzgsNC4zOCwwLDAsMC0xLS4xM2wtMy4wOC44OGEyLjgzLDIuODMsMCwwLDAtMS43OCwxLjc4LDIuODQsMi44NCwwLDAsMCwuMywyLjUsMywzLDAsMCwwLDEuNzEsMS4yMkE0LjM4LDQuMzgsMCwwLDAsMjYuMzMsMTUuM1ptNC40MSwxMy44YTIuODMsMi44MywwLDAsMC0uMTYtMkEyLjksMi45LDAsMCwwLDI5LjI1LDI2YTQuMTgsNC4xOCwwLDAsMC0uOC0uMjlsLTQuNjEtMS4wOWEyLjgzLDIuODMsMCwwLDAtMi40MS41MywyLjg0LDIuODQsMCwwLDAtLjg5LDIuMzMsMi45MywyLjkzLDAsMCwwLDEuMzIsMS45Miw0LjE4LDQuMTgsMCwwLDAsLjguMjlsNC42MiwxLjFhMi44NSwyLjg1LDAsMCwwLDIuNC0uNTNBMi44NSwyLjg1LDAsMCwwLDMwLjc0LDI5LjFaTTM3LDQ2LjE1YTMsMywwLDEsMC00LjM0LjQ4QTMsMywwLDAsMCwzNyw0Ni4xNVptMy40My0yMC40NGE0LjMxLDQuMzEsMCwwLDAsMC0xLjA2LDMsMywwLDAsMC0uNDgtMS45MSwzLjM0LDMuMzQsMCwwLDAtMS42Mi0xLjEsMi45MiwyLjkyLDAsMCwwLTIsLjE0LDIuOCwyLjgsMCwwLDAtMS4zNCwxLjM0LDIuOTIsMi45MiwwLDAsMC0uMTMsMmwtLjA2LS4wOWEzLjM0LDMuMzQsMCwwLDAsLjQ4LDEuOTEsMywyLDAsMCwwLDEuNjIsMS4xLDIuOTIsMi45MiwwLDAsMCwyLS4xNUEyLjc5LDIuNzksMCwwLDAsNDAuNDQsMjUuNzFabS0xNiw5LjMxYTMsMywwLDAsMC0xLjI3LDEuNzcsMy4wNSwzLjA1LDAsMCwwLC4yNCwyLjIxLDMsMywwLDAsMCwxLjc1LDEuMywzLDMsMCwwLDAsMi4yMy0yLjIzLDMsMywwLDAsMCwxLjI4LTEuNzYsMy4wNywzLjA3LDAsMCwwLTEuNjQtMi4yMkEzLjksMy45LDAsMCwwLDI3LjMzLDQ5LjExWk02LjU5LDM0LjcxYTQsNCwwLDAsMC0uNjEuMzVsLTEuODIsMS41NUEyLjgyLDIuODIsMCwwLDAsMy40MiwzOWEyLjgzLDIuODMsMCwwLDAsMS4yMiwyLjA3QTMsMywwLDAsMCw2LjgxLDQxLjdhNCw0LDAsMCwwLC42MS0uMzZMMTkuMjUsMyIvPjwvc3ZnPg==')]"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-6">
              Prêt à optimiser votre gestion de paie ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez des milliers d'entreprises et de professionnels qui font confiance à PayeAfrique pour leurs besoins de paie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-benin-green px-8 py-4 rounded-lg font-medium shadow-lg transform transition-all hover:scale-105">
                Créer un compte
              </Link>
              <Link to="/simulation" className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium transition-all hover:bg-white/10">
                Essayer sans inscription
              </Link>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-tr-full"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full"></div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
