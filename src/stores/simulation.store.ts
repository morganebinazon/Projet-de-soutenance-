import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  clearOldSimulations: () => void;
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      simulations: [],
      addSimulation: (simulation) => {
        const newSimulation = {
          ...simulation,
          id: Date.now(),
          date: new Date().toISOString()
        };
        set((state) => ({
          simulations: [newSimulation, ...state.simulations]
        }));
      },
      removeSimulation: (id) => set((state) => ({
        simulations: state.simulations.filter((sim) => sim.id !== id)
      })),
      clearOldSimulations: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        set((state) => ({
          simulations: state.simulations.filter((sim) => {
            const simDate = new Date(sim.date || '');
            return simDate > thirtyDaysAgo;
          })
        }));
      }
    }),
    {
      name: 'simulation-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 