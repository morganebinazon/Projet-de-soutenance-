import { CountryConstants } from './types';

export const BENIN: CountryConstants = {
    // Cotisations sociales
    CNSS_EMPLOYE: 0.036, // 3.6%
    CNSS_PATRONAL: 0.064, // 6.4%
    PRESTATIONS_FAMILIALES: 0.09, // 9%
    VERSEMENT_PATRONAL: 0.04, // 4%
    RISQUE_PROFESSIONNEL: 0.02, // 2%

    // Frais professionnels
    FRAIS_PRO_TAUX: 0.20, // 20%
    FRAIS_PRO_PLAFOND: 50000, // 50 000 FCFA

    // Plafonds
    CNSS_PLAFOND: 1666667, // Pour 60 000 FCFA de cotisation
    PF_VP_PLAFOND: 200000,

    // Barème ITS (annuel)
    IMPOTS_TRANCHES: [
        { min: 0, max: 600000, taux: 0 },
        { min: 600001, max: 1200000, taux: 0.10 },
        { min: 1200001, max: 2400000, taux: 0.15 },
        { min: 2400001, max: 4800000, taux: 0.20 },
        { min: 4800001, max: Infinity, taux: 0.25 }
    ],

    // Quotient familial
    QUOTIENT_FAMILIAL: {
        single: 1,
        married: 1,
        divorced: 1,
        widowed: 1
    },
    ENFANT_SUPPLEMENT: 0.5,
    QUOTIENT_FAMILIAL_MAX: 5 // Plafond total des parts pour le Bénin
};

export const TOGO: CountryConstants = {
    // Cotisations sociales
    CNSS_EMPLOYE: 0.09, // 9%
    CNSS_PATRONAL: 0.215, // 21.5%

    // Frais professionnels
    FRAIS_PRO_TAUX: 0.20, // 20%
    FRAIS_PRO_PLAFOND: 50000, // 50 000 FCFA

    // Plafonds
    CNSS_PLAFOND: 150000, // Plafond CNSS Togo

    // Barème IRPP (annuel)
    IMPOTS_TRANCHES: [
        { min: 0, max: 300000, taux: 0 },
        { min: 300001, max: 1200000, taux: 0.05 },
        { min: 1200001, max: 2400000, taux: 0.10 },
        { min: 2400001, max: 4800000, taux: 0.15 },
        { min: 4800001, max: 9600000, taux: 0.20 },
        { min: 9600001, max: Infinity, taux: 0.30 }
    ],
    IMF_MONTANT: 3000 // Impôt Minimum Forfaitaire (IMF) au Togo
};