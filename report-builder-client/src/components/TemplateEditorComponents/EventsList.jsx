import React from "react";

const EventsList = ({ events, removeEvent }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="mb-3">
      <h4 className="font-medium text-sm mb-2">Sucesos</h4>
      <div className="space-y-2">
        {events.map((event, eventIndex) => (
          <div
            key={event.id || eventIndex}
            className="flex justify-between bg-yellow-50 p-2 rounded border border-yellow-200"
          >
            <div>
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-gray-600">{event.date}</div>
              <div className="text-xs">{event.description}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeEvent(eventIndex);
              }}
              className="text-red-500 hover:text-red-700 text-xs self-start"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
