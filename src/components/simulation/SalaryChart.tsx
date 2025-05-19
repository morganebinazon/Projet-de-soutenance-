
import { useTheme } from "@/hooks/use-theme";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SalaryChartProps {
  results: {
    grossSalary: number;
    netSalary: number;
    socialContributions: number;
    incomeTax: number;
  };
}

const SalaryChart: React.FC<SalaryChartProps> = ({ results }) => {
  const { theme } = useTheme();
  
  const data = [
    { name: "Salaire net", value: results.netSalary },
    { name: "Cotisations sociales", value: results.socialContributions },
    { name: "Impôt sur le revenu", value: results.incomeTax },
  ];

  const COLORS = ['#008750', '#FCD116', '#E8112D'];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-500">
            {Math.round((payload[0].value / results.grossSalary) * 100)}% du brut
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => <span className="text-sm">{value}</span>}
          layout="vertical"
          verticalAlign="middle"
          align="right"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SalaryChart;
