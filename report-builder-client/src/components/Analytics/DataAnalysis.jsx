import React from "react";
const DataAnalysis = ({ data }) => (
  <div className="data-analysis">
    <h2>Data Analysis</h2>
    {/* Render analyzed data here */}
    {data ? (
      <pre>{JSON.stringify(data, null, 2)}</pre>
    ) : (
      <p>No data available.</p>
    )}
  </div>
);
export default DataAnalysis;
