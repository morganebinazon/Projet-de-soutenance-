import React from 'react';

interface Department {
  id: string;
  name: string;
  budget: number;
  headcount: number;
}

interface DepartmentDetailsModalProps {
  isOpen: boolean;
  department: Department;
  onClose: () => void;
  onEdit: (department: Department) => void;
  employeeCount: number;
  totalSalary: number;
}

export const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({
  isOpen,
  department,
  onClose,
  onEdit,
  employeeCount,
  totalSalary
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Détails du département {department.name}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Budget</h3>
            <p>{department.budget.toLocaleString()} FCFA</p>
          </div>
          <div>
            <h3 className="font-semibold">Effectif</h3>
            <p>{employeeCount} employés</p>
          </div>
          <div>
            <h3 className="font-semibold">Masse salariale</h3>
            <p>{totalSalary.toLocaleString()} FCFA</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => onEdit(department)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Modifier
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}; 