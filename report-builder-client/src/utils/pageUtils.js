// Función para parsear páginas personalizadas
export const parseCustomPages = (customPagesString) => {
  if (!customPagesString || !customPagesString.trim()) {
    return [];
  }

  const pages = new Set();
  const parts = customPagesString.split(",").map((part) => part.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      // Rango de páginas (ej: "1-3")
      const [start, end] = part.split("-").map((num) => parseInt(num.trim()));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      // Página individual
      const pageNum = parseInt(part);
      if (!isNaN(pageNum) && pageNum > 0) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
};

// Función para verificar si una imagen debe aparecer en una página específica
export const shouldShowImageOnPage = (component, currentPage) => {
  if (component.position !== "full-page") {
    return false;
  }

  const pageRange = component.pageRange || "all";

  switch (pageRange) {
    case "all":
      return true;
    case "current":
      return currentPage === 1; // Por ahora asumimos que es la página actual
    case "custom":
      const customPages = parseCustomPages(component.customPages);
      return customPages.includes(currentPage);
    default:
      return false;
  }
};

// Función para obtener todas las páginas donde debe aparecer una imagen
export const getImagePages = (component) => {
  if (component.position !== "full-page") {
    return [];
  }

  const pageRange = component.pageRange || "all";

  switch (pageRange) {
    case "all":
      return ["all"];
    case "current":
      return [1];
    case "custom":
      return parseCustomPages(component.customPages);
    default:
      return [];
  }
};
