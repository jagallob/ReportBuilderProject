import React from "react";
import { TextRenderer } from "./TextRenderer";
import { TableRenderer } from "./TableRenderer";
import { ChartRenderer } from "./ChartRenderer";
import { KpiRenderer } from "./KpiRenderer";
import ImageRenderer from "./ImageRenderer";

const ComponentRenderer = ({ component, excelData }) => {
  if (!component) {
    return <div className="p-4 text-red-500">Componente no encontrado</div>;
  }

  switch (component.type) {
    case "text":
      return <TextRenderer component={component} excelData={excelData} />;
    case "table":
      return <TableRenderer component={component} excelData={excelData} />;
    case "chart":
      return (
        <div
          id={`chart-${component.componentId}`}
          className="chart-container"
          style={{ width: "100%", height: "300px", overflow: "hidden" }}
        >
          <ChartRenderer component={component} excelData={excelData} />
        </div>
      );
    case "kpi":
      return <KpiRenderer component={component} excelData={excelData} />;
    case "image":
      return <ImageRenderer component={component} />;
    default:
      return (
        <div className="p-4 text-red-500">
          Tipo de componente no reconocido: {component.type}
        </div>
      );
  }
};

export default ComponentRenderer;
