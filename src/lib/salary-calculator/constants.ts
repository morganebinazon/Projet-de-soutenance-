import { CountryConstants } from './types';

export const BENIN: CountryConstants = {
    // Cotisations sociales
    CNSS_EMPLOYE: 0.036, // 3.6% CNSS VID
    CNSS_PLAFOND: 350000, // Plafond CNSS Bénin

    // Charges patronales
    CNSS_PATRONAL_VIEILLESSE_TAUX: 0.05, // 5% CNSS Famille
    CNSS_PATRONAL_PRESTATIONS_FAMILIALES_TAUX: 0.015, // 1.5% CNSS AT/MP
    CNSS_PATRONAL_ACCIDENTS_TRAVAIL_TAUX: 0.005, // 0.5% TDL
    CNSS_PATRONAL_PLAFOND_SPECIFIQUE: 350000, // Plafond pour les charges patronales

    // Taxes additionnelles
    TAXE_DEVELOPPEMENT_LOCAL: 0.005, // 0.5% TDL
    TAXE_APPRENTISSAGE: 0.005, // 0.5% TA
    TAXE_FORMATION_PROFESSIONNELLE: 0.005, // 0.5% PEFPC
    TAXE_SALAIRE: 0.015, // 1.5% TS

    // Frais professionnels
    FRAIS_PRO_TAUX: 0.20, // 20%
    FRAIS_PRO_PLAFOND: Infinity, // Pas de plafond pour les frais professionnels

    // Barème ITS (annuel)
    IMPOTS_TRANCHES: [
        { min: 0, max: 60000, taux: 0 },
        { min: 60001, max: 150000, taux: 0.10 },
        { min: 150001, max: 250000, taux: 0.15 },
        { min: 250001, max: 500000, taux: 0.19 },
        { min: 500001, max: Infinity, taux: 0.30 }
    ],

    // Quotient familial
    QUOTIENT_FAMILIAL: {
        single: 1,
        married: 1,
        divorced: 1,
        widowed: 1
    },
    ENFANT_SUPPLEMENT: 0.5,
    QUOTIENT_FAMILIAL_MAX: 5
};

export const TOGO: CountryConstants = {
    // Cotisations sociales
    CNSS_EMPLOYE: 0.0968, // 9.68% (4% pension + 5% AMU + 0.68% autres)
    CNSS_PATRONAL: 0.225, // 22.5% (12.5% pension + 3% PF + 2% AT + 5% AMU)
    CNSS_PLAFOND: 300000, // Plafond CNSS Togo

    // Frais professionnels
    FRAIS_PRO_TAUX: 0.20, // 20%
    FRAIS_PRO_PLAFOND: 84334, // Plafond mensuel exact pour le Togo

    // Barème IRPP (annuel)
    IMPOTS_TRANCHES: [
        { min: 0, max: 60000, taux: 0 },
        { min: 60001, max: 150000, taux: 0.10 },
        { min: 150001, max: 300000, taux: 0.15 },
        { min: 300001, max: 500000, taux: 0.20 },
        { min: 500001, max: 800000, taux: 0.25 },
        { min: 800001, max: Infinity, taux: 0.30 }
    ],
    IMF_MONTANT: 3000 // Impôt Minimum Forfaitaire (IMF) au Togo
};

// Mise à jour de l'interface CountryConstants pour inclure les nouvelles constantes patronales
// (Ceci doit aller dans types.ts, mais je le note ici pour vous rappeler la modification)
/*
export interface CountryConstants {
    // ... autres propriétés
    CNSS_PATRONAL_VIEILLESSE_TAUX?: number;
    CNSS_PATRONAL_PRESTATIONS_FAMILIALES_TAUX?: number;
    CNSS_PATRONAL_ACCIDENTS_TRAVAIL_TAUX?: number;
    CNSS_PATRONAL_PLAFOND_SPECIFIQUE?: number;
}
*/