import React from "react";

const InsightsPanel = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No insights disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Insights de IA</h2>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-800">{insight.title}</h3>
            <p className="text-gray-600 mt-1">{insight.description}</p>
            <div className="flex items-center mt-2 space-x-4 text-sm">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  insight.severity === "critical"
                    ? "bg-red-100 text-red-800"
                    : insight.severity === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {insight.severity}
              </span>
              <span className="text-gray-500">
                Confianza: {(insight.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
