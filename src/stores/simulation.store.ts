import { create } from 'zustand';

export type FamilyStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Simulation {
  id?: number;
  type: string;
  salaireBrut: number;
  salaireNet: number;
  country: 'benin' | 'togo';
  familyStatus: FamilyStatus;
  children: number;
  saved: boolean;
  transportBonus: number;
  housingBonus: number;
  cnss: number;
  impot: number;
  salaireBrutTotalCalcul: number;
  date?: string;
}

interface SimulationStore {
  simulations: Simulation[];
  addSimulation: (simulation: Simulation) => void;
  removeSimulation: (id: number) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  simulations: [],
  addSimulation: (simulation) => set((state) => ({
    simulations: [{
      ...simulation,
      id: Date.now(),
      date: new Date().toISOString()
    }, ...state.simulations]
  })),
  removeSimulation: (id) => set((state) => ({
    simulations: state.simulations.filter((sim) => sim.id !== id)
  }))
})); 