export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  grossSalary: number;
  benefits: {
    transport?: number;
    housing?: number;
    performance?: number;
  };
}

export interface Department {
  id: string;
  name: string;
  budget: number;
  headcount: number;
  plannedPositions: number;
}

export interface PayrollStats {
  totalGrossSalary: number;
  totalBenefits: number;
  socialContributions: number;
  netSalaries: number;
  totalCost: number;
} 