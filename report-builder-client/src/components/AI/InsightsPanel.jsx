import React from "react";
const InsightsPanel = ({ insights }) => (
  <div className="insights-panel">
    <h2>AI Insights</h2>
    {/* Render insights here */}
    {insights ? (
      <pre>{JSON.stringify(insights, null, 2)}</pre>
    ) : (
      <p>No insights available.</p>
    )}
  </div>
);
export default InsightsPanel;
