import React from "react";

const ImageRenderer = ({ component }) => {
  if (!component.imageData) {
    return (
      <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded">
        <p>No hay imagen seleccionada</p>
      </div>
    );
  }

  // Función para obtener los estilos de posicionamiento
  const getPositionStyles = () => {
    const position = component.position || "full-width";

    switch (position) {
      case "full-page":
        return {
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          margin: 0,
          padding: 0,
        };
      case "full-width":
        return {
          width: "100%",
          height: "auto",
          display: "block",
        };
      case "left":
        return {
          float: "left",
          marginRight: "1rem",
          marginBottom: "1rem",
          maxWidth: "50%",
        };
      case "right":
        return {
          float: "right",
          marginLeft: "1rem",
          marginBottom: "1rem",
          maxWidth: "50%",
        };
      case "center":
        return {
          display: "block",
          margin: "0 auto",
          maxWidth: "80%",
        };
      case "custom": {
        const custom = component.customPosition || {};
        return {
          position: "absolute",
          left: `${custom.x || 0}%`,
          top: `${custom.y || 0}%`,
          width: `${custom.width || 50}%`,
          height: `${custom.height || 50}%`,
          zIndex: 1,
        };
      }
      default:
        return {
          width: "100%",
          height: "auto",
        };
    }
  };

  // Función para obtener los estilos de la imagen
  const getImageStyles = () => {
    const baseStyles = getPositionStyles();
    const imageStyles = {
      ...baseStyles,
      objectFit: component.maintainAspectRatio ? "contain" : "cover",
    };

    // Agregar borde si está configurado
    if (component.addBorder) {
      imageStyles.border = `${component.borderWidth || 1}px solid ${
        component.borderColor || "#000000"
      }`;
    }

    return imageStyles;
  };

  // Función para renderizar el texto superpuesto
  const renderOverlayText = () => {
    if (!component.overlayText || component.textPosition === "none") {
      return null;
    }

    const textStyle = component.textStyle || {};
    const fontSizeMap = {
      small: "0.875rem",
      medium: "1rem",
      large: "1.25rem",
      xlarge: "1.5rem",
    };

    const baseTextStyles = {
      fontSize: fontSizeMap[textStyle.fontSize] || "1rem",
      color: textStyle.color || "#000000",
      fontWeight: "bold",
      textAlign: "center",
      padding: "0.5rem",
    };

    // Estilos específicos para texto superpuesto
    if (
      component.textPosition.startsWith("overlay") ||
      component.textPosition === "draggable"
    ) {
      baseTextStyles.position = "absolute";
      baseTextStyles.zIndex = 2;

      if (textStyle.backgroundColor) {
        const opacity = textStyle.backgroundOpacity || 80;
        baseTextStyles.backgroundColor = `${
          textStyle.backgroundColor
        }${Math.round(opacity * 2.55)
          .toString(16)
          .padStart(2, "0")}`;
      }

      // Para texto arrastrable, usar la posición personalizada
      if (
        component.textPosition === "draggable" &&
        component.customTextPosition
      ) {
        baseTextStyles.left = `${component.customTextPosition.x}%`;
        baseTextStyles.top = `${component.customTextPosition.y}%`;
        baseTextStyles.transform = "translate(-50%, -50%)";
      } else {
        // Para otros tipos de overlay
        switch (component.textPosition) {
          case "overlay-top":
            baseTextStyles.top = "0";
            baseTextStyles.left = "0";
            baseTextStyles.right = "0";
            break;
          case "overlay-bottom":
            baseTextStyles.bottom = "0";
            baseTextStyles.left = "0";
            baseTextStyles.right = "0";
            break;
          case "overlay-center":
            baseTextStyles.top = "50%";
            baseTextStyles.left = "50%";
            baseTextStyles.transform = "translate(-50%, -50%)";
            break;
        }
      }
    }

    return <div style={baseTextStyles}>{component.overlayText}</div>;
  };

  // Función para renderizar el texto fuera de la imagen
  const renderExternalText = () => {
    if (
      !component.overlayText ||
      !component.textPosition ||
      component.textPosition === "none" ||
      component.textPosition.startsWith("overlay") ||
      component.textPosition === "draggable"
    ) {
      return null;
    }

    const textStyle = component.textStyle || {};
    const fontSizeMap = {
      small: "0.875rem",
      medium: "1rem",
      large: "1.25rem",
      xlarge: "1.5rem",
    };

    const textStyles = {
      fontSize: fontSizeMap[textStyle.fontSize] || "1rem",
      color: textStyle.color || "#000000",
      textAlign: "center",
      margin: component.textPosition === "top" ? "0 0 1rem 0" : "1rem 0 0 0",
    };

    return <div style={textStyles}>{component.overlayText}</div>;
  };

  // Renderizar según el tipo de posicionamiento
  if (component.position === "full-page") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          margin: "-20mm", // Compensar el padding del contenedor principal
          padding: "20mm",
        }}
      >
        <img
          src={component.imageData}
          alt="Imagen de página completa"
          style={getImageStyles()}
        />
        {renderOverlayText()}
      </div>
    );
  }

  if (component.position === "custom") {
    return (
      <div style={{ position: "relative", width: "100%", height: "400px" }}>
        <img
          src={component.imageData}
          alt="Imagen personalizada"
          style={getImageStyles()}
        />
        {renderOverlayText()}
      </div>
    );
  }

  // Renderizado estándar para otras posiciones
  return (
    <div style={{ position: "relative" }}>
      {component.textPosition === "top" && renderExternalText()}

      <div style={{ position: "relative" }}>
        <img src={component.imageData} alt="Imagen" style={getImageStyles()} />
        {renderOverlayText()}
      </div>

      {component.textPosition === "bottom" && renderExternalText()}
    </div>
  );
};

export default ImageRenderer;
