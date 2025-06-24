import React from "react";
const NarrativeTemplates = ({ templates, onSelect }) => (
  <div className="narrative-templates">
    <h2>Narrative Templates</h2>
    <ul>
      {templates && templates.length > 0 ? (
        templates.map((t, i) => (
          <li key={i} onClick={() => onSelect(t)}>
            {t}
          </li>
        ))
      ) : (
        <li>No templates available.</li>
      )}
    </ul>
  </div>
);
export default NarrativeTemplates;
