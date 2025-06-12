import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Department } from '@/types/payroll';

interface DepartmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({
  isOpen,
  onClose,
  department
}) => {
  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Détails du département</DialogTitle>
          <DialogDescription>
            Informations détaillées sur le département {department.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informations générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom du département</p>
                <p className="font-medium">{department.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-medium">{department.code}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Statistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre d'employés</p>
                <p className="font-medium">{department.employeeCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget mensuel</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(department.monthlyBudget || 0)}
                </p>
              </div>
            </div>
          </div>

          {department.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground">{department.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentDetailsModal; 