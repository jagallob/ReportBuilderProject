import React, { useEffect, useRef } from "react";

const EventModal = ({
  eventData,
  setEventData,
  setIsModalOpen,
  addEventToSection,
}) => {
  const titleInputRef = useRef(null);
  const modalRef = useRef(null);

  // Accesibilidad: enfocar el input al abrir el modal
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
    // Cerrar con Escape
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    // Cerrar al hacer click fuera del modal
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventData.title.trim()) {
      alert("Por favor, ingresa un título para el suceso");
      return;
    }
    addEventToSection();
  };

  // Handler para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
      >
        {/* Botón cerrar (X) */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={handleCloseModal}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
        >
          &times;
        </button>
        <h3 className="text-lg font-medium mb-4">Agregar nuevo suceso</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              ref={titleInputRef}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="date"
              value={eventData.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
