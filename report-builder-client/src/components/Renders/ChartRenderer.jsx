import {
  BarChart,
  LineChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export const ChartRenderer = ({ component, excelData }) => {
  // Datos de ejemplo para mostrar si no hay datos reales
  const sampleData = [
    { name: "Ene", valor: 400 },
    { name: "Feb", valor: 300 },
    { name: "Mar", valor: 600 },
    { name: "Abr", valor: 800 },
    { name: "May", valor: 500 },
  ];

  // Procesar datos desde Excel si está disponible y corresponde
  let chartData = sampleData;
  if (
    component.dataSource?.sourceType === "excel" &&
    excelData &&
    excelData.length > 1
  ) {
    // Convertir los datos de Excel a formato de gráfico
    // Asumimos que la primera fila son cabeceras y la primera columna son etiquetas
    chartData = [];
    const headers = excelData[0];

    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i];
      if (row && row.length) {
        const item = { name: row[0] || `Item ${i}` };

        // Agregar cada valor como una propiedad con su encabezado correspondiente
        for (let j = 1; j < Math.min(headers.length, row.length); j++) {
          const key = headers[j] || `valor${j}`;
          item[key] = isNaN(Number(row[j])) ? 0 : Number(row[j]);
        }

        chartData.push(item);
      }
    }
  }

  // Determinar la propiedad para graficar (para gráficos de barras/líneas)
  const dataKey =
    (chartData.length > 0 &&
      Object.keys(chartData[0]).find((key) => key !== "name")) ||
    "valor";

  switch (component.chartType || "bar") {
    case "bar":
      return (
        <BarChart
          width={500}
          height={300}
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#8884d8" />
        </BarChart>
      );
    case "line":
      return (
        <LineChart
          width={500}
          height={300}
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
        </LineChart>
      );
    case "pie":
      return (
        <PieChart width={500} height={300}>
          <Tooltip />
          <Legend />
          <Pie
            data={chartData}
            cx={250}
            cy={150}
            labelLine={true}
            outerRadius={100}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey="name"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      );
    default:
      return <div>Tipo de gráfico no soportado</div>;
  }
};
