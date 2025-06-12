// Constantes pour les calculs des frais professionnels
export const FRAIS_PRO_RATE = 0.20; // 20% pour frais professionnels
export const FRAIS_PRO_PLAFOND_MENSUEL = 84334; // Plafond mensuel exact pour le Togo
export function calculateNetToBrutBenin(netSalary: number, familyStatus: string, childrenCount: number) {
  // Initialisation des variables pour le calcul itératif
  let salaireBrut = netSalary * 1.2; // Estimation initiale
  let difference = Infinity;
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 0.01;

  // Calcul itératif pour trouver le salaire brut
  while (Math.abs(difference) > tolerance && iterations < maxIterations) {
    // Calcul des cotisations sociales
    const cnss = Math.round(salaireBrut * BENIN.CNSS_SALARIAL);
    
    // Calcul de l'ITS
    const its = calculateITSBenin(salaireBrut);
    
    // Calcul du net à partir du brut estimé
    const netCalcule = salaireBrut - cnss - its;
    
    // Calcul de la différence avec le net souhaité
    difference = netSalary - netCalcule;
    
    // Ajustement du brut
    salaireBrut = salaireBrut + difference;
    iterations++;
  }

  // Calcul final des composants avec le salaire brut trouvé
  const cnss = Math.round(salaireBrut * BENIN.CNSS_SALARIAL);
  const its = calculateITSBenin(salaireBrut);
  const itsDetails = calculateITSBeninDetails(salaireBrut);

  return {
    salaireBrut: Math.round(salaireBrut),
    details: {
      cnss: cnss,
      its: {
        total: its,
        details: itsDetails
      }
    }
  };
}

export function calculateNetToBrutTogo(netSalary: number, familyStatus: string = 'single', childrenCount: number = 0) {
  // Initialisation des variables pour le calcul itératif
  let salaireBrut = netSalary * 1.2; // Estimation initiale
  let difference = Infinity;
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 0.01;

  // Calcul itératif pour trouver le salaire brut
  while (Math.abs(difference) > tolerance && iterations < maxIterations) {
    // Calcul des cotisations sociales
    const cnss = Math.round(salaireBrut * TOGO.CNSS_SALARIAL.TOTAL);
    const amu = Math.round(salaireBrut * TOGO.CNSS_SALARIAL.AMU);
    
    // Calcul des frais professionnels
    const fraisPro = calculateFraisPro(salaireBrut, cnss);
    
    // Base imposable
    const baseImposable = salaireBrut - cnss - fraisPro;
    
    // Calcul de l'IRPP
    const irpp = calculateIRPPTogo(baseImposable);
    
    // Calcul du net à partir du brut estimé
    const netCalcule = salaireBrut - cnss - irpp;
    
    // Calcul de la différence avec le net souhaité
    difference = netSalary - netCalcule;
    
    // Ajustement du brut
    salaireBrut = salaireBrut + difference;
    iterations++;
  }

  // Calculs finaux avec le salaire brut trouvé
  const cnss = Math.round(salaireBrut * TOGO.CNSS_SALARIAL.TOTAL);
  const amu = Math.round(salaireBrut * TOGO.CNSS_SALARIAL.AMU);
  const fraisPro = calculateFraisPro(salaireBrut, cnss);
  const baseImposable = salaireBrut - cnss - fraisPro;
  const irpp = calculateIRPPTogo(baseImposable);
  const irppDetails = calculateIRPPTogoDetails(baseImposable);

  return {
    salaireBrut: Math.round(salaireBrut),
    details: {
      cnss,
      amu,
      fraisPro,
      baseImposable,
      irpp: {
        total: irpp,
        details: irppDetails
      }
    }
  };
}

