import React from "react";
const ComparisonView = ({ comparison }) => (
  <div className="comparison-view">
    <h2>Comparison View</h2>
    {/* Render comparison results here */}
    {comparison ? (
      <pre>{JSON.stringify(comparison, null, 2)}</pre>
    ) : (
      <p>No comparison data.</p>
    )}
  </div>
);
export default ComparisonView;
