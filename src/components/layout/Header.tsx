
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import CountrySelector from "../country/CountrySelector";
import Logo from "./Logo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-heading font-bold text-gray-900 dark:text-white">
                Paye<span className="text-benin-green">Afrique</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            <nav className="flex items-center space-x-6">
              <Link 
                to="/simulation" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green transition-colors"
              >
                Simulation
              </Link>
              <Link 
                to="/resources" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green transition-colors"
              >
                Ressources
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green transition-colors"
              >
                À propos
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <CountrySelector />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              
              <Button className="bg-benin-green hover:bg-benin-green/90" asChild>
                <Link to="/register">Inscription</Link>
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/simulation" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Simulation
              </Link>
              <Link 
                to="/resources" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Ressources
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CountrySelector />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                </Button>
                <Button className="w-full bg-benin-green hover:bg-benin-green/90" asChild>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>Inscription</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
