import html2pdf from "html2pdf.js";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  ImageRun,
  AlignmentType,
  Media,
  Table,
  TableRow,
  TableCell,
} from "docx";
// import { saveAs } from "file-saver";
// import html2canvas from "html2canvas"; // Importación separada de html2canvas

export const exportToPDF = (elementId, fileName = "informe.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const options = {
    margin: 10,
    filename: fileName,
    html2canvas: {
      scale: 2,
      scrollY: 0,
      windowHeight: element.scrollHeight,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: {
      mode: ["css", "legacy"],
      before: ".page-break",
    },
  };

  // Clonar el elemento para evitar afectar la visualización
  const clone = element.cloneNode(true);
  document.body.appendChild(clone);

  html2pdf()
    .set(options)
    .from(clone)
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pdf.internal.pageSize.getWidth() - 30,
          pdf.internal.pageSize.getHeight() - 10
        );
      }
      pdf.save(fileName);
      document.body.removeChild(clone);
    });
};

// export const exportToWord = async (template, fileName = "informe.docx") => {
//   // 1. Validación inicial del template
//   if (!template || !Array.isArray(template.sections)) {
//     throw new Error(
//       "El template no tiene la estructura correcta (falta propiedad 'sections')"
//     );
//   }

//   // 2. Configuración del documento
//   const doc = new Document({
//     creator: "Mi Aplicación",
//     title: fileName.replace(".docx", ""),
//     description: "Documento generado automáticamente",
//     styles: {
//       paragraphStyles: [
//         {
//           id: "Normal",
//           name: "Normal",
//           run: { font: "Arial", size: 24 },
//           paragraph: { spacing: { line: 276 } },
//         },
//       ],
//     },
//   });

//   const children = [];

//   // 3. Función mejorada para conversión de gráficos
//   const convertToImage = async (elementId) => {
//     try {
//       const element = document.getElementById(elementId);
//       if (!element) return null;

//       const canvas = await html2canvas(element, {
//         scale: 2,
//         logging: false,
//         useCORS: true,
//       });
//       return canvas.toDataURL("image/png");
//     } catch (error) {
//       console.error(`Error convirtiendo ${elementId} a imagen:`, error);
//       return null;
//     }
//   };

//   // 4. Procesamiento de secciones (con validación)
//   for (const section of template.sections) {
//     if (!section?.components) continue;

//     // Título de sección
//     children.push(
//       new Paragraph({
//         text: section.title || "Sección sin título",
//         heading: HeadingLevel.HEADING_1,
//         pageBreakBefore: children.length > 0,
//       })
//     );

//     // Procesar componentes
//     for (const section of template.sections) {
//       if (!section?.components) continue;

//       children.push(
//         new Paragraph({
//           text: section.title || "Sección sin título",
//           heading: HeadingLevel.HEADING_1,
//           pageBreakBefore: children.length > 0,
//         })
//       );

//       for (const component of section.components) {
//         try {
//           switch (component.type) {
//             case "chart": {
//               // Usar llaves para crear un nuevo ámbito de bloque
//               const imageData = await convertToImage(
//                 `chart-${component.componentId}`
//               );
//               if (imageData) {
//                 const media = Media.addImage(doc, imageData.split(",")[1]);
//                 children.push(
//                   new Paragraph({
//                     children: [
//                       new ImageRun({
//                         data: media.data,
//                         transformation: { width: 400, height: 300 },
//                       }),
//                     ],
//                     alignment: AlignmentType.CENTER,
//                   })
//                 );
//               }
//               break;
//             }

//             case "text": {
//               children.push(
//                 new Paragraph({
//                   children: [new TextRun(component.content || "")],
//                   spacing: { after: 200 },
//                 })
//               );
//               break;
//             }

//             case "table": {
//               if (component.data?.length) {
//                 const rows = component.data.map(
//                   (row) =>
//                     new TableRow({
//                       children: Object.values(row).map(
//                         (value) =>
//                           new TableCell({
//                             children: [new Paragraph(String(value || ""))],
//                           })
//                       ),
//                     })
//                 );
//                 children.push(new Table({ rows }));
//               }
//               break;
//             }

//             default: {
//               children.push(
//                 new Paragraph({
//                   text: `[Componente no soportado: ${component.type}]`,
//                   color: "FF0000",
//                 })
//               );
//               break;
//             }
//           }
//         } catch (error) {
//           console.error(`Error procesando componente:`, component, error);
//         }
//       }
//     }
//   }

//   // 5. Si no hay contenido, agregar mensaje
//   if (children.length === 0) {
//     children.push(
//       new Paragraph({
//         text: "No se encontró contenido para exportar",
//         color: "FF0000",
//       })
//     );
//   }

//   // 6. Configuración final del documento
//   doc.addSection({
//     properties: {
//       page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } },
//     },
//     children,
//   });

//   // 7. Generación del archivo
//   try {
//     const blob = await Packer.toBlob(doc);
//     saveAs(blob, fileName);
//     return true;
//   } catch (error) {
//     console.error("Error al generar Word:", error);
//     throw new Error("Error al generar el documento");
//   }
// };
