import { useState, useEffect } from "react";
import { EventService } from "../services/EventService";
import { useAuth } from "../context/AuthContext";

const SelectEventsModal = ({ isOpen, onClose, onSelectEvents }) => {
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const { user } = useAuth(); // Obtener datos del usuario logueado

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (isOpen && user?.areaId) {
          const events = await EventService.getEventsByArea(user.areaId);
          setAvailableEvents(events);
        }
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };

    fetchEvents();
  }, [isOpen, user]);

  const handleSelect = (eventId) => {
    setSelectedEventIds((prevSelected) =>
      prevSelected.includes(eventId)
        ? prevSelected.filter((id) => id !== eventId)
        : [...prevSelected, eventId]
    );
  };

  const handleConfirm = () => {
    const selectedEvents = availableEvents.filter((e) =>
      selectedEventIds.includes(e.id)
    );
    onSelectEvents(selectedEvents);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
          Seleccionar Sucesos
        </h2>

        {/* Lista de eventos */}
        <div className="max-h-60 overflow-y-auto space-y-3 mb-6">
          {availableEvents.length === 0 ? (
            <p className="text-gray-400 text-center">
              No hay sucesos disponibles.
            </p>
          ) : (
            availableEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedEventIds.includes(event.id)}
                  onChange={() => handleSelect(event.id)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectEventsModal;
