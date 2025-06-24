import React from "react";
const PatternDetection = ({ patterns }) => (
  <div className="pattern-detection">
    <h2>Pattern Detection</h2>
    {/* Render detected patterns here */}
    {patterns ? (
      <pre>{JSON.stringify(patterns, null, 2)}</pre>
    ) : (
      <p>No patterns detected.</p>
    )}
  </div>
);
export default PatternDetection;
