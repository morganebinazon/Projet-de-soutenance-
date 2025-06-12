// Fonction pour calculer les détails de l'ITS au Bénin par tranches
export const calculateITSDetailsBenin = (baseImposable: number) => {
  const details = [];
  let montantTotal = 0;

  // Tranche 1 : 0 à 60 000 FCFA (0%)
  if (baseImposable > 0) {
    const montantTranche = Math.min(60000, baseImposable);
    details.push({
      tranche: "0 - 60 000 FCFA",
      taux: "0%",
      montant: 0,
      montantTranche
    });
  }

  // Tranche 2 : 60 001 à 150 000 FCFA (10%)
  if (baseImposable > 60000) {
    const montantTranche = Math.min(150000, baseImposable) - 60000;
    const montant = montantTranche * 0.10;
    montantTotal += montant;
    details.push({
      tranche: "60 001 - 150 000 FCFA",
      taux: "10%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  // Tranche 3 : 150 001 à 250 000 FCFA (15%)
  if (baseImposable > 150000) {
    const montantTranche = Math.min(250000, baseImposable) - 150000;
    const montant = montantTranche * 0.15;
    montantTotal += montant;
    details.push({
      tranche: "150 001 - 250 000 FCFA",
      taux: "15%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  // Tranche 4 : 250 001 à 500 000 FCFA (19%)
  if (baseImposable > 250000) {
    const montantTranche = Math.min(500000, baseImposable) - 250000;
    const montant = montantTranche * 0.19;
    montantTotal += montant;
    details.push({
      tranche: "250 001 - 500 000 FCFA",
      taux: "19%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  // Tranche 5 : Au-delà de 500 000 FCFA (30%)
  if (baseImposable > 500000) {
    const montantTranche = baseImposable - 500000;
    const montant = montantTranche * 0.30;
    montantTotal += montant;
    details.push({
      tranche: "Plus de 500 000 FCFA",
      taux: "30%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  return details;
};

// Fonction pour calculer les détails de l'IRPP au Togo par tranches
export const calculateIRPPDetailsTogo = (baseImposable: number) => {
  const details = [];
  let montantTotal = 0;

  // Tranche 1 : 0 à 60 000 FCFA (0%)
  if (baseImposable > 0) {
    const montantTranche = Math.min(60000, baseImposable);
    details.push({
      tranche: "0 - 60 000 FCFA",
      taux: "0%",
      montant: 0,
      montantTranche
    });
  }

  // Tranche 2 : 60 001 à 150 000 FCFA (10%)
  if (baseImposable > 60000) {
    const montantTranche = Math.min(150000, baseImposable) - 60000;
    const montant = montantTranche * 0.10;
    montantTotal += montant;
    details.push({
      tranche: "60 001 - 150 000 FCFA",
      taux: "10%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  // Tranche 3 : 150 001 à 300 000 FCFA (15%)
  if (baseImposable > 150000) {
    const montantTranche = Math.min(300000, baseImposable) - 150000;
    const montant = montantTranche * 0.15;
    montantTotal += montant;
    details.push({
      tranche: "150 001 - 300 000 FCFA",
      taux: "15%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  // Tranche 4 : 300 001 à 500 000 FCFA (20%)
  if (baseImposable > 300000) {
    const montantTranche = Math.min(500000, baseImposable) - 300000;
    const montant = montantTranche * 0.20;
    montantTotal += montant;
    details.push({
      tranche: "300 001 - 500 000 FCFA",
      taux: "20%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  // Tranche 5 : 500 001 à 800 000 FCFA (25%)
  if (baseImposable > 500000) {
    const montantTranche = Math.min(800000, baseImposable) - 500000;
    const montant = montantTranche * 0.25;
    montantTotal += montant;
    details.push({
      tranche: "500 001 - 800 000 FCFA",
      taux: "25%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  // Tranche 6 : Au-delà de 800 000 FCFA (30%)
  if (baseImposable > 800000) {
    const montantTranche = baseImposable - 800000;
    const montant = montantTranche * 0.30;
    montantTotal += montant;
    details.push({
      tranche: "Plus de 800 000 FCFA",
      taux: "30%",
      montant: Math.round(montant),
      montantTranche
    });
  }

  return details;
}; 