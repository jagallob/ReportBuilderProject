import React, { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const ImageConfig = ({ component = {}, onUpdate }) => {
  const [isDraggingText, setIsDraggingText] = useState(false);
  const imageContainerRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        onUpdate("imageData", imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para manejar el clic en la imagen para posicionar texto
  const handleImageClick = (event) => {
    if (!component.imageData || component.textPosition !== "draggable") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onUpdate("customTextPosition", {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Función para manejar el arrastre del texto
  const handleTextDrag = (event) => {
    if (!component.imageData || component.textPosition !== "draggable") return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onUpdate("customTextPosition", {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const positionOptions = [
    {
      value: "full-width",
      label: "Ancho completo",
      description: "Ocupa todo el ancho de la sección",
    },
    {
      value: "full-page",
      label: "Página completa",
      description: "Ocupa toda la página del informe como fondo",
    },
    {
      value: "left",
      label: "Izquierda",
      description: "Alineado a la izquierda",
    },
    { value: "center", label: "Centro", description: "Centrado en la sección" },
    { value: "right", label: "Derecha", description: "Alineado a la derecha" },
    {
      value: "custom",
      label: "Personalizado",
      description: "Posición específica con coordenadas",
    },
  ];

  const textPositionOptions = [
    { value: "top", label: "Arriba de la imagen" },
    { value: "bottom", label: "Debajo de la imagen" },
    { value: "overlay-top", label: "Superpuesto arriba" },
    { value: "overlay-bottom", label: "Superpuesto abajo" },
    { value: "overlay-center", label: "Superpuesto centro" },
    {
      value: "draggable",
      label: "Arrastrable sobre la imagen",
      description: "Arrastra el texto a cualquier posición",
    },
    { value: "none", label: "Sin texto" },
  ];

  // Componente para el texto arrastrable
  const DraggableText = ({ text, position }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "text",
      item: { type: "text" },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const textStyle = component.textStyle || {};
    const fontSizeMap = {
      small: "0.875rem",
      medium: "1rem",
      large: "1.25rem",
      xlarge: "1.5rem",
    };

    const styles = {
      position: "absolute",
      left: `${position?.x || 50}%`,
      top: `${position?.y || 50}%`,
      transform: "translate(-50%, -50%)",
      fontSize: fontSizeMap[textStyle.fontSize] || "1rem",
      color: textStyle.color || "#000000",
      fontWeight: "bold",
      cursor: "move",
      userSelect: "none",
      zIndex: 10,
      opacity: isDragging ? 0.5 : 1,
      backgroundColor: textStyle.backgroundColor
        ? `${textStyle.backgroundColor}${Math.round(
            (textStyle.backgroundOpacity || 80) * 2.55
          )
            .toString(16)
            .padStart(2, "0")}`
        : "transparent",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "2px dashed #007bff",
      minWidth: "100px",
      textAlign: "center",
    };

    return (
      <div
        ref={drag}
        style={styles}
        onMouseDown={() => setIsDraggingText(true)}
        onMouseUp={() => setIsDraggingText(false)}
      >
        {text}
      </div>
    );
  };

  // Componente para el área de imagen con drop
  const ImageDropArea = ({ children }) => {
    const [{ isOver }, drop] = useDrop({
      accept: "text",
      drop: (item, monitor) => {
        const offset = monitor.getClientOffset();
        if (offset && imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect();
          const x = ((offset.x - rect.left) / rect.width) * 100;
          const y = ((offset.y - rect.top) / rect.height) * 100;

          onUpdate("customTextPosition", {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
          });
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={(node) => {
          drop(node);
          imageContainerRef.current = node;
        }}
        style={{
          position: "relative",
          border: isOver ? "2px dashed #007bff" : "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
          cursor:
            component.textPosition === "draggable" ? "crosshair" : "default",
        }}
        onClick={handleImageClick}
        onMouseMove={isDraggingText ? handleTextDrag : undefined}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Subida de imagen */}
      <div>
        <label className="block text-sm font-medium mb-2">Imagen</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800"
          >
            {component.imageData ? "Cambiar imagen" : "Seleccionar imagen"}
          </label>
          {component.imageData && (
            <div className="mt-2">
              <img
                src={component.imageData}
                alt="Preview"
                className="max-w-full h-32 object-contain mx-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Posicionamiento de la imagen */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Posición de la imagen
        </label>
        <select
          value={component.position || "full-width"}
          onChange={(e) => onUpdate("position", e.target.value)}
          className="w-full p-2 border rounded"
        >
          {positionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>

      {/* Configuración personalizada de posición */}
      {component.position === "custom" && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium mb-1">
              Posición X (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={component.customPosition?.x || 0}
              onChange={(e) =>
                onUpdate("customPosition.x", parseInt(e.target.value))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Posición Y (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={component.customPosition?.y || 0}
              onChange={(e) =>
                onUpdate("customPosition.y", parseInt(e.target.value))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ancho (%)</label>
            <input
              type="number"
              min="10"
              max="100"
              value={component.customPosition?.width || 50}
              onChange={(e) =>
                onUpdate("customPosition.width", parseInt(e.target.value))
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alto (%)</label>
            <input
              type="number"
              min="10"
              max="100"
              value={component.customPosition?.height || 50}
              onChange={(e) =>
                onUpdate("customPosition.height", parseInt(e.target.value))
              }
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* Configuración de texto superpuesto */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Texto superpuesto
        </label>
        <select
          value={component.textPosition || "none"}
          onChange={(e) => onUpdate("textPosition", e.target.value)}
          className="w-full p-2 border rounded mb-3"
        >
          {textPositionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}{" "}
              {option.description ? `- ${option.description}` : ""}
            </option>
          ))}
        </select>

        {component.textPosition !== "none" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Texto</label>
              <textarea
                value={component.overlayText || ""}
                onChange={(e) => onUpdate("overlayText", e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Escribe el texto que aparecerá sobre la imagen..."
              />
            </div>

            {/* Vista previa interactiva para texto arrastrable */}
            {component.textPosition === "draggable" &&
              component.imageData &&
              component.overlayText && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vista previa interactiva
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Haz clic en la imagen para posicionar el texto o arrastra el
                    texto directamente
                  </p>
                  <ImageDropArea>
                    <img
                      src={component.imageData}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      style={{ pointerEvents: "none" }}
                    />
                    <DraggableText
                      text={component.overlayText}
                      position={component.customTextPosition}
                    />
                  </ImageDropArea>
                  {component.customTextPosition && (
                    <div className="mt-2 text-xs text-gray-500">
                      Posición: X: {Math.round(component.customTextPosition.x)}
                      %, Y: {Math.round(component.customTextPosition.y)}%
                    </div>
                  )}
                </div>
              )}

            {/* Configuración de estilo del texto */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tamaño de fuente
                </label>
                <select
                  value={component.textStyle?.fontSize || "medium"}
                  onChange={(e) =>
                    onUpdate("textStyle.fontSize", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                  <option value="xlarge">Muy grande</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Color del texto
                </label>
                <input
                  type="color"
                  value={component.textStyle?.color || "#000000"}
                  onChange={(e) => onUpdate("textStyle.color", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Configuración de fondo para texto superpuesto */}
            {(component.textPosition.startsWith("overlay") ||
              component.textPosition === "draggable") && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fondo del texto
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1">Color de fondo</label>
                    <input
                      type="color"
                      value={component.textStyle?.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        onUpdate("textStyle.backgroundColor", e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">
                      Opacidad del fondo
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={component.textStyle?.backgroundOpacity || 80}
                      onChange={(e) =>
                        onUpdate(
                          "textStyle.backgroundOpacity",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">
                      {component.textStyle?.backgroundOpacity || 80}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuración para imagen de página completa */}
      {component.position === "full-page" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Configuración de página completa
          </label>
          <div className="space-y-3 p-4 bg-blue-50 rounded">
            <div>
              <label className="block text-sm font-medium mb-1">
                Páginas donde aparecer
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pageRange"
                    value="all"
                    checked={
                      component.pageRange === "all" || !component.pageRange
                    }
                    onChange={(e) => onUpdate("pageRange", e.target.value)}
                    className="mr-2"
                  />
                  Todas las páginas
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pageRange"
                    value="current"
                    checked={component.pageRange === "current"}
                    onChange={(e) => onUpdate("pageRange", e.target.value)}
                    className="mr-2"
                  />
                  Solo esta página
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pageRange"
                    value="custom"
                    checked={component.pageRange === "custom"}
                    onChange={(e) => onUpdate("pageRange", e.target.value)}
                    className="mr-2"
                  />
                  Páginas específicas
                </label>
              </div>
            </div>

            {component.pageRange === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Números de página (separados por comas)
                </label>
                <input
                  type="text"
                  value={component.customPages || ""}
                  onChange={(e) => onUpdate("customPages", e.target.value)}
                  placeholder="1, 3, 5-7"
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplos: "1" (solo página 1), "1,3,5" (páginas 1, 3 y 5),
                  "1-3" (páginas 1 a 3)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Opacidad de la imagen de fondo
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={component.backgroundOpacity || 100}
                onChange={(e) =>
                  onUpdate("backgroundOpacity", parseInt(e.target.value))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Transparente</span>
                <span>{component.backgroundOpacity || 100}%</span>
                <span>Opaco</span>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={component.showContentOverImage || true}
                  onChange={(e) =>
                    onUpdate("showContentOverImage", e.target.checked)
                  }
                  className="mr-2"
                />
                Mostrar contenido del informe sobre la imagen
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Cuando está activado, el título y texto del informe aparecerán
                sobre la imagen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuración adicional de la imagen */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Configuración adicional
        </label>
        <div className="space-y-3">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={component.maintainAspectRatio || false}
                onChange={(e) =>
                  onUpdate("maintainAspectRatio", e.target.checked)
                }
                className="mr-2"
              />
              Mantener proporción de aspecto
            </label>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={component.addBorder || false}
                onChange={(e) => onUpdate("addBorder", e.target.checked)}
                className="mr-2"
              />
              Agregar borde
            </label>
          </div>
          {component.addBorder && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1">Color del borde</label>
                <input
                  type="color"
                  value={component.borderColor || "#000000"}
                  onChange={(e) => onUpdate("borderColor", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">
                  Grosor del borde (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={component.borderWidth || 1}
                  onChange={(e) =>
                    onUpdate("borderWidth", parseInt(e.target.value))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageConfig;
