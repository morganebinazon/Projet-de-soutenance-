import { BENIN } from './constants';
import { SalaryResult, FamilyStatus } from './types';

/**
 * Calcule le salaire net à partir du salaire brut pour le Bénin
 */
export const calculateBeninSalary = ({
    salaireBrut,
    familyStatus,
    children,
    transportBonus = 0,
    housingBonus = 0,
    thirteenthMonth = false
}: {
    salaireBrut: number;
    familyStatus: FamilyStatus;
    children: string;
    transportBonus?: number;
    housingBonus?: number;
    thirteenthMonth?: boolean;
}): SalaryResult => {
    // Calcul du brut total
    const totalBrut = salaireBrut + transportBonus + housingBonus;

    // 1. Calcul des cotisations sociales salariales (CNSS VID)
    const cnssBase = Math.min(totalBrut, BENIN.CNSS_PLAFOND);
    const cnss = cnssBase * BENIN.CNSS_EMPLOYE; // 3.6% sur plafond de 350 000

    // 2. Calcul des frais professionnels (20%)
    const fraisPro = totalBrut * BENIN.FRAIS_PRO_TAUX;

    // 3. Calcul de la base imposable pour l'ITS
    const baseImposable = totalBrut - cnss - fraisPro;

    // 4. Calcul de l'ITS
    let its = 0;
    let resteImposable = baseImposable;

    // Tranche 1 : 0 à 60,000 FCFA
    if (resteImposable > 60000) {
        resteImposable -= 60000;
    } else {
        resteImposable = 0;
    }

    // Tranche 2 : 60,001 à 150,000 FCFA
    if (resteImposable > 0) {
        const montantTranche = Math.min(resteImposable, 90000);
        its += montantTranche * 0.10;
        resteImposable -= montantTranche;
    }

    // Tranche 3 : 150,001 à 250,000 FCFA
    if (resteImposable > 0) {
        const montantTranche = Math.min(resteImposable, 100000);
        its += montantTranche * 0.15;
        resteImposable -= montantTranche;
    }

    // Tranche 4 : 250,001 à 500,000 FCFA
    if (resteImposable > 0) {
        const montantTranche = Math.min(resteImposable, 250000);
        its += montantTranche * 0.19;
        resteImposable -= montantTranche;
    }

    // Tranche 5 : Au-delà de 500,000 FCFA
    if (resteImposable > 0) {
        its += resteImposable * 0.30;
    }

    // 5. Calcul de la Taxe sur le Salaire (TS) - 1.5% sur la base après CNSS
    const baseTS = totalBrut - cnss;
    const taxeSalaire = baseTS * BENIN.TAXE_SALAIRE;

    // 6. Calcul du salaire net (arrondi uniquement à la fin)
    const netSalary = Math.round(totalBrut - cnss - its - taxeSalaire);

    // 7. Calcul des charges patronales
    const chargesPatronales = {
        // CNSS Famille (5% sur plafond)
        vieillesse: Math.min(totalBrut, BENIN.CNSS_PATRONAL_PLAFOND_SPECIFIQUE) * BENIN.CNSS_PATRONAL_VIEILLESSE_TAUX,
        // CNSS AT/MP (1.5%)
        prestationsFamiliales: totalBrut * BENIN.CNSS_PATRONAL_PRESTATIONS_FAMILIALES_TAUX,
        // TDL (0.5%)
        accidentsTravail: totalBrut * BENIN.CNSS_PATRONAL_ACCIDENTS_TRAVAIL_TAUX,
        // TA (0.5%)
        taxeApprentissage: totalBrut * BENIN.TAXE_APPRENTISSAGE,
        // PEFPC (0.5%)
        taxeFormationProfessionnelle: totalBrut * BENIN.TAXE_FORMATION_PROFESSIONNELLE,
        // TDL (0.5%)
        taxeDeveloppementLocal: totalBrut * BENIN.TAXE_DEVELOPPEMENT_LOCAL,
        total: 0
    };

    // Calcul du total des charges patronales
    chargesPatronales.total = 
        chargesPatronales.vieillesse +
        chargesPatronales.prestationsFamiliales +
        chargesPatronales.accidentsTravail +
        chargesPatronales.taxeApprentissage +
        chargesPatronales.taxeFormationProfessionnelle +
        chargesPatronales.taxeDeveloppementLocal;

    return {
        totalBrut,
        netSalary,
        details: {
            cnss: Math.round(cnss),
            its: Math.round(its + taxeSalaire), // On inclut la TS dans l'ITS pour l'affichage
            fraisPro: Math.round(fraisPro),
            baseImposable: Math.round(baseImposable),
            chargesPatronales: {
                ...chargesPatronales,
                vieillesse: Math.round(chargesPatronales.vieillesse),
                prestationsFamiliales: Math.round(chargesPatronales.prestationsFamiliales),
                accidentsTravail: Math.round(chargesPatronales.accidentsTravail),
                taxeApprentissage: Math.round(chargesPatronales.taxeApprentissage),
                taxeFormationProfessionnelle: Math.round(chargesPatronales.taxeFormationProfessionnelle),
                taxeDeveloppementLocal: Math.round(chargesPatronales.taxeDeveloppementLocal),
                total: Math.round(chargesPatronales.total)
            }
        }
    };
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount);
}

