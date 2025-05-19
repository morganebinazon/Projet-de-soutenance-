
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-heading font-bold text-gray-900 dark:text-white">
                Paye<span className="text-benin-green">Afrique</span>
              </span>
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
              La plateforme de simulation et gestion de paie pour le Bénin et le Togo.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Plateforme
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/simulation"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  Simulation de salaire
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Ressources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/resources/benin"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  Législation Bénin
                </Link>
              </li>
              <li>
                <Link
                  to="/resources/togo"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  Législation Togo
                </Link>
              </li>
              <li>
                <Link
                  to="/resources/faq"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Légal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/cookies"
                  className="text-gray-600 dark:text-gray-400 hover:text-benin-green dark:hover:text-benin-green text-sm"
                >
                  Politique des cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            &copy; {currentYear} PayeAfrique. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