// Fonction auxiliaire pour calculer les détails de l'IRPP par tranches
function calculateIRPPTogoDetails(baseImposable: number) {
  const details = [];
  let montantRestant = baseImposable;
  
  for (const tranche of TOGO.IRPP_TRANCHES) {
    if (montantRestant <= 0) break;
    
    const montantDansLaTranche = Math.min(
      montantRestant,
      tranche.max === Infinity ? montantRestant : tranche.max - tranche.min
    );
    
    if (montantDansLaTranche > 0) {
      details.push({
        tranche: `${formatCurrency(tranche.min)} - ${tranche.max === Infinity ? '∞' : formatCurrency(tranche.max)}`,
        taux: tranche.taux,
        montant: Math.round(montantDansLaTranche * tranche.taux),
        base: montantDansLaTranche
      });
    }
    
    montantRestant -= montantDansLaTranche;
  }
  
  return details;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

// Constantes CNSS et AMU Togo 2024-2025
export const TOGO = {
  CNSS_SALARIAL: {
    PENSION: 0.04,    // 4% pension vieillesse
    AMU: 0.05,       // 5% assurance maladie (INAM)
    AUTRES: 0.0068,  // 0.68% autres rubriques
    TOTAL: 0.0968    // 9.68% au total
  },
  CNSS_PATRONAL: {
    PENSION: 0.125,    // 12.5% pension vieillesse
    PF: 0.03,         // 3% prestations familiales
    AT: 0.02,         // 2% accidents du travail/risques professionnels
    AMU: 0.05,        // 5% assurance maladie
    TOTAL: 0.225      // 22.5% au total
  },
  IRPP_TRANCHES: [
    { min: 0, max: 60000, taux: 0 },
    { min: 60001, max: 150000, taux: 0.10 },
    { min: 150001, max: 300000, taux: 0.15 },
    { min: 300001, max: 500000, taux: 0.20 },
    { min: 500001, max: 800000, taux: 0.25 },
    { min: 800001, max: Infinity, taux: 0.30 }
  ]
};

// Constantes CNSS Bénin 2025
export const BENIN = {
  CNSS_SALARIAL: 0.036, // 3.6%
  CNSS_PATRONAL: 0.154, // 15.4% (6.4% vieillesse + 9% PF + 0.5% AT)
  ITS_TRANCHES: [
    { min: 0, max: 60000, taux: 0 },
    { min: 60001, max: 150000, taux: 0.10 },
    { min: 150001, max: 250000, taux: 0.15 },
    { min: 250001, max: 500000, taux: 0.19 },
    { min: 500001, max: Infinity, taux: 0.30 }
  ]
};

// Fonction pour calculer l'IRPP au Togo avec la méthode par tranches
export const calculateIRPPTogo = (baseImposable: number): number => {
  let irpp = 0;
  
  for (const tranche of TOGO.IRPP_TRANCHES) {
    if (baseImposable > tranche.min) {
      const montantDansLaTranche = Math.min(
        baseImposable - tranche.min,
        tranche.max - tranche.min
      );
      irpp += montantDansLaTranche * tranche.taux;
    }
  }
  
  return Math.round(irpp);
};

// Fonction pour calculer la CNSS
export const calculateCNSS = (salaireBrut: number, country: string) => {
  if (country === "benin") {
    return Math.round(salaireBrut * BENIN.CNSS_SALARIAL);
  } else {
    // Pour le Togo, on calcule la CNSS totale (9.68%)
    return Math.round(salaireBrut * TOGO.CNSS_SALARIAL.TOTAL);
  }
};

// Fonction pour calculer les frais professionnels
export const calculateFraisPro = (salaireBrut: number, cotisationsSociales: number) => {
  if (salaireBrut <= 0) return 0;
  
  // Pour le Togo : 20% du (brut - cotisations), plafonné à 84 334 FCFA
  const baseCalculFrais = salaireBrut - cotisationsSociales;
  const fraisPro = baseCalculFrais * FRAIS_PRO_RATE;
  return Math.round(Math.min(fraisPro, FRAIS_PRO_PLAFOND_MENSUEL));
};
export function calculateChargesPatronalesBenin(salaireBrut: number): number {
  const taux = 0.15;
  return salaireBrut * taux;
};

// Fonction pour calculer les charges patronales au Togo
export const calculateChargesPatronalesTogo = (salaireBrut: number) => {
  const totalCharges = salaireBrut * TOGO.CNSS_PATRONAL.TOTAL;
  
  return {
    pension: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.PENSION),
    pf: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.PF),
    at: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.AT),
    amu: Math.round(salaireBrut * TOGO.CNSS_PATRONAL.AMU),
    total: Math.round(totalCharges)
  };
};

