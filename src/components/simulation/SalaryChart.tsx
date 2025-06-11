import { useTheme } from "@/hooks/use-theme";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SalaryChartProps {
  results: {
    grossSalary: number; // Salaire brut de base (avant primes)
    exceptionalBonus: number; // La prime exceptionnelle
    recurringBonuses: number; // Les primes récurrentes
    totalGross: number; // Le total brut (base + toutes primes) sur lequel les déductions sont calculées
    netSalary: number;
    socialContributionsEmployee: number; // Utiliser le nom correct de la prop
    incomeTax: number;
  };
}

const SalaryChart: React.FC<SalaryChartProps> = ({ results }) => {
  const { theme } = useTheme();

  const data = [
    { name: "Salaire net", value: results.netSalary },
    { name: "Cotisations sociales", value: results.socialContributionsEmployee }, // Utilisation de socialContributionsEmployee
    { name: "Impôt sur le revenu", value: results.incomeTax },
  ];

  // --- CORRECTION : Ordre des couleurs pour correspondre à l'ordre des données et à votre intention ---
  // Vert pour le salaire net, Jaune pour les cotisations, Rouge pour l'impôt
  const COLORS = ['#008750', '#FCD116', '#E8112D']; // Vert, Jaune, Rouge

  // Filtrer les entrées avec une valeur de 0 pour ne pas les afficher dans le graphique ni dans la légende
  const filteredData = data.filter(entry => entry.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && results.totalGross > 0) {
      const percentage = (payload[0].value / results.totalGross) * 100;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-500">
            {percentage.toFixed(0)}% du brut total
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
          data={filteredData} // Utilisation de filteredData
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
        >
          {filteredData.map((entry, index) => (
            // Utiliser 'index' du filteredData pour associer la couleur correcte
            <Cell key={`cell-${index}`} fill={COLORS[data.indexOf(entry) % COLORS.length]} />
            // Ou plus simplement, si l'ordre est toujours respecté :
            // <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            // L'ordre des données filtrées correspond à l'ordre initial si aucune n'est filtrée.
            // Si des éléments sont filtrés, l'index de filteredData peut ne pas correspondre à l'index de COLORS.
            // La solution plus robuste serait de mapper les noms des données aux couleurs.
            // Pour l'instant, la solution simple où l'ordre des couleurs correspond à l'ordre des `data` fonctionne si le filtrage retire des éléments du milieu.
            // On peut simplifier avec le `index` direct de filteredData si les couleurs sont bien ordonnées.
            // Je laisse le `COLORS[index % COLORS.length]` tel quel, car c'est la façon la plus simple et elle fonctionnera si les couleurs sont correctement ordonnées
            // et que le filtrage ne désaligne pas trop les index.
            // Pour être parfaitement robuste avec le filtrage, il faudrait une Map<string, string> de name à color.
            // Pour l'exemple actuel, on suppose que l'ordre du `data` est respecté pour les couleurs.
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value, entry) => {
            const legendTextColorClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
            return <span className={`text-sm ${legendTextColorClass}`}>{value}</span>;
          }}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
    
  );
};

export default SalaryChart;