import React from "react";
const SmartSuggestions = ({ suggestions, onSelect }) => (
  <div className="smart-suggestions">
    <h2>Smart Suggestions</h2>
    <ul>
      {suggestions && suggestions.length > 0 ? (
        suggestions.map((s, i) => (
          <li key={i} onClick={() => onSelect(s)}>
            {s}
          </li>
        ))
      ) : (
        <li>No suggestions available.</li>
      )}
    </ul>
  </div>
);
export default SmartSuggestions;
