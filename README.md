# PayeAfrique - Plateforme de Simulation et Gestion de Paie

PayeAfrique est une plateforme moderne et intuitive pour calculer et gérer les salaires conformément aux législations fiscales et sociales en Afrique de l'Ouest, spécifiquement au Bénin et au Togo.

![PayeAfrique Screenshot](./public/images/dashboard-preview.png)

## 🌟 Fonctionnalités

- **Simulation de salaire** : Calcul précis du net au brut ou du brut au net
- **Gestion de la paie** : Dashboard employeur pour gérer la masse salariale
- **Espace employé** : Interface personnalisée pour les salariés
- **Multi-pays** : Support des législations béninoise et togolaise
- **Documentation complète** : Ressources et guides explicatifs sur la fiscalité
- **Design responsive** : Utilisation optimale sur ordinateur, tablette et mobile

## 🚀 Démarrage rapide

### Prérequis

- Node.js 16.x ou supérieur
- npm 8.x ou supérieur

### Installation

1. Clonez le dépôt
```bash
git clone https://github.com/Naesmal/paye-afrique.git
cd paye-afrique
```

2. Installez les dépendances
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet (voir `.env.example` pour les variables requises)
```bash
cp .env.example .env
```

4. Lancez l'application en mode développement
```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:5173](http://localhost:5173)

### Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise la version de production localement
- `npm run lint` - Vérifie le code avec ESLint
- `npm run test` - Exécute les tests

## 🧰 Technologies utilisées

- **[Vite](https://vitejs.dev/)** - Build tool ultra-rapide
- **[React](https://reactjs.org/)** - Bibliothèque UI
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI réutilisables
- **[Lucide React](https://lucide.dev/)** - Collection d'icônes
- **[React Router](https://reactrouter.com/)** - Navigation
- **[Recharts](https://recharts.org/)** - Bibliothèque de graphiques

## 📚 Documentation

La documentation détaillée est disponible dans le répertoire `docs/` à la racine du projet. Elle inclut :

- Guide d'utilisation pour les employeurs
- Guide d'utilisation pour les employés
- Documentation technique
- Guides de développement
- Explications sur les calculs fiscaux et sociaux

## 🚢 Déploiement

### Construction pour la production

```bash
npm run build
```

Les fichiers de production seront générés dans le répertoire `dist/`.

### Hébergement

L'application peut être hébergée sur n'importe quelle plateforme supportant les applications statiques modernes :

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- etc.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Validez vos modifications (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

Veuillez consulter le fichier CONTRIBUTING.md pour les directives détaillées.

## 📝 Licence

Ce projet est sous licence [MIT](LICENSE).

## 📞 Contact

Pour toute question ou suggestion, veuillez nous contacter à [contact@payeafrique.com](mailto:contact@payeafrique.com)

---

Développé avec ❤️ pour l'Afrique de l'Ouest