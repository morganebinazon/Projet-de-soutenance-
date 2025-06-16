import { BENIN } from './constants';
import { SalaryInput, SalaryResult, FamilyStatus } from './types';

/**
 * Calcule le salaire net à partir du salaire brut pour le Bénin
 */
export const calculateBeninSalary = ({
    salaireBrut,
    familyStatus,
    children,
    transportBonus = 0,
    housingBonus = 0,
    thirteenthMonth = false // Ce paramètre n'est pas utilisé pour un calcul mensuel standard ici.
}: SalaryInput): SalaryResult => {
    // Calcul du total brut (salaire + primes non soumises aux cotisations/impôts)
    // IMPORTANT : Si ces primes doivent être soumises au-delà de certains plafonds,
    // la logique devrait être ajustée pour inclure la partie imposable dans l'assiette CNSS et la base imposable ITS.
    const totalBrut = salaireBrut + transportBonus + housingBonus;

    // CNSS employé
    const assietteCNSS = Math.min(salaireBrut, BENIN.CNSS_PLAFOND);
    const cnssEmploye = Math.round(assietteCNSS * BENIN.CNSS_EMPLOYE);

    // Frais professionnels (20% sur Salaire Brut Imposable, plafonné à 50 000 FCFA/mois)
    const baseApresCharges = salaireBrut - cnssEmploye;
    const fraisPro = Math.min(baseApresCharges * BENIN.FRAIS_PRO_TAUX, BENIN.FRAIS_PRO_PLAFOND);

    // Base imposable ITS
    const baseImposable = baseApresCharges - fraisPro;

    // Quotient familial
    const childrenCount = parseInt(children) || 0;
    // La part du contribuable est généralement 1, indépendamment du statut marital
    let rawQuotientFamilial = BENIN.QUOTIENT_FAMILIAL[familyStatus] + (childrenCount * BENIN.ENFANT_SUPPLEMENT!);
    // CORRECTION : Plafonnement du quotient familial à BENIN.QUOTIENT_FAMILIAL_MAX (5 parts)
    const quotientFamilial = Math.min(rawQuotientFamilial, BENIN.QUOTIENT_FAMILIAL_MAX!);

    // Calcul ITS par tranches (annuel)
    const baseParPart = (baseImposable * 12) / quotientFamilial;
    let itsAnnuel = 0;
    const impotsDetails = [];

    for (const tranche of BENIN.IMPOTS_TRANCHES) {
        if (baseParPart > tranche.min) {
            // CORRECTION ICI : Retrait du "+ 1" car les tranches dans constants.ts commencent à X+1
            const montantTranche = Math.min(baseParPart, tranche.max) - tranche.min;
            const itsTranche = montantTranche * tranche.taux;
            itsAnnuel += itsTranche;

            // Pour l'affichage des détails
            if (montantTranche > 0) {
                impotsDetails.push({
                    tranche: `${tranche.min.toLocaleString()} - ${tranche.max === Infinity ? '∞' : tranche.max.toLocaleString()}`,
                    taux: tranche.taux * 100,
                    base: Math.round(montantTranche),
                    impot: Math.round(itsTranche)
                });
            }
        }
    }

    const impots = Math.round((itsAnnuel * quotientFamilial) / 12);

    // Salaire net
    const salaireNet = totalBrut - cnssEmploye - impots;

    // Charges patronales
    const cnssPatronal = Math.round(assietteCNSS * BENIN.CNSS_PATRONAL);
    const prestationsFamiliales = Math.round(Math.min(salaireBrut, BENIN.PF_VP_PLAFOND!) * BENIN.PRESTATIONS_FAMILIALES!);
    const versementPatronal = Math.round(Math.min(salaireBrut, BENIN.PF_VP_PLAFOND!) * BENIN.VERSEMENT_PATRONAL!);
    const risqueProfessionnel = Math.round(salaireBrut * BENIN.RISQUE_PROFESSIONNEL!);
    const chargesPatronales = cnssPatronal + prestationsFamiliales + versementPatronal + risqueProfessionnel;

    return {
        salaireBrut,
        totalBrut,
        salaireNet,
        cnssEmploye,
        fraisPro,
        baseImposable,
        impots,
        impotsDetails,
        quotientFamilial,
        chargesPatronales,
        coutTotal: totalBrut + chargesPatronales,
        // Éviter la division par zéro si totalBrut est 0
        tauxPrelevement: totalBrut > 0 ? ((cnssEmploye + impots) / totalBrut) * 100 : 0,
        tauxNet: totalBrut > 0 ? (salaireNet / totalBrut) * 100 : 0,
        detailsChargesPatronales: {
            cnssPatronal,
            prestationsFamiliales,
            versementPatronal,
            risqueProfessionnel
        },
        avantages: { transport: transportBonus, logement: housingBonus }
    };
};

/**
 * Calcule le salaire brut nécessaire pour obtenir un salaire net souhaité (pour le Bénin)
 */
export const calculateBeninNetToBrut = (
    netSouhaite: number,
    familyStatus: FamilyStatus, // Utilisation du type FamilyStatus
    children: string,
    transportBonus: number = 0, // AJOUTÉ : Pour une meilleure cohérence
    housingBonus: number = 0 // AJOUTÉ : Pour une meilleure cohérence
): number => {
    let salaireBrut = netSouhaite * 1.4; // Estimation initiale
    let iterations = 0;
    const maxIterations = 100;
    const precision = 1; // Précision de 1 FCFA

    while (iterations < maxIterations) {
        const result = calculateBeninSalary({
            salaireBrut,
            familyStatus,
            children,
            transportBonus, // PASSÉ : Les bonus sont pris en compte dans le rétro-calcul
            housingBonus
        });

        if (Math.abs(result.salaireNet - netSouhaite) <= precision) {
            return Math.round(salaireBrut);
        }

        const ecart = netSouhaite - result.salaireNet;
        // Ajustement du salaire brut pour se rapprocher du net souhaité
        // Le coefficient 1.3 peut être ajusté pour une convergence plus rapide si nécessaire
        salaireBrut += ecart * 1.3;
        iterations++;
    }

    return Math.round(salaireBrut); // Retourne la meilleure estimation après maxIterations
};