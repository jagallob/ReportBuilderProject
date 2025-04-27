const API_URL = "http://localhost:5000";

export const EventService = {
  getEventsByArea: async (areaId) => {
    try {
      const response = await fetch(`${API_URL}/api/EventLogs/byArea/${areaId}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const events = await response.json();
      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },
};

export default EventService;
