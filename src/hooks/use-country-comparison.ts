
interface LegislationItem {
  feature: string;
  benin: string;
  togo: string;
  description?: string;
}

export const useCountryComparison = () => {
  const legislationComparison: LegislationItem[] = [
    {
      feature: "Salaire minimum (SMIG)",
      benin: "40 000 FCFA/mois",
      togo: "35 000 FCFA/mois",
      description: "Salaire minimum interprofessionnel garanti mensuel"
    },
    {
      feature: "Congés payés",
      benin: "24 jours ouvrables/an",
      togo: "30 jours ouvrables/an",
      description: "Jours de congés payés accordés par année de travail"
    },
    {
      feature: "Congé maternité",
      benin: "14 semaines",
      togo: "14 semaines",
      description: "Durée légale du congé maternité"
    },
    {
      feature: "Congé paternité",
      benin: "3 jours ouvrables",
      togo: "10 jours ouvrables",
      description: "Durée légale du congé paternité"
    },
    {
      feature: "Cotisations sociales (salarié)",
      benin: "3,6% du salaire brut",
      togo: "4% du salaire brut",
      description: "Pourcentage des cotisations sociales à la charge du salarié"
    },
    {
      feature: "Cotisations sociales (employeur)",
      benin: "16,4% du salaire brut",
      togo: "17,5% du salaire brut",
      description: "Pourcentage des cotisations sociales à la charge de l'employeur"
    },
    {
      feature: "Heures supplémentaires (1ère tranche)",
      benin: "Majoration de 15%",
      togo: "Majoration de 15%",
      description: "Majoration des 8 premières heures supplémentaires"
    },
    {
      feature: "Heures supplémentaires (2ème tranche)",
      benin: "Majoration de 40%",
      togo: "Majoration de 35%",
      description: "Majoration des heures supplémentaires au-delà de la 1ère tranche"
    },
    {
      feature: "Travail de nuit",
      benin: "Majoration de 65%",
      togo: "Majoration de 50%",
      description: "Majoration pour le travail effectué entre 21h et 5h"
    },
    {
      feature: "Impôt sur le revenu",
      benin: "Barème progressif",
      togo: "Barème progressif",
      description: "Système d'imposition sur les revenus des personnes"
    }
  ];

  return { legislationComparison };
};
