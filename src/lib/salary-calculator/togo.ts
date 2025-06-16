import { TOGO } from './constants';
import { SalaryInput, SalaryResult, FamilyStatus } from './types';

/**
 * Calcule le salaire net à partir du salaire brut pour le Togo
 */
export const calculateTogoSalary = ({
    salaireBrut,
    familyStatus, // Non utilisé pour le calcul de l'IRPP au Togo, mais gardé pour la cohérence de l'interface
    children,     // Non utilisé pour le calcul de l'IRPP au Togo, mais gardé pour la cohérence de l'interface
    transportBonus = 0,
    housingBonus = 0,
    thirteenthMonth = false // Ce paramètre n'est pas utilisé pour un calcul mensuel standard ici.
}: SalaryInput): SalaryResult => {
    // Calcul du total brut (salaire + primes non soumises aux cotisations/impôts)
    // IMPORTANT : Si ces primes doivent être soumises au-delà de certains plafonds,
    // la logique devrait être ajustée pour inclure la partie imposable dans l'assiette CNSS et la base imposable IRPP.
    const totalBrut = salaireBrut + transportBonus + housingBonus;

    // CNSS employé
    const assietteCNSS = Math.min(salaireBrut, TOGO.CNSS_PLAFOND);
    const cnssEmploye = Math.round(assietteCNSS * TOGO.CNSS_EMPLOYE);

    // Frais professionnels (20% sur Salaire Brut Imposable, plafonné à 50 000 FCFA/mois)
    const baseApresCharges = salaireBrut - cnssEmploye;
    const fraisPro = Math.min(baseApresCharges * TOGO.FRAIS_PRO_TAUX, TOGO.FRAIS_PRO_PLAFOND);

    // Base imposable IRPP
    const baseImposable = baseApresCharges - fraisPro;

    // Calcul IRPP par tranches (annuel)
    const baseAnnuelle = baseImposable * 12;
    let irppAnnuel = 0;
    const impotsDetails = [];

    for (const tranche of TOGO.IMPOTS_TRANCHES) {
        if (baseAnnuelle > tranche.min) {
            // CORRECTION ICI : Retrait du "+ 1" car les tranches dans constants.ts commencent à X+1
            const montantTranche = Math.min(baseAnnuelle, tranche.max) - tranche.min;
            const irppTranche = montantTranche * tranche.taux;
            irppAnnuel += irppTranche;

            // Pour l'affichage des détails
            if (montantTranche > 0) {
                impotsDetails.push({
                    tranche: `${tranche.min.toLocaleString()} - ${tranche.max === Infinity ? '∞' : tranche.max.toLocaleString()}`,
                    taux: tranche.taux * 100,
                    base: Math.round(montantTranche),
                    impot: Math.round(irppTranche)
                });
            }
        }
    }

    let impots = Math.round(irppAnnuel / 12);

    // CORRECTION : Application de l'Impôt Minimum Forfaitaire (IMF)
    // L'IMF s'applique si l'impôt calculé est inférieur à 3000 FCFA
    // et que la base imposable est supérieure à zéro.
    if (impots < TOGO.IMF_MONTANT! && baseImposable > 0) {
        impots = TOGO.IMF_MONTANT!;
    }

    // Salaire net
    const salaireNet = totalBrut - cnssEmploye - impots;

    // Charges patronales (CNSS Patronale seulement, car PF/VP/RP sont spécifiques au Bénin selon vos constantes)
    // Si d'autres charges patronales existent au Togo (ex: TDPC, Taxe d'Apprentissage), elles devraient être ajoutées ici.
    const cnssPatronal = Math.round(assietteCNSS * TOGO.CNSS_PATRONAL);
    const chargesPatronales = cnssPatronal; // Pour l'instant, seulement la CNSS Patronale est incluse.

    return {
        salaireBrut,
        totalBrut,
        salaireNet,
        cnssEmploye,
        fraisPro,
        baseImposable,
        impots,
        impotsDetails,
        // quotientFamilial n'est pas applicable/utilisé pour l'IRPP au Togo, donc omis ou rendu optionnel
        chargesPatronales,
        coutTotal: totalBrut + chargesPatronales,
        // Éviter la division par zéro si totalBrut est 0
        tauxPrelevement: totalBrut > 0 ? ((cnssEmploye + impots) / totalBrut) * 100 : 0,
        tauxNet: totalBrut > 0 ? (salaireNet / totalBrut) * 100 : 0,
        detailsChargesPatronales: {
            cnssPatronal // Au Togo, les autres sont absents de vos constantes
        },
        avantages: { transport: transportBonus, logement: housingBonus }
    };
};

/**
 * Calcule le salaire brut nécessaire pour obtenir un salaire net souhaité (pour le Togo)
 */
export const calculateTogoNetToBrut = (
    netSouhaite: number,
    familyStatus: FamilyStatus, // Gardé pour la cohérence de l'interface, mais non utilisé dans le calcul togolais
    children: string,     // Gardé pour la cohérence de l'interface, mais non utilisé dans le calcul togolais
    transportBonus: number = 0, // AJOUTÉ : Pour une meilleure cohérence
    housingBonus: number = 0 // AJOUTÉ : Pour une meilleure cohérence
): number => {
    let salaireBrut = netSouhaite * 1.5; // Estimation initiale, peut être ajustée
    let iterations = 0;
    const maxIterations = 100;
    const precision = 1; // Précision de 1 FCFA

    while (iterations < maxIterations) {
        const result = calculateTogoSalary({
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