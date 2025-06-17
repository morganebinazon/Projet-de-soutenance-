import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import CountrySelector from "../country/CountrySelector";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
                className={`transition-colors ${isActive("/simulation")
                    ? "text-benin-green font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green"
                  }`}
              >
                Simulation
              </Link>
              <Link
                to="/resources"
                className={`transition-colors ${isActive("/resources")
                    ? "text-benin-green font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green"
                  }`}
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

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">
                        {user?.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Mon profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="">Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login">Connexion</Link>
                  </Button>
                  <Button className="bg-benin-green hover:bg-benin-green/90" asChild>
                    <Link to="/register">Inscription</Link>
                  </Button>
                </>
              )}
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
                className={`py-2 ${isActive("/simulation")
                    ? "text-benin-green font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Simulation
              </Link>
              <Link
                to="/resources"
                className={`py-2 ${isActive("/resources")
                    ? "text-benin-green font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-benin-green dark:hover:text-benin-green"
                  }`}
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

              {isAuthenticated ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    asChild
                  >
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                  </Button>
                  <Button className="w-full bg-benin-green hover:bg-benin-green/90" asChild>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>Inscription</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;