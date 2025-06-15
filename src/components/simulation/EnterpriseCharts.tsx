import React from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

interface SalaryDistributionData {
  name: string;
  value: number;
}

interface DepartmentData {
  name: string;
  salary: number;
  employees: number;
  budget: number;
}

interface MonthlyData {
  month: number;
  projectedSalary: number;
  employeeCount: number;
}

interface SalaryDistributionChartProps {
  data: SalaryDistributionData[];
}

interface DepartmentChartProps {
  data: DepartmentData[];
}

interface MonthlyEvolutionChartProps {
  data: MonthlyData[];
}

interface BudgetProjectionChartProps {
  data: MonthlyData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const SalaryDistributionChart: React.FC<SalaryDistributionChartProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const DepartmentChart: React.FC<DepartmentChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="salary" name="Masse salariale" fill="#8884d8" />
        <Bar dataKey="budget" name="Budget" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="projectedSalary" name="Masse salariale" stroke="#8884d8" />
        <Line type="monotone" dataKey="employeeCount" name="Effectif" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const BudgetProjectionChart: React.FC<BudgetProjectionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="projectedSalary" name="Masse salariale projetée" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}; 