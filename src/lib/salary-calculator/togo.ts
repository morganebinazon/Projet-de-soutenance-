import { TOGO } from './constants';
import { SalaryResult, FamilyStatus } from './types';

/**
 * Calcule le salaire net à partir du salaire brut pour le Togo
 */
export const calculateTogoSalary = ({
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

    // Calcul CNSS (plafonné)
    const cnssBase = Math.min(totalBrut, TOGO.CNSS_PLAFOND);
    const cnss = Math.round(cnssBase * TOGO.CNSS_EMPLOYE);

    // Calcul des frais professionnels (plafonnés)
    const fraisPro = Math.round(Math.min(totalBrut * TOGO.FRAIS_PRO_TAUX, TOGO.FRAIS_PRO_PLAFOND));

    // Calcul de la base imposable
    const baseImposable = Math.max(0, totalBrut - cnss - fraisPro);

    // Calcul IRPP
    let irpp = 0;
    for (const tranche of TOGO.IMPOTS_TRANCHES) {
        if (baseImposable > tranche.min) {
            const montantTranche = Math.min(baseImposable - tranche.min, tranche.max - tranche.min);
            irpp += montantTranche * tranche.taux;
        }
    }
    irpp = Math.round(irpp);

    // Application de l'IMF si nécessaire
    if (irpp < TOGO.IMF_MONTANT && baseImposable > 0) {
        irpp = TOGO.IMF_MONTANT;
    }

    // Calcul du net
    const netSalary = totalBrut - cnss - irpp;

    // Calcul des charges patronales
    const chargesPatronales = {
        total: Math.round(Math.min(totalBrut, TOGO.CNSS_PLAFOND) * TOGO.CNSS_PATRONAL)
    };

    return {
        totalBrut,
        netSalary,
        details: {
            cnss,
            irpp,
            fraisPro,
            baseImposable,
            chargesPatronales
        }
    };
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount);
}

/**
 * Calcule le salaire brut nécessaire pour obtenir un salaire net souhaité (pour le Togo)
 */
export const calculateTogoNetToBrut = (
    netSalary: number,
    familyStatus: FamilyStatus,
    children: string,
    transportBonus = 0,
    housingBonus = 0
): number => {
    let estimatedGross = netSalary / 0.70; // Estimation initiale
    let iterations = 0;
    const maxIterations = 500;
    const tolerance = 0.01;
    const dampingFactor = 0.8;

    while (iterations < maxIterations) {
        const result = calculateTogoSalary({
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
        const adjustment = difference / (currentNetPercentage || 0.70) * dampingFactor;
        
        estimatedGross += adjustment;

        if (estimatedGross < 0) estimatedGross = 0;

        iterations++;
    }

    console.warn("La simulation Net -> Brut (Togo) n'a pas convergé après", maxIterations, "itérations.");
    return Math.round(estimatedGross);
};

export function calculateNetSalary(grossSalary: number): number {
    // 1. Calcul des cotisations CNSS (4% du salaire brut)
    const cnss = Math.round(grossSalary * TOGO.CNSS_EMPLOYE * 100) / 100;

    // 2. Calcul des cotisations AMU (5% du salaire brut)
    const amu = Math.round(grossSalary * 0.05 * 100) / 100;

    // 3. Détermination du salaire imposable à l'IRPP
    // Déduction forfaitaire de 10% pour frais professionnels
    const baseImposable = Math.round(grossSalary * 0.90 * 100) / 100;

    // 4. Calcul de l'IRPP selon le barème progressif
    let irpp = 0;
    let resteImposable = baseImposable;

    // Tranche 1 (0 à 50 000 FCFA) : 0%
    const tranche1 = Math.min(resteImposable, 50000);
    irpp += tranche1 * 0;
    resteImposable -= tranche1;

    if (resteImposable > 0) {
        // Tranche 2 (50 001 à 120 000 FCFA) : 10%
        const tranche2 = Math.min(resteImposable, 70000);
        irpp += Math.round(tranche2 * 0.10 * 100) / 100;
        resteImposable -= tranche2;

        if (resteImposable > 0) {
            // Tranche 3 (120 001 à 250 000 FCFA) : 15%
            const tranche3 = Math.min(resteImposable, 130000);
            irpp += Math.round(tranche3 * 0.15 * 100) / 100;
            resteImposable -= tranche3;

            if (resteImposable > 0) {
                // Tranche 4 (250 001 à 400 000 FCFA) : 20%
                const tranche4 = Math.min(resteImposable, 150000);
                irpp += Math.round(tranche4 * 0.20 * 100) / 100;
                resteImposable -= tranche4;

                if (resteImposable > 0) {
                    // Tranche 5 (400 001 à 750 000 FCFA) : 25%
                    const tranche5 = Math.min(resteImposable, 350000);
                    irpp += Math.round(tranche5 * 0.25 * 100) / 100;
                    resteImposable -= tranche5;

                    if (resteImposable > 0) {
                        // Tranche 6 (au-delà de 750 000 FCFA) : 30%
                        irpp += Math.round(resteImposable * 0.30 * 100) / 100;
                    }
                }
            }
        }
    }

    // 5. Calcul du salaire net
    // Salaire Net = Salaire Brut - Cotisations CNSS - Cotisations AMU - IRPP
    const netSalary = grossSalary - cnss - amu - irpp;

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