/**
 * Calcule le salaire brut nécessaire pour obtenir un salaire net souhaité (pour le Bénin)
 */
export const calculateBeninNetToBrut = (
    netSalary: number,
    familyStatus: FamilyStatus,
    children: string,
    transportBonus = 0,
    housingBonus = 0
): number => {
    let estimatedGross = netSalary / 0.76; // Estimation initiale
    let iterations = 0;
    const maxIterations = 500;
    const tolerance = 0.01;
    const dampingFactor = 0.8;

    while (iterations < maxIterations) {
        const result = calculateBeninSalary({
            salaireBrut: estimatedGross,
            familyStatus,
            children,
            transportBonus,
            housingBonus
        });

        const difference = netSalary - result.netSalary;

        if (Math.abs(difference) <= tolerance) {
            return Math.round(estimatedGross);
        }

        const currentNetPercentage = result.netSalary / (estimatedGross + transportBonus + housingBonus);
        const adjustment = difference / (currentNetPercentage || 0.76) * dampingFactor;
        
        estimatedGross += adjustment;

        if (estimatedGross < 0) estimatedGross = 0;

        iterations++;
    }

    console.warn("La simulation Net -> Brut (Bénin) n'a pas convergé après", maxIterations, "itérations.");
    return Math.round(estimatedGross);
};

export function calculateNetSalary(grossSalary: number): number {
    // 1. Calcul des cotisations CNSS (3.6% du salaire brut)
    const cnss = Math.round(grossSalary * BENIN.CNSS_EMPLOYE * 100) / 100;

    // 2. Calcul de l'ITS selon le barème progressif
    // L'ITS est calculé directement sur le salaire brut
    let its = 0;
    let resteImposable = grossSalary;

    // Tranche 1 (0 à 60 000 FCFA) : 0%
    const tranche1 = Math.min(resteImposable, 60000);
    its += tranche1 * 0;
    resteImposable -= tranche1;

    if (resteImposable > 0) {
        // Tranche 2 (60 001 à 150 000 FCFA) : 10%
        const tranche2 = Math.min(resteImposable, 90000);
        its += Math.round(tranche2 * 0.10 * 100) / 100;
        resteImposable -= tranche2;

        if (resteImposable > 0) {
            // Tranche 3 (150 001 à 250 000 FCFA) : 15%
            const tranche3 = Math.min(resteImposable, 100000);
            its += Math.round(tranche3 * 0.15 * 100) / 100;
            resteImposable -= tranche3;

            if (resteImposable > 0) {
                // Tranche 4 (250 001 à 500 000 FCFA) : 19%
                const tranche4 = Math.min(resteImposable, 250000);
                its += Math.round(tranche4 * 0.19 * 100) / 100;
                resteImposable -= tranche4;

                if (resteImposable > 0) {
                    // Tranche 5 (au-delà de 500 000 FCFA) : 30%
                    its += Math.round(resteImposable * 0.30 * 100) / 100;
                }
            }
        }
    }

    // 3. Calcul du salaire net
    // Salaire Net = Salaire Brut - Cotisations CNSS - ITS
    const netSalary = grossSalary - cnss - its;

    return Math.round(netSalary);
}

export function calculateGrossSalary(netSalary: number): number {
    // Méthode d'approximations successives pour trouver le salaire brut
    let min = netSalary;
    let max = netSalary * 2; // Estimation initiale
    let precision = 1; // Précision en FCFA
    let result = 0;
    let iterations = 0;
    const maxIterations = 100; // Pour éviter une boucle infinie

    while (max - min > precision && iterations < maxIterations) {
        const mid = Math.round((min + max) / 2);
        const calculatedNet = calculateNetSalary(mid);

        if (Math.abs(calculatedNet - netSalary) <= precision) {
            result = mid;
            break;
        } else if (calculatedNet < netSalary) {
            min = mid;
        } else {
            max = mid;
        }
        iterations++;
    }

    return result || Math.round((min + max) / 2);
}