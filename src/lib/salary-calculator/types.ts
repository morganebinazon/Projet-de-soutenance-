export type FamilyStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface TaxTranche {
  min: number;
  max: number;
  taux: number;
}

export interface SalaryInput {
  salaireBrut: number;
  familyStatus: FamilyStatus;
  children: number;
  transportBonus?: number;
  housingBonus?: number;
}

export interface SalaryResult {
  totalBrut: number;
  netSalary: number;
  details: {
    cnss: number;
    its?: number;
    irpp?: number;
    fraisPro: number;
    baseImposable: number;
    chargesPatronales: {
      total: number;
      vieillesse?: number;
      prestationsFamiliales?: number;
      accidentsTravail?: number;
      taxeDeveloppementLocal?: number;
      taxeApprentissage?: number;
      taxeFormationProfessionnelle?: number;
      taxeSalaire?: number;
    };
  };
}

export interface CountryConstants {
  // Cotisations sociales
  CNSS_EMPLOYE: number;
  CNSS_PLAFOND: number;

  // Charges patronales
  CNSS_PATRONAL_VIEILLESSE_TAUX?: number;
  CNSS_PATRONAL_PRESTATIONS_FAMILIALES_TAUX?: number;
  CNSS_PATRONAL_ACCIDENTS_TRAVAIL_TAUX?: number;
  CNSS_PATRONAL_PLAFOND_SPECIFIQUE?: number;
  CNSS_PATRONAL?: number;

  // Taxes additionnelles
  TAXE_DEVELOPPEMENT_LOCAL?: number;
  TAXE_APPRENTISSAGE?: number;
  TAXE_FORMATION_PROFESSIONNELLE?: number;
  TAXE_SALAIRE?: number;

  // Frais professionnels
  FRAIS_PRO_TAUX: number;
  FRAIS_PRO_PLAFOND: number;

  // Barème d'impôt
  IMPOTS_TRANCHES: Array<{
    min: number;
    max: number;
    taux: number;
  }>;

  // Quotient familial
  QUOTIENT_FAMILIAL?: {
    single: number;
    married: number;
    divorced: number;
    widowed: number;
  };
  ENFANT_SUPPLEMENT?: number;
  QUOTIENT_FAMILIAL_MAX?: number;

  // Impôt minimum forfaitaire (pour le Togo)
  IMF_MONTANT?: number;
} 