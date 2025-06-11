import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface DepartmentData {
  name: string;
  salary: number;
  employees: number;
}

interface MonthlyData {
  month: string;
  salary: number;
  employees: number;
}

// Graphique en camembert pour la répartition de la masse salariale
export const SalaryDistributionChart = ({ data }: { data: ChartData[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value.toLocaleString()} FCFA`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Graphique en barres pour la répartition par département
export const DepartmentChart = ({ data }: { data: DepartmentData[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => `${value.toLocaleString()} FCFA`} />
        <Legend />
        <Bar dataKey="salary" name="Masse salariale" fill="#8884d8" />
        <Bar dataKey="employees" name="Effectif" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Graphique d'évolution mensuelle
export const MonthlyEvolutionChart = ({ data }: { data: MonthlyData[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => `${value.toLocaleString()} FCFA`} />
        <Legend />
        <Bar dataKey="salary" name="Masse salariale" fill="#8884d8" />
        <Bar dataKey="employees" name="Effectif" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Graphique de projection budgétaire
export const BudgetProjectionChart = ({ data }: { data: MonthlyData[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => `${value.toLocaleString()} FCFA`} />
        <Legend />
        <Bar dataKey="salary" name="Masse salariale projetée" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}; 