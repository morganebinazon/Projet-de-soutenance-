// Constantes pour les calculs des frais professionnels
export const FRAIS_PRO_RATE = 0.20; // 20% pour frais professionnels
export const FRAIS_PRO_PLAFOND_MENSUEL = 84334; // Plafond mensuel exact pour le Togo
export function calculateNetToBrutBenin(netSalary: number, familyStatus: string, childrenCount: number): number {
  // Calcul du salaire brut à partir du net pour le Bénin
  const cotisationsSociales = netSalary * BENIN.CNSS_SALARIAL;
  const baseImposable = netSalary + cotisationsSociales;
  const its = calculateITSBenin(baseImposable);
  
  return Math.round(netSalary + cotisationsSociales + its);
}

export function calculateNetToBrutTogo(netSalary: number, familyStatus: string, childrenCount: number): number {
  // Calcul du salaire brut à partir du net pour le Togo
  const cotisationsSociales = netSalary * TOGO.CNSS_SALARIAL.TOTAL;
  const fraisPro = calculateFraisPro(netSalary, cotisationsSociales);
  const baseImposable = netSalary + cotisationsSociales + fraisPro;
  const irpp = calculateIRPPTogo(baseImposable);
  
  return Math.round(netSalary + cotisationsSociales + fraisPro + irpp);
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

// Fonction principale pour calculer l'impôt
export const calculateImpot = (
  salaireBrut: number, 
  country: string, 
  familyStatus: string, 
  childrenCount: number
) => {
  if (country === "benin") {
    return calculateITSBenin(salaireBrut);
  } else {
    // Pour le Togo
    const cotisationsSociales = calculateCNSS(salaireBrut, country);
    const fraisPro = calculateFraisPro(salaireBrut, cotisationsSociales);
    const baseImposable = salaireBrut - cotisationsSociales - fraisPro;
    return calculateIRPPTogo(baseImposable);
  }
  
}; 