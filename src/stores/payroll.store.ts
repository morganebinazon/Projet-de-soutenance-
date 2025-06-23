import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, Department, PayrollStats } from '@/types/payroll';

interface PayrollState {
  employees: Employee[];
  departments: Department[];
  totalGrossSalary: number;
  totalBenefits: number;
  socialContributions: number;
  netSalaries: number;
  totalCost: number;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  removeEmployee: (id: string) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addDepartment: (department: Omit<Department, 'id'>) => void;
  removeDepartment: (id: string) => void;
  calculateStats: () => void;
}

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      employees: [],
      departments: [],
      totalGrossSalary: 0,
      totalBenefits: 0,
      socialContributions: 0,
      netSalaries: 0,
      totalCost: 0,

      addEmployee: (employee) => {
        const newEmployee = {
          ...employee,
          id: Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          employees: [...state.employees, newEmployee],
        }));
        get().calculateStats();
      },

      removeEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
        }));
        get().calculateStats();
      },

      updateEmployee: (id, updates) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...updates } : emp
          ),
        }));
        get().calculateStats();
      },

      addDepartment: (department) => {
        const newDepartment = {
          ...department,
          id: Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          departments: [...state.departments, newDepartment],
        }));
        get().calculateStats();
      },

      removeDepartment: (id) => {
        set((state) => ({
          departments: state.departments.filter((dept) => dept.id !== id),
        }));
        get().calculateStats();
      },

      calculateStats: () => {
        const { employees } = get();
        if (!Array.isArray(employees)) return; // sécurité en plus
        const totalGrossSalary = employees.reduce((sum, emp) => sum + emp.grossSalary, 0);
        const totalBenefits = employees.reduce(
          (sum, emp) =>
            sum +
            (emp.benefits.transport || 0) +
            (emp.benefits.housing || 0) +
            (emp.benefits.performance || 0),
          0
        );
        const socialContributions = totalGrossSalary * 0.154;
        const netSalaries = totalGrossSalary - socialContributions;
        const totalCost = totalGrossSalary + totalBenefits + socialContributions;

        set({
          totalGrossSalary,
          totalBenefits,
          socialContributions,
          netSalaries,
          totalCost,
        });
      },
    }),
    {
      name: 'payroll-storage',
      partialize: (state) => ({
        employees: state.employees,
        departments: state.departments,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        employees: Array.isArray(persisted?.employees) ? persisted.employees : [],
        departments: Array.isArray(persisted?.departments) ? persisted.departments : [],
      }),
    }
  )
);

