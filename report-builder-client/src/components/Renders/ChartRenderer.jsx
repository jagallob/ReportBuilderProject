import React from "react";
import { formatExcelValue } from "../../utils/textAnalysisUtils";
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
  RadarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  Pie,
  Area,
  Scatter,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export const ChartRenderer = ({ component, excelData: propsExcelData }) => {
  // Buscar datos en múltiples ubicaciones posibles
  const excelData =
    component.dataSource?.excelData ||
    propsExcelData ||
    (component.dataSource?.sourceType === "excel" && component.excelData);

  // Verificar si tenemos datos y mapeos
  const mappings = component.dataSource?.mappings || {};
  const { xAxisField, yAxisField, seriesField } = mappings;

  // Procesar datos desde Excel si está disponible
  let chartData = [];

  if (component.dataSource?.sourceType === "excel" && excelData?.data) {
    if (!excelData.headers || excelData.headers.length === 0) {
      console.warn("No headers found in excelData:", excelData);
      // Puedes retornar un mensaje de error o un estado de "no data"
      return <div>No hay datos de Excel disponibles o válidos.</div>;
    }

    if (xAxisField && yAxisField) {
      // Obtener índices de las columnas seleccionadas
      const xIndex = excelData.headers.indexOf(xAxisField);
      const yIndex = excelData.headers.indexOf(yAxisField);
      const seriesIndex = seriesField
        ? excelData.headers.indexOf(seriesField)
        : -1;

      // Verificar si estamos agrupando por serie
      if (seriesIndex >= 0 && seriesField && component.chartType !== "pie") {
        // Procesar datos con series (para gráficos que no son de tipo pie)
        const seriesGroups = {};

        // Primer paso: agrupar datos por categoría X
        excelData.data.forEach((row) => {
          if (
            xIndex >= 0 &&
            yIndex >= 0 &&
            row[xIndex] !== undefined &&
            row[yIndex] !== undefined
          ) {
            const xValue = row[xIndex] !== undefined ? row[xIndex] : "";
            const formattedXValue = formatExcelValue(xValue);

            const yValue = !isNaN(Number(row[yIndex]))
              ? Number(row[yIndex])
              : 0;
            let seriesValue = "";

            if (seriesIndex >= 0 && row[seriesIndex] !== undefined) {
              seriesValue = formatExcelValue(row[seriesIndex]);
            }

            if (!seriesGroups[formattedXValue]) {
              seriesGroups[formattedXValue] = { name: formattedXValue };
            }
            seriesGroups[formattedXValue][seriesValue] = yValue;
          }
        });

        // Convertir a array para recharts
        chartData = Object.values(seriesGroups);
      } else {
        // Procesar datos sin series
        chartData = excelData.data.map((row) => {
          const item = {};

          // Obtener valores
          const rawXValue =
            xIndex >= 0 && row[xIndex] !== undefined
              ? row[xIndex]
              : `Item ${chartData.length + 1}`;
          item.name = formatExcelValue(rawXValue);

          item.value =
            yIndex >= 0 &&
            row[yIndex] !== undefined &&
            !isNaN(Number(row[yIndex]))
              ? Number(row[yIndex])
              : 0;

          return item;
        });
      }
    }
  } else if (component.data) {
    // Datos manuales si existen
    chartData = component.data;
  } else {
    // Datos de muestra
    chartData = [
      { name: "Ene", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 600 },
      { name: "Abr", value: 800 },
      { name: "May", value: 500 },
    ];
  }

  // Determinar si hay series (para leyendas)
  const hasSeries =
    seriesField &&
    component.dataSource?.sourceType === "excel" &&
    component.chartType !== "pie";

  // Lista de series para crear múltiples barras/líneas
  let seriesList = [];
  if (hasSeries && chartData.length > 0) {
    // Obtener todas las claves excepto "name"
    seriesList = Object.keys(chartData[0]).filter((key) => key !== "name");
  }

  // Configuraciones compartidas
  const commonProps = {
    width: 500,
    height: 300,
    data: chartData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  };

  // Determinar si mostrar elementos
  const showLegend = component.showLegend !== false;
  const showTooltip = component.showTooltip !== false;
  const stackBars = component.stackBars || false;
  const fillArea = component.fillArea || false;

  // Renderizar según el tipo de gráfico
  switch (component.chartType || "bar") {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}

            {hasSeries ? (
              // Renderizar múltiples barras para cada serie
              seriesList.map((serie, index) => (
                <Bar
                  key={serie}
                  dataKey={serie}
                  fill={COLORS[index % COLORS.length]}
                  stackId={stackBars ? "stack" : index}
                />
              ))
            ) : (
              // Renderizar una sola barra
              <Bar
                dataKey="value"
                fill="#8884d8"
                name={yAxisField || "Valor"}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}

            {hasSeries ? (
              // Renderizar múltiples líneas para cada serie
              seriesList.map((serie, index) => (
                <Line
                  key={serie}
                  type="monotone"
                  dataKey={serie}
                  stroke={COLORS[index % COLORS.length]}
                  fill={fillArea ? COLORS[index % COLORS.length] : undefined}
                  fillOpacity={fillArea ? 0.3 : 0}
                />
              ))
            ) : (
              // Renderizar una sola línea
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                name={yAxisField || "Valor"}
                fill={fillArea ? "#8884d8" : undefined}
                fillOpacity={fillArea ? 0.3 : 0}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}

            {hasSeries ? (
              // Renderizar múltiples áreas para cada serie
              seriesList.map((serie, index) => (
                <Area
                  key={serie}
                  type="monotone"
                  dataKey={serie}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                  stackId={stackBars ? "stack" : undefined}
                />
              ))
            ) : (
              // Renderizar una sola área
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name={yAxisField || "Valor"}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
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
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" type="category" />
            <YAxis dataKey="value" />
            {showTooltip && <Tooltip cursor={{ strokeDasharray: "3 3" }} />}
            {showLegend && <Legend />}
            <Scatter
              name={yAxisField || "Valor"}
              data={chartData}
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "radar":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius={100} data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}

            {hasSeries ? (
              // Renderizar múltiples radares para cada serie
              seriesList.map((serie, index) => (
                <Radar
                  key={serie}
                  name={serie}
                  dataKey={serie}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))
            ) : (
              // Renderizar un solo radar
              <Radar
                name={yAxisField || "Valor"}
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      );

    default:
      return <div>Tipo de gráfico no soportado: {component.chartType}</div>;
  }
};

export default ChartRenderer;
