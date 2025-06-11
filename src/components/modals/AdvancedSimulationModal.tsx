import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdvancedSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  userRole: string;
}

const AdvancedSimulationModal: React.FC<AdvancedSimulationModalProps> = ({
  isOpen,
  onClose,
  companyId,
  userRole,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Simulation avancée de la masse salariale</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-salary">Masse salariale actuelle</Label>
              <Input id="current-salary" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth-rate">Taux de croissance (%)</Label>
              <Input id="growth-rate" type="number" placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="simulation-period">Période de simulation (mois)</Label>
            <Input id="simulation-period" type="number" placeholder="12" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onClose}>
            Lancer la simulation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSimulationModal; 