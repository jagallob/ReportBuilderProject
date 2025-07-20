import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

const useTemplateManagement = (initialTemplate) => {
  const defaultTemplate = {
    metadata: {
      templateType: "generic",
      description: "",
      version: "1.0.0",
    },
    sections: [],
  };

  const [template, setTemplate] = useState(initialTemplate || defaultTemplate);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
  });

  // Función para clonar seguro
  const cloneTemplate = (prev) =>
    typeof structuredClone === "function"
      ? structuredClone(prev)
      : JSON.parse(JSON.stringify(prev));

  const updateTemplate = (path, value) => {
    setTemplate((prev) => {
      try {
        const keys = path.split(".");
        const newTemplate = cloneTemplate(prev);

        let current = newTemplate;
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // Manejo especial para índices de array
          if (key.includes("[") && key.includes("]")) {
            const arrayName = key.substring(0, key.indexOf("["));
            const arrayIndex = parseInt(
              key.substring(key.indexOf("[") + 1, key.indexOf("]"))
            );

            if (!current[arrayName]) {
              current[arrayName] = [];
            }

            if (!current[arrayName][arrayIndex]) {
              current[arrayName][arrayIndex] = {};
            }

            current = current[arrayName][arrayIndex];
          } else {
            if (current[key] == null) {
              current[key] = {};
            }
            current = current[key];
          }
        }

        const finalKey = keys[keys.length - 1];
        current[finalKey] = value;

        return newTemplate;
      } catch (error) {
        console.error("❌ Error actualizando plantilla:", {
          path,
          value,
          error,
        });
        return prev;
      }
    });
  };

  const addSection = () => {
    const newSection = {
      sectionId: uuidv4(),
      title: `Nueva Sección ${template.sections.length + 1}`,
      type: "composite",
      components: [],
      events: [],
    };
    updateTemplate("sections", [...template.sections, newSection]);
    setSelectedItem({ type: "section", index: template.sections.length });
  };

  const removeSection = (index) => {
    if (index < 0 || index >= template.sections.length) return;
    const newSections = [...template.sections];
    newSections.splice(index, 1);
    updateTemplate("sections", newSections);
    setSelectedItem(null);
  };

  const addComponent = (sectionIndex, componentType) => {
    if (sectionIndex < 0 || sectionIndex >= template.sections.length) return;
    const newComponent = {
      componentId: uuidv4(),
      type: componentType,
      dataSource: { sourceType: "manual" },
      displayOptions: {},
    };

    // Inicialización de propiedades específicas según el tipo
    if (componentType === "text") {
      newComponent.content = "";
      // MEJORA: Inicializar analysisConfig para evitar errores de 'undefined'
      // y asegurar que el componente tenga una estructura consistente.
      newComponent.analysisConfig = {
        dataColumn: "",
        categoryColumn: "",
      };
    } else if (componentType === "table") {
      newComponent.rows = 3;
      newComponent.columns = 2;
    } else if (componentType === "chart") {
      newComponent.chartType = "bar";
      // MEJORA: Inicializar mappings para evitar errores
      if (!newComponent.dataSource.mappings) {
        newComponent.dataSource.mappings = {
          xAxisField: "",
          yAxisField: "",
        };
      }
    } else if (componentType === "kpi") {
      newComponent.value = "0";
      newComponent.unit = "";
      // MEJORA: Inicializar mappings para la configuración desde Excel
      if (!newComponent.dataSource.mappings) {
        newComponent.dataSource.mappings = {
          kpiColumn: "",
          aggregation: "sum", // 'sum', 'avg', 'count', 'max', 'min'
        };
      }
    }

    const updatedSections = cloneTemplate(template.sections);
    updatedSections[sectionIndex].components.push(newComponent);
    updateTemplate("sections", updatedSections);
    setSelectedItem({
      type: "component",
      sectionIndex,
      componentIndex: updatedSections[sectionIndex].components.length - 1,
    });
  };

  const moveComponent = (fromSection, fromIndex, toSection, toIndex) => {
    if (fromSection === toSection && fromIndex === toIndex) return;

    setTemplate((prev) => {
      try {
        const newTemplate = cloneTemplate(prev);
        const sections = newTemplate.sections;

        if (
          !sections[fromSection] ||
          !sections[toSection] ||
          !sections[fromSection].components[fromIndex]
        ) {
          console.error("⚠️ Movimiento inválido de componente.");
          return prev;
        }

        const [moved] = sections[fromSection].components.splice(fromIndex, 1);

        if (toIndex >= sections[toSection].components.length) {
          sections[toSection].components.push(moved);
        } else {
          sections[toSection].components.splice(toIndex, 0, moved);
        }

        return newTemplate;
      } catch (error) {
        console.error("❌ Error moviendo componente:", error);
        return prev;
      }
    });
  };

  const removeComponent = (sectionIndex, componentIndex) => {
    if (
      sectionIndex < 0 ||
      sectionIndex >= template.sections.length ||
      componentIndex < 0 ||
      componentIndex >= template.sections[sectionIndex].components.length
    ) {
      return;
    }

    const updatedSections = cloneTemplate(template.sections);
    updatedSections[sectionIndex].components.splice(componentIndex, 1);
    updateTemplate("sections", updatedSections);
    setSelectedItem(null);
  };

  const handleFileUpload = async (sectionIndex, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Procesamos los datos para un formato más útil
        const headers = jsonData[0] || [];
        // CORRECCIÓN: Filtrar filas vacías que XLSX a veces incluye.
        // Una fila se considera vacía si todas sus celdas están vacías o son nulas.
        const rows = jsonData
          .slice(1)
          .filter((row) => row.some((cell) => cell != null && cell !== ""));

        const processedData = {
          headers,
          data: rows,
          rawData: jsonData, // Mantenemos rawData por si es útil en otro lugar
        };

        setTemplate((prev) => {
          const newTemplate = cloneTemplate(prev);
          const section = newTemplate.sections[sectionIndex];
          if (!section) return prev;

          // 1. Guardar datos en la sección
          section.excelData = processedData;

          // 2. Actualizar componentes que usen Excel (con protección)
          // Se asegura que 'components' sea un array antes de iterar.
          if (Array.isArray(section.components)) {
            section.components.forEach((component) => {
              if (component.dataSource?.sourceType === "excel") {
                // Asegurar que existe el objeto dataSource
                if (!component.dataSource) {
                  component.dataSource = { sourceType: "excel" };
                }
                // Guardar copia completa de los datos
                component.dataSource.excelData = processedData;
                // Inicializar mappings si no existen
                if (!component.dataSource.mappings) {
                  component.dataSource.mappings = {
                    columns: headers,
                    xAxisField: headers[0] || "",
                    yAxisField: headers[1] || "",
                  };
                }
              }
            });
          } else {
            // Si por alguna razón la sección no tiene un array de componentes, lo inicializamos.
            section.components = [];
          }

          return newTemplate;
        });

        console.log("✅ Excel cargado correctamente:", {
          headers: headers.length,
          dataRows: rows.length,
        });

        // DESACTIVADO: Análisis automático con IA
        // El análisis automático ahora se maneja desde el componente TextConfig
        console.log(
          "✅ Excel cargado correctamente - Análisis automático desactivado"
        );
      } catch (error) {
        console.error("❌ Error al procesar Excel:", error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addEventToSection = (sectionIndex) => {
    if (sectionIndex < 0 || sectionIndex >= template.sections.length) return;

    const updatedSections = cloneTemplate(template.sections);
    updatedSections[sectionIndex].events = [
      ...(updatedSections[sectionIndex].events || []),
      { ...eventData, id: uuidv4() },
    ];
    updateTemplate("sections", updatedSections);
    resetEventData();
    setIsModalOpen(false);
  };

  const removeEvent = (sectionIndex, eventIndex) => {
    if (
      sectionIndex < 0 ||
      sectionIndex >= template.sections.length ||
      eventIndex < 0 ||
      eventIndex >= (template.sections[sectionIndex].events || []).length
    ) {
      return;
    }

    const updatedSections = cloneTemplate(template.sections);
    updatedSections[sectionIndex].events.splice(eventIndex, 1);
    updateTemplate("sections", updatedSections);
  };

  const resetEventData = () => {
    setEventData({ title: "", description: "", date: "" });
  };

  const generateDefaultStructure = () => {
    const defaultSections = [
      {
        sectionId: uuidv4(),
        title: "Introducción",
        type: "text",
        components: [
          {
            componentId: uuidv4(),
            type: "text",
            content:
              "Este informe presenta los resultados clave del período...",
            dataSource: { sourceType: "manual" },
          },
        ],
        events: [],
      },
      {
        sectionId: uuidv4(),
        title: "Cuerpo del Informe",
        type: "composite",
        components: [
          {
            componentId: uuidv4(),
            type: "chart",
            chartType: "bar",
            dataSource: {
              sourceType: "excel",
              mappings: {}, // Para que el usuario complete
            },
            displayOptions: {},
          },
          {
            componentId: uuidv4(),
            type: "kpi",
            dataSource: { sourceType: "excel" },
          },
        ],
        events: [],
      },
      {
        sectionId: uuidv4(),
        title: "Conclusiones",
        type: "text",
        components: [
          {
            componentId: uuidv4(),
            type: "text",
            content: "En conclusión, los resultados muestran...",
            dataSource: { sourceType: "manual" },
          },
        ],
        events: [],
      },
    ];

    updateTemplate("sections", defaultSections);

    updateTemplate("metadata.templateType", "informe-mensual");
    updateTemplate(
      "metadata.description",
      "Plantilla estándar para informes mensuales"
    );
  };

  return {
    template,
    selectedItem,
    isModalOpen,
    eventData,
    updateTemplate,
    addSection,
    removeSection,
    addComponent,
    moveComponent,
    removeComponent,
    setSelectedItem,
    setIsModalOpen,
    setEventData,
    handleFileUpload,
    addEventToSection,
    removeEvent,
    generateDefaultStructure,
  };
};

export default useTemplateManagement;
