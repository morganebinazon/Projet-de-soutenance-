import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface SimulationPDFProps {
  results: any;
  country: string;
  familyStatus: string;
  children: string;
}

const SimulationPDF: React.FC<SimulationPDFProps> = ({
  results,
  country,
  familyStatus,
  children,
}) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'single':
        return 'Célibataire';
      case 'married':
        return 'Marié(e)';
      case 'divorced':
        return 'Divorcé(e)';
      case 'widowed':
        return 'Veuf/Veuve';
      default:
        return status;
    }
  };

  if (!results) return null;

  return (
    <div id="pdf-content" className="p-8 bg-white">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Simulation de Salaire</h1>
        <p className="text-gray-600">PayeAfrique - {country === 'benin' ? 'Bénin' : 'Togo'}</p>
      </div>

      {/* Informations de base */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Situation familiale</p>
            <p className="font-medium">{getStatusLabel(familyStatus)}</p>
          </div>
          <div>
            <p className="text-gray-600">Nombre d'enfants</p>
            <p className="font-medium">{children}</p>
          </div>
        </div>
      </div>

      {/* Résumé des montants */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Résumé des montants</h2>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span>Salaire brut de base</span>
            <span className="font-medium">{formatCurrency(results.grossSalaryInput)} FCFA</span>
          </div>
          {results.totalRecurringBonuses > 0 && (
            <div className="flex justify-between border-b pb-2">
              <span>Total des primes</span>
              <span className="font-medium">{formatCurrency(results.totalRecurringBonuses)} FCFA</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span>Salaire brut total</span>
            <span className="font-medium">{formatCurrency(results.totalGross)} FCFA</span>
          </div>
        </div>
      </div>

      {/* Détails des cotisations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Détails des cotisations</h2>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span>Cotisations sociales (CNSS)</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(results.socialContributionsEmployee)} FCFA
            </span>
          </div>
          {results.otherEmployeeDeductions > 0 && (
            <div className="flex justify-between border-b pb-2">
              <span>Autres déductions (AMU)</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(results.otherEmployeeDeductions)} FCFA
              </span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span>Impôt sur le revenu ({country === 'benin' ? 'ITS' : 'IRPP'})</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(results.incomeTax)} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Résultat final */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Salaire net</span>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(results.netSalary)} FCFA
          </span>
        </div>
      </div>

      {/* Coût employeur */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Coût employeur</h2>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span>Charges patronales</span>
            <span className="font-medium">{formatCurrency(results.employerSocialContributions)} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Coût total employeur</span>
            <span className="font-bold">{formatCurrency(results.totalEmployerCost)} FCFA</span>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Document généré le {new Date().toLocaleDateString()}</p>
        <p>www.payeafrique.com</p>
      </div>
    </div>
  );
};

export default SimulationPDF; 