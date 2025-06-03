import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Déclenche l'animation après un très court délai (par exemple, 50ms).
    // Cela aide à s'assurer que l'état initial 'opacity-0' est bien appliqué
    // avant que l'animation ne commence, surtout sur des chargements rapides.
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 50); // <--- AJOUTÉ : Un petit délai ici

    // Fonction de nettoyage pour annuler le timer si le composant est démonté
    return () => clearTimeout(timer);
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une seule fois au montage

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Applique la classe d'animation si hasAnimated est vrai, sinon opacity-0 */}
      <main className={`flex-grow ${hasAnimated ? 'animate-fade-in-up' : 'opacity-0'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;