// Fonction pour calculer l'ITS au Bénin
export const calculateITSBenin = (baseImposable: number): number => {
  let its = 0;
  
  // Tranche 1 : 0 à 60 000 FCFA (0%)
  its += Math.min(60000, baseImposable) * 0;
  
  // Tranche 2 : 60 001 à 150 000 FCFA (10%)
  if (baseImposable > 60000) {
    its += (Math.min(150000, baseImposable) - 60000) * 0.10;
  }
  
  // Tranche 3 : 150 001 à 250 000 FCFA (15%)
  if (baseImposable > 150000) {
    its += (Math.min(250000, baseImposable) - 150000) * 0.15;
  }
  
  // Tranche 4 : 250 001 à 500 000 FCFA (19%)
  if (baseImposable > 250000) {
    its += (Math.min(500000, baseImposable) - 250000) * 0.19;
  }
  
  // Tranche 5 : Au-delà de 500 000 FCFA (30%)
  if (baseImposable > 500000) {
    its += (baseImposable - 500000) * 0.30;
  }
  
  return Math.round(its);
};

// Fonction auxiliaire pour calculer les détails de l'ITS par tranches
function calculateITSBeninDetails(baseImposable: number) {
  const details = [];
  let montantRestant = baseImposable;
  
  // Tranche 1 : 0 à 60 000 FCFA (0%)
  const tranche1 = Math.min(60000, montantRestant);
  details.push({
    tranche: "0 - 60 000",
    taux: 0,
    montant: 0,
    base: tranche1
  });
  montantRestant -= tranche1;

  // Tranche 2 : 60 001 à 150 000 FCFA (10%)
  if (montantRestant > 0) {
    const tranche2 = Math.min(90000, montantRestant);
    details.push({
      tranche: "60 001 - 150 000",
      taux: 0.10,
      montant: Math.round(tranche2 * 0.10),
      base: tranche2
    });
    montantRestant -= tranche2;
  }

  // Tranche 3 : 150 001 à 250 000 FCFA (15%)
  if (montantRestant > 0) {
    const tranche3 = Math.min(100000, montantRestant);
    details.push({
      tranche: "150 001 - 250 000",
      taux: 0.15,
      montant: Math.round(tranche3 * 0.15),
      base: tranche3
    });
    montantRestant -= tranche3;
  }

  // Tranche 4 : 250 001 à 500 000 FCFA (19%)
  if (montantRestant > 0) {
    const tranche4 = Math.min(250000, montantRestant);
    details.push({
      tranche: "250 001 - 500 000",
      taux: 0.19,
      montant: Math.round(tranche4 * 0.19),
      base: tranche4
    });
    montantRestant -= tranche4;
  }

  // Tranche 5 : Au-delà de 500 000 FCFA (30%)
  if (montantRestant > 0) {
    details.push({
      tranche: "Plus de 500 000",
      taux: 0.30,
      montant: Math.round(montantRestant * 0.30),
      base: montantRestant
    });
  }

  return details;
}

// Fonction principale pour calculer l'impôt
export const calculateImpot = (
  salaireBrut: number, 
  country: string, 
  familyStatus: string, 
  childrenCount: number
) => {
  if (country === "benin") {
    // Pour le Bénin, on utilise l'ITS sur le salaire brut
    return calculateITSBenin(salaireBrut);
  } else {
    // Pour le Togo, on calcule l'IRPP sur la base imposable
    const cotisationsSociales = calculateCNSS(salaireBrut, country);
    const fraisPro = calculateFraisPro(salaireBrut, cotisationsSociales);
    const baseImposable = salaireBrut - cotisationsSociales - fraisPro;
    
    // Calcul de l'IRPP avec réduction familiale pour le Togo
    let irpp = calculateIRPPTogo(baseImposable);
    
    // Réduction familiale : 10% par enfant, maximum 30% (3 enfants)
    if (childrenCount > 0) {
      const reductionRate = Math.min(childrenCount * 0.1, 0.3);
      irpp = Math.round(irpp * (1 - reductionRate));
    }
    
    return irpp;
  }
}; 