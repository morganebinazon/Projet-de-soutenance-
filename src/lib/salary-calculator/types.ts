export type FamilyStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface TaxTranche {
  min: number;
  max: number;
  taux: number;
}

export interface SalaryInput {
  salaireBrut: number;
  familyStatus: FamilyStatus;
  children: string;
  transportBonus?: number;
  housingBonus?: number;
  thirteenthMonth?: boolean;
}

export interface SalaryResult {
  salaireBrut: number;
  totalBrut: number;
  salaireNet: number;
  cnssEmploye: number;
  fraisPro: number;
  baseImposable: number;
  impots: number;
  impotsDetails: Array<{
    tranche: string;
    taux: number;
    base: number;
    impot: number;
  }>;
  quotientFamilial?: number;
  chargesPatronales: number;
  coutTotal: number;
  tauxPrelevement: number;
  tauxNet: number;
  detailsChargesPatronales: {
    cnssPatronal: number;
    prestationsFamiliales?: number;
    versementPatronal?: number;
    risqueProfessionnel?: number;
  };
  avantages: {
    transport: number;
    logement: number;
  };
}

export interface CountryConstants {
  CNSS_EMPLOYE: number;
  CNSS_PATRONAL: number;
  PRESTATIONS_FAMILIALES?: number;
  VERSEMENT_PATRONAL?: number;
  RISQUE_PROFESSIONNEL?: number;
  FRAIS_PRO_TAUX: number;
  FRAIS_PRO_PLAFOND: number;
  CNSS_PLAFOND: number;
  PF_VP_PLAFOND?: number;
  IMPOTS_TRANCHES: TaxTranche[];
  QUOTIENT_FAMILIAL?: {
    [key in FamilyStatus]: number;
  };
  ENFANT_SUPPLEMENT?: number;
  QUOTIENT_FAMILIAL_MAX?: number;
  IMF_MONTANT?: number;
} 