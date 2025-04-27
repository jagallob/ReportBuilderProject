import React from "react";

const EventModal = ({
  eventData,
  setEventData,
  setIsModalOpen,
  addEventToSection,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Agregar Suceso</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Título"
            value={eventData.title}
            onChange={(e) =>
              setEventData({ ...eventData, title: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Descripción"
            value={eventData.description}
            onChange={(e) =>
              setEventData({ ...eventData, description: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            value={eventData.date}
            onChange={(e) =>
              setEventData({ ...eventData, date: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={addEventToSection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!eventData.title || !eventData.date}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
